"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      verifyToken: "",
      status: "",
      resultStatus: "loading",
      // loading / success / fail
      resultTitle: "正在查询认证结果",
      resultDesc: "请稍候..."
    };
  },
  onLoad(options) {
    this.verifyToken = options.token || "";
    this.status = options.status || "";
    if (!this.verifyToken) {
      common_vendor.index.showToast({ title: "参数错误", icon: "none" });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 1500);
      return;
    }
    this.checkResult();
  },
  methods: {
    async checkResult() {
      if (!this.verifyToken) {
        common_vendor.index.showToast({ title: "认证信息异常，请重新认证", icon: "none" });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "查询中..." });
        const res = await api_index.faceVerifyResult({ verify_token: this.verifyToken });
        common_vendor.index.hideLoading();
        if (res.data.status === "passed") {
          this.resultStatus = "success";
          this.resultTitle = "认证通过";
          this.resultDesc = "恭喜您，实名真人认证已通过！";
        }
      } catch (e) {
        common_vendor.index.hideLoading();
        const data = e.data || {};
        if (data.status === "rejected") {
          this.resultStatus = "fail";
          this.resultTitle = "认证未通过";
          this.resultDesc = data.reason || e.msg || "请重新认证";
        } else if (data.status === "verifying") {
          this.resultStatus = "loading";
          this.resultTitle = "认证尚未完成";
          this.resultDesc = "请先完成人脸核身流程，然后点击下方按钮查询";
        } else {
          common_vendor.index.showToast({ title: e.msg || "查询失败，请稍后重试", icon: "none" });
        }
      }
    },
    retryVerify() {
      common_vendor.index.navigateBack({ delta: 2 });
    },
    goBack() {
      common_vendor.index.navigateBack({ delta: 2 });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.resultStatus === "loading"
  }, $data.resultStatus === "loading" ? {} : {}, {
    b: $data.resultStatus === "success"
  }, $data.resultStatus === "success" ? {} : {}, {
    c: $data.resultStatus === "fail"
  }, $data.resultStatus === "fail" ? {} : {}, {
    d: common_vendor.n($data.resultStatus),
    e: common_vendor.t($data.resultTitle),
    f: common_vendor.t($data.resultDesc),
    g: $data.resultStatus === "loading"
  }, $data.resultStatus === "loading" ? {
    h: common_vendor.o((...args) => $options.checkResult && $options.checkResult(...args), "40")
  } : {}, {
    i: $data.resultStatus === "fail"
  }, $data.resultStatus === "fail" ? {
    j: common_vendor.o((...args) => $options.retryVerify && $options.retryVerify(...args), "78")
  } : {}, {
    k: $data.resultStatus === "success"
  }, $data.resultStatus === "success" ? {
    l: common_vendor.o((...args) => $options.goBack && $options.goBack(...args), "bd")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-aad8bf2b"]]);
xhs.createPage(MiniProgramPage);
