"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      reasons: [
        "找到对象了，不需要了",
        "使用频率太低",
        "匹配效果不理想",
        "隐私安全担忧",
        "功能不满意",
        "其他原因"
      ],
      selectedReason: -1,
      otherReason: "",
      agreedToCancel: false,
      loading: false
    };
  },
  methods: {
    // 选择注销原因
    selectReason(index) {
      this.selectedReason = index;
      if (index !== this.reasons.length - 1) {
        this.otherReason = "";
      }
    },
    // 切换协议同意状态
    toggleAgreement() {
      this.agreedToCancel = !this.agreedToCancel;
    },
    // 确认注销
    confirmCancel() {
      if (!this.agreedToCancel) {
        common_vendor.index.showToast({
          title: "请先同意注销协议",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showModal({
        title: "确认注销",
        content: "注销后账号信息将被永久删除，无法恢复。确定要注销吗？",
        confirmText: "确定注销",
        confirmColor: "#FF4D4F",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            this.handleCancel();
          }
        }
      });
    },
    // 处理注销
    async handleCancel() {
      this.loading = true;
      try {
        let reason = "";
        if (this.selectedReason >= 0) {
          if (this.selectedReason === this.reasons.length - 1) {
            reason = this.otherReason || "其他原因";
          } else {
            reason = this.reasons[this.selectedReason];
          }
        }
        await api_index.cancelAccount({
          reason
        });
        common_vendor.index.showToast({
          title: "注销成功",
          icon: "success"
        });
        common_vendor.index.clearStorageSync();
        setTimeout(() => {
          common_vendor.index.reLaunch({
            url: "/pages/login/index"
          });
        }, 1500);
      } catch (e) {
        common_vendor.index.showToast({
          title: e.msg || "注销失败，请重试",
          icon: "none"
        });
      } finally {
        this.loading = false;
      }
    },
    // 返回
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.reasons, (reason, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(reason),
        b: $data.selectedReason === index
      }, $data.selectedReason === index ? {} : {}, {
        c: index,
        d: $data.selectedReason === index ? 1 : "",
        e: common_vendor.o(($event) => $options.selectReason(index), index)
      });
    }),
    b: $data.selectedReason === $data.reasons.length - 1
  }, $data.selectedReason === $data.reasons.length - 1 ? {
    c: $data.otherReason,
    d: common_vendor.o(($event) => $data.otherReason = $event.detail.value, "cd"),
    e: common_vendor.t($data.otherReason.length)
  } : {}, {
    f: $data.agreedToCancel
  }, $data.agreedToCancel ? {} : {}, {
    g: $data.agreedToCancel ? 1 : "",
    h: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args), "d9"),
    i: $data.loading,
    j: !$data.agreedToCancel,
    k: common_vendor.o((...args) => $options.confirmCancel && $options.confirmCancel(...args), "45"),
    l: common_vendor.o((...args) => $options.goBack && $options.goBack(...args), "08")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c8f50f4c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/account/cancel.js.map
