"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
const utils_request = require("./request.js");
const STORAGE_KEYS = {
  GUEST_ID: "guest_id",
  GUEST_TOKEN: "guest_token",
  GUEST_EXPTIME: "guest_exptime",
  GUEST_USERINFO: "guest_userinfo"
};
function generateDeviceId() {
  try {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    const deviceId = systemInfo.deviceId || systemInfo.uuid || "";
    if (deviceId) {
      return deviceId.substring(0, 8);
    }
  } catch (e) {
    console.warn("[guestAuth] 获取设备信息失败", e);
  }
  return Math.random().toString(36).substring(2, 10);
}
function generateGuestId() {
  const deviceId = generateDeviceId();
  const timestamp = Date.now().toString(36);
  return `${utils_config.config.guestIdPrefix}${deviceId}_${timestamp}`;
}
function getGuestId() {
  const guestId = common_vendor.index.getStorageSync(STORAGE_KEYS.GUEST_ID);
  const guestExpTime = common_vendor.index.getStorageSync(STORAGE_KEYS.GUEST_EXPTIME);
  if (!guestId)
    return null;
  if (guestExpTime && Date.now() > guestExpTime) {
    console.log("[guestAuth] 游客身份已过期，清除本地存储");
    clearGuestInfo();
    return null;
  }
  return guestId;
}
function getGuestToken() {
  const guestToken = common_vendor.index.getStorageSync(STORAGE_KEYS.GUEST_TOKEN);
  return guestToken || null;
}
function getGuestUserInfo() {
  const guestUserInfo = common_vendor.index.getStorageSync(STORAGE_KEYS.GUEST_USERINFO);
  if (guestUserInfo) {
    try {
      return typeof guestUserInfo === "string" ? JSON.parse(guestUserInfo) : guestUserInfo;
    } catch (e) {
      return null;
    }
  }
  return null;
}
function isGuest() {
  const token = common_vendor.index.getStorageSync("token");
  return !token && getGuestId() !== null;
}
function isGuestValid() {
  const guestId = getGuestId();
  const guestToken = getGuestToken();
  const guestExpTime = common_vendor.index.getStorageSync(STORAGE_KEYS.GUEST_EXPTIME);
  return guestId && guestToken && guestExpTime && Date.now() <= guestExpTime;
}
async function getOrCreateGuestId(params = {}) {
  const existingGuestId = getGuestId();
  const existingGuestToken = getGuestToken();
  if (existingGuestId && existingGuestToken && isGuestValid()) {
    console.log("[guestAuth] 使用本地已有的游客身份", existingGuestId);
    return {
      guest_id: existingGuestId,
      guest_token: existingGuestToken,
      is_new: false
    };
  }
  try {
    console.log("[guestAuth] 创建新的游客身份", params);
    const res = await utils_request.http.post("/chat/create_guest", {
      guest_id: generateGuestId(),
      ...params
    });
    if (res && res.data) {
      const guestInfo = res.data;
      common_vendor.index.setStorageSync(STORAGE_KEYS.GUEST_ID, guestInfo.guest_id);
      common_vendor.index.setStorageSync(STORAGE_KEYS.GUEST_TOKEN, guestInfo.guest_token);
      const expTime = Date.now() + utils_config.config.guestExpireDays * 24 * 60 * 60 * 1e3;
      common_vendor.index.setStorageSync(STORAGE_KEYS.GUEST_EXPTIME, expTime);
      if (guestInfo.userinfo) {
        common_vendor.index.setStorageSync(STORAGE_KEYS.GUEST_USERINFO, JSON.stringify(guestInfo.userinfo));
      }
      console.log("[guestAuth] 游客身份创建成功", guestInfo.guest_id);
      return {
        guest_id: guestInfo.guest_id,
        guest_token: guestInfo.guest_token,
        userinfo: guestInfo.userinfo || null,
        is_new: true
      };
    }
  } catch (e) {
    console.error("[guestAuth] 创建游客身份失败", e);
    const fallbackGuestId = generateGuestId();
    const fallbackExpTime = Date.now() + utils_config.config.guestExpireDays * 24 * 60 * 60 * 1e3;
    common_vendor.index.setStorageSync(STORAGE_KEYS.GUEST_ID, fallbackGuestId);
    common_vendor.index.setStorageSync(STORAGE_KEYS.GUEST_EXPTIME, fallbackExpTime);
    return {
      guest_id: fallbackGuestId,
      guest_token: null,
      is_new: true,
      is_fallback: true
    };
  }
}
function clearGuestInfo() {
  common_vendor.index.removeStorageSync(STORAGE_KEYS.GUEST_ID);
  common_vendor.index.removeStorageSync(STORAGE_KEYS.GUEST_TOKEN);
  common_vendor.index.removeStorageSync(STORAGE_KEYS.GUEST_EXPTIME);
  common_vendor.index.removeStorageSync(STORAGE_KEYS.GUEST_USERINFO);
  console.log("[guestAuth] 游客信息已清除");
}
function getCurrentToken() {
  const token = common_vendor.index.getStorageSync("token");
  if (token)
    return token;
  return getGuestToken();
}
function getCurrentUserId() {
  const userinfo = common_vendor.index.getStorageSync("userinfo");
  if (userinfo && userinfo.id) {
    return userinfo.id;
  }
  return getGuestId();
}
async function updateGuestUserInfo(userInfo) {
  const guestId = getGuestId();
  const guestToken = getGuestToken();
  if (!guestId) {
    console.warn("[guestAuth] 没有游客身份，无法更新用户信息");
    return { success: false, error: "没有游客身份" };
  }
  try {
    const existingInfo = getGuestUserInfo() || {};
    const mergedInfo = {
      ...existingInfo,
      avatar: userInfo.avatarUrl || userInfo.avatar || existingInfo.avatar,
      nickname: userInfo.nickName || userInfo.nickname || existingInfo.nickname,
      gender: userInfo.gender || existingInfo.gender
    };
    common_vendor.index.setStorageSync(STORAGE_KEYS.GUEST_USERINFO, JSON.stringify(mergedInfo));
    if (guestToken) {
      console.log("[guestAuth] 同步游客用户信息到服务器", guestId, mergedInfo);
      const res = await utils_request.http.post("/chat/update_guest_info", {
        guest_id: guestId,
        guest_token: guestToken,
        userinfo: {
          avatar: mergedInfo.avatar,
          nickname: mergedInfo.nickname,
          gender: mergedInfo.gender
        }
      });
      if (res && res.data) {
        console.log("[guestAuth] 游客用户信息同步成功");
        return { success: true, userinfo: mergedInfo };
      }
    }
    return { success: true, userinfo: mergedInfo };
  } catch (e) {
    console.error("[guestAuth] 更新游客用户信息失败", e);
    return {
      success: true,
      userinfo: getGuestUserInfo(),
      server_sync_failed: true,
      error: e.msg || "同步失败"
    };
  }
}
exports.getCurrentToken = getCurrentToken;
exports.getCurrentUserId = getCurrentUserId;
exports.getGuestToken = getGuestToken;
exports.getGuestUserInfo = getGuestUserInfo;
exports.getOrCreateGuestId = getOrCreateGuestId;
exports.isGuest = isGuest;
exports.updateGuestUserInfo = updateGuestUserInfo;
