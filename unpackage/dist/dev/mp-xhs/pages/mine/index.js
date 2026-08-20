"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_profileCheck = require("../../utils/profileCheck.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  mixins: [utils_profileCheck.profileCheckMixin],
  data() {
    return {
      isLoggedIn: false,
      userInfo: {},
      stats: {
        visit_count: 0,
        fans_count: 0,
        follow_count: 0,
        profile_percent: 0
      },
      userTags: ["K歌小公举", "动漫迷", "购物达人"],
      cityMap: {}
      // 城市代码到城市名称的映射
    };
  },
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      this.isLoggedIn = !!token;
      if (this.isLoggedIn) {
        this.loadUserInfo();
        this.loadStats();
        this.checkProfileCompletion();
      }
    },
    // 跳转登录页
    goLogin() {
      common_vendor.index.navigateTo({ url: "/pages/login/index" });
    },
    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await api_index.getUserInfo();
        this.userInfo = res.data.userinfo || res.data;
        this.userTags = res.data.userinfo && res.data.userinfo.my_tags || [];
        common_vendor.index.setStorageSync("userinfo", this.userInfo);
        console.log("[Mine] 已更新本地用户信息");
        this.loadCityInfo();
      } catch (e) {
        console.error("加载用户信息失败", e);
        if (e._isAuthError) {
          console.log("[Mine] 检测到登录过期，切换为未登录状态");
          this.isLoggedIn = false;
          this.userInfo = {};
        }
      }
    },
    // 加载城市信息
    async loadCityInfo() {
      try {
        const cachedCityMap = common_vendor.index.getStorageSync("cityMap");
        const cacheExpiry = common_vendor.index.getStorageSync("cityMapExpiry");
        const now = Date.now();
        if (cachedCityMap && cacheExpiry && now < cacheExpiry) {
          this.cityMap = cachedCityMap;
          console.log("[Mine] 从缓存加载城市信息");
          return;
        }
        console.log("[Mine] 缓存过期或不存在，重新加载城市信息");
        const provinceRes = await api_index.getAreaList(0);
        const provinces = provinceRes.data.list || [];
        const newCityMap = {};
        for (const province of provinces) {
          const cityRes = await api_index.getAreaList(province.id);
          const cities = cityRes.data.list || [];
          for (const city of cities) {
            newCityMap[city.id] = city.name;
          }
        }
        this.cityMap = newCityMap;
        common_vendor.index.setStorageSync("cityMap", newCityMap);
        common_vendor.index.setStorageSync("cityMapExpiry", now + 7 * 24 * 60 * 60 * 1e3);
        console.log("[Mine] 城市信息加载完成并缓存");
      } catch (e) {
        console.error("加载城市信息失败", e);
      }
    },
    // 获取城市名称
    getCityName(cityId) {
      return this.cityMap[cityId] || "未知城市";
    },
    // 加载统计数据
    async loadStats() {
      try {
        const res = await api_index.getUserStats();
        this.stats = res.data;
        this.profilePercent = res.data.profile_percent || 0;
      } catch (e) {
        console.error("加载统计数据失败", e);
      }
    },
    // 更换头像
    changeAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          try {
            common_vendor.index.showLoading({ title: "上传中..." });
            const uploadRes = await api_index.uploadAvatar(tempFilePath);
            this.userInfo.avatar = uploadRes.data.url;
            common_vendor.index.showToast({
              title: "头像更新成功",
              icon: "success"
            });
          } catch (e) {
            common_vendor.index.showToast({
              title: e.msg || "上传失败",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_profile_check_modal = common_vendor.resolveComponent("profile-check-modal");
  _component_profile_check_modal();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.j({
      "confirm": common_vendor.o(_ctx.onProfileGuide, "6d"),
      "dismiss": common_vendor.o(_ctx.onProfileDismiss, "f8")
    }),
    b: common_vendor.p({
      visible: _ctx.showProfileModal,
      percent: $data.stats.profile_percent,
      ["missing-fields"]: _ctx.profileMissingFields
    }),
    c: !$data.isLoggedIn
  }, !$data.isLoggedIn ? {
    d: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args), "9c")
  } : {
    e: $data.userInfo.avatar || "https://minixhs.chugao520.com/makefriends/logo.png",
    f: common_assets._imports_0,
    g: common_assets._imports_1,
    h: $data.userInfo.avatar || "https://minixhs.chugao520.com/makefriends/logo.png",
    i: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args), "5d"),
    j: common_vendor.t($data.stats.visit_count || 0),
    k: common_vendor.t($data.stats.fans_count || 0),
    l: common_vendor.t($data.stats.follow_count || 0),
    m: common_vendor.t($data.userInfo.nickname || "未设置昵称"),
    n: $data.userInfo.gender === 1 ? "https://minixhs.chugao520.com/makefriends/m.png" : "https://minixhs.chugao520.com/makefriends/wm.png",
    o: common_vendor.t($data.userInfo.city ? this.getCityName($data.userInfo.city) : "未设置城市"),
    p: common_vendor.t($data.userInfo.age || "未设置年龄"),
    q: common_vendor.t($data.userInfo.xiaohongshu || "未设置"),
    r: common_assets._imports_2,
    s: common_vendor.f($data.userTags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    }),
    t: common_vendor.t($data.userInfo.score || 0)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-569e925a"]]);
xhs.createPage(MiniProgramPage);
