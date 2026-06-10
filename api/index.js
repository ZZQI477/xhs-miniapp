import http from '@/utils/request.js'
import { isGuest, getGuestToken } from '@/utils/guestAuth.js'

/**
 * 获取游客token参数（游客模式下自动附加到请求参数中）
 * @returns {object} 如果是游客模式返回 { guest_token }，否则返回 {}
 */
function getGuestParams() {
  if (isGuest()) {
    const guestToken = getGuestToken()
    if (guestToken) {
      return { guest_token: guestToken }
    }
  }
  return {}
}

// ==================== 用户登录相关 ====================

// 手机号密码登录
export const passwordLogin = (data) => {
  return http.post('/user/login', data)
}

// 手机验证码登录（自动注册）
export const mobileLogin = (data) => {
  return http.post('/user/mobilelogin', data)
}

// 发送短信验证码
export const sendSms = (data) => {
  return http.post('/user/sendcode', data)
}

// 微信小程序登录
export const wxLogin = (data) => {
  return http.post('/user/wxlogin', data)
}

// 小红书小程序登录
export const xhsLogin = (data) => {
  return http.post('/user/xhslogin', data)
}

// 注册账号
export const register = (data) => {
  return http.post('/user/register', data)
}

// 重置密码
export const resetPassword = (data) => {
  return http.post('/user/resetpwd', data)
}

// 退出登录
export const logout = () => {
  return http.post('/user/logout')
}

// 注销账号
export const cancelAccount = (data) => {
  return http.post('/user/cancel', data)
}

// ==================== 用户信息相关 ====================

// 获取用户信息
export const getUserInfo = () => {
  return http.get('/profile/index')
}

// 更新用户资料
export const updateProfile = (data) => {
  return http.post('/profile/update', data)
}

// 获取用户统计数据
export const getUserStats = () => {
  return http.get('/profile/stats')
}

// 上传头像
export const uploadAvatar = (filePath) => {
  return http.upload('/profile/uploadAvatar', filePath)
}

// 上传图片
export const uploadImage = (filePath) => {
  return http.upload('/profile/uploadImage', filePath)
}
// 获取模糊头像
export const getBlur = (userId) => {
  return http.post('/dating/blurAvatar', { user_id: userId })
}

// ==================== 内容相关 ====================

// 获取Banner列表
export const getBanners = (position = 'home') => {
  return http.get('/dating/banners', { position })
}

// 获取标签列表
export const getTags = (type = '') => {
  return http.get('/dating/tags', { type })
}

// 获取灵魂问题列表
export const getQuestions = () => {
  return http.get('/dating/questions')
}

// 获取充值套餐
export const getPackages = () => {
  return http.get('/dating/packages')
}

// 获取VIP会员套餐
export const getVipPackages = () => {
  return http.get('/dating/vipPackages')
}

// 获取交友群列表
export const getGroups = (city = '') => {
  return http.get('/dating/groups', { city })
}

// 获取地区列表
export const getAreaList = (pid = 0) => {
  return http.get('/dating/areaList', { pid })
}

// ==================== 单身库相关 ====================

// 获取单身用户列表
export const getUserList = (params) => {
  return http.get('/dating/userList', params)
}

// 获取已脱单案例列表
export const getCoupleList = (params) => {
  return http.get('/dating/coupleList', params)
}

// 获取推荐用户列表
export const getRecommendList = (params) => {
  return http.get('/dating/recommendList', params)
}

// 获取用户详情
export const getUserDetail = (userId) => {
  return http.get('/dating/userDetail', { user_id: userId })
}

// ==================== 社交相关 ====================

// 关注/取消关注
export const toggleFollow = (data) => {
  return http.post('/social/follow', data)
}

// 获取关注列表
export const getFollowList = (params) => {
  return http.get('/social/followList', params)
}

// 获取粉丝列表
export const getFansList = (params) => {
  return http.get('/social/fansList', params)
}

// 获取访客列表
export const getVisitList = (params) => {
  return http.get('/social/visitList', params)
}

// 发起好友申请
export const sendRequest = (data) => {
  return http.post('/request/send', data)
}

// 获取好友申请列表
export const getRequestList = (params) => {
  return http.get('/request/lists', params)
}

// 处理好友申请
export const handleRequest = (data) => {
  return http.post('/request/handle', data)
}

// 获取待处理申请数量
export const getPendingCount = () => {
  return http.get('/request/pendingCount')
}

// 想看微信/照片
export const wantView = (data) => {
  return http.post('/social/want', data)
}

// 获取想看我的列表
export const getWantMeList = (params) => {
  return http.get('/social/wantMeList', params)
}

// 获取我想看的列表
export const getMyWantList = (params) => {
  return http.get('/social/myWantList', params)
}

// 处理想看请求（同意/拒绝）
export const handleWant = (data) => {
  return http.post('/social/handleWant', data)
}

// ==================== 灵魂问答 ====================

