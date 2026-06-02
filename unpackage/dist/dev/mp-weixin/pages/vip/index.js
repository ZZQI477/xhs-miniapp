"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      packages: [
        {
          name: "1个月",
          price: 68,
          original_price: 98,
          daily_price: "2.3",
          duration: 1,
          is_hot: false
        },
        {
          name: "3个月",
          price: 168,
          original_price: 294,
          daily_price: "1.9",
          duration: 3,
          is_hot: true
        },
        {
          name: "6个月",
          price: 298,
          original_price: 588,
          daily_price: "1.6",
          duration: 6,
          is_hot: false
        },
        {
          name: "12个月",
          price: 498,
          original_price: 1176,
          daily_price: "1.4",
          duration: 12,
          is_hot: false
        }
      ],
      selectedPackage: 1
      // 默认选中第二个（推荐）
    };
  },
  onLoad() {
  },
  methods: {
    // 加载VIP套餐
    async loadPackages() {
      try {
        const res = await api_index.getPackages();
        if (res.data.list && res.data.list.length > 0) {
          this.packages = res.data.list;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/vip/index.vue:134", "加载套餐失败", e);
      }
    },
    // 选择套餐
    selectPackage(index) {
      this.selectedPackage = index;
    },
    // 购买VIP
    async handleBuy() {
      const pkg = this.packages[this.selectedPackage];
      common_vendor.index.showLoading({ title: "正在创建订单..." });
      try {
        const orderRes = await api_index.createOrder({
          type: "vip",
          package_id: this.selectedPackage,
          duration: pkg.duration,
          amount: pkg.price
        });
        common_vendor.index.hideLoading();
        const payRes = await api_index.wxPay({
          order_id: orderRes.data.order_id
        });
        common_vendor.index.requestPayment({
          provider: "wxpay",
          timeStamp: payRes.data.timeStamp,
          nonceStr: payRes.data.nonceStr,
          package: payRes.data.package,
          signType: payRes.data.signType,
          paySign: payRes.data.paySign,
          success: () => {
            common_vendor.index.showToast({ title: "开通成功", icon: "success" });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1500);
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/vip/index.vue:198", "支付失败", err);
            common_vendor.index.showToast({ title: "支付取消", icon: "none" });
          }
        });
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: e.msg || "创建订单失败",
          icon: "none"
        });
      }
    },
    // 打开协议
    openAgreement() {
      common_vendor.index.navigateTo({
        url: "/pages/agreement/vip"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.packages, (pkg, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(pkg.name),
        b: common_vendor.t(pkg.price),
        c: pkg.original_price
      }, pkg.original_price ? {
        d: common_vendor.t(pkg.original_price)
      } : {}, {
        e: common_vendor.t(pkg.daily_price),
        f: $data.selectedPackage === index ? 1 : "",
        g: pkg.is_hot ? 1 : "",
        h: index,
        i: common_vendor.o(($event) => $options.selectPackage(index), index)
      });
    }),
    b: common_vendor.o((...args) => $options.handleBuy && $options.handleBuy(...args), "97"),
    c: common_vendor.o((...args) => $options.openAgreement && $options.openAgreement(...args), "3e")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-6073b5bd"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/vip/index.js.map
