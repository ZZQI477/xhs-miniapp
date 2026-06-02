"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: { CustomNavBar },
  data() {
    return {};
  },
  methods: {
    // 切换Tab
    switchTab(tab) {
      if (tab === 0) {
        common_vendor.index.navigateTo({
          url: "/pages/party/index"
        });
      } else if (tab === 1) {
        common_vendor.index.navigateTo({
          url: "/pages/cases/index"
        });
      }
    }
  },
  onShow() {
  }
};
if (!Array) {
  const _component_custom_nav_bar = common_vendor.resolveComponent("custom-nav-bar");
  _component_custom_nav_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      title: "活动",
      isShowBack: true,
      fontColor: "black",
      backgroundColor: "transparent"
    }),
    b: common_assets._imports_0$9,
    c: common_vendor.o(($event) => $options.switchTab(0), "d4"),
    d: common_assets._imports_1$6,
    e: common_vendor.o(($event) => $options.switchTab(1), "11")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0ded373b"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/action/index.js.map
