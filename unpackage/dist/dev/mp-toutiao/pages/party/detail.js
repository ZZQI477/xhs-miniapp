"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_config = require("../../utils/config.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: { CustomNavBar },
  data() {
    return {
      noteInfo: {},
      content: ""
    };
  },
  methods: {},
  async onLoad(options) {
    const res = await api_index.getPartyDetail(options.id);
    common_vendor.index.__f__("log", "at pages/party/detail.vue:34", res);
    if (res.code == 1) {
      this.noteInfo = res.data ? res.data : "";
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
      title: "活动详情",
      isShowBack: true,
      fontColor: "#6853F0",
      backgroundColor: "transparent"
    }),
    b: $data.content
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f4e37d4b"]]);
tt.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-toutiao/pages/party/detail.js.map
