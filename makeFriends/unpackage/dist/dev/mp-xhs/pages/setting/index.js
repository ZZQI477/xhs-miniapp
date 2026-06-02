"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {},
      isHidden: false
    };
  },
  onLoad() {
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await api_index.getUserInfo();
        this.userInfo = res.data;
        this.isHidden = res.data.is_hidden || false;
      } catch (e) {
        console.error("加载用户信息失败", e);
      }
    },
    // 复制UID
    copyUID() {
      if (!this.userInfo.uid) {
        common_vendor.index.showToast({
          title: "数据未加载",
          icon: "none"
        });
        return;
      }
      common_vendor.index.setClipboardData({
        data: this.userInfo.uid,
        success: () => {
          common_vendor.index.showToast({
            title: "复制成功",
            icon: "success"
          });
        }
      });
    },
    // 切换隐身状态
    toggleHidden(e) {
      this.isHidden = e.detail.value;
      common_vendor.index.showToast({
        title: this.isHidden ? "已开启隐身" : "已关闭隐身",
        icon: "success"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.isHidden,
    b: common_vendor.o((...args) => $options.toggleHidden && $options.toggleHidden(...args), "62"),
    c: common_vendor.t($data.userInfo.uid || "加载中..."),
    d: common_vendor.o((...args) => $options.copyUID && $options.copyUID(...args), "69")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-861f37f2"]]);
xhs.createPage(MiniProgramPage);
