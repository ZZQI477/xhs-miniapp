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
      noMore: false,
      showPopup: false,
      currentItem: null
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
        const res = await api_index.getWantMeList({
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
        common_vendor.index.__f__("error", "at pages/want/me.vue:161", "加载失败", e);
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
    // 显示详情弹窗
    showDetail(item) {
      this.currentItem = item;
      this.showPopup = true;
    },
    // 关闭弹窗
    closePopup() {
      this.showPopup = false;
      this.currentItem = null;
    },
    // 跳转用户详情
    goDetail(userId) {
      common_vendor.index.navigateTo({
        url: `/pages/user/detail?id=${userId}`
      });
    },
    // 处理同意/拒绝
    async handleAction(action) {
      try {
        if (action === "accepted") {
          if (this.currentItem.want_type === "wechat") {
            common_vendor.index.showLoading({ title: "处理中..." });
            await api_index.handleWant({
              id: this.currentItem.id,
              status: action
            });
            this.currentItem.status = action;
            const index = this.list.findIndex((item) => item.id === this.currentItem.id);
            if (index !== -1) {
              this.list[index].status = action;
            }
            common_vendor.index.hideLoading();
            common_vendor.index.showModal({
              title: "解锁成功",
              content: "双方微信号已互相解锁，可在消息中查看对方微信号",
              showCancel: false,
              confirmText: "知道了",
              success: () => {
                this.closePopup();
              }
            });
          } else {
            this.closePopup();
            common_vendor.index.navigateTo({
              url: "/pages/profile/edit"
            });
          }
        } else {
          common_vendor.index.showLoading({ title: "处理中..." });
          await api_index.handleWant({
            id: this.currentItem.id,
            status: action
          });
          this.currentItem.status = action;
          const index = this.list.findIndex((item) => item.id === this.currentItem.id);
          if (index !== -1) {
            this.list[index].status = action;
          }
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "已拒绝",
            icon: "success"
          });
          this.closePopup();
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/want/me.vue:260", "处理失败", e);
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: e.msg || "操作失败",
          icon: "none"
        });
      }
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
      title: "想看我的",
      backgroundImage: "https://minixhs.chugao520.com/makefriends/bg3.png"
    }),
    b: !$data.loading && $data.list.length === 0
  }, !$data.loading && $data.list.length === 0 ? {} : {
    c: common_vendor.f($data.list, (item, k0, i0) => {
      return common_vendor.e({
        a: item.user.avatar || "https://minixhs.chugao520.com/makefriends/logo.png",
        b: common_vendor.t(item.user.nickname || "匿名用户"),
        c: common_vendor.t(item.user.gender == 1 ? "♂" : "♀"),
        d: item.user.gender == 2 ? 1 : "",
        e: common_vendor.t(item.user.age || "?"),
        f: common_vendor.t(item.user.height || "?"),
        g: common_vendor.t(item.user.city || "未知"),
        h: common_vendor.t($options.formatTime(item.createtime)),
        i: common_vendor.t($options.getWantTypeText(item.want_type)),
        j: common_vendor.n(item.want_type),
        k: item.status !== "pending"
      }, item.status !== "pending" ? {
        l: common_vendor.t(item.status === "accepted" ? "已同意" : "已拒绝"),
        m: common_vendor.n(item.status)
      } : {}, {
        n: item.id,
        o: common_vendor.o(($event) => $options.showDetail(item), item.id)
      });
    })
  }, {
    d: $data.list.length > 0
  }, $data.list.length > 0 ? common_vendor.e({
    e: $data.loading
  }, $data.loading ? {} : $data.noMore ? {} : {
    g: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "ab")
  }, {
    f: $data.noMore
  }) : {}, {
    h: $data.showPopup
  }, $data.showPopup ? {
    i: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "08")
  } : {}, {
    j: $data.showPopup
  }, $data.showPopup ? common_vendor.e({
    k: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "0f"),
    l: $data.currentItem
  }, $data.currentItem ? {
    m: $data.currentItem.user.avatar || "https://minixhs.chugao520.com/makefriends/logo.png",
    n: common_vendor.o(($event) => $options.goDetail($data.currentItem.user.id), "4b"),
    o: common_vendor.t($data.currentItem.user.nickname),
    p: common_vendor.t($data.currentItem.user.gender == 1 ? "♂" : "♀"),
    q: $data.currentItem.user.gender == 2 ? 1 : "",
    r: common_vendor.t($data.currentItem.user.height || "?"),
    s: common_vendor.t($data.currentItem.user.age),
    t: common_vendor.o(($event) => $options.goDetail($data.currentItem.user.id), "bf")
  } : {}, {
    v: common_vendor.t($data.currentItem && $options.getWantTypeText($data.currentItem.want_type)),
    w: $data.currentItem && $data.currentItem.status !== "pending"
  }, $data.currentItem && $data.currentItem.status !== "pending" ? {
    x: common_vendor.t($data.currentItem.status === "accepted" ? "你已同意，双方微信已解锁" : "你已拒绝该请求"),
    y: common_vendor.n($data.currentItem.status)
  } : {}, {
    z: $data.currentItem && $data.currentItem.status === "pending"
  }, $data.currentItem && $data.currentItem.status === "pending" ? {
    A: common_vendor.o(($event) => $options.handleAction("rejected"), "a7"),
    B: common_vendor.o(($event) => $options.handleAction("accepted"), "34")
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-886e8b32"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/want/me.js.map
