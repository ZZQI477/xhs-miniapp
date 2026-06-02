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
    this.loadFans();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.users = [];
    this.hasMore = true;
    this.loadFans().then(() => {
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
    async loadFans() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const res = await api_index.getFansList({
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
        common_vendor.index.__f__("error", "at pages/fans/index.vue:107", "加载粉丝列表失败", e);
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (!this.hasMore || this.loading)
        return;
      this.page++;
      this.loadFans();
    },
    goUserDetail(userId) {
      common_vendor.index.navigateTo({
        url: `/pages/index/index?user_id=${userId}`
      });
    },
    async toggleFollow(user) {
      try {
        const res = await api_index.toggleFollow({ user_id: user.id });
        user.is_mutual = res.data.is_followed;
        common_vendor.index.showToast({
          title: res.data.is_followed ? "关注成功" : "取消关注成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.showToast({
          title: e.msg || "操作失败",
          icon: "none"
        });
      }
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
        g: common_vendor.t(user.is_mutual ? "互相关注" : "回关"),
        h: common_vendor.o(($event) => $options.toggleFollow(user), "89"),
        i: user.id,
        j: common_vendor.o(($event) => $options.goUserDetail(user.id), "5d")
      });
    }),
    f: $data.hasMore
  }, $data.hasMore ? {
    g: common_vendor.t($data.loading ? "加载中..." : "加载更多"),
    h: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "26")
  } : {}, {
    i: !$data.loading && $data.users.length === 0
  }, !$data.loading && $data.users.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-54cbdccf"]]);
tt.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-toutiao/pages/fans/index.js.map
