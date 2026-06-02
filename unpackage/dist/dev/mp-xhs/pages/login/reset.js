"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        mobile: "",
        captcha: "",
        newpassword: "",
        confirmPassword: ""
      },
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      codeText: "获取验证码",
      codeBtnDisabled: false,
      countdown: 60
    };
  },
  methods: {
    // 验证手机号格式
    validateMobile(mobile) {
      return /^1[3-9]\d{9}$/.test(mobile);
    },
    // 发送验证码
    async sendCode() {
      if (!this.formData.mobile) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!this.validateMobile(this.formData.mobile)) {
        common_vendor.index.showToast({ title: "手机号格式不正确", icon: "none" });
        return;
      }
      try {
        await api_index.sendSms({
          mobile: this.formData.mobile,
          event: "resetpwd"
        });
        common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
        this.startCountdown();
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "发送失败", icon: "none" });
      }
    },
    // 开始倒计时
    startCountdown() {
      this.codeBtnDisabled = true;
      this.countdown = 60;
      this.codeText = `${this.countdown}s`;
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
          this.codeBtnDisabled = false;
          this.codeText = "获取验证码";
        } else {
          this.codeText = `${this.countdown}s`;
        }
      }, 1e3);
    },
    // 重置密码
    async handleReset() {
      if (!this.formData.mobile) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!this.validateMobile(this.formData.mobile)) {
        common_vendor.index.showToast({ title: "手机号格式不正确", icon: "none" });
        return;
      }
      if (!this.formData.captcha) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      if (this.formData.captcha.length !== 6) {
        common_vendor.index.showToast({ title: "请输入6位验证码", icon: "none" });
        return;
      }
      if (!this.formData.newpassword) {
        common_vendor.index.showToast({ title: "请输入新密码", icon: "none" });
        return;
      }
      if (this.formData.newpassword.length < 6 || this.formData.newpassword.length > 20) {
        common_vendor.index.showToast({ title: "密码长度需在6-20位之间", icon: "none" });
        return;
      }
      if (this.formData.newpassword !== this.formData.confirmPassword) {
        common_vendor.index.showToast({ title: "两次密码输入不一致", icon: "none" });
        return;
      }
      this.loading = true;
      try {
        await api_index.resetPassword({
          mobile: this.formData.mobile,
          captcha: this.formData.captcha,
          newpassword: this.formData.newpassword
        });
        common_vendor.index.showToast({ title: "密码重置成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "重置失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    },
    // 返回
    goBack() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.formData.mobile,
    b: common_vendor.o(($event) => $data.formData.mobile = $event.detail.value, "60"),
    c: $data.formData.captcha,
    d: common_vendor.o(($event) => $data.formData.captcha = $event.detail.value, "dc"),
    e: common_vendor.t($data.codeText),
    f: $data.codeBtnDisabled,
    g: common_vendor.o((...args) => $options.sendCode && $options.sendCode(...args), "11"),
    h: $data.showPassword ? "text" : "password",
    i: $data.formData.newpassword,
    j: common_vendor.o(($event) => $data.formData.newpassword = $event.detail.value, "1f"),
    k: common_vendor.t($data.showPassword ? "👁️" : "👁️‍🗨️"),
    l: common_vendor.o(($event) => $data.showPassword = !$data.showPassword, "a7"),
    m: $data.showConfirmPassword ? "text" : "password",
    n: $data.formData.confirmPassword,
    o: common_vendor.o(($event) => $data.formData.confirmPassword = $event.detail.value, "ee"),
    p: common_vendor.t($data.showConfirmPassword ? "👁️" : "👁️‍🗨️"),
    q: common_vendor.o(($event) => $data.showConfirmPassword = !$data.showConfirmPassword, "89"),
    r: $data.loading,
    s: common_vendor.o((...args) => $options.handleReset && $options.handleReset(...args), "e4"),
    t: common_vendor.o((...args) => $options.goBack && $options.goBack(...args), "e4")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1157eb0a"]]);
xhs.createPage(MiniProgramPage);
