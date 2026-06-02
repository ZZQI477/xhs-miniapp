"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      tabs: [
        { type: "all", name: "全部" },
        { type: "request", name: "好友申请" },
        { type: "want", name: "想看我的" },
        { type: "system", name: "系统通知" }
      ],
      currentTab: "all",
      list: [],
      page: 1,
      pageSize: 20,
      loading: false,
      noMore: false,
      unreadCount: {
        all: 0,
        request: 0,
        want: 0,
        system: 0
      }
    };
  },
  onLoad() {
    this.loadUnreadCount();
    this.loadData();
  },
  onShow() {
    this.loadUnreadCount();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.noMore = false;
    Promise.all([this.loadUnreadCount(), this.loadData()]).then(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    this.loadMore();
  },
  methods: {
    // 格式化消息标题，确保显示想看类型
    formatMessageTitle(item) {
      if (item.type === "want" && item.extra && item.extra.want_type) {
        const wantTypeMap = {
          wechat: "微信",
          images: "照片",
          introduce: "介绍",
          tag: "标签",
          idealPartner: "理想对象"
        };
        const typeText = wantTypeMap[item.extra.want_type] || "信息";
        return "有人想看你的" + typeText;
      }
      return item.title;
    },
    // 格式化想看类型
    formatWantType(wantType) {
      const wantTypeMap = {
        wechat: "微信",
        images: "照片",
        introduce: "介绍",
        tag: "标签",
        idealPartner: "理想对象"
      };
      return wantTypeMap[wantType] || "信息";
    },
    // 切换Tab
    switchTab(type) {
      if (this.currentTab === type)
        return;
      this.currentTab = type;
      this.page = 1;
      this.noMore = false;
      this.list = [];
      this.loadData();
    },
    // 加载未读数量
    async loadUnreadCount() {
      try {
        const res = await api_index.getUnreadCount();
        this.unreadCount = {
          all: res.data.total || 0,
          request: res.data.request || 0,
          want: res.data.want || 0,
          system: res.data.system || 0
        };
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/message/index.vue:191", "加载未读数失败", e);
      }
    },
    // 加载消息列表
    async loadData() {
      this.loading = true;
      try {
        const res = await api_index.getMessageList({
          type: this.currentTab,
          page: this.page,
          pagesize: this.pageSize
        });
        const data = res.data.list || [];
        if (this.page === 1) {
          this.list = data;
        } else {
          this.list = [...this.list, ...data];
        }
        if (data.length < this.pageSize) {
          this.noMore = true;
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/message/index.vue:216", "加载消息失败", e);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    // 加载更多
    loadMore() {
      if (this.loading || this.noMore)
        return;
      this.page++;
      this.loadData();
    },
    async handleClick(item) {
      if (!item.is_read) {
        try {
          await api_index.markMessageRead({ id: item.id });
          item.is_read = 1;
          this.loadUnreadCount();
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/message/index.vue:238", "标记已读失败", e);
        }
      }
      if (item.from_user) {
        this.goUserDetail(item.from_user.id);
      }
    },
    // 跳转用户详情
    goUserDetail(userId) {
      common_vendor.index.navigateTo({
        url: `/pages/user/detail?id=${userId}`
      });
    },
    // 复制微信号
    copyWechat(wechat) {
      common_vendor.index.setClipboardData({
        data: wechat,
        success: () => {
          common_vendor.index.showToast({
            title: "微信号已复制",
            icon: "success"
          });
        }
      });
    },
    // 全部标记已读
    markAllRead() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定将所有消息标记为已读吗？",
        success: async (res) => {
          if (!res.confirm)
            return;
          try {
            common_vendor.index.showLoading({ title: "处理中..." });
            const params = this.currentTab === "all" ? {} : { type: this.currentTab };
            await api_index.markMessageRead(params);
            this.list.forEach((item) => {
              item.is_read = 1;
            });
            this.loadUnreadCount();
            common_vendor.index.showToast({ title: "操作成功", icon: "success" });
          } catch (e) {
            common_vendor.index.showToast({ title: "操作失败", icon: "none" });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    },
    // 清空消息
    clearAll() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定清空所有消息吗？此操作不可恢复",
        success: async (res) => {
          if (!res.confirm)
            return;
          try {
            common_vendor.index.showLoading({ title: "清空中..." });
            const params = this.currentTab === "all" ? {} : { type: this.currentTab };
            await api_index.clearMessages(params);
            this.list = [];
            this.loadUnreadCount();
            common_vendor.index.showToast({ title: "清空成功", icon: "success" });
          } catch (e) {
            common_vendor.index.showToast({ title: "操作失败", icon: "none" });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (tab, k0, i0) => {
      return common_vendor.e({
        a: common_vendor.t(tab.name),
        b: $data.unreadCount[tab.type] > 0
      }, $data.unreadCount[tab.type] > 0 ? {
        c: common_vendor.t($data.unreadCount[tab.type] > 99 ? "99+" : $data.unreadCount[tab.type])
      } : {}, {
        d: tab.type,
        e: $data.currentTab === tab.type ? 1 : "",
        f: common_vendor.o(($event) => $options.switchTab(tab.type), "e6")
      });
    }),
    b: $data.list.length > 0
  }, $data.list.length > 0 ? {
    c: common_vendor.o((...args) => $options.markAllRead && $options.markAllRead(...args), "b5"),
    d: common_vendor.o((...args) => $options.clearAll && $options.clearAll(...args), "9c")
  } : {}, {
    e: !$data.loading && $data.list.length === 0
  }, !$data.loading && $data.list.length === 0 ? {} : {
    f: common_vendor.f($data.list, (item, k0, i0) => {
      return common_vendor.e({
        a: item.type === "request"
      }, item.type === "request" ? {} : item.type === "want" ? {} : {}, {
        b: item.type === "want",
        c: common_vendor.n(item.type),
        d: common_vendor.t($options.formatMessageTitle(item)),
        e: common_vendor.t(item.time_text),
        f: common_vendor.t(item.content),
        g: item.type === "want" && item.extra && item.extra.want_type
      }, item.type === "want" && item.extra && item.extra.want_type ? {
        h: common_vendor.t($options.formatWantType(item.extra.want_type))
      } : {}, {
        i: item.extra && item.extra.wechat
      }, item.extra && item.extra.wechat ? {
        j: common_vendor.t(item.extra.wechat),
        k: common_vendor.o(($event) => $options.copyWechat(item.extra.wechat), "52")
      } : {}, {
        l: item.from_user
      }, item.from_user ? {
        m: item.from_user.avatar || "/static/logo.png",
        n: common_vendor.t(item.from_user.nickname),
        o: common_vendor.o(($event) => $options.goUserDetail(item.from_user.id), "08")
      } : {}, {
        p: !item.is_read
      }, !item.is_read ? {} : {}, {
        q: item.id,
        r: !item.is_read ? 1 : "",
        s: common_vendor.o(($event) => $options.handleClick(item), "b7")
      });
    })
  }, {
    g: $data.list.length > 0
  }, $data.list.length > 0 ? common_vendor.e({
    h: $data.loading
  }, $data.loading ? {} : $data.noMore ? {} : {
    j: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "af")
  }, {
    i: $data.noMore
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-780fc0ad"]]);
tt.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-toutiao/pages/message/index.js.map
