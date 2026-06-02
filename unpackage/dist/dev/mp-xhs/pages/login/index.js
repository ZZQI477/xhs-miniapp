"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const utils_profileCheck = require("../../utils/profileCheck.js");
const utils_xhsLogin = require("../../utils/xhsLogin.js");
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
      checkingLogin: false,
      codeText: "获取验证码",
      canSendCode: true,
      countdown: 30,
      timer: null,
      lastLoginTime: 0
      // 节流：记录上次登录时间
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
    // 调用示例
    // getUserProfile()
    //   .then((userInfo) => {
    //     console.log('用户信息:');
    //     console.log('昵称:', userInfo.nickName);
    //     console.log('头像 URL:', userInfo.avatarUrl);
    //     console.log('性别:', userInfo.gender === 1 ? '男' : userInfo.gender === 2 ? '女' : '未知');
    //   })
    //   .catch((err) => {
    //     console.error('操作失败:', err);
    //   });
    async tryAutoLogin() {
      const token = common_vendor.index.getStorageSync("token");
      if (!token) {
        return;
      }
      this.checkingLogin = true;
      {
        const localOpenid = common_vendor.index.getStorageSync("xhs_openid");
        if (localOpenid) {
          const sessionValid = await utils_xhsLogin.checkSession();
          if (!sessionValid) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userinfo");
            common_vendor.index.removeStorageSync("xhs_openid");
            this.checkingLogin = false;
            return;
          }
        }
      }
      try {
        const profileRes = await api_index.getUserInfo();
        const profile = profileRes.data.userinfo || profileRes.data;
        common_vendor.index.setStorageSync("userinfo", profile);
        this.goAfterLogin({ isNewUser: false, profile });
      } catch (e) {
        console.error("[Login] 自动登录失败", e);
        this.checkingLogin = false;
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
      const now = Date.now();
      if (now - this.lastLoginTime < 1e3) {
        return;
      }
      this.lastLoginTime = now;
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
          console.error("获取用户资料失败:", profileError);
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
      this.loading = true;
      try {
        const result = await utils_xhsLogin.xhsQuickLogin(api_index.xhsLogin);
        const userinfo = result.userinfo || common_vendor.index.getStorageSync("userinfo") || {};
        const isNewUser = !!result.isNewUser;
        if (userinfo.token) {
          common_vendor.index.setStorageSync("token", userinfo.token);
        }
        common_vendor.index.setStorageSync("userinfo", userinfo);
        utils_profileCheck.resetProfilePrompt();
        common_vendor.index.removeStorageSync("share_inviter_id");
        common_vendor.index.showToast({ title: "登录成功", icon: "none" });
        try {
          const profileRes = await api_index.getUserInfo();
          const profile = profileRes.data.userinfo || profileRes.data;
          common_vendor.index.setStorageSync("userinfo", profile);
          this.goAfterLogin({ isNewUser, profile });
        } catch (profileError) {
          console.error("获取用户资料失败:", profileError);
          this.goAfterLogin({ isNewUser, profile: userinfo });
        }
      } catch (e) {
        common_vendor.index.showToast({ title: e.message || e.msg || "小红书登录失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.checkingLogin
  }, $data.checkingLogin ? {} : common_vendor.e({
    b: common_assets._imports_0,
    c: common_assets._imports_1,
    d: $data.areaCode === 852 ? 8 : 11,
    e: $data.formData.mobile,
    f: common_vendor.o(($event) => $data.formData.mobile = $event.detail.value, "c1"),
    g: common_assets._imports_2,
    h: common_vendor.o([($event) => $data.formData.captcha = $event.detail.value, (...args) => $options.onCodeInput && $options.onCodeInput(...args)], "86"),
    i: $data.formData.captcha,
    j: common_vendor.t($data.codeText),
    k: !$data.canSendCode ? 1 : "",
    l: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "fd"),
    m: !$data.agreedToTerms && $data.showAgreementTip
  }, !$data.agreedToTerms && $data.showAgreementTip ? {
    n: $data.isShaking ? 1 : ""
  } : {}, {
    o: !$options.canLogin ? 1 : "",
    p: $data.loading,
    q: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args), "5d"),
    r: $data.agreedToTerms
  }, $data.agreedToTerms ? {} : {}, {
    s: $data.agreedToTerms ? 1 : "",
    t: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args), "10"),
    v: common_vendor.o((...args) => $options.openUserAgreement && $options.openUserAgreement(...args), "40"),
    w: common_vendor.o((...args) => $options.openPrivacyPolicy && $options.openPrivacyPolicy(...args), "d4"),
    x: common_assets._imports_3,
    y: common_vendor.o((...args) => $options.handleXiaohongshuLogin && $options.handleXiaohongshuLogin(...args), "45")
  }));
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
xhs.createPage(MiniProgramPage);
