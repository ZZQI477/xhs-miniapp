<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <custom-nav-bar
      title="想看我的"
      backgroundImage="https://minixhs.chugao520.com/makefriends/bg3.png"
    />

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

    <!-- 空状态 -->
    <view class="empty" v-if="!loading && list.length === 0">
      <text class="empty-icon">💝</text>
      <text class="empty-text">暂无记录</text>
      <text class="empty-tip">完善资料，吸引更多人关注你</text>
      <navigator class="empty-btn" url="/pages/profile/edit">完善资料</navigator>
    </view>

    <!-- 列表 -->
    <view class="list" v-else>
      <view class="list-item" v-for="item in list" :key="item.id" @click="showDetail(item)">
        <image class="avatar" :src="item.user.avatar || 'https://minixhs.chugao520.com/makefriends/logo.png'" mode="aspectFill"></image>
        <view class="info">
          <view class="info-top">
            <text class="nickname">{{ item.user.nickname || '匿名用户' }}</text>
            <text class="gender" :class="{ female: item.user.gender == 2 }">
              {{ item.user.gender == 1 ? '♂' : '♀' }}
            </text>
          </view>
          <text class="desc">
            {{ item.user.age || '?' }}岁 · {{ item.user.height || '?' }}cm · {{ item.user.city || '未知' }}
          </text>
          <text class="time">{{ formatTime(item.createtime) }}</text>
        </view>
        <view class="right-info">
          <view class="want-type" :class="item.want_type">
            想看{{ getWantTypeText(item.want_type) }}
          </view>
          <view class="status-tag" :class="item.status" v-if="item.status !== 'pending'">
            {{ item.status === 'accepted' ? '已同意' : '已拒绝' }}
          </view>
          <view class="pending-tag" v-else>
            待处理
          </view>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="load-more" v-if="list.length > 0">
      <text v-if="loading">加载中...</text>
      <text v-else-if="noMore">没有更多了</text>
      <text v-else @click="loadMore">点击加载更多</text>
    </view>

    <!-- 用户详情弹窗 -->
    <view class="popup-mask" v-if="showPopup" @click="closePopup"></view>
    <view class="popup-content" v-if="showPopup">
      <view class="popup-header">
        <text class="popup-title">查看对方资料</text>
        <text class="popup-close" @click="closePopup">×</text>
      </view>

      <view class="popup-user" v-if="currentItem">
        <image class="popup-avatar" :src="currentItem.user.avatar || 'https://minixhs.chugao520.com/makefriends/logo.png'" mode="aspectFill" @click="goDetail(currentItem.user.id)"></image>
        <view class="popup-info">
          <view class="popup-name-row">
            <text class="popup-name">{{ currentItem.user.nickname }}</text>
            <text class="popup-gender" :class="{ female: currentItem.user.gender == 2 }">
              {{ currentItem.user.gender == 1 ? '♂' : '♀' }}
            </text>
            
          </view>
          <text class="popup-desc">{{ currentItem.user.height || '?' }}cm · </text>
		  <text class="popup-age">{{ currentItem.user.age }}岁</text>
        </view>
        <view class="view-profile" @click="goDetail(currentItem.user.id)">
          <text>查看主页</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <view class="popup-tip">
          <text class="tip-icon">💡</text>
          <text class="tip-text">对方想查看你的{{ currentItem && getWantTypeText(currentItem.want_type) }}</text>
        </view>

      <!-- 已处理状态 -->
      <view class="popup-status" v-if="currentItem && currentItem.status !== 'pending'">
        <text class="status-result" :class="currentItem.status">
          {{ currentItem.status === 'accepted' ? '你已同意，双方微信已解锁' : '你已拒绝该请求' }}
        </text>
      </view>

      <!-- 操作按钮 -->
      <view class="popup-actions" v-if="currentItem && currentItem.status === 'pending'">
        <view class="action-btn reject" @click="handleAction('rejected')">
          <text>拒绝</text>
        </view>
        <view class="action-btn accept" @click="handleAction('accepted')">
          <text>同意解锁</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getWantMeList, handleWant } from '@/api/index.js'
import CustomNavBar from '../../components/custom-nav-bar.vue'

