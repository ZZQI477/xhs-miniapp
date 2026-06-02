<template>
  <view class="container">
    <!-- Tab栏 -->
    <view class="tabs">
      <view
        class="tab-item"
        v-for="tab in tabs"
        :key="tab.type"
        :class="{ active: currentTab === tab.type }"
        @click="switchTab(tab.type)"
      >
        {{ tab.name }}
        <view class="badge" v-if="unreadCount[tab.type] > 0">
          {{ unreadCount[tab.type] > 99 ? '99+' : unreadCount[tab.type] }}
        </view>
      </view>
    </view>

    <!-- 操作栏 -->
    <view class="action-bar" v-if="list.length > 0">
      <text class="action-btn" @click="markAllRead">全部已读</text>
      <text class="action-btn danger" @click="clearAll">清空</text>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-if="!loading && list.length === 0">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无消息</text>
    </view>

    <!-- 消息列表 -->
    <view class="list" v-else>
      <view
        class="message-item"
        v-for="item in list"
        :key="item.id"
        :class="{ unread: !item.is_read }"
        @click="handleClick(item)"
      >
        <!-- 消息图标 -->
        <view class="message-icon" :class="item.type">
          <text v-if="item.type === 'request'">💌</text>
          <text v-else-if="item.type === 'want'">👀</text>
          <text v-else>📢</text>
        </view>

        <!-- 消息内容 -->
        <view class="message-content">
          <view class="message-header">
            <text class="message-title">{{ formatMessageTitle(item) }}</text>
            <text class="message-time">{{ item.time_text }}</text>
          </view>
          <text class="message-desc">{{ item.content }}</text>

          <!-- 想看信息 -->
          <view class="want-info" v-if="item.type === 'want' && item.extra && item.extra.want_type">
            <view class="want-label">
              <text class="want-icon">👀</text>
              <text class="want-type-text">对方想看你的{{ formatWantType(item.extra.want_type) }}</text>
            </view>
          </view>

          <!-- 微信号信息 -->
          <view class="wechat-info" v-if="item.extra && item.extra.wechat">
            <view class="wechat-label">
              <text class="wechat-icon">💬</text>
              <text class="wechat-text">对方微信号</text>
            </view>
            <view class="wechat-value">
              <text class="wechat-number">{{ item.extra.wechat }}</text>
              <text class="copy-btn" @click.stop="copyWechat(item.extra.wechat)">复制</text>
            </view>
          </view>

          <!-- 来源用户 -->
          <view class="from-user" v-if="item.from_user" @click.stop="goUserDetail(item.from_user.id)">
            <image class="from-avatar" :src="item.from_user.avatar || '/static/logo.png'" mode="aspectFill"></image>
            <text class="from-name">{{ item.from_user.nickname }}</text>
            <text class="view-btn">查看 →</text>
          </view>
        </view>

        <!-- 未读标记 -->
        <view class="unread-dot" v-if="!item.is_read"></view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="load-more" v-if="list.length > 0">
      <text v-if="loading">加载中...</text>
      <text v-else-if="noMore">没有更多了</text>
      <text v-else @click="loadMore">点击加载更多</text>
    </view>
  </view>
</template>

<script>
import { getMessageList, getUnreadCount, markMessageRead, clearMessages } from '@/api/index.js'

