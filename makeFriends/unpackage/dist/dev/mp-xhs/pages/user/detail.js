"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_config = require("../../utils/config.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  name: "UserDetail",
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
      }
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
      return !!(this.userInfo.idealPartner && (this.userInfo.idealPartner.introduce || this.userInfo.idealPartner.tags && this.userInfo.idealPartner.tags.length > 0));
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
    const loginUser = common_vendor.index.getStorageSync("userinfo") || {};
    const inviterId = loginUser.id || "";
    let shareImageUrl = utils_config.config.curlRef + "/uploads/sharecover.jpg";
    console.log("[ShareDebug] 分享卡片配置:", {
      title: `我发现一个不错的人：${this.userInfo.name}`,
      imageUrl: shareImageUrl,
      imgListLength: ((_a = this.userInfo.imgList) == null ? void 0 : _a.length) || 0,
      avatar: this.userInfo.avatar || "(empty)",
      userId: this.userId
    });
    return {
      title: `告白时刻Daily`,
      // title: `我发现一个不错的人：${this.userInfo.name}`,
      imageUrl: shareImageUrl,
      path: `/pages/user/detail?id=${this.userId}&share=true&inviter_id=${inviterId}`
    };
  },
  methods: {
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
          { key: "birthday", name: "出生年份", altKeys: ["birthday"] },
          { key: "marital_status", name: "婚况", altKeys: ["marital_status", "maritalStatus", "marriage"] },
          { key: "province", name: "所在省份", altKeys: ["province", "provinceId", "province_id"] },
          { key: "city", name: "所在城市", altKeys: ["city", "cityId", "city_id"] },
          { key: "education", name: "学历", altKeys: ["education", "education_level"] },
          { key: "job", name: "职业", altKeys: ["job", "occupation", "profession", "position"] },
          { key: "income", name: "年收入", altKeys: ["income", "annual_income"] },
          { key: "has_house", name: "是否购房", altKeys: ["has_house", "hasHouse", "house"] },
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
          common_vendor.index.showModal({
            title: "资料完善提醒",
            content: `请先完善以下资料：${missingFields.join("、")}`,
            confirmText: "去完善",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                common_vendor.index.navigateTo({
                  url: "/pages/profile/core-info"
                });
              }
            }
          });
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showShareRegisterPopup
  }, $data.showShareRegisterPopup ? {
    b: common_vendor.o((...args) => $options.closeShareRegisterPopup && $options.closeShareRegisterPopup(...args), "c3"),
    c: common_vendor.o((...args) => $options.goRegister && $options.goRegister(...args), "e0")
  } : {}, {
    d: $data.userNotFound
  }, $data.userNotFound ? {
    e: common_assets._imports_0$1,
    f: common_vendor.t($data.userDeletedMsg || "该用户不存在或已注销"),
    g: common_vendor.o((...args) => $options.gotoSingle && $options.gotoSingle(...args), "75")
  } : $data.userInfo.isLogout ? {
    i: common_vendor.o((...args) => $options.gotoSingle && $options.gotoSingle(...args), "2f")
  } : common_vendor.e({
    j: $data.userInfo.imgList && $data.userInfo.imgList.length > 0
  }, $data.userInfo.imgList && $data.userInfo.imgList.length > 0 ? {
    k: common_vendor.f($data.userInfo.imgList, (img, index, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.previewImage(index), index),
        c: common_vendor.o((...args) => $options.handleImageError && $options.handleImageError(...args), index),
        d: index
      };
    })
  } : common_vendor.e({
    l: $data.userInfo.avatar
  }, $data.userInfo.avatar ? {
    m: $data.userInfo.avatar,
    n: common_vendor.o((...args) => $options.handleAvatarError && $options.handleAvatarError(...args), "d5")
  } : {
    o: $data.userInfo.gender === "男" ? "/static/icons/male-default.png" : "/static/icons/female-default.png"
  }, {
    p: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    q: common_vendor.o(($event) => $options.wantSee("photo"), "1c")
  }), {
    r: common_vendor.t($data.userInfo.name),
    s: $data.userInfo.gender === "男" ? "/static/m.png" : "/static/wm.png",
    t: $data.userInfo.is_vip
  }, $data.userInfo.is_vip ? {
    v: common_assets._imports_1$1
  } : {}, {
    w: $data.userInfo.isRealName
  }, $data.userInfo.isRealName ? {
    x: common_assets._imports_2$2
  } : {}, {
    y: common_vendor.t($data.userInfo.birthday),
    z: $data.userInfo.birthday && ($data.userInfo.height || $data.userInfo.education)
  }, $data.userInfo.birthday && ($data.userInfo.height || $data.userInfo.education) ? {} : {}, {
    A: $data.userInfo.height
  }, $data.userInfo.height ? {
    B: common_vendor.t($data.userInfo.height)
  } : {}, {
    C: $data.userInfo.height && $data.userInfo.education
  }, $data.userInfo.height && $data.userInfo.education ? {} : {}, {
    D: $data.userInfo.education
  }, $data.userInfo.education ? {
    E: common_vendor.t($data.userInfo.education)
  } : {}, {
    F: !$data.isAdSource
  }, !$data.isAdSource ? {
    G: common_assets._imports_3$1,
    H: common_vendor.f($data.authItems, (item, index, i0) => {
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
    I: $data.userInfo.isRealName
  } : {}, {
    J: common_assets._imports_3$1,
    K: $data.userInfo.job
  }, $data.userInfo.job ? {
    L: common_vendor.t($data.userInfo.job)
  } : {}, {
    M: $data.userInfo.company
  }, $data.userInfo.company ? {
    N: common_vendor.t($data.userInfo.company)
  } : {}, {
    O: $data.userInfo.school
  }, $data.userInfo.school ? {
    P: common_vendor.t($data.userInfo.school)
  } : {}, {
    Q: $data.userInfo.hometown
  }, $data.userInfo.hometown ? {
    R: common_vendor.t($data.userInfo.hometown)
  } : {}, {
    S: common_vendor.t($data.userInfo.has_car ? "是" : "否"),
    T: common_vendor.t($data.userInfo.has_house ? "是" : "否"),
    U: common_assets._imports_3$1,
    V: $data.userInfo.introduce
  }, $data.userInfo.introduce ? {
    W: common_vendor.t($options.formatIntroduce)
  } : !$data.isAdSource ? {
    Y: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    Z: common_vendor.o(($event) => $options.wantSee("introduce"), "d7")
  } : {}, {
    X: !$data.isAdSource,
    aa: !$data.isAdSource
  }, !$data.isAdSource ? common_vendor.e({
    ab: common_assets._imports_4$1,
    ac: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    ad: $data.userInfo.tags && $data.userInfo.tags.length
  }, $data.userInfo.tags && $data.userInfo.tags.length ? {
    ae: common_vendor.f($data.userInfo.tags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    })
  } : {
    af: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    ag: common_vendor.o(($event) => $options.wantSee("tag"), "e6")
  }) : {}, {
    ah: $data.userInfo.questionAnswer && $data.userInfo.questionAnswer.length
  }, $data.userInfo.questionAnswer && $data.userInfo.questionAnswer.length ? {
    ai: common_assets._imports_5$1,
    aj: common_vendor.f($data.userInfo.questionAnswer, (item, index, i0) => {
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
    ak: $data.userInfo.friends_impression && $data.userInfo.friends_impression.length
  }, $data.userInfo.friends_impression && $data.userInfo.friends_impression.length ? {
    al: common_assets._imports_7$2,
    am: common_vendor.f($data.userInfo.friends_impression, (item, index, i0) => {
      return {
        a: common_vendor.t($data.friendLabels[index]),
        b: common_vendor.t(item),
        c: index
      };
    }),
    an: common_assets._imports_8$2
  } : {}, {
    ao: common_assets._imports_9$1,
    ap: $options.hasIdealPartner
  }, $options.hasIdealPartner ? common_vendor.e({
    aq: $data.userInfo.idealPartner.introduce
  }, $data.userInfo.idealPartner.introduce ? {
    ar: common_vendor.t($options.formatIdealPartner)
  } : {}, {
    as: $data.userInfo.idealPartner.tags && $data.userInfo.idealPartner.tags.length
  }, $data.userInfo.idealPartner.tags && $data.userInfo.idealPartner.tags.length ? {
    at: common_vendor.f($data.userInfo.idealPartner.tags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    })
  } : {}) : !$data.isAdSource ? {
    aw: common_vendor.t($data.userInfo.gender === "男" ? "他" : "她"),
    ax: common_vendor.o(($event) => $options.wantSee("idealPartner"), "9b")
  } : {}, {
    av: !$data.isAdSource,
    ay: common_assets._imports_3$1,
    az: !$data.isAdSource
  }, !$data.isAdSource ? {
    aA: common_assets._imports_10$2,
    aB: common_vendor.o((...args) => $options.gotoReport && $options.gotoReport(...args), "03")
  } : {}, {
    aC: $data.userInfo.privacyInfo
  }, $data.userInfo.privacyInfo ? common_vendor.e({
    aD: $data.userInfo.privacyInfo.income
  }, $data.userInfo.privacyInfo.income ? {
    aE: common_vendor.t($data.userInfo.privacyInfo.income)
  } : {}, {
    aF: $data.userInfo.privacyInfo.familyBackground
  }, $data.userInfo.privacyInfo.familyBackground ? {
    aG: common_vendor.t($data.userInfo.privacyInfo.familyBackground.replace(/\\n/g, "\n"))
  } : {}, {
    aH: !$data.isAdSource
  }, !$data.isAdSource ? common_vendor.e({
    aI: common_vendor.t($data.contactFieldName),
    aJ: $data.userInfo.isBuy
  }, $data.userInfo.isBuy ? {
    aK: common_vendor.t($data.userInfo.privacyInfo.wechatNo),
    aL: common_assets._imports_11$2,
    aM: common_vendor.o(($event) => $options.copyWechat($data.userInfo.privacyInfo.wechatNo), "8b")
  } : {}) : {}) : {}, {
    aN: !$data.isAdSource && $data.recommendList.length
  }, !$data.isAdSource && $data.recommendList.length ? {
    aO: common_vendor.f($data.recommendList, (item, index, i0) => {
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
    aP: $data.scrollIntoView,
    aQ: !$data.isBindMode
  }, !$data.isBindMode ? {
    aR: common_assets._imports_12$1,
    aS: common_vendor.o((...args) => $options.handleShare && $options.handleShare(...args), "93"),
    aT: common_assets._imports_13,
    aU: common_vendor.o((...args) => $options.handleGetWechat && $options.handleGetWechat(...args), "4d")
  } : {}, {
    aV: $data.isBindMode
  }, $data.isBindMode ? {
    aW: common_vendor.o((...args) => $options.handleBind && $options.handleBind(...args), "df")
  } : {}, {
    aX: !$data.isBindMode
  }, !$data.isBindMode ? {
    aY: $data.userInfo.isFollow ? "/static/ygz.png" : "/static/Frame 1420074377.png",
    aZ: common_vendor.o((...args) => $options.handleFollow && $options.handleFollow(...args), "22")
  } : {}), {
    h: $data.userInfo.isLogout
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-51f45e2f"]]);
_sfc_main.__runtimeHooks = 2;
xhs.createPage(MiniProgramPage);
