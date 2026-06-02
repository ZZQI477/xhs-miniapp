"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_profileCheck = require("../../utils/profileCheck.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      areaCode: 86,
      areaCodes: [86, 852],
      showAreaCodeDropdown: false,
      formData: {
        mobile: "",
        captcha: ""
      },
      agreedToTerms: false,
      showAgreementTip: true,
      isShaking: false,
      loading: false,
      codeText: "获取验证码",
      canSendCode: true,
      countdown: 30,
      timer: null
    };
  },
  computed: {
    canLogin() {
      const mobileLength = this.areaCode === 852 ? 8 : 11;
      return this.formData.mobile.length === mobileLength && this.formData.captcha.length === 4 && this.agreedToTerms;
    }
  },
  onLoad(options) {
    if (options.phone) {
      this.formData.mobile = options.phone;
    }
    if (options.code) {
      this.areaCode = Number(options.code);
    }
    const inviterId = Number(options.inviter_id || 0);
    if (inviterId > 0) {
      common_vendor.index.setStorageSync("share_inviter_id", inviterId);
    }
    this.tryAutoLogin();
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    async tryAutoLogin() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return;
      }
      try {
        const profileRes = await api_index.getUserInfo();
        const profile = profileRes.data.userinfo || profileRes.data;
        common_vendor.index.setStorageSync("userinfo", profile);
        this.goAfterLogin({ isNewUser: false, profile });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/index.vue:170", "[Login] 自动登录失败", e);
      }
    },
    goAfterLogin({ isNewUser = false, profile = null } = {}) {
      const sourceProfile = profile || common_vendor.index.getStorageSync("userinfo") || {};
      const hasGender = !!(sourceProfile.gender && Number(sourceProfile.gender) !== 0);
      const hasEducation = !!(sourceProfile.education && sourceProfile.education !== "");
      const shouldGoGuide = isNewUser || !hasGender || !hasEducation;
      setTimeout(() => {
        if (shouldGoGuide) {
          common_vendor.index.redirectTo({ url: "/pages/signup/guide" });
          return;
        }
        common_vendor.index.switchTab({ url: "/pages/single/index" });
      }, 1500);
    },
    // 选择区号
    selectAreaCode(code) {
      this.areaCode = code;
      this.showAreaCodeDropdown = false;
      this.formData.mobile = "";
    },
    // 切换协议同意状态
    toggleAgreement() {
      this.agreedToTerms = !this.agreedToTerms;
      if (this.agreedToTerms) {
        this.showAgreementTip = false;
      }
    },
    // 验证手机号
    validateMobile() {
      const mobile = this.formData.mobile;
      if (!mobile) {
        common_vendor.index.showToast({ title: "请先输入手机号", icon: "none" });
        return false;
      }
      if (this.areaCode === 852) {
        if (mobile.length !== 8) {
          common_vendor.index.showToast({ title: "请输入正确的香港手机号", icon: "none" });
          return false;
        }
      } else if (this.areaCode === 86) {
        if (!/^1[3-9]\d{9}$/.test(mobile)) {
          common_vendor.index.showToast({ title: "请输入正确的手机号", icon: "none" });
          return false;
        }
      }
      return true;
    },
    // 发送验证码
    async sendCode() {
      if (!this.canSendCode)
        return;
      if (!this.agreedToTerms) {
        this.triggerShake();
        return;
      }
      if (!this.validateMobile())
        return;
      try {
        await api_index.sendSms({
          mobile: this.formData.mobile,
          event: "mobilelogin"
        });
        common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
        this.startCountdown();
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "获取验证码失败", icon: "none" });
      }
    },
    // 开始倒计时
    startCountdown() {
      this.canSendCode = false;
      this.countdown = 30;
      this.codeText = `${this.countdown}s后获取`;
      this.timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
          this.canSendCode = true;
          this.codeText = "获取验证码";
        } else {
          this.codeText = `${this.countdown}s后获取`;
        }
      }, 1e3);
    },
    // 验证码输入监听（自动提交）
    onCodeInput(e) {
      const code = e.detail.value;
      if (code.length === 4 && this.canLogin) {
        setTimeout(() => {
          this.handleLogin();
        }, 300);
      }
    },
    // 触发抖动动画
    triggerShake() {
      this.isShaking = true;
      setTimeout(() => {
        this.isShaking = false;
      }, 500);
    },
    // 处理登录
    async handleLogin() {
      if (!this.agreedToTerms) {
        this.triggerShake();
        return;
      }
      if (!this.validateMobile())
        return;
      if (!this.formData.captcha) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      if (this.formData.captcha.length !== 4) {
        common_vendor.index.showToast({ title: "请输入4位验证码", icon: "none" });
        return;
      }
      this.loading = true;
      try {
        const loginData = {
          mobile: this.formData.mobile,
          captcha: this.formData.captcha
        };
        const inviterId = common_vendor.index.getStorageSync("share_inviter_id");
        if (inviterId) {
          loginData.inviter_id = inviterId;
        }
        const res = await api_index.mobileLogin(loginData);
        const isNewUser = !!(res.data && res.data.is_new_user);
        const userinfo = res.data.userinfo || res.data;
        common_vendor.index.setStorageSync("token", userinfo.token);
        common_vendor.index.setStorageSync("userinfo", userinfo);
        utils_profileCheck.resetProfilePrompt();
        common_vendor.index.removeStorageSync("share_inviter_id");
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        try {
          const profileRes = await api_index.getUserInfo();
          const profile = profileRes.data.userinfo;
          common_vendor.index.setStorageSync("userinfo", profile);
          this.goAfterLogin({ isNewUser, profile });
        } catch (profileError) {
          common_vendor.index.__f__("error", "at pages/login/index.vue:354", "获取用户资料失败:", profileError);
          this.goAfterLogin({ isNewUser, profile: userinfo });
        }
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "登录失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    // 打开用户协议
    openUserAgreement() {
      common_vendor.index.navigateTo({ url: "/pages/agreement/user" });
    },
    // 打开隐私政策
    openPrivacyPolicy() {
      common_vendor.index.navigateTo({ url: "/pages/agreement/privacy" });
    },
    // 跳转到重置密码页面
    goToResetPassword() {
      common_vendor.index.navigateTo({ url: "/pages/login/reset" });
    },
    // 小红书快捷登录
    async handleXiaohongshuLogin() {
      if (!this.agreedToTerms) {
        this.triggerShake();
        return;
      }
      {
        common_vendor.index.showToast({ title: "当前环境不支持小红书登录", icon: "none" });
        return;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_assets._imports_1,
    c: $data.areaCode === 852 ? 8 : 11,
    d: $data.formData.mobile,
    e: common_vendor.o(($event) => $data.formData.mobile = $event.detail.value, "2c"),
    f: common_assets._imports_2,
    g: common_vendor.o([($event) => $data.formData.captcha = $event.detail.value, (...args) => $options.onCodeInput && $options.onCodeInput(...args)], "86"),
    h: $data.formData.captcha,
    i: common_vendor.t($data.codeText),
    j: !$data.canSendCode ? 1 : "",
    k: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "e1"),
    l: !$data.agreedToTerms && $data.showAgreementTip
  }, !$data.agreedToTerms && $data.showAgreementTip ? {
    m: $data.isShaking ? 1 : ""
  } : {}, {
    n: !$options.canLogin ? 1 : "",
    o: $data.loading,
    p: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args), "c7"),
    q: $data.agreedToTerms
  }, $data.agreedToTerms ? {} : {}, {
    r: $data.agreedToTerms ? 1 : "",
    s: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args), "80"),
    t: common_vendor.o((...args) => $options.openUserAgreement && $options.openUserAgreement(...args), "04"),
    v: common_vendor.o((...args) => $options.openPrivacyPolicy && $options.openPrivacyPolicy(...args), "c2"),
    w: common_assets._imports_3,
    x: common_vendor.o((...args) => $options.handleXiaohongshuLogin && $options.handleXiaohongshuLogin(...args), "71")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/index.js.map
