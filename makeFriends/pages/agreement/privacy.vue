<template>
  <view class="container">
    <view class="content" v-if="!loading">
      <view class="title">{{ agreement.title }}</view>
      <view class="html-content">
        <rich-text :nodes="agreement.content"></rich-text>
      </view>
    </view>
    <view class="loading" v-else>
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { getAgreement } from '@/api/index.js'

export default {
  data() {
    return {
      agreement: {},
      loading: true
    }
  },
  onLoad() {
    this.loadAgreement()
  },
  methods: {
    async loadAgreement() {
      try {
        const res = await getAgreement({ type: 'privacy' })
        this.agreement = res.data
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #F8F8F8;
}

.content {
  background-color: #FFFFFF;
  padding: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 30rpx;
}

.html-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  font-size: 28rpx;
  color: #999999;
}
</style>
