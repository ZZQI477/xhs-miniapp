<template>
  <view class="modal-overlay" v-if="visible" @click="handleCancel">
    <view class="modal-container" @click.stop>
      <view class="modal-title">{{ title }}</view>
      <view class="modal-content">
        <text class="content-line" v-for="(line, index) in contentLines" :key="index">{{ line }}</text>
      </view>
      <view class="modal-buttons">
        <view class="btn-cancel" @click="handleCancel">{{ cancelText }}</view>
        <view class="btn-confirm" @click="handleConfirm">{{ confirmText }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CenterModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    content: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  emits: ['confirm', 'cancel', 'update:visible'],
  computed: {
    contentLines() {
      return this.content.split('\n').filter(line => line.trim() !== '')
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm')
      this.$emit('update:visible', false)
    },
    handleCancel() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
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
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  width: 560rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-title {
  padding: 40rpx 32rpx 20rpx;
  font-size: 34rpx;
  font-weight: 800;
  color: #333333;
  text-align: center;
}

.modal-content {
  padding: 20rpx 32rpx 40rpx;
  text-align: center;
}

.content-line {
  display: block;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 8rpx;
  text-align: left;
}

.content-line:last-child {
  margin-bottom: 0;
}

.modal-buttons {
  display: flex;
  border-top: 1rpx solid #EEEEEE;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 32rpx;
}

.btn-cancel {
  color: #666666;
  border-right: 1rpx solid #EEEEEE;
}

.btn-confirm {
  color: red;
  font-weight: 500;
}

.btn-cancel:active {
  background-color: #F5F5F5;
}

.btn-confirm:active {
  background-color: #F5F5F5;
}
</style>