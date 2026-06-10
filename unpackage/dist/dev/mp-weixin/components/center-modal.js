"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "CenterModal",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "提示"
    },
    content: {
      type: String,
      default: ""
    },
    confirmText: {
      type: String,
      default: "确定"
    },
    cancelText: {
      type: String,
      default: "取消"
    }
  },
  emits: ["confirm", "cancel", "update:visible"],
  computed: {
    contentLines() {
      return this.content.split("\n").filter((line) => line.trim() !== "");
    }
  },
  methods: {
    handleConfirm() {
      this.$emit("confirm");
      this.$emit("update:visible", false);
    },
    handleCancel() {
      this.$emit("cancel");
      this.$emit("update:visible", false);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: common_vendor.t($props.title),
    c: common_vendor.f($options.contentLines, (line, index, i0) => {
      return {
        a: common_vendor.t(line),
        b: index
      };
    }),
    d: common_vendor.t($props.cancelText),
    e: common_vendor.o((...args) => $options.handleCancel && $options.handleCancel(...args), "15"),
    f: common_vendor.t($props.confirmText),
    g: common_vendor.o((...args) => $options.handleConfirm && $options.handleConfirm(...args), "4b"),
    h: common_vendor.o(() => {
    }, "98"),
    i: common_vendor.o((...args) => $options.handleCancel && $options.handleCancel(...args), "86")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d8a73f90"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/center-modal.js.map
