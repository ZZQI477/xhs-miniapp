"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_config = require("../../utils/config.js");
const utils_guestAuth = require("../../utils/guestAuth.js");
const common_assets = require("../../common/assets.js");
const CenterModal = () => "../../components/center-modal.js";
const _sfc_main = {
  name: "UserDetail",
  components: {
    CenterModal
  },
  data() {
    return {
      // 8种渐变色背景
      gradientColors: [
        "linear-gradient(158deg, #FF89F0 0%, #FB7798 100%)",
        "linear-gradient(164deg, #FF9293 0%, #F87E7B 100%)",
        "linear-gradient(148deg, #8D92F8 0%, #8B8BFB 100%)",
        "linear-gradient(143deg, #18DC9B 0%, #00C181 100%)",
        "linear-gradient(160deg, #FCC58A 0%, #F5B84D 100%)",
        "linear-gradient(153deg, #ACB4FF 0%, #5867FF 100%)",
        "linear-gradient(155deg, #BCA4FF 0%, #8D75E4 100%)",
        "linear-gradient(151deg, #5FD3FC 0%, #4BA6FF 100%)",
        "linear-gradient(143deg, #FF9F6A 0%, #FF6A17 100%)"
      ],
      // 认证项配置
      authItems: [
        {
          iconAuth: "/static/images/identify-id-green.png",
          iconUnauth: "/static/images/identify-id-grey.png",
          titleAuth: "实名认证",
          titleUnauth: "实名认证",
          bgColorAuth: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        {
          iconAuth: "/static/images/identify-real-blue.png",
          iconUnauth: "/static/images/identify-real-grey.png",
          titleAuth: "真人认证",
          titleUnauth: "真人认证",
          bgColorAuth: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        }
      ],
      // 好友标签
      friendLabels: ["甲", "乙", "丙", "丁"],
      // 响应式数据
      userId: "",
      navBarHeight: 0,
      showTopAd: true,
      scrollIntoView: "",
      loading: true,
      isBindMode: false,
      isAdSource: false,
      isShareVisitor: false,
      showShareRegisterPopup: false,
      userNotFound: false,
      // 用户不存在/已删除
      userDeletedMsg: "",
      // 用户删除的提示信息
      contactFieldName: "微信号",
      recommendList: [],
      userInfo: {
        gender: "男",
        name: "",
        avatar: "",
        blur_avatar: "",
        common_tags: [],
        birthday: 0,
        height: 0,
        livingPlace: "",
        hometown: "",
        education: "",
        school: "",
        job: "",
        position: "",
        introduce: "",
        tags: [],
        questionAnswer: [],
        friends_impression: [],
        idealPartner: {
          introduce: "",
          tags: []
        },
        privacyInfo: {
          id: "",
          phone: "",
          wechatNo: "",
          qqNo: "",
          income: 0,
          familyBackground: "",
          relationshipHistory: "",
          hasHouse: false,
          hasCar: false,
          otherAssets: false
        },
        friendRequest: null,
        isFollow: false,
        isBuy: false,
        isLogout: false,
        headList: [],
        imgList: [],
        isRealName: false
      },
      // 居中弹框
      showCenterModal: false,
      centerModalTitle: "提示",
      centerModalContent: "",
      centerModalConfirmText: "确定",
      centerModalCancelText: "取消",
      centerModalOnConfirm: null
    };
  },
  computed: {
    formatIntroduce() {
      return this.userInfo.introduce ? this.userInfo.introduce.replace(/\\n/g, "\n") : "";
    },
    formatIdealPartner() {
      var _a;
      return ((_a = this.userInfo.idealPartner) == null ? void 0 : _a.introduce) ? this.userInfo.idealPartner.introduce.replace(/\\n/g, "\n") : "";
    },
    hasIdealPartner() {
      if (!this.userInfo.idealPartner)
        return false;
      const filteredTags = this.filterTags(this.userInfo.idealPartner.tags);
      return !!(this.userInfo.idealPartner.introduce || filteredTags.length > 0);
    }
  },
  onLoad(options) {
    this.userId = options.id || options.user_id || "";
    this.isShareVisitor = options.share === "true" || options.share === "1";
    const inviterId = Number(options.inviter_id || 0);
    if (inviterId > 0) {
      common_vendor.index.setStorageSync("share_inviter_id", inviterId);
    }
    const systemInfo = common_vendor.index.getSystemInfoSync();
    this.navBarHeight = systemInfo.statusBarHeight + 44;
    if (this.isShareVisitor && !common_vendor.index.getStorageSync("token")) {
      this.showShareRegisterPopup = true;
    }
    if (this.userId) {
      this.loadUserDetail();
      this.loadRecommendList();
    }
  },
  onShareAppMessage() {
    var _a;
    console.log("头像", this.userInfo.blur_avatar);
    const loginUser = common_vendor.index.getStorageSync("userinfo") || {};
    const inviterId = loginUser.id || "";
    let shareImageUrl = this.userInfo.avatar ? this.userInfo.blur_avatar : utils_config.config.curlRef + "/uploads/sharecover.jpg";
    console.log("[ShareDebug] 分享卡片配置:", {
      title: `我发现一个不错的人：${this.userInfo.name}`,
      imageUrl: shareImageUrl,
      imgListLength: ((_a = this.userInfo.imgList) == null ? void 0 : _a.length) || 0,
      avatar: this.userInfo.avatar || "(empty)",
      userId: this.userId
    });
    return {
      title: `告白时刻Daily - 遇见对的人`,
      content: "小红书小程序拯救单身互联网人",
      // title: `我发现一个不错的人：${this.userInfo.name}`,
      imageUrl: shareImageUrl,
      path: `/pages/user/detail?id=${this.userId}&share=true&inviter_id=${inviterId}`
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
    async loadUserDetail() {
      try {
        this.loading = true;
        const res = await api_index.getUserDetail(this.userId);
        console.log("用户详情API返回:", res);
        if (res && res.data && res.data.user) {
          console.log("用户数据:", res.data.user);
          console.log("用户图片:", res.data.user.images);
          console.log("用户头像:", res.data.user.avatar);
          this.userInfo = this.transformUserData(res.data.user);
          console.log("转换后的userInfo:", this.userInfo);
          console.log("图片列表imgList:", this.userInfo.imgList);
          this.debugCheckImage(this.userInfo.avatar, "头像");
          if (this.userInfo.imgList.length > 0) {
            this.debugCheckImage(this.userInfo.imgList[0], "照片墙第1张");
          }
        }
      } catch (error) {
        console.error("加载用户详情失败:", error);
        const isUserNotFound = error.code === 404 || error.code === 0 || error.msg && /用户不存在|用户已删除|用户已注销|not found/i.test(error.msg);
        const isAuthError = error._isAuthError || error.code === 401;
        if (isUserNotFound) {
          this.userNotFound = true;
          this.userDeletedMsg = error.msg || "该用户不存在或已注销";
          console.log("[Detail] 用户不存在，切换为游客态浏览");
        } else if (isAuthError) {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.removeStorageSync("userinfo");
          common_vendor.index.removeStorageSync("userInfo");
          common_vendor.index.removeStorageSync("xhs_openid");
          common_vendor.index.setStorageSync("is_guest_mode", true);
          console.log("[Detail] 登录状态过期，已清除本地存储，降级为游客态");
          if (this.isShareVisitor) {
            this.showShareRegisterPopup = true;
          }
        } else {
          common_vendor.index.showToast({
            title: error.msg || "加载失败，请稍后重试",
            icon: "none"
          });
        }
      } finally {
        this.loading = false;
      }
    },
    transformUserData(user) {
      let imgList = [];
      if (user.images) {
        if (Array.isArray(user.images) && user.images.length > 0) {
          imgList = user.images.filter((img) => img && typeof img === "string" && img.length > 0);
        } else if (typeof user.images === "string") {
          try {
            const parsed = JSON.parse(user.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
              imgList = parsed.filter((img) => img && typeof img === "string" && img.length > 0);
            }
          } catch (e) {
            console.error("解析图片JSON失败:", e);
          }
        }
      }
      console.log("处理后的图片列表:", imgList);
      return {
        isFollow: user.is_followed || false,
        isBuy: user.can_view_wechat || false,
        isLogout: !user.is_single,
        blur_avatar: user.blur_avatar || "",
        headList: [],
        imgList,
        avatar: user.avatar || "",
        gender: user.gender === 1 ? "男" : "女",
        name: user.nickname || "",
        isRealName: user.is_verified || false,
        common_tags: user.my_tags || [],
        birthday: user.age || 0,
        height: user.height || 0,
        livingPlace: `${user.province || ""}${user.city || ""}`,
        hometown: `${user.hometown_province || ""}${user.hometown_city || ""}`,
        hometown_t: `${user.hometown_province_t || ""}${user.hometown_city_t || ""}`,
        education: user.education || "",
        school: user.school || "",
        job: user.job || "",
        position: user.job || "",
        introduce: user.intro || "",
        tags: user.my_tags || [],
        questionAnswer: user.soul_answers || [],
        friends_impression: [],
        idealPartner: {
          introduce: user.ideal_intro || "",
          tags: user.ideal_tags || []
        },
        privacyInfo: {
          id: user.id,
          phone: "",
          wechatNo: user.wechat || "",
          qqNo: "",
          income: user.income || 0,
          familyBackground: "",
          relationshipHistory: "",
          hasHouse: user.has_house ? "是" : "否",
          hasCar: user.has_car ? "是" : "否",
          otherAssets: false
        },
        friendRequest: null
      };
    },
    async loadRecommendList() {
    },
    calculateAge(birthday) {
      if (!birthday)
        return 0;
      const birthYear = new Date(birthday).getFullYear();
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      return currentYear - birthYear;
    },
    previewImage(index) {
      if (this.userInfo.imgList && this.userInfo.imgList.length > 0) {
        common_vendor.index.previewImage({
          urls: this.userInfo.imgList,
          current: this.userInfo.imgList[index]
        });
      }
    },
    handleImageError(e) {
      console.error("[ImageDebug] 图片加载失败:", e);
    },
    handleAvatarError(e) {
      console.error("[ImageDebug] 头像加载失败，清空avatar使用默认图标:", e);
      this.userInfo.avatar = "";
    },
    // 调试用：验证图片URL是否可访问
    debugCheckImage(url, label = "图片") {
      if (!url) {
        console.warn(`[ImageDebug] ${label}: URL为空`);
        return;
      }
      console.log(`[ImageDebug] ${label} URL:`, url);
      if (url.startsWith("/static/")) {
        console.log(`[ImageDebug] ${label}: 本地图片，路径正确`);
        return;
      }
      common_vendor.index.getImageInfo({
        src: url,
        success: (res) => {
          console.log(`[ImageDebug] ${label} 验证成功:`, res.width + "x" + res.height, res.type);
        },
        fail: (err) => {
          console.error(`[ImageDebug] ${label} 验证失败:`, err.errMsg, "URL:", url);
        }
      });
    },
    // 检查是否已登录，未登录则弹出注册引导
    requireLogin() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        this.showShareRegisterPopup = true;
        return false;
      }
      return true;
    },
    async wantSee(type) {
      if (!this.requireLogin())
        return;
      try {
        const typeMap = {
          tag: "tag",
          // 标签 -> 标签
          introduce: "introduce",
          // 介绍 -> 介绍
          idealPartner: "idealPartner",
          // 理想对象 -> 理想对象
          photo: "images"
          // 照片 -> 照片
        };
        await api_index.wantView({
          user_id: this.userId,
          type: typeMap[type] || type
        });
        common_vendor.index.showToast({
          title: "已提醒该嘉宾",
          icon: "none"
        });
      } catch (error) {
        console.error("想看操作失败:", error);
        common_vendor.index.showToast({
          title: error.msg || "操作失败",
          icon: "none"
        });
      }
    },
    async handleFollow() {
      if (!this.requireLogin())
        return;
      if (!await this.checkProfileComplete()) {
        return;
      }
      try {
        const res = await api_index.toggleFollow({
          user_id: this.userId
        });
        if (res && res.data) {
          this.userInfo.isFollow = res.data.is_followed;
          common_vendor.index.showToast({
            title: res.data.is_followed ? "关注成功" : "取消关注",
            icon: "success"
          });
        }
      } catch (error) {
        console.error("关注操作失败:", error);
        common_vendor.index.showToast({
          title: error.msg || "操作失败",
          icon: "none"
        });
      }
    },
    async handleGetWechat() {
      if (!this.requireLogin())
        return;
      if (!await this.checkProfileComplete()) {
        return;
      }
      if (!this.checkAuthComplete())
        return;
      if (this.userInfo.isBuy) {
        common_vendor.index.showToast({
          title: "已购买",
          icon: "none"
        });
        this.scrollIntoView = "wechatNo";
        return;
      }
      common_vendor.index.showModal({
        title: "发起好友申请",
        content: "消耗10脱单币发起好友申请，对方同意后双方互相解锁微信号",
        confirmText: "确认申请",
        success: async (res) => {
          if (res.confirm) {
            try {
              await api_index.sendRequest({ target_id: this.userId, message: "想认识你" });
              common_vendor.index.showToast({ title: "申请已发送", icon: "success" });
            } catch (e) {
              common_vendor.index.showToast({ title: e.msg || "申请失败", icon: "none" });
            }
          }
        }
      });
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
    handleShare() {
      console.log("分享");
    },
    closeShareRegisterPopup() {
      this.showShareRegisterPopup = false;
    },
    goRegister() {
      this.showShareRegisterPopup = false;
      const inviterId = common_vendor.index.getStorageSync("share_inviter_id") || "";
      common_vendor.index.navigateTo({
        url: `/pages/login/index?inviter_id=${inviterId}`
      });
    },
    // 小红书环境：处理用户授权信息回调
    async handleGetUserInfoForGuest(e) {
      try {
        if (e.detail.errMsg !== "getUserInfo:ok") {
          console.warn("[GuestChat] 用户拒绝授权用户信息，使用匿名模式");
          await this.createGuestAndNavigate();
          return;
        }
        common_vendor.index.showLoading({ title: "创建身份..." });
        const inviterId = common_vendor.index.getStorageSync("share_inviter_id") || "";
        const guestInfo = await utils_guestAuth.getOrCreateGuestId(inviterId ? { inviter_id: inviterId } : {});
        console.log("[GuestChat] 游客身份创建成功", guestInfo);
        const userInfo = e.detail.userInfo;
        if (userInfo) {
          await utils_guestAuth.updateGuestUserInfo({
            avatarUrl: userInfo.avatarUrl || userInfo.avatar,
            nickName: userInfo.nickName || userInfo.nickname,
            gender: userInfo.gender
          });
          console.log("[GuestChat] 游客用户信息已更新", userInfo);
        }
        common_vendor.index.hideLoading();
        this.showShareRegisterPopup = false;
        common_vendor.index.navigateTo({
          url: `/pages/chat/detail?to_user_id=${this.userId}&guest=1`
        });
      } catch (e2) {
        common_vendor.index.hideLoading();
        console.error("[GuestChat] 创建游客身份失败", e2);
        common_vendor.index.showToast({
          title: "请稍后重试",
          icon: "none"
        });
      }
    },
    // 通用：创建游客身份并跳转聊天
    async createGuestAndNavigate() {
      try {
        const inviterId = common_vendor.index.getStorageSync("share_inviter_id") || "";
        const guestInfo = await utils_guestAuth.getOrCreateGuestId(inviterId ? { inviter_id: inviterId } : {});
        console.log("[GuestChat] 游客身份创建成功", guestInfo);
        this.showShareRegisterPopup = false;
        common_vendor.index.navigateTo({
          url: `/pages/chat/detail?to_user_id=${this.userId}&guest=1`
        });
      } catch (e) {
        console.error("[GuestChat] 创建游客身份失败", e);
        common_vendor.index.showToast({
          title: "请稍后重试",
          icon: "none"
        });
      }
    },
    // 非小红书环境：普通游客聊天
    async startGuestChat() {
      await this.createGuestAndNavigate();
    },
    async handleBind() {
      try {
        console.log("执行绑定");
      } catch (error) {
        console.error("绑定失败:", error);
      }
    },
    copyWechat(wechat) {
      if (wechat) {
        common_vendor.index.setClipboardData({
          data: wechat,
          success: () => {
            common_vendor.index.showToast({
              title: "复制成功",
              icon: "success"
            });
          }
        });
      }
    },
    async checkProfileComplete() {
      try {
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          this.showShareRegisterPopup = true;
          return false;
        }
        const userInfo = common_vendor.index.getStorageSync("userinfo") || common_vendor.index.getStorageSync("userInfo") || {};
        console.log("用户资料:", userInfo);
        const requiredFields = [
          // { key: 'birthday', name: '出生年份', altKeys: ['birthday'] },
          // { key: 'marital_status', name: '婚况', altKeys: ['marital_status', 'maritalStatus', 'marriage'] },
          // { key: 'province', name: '所在省份', altKeys: ['province', 'provinceId', 'province_id'] },
          // { key: 'city', name: '所在城市', altKeys: ['city', 'cityId', 'city_id'] },
          // { key: 'education', name: '学历', altKeys: ['education', 'education_level'] },
          // { key: 'job', name: '职业', altKeys: ['job', 'occupation', 'profession', 'position'] },
          // { key: 'income', name: '年收入', altKeys: ['income', 'annual_income'] },
          // { key: 'has_house', name: '是否购房', altKeys: ['has_house', 'hasHouse', 'house'] },
          // { key: 'wechat', name: '微信号', altKeys: ['wechat', 'wechatNo', 'wechat_no'] },
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
          console.log(`${field.name}: ${value}`);
          if (value === null || value === void 0 || value === "") {
            missingFields.push(field.name);
          }
        }
        console.log("缺少的字段:", missingFields);
        if (missingFields.length > 0) {
          this.centerModalTitle = "资料完善提醒";
          this.centerModalContent = `请先完善以下资料：${missingFields.join("、")}
资料越真实完整，对方通过你申请的概率越高哦～`;
          this.centerModalConfirmText = "去完善";
          this.centerModalCancelText = "取消";
          this.centerModalOnConfirm = () => {
            common_vendor.index.navigateTo({
              url: "/pages/profile/edit"
            });
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
    closeTopAd() {
      this.showTopAd = false;
    },
    gotoSingle() {
      common_vendor.index.switchTab({
        url: "/pages/single/index"
      });
    },
    gotoReport() {
      if (!this.requireLogin())
        return;
      common_vendor.index.navigateTo({
        url: `/pages/report/index?id=${this.userId}`
      });
    },
    gotoUserDetail(user) {
      if (user && user.id) {
        common_vendor.index.navigateTo({
          url: `/pages/user/detail?id=${user.id}`
        });
      }
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
  _component_center_modal();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showShareRegisterPopup
  }, $data.showShareRegisterPopup ? {
    b: common_vendor.o((...args) => $options.closeShareRegisterPopup && $options.closeShareRegisterPopup(...args), "75"),
    c: common_vendor.o((...args) => $options.handleGetUserInfoForGuest && $options.handleGetUserInfoForGuest(...args), "80"),
    d: common_vendor.o((...args) => $options.goRegister && $options.goRegister(...args), "78")
  } : {}, {
    e: $data.userNotFound
  }, $data.userNotFound ? {
    f: common_assets._imports_0,
    g: common_vendor.t($data.userDeletedMsg || "该用户不存在或已注销"),
    h: common_vendor.o((...args) => $options.gotoSingle && $options.gotoSingle(...args), "ba")
  } : $data.userInfo.isLogout ? {
    j: common_vendor.o((...args) => $options.gotoSingle && $options.gotoSingle(...args), "ca")
  } : common_vendor.e({
    k: $data.userInfo.imgList && $data.userInfo.imgList.length > 0
  }, $data.userInfo.imgList && $data.userInfo.imgList.length > 0 ? {
    l: common_vendor.f($data.userInfo.imgList, (img, index, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.previewImage(index), index),
        c: common_vendor.o((...args) => $options.handleImageError && $options.handleImageError(...args), index),
        d: index
      };
    })
  } : common_vendor.e({
    m: $data.userInfo.avatar
  }, $data.userInfo.avatar ? {
    n: $data.userInfo.avatar,
    o: common_vendor.o((...args) => $options.handleAvatarError && $options.handleAvatarError(...args), "d4")
  } : {
    p: $data.userInfo.gender === "男" ? "/static/icons/male-default.png" : "/static/icons/female-default.png"
  }, {
    q: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    r: common_vendor.o(($event) => $options.wantSee("photo"), "be")
  }), {
    s: common_vendor.t($data.userInfo.name),
    t: $data.userInfo.gender === "男" ? "/static/m.png" : "/static/wm.png",
    v: $data.userInfo.is_vip
  }, $data.userInfo.is_vip ? {
    w: common_assets._imports_1$1
  } : {}, {
    x: $data.userInfo.isRealName
  }, $data.userInfo.isRealName ? {
    y: common_assets._imports_2$2
  } : {}, {
    z: common_vendor.t($data.userInfo.birthday),
    A: $data.userInfo.birthday && ($data.userInfo.height || $data.userInfo.education)
  }, $data.userInfo.birthday && ($data.userInfo.height || $data.userInfo.education) ? {} : {}, {
    B: $data.userInfo.height
  }, $data.userInfo.height ? {
    C: common_vendor.t($data.userInfo.height)
  } : {}, {
    D: $data.userInfo.height && $data.userInfo.education
  }, $data.userInfo.height && $data.userInfo.education ? {} : {}, {
    E: $data.userInfo.education
  }, $data.userInfo.education ? {
    F: common_vendor.t($data.userInfo.education)
  } : {}, {
    G: !$data.isAdSource
  }, !$data.isAdSource ? {
    H: common_assets._imports_3$1,
    I: common_vendor.f($data.authItems, (item, index, i0) => {
      return common_vendor.e({
        a: $data.userInfo.isRealName ? item.iconAuth : item.iconUnauth
      }, $data.userInfo.isRealName ? {
        b: common_vendor.t(item.titleAuth)
      } : {
        c: common_vendor.t(item.titleUnauth)
      }, {
        d: index,
        e: $data.userInfo.isRealName ? item.bgColorAuth : "#fcfcfc"
      });
    }),
    J: $data.userInfo.isRealName
  } : {}, {
    K: common_assets._imports_3$1,
    L: $data.userInfo.job
  }, $data.userInfo.job ? {
    M: common_vendor.t($data.userInfo.job)
  } : {}, {
    N: $data.userInfo.company
  }, $data.userInfo.company ? {
    O: common_vendor.t($data.userInfo.company)
  } : {}, {
    P: $data.userInfo.school
  }, $data.userInfo.school ? {
    Q: common_vendor.t($data.userInfo.school)
  } : {}, {
    R: $data.userInfo.hometown
  }, $data.userInfo.hometown ? {
    S: common_vendor.t($data.userInfo.hometown_t)
  } : {}, {
    T: common_vendor.t($data.userInfo.has_car ? "是" : "否"),
    U: common_vendor.t($data.userInfo.has_house ? "是" : "否"),
    V: common_assets._imports_3$1,
    W: $data.userInfo.introduce
  }, $data.userInfo.introduce ? {
    X: common_vendor.t($options.formatIntroduce)
  } : !$data.isAdSource ? {
    Z: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    aa: common_vendor.o(($event) => $options.wantSee("introduce"), "e5")
  } : {}, {
    Y: !$data.isAdSource,
    ab: !$data.isAdSource
  }, !$data.isAdSource ? common_vendor.e({
    ac: common_assets._imports_4$2,
    ad: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    ae: $options.filterTags($data.userInfo.tags).length
  }, $options.filterTags($data.userInfo.tags).length ? {
    af: common_vendor.f($options.filterTags($data.userInfo.tags), (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    })
  } : {
    ag: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    ah: common_vendor.o(($event) => $options.wantSee("tag"), "55")
  }) : {}, {
    ai: $data.userInfo.questionAnswer && $data.userInfo.questionAnswer.length
  }, $data.userInfo.questionAnswer && $data.userInfo.questionAnswer.length ? {
    aj: common_assets._imports_5$1,
    ak: common_vendor.f($data.userInfo.questionAnswer, (item, index, i0) => {
      return common_vendor.e({
        a: item.question && item.answer
      }, item.question && item.answer ? {
        b: common_assets._imports_6$1,
        c: common_vendor.t(item.question)
      } : {}, {
        d: item.answer
      }, item.answer ? {
        e: common_vendor.t(item.answer)
      } : {}, {
        f: index
      });
    })
  } : {}, {
    al: $data.userInfo.friends_impression && $data.userInfo.friends_impression.length
  }, $data.userInfo.friends_impression && $data.userInfo.friends_impression.length ? {
    am: common_assets._imports_7$2,
    an: common_vendor.f($data.userInfo.friends_impression, (item, index, i0) => {
      return {
        a: common_vendor.t($data.friendLabels[index]),
        b: common_vendor.t(item),
        c: index
      };
    }),
    ao: common_assets._imports_8$2
  } : {}, {
    ap: common_assets._imports_9$1,
    aq: $options.hasIdealPartner
  }, $options.hasIdealPartner ? common_vendor.e({
    ar: $data.userInfo.idealPartner.introduce
  }, $data.userInfo.idealPartner.introduce ? {
    as: common_vendor.t($options.formatIdealPartner)
  } : {}, {
    at: $data.userInfo.idealPartner.tags && $options.filterTags($data.userInfo.idealPartner.tags).length
  }, $data.userInfo.idealPartner.tags && $options.filterTags($data.userInfo.idealPartner.tags).length ? {
    av: common_vendor.f($options.filterTags($data.userInfo.idealPartner.tags), (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    })
  } : {}) : !$data.isAdSource ? {
    ax: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    ay: common_vendor.o(($event) => $options.wantSee("idealPartner"), "c4")
  } : {}, {
    aw: !$data.isAdSource,
    az: common_assets._imports_3$1,
    aA: !$data.isAdSource
  }, !$data.isAdSource ? {
    aB: common_assets._imports_10$2,
    aC: common_vendor.o((...args) => $options.gotoReport && $options.gotoReport(...args), "f1")
  } : {}, {
    aD: $data.userInfo.privacyInfo
  }, $data.userInfo.privacyInfo ? common_vendor.e({
    aE: $data.userInfo.privacyInfo.income
  }, $data.userInfo.privacyInfo.income ? {
    aF: common_vendor.t($data.userInfo.privacyInfo.income)
  } : {}, {
    aG: $data.userInfo.privacyInfo.familyBackground
  }, $data.userInfo.privacyInfo.familyBackground ? {
    aH: common_vendor.t($data.userInfo.privacyInfo.familyBackground.replace(/\\n/g, "\n"))
  } : {}, {
    aI: !$data.isAdSource
  }, !$data.isAdSource ? common_vendor.e({
    aJ: common_vendor.t($data.contactFieldName),
    aK: $data.userInfo.isBuy
  }, $data.userInfo.isBuy ? {
    aL: common_vendor.t($data.userInfo.privacyInfo.wechatNo),
    aM: common_assets._imports_11$2,
    aN: common_vendor.o(($event) => $options.copyWechat($data.userInfo.privacyInfo.wechatNo), "5d")
  } : {}) : {}) : {}, {
    aO: !$data.isAdSource && $data.recommendList.length
  }, !$data.isAdSource && $data.recommendList.length ? {
    aP: common_vendor.f($data.recommendList, (item, index, i0) => {
      return {
        a: item.avatar,
        b: common_vendor.t(item.name),
        c: common_vendor.t(item.age),
        d: common_vendor.t(item.livingCity.name),
        e: common_vendor.t(item.university || item.education),
        f: index,
        g: common_vendor.o(($event) => $options.gotoUserDetail(item), index)
      };
    })
  } : {}, {
    aQ: $data.scrollIntoView,
    aR: !$data.isBindMode
  }, !$data.isBindMode ? {
    aS: common_assets._imports_12,
    aT: common_vendor.o((...args) => $options.handleShare && $options.handleShare(...args), "64"),
    aU: common_assets._imports_13,
    aV: common_vendor.o((...args) => $options.handleGetWechat && $options.handleGetWechat(...args), "cd")
  } : {}, {
    aW: $data.isBindMode
  }, $data.isBindMode ? {
    aX: common_vendor.o((...args) => $options.handleBind && $options.handleBind(...args), "b5")
  } : {}, {
    aY: !$data.isBindMode
  }, !$data.isBindMode ? {
    aZ: $data.userInfo.isFollow ? "/static/ygz.png" : "/static/Frame 1420074377.png",
    ba: common_vendor.o((...args) => $options.handleFollow && $options.handleFollow(...args), "37")
  } : {}, {
    bb: common_vendor.j({
      "confirm": common_vendor.o($options.onCenterModalConfirm, "45"),
      "cancel": common_vendor.o($options.onCenterModalCancel, "3b")
    }),
    bc: common_vendor.p({
      visible: $data.showCenterModal,
      title: $data.centerModalTitle,
      content: $data.centerModalContent,
      ["confirm-text"]: $data.centerModalConfirmText,
      ["cancel-text"]: $data.centerModalCancelText
    })
  }), {
    i: $data.userInfo.isLogout
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-51f45e2f"]]);
_sfc_main.__runtimeHooks = 2;
xhs.createPage(MiniProgramPage);
