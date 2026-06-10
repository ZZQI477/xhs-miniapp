<template>
  <view class="chat-list-container">
    <!-- 顶部导航栏 -->
    <custom-nav-bar
      title="聊天"
      :isShowBack="false"
      backgroundImage="/static/bg3.png"
    />
    
    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>
    
    <!-- 未登录提示 -->
    <view class="guest-tip" v-if="isGuest">
      <text class="tip-text">您正在以游客身份聊天，去登录</text>
      <text class="login-btn" @click="goLogin">立即登录</text>
    </view>
    
    <!-- 加载中 -->
    <view class="loading-container" v-if="loading && conversations.length === 0">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-container" v-if="!loading && conversations.length === 0">
      <image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
      <text class="empty-text">暂无聊天记录</text>
      <!-- <text class="empty-tip">通过分享卡片进入用户详情页可发起聊天</text> -->
    </view>
    
    <!-- 会话列表 -->
    <scroll-view 
      class="conversation-list" 
      scroll-y 
      enhanced 
      :show-scrollbar="false"
      v-if="conversations.length > 0"
    >
      <view 
        class="conversation-item" 
        v-for="item in conversations" 
        :key="item.id"
        @click="goChatDetail(item)"
        @longpress="showItemActions(item)"
      >
        <!-- 头像 -->
        <view class="avatar-wrapper">
          <image 
            class="avatar" 
            :src="item.target_user?.avatar || '/static/logo.png'" 
            mode="aspectFill"
          ></image>
          <view class="online-badge" v-if="item.target_user?.is_online"></view>
        </view>
        
        <!-- 会话信息 -->
        <view class="conversation-info">
          <view class="info-header">
            <text class="nickname">{{ item.target_user?.nickname || '匿名用户' }}</text>
            <text class="time-text">{{ item.last_time_text || formatTime(item.last_time) }}</text>
          </view>
          <view class="info-content">
            <text class="last-message">{{ formatLastMessage(item) }}</text>
            <view class="unread-badge" v-if="item.user_unread > 0 || item.unread > 0">
              <text class="unread-count">{{ getUnreadCount(item) }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="hasMore">
        <text v-if="loadingMore">加载中...</text>
        <text v-else @click="loadMore">加载更多</text>
      </view>
    </scroll-view>
    
    <!-- 操作菜单 -->
    <view class="action-sheet-mask" v-if="showActionSheet" @click="closeActionSheet"></view>
    <view class="action-sheet" v-if="showActionSheet">
      <view class="action-item" @click="markAsRead">
        <text class="action-text">标记为已读</text>
      </view>
      <view class="action-item danger" @click="blockUserAction">
        <text class="action-text">屏蔽用户</text>
      </view>
      <view class="action-item cancel" @click="closeActionSheet">
        <text class="action-text">取消</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getChatList, markChatRead, blockUser, getOrCreateSession, getChatConfig } from '@/api/index.js'
import { isGuest, getCurrentUserId } from '@/utils/guestAuth.js'
import { initWebSocket, onMessage, offMessage, closeWebSocket } from '@/utils/websocket.js'
import CustomNavBar from '@/components/custom-nav-bar.vue'

