"use strict";
const common_vendor = require("../common/vendor.js");
const isXhsMiniApp = () => {
  return true;
};
const getLoginCode = () => {
  return new Promise((resolve, reject) => {
    xhs.login({
      success: (res) => {
        if (res.code) {
          console.log("[XHS Login] 获取 code 成功:", res.code);
          resolve(res.code);
        } else {
          console.error("[XHS Login] 获取 code 失败: code 为空");
          reject(new Error("获取登录凭证失败"));
        }
      },
      fail: (err) => {
        console.error("[XHS Login] xhs.login 调用失败:", err);
        reject(err);
      }
    });
  });
};
const checkSession = () => {
  return new Promise((resolve) => {
    xhs.checkSession({
      success: () => {
        console.log("[XHS Login] session_key 有效");
        resolve(true);
      },
      fail: () => {
        console.log("[XHS Login] session_key 已过期");
        resolve(false);
      }
    });
  });
};
const xhsQuickLogin = async (loginApi) => {
  try {
    const sessionValid = await checkSession();
    const localToken = common_vendor.index.getStorageSync("token");
    const localOpenid = common_vendor.index.getStorageSync("xhs_openid");
    if (sessionValid && localToken && localOpenid) {
      console.log("[XHS Login] 尝试静默登录");
      return {
        success: true,
        silent: true,
        token: localToken
      };
    }
    const code = await getLoginCode();
    const inviterId = common_vendor.index.getStorageSync("share_inviter_id");
    const loginData = { code, platform: "xhs" };
    if (inviterId) {
      loginData.inviter_id = inviterId;
    }
    const res = await loginApi(loginData);
    if (res.code === 1 && res.data) {
      const { token, userinfo, openid } = res.data;
      common_vendor.index.setStorageSync("token", token);
      common_vendor.index.setStorageSync("userinfo", userinfo);
      if (openid) {
        common_vendor.index.setStorageSync("xhs_openid", openid);
      }
      console.log("[XHS Login] 登录成功");
      return {
        success: true,
        silent: false,
        token,
        userinfo,
        openid,
        isNewUser: res.data.is_new_user || false
      };
    } else {
      throw new Error(res.msg || "登录失败");
    }
  } catch (error) {
    console.error("[XHS Login] 登录流程出错:", error);
    throw error;
  }
};
exports.checkSession = checkSession;
exports.getLoginCode = getLoginCode;
exports.isXhsMiniApp = isXhsMiniApp;
exports.xhsQuickLogin = xhsQuickLogin;
