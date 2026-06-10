<template>
  <view class="chat-input-container">
    <!-- 输入区域 -->
    <view class="input-area">
      <!-- 更多按钮 -->
      <view class="more-btn" @click="toggleMorePanel">
        <text class="more-icon">+</text>
      </view>
      
      <!-- 输入框 -->
      <view class="input-wrapper">
        <input 
          class="message-input"
          type="text"
          v-model="inputText"
          :placeholder="placeholder"
          :maxlength="maxLength"
          :adjust-position="true"
          :cursor-spacing="10"
          confirm-type="send"
          @confirm="handleSend"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />
      </view>
      
      <!-- 发送按钮 -->
      <view class="send-btn" :class="{ active: canSend }" @click="handleSend">
        <text class="send-text">发送</text>
      </view>
    </view>
    
    <!-- 更多功能面板 -->
    <view class="more-panel" v-if="showMorePanel">
      <view class="panel-item" @click="chooseImage">
        <view class="panel-icon-wrap">
          <text class="panel-icon">📷</text>
        </view>
        <text class="panel-label">图片</text>
      </view>
      
      <!-- VIP功能：更多选项 -->
      <view class="panel-item" v-if="isVip" @click="sendWechatCard">
        <view class="panel-icon-wrap">
          <text class="panel-icon">💬</text>
        </view>
        <text class="panel-label">发送微信</text>
      </view>
    </view>
    
    <!-- 安全区域占位 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script>
export default {
  name: 'ChatInput',
  props: {
    placeholder: {
      type: String,
      default: '输入消息...'
    },
    maxLength: {
      type: Number,
      default: 500
    },
    isVip: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['send', 'sendImage', 'sendWechat'],
  data() {
    return {
      inputText: '',
      showMorePanel: false
    }
  },
  computed: {
    canSend() {
      return this.inputText.trim().length > 0 && !this.disabled
    }
  },
  methods: {
    handleInput(e) {
      this.inputText = e.detail.value
    },
    
    handleFocus() {
      this.showMorePanel = false
    },
    
    handleBlur() {
      // 失焦处理（可选）
    },
    
    handleSend() {
      if (!this.canSend) return
      
      const content = this.inputText.trim()
      this.$emit('send', {
        content: content,
        type: 'text'
      })
      
      // 清空输入
      this.inputText = ''
    },
    
    toggleMorePanel() {
      this.showMorePanel = !this.showMorePanel
    },
    
    chooseImage() {
      this.showMorePanel = false
      
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          if (tempFilePaths.length > 0) {
            this.$emit('sendImage', {
              content: tempFilePaths[0],
              type: 'image'
            })
          }
        },
        fail: (err) => {
          console.error('[ChatInput] 选择图片失败', err)
        }
      })
    },
    
    sendWechatCard() {
      this.showMorePanel = false
      this.$emit('sendWechat')
    },
    
    // 外部调用：聚焦输入框
    focus() {
      // input组件没有focus方法，通过ref操作
    },
    
    // 外部调用：清空输入
    clear() {
      this.inputText = ''
    }
  }
}
</script>

<style scoped>
.chat-input-container {
  background-color: #FFFFFF;
  border-top: 1rpx solid #F0F0F0;
}

/* 输入区域 */
.input-area {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  gap: 16rpx;
}

/* 更多按钮 */
.more-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.more-icon {
  font-size: 36rpx;
  color: #666666;
  line-height: 1;
}

/* 输入框 */
.input-wrapper {
  flex: 1;
  background-color: #F5F5F5;
  border-radius: 30rpx;
  padding: 0 24rpx;
  min-height: 60rpx;
  display: flex;
  align-items: center;
}

.message-input {
  width: 100%;
  font-size: 28rpx;
  color: #333333;
  background: transparent;
}

/* 发送按钮 */
.send-btn {
  width: 100rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background-color: #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-btn.active {
  background-color: #8068F7;
}

.send-text {
  font-size: 26rpx;
  color: #999999;
}

.send-btn.active .send-text {
  color: #FFFFFF;
}

/* 更多功能面板 */
.more-panel {
  display: flex;
  padding: 30rpx 40rpx;
  gap: 40rpx;
  background-color: #F8F8F8;
}

.panel-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.panel-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.panel-icon {
  font-size: 48rpx;
  line-height: 1;
}

.panel-label {
  font-size: 24rpx;
  color: #666666;
}

/* 安全区域 */
.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>