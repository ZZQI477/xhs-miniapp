import config from './config.js'

// 获取存储的token（仅正式账号token，游客token通过参数传递）
const getToken = () => {
  const token = uni.getStorageSync('token')
  return token || ''
}

// 获取token类型（用于后端判断）
const getTokenType = () => {
  const token = uni.getStorageSync('token')
  if (token) return 'user'
  
  const guestToken = uni.getStorageSync('guest_token')
  if (guestToken) return 'guest'
  
  return 'none'
}

// 设置token
const setToken = (token) => {
  uni.setStorageSync('token', token)
}

// 移除token
const removeToken = () => {
  uni.removeStorageSync('token')
}

// 获取用户信息
const getUserInfo = () => {
  const userInfo = uni.getStorageSync('userInfo')
  return userInfo ? JSON.parse(userInfo) : null
}

// 设置用户信息
const setUserInfo = (userInfo) => {
  uni.setStorageSync('userInfo', JSON.stringify(userInfo))
}

// 移除用户信息
const removeUserInfo = () => {
  uni.removeStorageSync('userInfo')
}

// 请求封装
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = getToken()

    // 合并请求头
    const header = {
      ...config.headers,
      ...options.header
    }

    // 添加token
    if (token) {
      header['token'] = token
    }

    uni.request({
      url: config.baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      timeout: config.timeout,
      success: (res) => {
        // 请求成功
        if (res.statusCode === 200) {
          const data = res.data

          // 业务逻辑判断
          if (data.code === 1) {
            // 成功
            resolve(data)
          } else if (data.code === 401) {
            // 未登录或token过期：清除存储，降级为游客态，不强制跳转
            // 让调用方自行决定是弹出引导还是静默处理
            removeToken()
            removeUserInfo()
            uni.removeStorageSync('xhs_openid')

            // 标记当前为游客态，方便页面判断
            uni.setStorageSync('is_guest_mode', true)

            reject({ ...data, _isAuthError: true })
          } else {
            // 业务错误
            uni.showToast({
              title: data.msg || '请求失败',
              icon: 'none'
            })
            reject(data)
          }
        } else {
          // HTTP错误
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// GET请求
const get = (url, data = {}) => {
  return request({
    url,
    method: 'GET',
    data
  })
}

// POST请求
const post = (url, data = {}) => {
  return request({
    url,
    method: 'POST',
    data
  })
}

// 上传文件
const upload = (url, filePath, name = 'file') => {
  return new Promise((resolve, reject) => {
    const token = getToken()

    uni.uploadFile({
      url: config.baseUrl + url,
      filePath: filePath,
      name: name,
      header: {
        'token': token
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          if (data.code === 1) {
            resolve(data)
          } else {
            uni.showToast({
              title: data.msg || '上传失败',
              icon: 'none'
            })
            reject(data)
          }
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default {
  request,
  get,
  post,
  upload,
  getToken,
  getTokenType,
  setToken,
  removeToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo
}
