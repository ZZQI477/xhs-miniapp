"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_guestAuth = require("../../utils/guestAuth.js");
const utils_websocket = require("../../utils/websocket.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const ChatMessage = () => "../../components/chat-message.js";
const ChatInput = () => "../../components/chat-input.js";
const _sfc_main = {
  name: "ChatDetail",
  components: {
    CustomNavBar,
    ChatMessage,
    ChatInput
  },
  data() {
    return {
      toUserId: "",
      conversationId: "",
      isGuest: false,
      targetUser: {
        id: "",
        nickname: "",
        avatar: "",
        age: 0,
        city: "",
        is_online: false
      },
      messages: [],
      page: 1,
      pageSize: 20,
      hasMoreHistory: true,
      loadingHistory: false,
      scrollToId: "",
      selfUserId: "",
      selfAvatar: "",
      isVip: false,
      showUserModal: false,
      inputDisabled: false
    };
  },
  computed: {
    inputPlaceholder() {
      return `发送消息给${this.targetUser.nickname || "对方"}...`;
    }
  },
  onLoad(options) {
    this.toUserId = options.to_user_id || "";
    this.conversationId = options.conversation_id || options.session_id || "";
    this.isGuest = utils_guestAuth.isGuest() || options.guest === "1";
    this.selfUserId = utils_guestAuth.getCurrentUserId();
    const userinfo = common_vendor.index.getStorageSync("userinfo");
    if (userinfo) {
      this.selfAvatar = userinfo.avatar || "";
      this.isVip = userinfo.is_vip || false;
    } else if (this.isGuest) {
      const guestInfo = utils_guestAuth.getGuestUserInfo();
      this.selfAvatar = (guestInfo == null ? void 0 : guestInfo.avatar) || "";
    }
    this.loadHistory();
    this.initWebSocket();
    if (this.conversationId) {
      this.markAsRead();
    }
  },
  onShow() {
    utils_websocket.initWebSocket();
  },
  onUnload() {
    utils_websocket.offMessage(this.handleNewMessage);
  },
  methods: {
    async loadHistory() {
      var _a, _b, _c, _d, _e;
      this.loadingHistory = true;
      try {
        if (this.toUserId) {
          const sessionRes = await api_index.getOrCreateSession({ target_id: this.toUserId });
          if (!this.conversationId) {
            this.conversationId = ((_a = sessionRes.data) == null ? void 0 : _a.session_id) || ((_b = sessionRes.data) == null ? void 0 : _b.id) || "";
          }
          if ((_c = sessionRes.data) == null ? void 0 : _c.target_user) {
            this.targetUser = {
              ...this.targetUser,
              ...sessionRes.data.target_user
            };
          }
        }
        const res = await api_index.getChatMessages({
          session_id: this.conversationId,
          page: this.page,
          limit: this.pageSize
        });
        const list = ((_d = res.data) == null ? void 0 : _d.list) || res.list || [];
        const processedList = list.map((msg) => ({
          id: msg.id,
          from_id: msg.from_id,
          to_id: msg.to_id,
          content: msg.content,
          msg_type: msg.type,
          // type -> msg_type
          is_self: msg.is_self,
          is_read: msg.is_read,
          created_at: msg.createtime * 1e3,
          // 转换为毫秒
          time_text: msg.time_text,
          session_id: msg.session_id,
          status: "sent"
          // 历史消息默认已发送
        })).sort((a, b) => b.created_at - a.created_at);
        if (this.page === 1) {
          this.messages = processedList.reverse();
          this.scrollToBottom();
        } else {
          this.messages = [...processedList.reverse(), ...this.messages];
        }
        const total = ((_e = res.data) == null ? void 0 : _e.total) || res.total || 0;
        this.hasMoreHistory = this.messages.length < total;
        this.page++;
      } catch (e) {
        console.error("[ChatDetail] 加载历史失败", e);
        common_vendor.index.showToast({ title: e.msg || "加载失败", icon: "none" });
      } finally {
        this.loadingHistory = false;
      }
    },
    initWebSocket() {
      utils_websocket.initWebSocket();
      utils_websocket.onMessage(this.handleNewMessage);
    },
    handleNewMessage(message) {
      console.log("[ChatDetail] 收到新消息", message);
      if (message.type !== "chat")
        return;
      const isCurrentSession = message.session_id && message.session_id == this.conversationId;
      const isFromTarget = message.from_id == this.toUserId || message.to_id == this.toUserId;
      const isFromAdmin = message.from_id < 0 || message.from_user && message.from_user.is_admin;
      if (!isCurrentSession && !isFromTarget && !isFromAdmin)
        return;
      if (message.is_self || message.from_id == this.selfUserId) {
        const tempIndex = this.messages.findIndex(
          (m) => m.id && m.id.startsWith("temp_") && m.from_id == this.selfUserId && m.content === message.content && Math.abs(m.created_at - (message.created_at || (message.createtime ? message.createtime * 1e3 : 0))) < 6e4
        );
        if (tempIndex > -1) {
          this.$set(this.messages, tempIndex, {
            ...this.messages[tempIndex],
            id: message.message_id || message.id || this.messages[tempIndex].id,
            status: "sent",
            is_read: message.is_read,
            created_at: message.created_at || (message.createtime ? message.createtime * 1e3 : this.messages[tempIndex].created_at)
          });
          return;
        }
      }
      const msgType = message.msg_type || (message.type === "chat" ? "text" : message.type) || "text";
      const newMsg = {
        id: message.message_id || message.id,
        from_id: message.from_id,
        to_id: message.to_id,
        content: message.content,
        msg_type: msgType,
        is_self: false,
        created_at: message.created_at || (message.createtime ? message.createtime * 1e3 : Date.now()),
        status: "sent"
      };
      if (message.from_user) {
        newMsg.sender_avatar = message.from_user.avatar || "";
        newMsg.sender_nickname = message.from_user.nickname || "";
      }
      const exists = this.messages.some((m) => m.id && m.id == newMsg.id);
      if (exists)
        return;
      this.messages.push(newMsg);
      this.scrollToBottom();
      if (this.conversationId) {
        this.markAsRead();
      }
    },
    async handleSendText(data) {
      var _a, _b, _c;
      const message = {
        to_id: this.toUserId,
        content: data.content,
        msg_type: data.type || "text",
        session_id: this.conversationId,
        created_at: Date.now(),
        status: "sending"
      };
      const tempId = `temp_${Date.now()}`;
      message.id = tempId;
      message.from_id = this.selfUserId;
      message.is_self = true;
      this.messages.push(message);
      this.scrollToBottom();
      const updateMsgStatus = (tempId2, status) => {
        const msgIndex = this.messages.findIndex((m) => m.id === tempId2);
        if (msgIndex > -1) {
          this.$set(this.messages[msgIndex], "status", status);
        }
      };
      try {
        const res = await api_index.sendChatMessage({
          target_id: this.toUserId,
          content: data.content
        });
        const msgIndex = this.messages.findIndex((m) => m.id === tempId);
        if (msgIndex > -1) {
          this.$set(this.messages, msgIndex, {
            ...this.messages[msgIndex],
            id: ((_a = res.data) == null ? void 0 : _a.message_id) || this.messages[msgIndex].id,
            session_id: ((_b = res.data) == null ? void 0 : _b.session_id) || this.conversationId,
            status: "sent"
          });
        }
        if (((_c = res.data) == null ? void 0 : _c.session_id) && !this.conversationId) {
          this.conversationId = res.data.session_id;
        }
      } catch (e) {
        console.error("[ChatDetail] 发送消息失败", e);
        updateMsgStatus(tempId, "failed");
        common_vendor.index.showToast({ title: e.msg || "发送失败", icon: "none" });
      }
    },
    async handleSendImage(data) {
      var _a, _b;
      common_vendor.index.showLoading({ title: "发送中..." });
      try {
        const uploadRes = await api_index.uploadImage(data.content);
        const imageUrl = ((_a = uploadRes.data) == null ? void 0 : _a.url) || ((_b = uploadRes.data) == null ? void 0 : _b.full_url) || "";
        if (!imageUrl) {
          throw new Error("上传返回地址为空");
        }
        await this.handleSendText({
          content: imageUrl,
          type: "image"
        });
      } catch (e) {
        console.error("[ChatDetail] 发送图片失败", e);
        common_vendor.index.showToast({ title: e.msg || "发送失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    scrollToBottom() {
      setTimeout(() => {
        this.scrollToId = "msg_bottom";
      }, 100);
    },
    shouldShowTime(index) {
      if (index === 0)
        return true;
      const currentMsg = this.messages[index];
      const prevMsg = this.messages[index - 1];
      if (!currentMsg.created_at || !prevMsg.created_at)
        return false;
      const diff = currentMsg.created_at - prevMsg.created_at;
      return diff > 5 * 60 * 1e3;
    },
    async markAsRead() {
      try {
        await api_index.markChatRead({ session_id: this.conversationId });
      } catch (e) {
        console.error("[ChatDetail] 标记已读失败", e);
      }
    },
    showUserDetail() {
      this.showUserModal = true;
    },
    closeUserModal() {
      this.showUserModal = false;
    },
    goUserProfile() {
      this.closeUserModal();
      common_vendor.index.navigateTo({
        url: `/pages/user/detail?id=${this.toUserId}`
      });
    },
    goAddFriend() {
      this.closeUserModal();
      common_vendor.index.showModal({
        title: "发起好友申请",
        content: "消耗10脱单币发起好友申请，对方同意后可查看联系方式",
        confirmText: "确认申请",
        success: async (res) => {
          if (res.confirm) {
            common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
          }
        }
      });
    },
    goLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/index"
      });
    }
  }
};
if (!Array) {
  const _component_custom_nav_bar = common_vendor.resolveComponent("custom-nav-bar");
  const _component_chat_message = common_vendor.resolveComponent("chat-message");
  const _component_chat_input = common_vendor.resolveComponent("chat-input");
  (_component_custom_nav_bar + _component_chat_message + _component_chat_input)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      title: $data.targetUser.nickname || "聊天",
      isShowBack: true,
      backgroundImage: "/static/bg3.png"
    }),
    b: $data.isGuest
  }, $data.isGuest ? {
    c: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args), "e6")
  } : {}, {
    d: $data.hasMoreHistory
  }, $data.hasMoreHistory ? common_vendor.e({
    e: $data.loadingHistory
  }, $data.loadingHistory ? {} : {}, {
    f: common_vendor.o((...args) => $options.loadHistory && $options.loadHistory(...args), "a7")
  }) : {}, {
    g: common_vendor.f($data.messages, (msg, index, i0) => {
      return {
        a: "ee06274a-1-" + i0,
        b: common_vendor.p({
          message: msg,
          selfAvatar: $data.selfAvatar,
          targetAvatar: $data.targetUser.avatar,
          selfUserId: $data.selfUserId,
          showTime: $options.shouldShowTime(index)
        }),
        c: msg.id || `temp_${index}`,
        d: `msg_${msg.id || index}`
      };
    }),
    h: $data.scrollToId,
    i: common_vendor.sr("chatInput", "ee06274a-2"),
    j: common_vendor.j({
      "send": common_vendor.o($options.handleSendText, "a8"),
      "sendImage": common_vendor.o($options.handleSendImage, "6d")
    }),
    k: common_vendor.p({
      placeholder: $options.inputPlaceholder,
      isVip: $data.isVip,
      disabled: $data.inputDisabled
    }),
    l: $data.showUserModal
  }, $data.showUserModal ? {
    m: common_vendor.o((...args) => $options.closeUserModal && $options.closeUserModal(...args), "4a")
  } : {}, {
    n: $data.showUserModal
  }, $data.showUserModal ? common_vendor.e({
    o: $data.targetUser.avatar || "/static/logo.png",
    p: common_vendor.t($data.targetUser.nickname || "匿名用户"),
    q: common_vendor.t($data.targetUser.age || "?"),
    r: common_vendor.t($data.targetUser.city || "未知"),
    s: common_vendor.o((...args) => $options.goUserProfile && $options.goUserProfile(...args), "e6"),
    t: !$data.isGuest
  }, !$data.isGuest ? {
    v: common_vendor.o((...args) => $options.goAddFriend && $options.goAddFriend(...args), "e9")
  } : {}, {
    w: common_vendor.o((...args) => $options.closeUserModal && $options.closeUserModal(...args), "15")
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ee06274a"]]);
xhs.createPage(MiniProgramPage);
