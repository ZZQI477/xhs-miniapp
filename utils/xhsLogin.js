/**
 * 小红书小程序登录工具
 * @description 封装小红书小程序登录相关方法
 */

/**
 * 判断是否为小红书小程序环境
 * @returns {boolean}
 */
export const isXhsMiniApp = () => {
  // #ifdef MP-XHS
  return true
  // #endif
  // #ifndef MP-XHS
  return false
  // #endif
}

/**
 * 调用 xhs.login 获取登录凭证 code
 * @returns {Promise<string>} 返回 code
 */
export const getLoginCode = () => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-XHS
    xhs.login({
      success: (res) => {
        if (res.code) {
          console.log('[XHS Login] 获取 code 成功:', res.code)
          resolve(res.code)
        } else {
          console.error('[XHS Login] 获取 code 失败: code 为空')
          reject(new Error('获取登录凭证失败'))
        }
      },
      fail: (err) => {
        console.error('[XHS Login] xhs.login 调用失败:', err)
        reject(err)
      }
    })
    // #endif
    // #ifndef MP-XHS
    reject(new Error('当前环境不支持小红书登录'))
    // #endif
  })
}

/**
 * 检查 session 是否有效
 * @returns {Promise<boolean>}
 */
export const checkSession = () => {
  return new Promise((resolve) => {
    // #ifdef MP-XHS
    xhs.checkSession({
      success: () => {
        console.log('[XHS Login] session_key 有效')
        resolve(true)
      },
      fail: () => {
        console.log('[XHS Login] session_key 已过期')
        resolve(false)
      }
    })
    // #endif
    // #ifndef MP-XHS
    resolve(false)
    // #endif
  })
}

/**
 * 获取用户信息（需要用户授权）
 * @returns {Promise<object>}
 */
export const getUserProfile = () => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-XHS
    xhs.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('[XHS Login] 获取用户信息成功:', res.userInfo)
        resolve(res.userInfo)
      },
      fail: (err) => {
        console.error('[XHS Login] 获取用户信息失败:', err)
        reject(err)
      }
    })
    // #endif
    // #ifndef MP-XHS
    reject(new Error('当前环境不支持获取小红书用户信息'))
    // #endif
  })
}

/**
 * 小红书一键登录流程
 * @param {Function} loginApi - 后端登录接口函数
 * @returns {Promise<object>} 返回登录结果
 */
export const xhsQuickLogin = async (loginApi) => {
  try {
    // 1. 检查当前 session 是否有效
    const sessionValid = await checkSession()

    // 2. 获取本地存储的 token
    const localToken = uni.getStorageSync('token')
    const localOpenid = uni.getStorageSync('xhs_openid')

    // 如果 session 有效且有本地 token，尝试静默登录
    if (sessionValid && localToken && localOpenid) {
      console.log('[XHS Login] 尝试静默登录')
      return {
        success: true,
        silent: true,
        token: localToken
      }
    }

    // 3. 获取新的登录 code
    const code = await getLoginCode()

    // 4. 调用后端接口换取 token
    const inviterId = uni.getStorageSync('share_inviter_id')
    const loginData = { code, platform: 'xhs' }
    if (inviterId) {
      loginData.inviter_id = inviterId
    }

    const res = await loginApi(loginData)

    if (res.code === 1 && res.data) {
      const { token, userinfo, openid } = res.data

      // 保存登录信息
      uni.setStorageSync('token', token)
      uni.setStorageSync('userinfo', userinfo)
      if (openid) {
        uni.setStorageSync('xhs_openid', openid)
      }

      console.log('[XHS Login] 登录成功')
      return {
        success: true,
        silent: false,
        token,
        userinfo,
        openid,
        isNewUser: res.data.is_new_user || false
      }
    } else {
      throw new Error(res.msg || '登录失败')
    }
  } catch (error) {
    console.error('[XHS Login] 登录流程出错:', error)
    throw error
  }
}

/**
 * 获取小红书用户手机号（需要用户授权）
 * 注意：调用此方法前必须先调用 getLoginCode() 获取 code，因为小红书要求先 login 才能获取手机号
 * @param {object} e - button getPhoneNumber 事件回调数据
 * @param {string} code - 预先获取的登录 code（用于换取 session_key）
 * @param {Function} phoneApi - 后端解密手机号接口函数
 * @returns {Promise<object>} 返回手机号信息
 */
export const getXhsPhoneNumber = async (e, code, phoneApi) => {
  try {
    // #ifdef MP-XHS
    // 检查用户是否授权
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      console.error('[XHS Phone] 用户拒绝授权手机号:', e.detail.errMsg)
      throw new Error('用户拒绝授权手机号')
    }

    // 获取加密数据
    const { encryptedData, iv } = e.detail
    if (!encryptedData || !iv) {
      console.error('[XHS Phone] 加密数据不完整')
      throw new Error('获取手机号数据失败')
    }

    // 确保 code 存在
    if (!code) {
      console.error('[XHS Phone] code 参数缺失')
      throw new Error('缺少登录凭证，请刷新页面重试')
    }

    // 调用后端接口解密手机号
    const res = await phoneApi({
      code,
      encrypted_data: encryptedData,
      iv
    })

    if (res.code === 1 && res.data) {
      console.log('[XHS Phone] 获取手机号成功:', res.data)
      return {
        success: true,
        mobile: res.data.mobile || res.data.pure_phone_number,
        purePhoneNumber: res.data.pure_phone_number,
        countryCode: res.data.country_code || '86'
      }
    } else {
      throw new Error(res.msg || '解密手机号失败')
    }
    // #endif

    // #ifndef MP-XHS
    throw new Error('当前环境不支持获取小红书手机号')
    // #endif
  } catch (error) {
    console.error('[XHS Phone] 获取手机号流程出错:', error)
    throw error
  }
}

/**
 * 清除小红书登录信息
 */
export const clearXhsLoginInfo = () => {
  uni.removeStorageSync('xhs_openid')
  uni.removeStorageSync('xhs_session_key')
}

export default {
  isXhsMiniApp,
  getLoginCode,
  checkSession,
  getUserProfile,
  getXhsPhoneNumber,
  xhsQuickLogin,
  clearXhsLoginInfo
}
