"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const api_index = require("./api/index.js");
const utils_profileCheck = require("./utils/profileCheck.js");
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
  "./pages/party/index.js";
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
  "./pages/cases/index.js";
  "./pages/party/detail.js";
  "./pages/cases/detail.js";
  "./pages/action/index.js";
  "./pages/chat/list.js";
  "./pages/chat/detail.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:8", "App Launch");
    utils_profileCheck.resetSessionPromptFlag();
    this.checkLoginStatus();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:15", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:18", "App Hide");
  },
  methods: {
    // 检查登录状态
    async checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.__f__("log", "at App.vue:26", "[App] 未登录，游客态浏览");
        common_vendor.index.setStorageSync("is_guest_mode", true);
        return;
      }
      const userinfo = common_vendor.index.getStorageSync("userinfo");
      if (!userinfo || !userinfo.id) {
        common_vendor.index.__f__("log", "at App.vue:36", "[App] 本地用户信息异常，清除后降级为游客态");
        this.clearLoginState();
        return;
      }
      try {
        const res = await api_index.getUserInfo();
        const freshUserInfo = res.data.userinfo || res.data || {};
        if (!freshUserInfo.id) {
          common_vendor.index.__f__("log", "at App.vue:55", "[App] 后端返回用户信息异常，降级为游客态");
          this.clearLoginState();
          return;
        }
        common_vendor.index.setStorageSync("userinfo", freshUserInfo);
        common_vendor.index.__f__("log", "at App.vue:61", "[App] token 验证通过，用户信息已刷新");
        const hasGender = freshUserInfo.gender && freshUserInfo.gender !== 0;
        const hasEducation = freshUserInfo.education && freshUserInfo.education !== "";
        if (!hasGender || !hasEducation) {
          common_vendor.index.__f__("log", "at App.vue:67", "[App] 基础信息未完成，需要填写引导信息", { gender: freshUserInfo.gender, education: freshUserInfo.education });
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
          common_vendor.index.__f__("log", "at App.vue:80", "[App] token 已过期，降级为游客态");
          common_vendor.index.setStorageSync("is_guest_mode", true);
        } else {
          common_vendor.index.__f__("error", "at App.vue:84", "[App] 验证登录状态失败", e);
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
//# sourceMappingURL=../.sourcemap/mp-toutiao/app.js.map
