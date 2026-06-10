"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "ChatInput",
  props: {
    placeholder: {
      type: String,
      default: "输入消息..."
    },
    maxLength: {
      type: Number,
      default: 500
    },
    isVip: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ["send", "sendImage", "sendWechat"],
  data() {
    return {
      inputText: "",
      showMorePanel: false
    };
  },
  computed: {
    canSend() {
      return this.inputText.trim().length > 0 && !this.disabled;
    }
  },
  methods: {
    handleInput(e) {
      this.inputText = e.detail.value;
    },
    handleFocus() {
      this.showMorePanel = false;
    },
    handleBlur() {
    },
    handleSend() {
      if (!this.canSend)
        return;
      const content = this.inputText.trim();
      this.$emit("send", {
        content,
        type: "text"
      });
      this.inputText = "";
    },
    toggleMorePanel() {
      this.showMorePanel = !this.showMorePanel;
    },
    chooseImage() {
      this.showMorePanel = false;
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          if (tempFilePaths.length > 0) {
            this.$emit("sendImage", {
              content: tempFilePaths[0],
              type: "image"
            });
          }
        },
        fail: (err) => {
          console.error("[ChatInput] 选择图片失败", err);
        }
      });
    },
    sendWechatCard() {
      this.showMorePanel = false;
      this.$emit("sendWechat");
    },
    // 外部调用：聚焦输入框
    focus() {
    },
    // 外部调用：清空输入
    clear() {
      this.inputText = "";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.toggleMorePanel && $options.toggleMorePanel(...args), "90"),
    b: $props.placeholder,
    c: $props.maxLength,
    d: common_vendor.o((...args) => $options.handleSend && $options.handleSend(...args), "35"),
    e: common_vendor.o([($event) => $data.inputText = $event.detail.value, (...args) => $options.handleInput && $options.handleInput(...args)], "0d"),
    f: common_vendor.o((...args) => $options.handleFocus && $options.handleFocus(...args), "fe"),
    g: common_vendor.o((...args) => $options.handleBlur && $options.handleBlur(...args), "64"),
    h: $data.inputText,
    i: $options.canSend ? 1 : "",
    j: common_vendor.o((...args) => $options.handleSend && $options.handleSend(...args), "02"),
    k: $data.showMorePanel
  }, $data.showMorePanel ? common_vendor.e({
    l: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args), "66"),
    m: $props.isVip
  }, $props.isVip ? {
    n: common_vendor.o((...args) => $options.sendWechatCard && $options.sendWechatCard(...args), "8d")
  } : {}) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-69ed8a00"]]);
xhs.createComponent(Component);
