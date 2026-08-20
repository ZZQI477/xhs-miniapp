<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <custom-nav-bar
      title="好友申请"
      :isShowBack="false"
      backgroundImage="https://minixhs.chugao520.com/makefriends/bg3.png"
    />

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

    <!-- 主Tab栏 -->
    <view class="tabs">
      <view class="tab-item" :class="{ active: currentTab === 'received' }" @click="switchTab('received')">
        收到的申请
        <view class="badge" v-if="pendingCount > 0">{{ pendingCount }}</view>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 'sent' }" @click="switchTab('sent')">
        发出的申请
      </view>
    </view>

    <!-- 子Tab栏 -->
    <view class="sub-tabs">
      <view
        class="sub-tab-item"
        v-for="(tab, index) in subTabs"
        :key="tab.key"
        :class="{ active: currentSubTab === index }"
        @click="switchSubTab(index)"
      >
        {{ tab.name }}
      </view>
    </view>
 


    <!-- 空状态 -->
    <view class="empty" v-if="!loading && list.length === 0">
      <text class="empty-icon">💌</text>
      <text class="empty-text">暂无{{ currentTab === 'received' ? '收到' : '发出' }}的申请</text>
    </view>

    <!-- 收到的申请列表 -->
    <view class="list" v-if="currentTab === 'received' && list.length > 0">
      <view class="list-item" v-for="item in list" :key="item.id">
        <view class="item-main" @click="goDetail(item.from_user.id)">
          <image class="avatar" :src="item.from_user.avatar || 'https://minixhs.chugao520.com/makefriends/logo.png'" mode="aspectFill"></image>
          <view class="info">
            <view class="info-top">
              <text class="nickname">{{ item.from_user.nickname || '匿名用户' }}</text> 
			  <image  class="gender-icon" :src="item.from_user.gender == 1 ? 'https://minixhs.chugao520.com/makefriends/m.png' : 'https://minixhs.chugao520.com/makefriends/wm.png' " mode=""></image>
            </view>
            <text class="desc">
              {{ item.from_user.age +'岁' || ' ' }} · {{ item.from_user.height +'cm' || ' ' }} · {{ item.from_user.city || '--' }}
            </text>
            <text class="message" v-if="item.message">{{ item.message }}</text>
            <text class="time">{{ formatTime(item.createtime) }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="actions" v-if="item.status === 'pending'">
          <button class="btn reject" @click="handleAction(item.id, 'reject')">拒绝</button>
          <button class="btn accept" @click="handleAction(item.id, 'accept')">同意</button>
        </view>
        <view class="status-text" v-else>
          <text v-if="item.status === 'accepted'" class="accepted">已同意</text>
          <text v-else-if="item.status === 'rejected'" class="rejected">已拒绝</text>
        </view>
      </view>
    </view>

    <!-- 发出的申请列表 -->
    <view class="list" v-if="currentTab === 'sent' && list.length > 0">
      <view class="list-item" v-for="item in list" :key="item.id">
        <view class="item-main" @click="goDetail(item.target_user.id)">
          <image class="avatar" :src="item.target_user.avatar || 'https://minixhs.chugao520.com/makefriends/logo.png'" mode="aspectFill"></image>
          <view class="info">
            <view class="info-top">
              <text class="nickname">{{ item.target_user.nickname || '匿名用户' }}</text>
              <text class="gender" :class="{ female: item.target_user.gender == 2 }">
                {{ item.target_user.gender == 1 ? '♂' : '♀' }}
              </text>
            </view>
            <text class="desc">
              {{ item.target_user.age || '?' }}岁 · {{ item.target_user.height || '?' }}cm · {{ item.target_user.city || '未知' }}
            </text>
            <text class="message" v-if="item.message">{{ item.message }}</text>
            <text class="time">{{ formatTime(item.createtime) }}</text>
          </view>
        </view>

        <!-- 已通过显示查看微信按钮 -->
        <view class="actions" v-if="item.status === 'accepted'">
          <button class="btn view-wechat" @click="viewWechat(item.target_user.id)">查看微信</button>
        </view>
        <view class="status-tag" v-else :class="item.status">
          {{ statusText(item.status) }}
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="load-more" v-if="list.length > 0">
      <text v-if="loading">加载中...</text>
      <text v-else-if="noMore">没有更多了</text>
      <text v-else @click="loadMore">点击加载更多</text>
    </view>

    <!-- 拒绝理由选择器 -->
    <view class="reject-sheet-mask" v-if="showRejectSheet" @click="showRejectSheet = false"></view>
    <view class="reject-sheet" v-if="showRejectSheet">
      <view class="reject-header">请选择拒绝理由</view>
      <picker-view class="reject-picker" :value="[rejectIndex]" @change="onRejectChange">
        <picker-view-column>
          <view class="reject-item" v-for="(item, index) in rejectReasons" :key="index">
            {{ item }}
          </view>
        </picker-view-column>
      </picker-view>
      <view class="reject-footer">
        <view class="btn-cancel" @click="showRejectSheet = false">取消</view>
        <view class="btn-confirm" @click="confirmReject">确定</view>
      </view>
    </view>

    <!-- 查看微信安全提示弹窗 -->
    <view class="wechat-modal-mask" v-if="showWechatModal" @click="showWechatModal = false"></view>
    <view class="wechat-modal" v-if="showWechatModal">
      <view class="modal-header">
        <text class="modal-title">安全提示</text>
        <text class="modal-close" @click="showWechatModal = false">×</text>
      </view>
      <view class="modal-content">
        <text class="modal-text">恭喜您开启一段新的相识！为了帮助您拥有更安心、愉快的交流，请留意以下几点：</text>
        <text class="modal-tip">1. 保护个人信息：谨慎透露身份证、家庭住址、银行卡密码等敏感信息。</text>
        <text class="modal-tip">2. 警惕金钱往来：所有关于投资、汇款、借钱的要求都可能是诈骗，请务必保持警惕。</text>
        <text class="modal-tip">3. 沟通贴士：后续深度沟通将在微信进行，本平台无法再为您监控聊天内容，对于平台外发生的任何纠纷，我们无法介入处理。建议像认识任何新朋友一样，保持警惕。</text>
      </view>
      <view class="modal-footer">
        <view class="btn-modal-cancel" @click="showWechatModal = false">取消</view>
        <view class="btn-modal-confirm" @click="confirmViewWechat">知晓并同意</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getRequestList, handleRequest } from '@/api/index.js'
