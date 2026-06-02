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
      displayBanners: [],
      bannerCurrent: 0,
      bannerRealIndex: 0,
      bannerTimer: null,
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
    this.initTabByGender();
    this.loadBanners();
    this.loadUsers();
  },
  onShow() {
    this.startBannerAutoplay();
    this.checkProfileCompletion();
  },
  onHide() {
    this.stopBannerAutoplay();
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
    // 根据当前用户性别初始化默认Tab：展示异性嘉宾
    initTabByGender() {
      const userinfo = common_vendor.index.getStorageSync("userinfo") || {};
      const userGender = Number(userinfo.gender);
      if (userGender === 2) {
        this.currentTab = 1;
      } else if (userGender === 1) {
        this.currentTab = 0;
      }
    },
    // 加载Banner
    async loadBanners() {
      try {
        const res = await api_index.getBanners("single");
        this.banners = res.data.list || [];
        this.buildDisplayBanners();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/single/index.vue:266", "加载Banner失败", e);
      }
    },
    // 构建首尾复制的轮播数组，实现无缝衔接
    buildDisplayBanners() {
      if (this.banners.length <= 1) {
        this.displayBanners = this.banners;
        this.bannerCurrent = 0;
        this.bannerRealIndex = 0;
        return;
      }
      const first = this.banners[0];
      const last = this.banners[this.banners.length - 1];
      this.displayBanners = [last, ...this.banners, first];
      this.bannerCurrent = 1;
      this.bannerRealIndex = 0;
    },
    // 轮播动画结束：处理首尾复制边界的静默跳转
    onBannerAnimationFinish(e) {
      const current = e.detail.current;
      const len = this.displayBanners.length;
      const realLen = this.banners.length;
      if (realLen <= 1)
        return;
      if (current === len - 1) {
        this.bannerCurrent = 1;
        this.bannerRealIndex = 0;
      } else if (current === 0) {
        this.bannerCurrent = len - 2;
        this.bannerRealIndex = realLen - 1;
      } else {
        this.bannerRealIndex = current - 1;
      }
    },
    // 启动自动轮播
    startBannerAutoplay() {
      this.stopBannerAutoplay();
      if (this.banners.length <= 1)
        return;
      this.bannerTimer = setInterval(() => {
        let next = this.bannerCurrent + 1;
        if (next >= this.displayBanners.length) {
          next = 0;
        }
        this.bannerCurrent = next;
      }, 3e3);
    },
    // 停止自动轮播
    stopBannerAutoplay() {
      if (this.bannerTimer) {
        clearInterval(this.bannerTimer);
        this.bannerTimer = null;
      }
    },
    // 触摸轮播时暂停自动播放
    onBannerTouchStart() {
      this.stopBannerAutoplay();
    },
    // 触摸结束后恢复自动播放
    onBannerTouchEnd() {
      this.startBannerAutoplay();
    },
    // 加载用户列表（备份原方法）
    async loadUsers() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const params = {
          gender: this.currentTab === 0 ? 2 : 1,
          is_single: 1,
          page: this.page,
          limit: this.isVip ? 20 : 6,
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
        common_vendor.index.__f__("error", "at pages/single/index.vue:371", "加载用户列表失败", e);
      } finally {
        this.loading = false;
      }
    },
    // 重构加载用户列表（仅展示6条）
    // async loadUsers() {
    //   if (this.loading) return;
    //   this.loading = true;
    //   try {
    //     const params = {
    //       gender: this.currentTab === 0 ? 2 : 1,
    //       is_single: 1,
    //       ...this.filterParams
    //     };
    //     const res = await getUserList(params);
    //     const list = res.data.list || [];
    //     // 仅展示前6条数据
    //     this.users = list.slice(0, 6);
    //     this.hasMore = false;
    //   } catch (e) {
    //     uni.__f__('error','at pages/single/index.vue:395','加载用户列表失败', e);
    //   } finally {
    //     this.loading = false;
    //   }
    // },
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
        common_vendor.index.__f__("error", "at pages/single/index.vue:423", "加载脱单案例失败", e);
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
      if (tab === 3) {
        common_vendor.index.navigateTo({
          url: "/pages/action/index"
        });
        return;
      }
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
    a: common_vendor.o(_ctx.onProfileGuide, "5c"),
    b: common_vendor.o(_ctx.onProfileDismiss, "1a"),
    c: common_vendor.p({
      visible: _ctx.showProfileModal,
      percent: _ctx.profilePercent,
      ["missing-fields"]: _ctx.profileMissingFields
    }),
    d: common_vendor.o($options.onFilterConfirm, "ba"),
    e: common_vendor.o(($event) => $data.showFilterModal = false, "bc"),
    f: common_vendor.p({
      visible: $data.showFilterModal,
      filter: $data.filterParams
    }),
    g: common_vendor.o(($event) => $data.showQrcodeModal = false, "62"),
    h: common_vendor.p({
      visible: $data.showQrcodeModal,
      qrcodeUrl: $data.groupQrcode,
      title: "告白时刻Daily公众号"
    }),
    i: common_vendor.o(($event) => $data.showVipPopup = false, "ca"),
    j: common_vendor.o($options.handleVipPay, "93"),
    k: common_vendor.p({
      visible: $data.showVipPopup
    }),
    l: common_vendor.p({
      title: "单身库",
      isShowBack: false,
      backgroundImage: "/static/bg4.png"
    }),
    m: $data.displayBanners.length > 0
  }, $data.displayBanners.length > 0 ? {
    n: common_vendor.f($data.displayBanners, (banner, index, i0) => {
      return {
        a: banner.image,
        b: index
      };
    }),
    o: $data.bannerCurrent,
    p: common_vendor.o((...args) => $options.onBannerAnimationFinish && $options.onBannerAnimationFinish(...args), "cd"),
    q: common_vendor.o((...args) => $options.onBannerTouchStart && $options.onBannerTouchStart(...args), "da"),
    r: common_vendor.o((...args) => $options.onBannerTouchEnd && $options.onBannerTouchEnd(...args), "a9")
  } : {}, {
    s: $data.banners.length > 1
  }, $data.banners.length > 1 ? {
    t: common_vendor.f($data.banners, (item, index, i0) => {
      return {
        a: index,
        b: $data.bannerRealIndex === index ? 1 : ""
      };
    })
  } : {}, {
    v: $data.currentTab === 0 ? 1 : "",
    w: common_vendor.o(($event) => $options.switchTab(0), "90"),
    x: $data.currentTab === 1 ? 1 : "",
    y: common_vendor.o(($event) => $options.switchTab(1), "5c"),
    z: $data.currentTab === 2 ? 1 : "",
    A: common_vendor.o(($event) => $options.switchTab(3), "2e"),
    B: $data.currentTab !== 2
  }, $data.currentTab !== 2 ? {
    C: common_assets._imports_0$2,
    D: common_vendor.o(($event) => $data.showFilterModal = true, "c1")
  } : {}, {
    E: $data.currentTab !== 2
  }, $data.currentTab !== 2 ? common_vendor.e({
    F: common_vendor.f($data.users, (user, index, i0) => {
      return common_vendor.e({
        a: user.avatar,
        b: common_vendor.t(user.age),
        c: common_vendor.t(user.nickname || "匿名用户"),
        d: user.gender === 1 ? "/static/m.png" : "/static/wm.png",
        e: common_vendor.t(user.city_t),
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
        k: common_vendor.o(($event) => $options.goUserDetail(user.id), "d6")
      });
    }),
    G: $data.showUnlock
  }, $data.showUnlock ? common_vendor.e({
    H: $data.extraUsers.length > 0
  }, $data.extraUsers.length > 0 ? {
    I: common_vendor.f($data.extraUsers.slice(0, 5), (user, idx, i0) => {
      return {
        a: user.avatar + "?imageView2/1/w/80/h/80/q/50",
        b: idx
      };
    })
  } : {}, {
    J: common_vendor.o((...args) => $options.handleUnlockClick && $options.handleUnlockClick(...args), "b0")
  }) : {}) : {}, {
    K: $data.currentTab === 2
  }, $data.currentTab === 2 ? {
    L: common_vendor.f($data.coupleList, (item, index, i0) => {
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
    M: $data.hasMore
  }, $data.hasMore ? {
    N: common_vendor.t($data.loading ? "加载中..." : "加载更多"),
    O: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args), "ef")
  } : {}, {
    P: !$data.loading && $options.currentList.length === 0
  }, !$data.loading && $options.currentList.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-79df256d"]]);
tt.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-toutiao/pages/single/index.js.map
