"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      authStatus: {
        is_verified: false,
        is_realface: false,
        is_education: false,
        idcard_auth: null,
        face_auth: null,
        edu_auth: null
      }
    };
  },
  computed: {
    // 实名+真人认证是否已通过
    isVerifyPassed() {
      return this.authStatus.is_verified && this.authStatus.is_realface;
    },
    // 合并后的认证状态
    verifyStatusClass() {
      var _a;
      if (this.isVerifyPassed)
        return "passed";
      const idcardStatus = (_a = this.authStatus.idcard_auth) == null ? void 0 : _a.status;
      if (idcardStatus === "verifying")
        return "pending";
      if (idcardStatus === "pending")
        return "pending";
      if (idcardStatus === "rejected")
        return "rejected";
      if (this.authStatus.is_verified && !this.authStatus.is_realface)
        return "pending";
      return "unauth";
    },
    verifyStatusText() {
      var _a;
      if (this.isVerifyPassed)
        return "已认证";
      const idcardStatus = (_a = this.authStatus.idcard_auth) == null ? void 0 : _a.status;
      if (idcardStatus === "verifying")
        return "认证中";
      if (idcardStatus === "pending")
        return "审核中";
      if (idcardStatus === "rejected")
        return "未通过";
      if (this.authStatus.is_verified && !this.authStatus.is_realface)
        return "部分完成";
      return "去验证";
    },
    // 学历认证状态
    eduStatusClass() {
      var _a, _b;
      if (this.authStatus.is_education)
        return "passed";
      if (((_a = this.authStatus.edu_auth) == null ? void 0 : _a.status) === "pending")
        return "pending";
      if (((_b = this.authStatus.edu_auth) == null ? void 0 : _b.status) === "rejected")
        return "rejected";
      return "unauth";
    },
    eduStatusText() {
      var _a, _b;
      if (this.authStatus.is_education)
        return "已认证";
      if (((_a = this.authStatus.edu_auth) == null ? void 0 : _a.status) === "pending")
        return "审核中";
      if (((_b = this.authStatus.edu_auth) == null ? void 0 : _b.status) === "rejected")
        return "未通过";
      return "去验证";
    }
  },
  onLoad() {
    this.loadAuthStatus();
  },
  onShow() {
    this.loadAuthStatus();
  },
  methods: {
    async loadAuthStatus() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_index.getAuthStatus();
        this.authStatus = res.data;
      } catch (e) {
        console.error("加载认证状态失败", e);
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 进入实名真人认证
    goFaceVerify() {
      var _a;
      if (this.isVerifyPassed) {
        common_vendor.index.showToast({ title: "您已完成实名真人认证", icon: "none" });
        return;
      }
      const idcardStatus = (_a = this.authStatus.idcard_auth) == null ? void 0 : _a.status;
      if (idcardStatus === "pending") {
        common_vendor.index.showToast({ title: "您的申请正在审核中", icon: "none" });
        return;
      }
      if (idcardStatus === "rejected") {
        common_vendor.index.showModal({
          title: "认证未通过",
          content: this.authStatus.idcard_auth.reject_reason || "请重新提交认证",
          confirmText: "重新认证",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/auth/idcard" });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/auth/idcard" });
    },
    // 进入学历认证
    goEduAuth() {
      var _a, _b;
      if (this.authStatus.is_education) {
        common_vendor.index.showToast({ title: "您已完成学历认证", icon: "none" });
        return;
      }
      if (((_a = this.authStatus.edu_auth) == null ? void 0 : _a.status) === "pending") {
        common_vendor.index.showToast({ title: "您的申请正在审核中", icon: "none" });
        return;
      }
      if (((_b = this.authStatus.edu_auth) == null ? void 0 : _b.status) === "rejected") {
        common_vendor.index.showModal({
          title: "认证被拒绝",
          content: this.authStatus.edu_auth.reject_reason || "请重新提交认证",
          confirmText: "重新认证",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/auth/edu" });
            }
          }
        });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/auth/edu" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.verifyStatusText),
    b: common_vendor.n($options.verifyStatusClass),
    c: common_vendor.o((...args) => $options.goFaceVerify && $options.goFaceVerify(...args), "11"),
    d: common_vendor.t($options.eduStatusText),
    e: common_vendor.n($options.eduStatusClass),
    f: common_vendor.o((...args) => $options.goEduAuth && $options.goEduAuth(...args), "a3")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-3f748249"]]);
xhs.createPage(MiniProgramPage);
