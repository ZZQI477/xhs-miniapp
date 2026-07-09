import config from './config.js'
import http from './request.js'

// 存储键名
const STORAGE_KEYS = {
  GUEST_ID: 'guest_id',
  GUEST_TOKEN: 'guest_token',
  GUEST_EXPTIME: 'guest_exptime',
  GUEST_USERINFO: 'guest_userinfo'
}

/**
 * 生成设备唯一标识
 * 使用小程序的 deviceId 或生成随机ID
 */
function generateDeviceId() {
  try {
    const systemInfo = uni.getSystemInfoSync()
    // 尝试获取设备唯一标识
    const deviceId = systemInfo.deviceId || systemInfo.uuid || ''
    if (deviceId) {
      return deviceId.substring(0, 8)
    }
  } catch (e) {
    console.warn('[guestAuth] 获取设备信息失败', e)
  }
  
  // 降级方案：生成随机ID
  return Math.random().toString(36).substring(2, 10)
}

/**
 * 生成游客临时ID
 * 格式：guest_设备ID_时间戳
 */
export function generateGuestId() {
  const deviceId = generateDeviceId()
  const timestamp = Date.now().toString(36)
  return `${config.guestIdPrefix}${deviceId}_${timestamp}`
}

/**
 * 获取游客ID（如果存在且有效）
 * @returns {string|null} 游客ID或null
 */
export function getGuestId() {
  const guestId = uni.getStorageSync(STORAGE_KEYS.GUEST_ID)
  const guestExpTime = uni.getStorageSync(STORAGE_KEYS.GUEST_EXPTIME)
  
  if (!guestId) return null
  
  // 检查是否过期
  if (guestExpTime && Date.now() > guestExpTime) {
    console.log('[guestAuth] 游客身份已过期，清除本地存储')
    clearGuestInfo()
    return null
  }
  
  return guestId
}

/**
 * 获取游客token
 * @returns {string|null} 游客token或null
 */
export function getGuestToken() {
  const guestToken = uni.getStorageSync(STORAGE_KEYS.GUEST_TOKEN)
  return guestToken || null
}

/**
 * 获取游客用户信息
 * @returns {object|null} 游客用户信息或null
 */
export function getGuestUserInfo() {
  const guestUserInfo = uni.getStorageSync(STORAGE_KEYS.GUEST_USERINFO)
  if (guestUserInfo) {
    try {
      return typeof guestUserInfo === 'string' ? JSON.parse(guestUserInfo) : guestUserInfo
    } catch (e) {
      return null
    }
  }
  return null
}

/**
 * 判断当前是否为游客模式
 * @returns {boolean}
 */
export function isGuest() {
  const token = uni.getStorageSync('token')
  return !token && getGuestId() !== null
}

/**
 * 判断是否为游客会话（聊天详情页使用）
 * @returns {boolean}
 */
export function isGuestSession() {
  return isGuest()
}

/**
 * 检查游客身份是否有效
 * @returns {boolean}
 */
export function isGuestValid() {
  const guestId = getGuestId()
  const guestToken = getGuestToken()
  const guestExpTime = uni.getStorageSync(STORAGE_KEYS.GUEST_EXPTIME)
  
  return guestId && guestToken && guestExpTime && Date.now() <= guestExpTime
}

/**
 * 获取或创建游客身份
 * 如果本地有有效的游客身份则返回，否则创建新的
 * @returns {Promise<object>} 游客信息
 */
export async function getOrCreateGuestId(params = {}) {
  // 先检查本地是否有有效的游客身份
  const existingGuestId = getGuestId()
  const existingGuestToken = getGuestToken()
  
  if (existingGuestId && existingGuestToken && isGuestValid()) {
    console.log('[guestAuth] 使用本地已有的游客身份', existingGuestId)
    return {
      guest_id: existingGuestId,
      guest_token: existingGuestToken,
      is_new: false
    }
  }
  
  // 创建新的游客身份
  try {
    console.log('[guestAuth] 创建新的游客身份', params)
    const res = await http.post('/chat/create_guest', {
      guest_id: generateGuestId(),
      ...params
    })
    
    if (res && res.data) {
      const guestInfo = res.data
      // 存储到本地
      uni.setStorageSync(STORAGE_KEYS.GUEST_ID, guestInfo.guest_id)
      uni.setStorageSync(STORAGE_KEYS.GUEST_TOKEN, guestInfo.guest_token)
      
      // 计算过期时间
      const expTime = Date.now() + config.guestExpireDays * 24 * 60 * 60 * 1000
      uni.setStorageSync(STORAGE_KEYS.GUEST_EXPTIME, expTime)
      
      // 存储游客用户信息（如果有）
      if (guestInfo.userinfo) {
        uni.setStorageSync(STORAGE_KEYS.GUEST_USERINFO, JSON.stringify(guestInfo.userinfo))
      }
      
      console.log('[guestAuth] 游客身份创建成功', guestInfo.guest_id)
      return {
        guest_id: guestInfo.guest_id,
        guest_token: guestInfo.guest_token,
        userinfo: guestInfo.userinfo || null,
        is_new: true
      }
    }
  } catch (e) {
    console.error('[guestAuth] 创建游客身份失败', e)
    
    // 降级方案：本地生成临时身份（无法与服务器同步，仅用于UI显示）
    const fallbackGuestId = generateGuestId()
    const fallbackExpTime = Date.now() + config.guestExpireDays * 24 * 60 * 60 * 1000
    
    uni.setStorageSync(STORAGE_KEYS.GUEST_ID, fallbackGuestId)
    uni.setStorageSync(STORAGE_KEYS.GUEST_EXPTIME, fallbackExpTime)
    
    return {
      guest_id: fallbackGuestId,
      guest_token: null,
      is_new: true,
      is_fallback: true
    }
  }
}

