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
      lastLoginTime: 0,
      // 节流：记录上次登录时间
      // 小红书手机号授权相关
      showXhsPhoneAuth: false,
      // 是否显示小红书授权按钮阶段
      xhsPhoneLoading: false,
      // 获取手机号loading状态
      isXhsEnv: false,
      // 是否小红书环境
      xhsLoginCode: ""
      // 预先获取的登录 code
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
    this.isXhsEnv = utils_xhsLogin.isXhsMiniApp();
    const token = common_vendor.index.getStorageSync("token");
    if (this.isXhsEnv && !token) {
      this.showXhsPhoneAuth = true;
      this.preGetXhsLoginCode();
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
    },
    // 小红书获取手机号授权
    async handleXhsPhoneAuth(e) {
      console.log("[Login] handleXhsPhoneAuth 被调用");
      console.log("[Login] e.detail:", JSON.stringify(e.detail));
      if (!this.agreedToTerms) {
        common_vendor.index.showToast({
          title: e.msg || "请先阅读并同意协议",
          icon: "none"
        });
        console.log("[Login] 未勾选协议，返回");
        return;
      }
      if (e.detail.errMsg !== "getPhoneNumber:ok") {
        console.error("[Login] 用户拒绝授权手机号:", e.detail.errMsg);
        common_vendor.index.showToast({ title: "请授权手机号以登录", icon: "none" });
        return;
      }
      console.log("[Login] 用户已授权，继续处理");
      const { encryptedData, iv } = e.detail;
      if (!encryptedData || !iv) {
        common_vendor.index.showToast({ title: "获取手机号数据失败", icon: "none" });
        return;
      }
      console.log("[Login] encryptedData 和 iv 获取成功");
      if (!this.xhsLoginCode) {
        try {
          this.xhsLoginCode = await utils_xhsLogin.getLoginCode();
        } catch (err) {
          common_vendor.index.showToast({ title: "获取登录凭证失败", icon: "none" });
          return;
        }
      }
      console.log("[Login] xhsLoginCode 已准备好，开始调用登录接口");
      this.xhsPhoneLoading = true;
      try {
        const loginData = {
          code: this.xhsLoginCode,
          encrypted_data: encryptedData,
          iv
        };
        const inviterId = common_vendor.index.getStorageSync("share_inviter_id");
        if (inviterId) {
          loginData.inviter_id = inviterId;
        }
        const res = await api_index.xhsPhoneLogin(loginData);
        console.log("[Login] xhsPhoneLogin 返回结果:", res);
        if (res.code === 1 && res.data) {
          const { userinfo, token, is_new_user, openid } = res.data;
          const isNewUser = !!is_new_user;
          common_vendor.index.setStorageSync("token", token);
          common_vendor.index.setStorageSync("userinfo", userinfo);
          if (openid) {
            common_vendor.index.setStorageSync("xhs_openid", openid);
          }
          utils_profileCheck.resetProfilePrompt();
          common_vendor.index.removeStorageSync("share_inviter_id");
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          try {
            const profileRes = await api_index.getUserInfo();
            const profile = profileRes.data.userinfo || profileRes.data;
            common_vendor.index.setStorageSync("userinfo", profile);
            this.goAfterLogin({ isNewUser, profile });
          } catch (profileError) {
            console.error("获取用户资料失败:", profileError);
            this.goAfterLogin({ isNewUser, profile: userinfo });
          }
        } else {
          throw new Error(res.msg || "登录失败");
        }
      } catch (err) {
        console.error("[Login] 小红书手机号登录失败:", err);
        common_vendor.index.showToast({ title: err.message || err.msg || "登录失败", icon: "none" });
        this.xhsLoginCode = "";
      } finally {
        this.xhsPhoneLoading = false;
      }
    },
    // 预先获取小红书登录 code
    async preGetXhsLoginCode() {
      try {
        this.xhsLoginCode = await utils_xhsLogin.getLoginCode();
        console.log("[Login] 预获取 xhs code 成功:", this.xhsLoginCode);
      } catch (err) {
        console.error("[Login] 预获取 xhs code 失败:", err);
      }
    },
    // 跳过小红书手机号授权，手动输入
    skipXhsPhoneAuth() {
      this.showXhsPhoneAuth = false;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.checkingLogin
  }, $data.checkingLogin ? {} : $data.showXhsPhoneAuth && $data.isXhsEnv ? common_vendor.e({
    c: common_assets._imports_1,
    d: common_vendor.o((...args) => $options.handleXhsPhoneAuth && $options.handleXhsPhoneAuth(...args), "1a"),
    e: $data.xhsPhoneLoading,
    f: common_vendor.o((...args) => $options.skipXhsPhoneAuth && $options.skipXhsPhoneAuth(...args), "7f"),
    g: $data.agreedToTerms
  }, $data.agreedToTerms ? {} : {}, {
    h: $data.agreedToTerms ? 1 : "",
    i: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args), "10"),
    j: common_vendor.o((...args) => $options.openUserAgreement && $options.openUserAgreement(...args), "59"),
    k: common_vendor.o((...args) => $options.openPrivacyPolicy && $options.openPrivacyPolicy(...args), "58")
  }) : common_vendor.e({
    l: common_assets._imports_1,
    m: common_assets._imports_2,
    n: $data.areaCode === 852 ? 8 : 11,
    o: $data.formData.mobile,
    p: common_vendor.o(($event) => $data.formData.mobile = $event.detail.value, "e5"),
    q: common_assets._imports_3,
    r: common_vendor.o([($event) => $data.formData.captcha = $event.detail.value, (...args) => $options.onCodeInput && $options.onCodeInput(...args)], "86"),
    s: $data.formData.captcha,
    t: common_vendor.t($data.codeText),
    v: !$data.canSendCode ? 1 : "",
    w: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "ad"),
    x: !$data.agreedToTerms && $data.showAgreementTip
  }, !$data.agreedToTerms && $data.showAgreementTip ? {
    y: $data.isShaking ? 1 : ""
  } : {}, {
    z: !$options.canLogin ? 1 : "",
    A: $data.loading,
    B: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args), "b9"),
    C: $data.agreedToTerms
  }, $data.agreedToTerms ? {} : {}, {
    D: $data.agreedToTerms ? 1 : "",
    E: common_vendor.o((...args) => $options.toggleAgreement && $options.toggleAgreement(...args), "f7"),
    F: common_vendor.o((...args) => $options.openUserAgreement && $options.openUserAgreement(...args), "8c"),
    G: common_vendor.o((...args) => $options.openPrivacyPolicy && $options.openPrivacyPolicy(...args), "75"),
    H: common_assets._imports_4,
    I: common_vendor.o((...args) => $options.handleXiaohongshuLogin && $options.handleXiaohongshuLogin(...args), "a7")
  }), {
    b: $data.showXhsPhoneAuth && $data.isXhsEnv
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d08ef7d4"]]);
xhs.createPage(MiniProgramPage);
