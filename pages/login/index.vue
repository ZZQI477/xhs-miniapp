ququ<template>
  <view class="login-container">
    <!-- 登录校验 loading -->
    <view class="checking-login" v-if="checkingLogin">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在登录...</text>
    </view>

    <!-- 登录表单 -->
    <view v-else>
      <!-- 标题区域 -->
      <view class="title-section">
        <image class="title-image" src="/static/Frame 1890183229@2x.png" mode="aspectFit"></image>
      </view>

      <!-- 手机号输入 -->
      <view class="input-wrapper">
        <image class="input-icon" src="/static/Frame@2x (2).png" mode="aspectFit"></image>
        <input
          class="phone-input"
          type="number"
          v-model="formData.mobile"
          :maxlength="areaCode === 852 ? 8 : 11"
          placeholder="输入手机号"
        />
      </view>

      <!-- 验证码输入 -->
      <view class="input-wrapper code-input-wrapper">
        <image class="input-icon" src="/static/Frame@2x(8).png" mode="aspectFit"></image>
        <input
          class="code-input"
          type="number"
          v-model="formData.captcha"
          maxlength="4"
          placeholder="输入验证码"
          @input="onCodeInput"
        />
        <text
          class="code-btn"
          :class="{ disabled: !canSendCode }"
          @click="sendCode"
        >
          {{ codeText }}
        </text>
      </view>

      <!-- 协议提示气泡 -->
      <view v-if="!agreedToTerms && showAgreementTip" class="agreement-tip-wrapper" :class="{ shaking: isShaking }">
        <view class="agreement-bubble">
          <text>请先阅读并同意协议</text>
        </view>
      </view>

      <!-- 登录按钮 -->
      <button
        class="login-btn"
        :class="{ disabled: !canLogin }"
        :loading="loading"
        @click="handleLogin"
      >
        登录
      </button>

      <!-- 协议勾选 -->
      <view class="agreement-section">
        <view class="checkbox-wrapper" @click="toggleAgreement">
          <view class="checkbox" :class="{ checked: agreedToTerms }">
            <text v-if="agreedToTerms" class="check-mark">✓</text>
          </view>
        </view>
        <view class="agreement-text">
          <text>我已经阅读并同意</text>
          <text class="link" @click.stop="openUserAgreement">《用户协议》</text>
          <text>与</text>
          <text class="link" @click.stop="openPrivacyPolicy">《隐私协议》</text>
        </view>
      </view>


      <!-- 小红书快捷登录 -->
      <view class="xiaohongshu-login-section" style="display: none;">
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">快捷登录</text>
          <view class="divider-line"></view>
        </view>
        <view class="xiaohongshu-btn" @click="handleXiaohongshuLogin">
          <image class="xiaohongshu-icon" src="/static/Frame (1).png" mode="aspectFit"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { mobileLogin, sendSms, getUserInfo, xhsLogin } from '@/api/index.js'
import { resetProfilePrompt } from '@/utils/profileCheck.js'
import { xhsQuickLogin, isXhsMiniApp, checkSession } from '@/utils/xhsLogin.js'

