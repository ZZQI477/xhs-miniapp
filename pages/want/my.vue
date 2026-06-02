<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <custom-nav-bar
      title="我想看的"
      backgroundImage="/static/bg3.png"
    />

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

    <!-- 空状态 --> 
    <view class="empty" v-if="!loading && list.length === 0">
      <text class="empty-icon">👀</text>
      <text class="empty-text">暂无记录</text>
      <text class="empty-tip">去单身库看看感兴趣的人吧</text>
      <navigator class="empty-btn" url="/pages/single/index">去看看</navigator>
    </view>

    <!-- 列表 -->
    <view class="list" v-else>
      <view class="list-item" v-for="item in list" :key="item.id" @click="goDetail(item.id)">
        <image class="avatar" :src="item.avatar || '/static/logo.png'" mode="aspectFill"></image>
        <view class="info">
          <view class="info-top">
            <text class="nickname">{{ item.nickname || '匿名用户' }}</text>
			  <image  class="gender-icon" :src="item.gender == 1 ? '/static/m.png' : '/static/wm.png' " mode=""></image>
          </view>
          <text class="desc">
            {{ item.age || '?' }}岁 · {{ item.height || '?' }}cm · {{ item.city || '未知' }}
          </text>
          <text class="time">{{ formatTime(item.createtime) }}</text>
        </view>
        <view class="want-type" :class="item.want_type">
          {{ getWantTypeText(item.want_type) }}
        </view>
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
import { getMyWantList } from '@/api/index.js'
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
      noMore: false
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
        const res = await getMyWantList({
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

    goDetail(userId) {
      uni.navigateTo({
        url: `/pages/user/detail?id=${userId}`
      })
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
.gender-icon {
	width: 40rpx;
	height: 40rpx;
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

.time {
  font-size: 22rpx;
  color: #999999;
}

.want-type {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.want-type.wechat {
  background-color: #E6F7FF;
  color: #1890FF;
}

.want-type.images {
  background-color: #FFF0F0;
  color: #FF4D4F;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx;
  font-size: 26rpx;
  color: #999999;
}
</style>
