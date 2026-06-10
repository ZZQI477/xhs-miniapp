import config from './config.js'
import { getCurrentToken, getCurrentUserId, isGuest } from './guestAuth.js'

// WebSocket状态
let wsTask = null           // WebSocket连接对象
let isConnected = false     // 是否已连接
let isConnecting = false    // 是否正在连接
let reconnectAttempts = 0   // 重连尝试次数
let reconnectTimer = null   // 重连定时器
let heartbeatTimer = null   // 心跳定时器
let messageCallbacks = []   // 消息回调列表
let connectionCallbacks = [] // 连接状态回调列表

// 待发送消息队列（连接断开时暂存）
let pendingMessages = []

/**
 * 获取WebSocket连接状态
 * @returns {boolean}
 */
export function getConnectionState() {
  return isConnected
}

/**
 * 注册消息监听回调
 * @param {function} callback 回调函数，参数为消息对象
 */
export function onMessage(callback) {
  if (typeof callback === 'function') {
    messageCallbacks.push(callback)
  }
}

/**
 * 取消消息监听回调
 * @param {function} callback 要取消的回调函数
 */
export function offMessage(callback) {
  const index = messageCallbacks.indexOf(callback)
  if (index > -1) {
    messageCallbacks.splice(index, 1)
  }
}

/**
 * 注册连接状态监听回调
 * @param {function} callback 回调函数，参数为 { connected: boolean }
 */
export function onConnectionChange(callback) {
  if (typeof callback === 'function') {
    connectionCallbacks.push(callback)
  }
}

/**
 * 取消连接状态监听回调
 * @param {function} callback 要取消的回调函数
 */
export function offConnectionChange(callback) {
  const index = connectionCallbacks.indexOf(callback)
  if (index > -1) {
    connectionCallbacks.splice(index, 1)
  }
}

/**
 * 触发消息回调
 * @param {object} message 消息对象
 */
function triggerMessageCallbacks(message) {
  messageCallbacks.forEach(cb => {
    try {
      cb(message)
    } catch (e) {
      console.error('[WebSocket] 消息回调执行错误', e)
    }
  })
}

/**
 * 触发连接状态回调
 * @param {boolean} connected 是否已连接
 */
function triggerConnectionCallbacks(connected) {
  connectionCallbacks.forEach(cb => {
    try {
      cb({ connected })
    } catch (e) {
      console.error('[WebSocket] 连接状态回调执行错误', e)
    }
  })
}

/**
 * 初始化WebSocket连接
 * @param {object} options 配置选项
 * @param {string} options.token 认证token（可选，默认自动获取）
 * @param {string} options.userId 用户ID（可选，默认自动获取）
 */
export function initWebSocket(options = {}) {
  if (isConnected || isConnecting) {
    console.log('[WebSocket] 已连接或正在连接，跳过初始化')
    return
  }
  
  let token = options.token || getCurrentToken()
  const userId = options.userId || getCurrentUserId()
  const guestMode = isGuest()
  
  if (!token) {
    console.warn('[WebSocket] 无有效token，延迟连接')
    return
  }
  
  // 游客模式：token格式为 guest_{guest_token}
  if (guestMode && !token.startsWith('guest_')) {
    token = 'guest_' + token
  }
  
  // 构建WebSocket URL
  const wsUrl = `${config.wsUrl}/?token=${encodeURIComponent(token)}`
  
  console.log('[WebSocket] 开始连接', wsUrl)
  isConnecting = true
  
  // 使用uni-app统一API连接WebSocket
  uni.connectSocket({
    url: wsUrl,
    success: () => {
      console.log('[WebSocket] 连接请求已发送')
    },
    fail: (err) => {
      console.error('[WebSocket] 连接请求失败', err)
      isConnecting = false
      scheduleReconnect()
    }
  })
  
  // 监听WebSocket打开事件
  uni.onSocketOpen((res) => {
    console.log('[WebSocket] 连接已打开', res)
    isConnected = true
    isConnecting = false
    reconnectAttempts = 0
    
    // 触发连接状态回调
    triggerConnectionCallbacks(true)
    
    // 启动心跳
    startHeartbeat()
    
    // 发送待发送队列中的消息
    sendPendingMessages()
  })
  
  // 监听WebSocket消息事件
  uni.onSocketMessage((res) => {
    try {
      const message = JSON.parse(res.data)
      console.log('[WebSocket] 收到消息', message)
      
      // 处理心跳响应
      if (message.type === 'pong') {
        return
      }
      
      // 触发消息回调
      triggerMessageCallbacks(message)
    } catch (e) {
      console.error('[WebSocket] 解析消息失败', e, res.data)
    }
  })
  
  // 监听WebSocket错误事件
  uni.onSocketError((err) => {
    console.error('[WebSocket] 连接错误', err)
    isConnected = false
    isConnecting = false
    stopHeartbeat()
    triggerConnectionCallbacks(false)
    scheduleReconnect()
  })
  
  // 监听WebSocket关闭事件
  uni.onSocketClose((res) => {
    console.log('[WebSocket] 连接已关闭', res)
    isConnected = false
    isConnecting = false
    stopHeartbeat()
    triggerConnectionCallbacks(false)
    
    // 如果不是主动关闭，尝试重连
    if (reconnectAttempts < 10) {
      scheduleReconnect()
    }
  })
}

