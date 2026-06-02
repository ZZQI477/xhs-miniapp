"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_xhsLogin = require("./utils/xhsLogin.js");
const api_index = require("./api/index.js");
if (!Math) {
  "./pages/login/index.js";
  "./pages/login/reset.js";
  "./pages/index/index.js";
  "./pages/single/index.js";
  "./pages/message/index.js";
  "./pages/mine/index.js";
  "./pages/soul/questions.js";
  "./pages/setting/index.js";
  "./pages/coin/index.js";
  "./pages/like/index.js";
  "./pages/fans/index.js";
  "./pages/visited/index.js";
  "./pages/profile/edit.js";
  "./pages/profile/guide.js";
  "./pages/profile/core-info.js";
  "./pages/signup/guide.js";
  "./pages/auth/index.js";
  "./pages/auth/idcard.js";
  "./pages/auth/face.js";
  "./pages/auth/callback.js";
  "./pages/auth/edu.js";
  "./pages/want/my.js";
  "./pages/want/me.js";
  "./pages/request/index.js";
  "./pages/group/index.js";
  "./pages/user/detail.js";
  "./pages/agreement/user.js";
  "./pages/agreement/privacy.js";
  "./pages/vip/index.js";
  "./pages/agreement/vip.js";
  "./pages/account/cancel.js";
}
const _sfc_main = {
  onLaunch: function() {
    console.log("App Launch");
    this.checkLoginStatus();
  },
  onShow: function() {
    console.log("App Show");
  },
  onHide: function() {
    console.log("App Hide");
  },
  methods: {
    // 检查登录状态
    async checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        console.log("[App] 未登录，游客态浏览");
        common_vendor.index.setStorageSync("is_guest_mode", true);
        return;
      }
      const userinfo = common_vendor.index.getStorageSync("userinfo");
      if (!userinfo || !userinfo.id) {
        console.log("[App] 本地用户信息异常，清除后降级为游客态");
        this.clearLoginState();
        return;
      }
      {
        const sessionValid = await utils_xhsLogin.checkSession();
        if (!sessionValid) {
          console.log("[App] 小红书 session 已过期，清除登录信息降级为游客态");
          this.clearLoginState();
          return;
        }
      }
      try {
        const res = await api_index.getUserInfo();
        const freshUserInfo = res.data.userinfo || res.data || {};
        if (!freshUserInfo.id) {
          console.log("[App] 后端返回用户信息异常，降级为游客态");
          this.clearLoginState();
          return;
        }
        common_vendor.index.setStorageSync("userinfo", freshUserInfo);
        console.log("[App] token 验证通过，用户信息已刷新");
        const hasGender = freshUserInfo.gender && freshUserInfo.gender !== 0;
        const hasEducation = freshUserInfo.education && freshUserInfo.education !== "";
        if (!hasGender || !hasEducation) {
          console.log("[App] 基础信息未完成，需要填写引导信息", { gender: freshUserInfo.gender, education: freshUserInfo.education });
          setTimeout(() => {
            const pages = getCurrentPages();
            const currentPage = pages[pages.length - 1];
            if (currentPage && currentPage.route !== "pages/signup/guide") {
              common_vendor.index.redirectTo({ url: "/pages/signup/guide" });
            }
          }, 500);
        }
      } catch (e) {
        if (e._isAuthError) {
          console.log("[App] token 已过期，降级为游客态");
          common_vendor.index.setStorageSync("is_guest_mode", true);
        } else {
          console.error("[App] 验证登录状态失败", e);
          common_vendor.index.setStorageSync("login_needs_refresh", true);
        }
      }
    },
    clearLoginState() {
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userinfo");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("xhs_openid");
      common_vendor.index.setStorageSync("is_guest_mode", true);
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
