"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      h5Url: "",
      verifyToken: "",
      loading: true
    };
  },
  onLoad(options) {
    this.h5Url = decodeURIComponent(options.url || "");
    this.verifyToken = options.verify_token || "";
    if (!this.h5Url) {
      common_vendor.index.showToast({ title: "认证地址错误", icon: "none" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
    }
  },
  methods: {
    // 处理webview加载成功
    handleLoad(e) {
      common_vendor.index.__f__("log", "at pages/auth/face.vue:44", "webview loaded:", e.detail);
      this.loading = false;
    },
    // 处理webview加载失败
    handleError(e) {
      common_vendor.index.__f__("error", "at pages/auth/face.vue:50", "webview error:", e.detail);
      this.loading = false;
      common_vendor.index.showModal({
        title: "加载失败",
        content: "认证页面加载失败，请检查网络后重试",
        showCancel: false,
        success: () => {
          common_vendor.index.navigateBack();
        }
      });
    },
    // 处理webview返回的消息
    // 小红书JSSDK通过 xhs.miniProgram.postMessage({ data: {...} }) 发送
    // 会在小程序后退、组件销毁、分享时触发
    handleMessage(e) {
      var _a;
      common_vendor.index.__f__("log", "at pages/auth/face.vue:66", "webview message:", e);
      const messages = ((_a = e.detail) == null ? void 0 : _a.data) || [];
      for (const msg of messages) {
        if (msg.type === "verify_result") {
          if (msg.status === "success") {
            common_vendor.index.showToast({ title: "认证成功", icon: "success" });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1500);
          } else if (msg.status === "failed") {
            common_vendor.index.showToast({ title: msg.message || "认证失败", icon: "none" });
          }
        }
        if (msg.type === "navigate") {
          if (msg.action === "back") {
            common_vendor.index.navigateBack();
          } else if (msg.url) {
            common_vendor.index.navigateTo({ url: msg.url });
          }
        }
      }
    }
  },
  onUnload() {
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.loading
  }, $data.loading ? {} : {}, {
    b: $data.h5Url,
    c: common_vendor.o((...args) => $options.handleMessage && $options.handleMessage(...args), "44"),
    d: common_vendor.o((...args) => $options.handleLoad && $options.handleLoad(...args), "8e"),
    e: common_vendor.o((...args) => $options.handleError && $options.handleError(...args), "a6")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1d16c9f7"]]);
tt.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-toutiao/pages/auth/face.js.map
