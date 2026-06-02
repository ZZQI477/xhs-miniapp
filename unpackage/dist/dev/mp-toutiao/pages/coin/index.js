"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      coinBalance: 0,
      isRechargeVisible: false,
      selectedPackage: null,
      isAgreed: false,
      packages: []
    };
  },
  onLoad() {
    this.loadCoinBalance();
    this.loadPackages();
  },
  onShow() {
    this.loadCoinBalance();
  },
  methods: {
    // 加载脱单币余额
    async loadCoinBalance() {
      var _a;
      try {
        const res = await api_index.getUserInfo();
        this.coinBalance = ((_a = res.data.userinfo) == null ? void 0 : _a.score) || 0;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/coin/index.vue:82", "加载余额失败", e);
      }
    },
    // 加载充值套餐
    async loadPackages() {
      try {
        const res = await api_index.getPackages();
        this.packages = res.data.list || [];
        const hotPkg = this.packages.find((p) => p.is_hot);
        if (hotPkg) {
          this.selectedPackage = hotPkg;
        } else if (this.packages.length > 0) {
          this.selectedPackage = this.packages[0];
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/coin/index.vue:99", "加载套餐失败", e);
      }
    },
    showRecharge() {
      this.isRechargeVisible = true;
    },
    hideRecharge() {
      this.isRechargeVisible = false;
    },
    selectPackage(pkg) {
      this.selectedPackage = pkg;
    },
    // 切换协议同意状态
    toggleAgreement() {
      this.isAgreed = !this.isAgreed;
    },
    // 协议勾选变化
    onAgreementChange(e) {
      this.isAgreed = e.detail.value.length > 0;
    },
    // 确认充值
    async confirmRecharge() {
      if (!this.isAgreed) {
        common_vendor.index.showToast({
          title: "请同意充值服务协议",
          icon: "none"
        });
        return;
      }
      if (!this.selectedPackage) {
        common_vendor.index.showToast({
          title: "请选择充值套餐",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "正在创建订单..." });
        const orderRes = await api_index.createOrder({ package_id: this.selectedPackage.id });
        const orderNo = orderRes.data.order_no;
        const payRes = await api_index.wxPay({ order_no: orderNo });
        common_vendor.index.hideLoading();
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: e.msg || "充值失败",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0$5,
    b: common_vendor.t($data.coinBalance),
    c: common_assets._imports_1$4,
    d: common_vendor.o((...args) => $options.showRecharge && $options.showRecharge(...args), "dd"),
    e: $data.isRechargeVisible
  }, $data.isRechargeVisible ? {
    f: common_vendor.o((...args) => $options.hideRecharge && $options.hideRecharge(...args), "15"),
    g: common_vendor.f($data.packages, (pkg, k0, i0) => {
      return common_vendor.e({
        a: pkg.is_hot
      }, pkg.is_hot ? {} : {}, {
        b: common_vendor.t(pkg.coin),
        c: common_vendor.t(pkg.price),
        d: $data.selectedPackage && $data.selectedPackage.id === pkg.id ? 1 : "",
        e: pkg.id,
        f: common_vendor.o(($event) => $options.selectPackage(pkg), "1e")
      });
    }),
    h: !$data.isAgreed || !$data.selectedPackage,
    i: common_vendor.o((...args) => $options.confirmRecharge && $options.confirmRecharge(...args), "ad"),
    j: $data.isAgreed,
    k: common_vendor.o((...args) => $options.onAgreementChange && $options.onAgreementChange(...args), "6c"),
    l: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args), "f3")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-aab969b6"]]);
tt.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-toutiao/pages/coin/index.js.map
