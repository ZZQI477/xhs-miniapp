"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_config = require("../../utils/config.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: { CustomNavBar },
  data() {
    return {
      casesInfo: {},
      content: ""
    };
  },
  methods: {},
  async onLoad(options) {
    const res = await api_index.getCasesDetail(options.id);
    common_vendor.index.__f__("log", "at pages/cases/detail.vue:34", res);
    if (res.code == 1) {
      this.casesInfo = res.data ? res.data : "";
      const IMG_DOMAIN = utils_config.config.curlRef;
      this.content = res.data.content.replace(/<img([^>]+)src="([^"]+)"/g, (m, p1, src) => `<img${p1}src="${IMG_DOMAIN}${src}"`);
    }
  }
};
if (!Array) {
  const _component_custom_nav_bar = common_vendor.resolveComponent("custom-nav-bar");
  _component_custom_nav_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      title: "案例详情",
      isShowBack: true,
      fontColor: "#6853F0",
      backgroundColor: "transparent"
    }),
    b: $data.content
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-741f07e9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/cases/detail.js.map
