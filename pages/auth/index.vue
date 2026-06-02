<template>
  <view class="container">
    <!-- 认证说明 -->
    <view class="tip-section">
      <text class="tip-text">完成认证，提升信任度，获得更多曝光</text>
    </view>

    <!-- 实名+真人认证（合并） -->
    <view class="auth-card" @click="goFaceVerify">
      <view class="auth-icon verify">
        <text>ID</text>
      </view>
      <view class="auth-info">
        <text class="auth-title">实名真人认证</text>
        <text class="auth-desc">输入姓名身份证号，完成人脸核身验证</text>
      </view>
      <view class="auth-action">
        <view class="auth-status" :class="verifyStatusClass">
          {{ verifyStatusText }}
        </view>
        <text class="auth-arrow">→</text>
      </view>
    </view>

    <!-- 学历认证 -->
    <view class="auth-card" @click="goEduAuth">
      <view class="auth-icon edu">
        <text>📚</text>
      </view>
      <view class="auth-info">
        <text class="auth-title">学历认证</text>
        <text class="auth-desc">验证学历信息，展示真实背景</text>
      </view>
      <view class="auth-action">
        <view class="auth-status" :class="eduStatusClass">
          {{ eduStatusText }}
        </view>
        <text class="auth-arrow">→</text>
      </view>
    </view>

    <!-- 认证权益 -->
    <view class="benefit-section">
      <view class="benefit-title">认证权益</view>
      <view class="benefit-list">
        <view class="benefit-item">
          <text class="benefit-icon">✓</text>
          <text class="benefit-text">资料页展示认证标识</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✓</text>
          <text class="benefit-text">搜索结果优先展示</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✓</text>
          <text class="benefit-text">获得更多好友申请</text>
        </view>
        <view class="benefit-item">
          <text class="benefit-icon">✓</text>
          <text class="benefit-text">提高他人信任度</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAuthStatus } from '@/api/index.js'

export default {
  data() {
    return {
      authStatus: {
        is_verified: false,
        is_realface: false,
        is_education: false,
        idcard_auth: null,
        face_auth: null,
        edu_auth: null
      }
    }
  },
  computed: {
    // 实名+真人认证是否已通过
    isVerifyPassed() {
      return this.authStatus.is_verified && this.authStatus.is_realface
    },

    // 合并后的认证状态
    verifyStatusClass() {
      if (this.isVerifyPassed) return 'passed'
      // 检查idcard认证状态
      const idcardStatus = this.authStatus.idcard_auth?.status
      if (idcardStatus === 'verifying') return 'pending'
      if (idcardStatus === 'pending') return 'pending'
      if (idcardStatus === 'rejected') return 'rejected'
      // 如果实名通过但真人没通过
      if (this.authStatus.is_verified && !this.authStatus.is_realface) return 'pending'
      return 'unauth'
    },
    verifyStatusText() {
      if (this.isVerifyPassed) return '已认证'
      const idcardStatus = this.authStatus.idcard_auth?.status
      if (idcardStatus === 'verifying') return '认证中'
      if (idcardStatus === 'pending') return '审核中'
      if (idcardStatus === 'rejected') return '未通过'
      if (this.authStatus.is_verified && !this.authStatus.is_realface) return '部分完成'
      return '去验证'
    },

    // 学历认证状态
    eduStatusClass() {
      if (this.authStatus.is_education) return 'passed'
      if (this.authStatus.edu_auth?.status === 'pending') return 'pending'
      if (this.authStatus.edu_auth?.status === 'rejected') return 'rejected'
      return 'unauth'
    },
    eduStatusText() {
      if (this.authStatus.is_education) return '已认证'
      if (this.authStatus.edu_auth?.status === 'pending') return '审核中'
      if (this.authStatus.edu_auth?.status === 'rejected') return '未通过'
      return '去验证'
    }
  },
  onLoad() {
    this.loadAuthStatus()
  },
  onShow() {
    this.loadAuthStatus()
  },
  methods: {
    async loadAuthStatus() {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await getAuthStatus()
        this.authStatus = res.data
      } catch (e) {
        console.error('加载认证状态失败', e)
      } finally {
        uni.hideLoading()
      }
    },

    // 进入实名真人认证
    goFaceVerify() {
      if (this.isVerifyPassed) {
        uni.showToast({ title: '您已完成实名真人认证', icon: 'none' })
        return
      }
      const idcardStatus = this.authStatus.idcard_auth?.status
      if (idcardStatus === 'pending') {
        uni.showToast({ title: '您的申请正在审核中', icon: 'none' })
        return
      }
      if (idcardStatus === 'rejected') {
        uni.showModal({
          title: '认证未通过',
          content: this.authStatus.idcard_auth.reject_reason || '请重新提交认证',
          confirmText: '重新认证',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/auth/idcard' })
            }
          }
        })
        return
      }
      // verifying状态也跳转，让用户查看结果或重新操作
      uni.navigateTo({ url: '/pages/auth/idcard' })
    },

    // 进入学历认证
    goEduAuth() {
      if (this.authStatus.is_education) {
        uni.showToast({ title: '您已完成学历认证', icon: 'none' })
        return
      }
      if (this.authStatus.edu_auth?.status === 'pending') {
        uni.showToast({ title: '您的申请正在审核中', icon: 'none' })
        return
      }
      if (this.authStatus.edu_auth?.status === 'rejected') {
        uni.showModal({
          title: '认证被拒绝',
          content: this.authStatus.edu_auth.reject_reason || '请重新提交认证',
          confirmText: '重新认证',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/auth/edu' })
            }
          }
        })
        return
      }
      uni.navigateTo({ url: '/pages/auth/edu' })
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #F8F8F8;
  min-height: 100vh;
  padding-bottom: 30rpx;
}

.tip-section {
  padding: 30rpx;
  text-align: center;
}

.tip-text {
  font-size: 26rpx;
  color: #999999;
}

.auth-card {
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  margin: 0 30rpx 20rpx;
  padding: 30rpx;
  border-radius: 15rpx;
}

.auth-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 25rpx;
}

.auth-icon.verify {
  background-color: #E6F7FF;
  color: #1890FF;
  font-weight: bold;
}

.auth-icon.edu {
  background-color: #F6FFED;
  font-size: 36rpx;
}

.auth-info {
  flex: 1;
}

.auth-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.auth-desc {
  font-size: 24rpx;
  color: #999999;
}

.auth-action {
  display: flex;
  align-items: center;
}

.auth-status {
  font-size: 26rpx;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
}

.auth-status.passed {
  background-color: #F6FFED;
  color: #52C41A;
}

.auth-status.pending {
  background-color: #FFF7E6;
  color: #FAAD14;
}

.auth-status.rejected {
  background-color: #FFF1F0;
  color: #FF4D4F;
}

.auth-status.unauth {
  background-color: #FFF1F0;
  color: #FF4D4F;
}

.auth-arrow {
  font-size: 28rpx;
  color: #CCCCCC;
  margin-left: 10rpx;
}

.benefit-section {
  background-color: #FFFFFF;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 15rpx;
}

.benefit-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 25rpx;
}

.benefit-list {
  display: flex;
  flex-wrap: wrap;
}

.benefit-item {
  width: 50%;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.benefit-icon {
  color: #52C41A;
  font-size: 28rpx;
  margin-right: 15rpx;
}

.benefit-text {
  font-size: 26rpx;
  color: #666666;
}
</style>
