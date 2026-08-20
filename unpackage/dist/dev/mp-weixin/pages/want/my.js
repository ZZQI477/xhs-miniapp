"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: {
    CustomNavBar
  },
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 20,
      loading: false,
      noMore: false
    };
  },
  onLoad() {
    this.loadData();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.noMore = false;
    this.loadData().then(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    this.loadMore();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const res = await api_index.getMyWantList({
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
        common_vendor.index.__f__("error", "at pages/want/my.vue:99", "加载失败", e);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    loadMore() {
      if (this.loading || this.noMore)
        return;
      this.page++;
      this.loadData();
    },
    goDetail(userId) {
      common_vendor.index.navigateTo({
        url: `/pages/user/detail?id=${userId}`
      });
    },
    formatTime(timestamp) {
      if (!timestamp)
        return "";
      const date = new Date(timestamp * 1e3);
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
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    getWantTypeText(type) {
      switch (type) {
        case "wechat":
          return "微信";
        case "introduce":
          return "自我介绍";
        case "tag":
          return "标签";
        case "idealPartner":
          return "要求";
        default:
          return "照片";
      }
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
      title: "我想看的",
      backgroundImage: "https://minixhs.chugao520.com/makefriends/bg3.png"
    }),
    b: !$data.loading && $data.list.length === 0
  }, !$data.loading && $data.list.length === 0 ? {} : {
    c: common_vendor.f($data.list, (item, k0, i0) => {
      return {
        a: item.avatar || "https://minixhs.chugao520.com/makefriends/logo.png",
        b: common_vendor.t(item.nickname || "匿名用户"),
        c: item.gender == 1 ? "https://minixhs.chugao520.com/makefriends/m.png" : "https://minixhs.chugao520.com/makefriends/wm.png",
        d: common_vendor.t(item.age || "?"),
        e: common_vendor.t(item.height || "?"),
        f: common_vendor.t(item.city || "未知"),
        g: common_vendor.t($options.formatTime(item.createtime)),
        h: common_vendor.t($options.getWantTypeText(item.want_type)),
        i: common_vendor.n(item.want_type),
        j: item.id,
        k: common_vendor.o(($event) => $options.goDetail(item.id), item.id)
      };
    })
  }, {
    d: $data.list.length > 0
  }, $data.list.length > 0 ? common_vendor.e({
    e: $data.loading
  }, $data.loading ? {} : $data.noMore ? {} : {
    g: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "9f")
  }, {
    f: $data.noMore
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-91e813c8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/want/my.js.map
