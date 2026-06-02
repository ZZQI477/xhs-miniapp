<template>
  <view class="modal-overlay" v-if="visible" @click="handleDismiss">
    <view class="modal-card" @click.stop>
      <!-- 顶部图标 -->
      <view class="modal-icon">
        <text class="icon-emoji">📝</text>
      </view>

      <!-- 标题 -->
      <view class="modal-title">完善您的资料</view>

      <!-- 进度条 -->
      <view class="progress-section">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: percent + '%' }"></view>
        </view>
        <text class="progress-text">当前完善度 {{ percent }}%</text>
      </view>

      <!-- 提示文案 -->
      <view class="modal-desc">
        {{ modalDesc }}
      </view>

      <view v-if="missingFields.length > 0" class="missing-list">
        <text class="missing-title">建议优先完善：</text>
        <text class="missing-text">{{ missingFieldsText }}</text>
      </view>

      <!-- 按钮区 -->
      <view class="modal-buttons">
        <button class="btn-primary" @click="handleConfirm">立即完善</button>
        <button class="btn-secondary" @click="handleDismiss">稍后再说</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ProfileCheckModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    percent: {
      type: Number,
      default: 0
    },
    missingFields: {
      type: Array,
      default: () => []
    }
  },
  emits: ['confirm', 'dismiss'],
  computed: {
    missingFieldsText() {
      return this.missingFields.join('、')
    },
    modalDesc() {
      if (this.missingFields.length > 0) {
        return '基础信息未完成，请先补齐关键信息后再继续使用。'
      }
      return '完善资料获得更多曝光和匹配推荐，让更多人看到你！'
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm')
    },
    handleDismiss() {
      this.$emit('dismiss')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
}

.modal-card {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  padding: 50rpx 40rpx 80rpx;
  text-align: center;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-icon {
  margin-bottom: 30rpx;
}

.icon-emoji {
  font-size: 80rpx;
}

.modal-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 30rpx;
}

.progress-section {
  margin-bottom: 30rpx;
}

.progress-bar {
  height: 16rpx;
  background-color: #F0F0F0;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF4D4F, #FF7875);
  border-radius: 8rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 28rpx;
  color: #999999;
}

.modal-desc {
  font-size: 30rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 24rpx;
  padding: 0 20rpx;
}

.missing-list {
  background: #FFF6F6;
  border-radius: 20rpx;
  margin: 0 10rpx 40rpx;
  padding: 24rpx 28rpx;
  text-align: left;
}

.missing-title {
  display: block;
  font-size: 28rpx;
  color: #FF4D4F;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.missing-text {
  display: block;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.btn-primary {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(90deg, #FF4D4F, #FF7875);
  color: #FFFFFF;
  font-size: 34rpx;
  font-weight: 500;
  border-radius: 48rpx;
  border: none;
}

.btn-primary::after {
  border: none;
}

.btn-secondary {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background-color: #F5F5F5;
  color: #999999;
  font-size: 34rpx;
  border-radius: 48rpx;
  border: none;
}

.btn-secondary::after {
  border: none;
}
</style>
