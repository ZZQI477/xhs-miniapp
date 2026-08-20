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
        common_vendor.index.__f__("log", "at pages/mine/index.vue:235", "[Mine] 已更新本地用户信息");
        this.loadCityInfo();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/index.vue:240", "加载用户信息失败", e);
        if (e._isAuthError) {
          common_vendor.index.__f__("log", "at pages/mine/index.vue:243", "[Mine] 检测到登录过期，切换为未登录状态");
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
          common_vendor.index.__f__("log", "at pages/mine/index.vue:261", "[Mine] 从缓存加载城市信息");
          return;
        }
        common_vendor.index.__f__("log", "at pages/mine/index.vue:266", "[Mine] 缓存过期或不存在，重新加载城市信息");
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
        common_vendor.index.__f__("log", "at pages/mine/index.vue:293", "[Mine] 城市信息加载完成并缓存");
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/mine/index.vue:295", "加载城市信息失败", e);
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
        common_vendor.index.__f__("error", "at pages/mine/index.vue:311", "加载统计数据失败", e);
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
    a: common_vendor.o(_ctx.onProfileGuide, "6d"),
    b: common_vendor.o(_ctx.onProfileDismiss, "f8"),
    c: common_vendor.p({
      visible: _ctx.showProfileModal,
      percent: $data.stats.profile_percent,
      ["missing-fields"]: _ctx.profileMissingFields
    }),
    d: !$data.isLoggedIn
  }, !$data.isLoggedIn ? {
    e: common_vendor.o((...args) => $options.goLogin && $options.goLogin(...args), "9c")
  } : {
    f: $data.userInfo.avatar || "https://minixhs.chugao520.com/makefriends/logo.png",
    g: common_assets._imports_0,
    h: common_assets._imports_1,
    i: $data.userInfo.avatar || "https://minixhs.chugao520.com/makefriends/logo.png",
    j: common_vendor.o((...args) => $options.changeAvatar && $options.changeAvatar(...args), "5d"),
    k: common_vendor.t($data.stats.visit_count || 0),
    l: common_vendor.t($data.stats.fans_count || 0),
    m: common_vendor.t($data.stats.follow_count || 0),
    n: common_vendor.t($data.userInfo.nickname || "未设置昵称"),
    o: $data.userInfo.gender === 1 ? "https://minixhs.chugao520.com/makefriends/m.png" : "https://minixhs.chugao520.com/makefriends/wm.png",
    p: common_vendor.t($data.userInfo.city ? this.getCityName($data.userInfo.city) : "未设置城市"),
    q: common_vendor.t($data.userInfo.age || "未设置年龄"),
    r: common_vendor.t($data.userInfo.xiaohongshu || "未设置"),
    s: common_assets._imports_2,
    t: common_vendor.f($data.userTags, (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    }),
    v: common_vendor.t($data.userInfo.score || 0)
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-569e925a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/mine/index.js.map
