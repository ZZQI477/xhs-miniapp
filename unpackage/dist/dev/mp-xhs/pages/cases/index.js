"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: { CustomNavBar },
  data() {
    return {
      currentCity: "深圳",
      cities: ["深圳", "北京", "上海", "广州", "杭州", "成都"],
      casesList: []
    };
  },
  methods: {
    toCasesDetail(id) {
      console.log("id:", id);
      common_vendor.index.navigateTo({
        url: `/pages/cases/detail?id=${id}`
      });
    }
  },
  async onShow() {
    const res = await api_index.getCasesLists();
    console.log(res);
    if (res.code == 1) {
      console.log(res.data.list);
      this.casesList = res.data.list ? res.data.list : "";
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
      title: "成功案例",
      isShowBack: true,
      fontColor: "#6853F0",
      backgroundColor: "transparent"
    }),
    b: common_vendor.f($data.casesList, (item, index, i0) => {
      return common_vendor.e({
        a: item.drawimg
      }, item.drawimg ? {
        b: item.drawimg
      } : item.thumbimg ? {
        d: item.thumbimg
      } : {}, {
        c: item.thumbimg,
        e: common_vendor.t(item.title),
        f: common_vendor.t(item.sub_title),
        g: index,
        h: common_vendor.o(($event) => $options.toCasesDetail(item.caseid), index)
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-178c6e25"]]);
xhs.createPage(MiniProgramPage);
