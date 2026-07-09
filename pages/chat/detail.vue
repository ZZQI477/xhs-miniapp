<template>
  <view class="chat-detail-container">
    <!-- 顶部导航栏 -->
    <custom-nav-bar
      :title="targetUser.customName || '聊天'"
      :isShowBack="true"
      backgroundImage="/static/bg3.png"
    >
      <!-- <template #right>
        <view class="nav-right" @click="showUserDetail">
          <text class="nav-text">详情</text>
        </view>
      </template> -->
    </custom-nav-bar>
    
    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>
    
    <!-- 游客提示 -->
    <view class="guest-tip" v-if="isGuest">
      <text class="tip-text">您正在以游客身份聊天</text>
      <text class="login-btn" @click="goLogin">去登录</text>
    </view>
    
    <!-- 消息列表 -->
    <scroll-view 
      class="message-list"
      scroll-y
      enhanced
      :show-scrollbar="false"
      :scroll-into-view="scrollToId"
      :scroll-with-animation="true"
    >
      <!-- 加载更多历史消息 -->
      <view class="load-history" v-if="hasMoreHistory" @click="loadHistory">
        <text v-if="loadingHistory">加载中...</text>
        <text v-else>点击加载更多历史消息</text>
      </view>
      
      <!-- 消息列表 -->
      <view 
        class="message-item"
        v-for="(msg, index) in messages"
        :key="msg.id || `temp_${index}`"
        :id="`msg_${msg.id || index}`"
      >
        <chat-message
          :message="msg"
          :selfAvatar="selfAvatar"
          :targetAvatar="targetUser.customAvatar"
          :selfUserId="selfUserId"
          :showTime="shouldShowTime(index)"
          @avatarTap="goUserProfile"
        />
      </view>
      
      <!-- 底部占位 -->
      <view class="list-bottom-space" id="msg_bottom"></view>
    </scroll-view>
    
    <!-- 底部输入区域 -->
    <chat-input
      ref="chatInput"
      :placeholder="inputPlaceholder"
      :isVip="isVip"
      :disabled="inputDisabled"
      @send="handleSendText"
      @sendImage="handleSendImage"
    />
    
    <!-- 用户信息弹窗 -->
    <view class="user-modal-mask" v-if="showUserModal" @click="closeUserModal"></view>
    <view class="user-modal" v-if="showUserModal">
      <view class="modal-header">
        <image class="modal-avatar" :src="targetUser.avatar || '/static/logo.png'" mode="aspectFill"></image>
        <view class="modal-info">
          <text class="modal-nickname">{{ targetUser.nickname || '匿名用户' }}</text>
          <text class="modal-desc">{{ targetUser.age || '?' }}岁 · {{ targetUser.city || '未知' }}</text>
        </view>
      </view>
      <view class="modal-actions">
        <view class="modal-btn" @click="goUserProfile">
          <text class="modal-btn-text">查看资料</text>
        </view>
        <view class="modal-btn primary" v-if="!isGuest" @click="goAddFriend">
          <text class="modal-btn-text">添加好友</text>
        </view>
      </view>
      <view class="modal-close" @click="closeUserModal">
        <text class="close-text">×</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getChatMessages, sendChatMessage, markChatRead, getOrCreateSession, blockUser, uploadImage } from '@/api/index.js'
import { isGuest, getCurrentUserId, getGuestUserInfo } from '@/utils/guestAuth.js'
import { initWebSocket, onMessage, offMessage } from '@/utils/websocket.js'
import config from '@/utils/config.js'
import CustomNavBar from '@/components/custom-nav-bar.vue'
import ChatMessage from '@/components/chat-message.vue'
import ChatInput from '@/components/chat-input.vue'

