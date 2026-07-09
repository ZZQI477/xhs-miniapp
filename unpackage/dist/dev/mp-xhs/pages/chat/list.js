"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_guestAuth = require("../../utils/guestAuth.js");
const utils_websocket = require("../../utils/websocket.js");
const common_assets = require("../../common/assets.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  name: "ChatList",
  components: {
    CustomNavBar
  },
  data() {
    return {
      conversations: [],
      loading: false,
      loadingMore: false,
      hasMore: true,
      page: 1,
      pageSize: 20,
      isGuest: false,
      showActionSheet: false,
      currentActionItem: null
    };
  },
  onLoad() {
    this.isGuest = utils_guestAuth.isGuest();
    this.loadConversations();
    this.initWebSocket();
  },
  onShow() {
    this.page = 1;
    this.loadConversations();
    utils_websocket.initWebSocket();
  },
  onHide() {
  },
  onUnload() {
    utils_websocket.offMessage(this.handleNewMessage);
    utils_websocket.closeWebSocket();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.hasMore = true;
    this.loadConversations().then(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  methods: {
    async loadConversations() {
      var _a, _b;
      this.loading = true;
      try {
        const res = await api_index.getChatList({
          page: this.page,
          limit: this.pageSize
        });
        const list = ((_a = res.data) == null ? void 0 : _a.list) || res.list || [];
        if (this.page === 1) {
          this.conversations = list;
        } else {
          this.conversations = [...this.conversations, ...list];
        }
        const total = ((_b = res.data) == null ? void 0 : _b.total) || res.total || 0;
        this.hasMore = this.conversations.length < total;
      } catch (e) {
        console.error("[ChatList] 加载会话列表失败", e);
        common_vendor.index.showToast({ title: e.msg || "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (this.loadingMore || !this.hasMore)
        return;
      this.page++;
      this.loadingMore = true;
      this.loadConversations().finally(() => {
        this.loadingMore = false;
      });
    },
    initWebSocket() {
      utils_websocket.initWebSocket();
      utils_websocket.onMessage(this.handleNewMessage);
    },
    handleNewMessage(message) {
      console.log("[ChatList] 收到新消息", message);
      if (message.type === "chat") {
        const convIndex = this.conversations.findIndex(
          (c) => {
            var _a;
            return c.target_id === message.from_id || ((_a = c.target_user) == null ? void 0 : _a.id) === message.from_id;
          }
        );
        if (convIndex > -1) {
          this.conversations[convIndex].last_message = message.content;
          this.conversations[convIndex].last_time = message.createtime || Date.now() / 1e3;
          this.conversations[convIndex].last_time_text = message.time_text || "";
          if (!message.is_self) {
            this.conversations[convIndex].user_unread = (this.conversations[convIndex].user_unread || 0) + 1;
          }
          const conv = this.conversations.splice(convIndex, 1)[0];
          this.conversations.unshift(conv);
        } else {
          this.page = 1;
          this.loadConversations();
        }
      }
    },
    goChatDetail(item) {
      var _a;
      const targetUserId = (_a = item.target_user) == null ? void 0 : _a.id;
      common_vendor.index.navigateTo({
        url: `/pages/chat/detail?to_user_id=${targetUserId}&session_id=${item.session_id || item.id}`
      });
    },
    showItemActions(item) {
      this.currentActionItem = item;
      this.showActionSheet = true;
    },
    closeActionSheet() {
      this.showActionSheet = false;
      this.currentActionItem = null;
    },
    async markAsRead() {
      if (!this.currentActionItem)
        return;
      try {
        await api_index.markChatRead({ session_id: this.currentActionItem.session_id || this.currentActionItem.id });
        this.currentActionItem.user_unread = 0;
        this.currentActionItem.unread = 0;
        common_vendor.index.showToast({ title: "已标记为已读", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "操作失败", icon: "none" });
      }
      this.closeActionSheet();
    },
    async blockUserAction() {
      var _a;
      if (!this.currentActionItem)
        return;
      try {
        await api_index.blockUser({ user_id: this.currentActionItem.target_id || ((_a = this.currentActionItem.target_user) == null ? void 0 : _a.id) });
        const index = this.conversations.findIndex((c) => c.id === this.currentActionItem.id);
        if (index > -1) {
          this.conversations.splice(index, 1);
        }
        common_vendor.index.showToast({ title: "已屏蔽该用户", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "操作失败", icon: "none" });
      }
      this.closeActionSheet();
    },
    goLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/index"
      });
    },
    formatTime(timestamp) {
      if (!timestamp)
        return "";
      const ts = timestamp < 1e10 ? timestamp * 1e3 : timestamp;
      const date = new Date(ts);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      if (diff < 6e4)
        return "刚刚";
      if (diff < 36e5)
        return Math.floor(diff / 6e4) + "分钟前";
      if (diff < 864e5)
        return Math.floor(diff / 36e5) + "小时前";
      if (diff < 6048e5)
        return Math.floor(diff / 864e5) + "天前";
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${month}-${day}`;
    },
    formatLastMessage(item) {
      if (!item || !item.last_message)
        return "";
      const msgType = item.last_type || "text";
      if (msgType === "image") {
        return "[图片]";
      } else if (msgType === "system") {
        return "[系统消息]";
      }
      const content = item.last_message || "";
      return content.length > 30 ? content.substring(0, 30) + "..." : content;
    },
    getUnreadCount(item) {
      const count = item.user_unread || item.unread || 0;
      return count > 99 ? "99+" : count;
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
      title: "聊天",
      isShowBack: false,
      backgroundImage: "/static/bg3.png"
    }),
    b: $data.isGuest
  }, $data.isGuest ? {
    c: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args), "41")
  } : {}, {
    d: $data.loading && $data.conversations.length === 0
  }, $data.loading && $data.conversations.length === 0 ? {} : {}, {
    e: !$data.loading && $data.conversations.length === 0
  }, !$data.loading && $data.conversations.length === 0 ? {
    f: common_assets._imports_0
  } : {}, {
    g: $data.conversations.length > 0
  }, $data.conversations.length > 0 ? common_vendor.e({
    h: common_vendor.f($data.conversations, (item, k0, i0) => {
      var _a, _b, _c, _d;
      return common_vendor.e({
        a: ((_a = item.target_user) == null ? void 0 : _a.avatar) || "/static/logo.png",
        b: (_b = item.target_user) == null ? void 0 : _b.is_online
      }, ((_c = item.target_user) == null ? void 0 : _c.is_online) ? {} : {}, {
        c: common_vendor.t(((_d = item.target_user) == null ? void 0 : _d.nickname) || "匿名用户"),
        d: common_vendor.t(item.last_time_text || $options.formatTime(item.last_time)),
        e: common_vendor.t($options.formatLastMessage(item)),
        f: item.user_unread > 0 || item.unread > 0
      }, item.user_unread > 0 || item.unread > 0 ? {
        g: common_vendor.t($options.getUnreadCount(item))
      } : {}, {
        h: item.id,
        i: common_vendor.o(($event) => $options.goChatDetail(item), item.id),
        j: common_vendor.o(($event) => $options.showItemActions(item), item.id)
      });
    }),
    i: $data.hasMore
  }, $data.hasMore ? common_vendor.e({
    j: $data.loadingMore
  }, $data.loadingMore ? {} : {
    k: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "7f")
  }) : {}) : {}, {
    l: $data.showActionSheet
  }, $data.showActionSheet ? {
    m: common_vendor.o((...args) => $options.closeActionSheet && $options.closeActionSheet(...args), "ad")
  } : {}, {
    n: $data.showActionSheet
  }, $data.showActionSheet ? {
    o: common_vendor.o((...args) => $options.markAsRead && $options.markAsRead(...args), "c5"),
    p: common_vendor.o((...args) => $options.blockUserAction && $options.blockUserAction(...args), "53"),
    q: common_vendor.o((...args) => $options.closeActionSheet && $options.closeActionSheet(...args), "20")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-32c40775"]]);
xhs.createPage(MiniProgramPage);
