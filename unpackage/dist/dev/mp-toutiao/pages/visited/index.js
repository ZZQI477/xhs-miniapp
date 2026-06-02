"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      activeTab: "certified",
      users: [],
      page: 1,
      limit: 20,
      total: 0,
      loading: false,
      hasMore: true
    };
  },
  computed: {
    filteredUsers() {
      if (this.activeTab === "certified") {
        return this.users.filter((u) => u.is_verified);
      }
      return this.users.filter((u) => !u.is_verified);
    }
  },
  onLoad() {
    this.loadVisitors();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.users = [];
    this.hasMore = true;
    this.loadVisitors().then(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore();
    }
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab;
    },
    async loadVisitors() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const res = await api_index.getVisitList({
          page: this.page,
          limit: this.limit
        });
        const list = res.data.list || [];
        if (this.page === 1) {
          this.users = list;
        } else {
          this.users = [...this.users, ...list];
        }
        this.total = res.data.total;
        this.hasMore = this.users.length < this.total;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/visited/index.vue:105", "加载访客列表失败", e);
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (!this.hasMore || this.loading)
        return;
      this.page++;
      this.loadVisitors();
    },
    goUserDetail(userId) {
      common_vendor.index.navigateTo({
        url: `/pages/index/index?user_id=${userId}`
      });
    },
    formatTime(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp * 1e3);
      const now = /* @__PURE__ */ new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 6e4);
      const hours = Math.floor(diff / 36e5);
      const days = Math.floor(diff / 864e5);
      if (minutes < 60)
        return `${minutes}分钟前`;
      if (hours < 24)
        return `${hours}小时前`;
      if (days < 30)
        return `${days}天前`;
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activeTab === "certified" ? 1 : "",
    b: common_vendor.o(($event) => $options.switchTab("certified"), "22"),
    c: $data.activeTab === "uncertified" ? 1 : "",
    d: common_vendor.o(($event) => $options.switchTab("uncertified"), "12"),
    e: common_vendor.f($options.filteredUsers, (user, k0, i0) => {
      return common_vendor.e({
        a: user.avatar,
        b: common_vendor.t(user.nickname),
        c: user.is_verified
      }, user.is_verified ? {} : {}, {
        d: common_vendor.t(user.age),
        e: common_vendor.t(user.city),
        f: common_vendor.t(user.height),
        g: common_vendor.t($options.formatTime(user.visit_time)),
        h: user.id,
        i: common_vendor.o(($event) => $options.goUserDetail(user.id), "5d")
      });
    }),
    f: $data.hasMore
  }, $data.hasMore ? {
    g: common_vendor.t($data.loading ? "加载中..." : "加载更多"),
    h: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "4c")
  } : {}, {
    i: !$data.loading && $data.users.length === 0
  }, !$data.loading && $data.users.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fdd3dc68"]]);
tt.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-toutiao/pages/visited/index.js.map
