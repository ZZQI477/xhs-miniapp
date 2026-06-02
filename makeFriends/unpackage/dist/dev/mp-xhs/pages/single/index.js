"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_profileCheck = require("../../utils/profileCheck.js");
const common_assets = require("../../common/assets.js");
const ProfileCheckModal = () => "../../components/profile-check-modal.js";
const FilterModal = () => "../../components/filter-modal.js";
const QrcodeModal = () => "../../components/qrcode-modal.js";
const VipPopup = () => "../../components/vip-popup.js";
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: {
    ProfileCheckModal,
    FilterModal,
    QrcodeModal,
    VipPopup,
    CustomNavBar
  },
  mixins: [utils_profileCheck.profileCheckMixin],
  data() {
    return {
      banners: [],
      users: [],
      coupleList: [],
      currentTab: 0,
      // 0=女嘉宾, 1=男嘉宾, 2=已脱单
      page: 1,
      limit: 12,
      total: 0,
      loading: false,
      hasMore: true,
      showFilterModal: false,
      filterParams: {},
      showQrcodeModal: false,
      groupQrcode: "/static/images/qrcode.png",
      // 公众号二维码图片
      isVip: false,
      // 是否VIP
      showUnlock: false,
      // 是否显示解锁卡片
      extraUsers: [],
      // 额外的模糊用户列表
      showVipPopup: false
      // 显示VIP支付弹窗
    };
  },
  computed: {
    currentList() {
      return this.currentTab === 2 ? this.coupleList : this.users;
    }
  },
  onLoad() {
    this.loadBanners();
    this.loadUsers();
  },
  onShow() {
    this.checkProfileCompletion();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.hasMore = true;
    if (this.currentTab === 2) {
      this.coupleList = [];
      this.loadCoupleList().then(() => {
        common_vendor.index.stopPullDownRefresh();
      });
    } else {
      this.users = [];
      this.loadUsers().then(() => {
        common_vendor.index.stopPullDownRefresh();
      });
    }
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore();
    }
  },
  methods: {
    // 加载Banner
    async loadBanners() {
      try {
        const res = await api_index.getBanners("single");
        this.banners = res.data.list || [];
      } catch (e) {
        console.error("加载Banner失败", e);
      }
    },
    // 加载用户列表
    async loadUsers() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const params = {
          gender: this.currentTab === 0 ? 2 : 1,
          is_single: 1,
          page: this.page,
          limit: this.isVip ? 20 : 15,
          // VIP用户加载20个，非VIP加载15个
          ...this.filterParams
        };
        const res = await api_index.getUserList(params);
        const list = res.data.list || [];
        if (this.page === 1) {
          if (!this.isVip && list.length > 14) {
            this.users = list.slice(0, 14);
            this.extraUsers = list.slice(14, 19);
          } else {
            this.users = list;
            this.extraUsers = [];
          }
        } else {
          this.users = [...this.users, ...list];
        }
        this.total = res.data.total;
        this.isVip = res.data.is_vip || false;
        this.showUnlock = res.data.show_unlock || false;
        this.hasMore = this.users.length < this.total;
      } catch (e) {
        console.error("加载用户列表失败", e);
      } finally {
        this.loading = false;
      }
    },
    // 加载已脱单案例列表
    async loadCoupleList() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const res = await api_index.getCoupleList({
          page: this.page,
          limit: this.limit
        });
        const list = res.data.list || [];
        if (this.page === 1) {
          this.coupleList = list;
        } else {
          this.coupleList = [...this.coupleList, ...list];
        }
        this.total = res.data.total;
        this.hasMore = this.coupleList.length < this.total;
      } catch (e) {
        console.error("加载脱单案例失败", e);
      } finally {
        this.loading = false;
      }
    },
    // 加载更多
    loadMore() {
      if (!this.hasMore || this.loading)
        return;
      this.page++;
      if (this.currentTab === 2) {
        this.loadCoupleList();
      } else {
        this.loadUsers();
      }
    },
    // 切换Tab
    switchTab(tab) {
      if (this.currentTab === tab)
        return;
      this.currentTab = tab;
      this.page = 1;
      this.hasMore = true;
      this.filterParams = {};
      if (tab === 2) {
        this.coupleList = [];
        this.loadCoupleList();
      } else {
        this.users = [];
        this.loadUsers();
      }
    },
    // 筛选确认
    onFilterConfirm(params) {
      const apiParams = {};
      if (params.ageRange) {
        const [min, max] = params.ageRange.split("-");
        if (min)
          apiParams.age_min = parseInt(min);
        if (max)
          apiParams.age_max = parseInt(max);
      }
      if (params.heightRange) {
        const [min, max] = params.heightRange.split("-");
        if (min)
          apiParams.height_min = parseInt(min);
        if (max)
          apiParams.height_max = parseInt(max);
      }
      if (params.education) {
        apiParams.education = params.education;
      }
      if (params.city) {
        apiParams.city = params.city;
      }
      this.filterParams = apiParams;
      this.showFilterModal = false;
      this.page = 1;
      this.users = [];
      this.hasMore = true;
      this.loadUsers();
    },
    // 跳转用户详情
    goUserDetail(userId) {
      common_vendor.index.navigateTo({
        url: `/pages/user/detail?user_id=${userId}`
      });
    },
    // 加入交友群
    joinGroup() {
      common_vendor.index.navigateTo({
        url: "/pages/group/index"
      });
    },
    // 获取标签样式
    getTagClass(tag) {
      if (tag.includes("cm")) {
        return "tag-height";
      } else if (tag.includes("本科") || tag.includes("硕士") || tag.includes("专科") || tag.includes("985") || tag.includes("211")) {
        return "tag-education";
      } else if (tag.includes("有房") || tag.includes("有车")) {
        return "tag-property";
      } else if (tag.includes("万")) {
        return "tag-income";
      } else {
        return "tag-other";
      }
    },
    // 跳转VIP页面
    goVipPage() {
      common_vendor.index.navigateTo({
        url: "/pages/vip/index"
      });
    },
    // 点击解锁按钮
    handleUnlockClick() {
      this.showVipPopup = true;
    },
    // 处理VIP支付
    async handleVipPay(packageInfo) {
      common_vendor.index.showLoading({ title: "正在创建订单..." });
      try {
        const { createOrder, wxPay } = await "../../api/index.js";
        const orderRes = await createOrder({
          type: "vip",
          package_id: packageInfo.type,
          duration: packageInfo.monthCount,
          amount: packageInfo.value
        });
        common_vendor.index.hideLoading();
        const payRes = await wxPay({
          order_id: orderRes.data.order_id
        });
        common_vendor.index.requestPayment({
          provider: "wxpay",
          timeStamp: payRes.data.timeStamp,
          nonceStr: payRes.data.nonceStr,
          package: payRes.data.package,
          signType: payRes.data.signType,
          paySign: payRes.data.paySign,
          success: () => {
            common_vendor.index.showToast({ title: "开通成功", icon: "success" });
            this.showVipPopup = false;
            this.page = 1;
            this.users = [];
            this.loadUsers();
          },
          fail: (err) => {
            console.error("支付失败", err);
            common_vendor.index.showToast({ title: "支付取消", icon: "none" });
          }
        });
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: e.msg || "创建订单失败",
          icon: "none"
        });
      }
    },
    // 返回上一页
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
if (!Array) {
  const _component_profile_check_modal = common_vendor.resolveComponent("profile-check-modal");
  const _component_filter_modal = common_vendor.resolveComponent("filter-modal");
  const _component_qrcode_modal = common_vendor.resolveComponent("qrcode-modal");
  const _component_vip_popup = common_vendor.resolveComponent("vip-popup");
  const _component_custom_nav_bar = common_vendor.resolveComponent("custom-nav-bar");
  (_component_profile_check_modal + _component_filter_modal + _component_qrcode_modal + _component_vip_popup + _component_custom_nav_bar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.j({
      "confirm": common_vendor.o(_ctx.onProfileGuide, "ed"),
      "dismiss": common_vendor.o(_ctx.onProfileDismiss, "81")
    }),
    b: common_vendor.p({
      visible: _ctx.showProfileModal,
      percent: _ctx.profilePercent,
      ["missing-fields"]: _ctx.profileMissingFields
    }),
    c: common_vendor.j({
      "confirm": common_vendor.o($options.onFilterConfirm, "03"),
      "dismiss": common_vendor.o(($event) => $data.showFilterModal = false, "d4")
    }),
    d: common_vendor.p({
      visible: $data.showFilterModal,
      filter: $data.filterParams
    }),
    e: common_vendor.j({
      "close": common_vendor.o(($event) => $data.showQrcodeModal = false, "31")
    }),
    f: common_vendor.p({
      visible: $data.showQrcodeModal,
      qrcodeUrl: $data.groupQrcode,
      title: "告白时刻Daily公众号"
    }),
    g: common_vendor.j({
      "close": common_vendor.o(($event) => $data.showVipPopup = false, "e4"),
      "pay": common_vendor.o($options.handleVipPay, "f3")
    }),
    h: common_vendor.p({
      visible: $data.showVipPopup
    }),
    i: common_vendor.p({
      title: "单身库",
      isShowBack: false,
      backgroundImage: "/static/bg4.png"
    }),
    j: $data.banners.length > 0
  }, $data.banners.length > 0 ? {
    k: common_vendor.f($data.banners, (banner, index, i0) => {
      return {
        a: banner.image,
        b: index
      };
    })
  } : {}, {
    l: $data.currentTab === 0 ? 1 : "",
    m: common_vendor.o(($event) => $options.switchTab(0), "c1"),
    n: $data.currentTab === 1 ? 1 : "",
    o: common_vendor.o(($event) => $options.switchTab(1), "0a"),
    p: $data.currentTab !== 2
  }, $data.currentTab !== 2 ? {
    q: common_assets._imports_0$2,
    r: common_vendor.o(($event) => $data.showFilterModal = true, "3f")
  } : {}, {
    s: $data.currentTab !== 2
  }, $data.currentTab !== 2 ? common_vendor.e({
    t: common_vendor.f($data.users, (user, index, i0) => {
      return common_vendor.e({
        a: user.avatar,
        b: common_vendor.t(user.age),
        c: common_vendor.t(user.nickname || "匿名用户"),
        d: user.gender === 1 ? "/static/m.png" : "/static/wm.png",
        e: common_vendor.t(user.city),
        f: user.tags && user.tags.length > 0
      }, user.tags && user.tags.length > 0 ? {
        g: common_vendor.f(user.tags.slice(0, 3), (tag, idx, i1) => {
          return {
            a: common_vendor.t(tag),
            b: idx
          };
        })
      } : user.education ? {
        i: common_vendor.t(user.education)
      } : {}, {
        h: user.education,
        j: user.id,
        k: common_vendor.o(($event) => $options.goUserDetail(user.id), user.id)
      });
    }),
    v: $data.showUnlock
  }, $data.showUnlock ? common_vendor.e({
    w: $data.extraUsers.length > 0
  }, $data.extraUsers.length > 0 ? {
    x: common_vendor.f($data.extraUsers.slice(0, 5), (user, idx, i0) => {
      return {
        a: user.avatar + "?imageView2/1/w/80/h/80/q/50",
        b: idx
      };
    })
  } : {}, {
    y: common_vendor.o((...args) => $options.handleUnlockClick && $options.handleUnlockClick(...args), "26")
  }) : {}) : {}, {
    z: $data.currentTab === 2
  }, $data.currentTab === 2 ? {
    A: common_vendor.f($data.coupleList, (item, index, i0) => {
      return {
        a: item.avatar,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.register_date),
        d: common_vendor.t(item.success_date),
        e: common_vendor.t(item.matched_way),
        f: index
      };
    })
  } : {}, {
    B: $data.hasMore
  }, $data.hasMore ? {
    C: common_vendor.t($data.loading ? "加载中..." : "加载更多"),
    D: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "38")
  } : {}, {
    E: !$data.loading && $options.currentList.length === 0
  }, !$data.loading && $options.currentList.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-79df256d"]]);
xhs.createPage(MiniProgramPage);
