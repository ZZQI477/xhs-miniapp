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
      currentTab: "received",
      subTabs: [
        { name: "全部", key: "" },
        { name: "待处理", key: "pending" },
        { name: "已通过", key: "accepted" },
        { name: "已拒绝", key: "rejected" }
      ],
      currentSubTab: 0,
      list: [],
      page: 1,
      pageSize: 20,
      loading: false,
      noMore: false,
      pendingCount: 0,
      showRejectSheet: false,
      rejectId: null,
      rejectIndex: 0,
      rejectReasons: [
        "不是我喜欢的类型",
        "距离太远了",
        "资料不够完善",
        "暂时不想认识新朋友",
        "其他原因"
      ],
      showWechatModal: false,
      currentWechatUserId: null
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
    switchTab(tab) {
      if (this.currentTab === tab)
        return;
      this.currentTab = tab;
      this.currentSubTab = 0;
      this.page = 1;
      this.noMore = false;
      this.list = [];
      this.loadData();
    },
    switchSubTab(index) {
      if (this.currentSubTab === index)
        return;
      this.currentSubTab = index;
      this.page = 1;
      this.noMore = false;
      this.list = [];
      this.loadData();
    },
    async loadData() {
      this.loading = true;
      try {
        const params = {
          type: this.currentTab,
          page: this.page,
          pagesize: this.pageSize
        };
        const status = this.subTabs[this.currentSubTab].key;
        if (status) {
          params.status = status;
        }
        const res = await api_index.getRequestList(params);
        const data = res.data.list || [];
        if (this.page === 1) {
          this.list = data;
        } else {
          this.list = [...this.list, ...data];
        }
        if (this.currentTab === "received") {
          this.pendingCount = this.list.filter((item) => item.status === "pending").length;
        }
        this.hasMore = data.length >= this.pageSize;
      } catch (e) {
        console.error("加载失败", e);
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
    async handleAction(requestId, action) {
      if (action === "reject") {
        this.rejectId = requestId;
        this.showRejectSheet = true;
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "处理中..." });
        await api_index.handleRequest({
          request_id: requestId,
          action
        });
        common_vendor.index.showToast({
          title: "已同意，双方微信已解锁",
          icon: "success"
        });
        this.page = 1;
        this.loadData();
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "操作失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    onRejectChange(e) {
      this.rejectIndex = e.detail.value[0];
    },
    async confirmReject() {
      try {
        common_vendor.index.showLoading({ title: "处理中..." });
        await api_index.handleRequest({
          request_id: this.rejectId,
          action: "reject",
          reject_reason: this.rejectReasons[this.rejectIndex]
        });
        this.showRejectSheet = false;
        common_vendor.index.showToast({
          title: "已拒绝",
          icon: "success"
        });
        this.page = 1;
        this.loadData();
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "操作失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    viewWechat(userId) {
      this.currentWechatUserId = userId;
      this.showWechatModal = true;
    },
    confirmViewWechat() {
      this.showWechatModal = false;
      if (this.currentWechatUserId) {
        this.goDetail(this.currentWechatUserId);
      }
    },
    goDetail(userId) {
      common_vendor.index.navigateTo({
        url: `/pages/user/detail?id=${userId}`
      });
    },
    statusText(status) {
      const map = {
        pending: "待处理",
        accepted: "已同意",
        rejected: "已拒绝"
      };
      return map[status] || status;
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
      title: "好友申请",
      isShowBack: false,
      backgroundImage: "/static/bg3.png"
    }),
    b: $data.pendingCount > 0
  }, $data.pendingCount > 0 ? {
    c: common_vendor.t($data.pendingCount)
  } : {}, {
    d: $data.currentTab === "received" ? 1 : "",
    e: common_vendor.o(($event) => $options.switchTab("received"), "07"),
    f: $data.currentTab === "sent" ? 1 : "",
    g: common_vendor.o(($event) => $options.switchTab("sent"), "6e"),
    h: common_vendor.f($data.subTabs, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab.name),
        b: tab.key,
        c: $data.currentSubTab === index ? 1 : "",
        d: common_vendor.o(($event) => $options.switchSubTab(index), tab.key)
      };
    }),
    i: !$data.loading && $data.list.length === 0
  }, !$data.loading && $data.list.length === 0 ? {
    j: common_vendor.t($data.currentTab === "received" ? "收到" : "发出")
  } : {}, {
    k: $data.currentTab === "received" && $data.list.length > 0
  }, $data.currentTab === "received" && $data.list.length > 0 ? {
    l: common_vendor.f($data.list, (item, k0, i0) => {
      return common_vendor.e({
        a: item.from_user.avatar || "/static/logo.png",
        b: common_vendor.t(item.from_user.nickname || "匿名用户"),
        c: item.from_user.gender == 1 ? "/static/m.png" : "/static/wm.png",
        d: common_vendor.t(item.from_user.age || "?"),
        e: common_vendor.t(item.from_user.height || "?"),
        f: common_vendor.t(item.from_user.city || "未知"),
        g: item.message
      }, item.message ? {
        h: common_vendor.t(item.message)
      } : {}, {
        i: common_vendor.t($options.formatTime(item.createtime)),
        j: common_vendor.o(($event) => $options.goDetail(item.from_user.id), item.id),
        k: item.status === "pending"
      }, item.status === "pending" ? {
        l: common_vendor.o(($event) => $options.handleAction(item.id, "reject"), item.id),
        m: common_vendor.o(($event) => $options.handleAction(item.id, "accept"), item.id)
      } : common_vendor.e({
        n: item.status === "accepted"
      }, item.status === "accepted" ? {} : item.status === "rejected" ? {} : {}, {
        o: item.status === "rejected"
      }), {
        p: item.id
      });
    })
  } : {}, {
    m: $data.currentTab === "sent" && $data.list.length > 0
  }, $data.currentTab === "sent" && $data.list.length > 0 ? {
    n: common_vendor.f($data.list, (item, k0, i0) => {
      return common_vendor.e({
        a: item.target_user.avatar || "/static/logo.png",
        b: common_vendor.t(item.target_user.nickname || "匿名用户"),
        c: common_vendor.t(item.target_user.gender == 1 ? "♂" : "♀"),
        d: item.target_user.gender == 2 ? 1 : "",
        e: common_vendor.t(item.target_user.age || "?"),
        f: common_vendor.t(item.target_user.height || "?"),
        g: common_vendor.t(item.target_user.city || "未知"),
        h: item.message
      }, item.message ? {
        i: common_vendor.t(item.message)
      } : {}, {
        j: common_vendor.t($options.formatTime(item.createtime)),
        k: common_vendor.o(($event) => $options.goDetail(item.target_user.id), item.id),
        l: item.status === "accepted"
      }, item.status === "accepted" ? {
        m: common_vendor.o(($event) => $options.viewWechat(item.target_user.id), item.id)
      } : {
        n: common_vendor.t($options.statusText(item.status)),
        o: common_vendor.n(item.status)
      }, {
        p: item.id
      });
    })
  } : {}, {
    o: $data.list.length > 0
  }, $data.list.length > 0 ? common_vendor.e({
    p: $data.loading
  }, $data.loading ? {} : $data.noMore ? {} : {
    r: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "b0")
  }, {
    q: $data.noMore
  }) : {}, {
    s: $data.showRejectSheet
  }, $data.showRejectSheet ? {
    t: common_vendor.o(($event) => $data.showRejectSheet = false, "56")
  } : {}, {
    v: $data.showRejectSheet
  }, $data.showRejectSheet ? {
    w: common_vendor.f($data.rejectReasons, (item, index, i0) => {
      return {
        a: common_vendor.t(item),
        b: index
      };
    }),
    x: [$data.rejectIndex],
    y: common_vendor.o((...args) => $options.onRejectChange && $options.onRejectChange(...args), "1f"),
    z: common_vendor.o(($event) => $data.showRejectSheet = false, "19"),
    A: common_vendor.o((...args) => $options.confirmReject && $options.confirmReject(...args), "d8")
  } : {}, {
    B: $data.showWechatModal
  }, $data.showWechatModal ? {
    C: common_vendor.o(($event) => $data.showWechatModal = false, "7a")
  } : {}, {
    D: $data.showWechatModal
  }, $data.showWechatModal ? {
    E: common_vendor.o(($event) => $data.showWechatModal = false, "e1"),
    F: common_vendor.o(($event) => $data.showWechatModal = false, "7a"),
    G: common_vendor.o((...args) => $options.confirmViewWechat && $options.confirmViewWechat(...args), "f2")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2b615d88"]]);
xhs.createPage(MiniProgramPage);
