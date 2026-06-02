"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
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
    common_vendor.index.__f__("log", "at App.vue:6", "App Launch");
    this.checkLoginStatus();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:11", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:14", "App Hide");
  },
  methods: {
    // 检查登录状态
    async checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.__f__("log", "at App.vue:22", "[App] 未登录，游客态浏览");
        common_vendor.index.setStorageSync("is_guest_mode", true);
        return;
      }
      const userinfo = common_vendor.index.getStorageSync("userinfo");
      if (!userinfo || !userinfo.id) {
        common_vendor.index.__f__("log", "at App.vue:32", "[App] 本地用户信息异常，清除后降级为游客态");
        common_vendor.index.removeStorageSync("token");
        common_vendor.index.removeStorageSync("userinfo");
        common_vendor.index.removeStorageSync("userInfo");
        common_vendor.index.removeStorageSync("xhs_openid");
        common_vendor.index.setStorageSync("is_guest_mode", true);
        return;
      }
      const hasGender = userinfo && userinfo.gender && userinfo.gender !== 0;
      const hasEducation = userinfo && userinfo.education && userinfo.education !== "";
      if (userinfo && (!hasGender || !hasEducation)) {
        common_vendor.index.__f__("log", "at App.vue:46", "[App] 基础信息未完成，需要填写引导信息", { gender: userinfo.gender, education: userinfo.education });
        setTimeout(() => {
          const pages = getCurrentPages();
          const currentPage = pages[pages.length - 1];
          if (currentPage && currentPage.route !== "pages/signup/guide") {
            common_vendor.index.redirectTo({ url: "/pages/signup/guide" });
          }
        }, 500);
        return;
      }
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
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
