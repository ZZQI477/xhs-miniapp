"use strict";
const common_vendor = require("../common/vendor.js");
const utils_guestAuth = require("../utils/guestAuth.js");
const _sfc_main = {
  name: "ChatMessage",
  props: {
    message: {
      type: Object,
      required: true
    },
    selfAvatar: {
      type: String,
      default: ""
    },
    targetAvatar: {
      type: String,
      default: ""
    },
    selfUserId: {
      type: String,
      default: ""
    },
    showTime: {
      type: Boolean,
      default: false
    },
    showStatus: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    isSelf() {
      if (this.message.is_self !== void 0) {
        return this.message.is_self;
      }
      const currentUserId = this.selfUserId || utils_guestAuth.getCurrentUserId();
      return this.message.from_id === currentUserId || this.message.from_id == currentUserId;
    },
    senderAvatar() {
      if (this.message.sender_avatar) {
        return this.message.sender_avatar || "/static/logo.png";
      }
      return this.targetAvatar || "/static/logo.png";
    },
    displayTime() {
      if (this.message.time_text) {
        return this.message.time_text;
      }
      return this.formatTime(this.message.created_at);
    },
    statusText() {
      const statusMap = {
        sending: "发送中",
        sent: "",
        delivered: "已送达",
        read: "已读",
        failed: "发送失败"
      };
      return statusMap[this.message.status] || "";
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const isToday = date.toDateString() === now.toDateString();
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      if (isToday) {
        return `${hours}:${minutes}`;
      } else {
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${month}-${day} ${hours}:${minutes}`;
      }
    },
    previewImage(url) {
      if (!url)
        return;
      common_vendor.index.previewImage({
        urls: [url],
        current: url
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.showTime
  }, $props.showTime ? {
    b: common_vendor.t($options.displayTime)
  } : {}, {
    c: !$options.isSelf
  }, !$options.isSelf ? {
    d: $options.senderAvatar
  } : {}, {
    e: $props.message.msg_type === "text"
  }, $props.message.msg_type === "text" ? {
    f: common_vendor.t($props.message.content)
  } : $props.message.msg_type === "image" ? {
    h: $props.message.content,
    i: common_vendor.o(($event) => $options.previewImage($props.message.content), "be")
  } : $props.message.msg_type === "system" ? {
    k: common_vendor.t($props.message.content)
  } : {}, {
    g: $props.message.msg_type === "image",
    j: $props.message.msg_type === "system",
    l: $options.isSelf && $props.showStatus
  }, $options.isSelf && $props.showStatus ? {
    m: common_vendor.t($options.statusText),
    n: common_vendor.n($props.message.status)
  } : {}, {
    o: $options.isSelf ? 1 : "",
    p: $options.isSelf
  }, $options.isSelf ? {
    q: $props.selfAvatar || "/static/logo.png"
  } : {}, {
    r: $options.isSelf ? 1 : ""
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-15c2fc31"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/chat-message.js.map
