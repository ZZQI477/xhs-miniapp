<template>
  <view class="container">
    <view class="header">
      <text class="title">学历认证</text>
      <text class="subtitle">验证学历信息，展示真实背景</text>
    </view>

    <view class="tip-section">
      <text class="tip-title">可上传以下任一证明</text>
      <text class="tip-item">1. 毕业证书</text>
      <text class="tip-item">2. 学位证书</text>
      <text class="tip-item">3. 学信网截图</text>
    </view>

    <view class="form-section">
      <view class="form-item vertical">
        <text class="label">上传学历证明</text>
        <view class="upload-area large" @click="uploadEduImage">
          <image v-if="formData.edu_image" :src="formData.edu_image" mode="aspectFit" class="upload-preview"></image>
          <view v-else class="upload-placeholder">
            <text class="upload-icon large">📄</text>
            <text class="upload-text">点击上传学历证明</text>
          </view>
        </view>
      </view>
    </view>

    <button class="submit-btn" @click="submitAuth" :loading="submitting">提交认证</button>
  </view>
</template>

<script>
import { submitEduAuth, uploadImage } from '@/api/index.js'

export default {
  data() {
    return {
      formData: {
        edu_image: ''
      },
      submitting: false
    }
  },
  methods: {
    // 上传学历证明
    uploadEduImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          try {
            uni.showLoading({ title: '上传中...' })
            const uploadRes = await uploadImage(res.tempFilePaths[0])
            this.formData.edu_image = uploadRes.data.url
            uni.showToast({ title: '上传成功', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: e.msg || '上传失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    },

    // 提交认证
    async submitAuth() {
      if (!this.formData.edu_image) {
        uni.showToast({ title: '请上传学历证明', icon: 'none' })
        return
      }

      this.submitting = true
      try {
        await submitEduAuth(this.formData)
        uni.showToast({ title: '提交成功，请等待审核', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (e) {
        uni.showToast({ title: e.msg || '提交失败', icon: 'none' })
      } finally {
        this.submitting = false
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
  background-color: #FFF7E6;
  padding: 25rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
}

.tip-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #FAAD14;
  display: block;
  margin-bottom: 15rpx;
}

.tip-item {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.form-section {
  background-color: #FFFFFF;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item.vertical {
  display: flex;
  flex-direction: column;
}

.form-item .label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 15rpx;
  display: block;
}

.upload-area {
  width: 100%;
  height: 300rpx;
  background-color: #F8F8F8;
  border: 2rpx dashed #CCCCCC;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.upload-area.large {
  height: 400rpx;
}

.upload-preview {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  font-size: 60rpx;
  color: #CCCCCC;
}

.upload-icon.large {
  font-size: 80rpx;
}

.upload-text {
  font-size: 26rpx;
  color: #999999;
  margin-top: 15rpx;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  background-color: #FF4D4F;
  color: #FFFFFF;
  font-size: 32rpx;
  border-radius: 45rpx;
  border: none;
}
</style>
