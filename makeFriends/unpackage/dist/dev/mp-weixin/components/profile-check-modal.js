"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "ProfileCheckModal",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    percent: {
      type: Number,
      default: 0
    },
    missingFields: {
      type: Array,
      default: () => []
    }
  },
  emits: ["confirm", "dismiss"],
  computed: {
    missingFieldsText() {
      return this.missingFields.join("、");
    },
    modalDesc() {
      if (this.missingFields.length > 0) {
        return "基础信息未完成，请先补齐关键信息后再继续使用。";
      }
      return "完善资料获得更多曝光和匹配推荐，让更多人看到你！";
    }
  },
  methods: {
    handleConfirm() {
      this.$emit("confirm");
    },
    handleDismiss() {
      this.$emit("dismiss");
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? common_vendor.e({
    b: $props.percent + "%",
    c: common_vendor.t($props.percent),
    d: common_vendor.t($options.modalDesc),
    e: $props.missingFields.length > 0
  }, $props.missingFields.length > 0 ? {
    f: common_vendor.t($options.missingFieldsText)
  } : {}, {
    g: common_vendor.o((...args) => $options.handleConfirm && $options.handleConfirm(...args), "7a"),
    h: common_vendor.o((...args) => $options.handleDismiss && $options.handleDismiss(...args), "9e"),
    i: common_vendor.o(() => {
    }, "04"),
    j: common_vendor.o((...args) => $options.handleDismiss && $options.handleDismiss(...args), "1a")
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-73c140bc"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/profile-check-modal.js.map
