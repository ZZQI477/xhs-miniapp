<template>
  <view class="container">
    <view class="header">
      <text class="title">实名真人认证</text>
      <text class="subtitle">通过人脸核身完成认证</text>
    </view>

    <view class="tip-section">
      <text class="tip-title">认证流程</text>
      <text class="tip-item">1. 点击下方按钮获取认证链接</text>
      <text class="tip-item">2. 链接会自动复制到剪贴板</text>
      <text class="tip-item">3. 打开手机浏览器粘贴链接访问</text>
      <text class="tip-item">4. 按提示完成人脸认证后返回此页面</text>
    </view>

    <view class="info-section">
      <text class="info-title">认证说明</text>
      <text class="info-item">• 需要拍摄本人身份证照片</text>
      <text class="info-item">• 需要进行人脸活体检测</text>
      <text class="info-item">• 请确保光线充足、正面对镜头</text>
      <text class="info-item">• 认证完成后返回点击"查询结果"</text>
    </view>

    <button class="submit-btn" @click="startVerify" :loading="submitting">获取认证链接</button>

    <button class="check-btn" @click="checkResult" v-if="hasVerifyToken">查询认证结果</button>
  </view>
</template>

<script>
import { faceVerifyInit, faceVerifyResult } from '@/api/index.js'

export default {
  data() {
    return {
      submitting: false,
      hasVerifyToken: false,
      verifyToken: ''
    }
  },
  onShow() {
    // 从缓存读取是否有进行中的认证
    const token = uni.getStorageSync('verify_token')
    if (token) {
      this.verifyToken = token
      this.hasVerifyToken = true
    }
  },
  methods: {
    async startVerify() {
      this.submitting = true
      try {
        uni.showLoading({ title: '正在获取链接...' })
        const res = await faceVerifyInit()
        const verifyToken = res.data.verify_token
        uni.hideLoading()

        if (!verifyToken) {
          uni.showToast({ title: '获取认证token失败', icon: 'none' })
          return
        }

        // 保存token用于后续查询
        this.verifyToken = verifyToken
        this.hasVerifyToken = true
        uni.setStorageSync('verify_token', verifyToken)

        // 构造认证URL
        const domain = 'https://www.hy.com'
        const successUrl = domain + '/api/user/faceCallback?token=' + verifyToken + '&status=success'
        const failedUrl = domain + '/api/user/faceCallback?token=' + verifyToken + '&status=failed'
        const h5Url = 'https://brain.baidu.com/face/print/?token=' + verifyToken + '&successUrl=' + encodeURIComponent(successUrl) + '&failedUrl=' + encodeURIComponent(failedUrl)

        console.log('认证链接:', h5Url)

        // 复制到剪贴板
        uni.setClipboardData({
          data: h5Url,
          success: () => {
            uni.showModal({
              title: '链接已复制',
              content: '认证链接已复制到剪贴板，请打开手机浏览器粘贴访问，完成认证后返回此页面点击"查询认证结果"',
              showCancel: false,
              confirmText: '我知道了'
            })
          },
          fail: (err) => {
            console.error('复制失败:', err)
            uni.showToast({ title: '复制失败，请重试', icon: 'none' })
          }
        })
      } catch (e) {
        uni.hideLoading()
        console.error('startVerify error:', e)
        uni.showToast({ title: e.msg || '获取链接失败', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },

    async checkResult() {
      if (!this.verifyToken) {
        uni.showToast({ title: '请先获取认证链接', icon: 'none' })
        return
      }

      try {
        uni.showLoading({ title: '查询中...' })
        const res = await faceVerifyResult({ verify_token: this.verifyToken })
        uni.hideLoading()

        if (res.data.status === 'success') {
          uni.removeStorageSync('verify_token')
          uni.showModal({
            title: '认证成功',
            content: '恭喜您已完成实名真人认证！',
            showCancel: false,
            success: () => {
              uni.navigateBack()
            }
          })
        } else if (res.data.status === 'pending') {
          uni.showToast({ title: '认证进行中，请完成后再查询', icon: 'none' })
        } else {
          uni.showModal({
            title: '认证未通过',
            content: res.data.message || '请重新获取链接进行认证',
            showCancel: false
          })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: e.msg || '查询失败', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #F8F8F8;
  min-height: 100vh;
  padding: 30rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 15rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #999999;
}

.tip-section {
  background-color: #E6F7FF;
  padding: 25rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
}

.tip-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #1890FF;
  display: block;
  margin-bottom: 15rpx;
}

.tip-item {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.6;
}

.info-section {
  background-color: #FFFFFF;
  padding: 25rpx;
  border-radius: 15rpx;
  margin-bottom: 40rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 15rpx;
}

.info-item {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 12rpx;
  line-height: 1.5;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  background-color: #FF4D4F;
  color: #FFFFFF;
  font-size: 32rpx;
  border-radius: 45rpx;
  border: none;
  margin-bottom: 20rpx;
}

.check-btn {
  width: 100%;
  height: 90rpx;
  background-color: #FFFFFF;
  color: #FF4D4F;
  font-size: 32rpx;
  border-radius: 45rpx;
  border: 2rpx solid #FF4D4F;
}
</style>