import CustomNavBar from '../../components/custom-nav-bar.vue'

export default {
  components: {
    CustomNavBar
  },
  data() {
    return {
      currentTab: 'received',
      subTabs: [
        { name: '全部', key: '' },
        { name: '待处理', key: 'pending' },
        { name: '已通过', key: 'accepted' },
        { name: '已拒绝', key: 'rejected' }
      ],
      currentSubTab: 0,
      list: [],
      page: 1,
      pageSize: 20,
      loading: false,
      noMore: false,
      pendingCount: 0,
      showRejectSheet: false,
      rejectId: null,
      rejectIndex: 0,
      rejectReasons: [
        '不是我喜欢的类型',
        '距离太远了',
        '资料不够完善',
        '暂时不想认识新朋友',
        '其他原因'
      ],
      showWechatModal: false,
      currentWechatUserId: null
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
    switchTab(tab) {
      if (this.currentTab === tab) return
      this.currentTab = tab
      this.currentSubTab = 0
      this.page = 1
      this.noMore = false
      this.list = []
      this.loadData()
    },

    switchSubTab(index) {
      if (this.currentSubTab === index) return
      this.currentSubTab = index
      this.page = 1
      this.noMore = false
      this.list = []
      this.loadData()
    },

    async loadData() {
      this.loading = true
      try {
        const params = {
          type: this.currentTab,
          page: this.page,
          pagesize: this.pageSize
        }

        // 添加状态筛选
        const status = this.subTabs[this.currentSubTab].key
        if (status) {
          params.status = status
        }

        const res = await getRequestList(params)
        const data = res.data.list || []

        if (this.page === 1) {
          this.list = data
        } else {
          this.list = [...this.list, ...data]
        }

        // 计算待处理数量
        if (this.currentTab === 'received') {
          this.pendingCount = this.list.filter(item => item.status === 'pending').length
        }

        this.hasMore = data.length >= this.pageSize
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

    async handleAction(requestId, action) {
      if (action === 'reject') {
        // 显示拒绝理由选择器
        this.rejectId = requestId
        this.showRejectSheet = true
        return
      }

      // 同意申请
      try {
        uni.showLoading({ title: '处理中...' })
        await handleRequest({
          request_id: requestId,
          action: action
        })

        uni.showToast({
          title: '已同意，双方微信已解锁',
          icon: 'success'
        })

        // 刷新列表
        this.page = 1
        this.loadData()
      } catch (e) {
        uni.showToast({ title: e.msg || '操作失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    onRejectChange(e) {
      this.rejectIndex = e.detail.value[0]
    },

    async confirmReject() {
      try {
        uni.showLoading({ title: '处理中...' })
        await handleRequest({
          request_id: this.rejectId,
          action: 'reject',
          reject_reason: this.rejectReasons[this.rejectIndex]
        })

        this.showRejectSheet = false
        uni.showToast({
          title: '已拒绝',
          icon: 'success'
        })

        // 刷新列表
        this.page = 1
        this.loadData()
      } catch (e) {
        uni.showToast({ title: e.msg || '操作失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    viewWechat(userId) {
      this.currentWechatUserId = userId
      this.showWechatModal = true
    },

    confirmViewWechat() {
      this.showWechatModal = false
      if (this.currentWechatUserId) {
        this.goDetail(this.currentWechatUserId)
      }
    },

    goDetail(userId) {
      uni.navigateTo({
        url: `/pages/user/detail?id=${userId}`
      })
    },

    statusText(status) {
      const map = {
        pending: '待处理',
        accepted: '已同意',
        rejected: '已拒绝'
      }
      return map[status] || status
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
    }
  }
}
</script>

<style scoped>
.container {
  /* background-image: url('https://minixhs.chugao520.com/makefriends/bg1.png'); */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  padding-bottom: 120rpx;
  position: relative;
  z-index: 0;
}

/* 导航栏占位 */
.nav-bar-placeholder {
  height: 160rpx;
}



/* Tab栏 */
.tabs {
  display: flex;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 28rpx;
  color: #666666;
  position: relative;
}

.tab-item.active {
  /* color: #FF4D4F; */
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 90rpx;
  height: 10rpx;
  background-color: #8f4dffa8;
  border-radius: 2rpx;
}

.badge {
  position: absolute;
  top: 15rpx;
  right: 50%;
  transform: translateX(80rpx);
  background-color: #FF4D4F;
  color: #FFFFFF;
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 20rpx;
  min-width: 30rpx;
  text-align: center;
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

/* 列表 */
.list {
  padding: 20rpx;
}

.list-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
  padding: 25rpx;
  margin-bottom: 20rpx;
  border-radius: 15rpx;
}

.item-main {
  display: flex;
  align-items: flex-start;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-right: 25rpx;
  background-color: #F5F5F5;
  flex-shrink: 0;
}

.info {
  flex: 1;
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

.message {
  font-size: 26rpx;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
  background-color: #F8F8F8;
  padding: 15rpx;
  border-radius: 10rpx;
}

.time {
  font-size: 22rpx;
  color: #999999;
}

/* 操作按钮 */
.actions {
  display: flex;
  justify-content: space-between;
}

.btn {
  border-radius: 30rpx;
 margin-left: 10rpx;
  width: 114rpx;
  height: 46rpx;
  font-weight: 500;
  font-size: 26rpx;
  color: #FFFFFF;
  line-height: 46rpx;
}

.btn.reject {
  background-color: #FFFFFF;
  color: #6853F0;
  border: 1px solid #6853F0;
}

.btn.accept {
  background-color: #8068F7;
  color: #FFFFFF;
}

/* 状态文本 */
.status-text {
  text-align: right;
  /* border-top: 1rpx solid #F0F0F0; */
  font-size: 24rpx;
}

.status-text .accepted {
  background-color: #F3F9FF;
  color: #2D8CF0;
}

.status-text .rejected {
  background-color: #FFF0F0;
  color: #EC1717;
}

/* 状态标签 */
.status-tag {
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  margin-left: auto;
  flex-shrink: 0;
}

.status-tag.pending {
  background-color: #FFF7E6;
  color: #FAAD14;
}

.status-tag.accepted {
  background-color: #F3F9FF;
  color: #2D8CF0;
}

.status-tag.rejected {
  background-color: #FFF0F0;
  color: #EC1717;
}
.gender-icon {
	width: 40rpx;
	height: 40rpx;
}
/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: #999999;
}

/* 子Tab栏 */
.sub-tabs {
  width: 650rpx;
  height: 90rpx;
  margin: 30rpx auto;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.sub-tab-item {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #131313;
  padding: 16rpx 0;
}

.sub-tab-item.active {
  color: #6853F0;
  font-weight: bold;
  background: #EEE9FF;
  border-radius: 50rpx;
}

/* 查看微信按钮 */
.btn.view-wechat {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF4D4F 100%);
  color: #FFFFFF;
}

/* 拒绝理由选择器 */
.reject-sheet-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.reject-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #FFFFFF;
  border-radius: 20rpx 20rpx 0 0;
  z-index: 1001;
}

.reject-header {
  font-size: 36rpx;
  color: #131313;
  font-weight: 500;
  text-align: center;
  line-height: 100rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.reject-picker {
  height: 400rpx;
}

.reject-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #131313;
  height: 80rpx;
}

.reject-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #F0F0F0;
}

.btn-cancel {
  flex: 1;
  height: 80rpx;
  background-color: #F5F5F5;
  color: #757575;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF4D4F 100%);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 查看微信安全提示弹窗 */
.wechat-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.wechat-modal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 640rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  z-index: 2001;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #131313;
}

.modal-close {
  font-size: 48rpx;
  color: #999999;
  line-height: 1;
}

.modal-content {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  max-height: 600rpx;
  overflow-y: auto;
}

.modal-text {
  font-size: 28rpx;
  color: #131313;
  line-height: 1.6;
}

.modal-tip {
  font-size: 28rpx;
  color: #131313;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 30rpx;
  border-top: 1rpx solid #F0F0F0;
}

.btn-modal-cancel {
  flex: 1;
  height: 90rpx;
  background-color: #F5F5F5;
  color: #757575;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-modal-confirm {
  flex: 1;
  height: 90rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF4D4F 100%);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 10rpx 0 rgba(227, 184, 184, 0.2);
}
</style>
