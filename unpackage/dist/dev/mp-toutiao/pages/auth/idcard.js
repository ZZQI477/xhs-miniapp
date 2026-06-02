"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      submitting: false,
      hasVerifyToken: false,
      verifyToken: ""
    };
  },
  onShow() {
    const token = common_vendor.index.getStorageSync("verify_token");
    if (token) {
      this.verifyToken = token;
      this.hasVerifyToken = true;
    }
  },
  methods: {
    async startVerify() {
      this.submitting = true;
      try {
        common_vendor.index.showLoading({ title: "正在获取链接..." });
        const res = await api_index.faceVerifyInit();
        const verifyToken = res.data.verify_token;
        common_vendor.index.hideLoading();
        if (!verifyToken) {
          common_vendor.index.showToast({ title: "获取认证token失败", icon: "none" });
          return;
        }
        this.verifyToken = verifyToken;
        this.hasVerifyToken = true;
        common_vendor.index.setStorageSync("verify_token", verifyToken);
        const domain = "https://www.hy.com";
        const successUrl = domain + "/api/user/faceCallback?token=" + verifyToken + "&status=success";
        const failedUrl = domain + "/api/user/faceCallback?token=" + verifyToken + "&status=failed";
        const h5Url = "https://brain.baidu.com/face/print/?token=" + verifyToken + "&successUrl=" + encodeURIComponent(successUrl) + "&failedUrl=" + encodeURIComponent(failedUrl);
        common_vendor.index.__f__("log", "at pages/auth/idcard.vue:74", "认证链接:", h5Url);
        common_vendor.index.setClipboardData({
          data: h5Url,
          success: () => {
            common_vendor.index.showModal({
              title: "链接已复制",
              content: '认证链接已复制到剪贴板，请打开手机浏览器粘贴访问，完成认证后返回此页面点击"查询认证结果"',
              showCancel: false,
              confirmText: "我知道了"
            });
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/auth/idcard.vue:88", "复制失败:", err);
            common_vendor.index.showToast({ title: "复制失败，请重试", icon: "none" });
          }
        });
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/auth/idcard.vue:94", "startVerify error:", e);
        common_vendor.index.showToast({ title: e.msg || "获取链接失败", icon: "none" });
      } finally {
        this.submitting = false;
      }
    },
    async checkResult() {
      if (!this.verifyToken) {
        common_vendor.index.showToast({ title: "请先获取认证链接", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "查询中..." });
        const res = await api_index.faceVerifyResult({ verify_token: this.verifyToken });
        common_vendor.index.hideLoading();
        if (res.data.status === "success") {
          common_vendor.index.removeStorageSync("verify_token");
          common_vendor.index.showModal({
            title: "认证成功",
            content: "恭喜您已完成实名真人认证！",
            showCancel: false,
            success: () => {
              common_vendor.index.navigateBack();
            }
          });
        } else if (res.data.status === "pending") {
          common_vendor.index.showToast({ title: "认证进行中，请完成后再查询", icon: "none" });
        } else {
          common_vendor.index.showModal({
            title: "认证未通过",
            content: res.data.message || "请重新获取链接进行认证",
            showCancel: false
          });
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: e.msg || "查询失败", icon: "none" });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.startVerify && $options.startVerify(...args), "c1"),
    b: $data.submitting,
    c: $data.hasVerifyToken
  }, $data.hasVerifyToken ? {
    d: common_vendor.o((...args) => $options.checkResult && $options.checkResult(...args), "80")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8ad5cd2a"]]);
tt.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-toutiao/pages/auth/idcard.js.map