export default {
  name: 'ChatDetail',
  components: {
    CustomNavBar,
    ChatMessage,
    ChatInput
  },
  data() {
    return {
      toUserId: '',
      conversationId: '',
      isGuest: false,
      
      targetUser: {
        id: '',
        nickname: '',
        avatar: '',
        age: 0,
        city: '',
        is_online: false,
		// 增加默认的客服头像信息
		customName:'情感分析师',
		customAvatar:'https://minixhs.chugao520.com/assets/img/customAvatar.png'
      },
      
      messages: [],
      page: 1,
      pageSize: 20,
      hasMoreHistory: true,
      loadingHistory: false,
      
      scrollToId: '',
      selfUserId: '',
      selfAvatar: '',
      isVip: false,
      
      showUserModal: false,
      inputDisabled: false
    }
  },
  computed: {
    inputPlaceholder() {
      return `发送消息给${this.targetUser.nickname || '对方'}...`
    }
  },
  onLoad(options) {
    this.toUserId = options.to_user_id || ''
    this.conversationId = options.conversation_id || options.session_id || ''
    this.isGuest = isGuest() || options.guest === '1'
    
    // 获取当前用户信息
    this.selfUserId = getCurrentUserId()
    const userinfo = uni.getStorageSync('userinfo')
    if (userinfo) {
      this.selfAvatar = userinfo.avatar || ''
      this.isVip = userinfo.is_vip || false
    } else if (this.isGuest) {
      const guestInfo = getGuestUserInfo()
      this.selfAvatar = guestInfo?.avatar || ''
    }
    
    // 加载聊天历史
    this.loadHistory()
    
    // 初始化WebSocket
    this.initWebSocket()
    
    // 标记会话已读
    if (this.conversationId) {
      this.markAsRead()
    }
  },
  onShow() {
    // 重连WebSocket
    initWebSocket()
  },
  onUnload() {
    offMessage(this.handleNewMessage)
  },
  methods: {
    async loadHistory() {
      this.loadingHistory = true
      try {
        // 始终获取会话信息（包含对方用户头像等）
        if (this.toUserId) {
          const sessionRes = await getOrCreateSession({ target_id: this.toUserId })
          if (!this.conversationId) {
            this.conversationId = sessionRes.data?.session_id || sessionRes.data?.id || ''
          }
          if (sessionRes.data?.target_user) {
            this.targetUser = {
              ...this.targetUser,
              ...sessionRes.data.target_user
            }
          }
        }
        
        // 获取历史消息（后端参数为limit，非pagesize）
        const res = await getChatMessages({
          session_id: this.conversationId,
          page: this.page,
          limit: this.pageSize
        })
        
        // 响应格式：{ code: 1, data: { list: [], total: 1 } }
        const list = res.data?.list || res.list || []
        
        // 处理消息数据，适配前端组件格式
        const processedList = list.map(msg => ({
          id: msg.id,
          from_id: msg.from_id,
          to_id: msg.to_id,
          content: msg.content,
          msg_type: msg.type,  // type -> msg_type
          is_self: msg.is_self,
          is_read: msg.is_read,
          created_at: msg.createtime * 1000,  // 转换为毫秒
          time_text: msg.time_text,
          session_id: msg.session_id,
          status: 'sent'  // 历史消息默认已发送
        })).sort((a, b) => b.created_at - a.created_at)
		
        // 插入到前面（历史消息）
        if (this.page === 1) {
          this.messages = processedList.reverse()
          // 滚动到底部
          this.scrollToBottom()
        } else {
          this.messages = [...processedList.reverse(), ...this.messages]
        }
        
        // 判断是否有更多历史
        const total = res.data?.total || res.total || 0
        this.hasMoreHistory = this.messages.length < total
        
        this.page++
      } catch (e) {
        console.error('[ChatDetail] 加载历史失败', e)
        uni.showToast({ title: e.msg || '加载失败', icon: 'none' })
      } finally {
        this.loadingHistory = false
      }
    },
    
    initWebSocket() {
      initWebSocket()
      onMessage(this.handleNewMessage)
    },
    
    handleNewMessage(message) {
      console.log('[ChatDetail] 收到新消息', message)
      
      if (message.type !== 'chat') return
      
      // 判断消息是否属于当前会话
      const isCurrentSession = message.session_id && message.session_id == this.conversationId
      const isFromTarget = message.from_id == this.toUserId || message.to_id == this.toUserId
      // 客服模式：管理员from_id为负数，也属于当前会话
      const isFromAdmin = message.from_id < 0 || (message.from_user && message.from_user.is_admin)
      
      if (!isCurrentSession && !isFromTarget && !isFromAdmin) return
      
      // 如果是自己发的消息回执（服务器echo），更新临时消息的状态和ID，避免重复
      if (message.is_self || message.from_id == this.selfUserId) {
        const tempIndex = this.messages.findIndex(m => 
          m.id && m.id.startsWith('temp_') && 
          m.from_id == this.selfUserId &&
          m.content === message.content &&
          Math.abs(m.created_at - (message.created_at || (message.createtime ? message.createtime * 1000 : 0))) < 60000
        )
        
        if (tempIndex > -1) {
          // 更新临时消息为服务器返回的真实消息
          this.$set(this.messages, tempIndex, {
            ...this.messages[tempIndex],
            id: message.message_id || message.id || this.messages[tempIndex].id,
            status: 'sent',
            is_read: message.is_read,
            created_at: message.created_at || (message.createtime ? message.createtime * 1000 : this.messages[tempIndex].created_at)
          })
          return
        }
      }
      
      // 新消息（对方或客服发的），添加到消息列表
      // WebSocket消息type为"chat"，实际消息类型需用msg_type字段，无则默认text
      const msgType = message.msg_type || (message.type === 'chat' ? 'text' : message.type) || 'text'
      const newMsg = {
        id: message.message_id || message.id,
        from_id: message.from_id,
        to_id: message.to_id,
        content: message.content,
        msg_type: msgType,
        is_self: false,
        created_at: message.created_at || (message.createtime ? message.createtime * 1000 : Date.now()),
        status: 'sent'
      }
      
      // 如果消息携带了发送者头像信息，附加到消息上供组件使用
      if (message.from_user) {
        newMsg.sender_avatar = message.from_user.avatar || ''
        newMsg.sender_nickname = message.from_user.nickname || ''
      }
      
      // 去重：检查是否已存在相同ID的消息
      const exists = this.messages.some(m => m.id && m.id == newMsg.id)
      if (exists) return
      
      this.messages.push(newMsg)
      // 滚动到底部
      this.scrollToBottom()
      
      // 如果是对方发的消息，标记已读
      if (this.conversationId) {
        this.markAsRead()
      }
    },
    
    async handleSendText(data) {
      const message = {
        to_id: this.toUserId,
        content: data.content,
        msg_type: data.type || 'text',
        session_id: this.conversationId,
        created_at: Date.now(),
        status: 'sending'
      }
      
      // 先添加到本地列表（乐观更新）
      const tempId = `temp_${Date.now()}`
      message.id = tempId
      message.from_id = this.selfUserId
      message.is_self = true
      this.messages.push(message)
      this.scrollToBottom()
      
      // 更新消息状态的辅助函数（使用$set确保Vue2响应式更新）
      const updateMsgStatus = (tempId, status) => {
        const msgIndex = this.messages.findIndex(m => m.id === tempId)
        if (msgIndex > -1) {
          this.$set(this.messages[msgIndex], 'status', status)
        }
      }
      
      // 发送消息 - 始终通过HTTP API发送（后端负责保存消息和WebSocket推送）
      // WebSocket仅用于接收实时推送消息，不用于发送
      try {
        const res = await sendChatMessage({
          target_id: this.toUserId,
          content: data.content
        })
        
        // 更新临时消息为服务器返回的真实消息
        const msgIndex = this.messages.findIndex(m => m.id === tempId)
        if (msgIndex > -1) {
          this.$set(this.messages, msgIndex, {
            ...this.messages[msgIndex],
            id: res.data?.message_id || this.messages[msgIndex].id,
            session_id: res.data?.session_id || this.conversationId,
            status: 'sent'
          })
        }
        
        // 更新会话ID（首次发送时后端会创建会话）
        if (res.data?.session_id && !this.conversationId) {
          this.conversationId = res.data.session_id
        }
      } catch (e) {
        console.error('[ChatDetail] 发送消息失败', e)
        updateMsgStatus(tempId, 'failed')
        uni.showToast({ title: e.msg || '发送失败', icon: 'none' })
      }
    },
    
    async handleSendImage(data) {
      // 先上传图片
      uni.showLoading({ title: '发送中...' })
      
      try {
        // 使用API封装上传图片
        const uploadRes = await uploadImage(data.content)
        const imageUrl = uploadRes.data?.url || uploadRes.data?.full_url || ''
        
        if (!imageUrl) {
          throw new Error('上传返回地址为空')
        }
        
        // 发送图片消息
        await this.handleSendText({
          content: imageUrl,
          type: 'image'
        })
      } catch (e) {
        console.error('[ChatDetail] 发送图片失败', e)
        uni.showToast({ title: e.msg || '发送失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    
    scrollToBottom() {
      setTimeout(() => {
        this.scrollToId = 'msg_bottom'
      }, 100)
    },
    
    shouldShowTime(index) {
      if (index === 0) return true
      
      const currentMsg = this.messages[index]
      const prevMsg = this.messages[index - 1]
      
      if (!currentMsg.created_at || !prevMsg.created_at) return false
      
      // 相隔5分钟以上显示时间
      const diff = currentMsg.created_at - prevMsg.created_at
      return diff > 5 * 60 * 1000
    },
    
    async markAsRead() {
      try {
        await markChatRead({ session_id: this.conversationId })
      } catch (e) {
        console.error('[ChatDetail] 标记已读失败', e)
      }
    },
    
    showUserDetail() {
      this.showUserModal = true
    },
    
    closeUserModal() {
      this.showUserModal = false
    },
    
    goUserProfile() {
      this.closeUserModal()
      uni.navigateTo({
        url: `/pages/user/detail?id=${this.toUserId}`
      })
    },
    
    goAddFriend() {
      this.closeUserModal()
      // 使用现有的好友申请流程
      uni.showModal({
        title: '发起好友申请',
        content: '消耗10脱单币发起好友申请，对方同意后可查看联系方式',
        confirmText: '确认申请',
        success: async (res) => {
          if (res.confirm) {
            // TODO: 调用好友申请API
            uni.showToast({ title: '功能开发中', icon: 'none' })
          }
        }
      })
    },
    
    goLogin() {
      uni.navigateTo({
        url: '/pages/login/index'
      })
    }
  }
}
</script>

<style scoped>
.chat-detail-container {
  min-height: 100vh;
  height: 100vh;
  background-color: #F4F7FF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 导航栏占位 */
.nav-bar-placeholder {
  height: 160rpx;
}

/* 导航栏右侧 */
.nav-right {
  padding: 0 20rpx;
}

.nav-text {
  font-size: 28rpx;
  color: #6853F0;
}

/* 游客提示 */
.guest-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 30rpx;
  background-color: #FFF7E6;
}

.tip-text {
  font-size: 24rpx;
  color: #FAAD14;
}

.login-btn {
  font-size: 24rpx;
  color: #8068F7;
  font-weight: 500;
}

/* 消息列表 */
.message-list {
  flex: 1;
  height: 0;
  padding: 20rpx 0;
}

.load-history {
  text-align: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999999;
}

.message-item {
  margin-bottom: 10rpx;
}

.list-bottom-space {
  height: 20rpx;
}

/* 用户信息弹窗 */
.user-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.user-modal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  z-index: 1001;
  padding: 40rpx;
}

.modal-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.modal-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  background-color: #F5F5F5;
}

.modal-info {
  flex: 1;
}

.modal-nickname {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  display: block;
  margin-bottom: 10rpx;
}

.modal-desc {
  font-size: 26rpx;
  color: #999999;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-btn.primary {
  background-color: #8068F7;
}

.modal-btn-text {
  font-size: 28rpx;
  color: #666666;
}

.modal-btn.primary .modal-btn-text {
  color: #FFFFFF;
}

.modal-close {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-text {
  font-size: 48rpx;
  color: #999999;
  line-height: 1;
}
</style>