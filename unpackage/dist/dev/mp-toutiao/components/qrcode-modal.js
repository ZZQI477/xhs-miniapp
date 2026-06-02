"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "QrcodeModal",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    qrcodeUrl: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: "告白时刻Daily公众号"
    }
  },
  emits: ["close"],
  methods: {
    handleClose() {
      this.$emit("close");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: $props.qrcodeUrl,
    c: common_vendor.t($props.title),
    d: common_vendor.o(() => {
    }, "bf"),
    e: common_vendor.o((...args) => $options.handleClose && $options.handleClose(...args), "61")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-01961970"]]);
tt.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-toutiao/components/qrcode-modal.js.map