export default {
  data() {
    return {
      tabs: [
        { type: 'all', name: '全部' },
        { type: 'request', name: '好友申请' },
        { type: 'want', name: '想看我的' },
        { type: 'system', name: '系统通知' }
      ],
      currentTab: 'all',
      list: [],
      page: 1,
      pageSize: 20,
      loading: false,
      noMore: false,
      unreadCount: {
        all: 0,
        request: 0,
        want: 0,
        system: 0
      }
    }
  },
  onLoad() {
    this.loadUnreadCount()
    this.loadData()
  },
  onShow() {
    // 每次显示时刷新未读数
    this.loadUnreadCount()
  },
  onPullDownRefresh() {
    this.page = 1
    this.noMore = false
    Promise.all([this.loadUnreadCount(), this.loadData()]).then(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    // 格式化消息标题，确保显示想看类型
    formatMessageTitle(item) {
      if (item.type === 'want' && item.extra && item.extra.want_type) {
        const wantTypeMap = {
          wechat: '微信',
          images: '照片',
          introduce: '介绍',
          tag: '标签',
          idealPartner: '理想对象'
        };
        const typeText = wantTypeMap[item.extra.want_type] || '信息';
        return '有人想看你的' + typeText;
      }
      return item.title;
    },

    // 格式化想看类型
    formatWantType(wantType) {
      const wantTypeMap = {
        wechat: '微信',
        images: '照片',
        introduce: '介绍',
        tag: '标签',
        idealPartner: '理想对象'
      };
      return wantTypeMap[wantType] || '信息';
    },

    // 切换Tab
    switchTab(type) {
      if (this.currentTab === type) return
      this.currentTab = type
      this.page = 1
      this.noMore = false
      this.list = []
      this.loadData()
    },

    // 加载未读数量
    async loadUnreadCount() {
      try {
        const res = await getUnreadCount()
        this.unreadCount = {
          all: res.data.total || 0,
          request: res.data.request || 0,
          want: res.data.want || 0,
          system: res.data.system || 0
        }
      } catch (e) {
        console.error('加载未读数失败', e)
      }
    },

    // 加载消息列表
    async loadData() {
      this.loading = true
      try {
        const res = await getMessageList({
          type: this.currentTab,
          page: this.page,
          pagesize: this.pageSize
        })
        const data = res.data.list || []

        if (this.page === 1) {
          this.list = data
        } else {
          this.list = [...this.list, ...data]
        }

        if (data.length < this.pageSize) {
          this.noMore = true
        }
      } catch (e) {
        console.error('加载消息失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    // 加载更多
    loadMore() {
      if (this.loading || this.noMore) return
      this.page++
      this.loadData()
    },

    async handleClick(item) {
      // 标记已读
      if (!item.is_read) {
        try {
          await markMessageRead({ id: item.id })
          item.is_read = 1
          this.loadUnreadCount()
        } catch (e) {
          console.error('标记已读失败', e)
        }
      }

      // 根据消息类型跳转
      if (item.from_user) {
        this.goUserDetail(item.from_user.id)
      }
    },

    // 跳转用户详情
    goUserDetail(userId) {
      uni.navigateTo({
        url: `/pages/user/detail?id=${userId}`
      })
    },

    // 复制微信号
    copyWechat(wechat) {
      uni.setClipboardData({
        data: wechat,
        success: () => {
          uni.showToast({
            title: '微信号已复制',
            icon: 'success'
          })
        }
      })
    },

    // 全部标记已读
    markAllRead() {
      uni.showModal({
        title: '提示',
        content: '确定将所有消息标记为已读吗？',
        success: async (res) => {
          if (!res.confirm) return

          try {
            uni.showLoading({ title: '处理中...' })
            const params = this.currentTab === 'all' ? {} : { type: this.currentTab }
            await markMessageRead(params)

            // 更新列表状态
            this.list.forEach(item => {
              item.is_read = 1
            })
            this.loadUnreadCount()

            uni.showToast({ title: '操作成功', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: '操作失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    },

    // 清空消息
    clearAll() {
      uni.showModal({
        title: '提示',
        content: '确定清空所有消息吗？此操作不可恢复',
        success: async (res) => {
          if (!res.confirm) return

          try {
            uni.showLoading({ title: '清空中...' })
            const params = this.currentTab === 'all' ? {} : { type: this.currentTab }
            await clearMessages(params)

            this.list = []
            this.loadUnreadCount()

            uni.showToast({ title: '清空成功', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: '操作失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #F8F8F8;
  min-height: 100vh;
}

/* Tab栏 */
.tabs {
  display: flex;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 25rpx 0;
  font-size: 26rpx;
  color: #666666;
  position: relative;
}

.tab-item.active {
  color: #FF4D4F;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #FF4D4F;
  border-radius: 2rpx;
}

.badge {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  background-color: #FF4D4F;
  color: #FFFFFF;
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  border-radius: 20rpx;
  min-width: 28rpx;
  text-align: center;
  font-weight: normal;
}

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: flex-end;
  padding: 15rpx 30rpx;
  background-color: #FFFFFF;
  gap: 30rpx;
}

.action-btn {
  font-size: 24rpx;
  color: #666666;
}

.action-btn.danger {
  color: #FF4D4F;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}

/* 消息列表 */
.list {
  padding: 20rpx;
}

.message-item {
  display: flex;
  align-items: flex-start;
  background-color: #FFFFFF;
  padding: 25rpx;
  margin-bottom: 15rpx;
  border-radius: 15rpx;
  position: relative;
}

.message-item.unread {
  background-color: #FFF9F9;
}

/* 消息图标 */
.message-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.message-icon.request {
  background-color: #FFF0F0;
}

.message-icon.want {
  background-color: #E6F7FF;
}

.message-icon.system {
  background-color: #F6FFED;
}

/* 消息内容 */
.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.message-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.message-time {
  font-size: 22rpx;
  color: #999999;
}

.message-desc {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 15rpx;
  line-height: 1.5;
}

/* 来源用户 */
.from-user {
  display: flex;
  align-items: center;
  background-color: #F8F8F8;
  padding: 15rpx 20rpx;
  border-radius: 10rpx;
}

/* 微信号信息 */
.wechat-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 25rpx;
  border-radius: 12rpx;
  margin-bottom: 15rpx;
}

.wechat-label {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.wechat-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.wechat-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.wechat-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 15rpx 20rpx;
  border-radius: 8rpx;
}

.wechat-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}

.copy-btn {
  font-size: 24rpx;
  color: #FFFFFF;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.from-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 15rpx;
  background-color: #EEEEEE;
}

.from-name {
  font-size: 26rpx;
  color: #333333;
  flex: 1;
}

.view-btn {
  font-size: 24rpx;
  color: #FF4D4F;
}

/* 未读标记 */
.unread-dot {
  position: absolute;
  top: 25rpx;
  right: 25rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: #FF4D4F;
  border-radius: 50%;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: #999999;
}

/* 想看信息 */
.want-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 25rpx;
  border-radius: 12rpx;
  margin-bottom: 15rpx;
}

.want-label {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.want-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.want-type-text {
  font-size: 26rpx;
  color: #FFFFFF;
}
</style>