/**
 * 绑定游客身份到正式账号
 * 用户登录/注册后调用，将游客会话迁移到正式账号
 * @param {string} userId 正式用户ID
 * @returns {Promise<object>} 绑定结果
 */
export async function bindGuestToAccount(userId) {
  const guestId = getGuestId()
  const guestToken = getGuestToken()
  
  if (!guestId || !guestToken) {
    console.log('[guestAuth] 无需绑定，没有游客身份')
    return { success: true, need_bind: false }
  }
  
  try {
    console.log('[guestAuth] 开始绑定游客身份到账号', guestId, '->', userId)
    const res = await http.post('/chat/bindAccount', {
      guest_id: guestId,
      guest_token: guestToken,
      user_id: userId
    })
    
    if (res && res.data) {
      // 绑定成功，清除游客信息
      clearGuestInfo()
      console.log('[guestAuth] 游客身份绑定成功')
      return {
        success: true,
        need_bind: true,
        migrated_conversations: res.data.migrated_conversations || 0
      }
    }
  } catch (e) {
    console.error('[guestAuth] 绑定游客身份失败', e)
    // 绑定失败不影响登录流程，仅记录日志
    return {
      success: false,
      need_bind: true,
      error: e.msg || '绑定失败'
    }
  }
}

/**
 * 清除游客信息
 */
export function clearGuestInfo() {
  uni.removeStorageSync(STORAGE_KEYS.GUEST_ID)
  uni.removeStorageSync(STORAGE_KEYS.GUEST_TOKEN)
  uni.removeStorageSync(STORAGE_KEYS.GUEST_EXPTIME)
  uni.removeStorageSync(STORAGE_KEYS.GUEST_USERINFO)
  console.log('[guestAuth] 游客信息已清除')
}

/**
 * 获取当前身份的token（优先正式账号，其次游客）
 * @returns {string|null}
 */
export function getCurrentToken() {
  const token = uni.getStorageSync('token')
  if (token) return token
  
  return getGuestToken()
}

/**
 * 获取当前身份的用户ID（优先正式账号，其次游客）
 * @returns {string|null}
 */
export function getCurrentUserId() {
  const userinfo = uni.getStorageSync('userinfo')
  if (userinfo && userinfo.id) {
    return userinfo.id
  }
  
  return getGuestId()
}

/**
 * 更新游客用户信息
 * 在获取到用户授权信息后调用，将头像、昵称等信息存储到游客身份
 * @param {object} userInfo 用户信息（包含 avatarUrl, nickName, gender 等）
 * @returns {Promise<object>} 更新结果
 */
export async function updateGuestUserInfo(userInfo) {
  const guestId = getGuestId()
  const guestToken = getGuestToken()
  
  if (!guestId) {
    console.warn('[guestAuth] 没有游客身份，无法更新用户信息')
    return { success: false, error: '没有游客身份' }
  }
  
  try {
    // 先更新本地存储
    const existingInfo = getGuestUserInfo() || {}
    const mergedInfo = {
      ...existingInfo,
      avatar: userInfo.avatarUrl || userInfo.avatar || existingInfo.avatar,
      nickname: userInfo.nickName || userInfo.nickname || existingInfo.nickname,
      gender: userInfo.gender || existingInfo.gender
    }
    uni.setStorageSync(STORAGE_KEYS.GUEST_USERINFO, JSON.stringify(mergedInfo))
    
    // 如果有 token，同步到服务器
    if (guestToken) {
      console.log('[guestAuth] 同步游客用户信息到服务器', guestId, mergedInfo)
      const res = await http.post('/chat/update_guest_info', {
        guest_id: guestId,
        guest_token: guestToken,
        userinfo: {
          avatar: mergedInfo.avatar,
          nickname: mergedInfo.nickname,
          gender: mergedInfo.gender
        }
      })
      
      if (res && res.data) {
        console.log('[guestAuth] 游客用户信息同步成功')
        return { success: true, userinfo: mergedInfo }
      }
    }
    
    return { success: true, userinfo: mergedInfo }
  } catch (e) {
    console.error('[guestAuth] 更新游客用户信息失败', e)
    // 即使服务器同步失败，本地存储已更新，返回部分成功
    return {
      success: true,
      userinfo: getGuestUserInfo(),
      server_sync_failed: true,
      error: e.msg || '同步失败'
    }
  }
}

export default {
  generateGuestId,
  getGuestId,
  getGuestToken,
  getGuestUserInfo,
  isGuest,
  isGuestSession,
  isGuestValid,
  getOrCreateGuestId,
  bindGuestToAccount,
  clearGuestInfo,
  getCurrentToken,
  getCurrentUserId,
  updateGuestUserInfo
}