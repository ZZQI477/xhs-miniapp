<template>
  <view class="container">
    <view class="result-icon" :class="resultStatus">
      <text v-if="resultStatus === 'loading'">...</text>
      <text v-if="resultStatus === 'success'">✓</text>
      <text v-if="resultStatus === 'fail'">✕</text>
    </view>
    <text class="result-title">{{ resultTitle }}</text>
    <text class="result-desc">{{ resultDesc }}</text>

    <button v-if="resultStatus === 'loading'" class="submit-btn" @click="checkResult">查询认证结果</button>
    <button v-if="resultStatus === 'fail'" class="submit-btn" @click="retryVerify">重新认证</button>
    <button v-if="resultStatus === 'success'" class="submit-btn success" @click="goBack">返回认证中心</button>
  </view>
</template>

<script>
import { faceVerifyResult } from '@/api/index.js'

export default {
  data() {
    return {
      verifyToken: '',
      status: '',
      resultStatus: 'loading', // loading / success / fail
      resultTitle: '正在查询认证结果',
      resultDesc: '请稍候...'
    }
  },
  onLoad(options) {
    this.verifyToken = options.token || ''
    this.status = options.status || ''

    if (!this.verifyToken) {
      uni.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
      return
    }

    // 自动查询结果
    this.checkResult()
  },
  methods: {
    async checkResult() {
      if (!this.verifyToken) {
        uni.showToast({ title: '认证信息异常，请重新认证', icon: 'none' })
        return
      }

      try {
        uni.showLoading({ title: '查询中...' })
        const res = await faceVerifyResult({ verify_token: this.verifyToken })
        uni.hideLoading()

        if (res.data.status === 'passed') {
          this.resultStatus = 'success'
          this.resultTitle = '认证通过'
          this.resultDesc = '恭喜您，实名真人认证已通过！'
        }
      } catch (e) {
        uni.hideLoading()
        const data = e.data || {}
        if (data.status === 'rejected') {
          this.resultStatus = 'fail'
          this.resultTitle = '认证未通过'
          this.resultDesc = data.reason || e.msg || '请重新认证'
        } else if (data.status === 'verifying') {
          this.resultStatus = 'loading'
          this.resultTitle = '认证尚未完成'
          this.resultDesc = '请先完成人脸核身流程，然后点击下方按钮查询'
        } else {
          uni.showToast({ title: e.msg || '查询失败，请稍后重试', icon: 'none' })
        }
      }
    },

    retryVerify() {
      uni.navigateBack({ delta: 2 }) // 返回到认证页面
    },

    goBack() {
      uni.navigateBack({ delta: 2 }) // 返回到认证中心
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #F8F8F8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
  padding-bottom: 60rpx;
}

.result-icon {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin-bottom: 40rpx;
}

.result-icon.loading {
  background-color: #FFF7E6;
  color: #FAAD14;
  animation: pulse 1.5s infinite;
}

.result-icon.success {
  background-color: #F6FFED;
  color: #52C41A;
}

.result-icon.fail {
  background-color: #FFF1F0;
  color: #FF4D4F;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.result-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.result-desc {
  font-size: 28rpx;
  color: #999999;
  text-align: center;
  margin-bottom: 60rpx;
  padding: 0 60rpx;
}

.submit-btn {
  width: 600rpx;
  height: 90rpx;
  background-color: #FF4D4F;
  color: #FFFFFF;
  font-size: 32rpx;
  border-radius: 45rpx;
  border: none;
}

.submit-btn.success {
  background-color: #52C41A;
}
</style>
