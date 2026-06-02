<template>
  <view class="container">
    <!-- 警告提示 -->
    <view class="warning-section">
      <view class="warning-icon">⚠️</view>
      <text class="warning-title">注销账号须知</text>
      <text class="warning-desc">账号注销后将无法恢复，请谨慎操作</text>
    </view>

    <!-- 注销说明 -->
    <view class="notice-section">
      <view class="notice-title">
        <text class="notice-icon">📋</text>
        <text class="notice-text">注销后将发生以下变化</text>
      </view>

      <view class="notice-list">
        <view class="notice-item">
          <text class="notice-dot">•</text>
          <text class="notice-content">账号信息将被永久删除，无法找回</text>
        </view>
        <view class="notice-item">
          <text class="notice-dot">•</text>
          <text class="notice-content">所有个人资料、照片、认证信息将被清空</text>
        </view>
        <view class="notice-item">
          <text class="notice-dot">•</text>
          <text class="notice-content">与其他用户的聊天记录将被删除</text>
        </view>
        <view class="notice-item">
          <text class="notice-dot">•</text>
          <text class="notice-content">VIP会员权益将立即失效，不予退款</text>
        </view>
        <view class="notice-item">
          <text class="notice-dot">•</text>
          <text class="notice-content">脱单币余额将被清零，无法提现</text>
        </view>
        <view class="notice-item">
          <text class="notice-dot">•</text>
          <text class="notice-content">所有喜欢、关注、访客记录将被清除</text>
        </view>
      </view>
    </view>

    <!-- 注销原因 -->
    <view class="reason-section">
      <view class="reason-title">请告诉我们注销原因（选填）</view>
      <view class="reason-options">
        <view
          v-for="(reason, index) in reasons"
          :key="index"
          class="reason-item"
          :class="{ 'selected': selectedReason === index }"
          @click="selectReason(index)"
        >
          <text class="reason-text">{{ reason }}</text>
          <text v-if="selectedReason === index" class="check-icon">✓</text>
        </view>
      </view>

      <!-- 其他原因输入 -->
      <view v-if="selectedReason === reasons.length - 1" class="other-reason">
        <textarea
          class="reason-input"
          v-model="otherReason"
          placeholder="请输入其他原因（选填）"
          maxlength="200"
        ></textarea>
        <text class="char-count">{{ otherReason.length }}/200</text>
      </view>
    </view>

    <!-- 确认协议 -->
    <view class="agreement-section">
      <view class="checkbox-wrapper" @click="toggleAgreement">
        <view class="checkbox" :class="{ 'checked': agreedToCancel }">
          <text v-if="agreedToCancel">✓</text>
        </view>
      </view>
      <text class="agreement-text">
        我已阅读并同意注销账号，理解注销后的所有后果
      </text>
    </view>

    <!-- 注销按钮 -->
    <view class="button-section">
      <button class="cancel-btn" :loading="loading" :disabled="!agreedToCancel" @click="confirmCancel">
        确认注销账号
      </button>
      <button class="back-btn" @click="goBack">
        我再想想
      </button>
    </view>

    <!-- 客服提示 -->
    <view class="service-tip">
      <text class="tip-text">如有疑问，请联系</text>
      <button class="service-btn" open-type="contact" contact-type="seller">
        <text class="service-text">在线客服</text>
      </button>
    </view>
  </view>
</template>

<script>
import { cancelAccount } from '@/api/index.js'

