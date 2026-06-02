<template>
  <view class="modal-overlay" v-if="visible" @click="handleClose">
    <view class="modal-card" @click.stop>
      <view class="modal-content">
        <text class="modal-tip">长按图片扫一扫快速关注</text>
        <image
          class="qrcode-image"
          :src="qrcodeUrl"
          mode="aspectFit"
          show-menu-by-longpress
        ></image>
        <text class="modal-title">{{ title }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'QrcodeModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    qrcodeUrl: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '告白时刻Daily公众号'
    }
  },
  emits: ['close'],
  methods: {
    handleClose() {
      this.$emit('close')
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

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-tip {
  font-size: 30rpx;
  color: #131313;
  margin-bottom: 30rpx;
}

.qrcode-image {
  width: 320rpx;
  height: 320rpx;
  margin-bottom: 28rpx;
}

.modal-title {
  font-size: 30rpx;
  color: #131313;
}
</style>