/**
 * 启动心跳定时器
 */
function startHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
  }
  
  heartbeatTimer = setInterval(() => {
    if (isConnected) {
      sendHeartbeat()
    }
  }, config.wsHeartbeatInterval)
}

/**
 * 停止心跳定时器
 */
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

/**
 * 发送心跳包
 */
function sendHeartbeat() {
  if (!isConnected) return
  
  uni.sendSocketMessage({
    data: JSON.stringify({ type: 'ping' }),
    success: () => {
      console.log('[WebSocket] 心跳发送成功')
    },
    fail: (err) => {
      console.error('[WebSocket] 心跳发送失败', err)
    }
  })
}

/**
 * 计算重连延迟（指数退避）
 * @returns {number} 延迟毫秒数
 */
function calculateReconnectDelay() {
  const baseDelay = config.wsReconnectBaseDelay
  const maxDelay = config.wsReconnectMaxDelay
  const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts), maxDelay)
  return delay
}

/**
 * 安排重连
 */
function scheduleReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }
  
  reconnectAttempts++
  const delay = calculateReconnectDelay()
  
  console.log(`[WebSocket] 将在 ${delay}ms 后尝试重连（第${reconnectAttempts}次）`)
  
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    initWebSocket()
  }, delay)
}

/**
 * 发送待发送队列中的消息
 */
function sendPendingMessages() {
  if (pendingMessages.length === 0) return
  
  console.log(`[WebSocket] 发送待发送队列中的 ${pendingMessages.length} 条消息`)
  
  const messages = [...pendingMessages]
  pendingMessages = []
  
  messages.forEach(msg => {
    sendMessage(msg)
  })
}

/**
 * 发送消息
 * @param {object} message 消息对象
 * @returns {Promise<boolean>} 发送结果
 */
export function sendMessage(message) {
  return new Promise((resolve, reject) => {
    if (!isConnected) {
      console.warn('[WebSocket] 未连接，消息暂存到队列')
      pendingMessages.push(message)
      resolve(false)
      return
    }
    
    const messageStr = JSON.stringify(message)
    
    uni.sendSocketMessage({
      data: messageStr,
      success: () => {
        console.log('[WebSocket] 消息发送成功', message)
        resolve(true)
      },
      fail: (err) => {
        console.error('[WebSocket] 消息发送失败', err)
        // 发送失败，暂存到队列等待重连后发送
        pendingMessages.push(message)
        reject(err)
      }
    })
  })
}

/**
 * 发送聊天消息
 * @param {object} options 消息参数
 * @param {string} options.to_id 接收方用户ID
 * @param {string} options.content 消息内容
 * @param {string} options.type 消息类型（text/image）
 * @param {string} options.conversation_id 会话ID（可选）
 * @returns {Promise<boolean>}
 */
export function sendChatMessage(options) {
  const message = {
    type: 'chat',
    to_id: options.to_id,
    content: options.content,
    msg_type: options.type || 'text',
    conversation_id: options.conversation_id || null,
    created_at: Date.now()
  }
  
  return sendMessage(message)
}

/**
 * 关闭WebSocket连接
 */
export function closeWebSocket() {
  if (!isConnected && !isConnecting) {
    console.log('[WebSocket] 连接已关闭，无需操作')
    return
  }
  
  console.log('[WebSocket] 主动关闭连接')
  
  // 取消重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  
  // 重置重连次数
  reconnectAttempts = 0
  
  // 停止心跳
  stopHeartbeat()
  
  // 关闭连接
  uni.closeSocket({
    success: () => {
      console.log('[WebSocket] 连接关闭成功')
    },
    fail: (err) => {
      console.error('[WebSocket] 连接关闭失败', err)
    }
  })
  
  isConnected = false
  isConnecting = false
  wsTask = null
}

/**
 * 重连WebSocket（手动触发）
 */
export function reconnectWebSocket() {
  closeWebSocket()
  reconnectAttempts = 0
  initWebSocket()
}

export default {
  initWebSocket,
  closeWebSocket,
  reconnectWebSocket,
  sendMessage,
  sendChatMessage,
  getConnectionState,
  onMessage,
  offMessage,
  onConnectionChange,
  offConnectionChange
}