export default {
  data() {
    return {
      reasons: [
        '找到对象了，不需要了',
        '使用频率太低',
        '匹配效果不理想',
        '隐私安全担忧',
        '功能不满意',
        '其他原因'
      ],
      selectedReason: -1,
      otherReason: '',
      agreedToCancel: false,
      loading: false
    };
  },
  methods: {
    // 选择注销原因
    selectReason(index) {
      this.selectedReason = index;
      if (index !== this.reasons.length - 1) {
        this.otherReason = '';
      }
    },

    // 切换协议同意状态
    toggleAgreement() {
      this.agreedToCancel = !this.agreedToCancel;
    },

    // 确认注销
    confirmCancel() {
      if (!this.agreedToCancel) {
        uni.showToast({
          title: '请先同意注销协议',
          icon: 'none'
        });
        return;
      }

      // 二次确认
      uni.showModal({
        title: '确认注销',
        content: '注销后账号信息将被永久删除，无法恢复。确定要注销吗？',
        confirmText: '确定注销',
        confirmColor: '#FF4D4F',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.handleCancel();
          }
        }
      });
    },

    // 处理注销
    async handleCancel() {
      this.loading = true;
      try {
        // 获取注销原因
        let reason = '';
        if (this.selectedReason >= 0) {
          if (this.selectedReason === this.reasons.length - 1) {
            reason = this.otherReason || '其他原因';
          } else {
            reason = this.reasons[this.selectedReason];
          }
        }

        // 调用注销API
        await cancelAccount({
          reason: reason
        });

        uni.showToast({
          title: '注销成功',
          icon: 'success'
        });

        // 清除本地数据
        uni.clearStorageSync();

        // 延迟跳转到登录页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/index'
          });
        }, 1500);
      } catch (e) {
        uni.showToast({
          title: e.msg || '注销失败，请重试',
          icon: 'none'
        });
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
  background-color: #F8F8F8;
  padding: 30rpx;
}

/* 警告提示 */
.warning-section {
  background: linear-gradient(135deg, #FFE5E5 0%, #FFF0F0 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 30rpx;
  border: 2rpx solid #FFD4D4;
}

.warning-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.warning-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #FF4D4F;
  margin-bottom: 15rpx;
}

.warning-desc {
  display: block;
  font-size: 26rpx;
  color: #FF6B6B;
}

/* 注销说明 */
.notice-section {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.notice-title {
  display: flex;
  align-items: center;
  margin-bottom: 25rpx;
}

.notice-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.notice-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.notice-item {
  display: flex;
  align-items: flex-start;
}

.notice-dot {
  font-size: 28rpx;
  color: #FF4D4F;
  margin-right: 15rpx;
  line-height: 1.6;
}

.notice-content {
  flex: 1;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

/* 注销原因 */
.reason-section {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.reason-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 25rpx;
}

.reason-options {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.reason-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25rpx;
  background-color: #F8F8F8;
  border-radius: 15rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
}

.reason-item.selected {
  background-color: #FFF0F0;
  border-color: #FF4D4F;
}

.reason-text {
  font-size: 28rpx;
  color: #333333;
}

.check-icon {
  font-size: 32rpx;
  color: #FF4D4F;
  font-weight: bold;
}

.other-reason {
  margin-top: 20rpx;
  position: relative;
}

.reason-input {
  width: 100%;
  min-height: 200rpx;
  padding: 20rpx;
  background-color: #F8F8F8;
  border-radius: 15rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

.char-count {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  font-size: 24rpx;
  color: #999999;
}

/* 确认协议 */
.agreement-section {
  display: flex;
  align-items: flex-start;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.checkbox-wrapper {
  padding: 5rpx;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #CCCCCC;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
}

.checkbox.checked {
  background-color: #FF4D4F;
  border-color: #FF4D4F;
}

.checkbox.checked text {
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: bold;
}

.agreement-text {
  flex: 1;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

/* 按钮区域 */
.button-section {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.cancel-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #FF6B81 0%, #FF4D4F 100%);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 50rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn[disabled] {
  background: #CCCCCC;
  opacity: 0.6;
}

.cancel-btn:active:not([disabled]) {
  opacity: 0.9;
}

.back-btn {
  width: 100%;
  height: 100rpx;
  background-color: #FFFFFF;
  color: #666666;
  font-size: 32rpx;
  border-radius: 50rpx;
  border: 2rpx solid #E8E8E8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:active {
  background-color: #F8F8F8;
}

/* 客服提示 */
.service-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 30rpx 0;
}

.tip-text {
  font-size: 26rpx;
  color: #999999;
}

.service-btn {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

.service-text {
  font-size: 26rpx;
  color: #FF4D4F;
  text-decoration: underline;
}
</style>
