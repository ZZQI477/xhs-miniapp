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
  xhsQuickLogin,
  clearXhsLoginInfo
}
