"use strict";
const common_vendor = require("../common/vendor.js");
const api_index = require("../api/index.js");
let isChecking = false;
const PROFILE_THRESHOLD = 90;
const PROFILE_PROMPT_KEY = "profile_prompt_last_time";
const SESSION_PROMPT_KEY = "hasProfilePromptedInSession";
const REQUIRED_FIELDS = [
  { key: "birthday", label: "出生年份", check: (data) => Boolean(data.birthday) },
  {
    key: "livingPlace",
    label: "现居地",
    check: (data) => Boolean(data.province && data.city)
  },
  { key: "education", label: "学历", check: (data) => Boolean(data.education) },
  { key: "maritalStatus", label: "婚况", check: (data) => Boolean(data.marital_status) },
  {
    key: "income",
    label: "年收入",
    check: (data) => data.income !== void 0 && data.income !== null && String(data.income) !== ""
  },
  { key: "avatar", label: "头像", check: (data) => Boolean(data.avatar) }
];
function normalizeUserInfo(res) {
  var _a;
  return ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.userinfo) || (res == null ? void 0 : res.data) || {};
}
function getMissingFields(userInfo) {
  return REQUIRED_FIELDS.filter((field) => !field.check(userInfo)).map((field) => field.label);
}
function getAppGlobalData() {
  try {
    const app = getApp();
    if (app && app.globalData) {
      return app.globalData;
    }
  } catch (e) {
    console.warn("getApp() 不可用", e);
  }
  return null;
}
function hasPromptedInSession() {
  const globalData = getAppGlobalData();
  if (globalData) {
    return globalData[SESSION_PROMPT_KEY] === true;
  }
  return common_vendor.index.getStorageSync(SESSION_PROMPT_KEY) === true;
}
function markPromptedInSession() {
  const globalData = getAppGlobalData();
  if (globalData) {
    globalData[SESSION_PROMPT_KEY] = true;
  }
  common_vendor.index.setStorageSync(SESSION_PROMPT_KEY, true);
}
function resetProfilePrompt() {
  common_vendor.index.removeStorageSync(PROFILE_PROMPT_KEY);
}
function resetSessionPromptFlag() {
  const globalData = getAppGlobalData();
  if (globalData) {
    globalData[SESSION_PROMPT_KEY] = false;
  }
  common_vendor.index.removeStorageSync(SESSION_PROMPT_KEY);
}
const profileCheckMixin = {
  data() {
    return {
      showProfileModal: false,
      profilePercent: 0,
      profileMissingFields: []
    };
  },
  methods: {
    /**
     * 检查资料完善度
     * @returns {Promise<void>}
     */
    async checkProfileCompletion() {
      var _a;
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return;
      }
      if (hasPromptedInSession()) {
        return;
      }
      if (isChecking) {
        return;
      }
      isChecking = true;
      try {
        const [infoRes, statsRes] = await Promise.all([
          api_index.getUserInfo(),
          api_index.getUserStats().catch(() => ({ data: {} }))
        ]);
        const userInfo = normalizeUserInfo(infoRes);
        const percent = ((_a = statsRes == null ? void 0 : statsRes.data) == null ? void 0 : _a.profile_percent) || 0;
        const missingFields = getMissingFields(userInfo);
        this.profilePercent = percent;
        this.profileMissingFields = missingFields;
        if (percent < PROFILE_THRESHOLD) {
          this.showProfileModal = true;
          markPromptedInSession();
        }
      } catch (e) {
        console.error("检查资料完善度失败", e);
      } finally {
        isChecking = false;
      }
    },
    /**
     * 点击「立即完善」
     */
    onProfileGuide() {
      common_vendor.index.setStorageSync(PROFILE_PROMPT_KEY, Date.now());
      this.showProfileModal = false;
      common_vendor.index.navigateTo({
        // url: '/pages/profile/core-info'  // 跳转到核心资料页面
        url: "/pages/profile/edit"
        // 跳转到
      });
    },
    /**
     * 点击「稍后再说」
     */
    onProfileDismiss() {
      common_vendor.index.setStorageSync(PROFILE_PROMPT_KEY, Date.now());
      this.showProfileModal = false;
    }
  }
};
exports.profileCheckMixin = profileCheckMixin;
exports.resetProfilePrompt = resetProfilePrompt;
exports.resetSessionPromptFlag = resetSessionPromptFlag;
