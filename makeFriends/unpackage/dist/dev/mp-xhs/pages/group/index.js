"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: {
    CustomNavBar
  },
  data() {
    return {
      list: [],
      loading: false,
      showQrcode: false,
      currentQrcode: ""
    };
  },
  onLoad() {
    this.loadData();
  },
  onPullDownRefresh() {
    this.loadData().then(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const res = await api_index.getGroups();
        this.list = res.data.list || [];
      } catch (e) {
        console.error("加载失败", e);
      } finally {
        this.loading = false;
      }
    },
    onGroupTap(item) {
      if (item.qrcode) {
        this.currentQrcode = item.qrcode;
        this.showQrcode = true;
      } else {
        common_vendor.index.showToast({ title: "暂无群二维码", icon: "none" });
      }
    },
    joinGroupFree() {
      if (this.list.length > 0 && this.list[0].qrcode) {
        this.currentQrcode = this.list[0].qrcode;
        this.showQrcode = true;
      } else {
        common_vendor.index.showToast({ title: "暂无可加入的群", icon: "none" });
      }
    },
    goSingle() {
      this.showQrcode = false;
      common_vendor.index.switchTab({
        url: "/pages/single/index"
      });
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
if (!Array) {
  const _component_custom_nav_bar = common_vendor.resolveComponent("custom-nav-bar");
  _component_custom_nav_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      title: "同城单身群",
      backgroundImage: "/static/bg3.png"
    }),
    b: $data.list.length > 0
  }, $data.list.length > 0 ? {
    c: common_vendor.f($data.list, (item, index, i0) => {
      return {
        a: item.qrcode || "/static/logo.png",
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.member_count || 0),
        d: common_vendor.t(item.city),
        e: index,
        f: common_vendor.o(($event) => $options.onGroupTap(item), index)
      };
    }),
    d: common_assets._imports_0$8
  } : !$data.loading ? {} : {}, {
    e: !$data.loading,
    f: common_vendor.o((...args) => $options.goSingle && $options.goSingle(...args), "99"),
    g: common_vendor.o((...args) => $options.joinGroupFree && $options.joinGroupFree(...args), "e1"),
    h: $data.showQrcode
  }, $data.showQrcode ? {
    i: $data.currentQrcode,
    j: common_vendor.o((...args) => $options.goSingle && $options.goSingle(...args), "f2"),
    k: common_vendor.o(() => {
    }, "9d"),
    l: common_vendor.o(($event) => $data.showQrcode = false, "f6")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-191b8d1f"]]);
xhs.createPage(MiniProgramPage);