export default {
  components: {
    CustomNavBar
  },
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 20,
      loading: false,
      noMore: false,
      showPopup: false,
      currentItem: null
    }
  },
  onLoad() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.page = 1
    this.noMore = false
    this.loadData().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getWantMeList({
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
        console.error('加载失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    loadMore() {
      if (this.loading || this.noMore) return
      this.page++
      this.loadData()
    },

    // 显示详情弹窗
    showDetail(item) {
      this.currentItem = item
      this.showPopup = true
    },

    // 关闭弹窗
    closePopup() {
      this.showPopup = false
      this.currentItem = null
    },

    // 跳转用户详情
    goDetail(userId) {
      uni.navigateTo({
        url: `/pages/user/detail?id=${userId}`
      })
    },

    // 处理同意/拒绝
    async handleAction(action) {
      const actionText = action === 'accepted' ? '同意' : '拒绝'

      try {
        if (action === 'accepted') {
          // 如果想看的是wechat，执行解锁逻辑
          if (this.currentItem.want_type === 'wechat') {
            uni.showLoading({ title: '处理中...' })
            await handleWant({
              id: this.currentItem.id,
              status: action
            })

            // 更新本地状态
            this.currentItem.status = action

            // 更新列表中的状态
            const index = this.list.findIndex(item => item.id === this.currentItem.id)
            if (index !== -1) {
              this.list[index].status = action
            }

            uni.hideLoading()

            uni.showModal({
              title: '解锁成功',
              content: '双方微信号已互相解锁，可在消息中查看对方微信号',
              showCancel: false,
              confirmText: '知道了',
              success: () => {
                this.closePopup()
              }
            })
          } else {
            // 如果想看的是别的，跳转到完善资料页面
            this.closePopup()
            uni.navigateTo({
              url: '/pages/profile/edit'
            })
          }
        } else {
          // 拒绝操作保持不变
          uni.showLoading({ title: '处理中...' })
          await handleWant({
            id: this.currentItem.id,
            status: action
          })

          // 更新本地状态
          this.currentItem.status = action

          // 更新列表中的状态
          const index = this.list.findIndex(item => item.id === this.currentItem.id)
          if (index !== -1) {
            this.list[index].status = action
          }

          uni.hideLoading()

          uni.showToast({
            title: '已拒绝',
            icon: 'success'
          })
          this.closePopup()
        }
      } catch (e) {
        console.error('处理失败', e)
        uni.hideLoading()
        uni.showToast({
          title: e.msg || '操作失败',
          icon: 'none'
        })
      }
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp * 1000)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

      return `${date.getMonth() + 1}月${date.getDate()}日`
    },

    getWantTypeText(type) {
      switch (type) {
        case 'wechat': return '微信'
        case 'introduce': return '自我介绍'
        case 'tag': return '标签'
        case 'idealPartner': return '要求'
        default: return '照片'
      }
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #F8F8F8;
  min-height: 100vh;
}

/* 导航栏占位 */
.nav-bar-placeholder {
  height: 170rpx;
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
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 15rpx;
}

.empty-tip {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 40rpx;
}

.empty-btn {
  background-color: #FF4D4F;
  color: #FFFFFF;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

/* 列表 */
.list {
  padding: 20rpx;
}

.list-item {
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  padding: 25rpx;
  margin-bottom: 20rpx;
  border-radius: 15rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 25rpx;
  background-color: #F5F5F5;
}

.info {
  flex: 1;
  min-width: 0;
}

.info-top {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.nickname {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 15rpx;
  max-width: 200rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gender {
  font-size: 24rpx;
  color: #1890FF;
}

.gender.female {
  color: #FF85C0;
}

.desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.time {
  font-size: 22rpx;
  color: #999999;
}

.right-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
}

.want-type {
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  white-space: nowrap;
}

.want-type.wechat {
  background-color: #E6F7FF;
  color: #1890FF;
}

.want-type.images {
  background-color: #FFF0F0;
  color: #FF4D4F;
}

.status-tag {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 15rpx;
}

.status-tag.accepted {
  background-color: #F6FFED;
  color: #52C41A;
}

.status-tag.rejected {
  background-color: #FFF1F0;
  color: #FF4D4F;
}

.pending-tag {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  border-radius: 15rpx;
  background-color: #FFF7E6;
  color: #FA8C16;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: #999999;
}

/* 弹窗遮罩 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

/* 弹窗内容 */
.popup-content {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  z-index: 101;
  overflow: hidden;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.popup-close {
  font-size: 48rpx;
  color: #999999;
  line-height: 1;
}

.popup-user {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #FAFAFA;
}

.popup-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 25rpx;
  background-color: #EEEEEE;
}

.popup-info {
  flex: 1;
}

.popup-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.popup-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 15rpx;
}

.popup-gender {
  font-size: 24rpx;
  color: #1890FF;
  margin-right: 10rpx;
}

.popup-gender.female {
  color: #FF85C0;
}

.popup-age {
  font-size: 24rpx;
  color: #666666;
}

.popup-desc {
  font-size: 26rpx;
  color: #666666;
}

.view-profile {
  display: flex;
  align-items: center;
  padding: 16rpx 4rpx;
  background-color: #FFFFFF;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #FF4D4F;
}

.view-profile .arrow {
  font-size: 32rpx;
  margin-left: 2rpx;
}

.popup-tip {
  display: flex;
  align-items: flex-start;
  padding: 25rpx 30rpx;
  background-color: #FFF7E6;
  margin: 20rpx;
  border-radius: 12rpx;
}

.tip-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #FA8C16;
  line-height: 1.6;
  flex: 1;
}

.popup-status {
  padding: 20rpx 30rpx;
  text-align: center;
}

.status-result {
  font-size: 28rpx;
  padding: 16rpx 30rpx;
  border-radius: 30rpx;
}

.status-result.accepted {
  background-color: #F6FFED;
  color: #52C41A;
}

.status-result.rejected {
  background-color: #FFF1F0;
  color: #FF4D4F;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
}

.popup-actions .action-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  text-align: center;
}

.popup-actions .action-btn.reject {
  background-color: #F5F5F5;
  color: #666666;
}

.popup-actions .action-btn.accept {
  background-color: #FF4D4F;
  color: #FFFFFF;
}
</style>