// 获取我的灵魂问答
export const getMySoul = () => {
  return http.get('/profile/soul')
}

// 保存灵魂问答
export const saveSoul = (data) => {
  return http.post('/profile/soul', data)
}

// ==================== 充值相关 ====================

// 创建充值订单
export const createOrder = (data) => {
  return http.post('/pay/create', data)
}

// 微信支付
export const wxPay = (data) => {
  return http.post('/pay/wxpay', data)
}

// ==================== 认证相关 ====================

// 初始化人脸核身（合并实名+真人认证）
export const faceVerifyInit = (data) => {
  return http.post('/auth/faceVerifyInit', data)
}

// 查询人脸核身结果
export const faceVerifyResult = (data) => {
  return http.post('/auth/faceVerifyResult', data)
}

// 提交学历认证
export const submitEduAuth = (data) => {
  return http.post('/auth/education', data)
}

// 获取认证状态
export const getAuthStatus = () => {
  return http.get('/auth/status')
}

// ==================== 消息相关 ====================

// 获取消息列表
export const getMessageList = (params) => {
  return http.get('/message/index', params)
}

// 获取未读消息数量
export const getUnreadCount = () => {
  return http.get('/message/unread')
}

// 标记消息已读
export const markMessageRead = (data) => {
  return http.post('/message/read', data)
}

// 删除消息
export const deleteMessage = (data) => {
  return http.post('/message/delete', data)
}

// 清空消息
export const clearMessages = (data) => {
  return http.post('/message/clear', data)
}

// ==================== 协议相关 ====================

// 获取协议内容
export const getAgreement = (params) => {
  return http.get('/agreement/detail', params)
}

// ==================== 聊天相关 ====================

// 获取或创建会话（游客模式自动附加guest_token）
export const getOrCreateSession = (params) => {
  return http.get('/chat/session', { ...getGuestParams(), ...params })
}

// 获取会话列表（游客模式自动附加guest_token）
export const getChatList = (params) => {
  return http.get('/chat/list', { ...getGuestParams(), ...params })
}

// 获取历史消息（游客模式自动附加guest_token）
export const getChatMessages = (params) => {
  return http.get('/chat/messages', { ...getGuestParams(), ...params })
}

// 发送消息（游客模式自动附加guest_token）
export const sendChatMessage = (data) => {
  return http.post('/chat/send', { ...getGuestParams(), ...data })
}

// 获取未读统计（游客模式自动附加guest_token）
export const getChatUnread = () => {
  return http.get('/chat/unread', getGuestParams())
}

// 标记已读（游客模式自动附加guest_token）
export const markChatRead = (data) => {
  return http.post('/chat/read', { ...getGuestParams(), ...data })
}

// 屏蔽用户
export const blockUser = (data) => {
  return http.post('/chat/block', data)
}

// 取消屏蔽
export const unblockUser = (data) => {
  return http.post('/chat/unblock', data)
}

// 获取黑名单列表
export const getBlacklist = (params) => {
  return http.get('/chat/blacklist', params)
}

// 获取聊天配置（私聊模式等）
export const getChatConfig = () => {
  return http.get('/chat/config')
}

// ==================== 活动&成功案例======================
// 活动分页列表
export const getPartyLists = (params) => {
  return http.get('/party/lists', params)
}

// 活动详情页面
export const getPartyDetail = (id) => {
  return http.get('/party/detail', {id:id})
}

// 成功案例分页列表
export const getCasesLists = (params) => {
  return http.get('/cases/lists', params)
}

// 成功案例详情页面
export const getCasesDetail = (id) => {
  return http.get('/cases/detail', {id:id})
}



export default {
  passwordLogin,
  mobileLogin,
  sendSms,
  wxLogin,
  xhsLogin,
  register,
  resetPassword,
  logout,
  getUserInfo,
  updateProfile,
  getUserStats,
  uploadAvatar,
  uploadImage,
  getBanners,
  getTags,
  getQuestions,
  getPackages,
  getGroups,
  getUserList,
  getRecommendList,
  getUserDetail,
  toggleFollow,
  getFollowList,
  getFansList,
  getVisitList,
  sendRequest,
  getRequestList,
  handleRequest,
  getPendingCount,
  wantView,
  getWantMeList,
  getMyWantList,
  handleWant,
  getMySoul,
  saveSoul,
  createOrder,
  wxPay,
  faceVerifyInit,
  faceVerifyResult,
  submitEduAuth,
  getAuthStatus,
  getMessageList,
  getUnreadCount,
  markMessageRead,
  deleteMessage,
  clearMessages,
  getAgreement,
  getVipPackages,
  getPartyLists,
  getPartyDetail,
  getCasesLists,
  getCasesDetail,
  getBlur,
  // 聊天相关
  getOrCreateSession,
  getChatList,
  getChatMessages,
  sendChatMessage,
  getChatUnread,
  markChatRead,
  blockUser,
  unblockUser,
  getBlacklist
}
