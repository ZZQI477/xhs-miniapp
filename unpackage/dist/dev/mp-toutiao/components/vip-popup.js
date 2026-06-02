"use strict";
const common_vendor = require("../common/vendor.js");
const api_index = require("../api/index.js");
const common_assets = require("../common/assets.js");
const _sfc_main = {
  name: "VipPopup",
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedIndex: -1,
      // 默认选中推荐套餐
      agreeProtocol: false,
      packages: []
    };
  },
  watch: {
    visible(newVal) {
      if (newVal && this.packages.length === 0) {
        this.loadPackages();
      }
    }
  },
  methods: {
    // 加载VIP套餐
    async loadPackages() {
      try {
        const res = await api_index.getVipPackages();
        if (res.code === 1 && res.data.list) {
          this.packages = res.data.list.map((item) => ({
            title: item.name,
            value: parseFloat(item.price),
            subTitle: item.original_price > item.price ? `原价${item.original_price}元` : "",
            type: item.type,
            monthCount: item.duration,
            isRecommended: item.is_recommend === 1
          }));
          const recommendIndex = this.packages.findIndex((p) => p.isRecommended);
          this.selectedIndex = recommendIndex >= 0 ? recommendIndex : 0;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at components/vip-popup.vue:122", "加载VIP套餐失败", e);
        this.packages = [
          {
            title: "1个月",
            value: 68,
            subTitle: "",
            type: "month_1",
            monthCount: 1,
            isRecommended: false
          },
          {
            title: "3个月",
            value: 168,
            subTitle: "原价294元",
            type: "month_3",
            monthCount: 3,
            isRecommended: true
          },
          {
            title: "6个月",
            value: 298,
            subTitle: "原价588元",
            type: "month_6",
            monthCount: 6,
            isRecommended: false
          }
        ];
        this.selectedIndex = 1;
      }
    },
    handleClose() {
      this.$emit("close");
    },
    selectPackage(index) {
      this.selectedIndex = index;
    },
    toggleProtocol() {
      this.agreeProtocol = !this.agreeProtocol;
    },
    openProtocol() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/vip"
      });
    },
    handlePay() {
      if (!this.agreeProtocol) {
        common_vendor.index.showToast({
          title: "请先同意协议",
          icon: "none"
        });
        return;
      }
      const selectedPackage = this.packages[this.selectedIndex];
      this.$emit("pay", selectedPackage);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: common_assets._imports_0$10,
    c: common_vendor.o((...args) => $options.handleClose && $options.handleClose(...args), "fc"),
    d: common_assets._imports_1$7,
    e: common_assets._imports_2$3,
    f: common_assets._imports_3$3,
    g: common_vendor.f($data.packages, (pkg, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(pkg.title),
        b: common_vendor.t(pkg.value),
        c: index !== 0
      }, index !== 0 ? {
        d: common_vendor.t(pkg.subTitle)
      } : {}, {
        e: index,
        f: common_vendor.n({
          active: $data.selectedIndex === index,
          "recommend-type": pkg.isRecommended
        }),
        g: common_vendor.o(($event) => $options.selectPackage(index), "16")
      });
    }),
    h: common_vendor.o((...args) => $options.handlePay && $options.handlePay(...args), "85"),
    i: $data.agreeProtocol ? "/static/images/checked.png" : "/static/images/unchecked.png",
    j: common_vendor.o((...args) => $options.toggleProtocol && $options.toggleProtocol(...args), "c2"),
    k: common_vendor.o((...args) => $options.openProtocol && $options.openProtocol(...args), "dc"),
    l: common_vendor.o(() => {
    }, "18"),
    m: common_vendor.o((...args) => $options.handleClose && $options.handleClose(...args), "a6")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fba9f1e2"]]);
tt.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-toutiao/components/vip-popup.js.map