export default {
  data() {
    return {
      areaCode: 86,
      areaCodes: [86, 852],
      showAreaCodeDropdown: false,
      formData: {
        mobile: '',
        captcha: ''
      },
      agreedToTerms: false,
      showAgreementTip: true,
      isShaking: false,
      loading: false,
      checkingLogin: false,
      codeText: '获取验证码',
      canSendCode: true,
      countdown: 30,
      timer: null,
      lastLoginTime: 0 // 节流：记录上次登录时间
    }
  },
  computed: {
    canLogin() {
      const mobileLength = this.areaCode === 852 ? 8 : 11
      return (
        this.formData.mobile.length === mobileLength &&
        this.formData.captcha.length === 4 &&
        this.agreedToTerms
      )
    }
  },
  onLoad(options) {
    // 从参数中获取手机号和区号
    if (options.phone) {
      this.formData.mobile = options.phone
    }
    if (options.code) {
      this.areaCode = Number(options.code)
    }

    // 接收邀请人ID（从分享卡片跳转过来）
    const inviterId = Number(options.inviter_id || 0)
    if (inviterId > 0) {
      uni.setStorageSync('share_inviter_id', inviterId)
    }

    this.tryAutoLogin()
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
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
      const token = uni.getStorageSync('token')
      if (!token) {
        return
      }

      // 显示 loading
      this.checkingLogin = true

      if (isXhsMiniApp()) {
        const localOpenid = uni.getStorageSync('xhs_openid')
        if (localOpenid) {
          const sessionValid = await checkSession()
          if (!sessionValid) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userinfo')
            uni.removeStorageSync('xhs_openid')
            this.checkingLogin = false
            return
          }
        }
      }

      try {
        const profileRes = await getUserInfo()
        const profile = profileRes.data.userinfo || profileRes.data
        uni.setStorageSync('userinfo', profile)
        this.goAfterLogin({ isNewUser: false, profile })
      } catch (e) {
        console.error('[Login] 自动登录失败', e)
        // 自动登录失败，显示登录表单
        this.checkingLogin = false
      }
    },

    goAfterLogin({ isNewUser = false, profile = null } = {}) {
      const sourceProfile = profile || uni.getStorageSync('userinfo') || {}
      const hasGender = !!(sourceProfile.gender && Number(sourceProfile.gender) !== 0)
      const hasEducation = !!(sourceProfile.education && sourceProfile.education !== '')
      const shouldGoGuide = isNewUser || !hasGender || !hasEducation

      setTimeout(() => {
        if (shouldGoGuide) {
          uni.redirectTo({ url: '/pages/signup/guide' })
          return
        }
        uni.switchTab({ url: '/pages/single/index' })
      }, 1500)
    },

    // 选择区号
    selectAreaCode(code) {
      this.areaCode = code
      this.showAreaCodeDropdown = false
      this.formData.mobile = ''
    },

    // 切换协议同意状态
    toggleAgreement() {
      this.agreedToTerms = !this.agreedToTerms
      if (this.agreedToTerms) {
        this.showAgreementTip = false
      }
    },

    // 验证手机号
    validateMobile() {
      const mobile = this.formData.mobile
      
      if (!mobile) {
        uni.showToast({ title: '请先输入手机号', icon: 'none' })
        return false
      }

      // 香港手机号验证（8位）
      if (this.areaCode === 852) {
        if (mobile.length !== 8) {
          uni.showToast({ title: '请输入正确的香港手机号', icon: 'none' })
          return false
        }
      }
      // 大陆手机号验证（11位，1开头）
      else if (this.areaCode === 86) {
        if (!/^1[3-9]\d{9}$/.test(mobile)) {
          uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
          return false
        }
      }

      return true
    },

    // 发送验证码
    async sendCode() {
      if (!this.canSendCode) return

      // 检查协议
      if (!this.agreedToTerms) {
        this.triggerShake()
        return
      }

      // 验证手机号
      if (!this.validateMobile()) return

      try {
        await sendSms({
          mobile: this.formData.mobile,
          event: 'mobilelogin'
        })

        uni.showToast({ title: '验证码已发送', icon: 'success' })
        this.startCountdown()
      } catch (e) {
        uni.showToast({ title: e.msg || '获取验证码失败', icon: 'none' })
      }
    },

    // 开始倒计时
    startCountdown() {
      this.canSendCode = false
      this.countdown = 30
      this.codeText = `${this.countdown}s后获取`

      this.timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.timer)
          this.timer = null
          this.canSendCode = true
          this.codeText = '获取验证码'
        } else {
          this.codeText = `${this.countdown}s后获取`
        }
      }, 1000)
    },

    // 验证码输入监听（自动提交）
    onCodeInput(e) {
      const code = e.detail.value
      if (code.length === 4 && this.canLogin) {
        // 延迟一下，让用户看到输入完成
        setTimeout(() => {
          this.handleLogin()
        }, 300)
      }
    },

    // 触发抖动动画
    triggerShake() {
      this.isShaking = true
      setTimeout(() => {
        this.isShaking = false
      }, 500)
    },

    // 处理登录
    async handleLogin() {
      // 节流：1秒内只允许点击一次，防止重复提交
      const now = Date.now()
      if (now - this.lastLoginTime < 1000) {
        return
      }
      this.lastLoginTime = now

      // 检查协议
      if (!this.agreedToTerms) {
        this.triggerShake()
        return
      }

      // 验证手机号
      if (!this.validateMobile()) return

      // 验证验证码
      if (!this.formData.captcha) {
        uni.showToast({ title: '请输入验证码', icon: 'none' })
        return
      }

      if (this.formData.captcha.length !== 4) {
        uni.showToast({ title: '请输入4位验证码', icon: 'none' })
        return
      }

      this.loading = true
      try {
        const loginData = {
          mobile: this.formData.mobile,
          captcha: this.formData.captcha
        }

        // 携带邀请人ID
        const inviterId = uni.getStorageSync('share_inviter_id')
        if (inviterId) {
          loginData.inviter_id = inviterId
        }

        const res = await mobileLogin(loginData)
        const isNewUser = !!(res.data && res.data.is_new_user)

        // 保存用户信息和Token
        const userinfo = res.data.userinfo || res.data
        uni.setStorageSync('token', userinfo.token)
        uni.setStorageSync('userinfo', userinfo)

        // 重置资料完善度提示标记
        resetProfilePrompt()

        // 登录成功后清除邀请人ID，避免重复绑定
        uni.removeStorageSync('share_inviter_id')

        uni.showToast({ title: '登录成功', icon: 'success' })

        // 获取完整的用户资料信息
        try {
          const profileRes = await getUserInfo()
          const profile = profileRes.data.userinfo  // 注意：API返回的是 data.userinfo

          uni.setStorageSync('userinfo', profile)
          this.goAfterLogin({ isNewUser, profile })
        } catch (profileError) {
          console.error('获取用户资料失败:', profileError)
          this.goAfterLogin({ isNewUser, profile: userinfo })
        }
      } catch (e) {
        uni.showToast({ title: e.msg || '登录失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    // 打开用户协议
    openUserAgreement() {
      uni.navigateTo({ url: '/pages/agreement/user' })
    },

    // 打开隐私政策
    openPrivacyPolicy() {
      uni.navigateTo({ url: '/pages/agreement/privacy' })
    },

    // 跳转到重置密码页面
    goToResetPassword() {
      uni.navigateTo({ url: '/pages/login/reset' })
    },

    // 小红书快捷登录
    async handleXiaohongshuLogin() {
      if (!this.agreedToTerms) {
        this.triggerShake()
        return
      }

      if (!isXhsMiniApp()) {
        uni.showToast({ title: '当前环境不支持小红书登录', icon: 'none' })
        return
      }

      this.loading = true
      try {
        const result = await xhsQuickLogin(xhsLogin)
        const userinfo = result.userinfo || uni.getStorageSync('userinfo') || {}
        const isNewUser = !!result.isNewUser

        if (userinfo.token) {
          uni.setStorageSync('token', userinfo.token)
        }
        uni.setStorageSync('userinfo', userinfo)
        resetProfilePrompt()

        // 登录成功后清除邀请人ID，避免重复绑定
        uni.removeStorageSync('share_inviter_id')

        uni.showToast({ title: '登录成功', icon: 'none' })

        try {
          const profileRes = await getUserInfo()
          const profile = profileRes.data.userinfo || profileRes.data
          uni.setStorageSync('userinfo', profile)
          this.goAfterLogin({ isNewUser, profile })
        } catch (profileError) {
          console.error('获取用户资料失败:', profileError)
          this.goAfterLogin({ isNewUser, profile: userinfo })
        }
      } catch (e) {
        uni.showToast({ title: e.message || e.msg || '小红书登录失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped> 
/* 登录校验 loading */
.checking-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #e2dfff 0%, #FFFFFF 35%, #FFF 100%);
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #E8E0FF;
  border-top-color: #6853F0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 40rpx;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 32rpx;
  color: #666666;
}

/* 登录容器 */
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #e2dfff 0%, #FFFFFF 35%, #FFF 100%);
  padding: 0 85rpx;
  box-sizing: border-box;
}

/* 标题区域 */
.title-section {
  width: 100%;
  padding-top: 150rpx;
  margin-bottom: 80rpx;
  text-align: center;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* .title-section::before,
.title-section::after {
  content: '';
  position: absolute;
  top: 80rpx;
  width: 100rpx;
  height: 100rpx;
  border: 4rpx solid #E2DFFF;
  border-radius: 50%;
  opacity: 0.5;
} */

.title-section::before {
  left: 50rpx;
}

.title-section::after {
  right: 50rpx;
}

.title-image {
  width: 500rpx;
  height: 250rpx;
  position: relative;
  z-index: 1;
}

/* 输入框容器 */
.input-wrapper {
  width: 100%;
  height: 100rpx;
  background-color: #F8F8F8;
  border-radius: 100rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  box-sizing: border-box;
}

/* 输入框图标 */
.input-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

/* 手机号输入 */
.phone-input {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
}

/* 验证码输入 */
.code-input-wrapper {
  position: relative;
}

.code-input {
  flex: 1;
  font-size: 32rpx;
  color: #333333;
}

.code-btn {
  font-size: 28rpx;
  color: #6853F0;
  min-width: 180rpx;
  text-align: right;
}

.code-btn.disabled {
  color: #CCCCCC;
}

/* 协议提示气泡 */
.agreement-tip-wrapper {
  margin-top: 20rpx;
  margin-left: 10rpx;
}

.agreement-tip-wrapper.shaking {
  animation: shake-horizontal 0.5s ease-in-out;
}

.agreement-bubble {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #4A4A4A;
  border: 4rpx solid #4A4A4A;
  border-radius: 20rpx;
  padding: 20rpx 10rpx;
  min-width: 120rpx;
  max-width: 100%;
  position: relative;
  margin-bottom: 10rpx;
}

.agreement-bubble text {
  font-size: 24rpx;
  color: #FFFFFF;
}

.agreement-bubble::before {
  content: '';
  position: absolute;
  bottom: -24rpx;
  left: 16rpx;
  border: 12rpx solid transparent;
  border-top-color: #4A4A4A;
  z-index: 2;
}

/* 协议勾选 */
.agreement-section {
  display: flex;
  align-items: center;
  margin-bottom: 60rpx;
  width: 100%;
}

.checkbox-wrapper {
  padding: 10rpx;
  margin-right: 10rpx;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #CCCCCC;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
}

.checkbox.checked {
  background-color: #6853F0;
  border-color: #6853F0;
}

.check-mark {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: bold;
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: #666666;
  line-height: 1.6;
}

.agreement-text .link {
  color: #6853F0;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 100rpx;
  background-color: #6853F0;
  color: #FFFFFF;
  font-size: 40rpx;
  font-weight: 600;
  border-radius: 50rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
}

.login-btn.disabled {
  background-color: #CCCCCC;
}

.login-btn:active:not(.disabled) {
  opacity: 0.9;
}

/* 抖动动画 */
@keyframes shake-horizontal {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10rpx);
  }
  50% {
    transform: translateX(10rpx);
  }
  75% {
    transform: translateX(-10rpx);
  }
  100% {
    transform: translateX(0);
  }
}

/* 小红书快捷登录 */
.xiaohongshu-login-section {
  margin-top: 200rpx;
  /* padding-bottom: 80rpx; */
}

/* 虚线分隔符 */
.divider {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  border-top: 1rpx dashed #CCCCCC;
}

.divider-text {
  font-size: 28rpx;
  color: #999999;
  margin: 0 30rpx;
}

/* 小红书登录按钮 */
.xiaohongshu-btn {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
}

.xiaohongshu-icon {
  width: 80rpx;
  height: 80rpx;
}
</style>
