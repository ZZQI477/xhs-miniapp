"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
const utils_guestAuth = require("./guestAuth.js");
let isConnected = false;
let isConnecting = false;
let reconnectAttempts = 0;
let reconnectTimer = null;
let heartbeatTimer = null;
let messageCallbacks = [];
let connectionCallbacks = [];
let pendingMessages = [];
function onMessage(callback) {
  if (typeof callback === "function") {
    messageCallbacks.push(callback);
  }
}
function offMessage(callback) {
  const index = messageCallbacks.indexOf(callback);
  if (index > -1) {
    messageCallbacks.splice(index, 1);
  }
}
function triggerMessageCallbacks(message) {
  messageCallbacks.forEach((cb) => {
    try {
      cb(message);
    } catch (e) {
      common_vendor.index.__f__("error", "at utils/websocket.js:76", "[WebSocket] 消息回调执行错误", e);
    }
  });
}
function triggerConnectionCallbacks(connected) {
  connectionCallbacks.forEach((cb) => {
    try {
      cb({ connected });
    } catch (e) {
      common_vendor.index.__f__("error", "at utils/websocket.js:90", "[WebSocket] 连接状态回调执行错误", e);
    }
  });
}
function initWebSocket(options = {}) {
  if (isConnected || isConnecting) {
    common_vendor.index.__f__("log", "at utils/websocket.js:103", "[WebSocket] 已连接或正在连接，跳过初始化");
    return;
  }
  let token = options.token || utils_guestAuth.getCurrentToken();
  options.userId || utils_guestAuth.getCurrentUserId();
  const guestMode = utils_guestAuth.isGuest();
  if (!token) {
    common_vendor.index.__f__("warn", "at utils/websocket.js:112", "[WebSocket] 无有效token，延迟连接");
    return;
  }
  if (guestMode && !token.startsWith("guest_")) {
    token = "guest_" + token;
  }
  const wsUrl = `${utils_config.config.wsUrl}/?token=${encodeURIComponent(token)}`;
  common_vendor.index.__f__("log", "at utils/websocket.js:124", "[WebSocket] 开始连接", wsUrl);
  isConnecting = true;
  common_vendor.index.connectSocket({
    url: wsUrl,
    success: () => {
      common_vendor.index.__f__("log", "at utils/websocket.js:131", "[WebSocket] 连接请求已发送");
    },
    fail: (err) => {
      common_vendor.index.__f__("error", "at utils/websocket.js:134", "[WebSocket] 连接请求失败", err);
      isConnecting = false;
      scheduleReconnect();
    }
  });
  common_vendor.index.onSocketOpen((res) => {
    common_vendor.index.__f__("log", "at utils/websocket.js:142", "[WebSocket] 连接已打开", res);
    isConnected = true;
    isConnecting = false;
    reconnectAttempts = 0;
    triggerConnectionCallbacks(true);
    startHeartbeat();
    sendPendingMessages();
  });
  common_vendor.index.onSocketMessage((res) => {
    try {
      const message = JSON.parse(res.data);
      common_vendor.index.__f__("log", "at utils/websocket.js:161", "[WebSocket] 收到消息", message);
      if (message.type === "pong") {
        return;
      }
      triggerMessageCallbacks(message);
    } catch (e) {
      common_vendor.index.__f__("error", "at utils/websocket.js:171", "[WebSocket] 解析消息失败", e, res.data);
    }
  });
  common_vendor.index.onSocketError((err) => {
    common_vendor.index.__f__("error", "at utils/websocket.js:177", "[WebSocket] 连接错误", err);
    isConnected = false;
    isConnecting = false;
    stopHeartbeat();
    triggerConnectionCallbacks(false);
    scheduleReconnect();
  });
  common_vendor.index.onSocketClose((res) => {
    common_vendor.index.__f__("log", "at utils/websocket.js:187", "[WebSocket] 连接已关闭", res);
    isConnected = false;
    isConnecting = false;
    stopHeartbeat();
    triggerConnectionCallbacks(false);
    if (reconnectAttempts < 10) {
      scheduleReconnect();
    }
  });
}
function startHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }
  heartbeatTimer = setInterval(() => {
    if (isConnected) {
      sendHeartbeat();
    }
  }, utils_config.config.wsHeartbeatInterval);
}
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}
function sendHeartbeat() {
  if (!isConnected)
    return;
  common_vendor.index.sendSocketMessage({
    data: JSON.stringify({ type: "ping" }),
    success: () => {
      common_vendor.index.__f__("log", "at utils/websocket.js:234", "[WebSocket] 心跳发送成功");
    },
    fail: (err) => {
      common_vendor.index.__f__("error", "at utils/websocket.js:237", "[WebSocket] 心跳发送失败", err);
    }
  });
}
function calculateReconnectDelay() {
  const baseDelay = utils_config.config.wsReconnectBaseDelay;
  const maxDelay = utils_config.config.wsReconnectMaxDelay;
  const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts), maxDelay);
  return delay;
}
function scheduleReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  reconnectAttempts++;
  const delay = calculateReconnectDelay();
  common_vendor.index.__f__("log", "at utils/websocket.js:264", `[WebSocket] 将在 ${delay}ms 后尝试重连（第${reconnectAttempts}次）`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    initWebSocket();
  }, delay);
}
function sendPendingMessages() {
  if (pendingMessages.length === 0)
    return;
  common_vendor.index.__f__("log", "at utils/websocket.js:278", `[WebSocket] 发送待发送队列中的 ${pendingMessages.length} 条消息`);
  const messages = [...pendingMessages];
  pendingMessages = [];
  messages.forEach((msg) => {
    sendMessage(msg);
  });
}
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    if (!isConnected) {
      common_vendor.index.__f__("warn", "at utils/websocket.js:296", "[WebSocket] 未连接，消息暂存到队列");
      pendingMessages.push(message);
      resolve(false);
      return;
    }
    const messageStr = JSON.stringify(message);
    common_vendor.index.sendSocketMessage({
      data: messageStr,
      success: () => {
        common_vendor.index.__f__("log", "at utils/websocket.js:307", "[WebSocket] 消息发送成功", message);
        resolve(true);
      },
      fail: (err) => {
        common_vendor.index.__f__("error", "at utils/websocket.js:311", "[WebSocket] 消息发送失败", err);
        pendingMessages.push(message);
        reject(err);
      }
    });
  });
}
function closeWebSocket() {
  if (!isConnected && !isConnecting) {
    common_vendor.index.__f__("log", "at utils/websocket.js:347", "[WebSocket] 连接已关闭，无需操作");
    return;
  }
  common_vendor.index.__f__("log", "at utils/websocket.js:351", "[WebSocket] 主动关闭连接");
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  reconnectAttempts = 0;
  stopHeartbeat();
  common_vendor.index.closeSocket({
    success: () => {
      common_vendor.index.__f__("log", "at utils/websocket.js:368", "[WebSocket] 连接关闭成功");
    },
    fail: (err) => {
      common_vendor.index.__f__("error", "at utils/websocket.js:371", "[WebSocket] 连接关闭失败", err);
    }
  });
  isConnected = false;
  isConnecting = false;
}
exports.closeWebSocket = closeWebSocket;
exports.initWebSocket = initWebSocket;
exports.offMessage = offMessage;
exports.onMessage = onMessage;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/websocket.js.map
