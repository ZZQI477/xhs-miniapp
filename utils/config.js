// API 基础配置
const config = {
  // 接口基础地址
  baseUrl: 'https://xhscms.zquest.top/api',
  curlRef: 'https://xhscms.zquest.top',
  // baseUrl: 'http://www.hy.com/api',
  // curlRef: 'http://www.hy.com',


  // 请求超时时间
  timeout: 10000,

  // 请求头
  headers: {
    'Content-Type': 'application/json'
  },

  // WebSocket配置
  // wsUrl: 'ws://127.0.0.1:2345',  // WebSocket服务地址
  wsUrl: 'wss://xhscms.zquest.top/ws',  // WebSocket服务地址
  wsHeartbeatInterval: 30000,           // 心跳间隔（毫秒）
  wsReconnectMaxDelay: 30000,           // 最大重连延迟（毫秒）
  wsReconnectBaseDelay: 1000,           // 基础重连延迟（毫秒）

  // 游客身份配置
  guestExpireDays: 7,                   // 游客身份有效期（天）
  guestIdPrefix: 'guest_'               // 游客ID前缀
}

export default config