export default {
  name: 'ChatList',
  components: {
    CustomNavBar
  },
  data() {
    return {
      conversations: [],
      loading: false,
      loadingMore: false,
      hasMore: true,
      page: 1,
      pageSize: 20,
      isGuest: false,
      showActionSheet: false,
      currentActionItem: null
    }
  },
  onLoad() {
    this.isGuest = isGuest()
    this.loadConversations()
    this.initWebSocket()
  },
  onShow() {
    // 刷新会话列表
    this.page = 1
    this.loadConversations()
    // 重连WebSocket
    initWebSocket()
  },
  onHide() {
    // 可选：断开WebSocket节省资源
    // closeWebSocket()
  },
  onUnload() {
    offMessage(this.handleNewMessage)
    closeWebSocket()
  },
  onPullDownRefresh() {
    this.page = 1
    this.hasMore = true
    this.loadConversations().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadConversations() {
      this.loading = true
      try {
        const res = await getChatList({
          page: this.page,
          limit: this.pageSize
        })
        
        // 响应格式：{ code: 1, data: { list: [], total: 1 } }
        const list = res.data?.list || res.list || []
        
        if (this.page === 1) {
          this.conversations = list
        } else {
          this.conversations = [...this.conversations, ...list]
        }
        
        // 使用total判断是否有更多
        const total = res.data?.total || res.total || 0
        this.hasMore = this.conversations.length < total
      } catch (e) {
        console.error('[ChatList] 加载会话列表失败', e)
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    loadMore() {
      if (this.loadingMore || !this.hasMore) return
      this.page++
      this.loadingMore = true
      this.loadConversations().finally(() => {
        this.loadingMore = false
      })
    },
    
    initWebSocket() {
      initWebSocket()
      onMessage(this.handleNewMessage)
    },
    
    handleNewMessage(message) {
      console.log('[ChatList] 收到新消息', message)
      
      if (message.type === 'chat') {
        // 更新会话列表
        const convIndex = this.conversations.findIndex(
          c => c.target_id === message.from_id || c.target_user?.id === message.from_id
        )
        
        if (convIndex > -1) {
          // 更新现有会话
          this.conversations[convIndex].last_message = message.content
          this.conversations[convIndex].last_time = message.createtime || Date.now() / 1000
          this.conversations[convIndex].last_time_text = message.time_text || ''
          if (!message.is_self) {
            this.conversations[convIndex].user_unread = (this.conversations[convIndex].user_unread || 0) + 1
          }
          // 移动到列表顶部
          const conv = this.conversations.splice(convIndex, 1)[0]
          this.conversations.unshift(conv)
        } else {
          // 新会话，刷新列表
          this.page = 1
          this.loadConversations()
        }
      }
    },
    
    goChatDetail(item) {
      const targetUserId = item.target_user?.id
      uni.navigateTo({
        url: `/pages/chat/detail?to_user_id=${targetUserId}&session_id=${item.session_id || item.id}`
      })
    },
    
    showItemActions(item) {
      this.currentActionItem = item
      this.showActionSheet = true
    },
    
    closeActionSheet() {
      this.showActionSheet = false
      this.currentActionItem = null
    },
    
    async markAsRead() {
      if (!this.currentActionItem) return
      
      try {
        await markChatRead({ session_id: this.currentActionItem.session_id || this.currentActionItem.id })
        this.currentActionItem.user_unread = 0
        this.currentActionItem.unread = 0
        uni.showToast({ title: '已标记为已读', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: e.msg || '操作失败', icon: 'none' })
      }
      
      this.closeActionSheet()
    },
    
    async blockUserAction() {
      if (!this.currentActionItem) return
      
      try {
        await blockUser({ user_id: this.currentActionItem.target_id || this.currentActionItem.target_user?.id })
        const index = this.conversations.findIndex(c => c.id === this.currentActionItem.id)
        if (index > -1) {
          this.conversations.splice(index, 1)
        }
        uni.showToast({ title: '已屏蔽该用户', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: e.msg || '操作失败', icon: 'none' })
      }
      
      this.closeActionSheet()
    },
    
    goLogin() {
      uni.navigateTo({
        url: '/pages/login/index'
      })
    },
    
    formatTime(timestamp) {
      if (!timestamp) return ''
      
      // 如果是秒级时间戳，转换为毫秒
      const ts = timestamp < 10000000000 ? timestamp * 1000 : timestamp
      
      const date = new Date(ts)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
      
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return `${month}-${day}`
    },
    
    formatLastMessage(item) {
      if (!item || !item.last_message) return ''
      
      const msgType = item.last_type || 'text'
      
      if (msgType === 'image') {
        return '[图片]'
      } else if (msgType === 'system') {
        return '[系统消息]'
      }
      
      // 截断过长消息
      const content = item.last_message || ''
      return content.length > 30 ? content.substring(0, 30) + '...' : content
    },
    
    getUnreadCount(item) {
      const count = item.user_unread || item.unread || 0
      return count > 99 ? '99+' : count
    }
  }
}
</script>

<style scoped>
.chat-list-container {
  min-height: 100vh;
  background-color: #F8F8F8;
}

/* 导航栏占位 */
.nav-bar-placeholder {
  height: 160rpx;
}

/* 游客提示 */
.guest-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #FFF7E6;
}

.tip-text {
  font-size: 26rpx;
  color: #FAAD14;
}

.login-btn {
  font-size: 26rpx;
  color: #8068F7;
  font-weight: 500;
}

/* 加载中 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 30rpx;
  color: #999999;
  margin-bottom: 20rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #CCCCCC;
}

/* 会话列表 */
.conversation-list {
  height: calc(100vh - 160rpx - env(safe-area-inset-bottom));
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background-color: #FFFFFF;
  margin-bottom: 2rpx;
}

.conversation-item:active {
  background-color: #F5F5F5;
}

/* 头像 */
.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #F5F5F5;
}

.online-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background-color: #52C41A;
  border: 4rpx solid #FFFFFF;
}

/* 会话信息 */
.conversation-info {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.nickname {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.time-text {
  font-size: 22rpx;
  color: #999999;
}

.info-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.last-message {
  font-size: 26rpx;
  color: #999999;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  background-color: #FF4D4F;
  border-radius: 20rpx;
  padding: 4rpx 12rpx;
  margin-left: 16rpx;
  flex-shrink: 0;
}

.unread-count {
  font-size: 22rpx;
  color: #FFFFFF;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: #999999;
}

/* 操作菜单 */
.action-sheet-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.action-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  z-index: 1001;
  padding-bottom: env(safe-area-inset-bottom);
}

.action-item {
  padding: 30rpx;
  text-align: center;
  border-bottom: 1rpx solid #F0F0F0;
}

.action-item:last-child {
  border-bottom: none;
}

.action-text {
  font-size: 30rpx;
  color: #333333;
}

.action-item.danger .action-text {
  color: #FF4D4F;
}

.action-item.cancel .action-text {
  color: #999999;
}
</style>