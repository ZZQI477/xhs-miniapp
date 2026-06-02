<template>
  <view class="container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">重置密码</text>
      <text class="subtitle">请输入注册时的手机号重置密码</text>
    </view>

    <!-- 表单 -->
    <view class="form-section">
      <!-- 手机号 -->
      <view class="input-group">
        <text class="input-label">手机号</text>
        <view class="input-wrapper">
          <text class="country-code">+86</text>
          <input
            class="input-field"
            type="number"
            v-model="formData.mobile"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </view>
      </view>

      <!-- 验证码 -->
      <view class="input-group">
        <text class="input-label">验证码</text>
        <view class="input-wrapper code-wrapper">
          <input
            class="input-field"
            type="number"
            v-model="formData.captcha"
            placeholder="请输入验证码"
            maxlength="6"
          />
          <button
            class="code-btn"
            :disabled="codeBtnDisabled"
            @click="sendCode"
          >
            {{ codeText }}
          </button>
        </view>
      </view>

      <!-- 新密码 -->
      <view class="input-group">
        <text class="input-label">新密码</text>
        <view class="input-wrapper">
          <input
            class="input-field"
            :type="showPassword ? 'text' : 'password'"
            v-model="formData.newpassword"
            placeholder="请输入新密码(6-20位)"
            maxlength="20"
          />
          <text class="eye-icon" @click="showPassword = !showPassword">
            {{ showPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
      </view>

      <!-- 确认密码 -->
      <view class="input-group">
        <text class="input-label">确认密码</text>
        <view class="input-wrapper">
          <input
            class="input-field"
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="formData.confirmPassword"
            placeholder="请再次输入新密码"
            maxlength="20"
          />
          <text class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
            {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
          </text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" :loading="loading" @click="handleReset">
        重置密码
      </button>

      <!-- 返回登录 -->
      <view class="back-login">
        <text @click="goBack">返回登录</text>
      </view>
    </view>
  </view>
</template>

<script>
import { sendSms, resetPassword } from '@/api/index.js'

export default {
  data() {
    return {
      formData: {
        mobile: '',
        captcha: '',
        newpassword: '',
        confirmPassword: ''
      },
      showPassword: false,
      showConfirmPassword: false,
      loading: false,
      codeText: '获取验证码',
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
        uni.showToast({ title: '请输入手机号', icon: 'none' });
        return;
      }
      if (!this.validateMobile(this.formData.mobile)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' });
        return;
      }

      try {
        await sendSms({
          mobile: this.formData.mobile,
          event: 'resetpwd'
        });

        uni.showToast({ title: '验证码已发送', icon: 'success' });

        // 开始倒计时
        this.startCountdown();
      } catch (e) {
        uni.showToast({ title: e.msg || '发送失败', icon: 'none' });
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
          this.codeText = '获取验证码';
        } else {
          this.codeText = `${this.countdown}s`;
        }
      }, 1000);
    },

    // 重置密码
    async handleReset() {
      // 验证手机号
      if (!this.formData.mobile) {
        uni.showToast({ title: '请输入手机号', icon: 'none' });
        return;
      }
      if (!this.validateMobile(this.formData.mobile)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' });
        return;
      }

      // 验证验证码
      if (!this.formData.captcha) {
        uni.showToast({ title: '请输入验证码', icon: 'none' });
        return;
      }
      if (this.formData.captcha.length !== 6) {
        uni.showToast({ title: '请输入6位验证码', icon: 'none' });
        return;
      }

      // 验证密码
      if (!this.formData.newpassword) {
        uni.showToast({ title: '请输入新密码', icon: 'none' });
        return;
      }
      if (this.formData.newpassword.length < 6 || this.formData.newpassword.length > 20) {
        uni.showToast({ title: '密码长度需在6-20位之间', icon: 'none' });
        return;
      }

      // 确认密码
      if (this.formData.newpassword !== this.formData.confirmPassword) {
        uni.showToast({ title: '两次密码输入不一致', icon: 'none' });
        return;
      }

      this.loading = true;
      try {
        await resetPassword({
          mobile: this.formData.mobile,
          captcha: this.formData.captcha,
          newpassword: this.formData.newpassword
        });

        uni.showToast({ title: '密码重置成功', icon: 'success' });

        // 返回登录页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (e) {
        uni.showToast({ title: e.msg || '重置失败', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },

    // 返回
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #FFFFFF;
  padding: 0 50rpx;
}

/* 标题区域 */
.header {
  padding-top: 100rpx;
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #999999;
}

/* 表单区域 */
.form-section {
  margin-bottom: 40rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 2rpx solid #E8E8E8;
  border-radius: 16rpx;
  padding: 0 20rpx;
  height: 100rpx;
  background-color: #FAFAFA;
}

.country-code {
  font-size: 30rpx;
  color: #333333;
  padding-right: 20rpx;
  border-right: 2rpx solid #E8E8E8;
  margin-right: 20rpx;
}

.input-field {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
}

.code-wrapper {
  justify-content: space-between;
}

.code-btn {
  background-color: #FF4D4F;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 15rpx 25rpx;
  border-radius: 30rpx;
  border: none;
  line-height: 1.5;
  min-width: 180rpx;
}

.code-btn[disabled] {
  background-color: #CCCCCC;
}

.eye-icon {
  font-size: 36rpx;
  padding: 10rpx;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #FF6B81 0%, #FF4D4F 100%);
  color: #FFFFFF;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 50rpx;
  border: none;
  margin-top: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 返回登录 */
.back-login {
  text-align: center;
  margin-top: 40rpx;
}

.back-login text {
  font-size: 28rpx;
  color: #FF4D4F;
}
</style>
