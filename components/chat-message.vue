<template>
  <view class="message-wrapper" :class="{ 'is-self': isSelf }">
    <!-- 时间分割线 -->
    <view class="time-divider" v-if="showTime">
      <text class="time-text">{{ displayTime }}</text>
    </view>
    
    <!-- 消息内容 -->
    <view class="message-container">
      <!-- 对方头像（左侧） -->
      <image 
        v-if="!isSelf" 
        class="avatar" 
        :src="senderAvatar" 
        mode="aspectFill"
        @click="$emit('avatarTap')"
      ></image>
      
      <!-- 消息气泡 -->
      <view class="message-bubble" :class="{ 'self-bubble': isSelf }">
        <!-- 文字消息 -->
        <view v-if="message.msg_type === 'text'" class="text-content">
          <text class="text-message">{{ message.content }}</text>
        </view>
        
        <!-- 图片消息 -->
        <view v-else-if="message.msg_type === 'image'" class="image-content" @click="previewImage(message.content)">
          <image class="message-image" :src="message.content" mode="widthFix"></image>
        </view>
        
        <!-- 系统消息 -->
        <view v-else-if="message.msg_type === 'system'" class="system-content">
          <text class="system-text">{{ message.content }}</text>
        </view>
        
        <!-- 消息状态 -->
        <view class="message-status" v-if="isSelf && showStatus">
          <text class="status-text" :class="message.status">
            {{ statusText }}
          </text>
        </view>
      </view>
      
      <!-- 自己头像（右侧） -->
      <image 
        v-if="isSelf" 
        class="avatar" 
        :src="selfAvatar || '/static/logo.png'" 
        mode="aspectFill"
      ></image>
    </view>
  </view>
</template>

<script>
import { getCurrentUserId } from '@/utils/guestAuth.js'

export default {
  name: 'ChatMessage',
  props: {
    message: {
      type: Object,
      required: true
    },
    selfAvatar: {
      type: String,
      default: ''
    },
    targetAvatar: {
      type: String,
      default: ''
    },
    selfUserId: {
      type: String,
      default: ''
    },
    showTime: {
      type: Boolean,
      default: false
    },
    showStatus: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    isSelf() {
      // 优先使用is_self字段，其次判断from_id
      if (this.message.is_self !== undefined) {
        return this.message.is_self
      }
      const currentUserId = this.selfUserId || getCurrentUserId()
      return this.message.from_id === currentUserId || this.message.from_id == currentUserId
    },
    senderAvatar() {
      // 优先使用消息携带的发送者头像（如客服消息的from_user.avatar）
      if (this.message.sender_avatar) {
        return this.message.sender_avatar || '/static/logo.png'
      }
      return this.targetAvatar || '/static/logo.png'
    },
    displayTime() {
      // 优先使用后端提供的time_text
      if (this.message.time_text) {
        return this.message.time_text
      }
      // 否则自己格式化
      return this.formatTime(this.message.created_at)
    },
    statusText() {
      const statusMap = {
        sending: '发送中',
        sent: '',
        delivered: '已送达',
        read: '已读',
        failed: '发送失败'
      }
      return statusMap[this.message.status] || ''
    }
  },
  methods: {
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      const date = new Date(timestamp)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      
      if (isToday) {
        return `${hours}:${minutes}`
      } else {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${month}-${day} ${hours}:${minutes}`
      }
    },
    
    previewImage(url) {
      if (!url) return
      uni.previewImage({
        urls: [url],
        current: url
      })
    }
  }
}
</script>

<style scoped>
.message-wrapper {
  margin-bottom: 20rpx;
}

/* 时间分割线 */
.time-divider {
  text-align: center;
  margin: 30rpx 0 20rpx;
}

.time-text {
  font-size: 24rpx;
  color: #999999;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}

/* 消息容器 */
.message-container {
  display: flex;
  align-items: flex-start;
  padding: 0 30rpx;
}

.message-wrapper.is-self .message-container {
  justify-content: flex-end;
}

/* 头像 */
.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin: 0 16rpx;
  flex-shrink: 0;
  background-color: #F5F5F5;
}

/* 消息气泡 */
.message-bubble {
  max-width: 500rpx;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background-color: #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.self-bubble {
  background-color: #8068F7;
}

/* 文字消息 */
.text-content {
  word-break: break-all;
}

.text-message {
  font-size: 28rpx;
  line-height: 1.5;
  color: #333333;
}

.self-bubble .text-message {
  color: #FFFFFF;
}

/* 图片消息 */
.image-content {
  overflow: hidden;
  border-radius: 12rpx;
}

.message-image {
  max-width: 400rpx;
  min-width: 150rpx;
}

/* 系统消息 */
.system-content {
  text-align: center;
}

.system-text {
  font-size: 24rpx;
  color: #999999;
}

/* 消息状态 */
.message-status {
  margin-top: 8rpx;
  text-align: right;
}

.status-text {
  font-size: 20rpx;
  color: #999999;
}

.status-text.failed {
  color: #FF4D4F;
}

.status-text.read {
  color: #52C41A;
}
</style>