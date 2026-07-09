"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_profileCheck = require("../../utils/profileCheck.js");
const utils_config = require("../../utils/config.js");
const common_assets = require("../../common/assets.js");
const CenterModal = () => "../../components/center-modal.js";
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: {
    CenterModal,
    CustomNavBar
  },
  mixins: [utils_profileCheck.profileCheckMixin],
  data() {
    return {
      users: [],
      currentIndex: 0,
      loading: false,
      page: 1,
      limit: 10,
      hasMore: true,
      // 居中弹框
      showCenterModal: false,
      centerModalTitle: "提示",
      centerModalContent: "",
      centerModalConfirmText: "确定",
      centerModalCancelText: "取消",
      centerModalOnConfirm: null
      // 确认回调
    };
  },
  computed: {
    currentUser() {
      return this.users[this.currentIndex] || null;
    },
    hasEnoughContent() {
      const user = this.currentUser;
      if (!user)
        return false;
      return !!(user.intro || user.images && user.images.length > 2 || user.soul_answers && user.soul_answers.length > 0 || user.my_tags && user.my_tags.length > 2);
    }
  },
  onLoad() {
    this.loadRecommendList();
  },
  onShow() {
    this.checkProfileCompletion();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.users = [];
    this.hasMore = true;
    this.loadRecommendList().then(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  onShareAppMessage() {
    const loginUser = common_vendor.index.getStorageSync("userinfo") || {};
    const inviterId = loginUser.id || "";
    const shareConfig = {
      title: `告白时刻Daily`,
      content: "小红书小程序拯救单身互联网人",
      // todo：分享图片写死图片
      imageUrl: this.currentUser.blur_avatar ? this.currentUser.blur_avatar : utils_config.config.curlRef + "/uploads/sharecover.jpg",
      path: `/pages/user/detail?id=${this.currentUser.id}&share=true&inviter_id=${inviterId}`
    };
    console.log("[ShareDebug] 首页分享:", shareConfig, "currentUser:", this.currentUser);
    if (this.currentUser) {
      return shareConfig;
    }
    return {
      title: "告白时刻Daily - 遇见对的人",
      content: "小红书小程序拯救单身互联网人",
      path: "/pages/user/detail?id=${this.currentUser.id}&share=true&inviter_id=${inviterId}",
      // 26.04.25 @zq todo: 分享的图片先临时用服务器上照片
      imageUrl: this.currentUser.blur_avatar ? this.currentUser.blur_avatar : utils_config.config.curlRef + "/uploads/sharecover.jpg"
    };
  },
  methods: {
    // 过滤标签中的链接内容
    filterTags(tags) {
      if (!tags || !Array.isArray(tags))
        return [];
      const urlPattern = /(https?:\/\/|www\.)/i;
      return tags.filter((tag) => tag && !urlPattern.test(tag));
    },
    getActionRequiredMissingFields() {
      const optionalFields = ["家乡", "职业", "是否购房", "微信号"];
      return (this.profileMissingFields || []).filter((field) => !optionalFields.includes(field));
    },
    onCardSwiperChange(e) {
      var _a;
      const nextIndex = typeof ((_a = e.detail) == null ? void 0 : _a.current) === "number" ? e.detail.current : 0;
      if (nextIndex !== this.currentIndex) {
        this.currentIndex = nextIndex;
      }
    },
    onCardSwiperAnimationFinish(e) {
      var _a;
      const nextIndex = typeof ((_a = e.detail) == null ? void 0 : _a.current) === "number" ? e.detail.current : this.currentIndex;
      this.currentIndex = nextIndex;
      this.tryLoadMore();
    },
    // 加载推荐列表
    async loadRecommendList() {
      if (this.loading)
        return;
      this.loading = true;
      try {
        const res = await api_index.getRecommendList({
          page: this.page,
          limit: this.limit
        });
        const list = res.data.list || [];
        if (this.page === 1) {
          this.users = list;
        } else {
          this.users = [...this.users, ...list];
        }
        this.hasMore = res.data.hasMore;
      } catch (e) {
        console.error("加载推荐列表失败", e);
        if (e._isAuthError) {
          this.users = [];
          this.hasMore = false;
          this.checkLogin();
        }
      } finally {
        this.loading = false;
      }
    },
    tryLoadMore() {
      if (this.currentIndex >= this.users.length - 3 && this.hasMore && !this.loading) {
        this.page++;
        this.loadRecommendList();
      }
    },
    // 预览头像
    previewAvatar(user) {
      common_vendor.index.previewImage({
        current: user.avatar,
        urls: [user.avatar]
      });
    },
    // 预览照片
    previewImages(images, index) {
      common_vendor.index.previewImage({
        current: index,
        urls: images
      });
    },
    // 检查登录
    checkLogin() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再操作",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/login/index" });
            }
          }
        });
        return false;
      }
      return true;
    },
    // 检查资料完成度
    async checkProfileComplete() {
      try {
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return false;
        }
        const userInfo = common_vendor.index.getStorageSync("userinfo") || common_vendor.index.getStorageSync("userInfo") || {};
        console.log("用户资料:", userInfo);
        const requiredFields = [
          { key: "birthday", name: "出生年份", altKeys: ["birthday"] },
          { key: "marital_status", name: "婚况", altKeys: ["marital_status", "maritalStatus", "marriage"] },
          { key: "province", name: "所在省份", altKeys: ["province", "provinceId", "province_id"] },
          { key: "city", name: "所在城市", altKeys: ["city", "cityId", "city_id"] },
          { key: "education", name: "学历", altKeys: ["education", "education_level"] },
          { key: "job", name: "职业", altKeys: ["job", "occupation", "profession", "position"] },
          { key: "income", name: "年收入", altKeys: ["income", "annual_income"] },
          { key: "has_house", name: "是否购房", altKeys: ["has_house", "hasHouse", "house"] },
          { key: "nickname", name: "昵称", altKeys: ["nickname"] },
          { key: "has_car", name: "是否购车", altKeys: ["has_car"] },
          { key: "intro", name: "自我介绍", altKeys: ["intro"] },
          { key: "my_tags", name: "我的标签", altKeys: ["my_tags"] },
          { key: "ideal_intro", name: "择偶要求", altKeys: ["ideal_intro"] },
          { key: "ideal_tags", name: "择偶标签", altKeys: ["ideal_tags"] },
          { key: "wechat", name: "微信号", altKeys: ["wechat", "wechatNo", "wechat_no"] }
        ];
        const missingFields = [];
        for (const field of requiredFields) {
          let value = null;
          for (const key of field.altKeys) {
            if (userInfo[key] !== void 0 && userInfo[key] !== null && userInfo[key] !== "") {
              value = userInfo[key];
              break;
            }
          }
          console.log(`校验：${field.name}: ${value}`);
          if (value === null || value === void 0 || value === "") {
            missingFields.push(field.name);
          }
        }
        console.log("缺少的字段:", missingFields);
        if (missingFields.length > 0) {
          this.centerModalTitle = "资料完善提醒";
          this.centerModalContent = `为方便他人联系，请先完善以下资料：${missingFields.join("、")}
资料越真实完整，对方通过你申请的概率越高哦～`;
          this.centerModalConfirmText = "去完善";
          this.centerModalCancelText = "取消";
          this.centerModalOnConfirm = () => {
            this.onProfileGuide();
          };
          this.showCenterModal = true;
          return false;
        }
        return true;
      } catch (error) {
        console.error("检查资料失败:", error);
        common_vendor.index.showToast({
          title: "检查资料失败",
          icon: "none"
        });
        return false;
      }
    },
    // 检查认证完成度（实名+真人）
    checkAuthComplete() {
      const userInfo = common_vendor.index.getStorageSync("userinfo") || common_vendor.index.getStorageSync("userInfo") || {};
      if (!userInfo.is_verified || !userInfo.is_education) {
        const missingAuths = [];
        if (!userInfo.is_verified)
          missingAuths.push("实名认证");
        if (!userInfo.is_education)
          missingAuths.push("学历认证");
        common_vendor.index.showModal({
          title: "认证提醒",
          content: `请先完成${missingAuths.join("、")}后再发起联系`,
          confirmText: "去认证",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.navigateTo({ url: "/pages/auth/index" });
            }
          }
        });
        return false;
      }
      return true;
    },
    // 关注/取消关注
    async handleFollow() {
      console.log("this.currentUser:", this.currentUser);
      if (!this.checkLogin())
        return;
      if (!await this.checkProfileComplete())
        return;
      if (!this.currentUser)
        return;
      try {
        const res = await api_index.toggleFollow({ user_id: this.currentUser.id });
        this.currentUser.is_followed = res.data.is_followed;
        common_vendor.index.showToast({
          title: this.currentUser.is_followed ? "关注成功" : "取消关注",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "操作失败", icon: "none" });
      }
    },
    // 联系
    async handleContact() {
      if (!this.checkLogin())
        return;
      if (!await this.checkProfileComplete())
        return;
      if (!this.checkAuthComplete())
        return;
      if (!this.currentUser)
        return;
      common_vendor.index.showModal({
        title: "发起联系申请",
        content: "消耗10脱单币发起好友申请，对方同意后可查看联系方式",
        confirmText: "确认申请",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_index.sendRequest({ target_id: this.currentUser.id, message: "想认识你" });
              common_vendor.index.showToast({ title: "申请已发送", icon: "success" });
            } catch (e) {
              common_vendor.index.showToast({ title: e.msg || "申请失败", icon: "none" });
            }
          }
        }
      });
    },
    // 客服
    handleService() {
      common_vendor.index.showModal({
        title: "联系客服",
        content: "如有问题请联系客服咨询",
        showCancel: false
      });
    },
    // 客服消息回调
    handleServiceContact(e) {
      console.log("客服消息事件", e);
    },
    // 订阅（开通VIP）
    handleSubscribe() {
      common_vendor.index.navigateTo({
        url: "/pages/vip/index"
      });
    },
    // 跳转到我想看的页面
    goToWantPage() {
      common_vendor.index.navigateTo({
        url: "/pages/want/my"
      });
    },
    // 居中弹框确认
    onCenterModalConfirm() {
      this.showCenterModal = false;
      if (this.centerModalOnConfirm) {
        this.centerModalOnConfirm();
        this.centerModalOnConfirm = null;
      }
    },
    // 居中弹框取消
    onCenterModalCancel() {
      this.showCenterModal = false;
      this.centerModalOnConfirm = null;
    }
  }
};
if (!Array) {
  const _component_center_modal = common_vendor.resolveComponent("center-modal");
  const _component_uni_popup_message = common_vendor.resolveComponent("uni-popup-message");
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  const _component_custom_nav_bar = common_vendor.resolveComponent("custom-nav-bar");
  (_component_center_modal + _component_uni_popup_message + _component_uni_popup + _component_custom_nav_bar)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.j({
      "confirm": common_vendor.o($options.onCenterModalConfirm, "a2"),
      "cancel": common_vendor.o($options.onCenterModalCancel, "18")
    }),
    b: common_vendor.p({
      visible: $data.showCenterModal,
      title: $data.centerModalTitle,
      content: $data.centerModalContent,
      ["confirm-text"]: $data.centerModalConfirmText,
      ["cancel-text"]: $data.centerModalCancelText
    }),
    c: common_vendor.p({
      type: "success",
      message: "成功消息",
      duration: 2e3
    }),
    d: common_vendor.sr("popup", "1cf27b2a-1"),
    e: common_vendor.p({
      type: "message"
    }),
    f: common_vendor.p({
      backgroundImage: "/static/bg3.png",
      fontColor: "#6853F0",
      isShowLeft: false,
      isShowRight: false
    }),
    g: $data.loading && $data.users.length === 0
  }, $data.loading && $data.users.length === 0 ? {
    h: common_assets._imports_0
  } : {}, {
    i: $data.users.length > 0
  }, $data.users.length > 0 ? {
    j: common_vendor.f($data.users, (user, index, i0) => {
      return common_vendor.e({
        a: user.avatar,
        b: common_vendor.t(user.nickname),
        c: user.gender === 1 ? "/static/m.png" : "/static/wm.png",
        d: user.is_vip
      }, user.is_vip ? {
        e: common_assets._imports_1$1
      } : {}, {
        f: common_vendor.t(user.age),
        g: user.age && (user.height || user.education)
      }, user.age && (user.height || user.education) ? {} : {}, {
        h: user.height
      }, user.height ? {
        i: common_vendor.t(user.height)
      } : {}, {
        j: user.height && user.education
      }, user.height && user.education ? {} : {}, {
        k: user.education
      }, user.education ? {
        l: common_vendor.t(user.education)
      } : {}, {
        m: user.is_verified || user.is_realface || user.is_education
      }, user.is_verified || user.is_realface || user.is_education ? common_vendor.e({
        n: common_assets._imports_3$1,
        o: user.is_verified
      }, user.is_verified ? {
        p: common_assets._imports_3$2
      } : {}, {
        q: user.is_realface
      }, user.is_realface ? {
        r: common_assets._imports_4$1
      } : {}, {
        s: user.is_education
      }, user.is_education ? {} : {}) : {}, {
        t: user.intro
      }, user.intro ? {
        v: common_assets._imports_4$2,
        w: common_vendor.t(user.intro)
      } : {}, {
        x: user.my_tags && user.my_tags.length > 0
      }, user.my_tags && user.my_tags.length > 0 ? {
        y: common_assets._imports_9$1,
        z: common_vendor.f($options.filterTags(user.my_tags), (tag, idx, i1) => {
          return {
            a: common_vendor.t(tag),
            b: idx
          };
        })
      } : {}, {
        A: user.job
      }, user.job ? {
        B: common_vendor.t(user.job)
      } : {}, {
        C: user.company
      }, user.company ? {
        D: common_vendor.t(user.company)
      } : {}, {
        E: user.school
      }, user.school ? {
        F: common_vendor.t(user.school)
      } : {}, {
        G: user.hometown_city
      }, user.hometown_city ? {
        H: common_vendor.t(user.hometown_province_t),
        I: common_vendor.t(user.hometown_city_t)
      } : {}, {
        J: common_vendor.t(user.has_car ? "是" : "否"),
        K: common_vendor.t(user.has_house ? "是" : "否"),
        L: user.images && user.images.length > 0
      }, user.images && user.images.length > 0 ? {
        M: common_assets._imports_7,
        N: common_vendor.f(user.images, (img, idx, i1) => {
          return {
            a: idx,
            b: img,
            c: common_vendor.o(($event) => $options.previewImages(user.images, idx), idx)
          };
        })
      } : {}, {
        O: user.soul_answers && user.soul_answers.length > 0
      }, user.soul_answers && user.soul_answers.length > 0 ? {
        P: common_vendor.f(user.soul_answers, (item, idx, i1) => {
          return {
            a: common_vendor.t(item.question),
            b: common_vendor.t(item.answer),
            c: idx
          };
        })
      } : {}, {
        Q: user.ideal_intro || user.ideal_tags && user.ideal_tags.length > 0
      }, user.ideal_intro || user.ideal_tags && user.ideal_tags.length > 0 ? common_vendor.e({
        R: common_assets._imports_8,
        S: user.ideal_intro
      }, user.ideal_intro ? {
        T: common_vendor.t(user.ideal_intro)
      } : {}, {
        U: $options.filterTags(user.ideal_tags).length > 0
      }, $options.filterTags(user.ideal_tags).length > 0 ? {
        V: common_vendor.f($options.filterTags(user.ideal_tags), (tag, idx, i1) => {
          return {
            a: common_vendor.t(tag),
            b: idx
          };
        })
      } : {}) : {}, !$options.hasEnoughContent ? {} : {}, {
        W: user.id || index
      });
    }),
    k: common_assets._imports_3$1,
    l: !$options.hasEnoughContent,
    m: $data.currentIndex,
    n: common_vendor.o((...args) => $options.onCardSwiperChange && $options.onCardSwiperChange(...args), "a7"),
    o: common_vendor.o((...args) => $options.onCardSwiperAnimationFinish && $options.onCardSwiperAnimationFinish(...args), "dd")
  } : {}, {
    p: !$data.loading && $data.users.length === 0
  }, !$data.loading && $data.users.length === 0 ? {
    q: common_assets._imports_0,
    r: common_vendor.o((...args) => $options.loadRecommendList && $options.loadRecommendList(...args), "24")
  } : {}, {
    s: $data.users.length > 0 && $options.currentUser
  }, $data.users.length > 0 && $options.currentUser ? {
    t: $options.currentUser.is_followed ? "/static/ygz.png" : "/static/Frame 1420074377.png",
    v: $options.currentUser.is_followed ? 1 : "",
    w: common_vendor.o((...args) => $options.handleFollow && $options.handleFollow(...args), "bb"),
    x: common_assets._imports_9,
    y: common_vendor.o((...args) => $options.handleContact && $options.handleContact(...args), "67"),
    z: common_assets._imports_10,
    A: common_vendor.o((...args) => $options.handleServiceContact && $options.handleServiceContact(...args), "5e")
  } : {}, {
    B: $data.users.length > 0
  }, $data.users.length > 0 ? {
    C: common_assets._imports_11
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
_sfc_main.__runtimeHooks = 2;
xhs.createPage(MiniProgramPage);
