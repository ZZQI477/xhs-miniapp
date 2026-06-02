<template>
  <view class="container">
    <!-- 标签页 -->
    <view class="tabs">
      <view class="tab-item" :class="{ active: activeTab === 'certified' }" @click="switchTab('certified')">
        <text class="tab-text">已认证用户</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'uncertified' }" @click="switchTab('uncertified')">
        <text class="tab-text">未认证用户</text>
      </view>
    </view>

    <!-- 用户列表 -->
    <view class="user-list">
      <view class="user-item" v-for="user in filteredUsers" :key="user.id" @click="goUserDetail(user.id)">
        <image class="user-avatar" :src="user.avatar" mode="aspectFill"></image>
        <view class="user-info">
          <view class="user-name">
            <text class="name">{{ user.nickname }}</text>
            <text class="certified-icon" v-if="user.is_verified">✓</text>
          </view>
          <text class="user-details">{{ user.age }}岁 {{ user.city }} {{ user.height }}cm</text>
          <text class="visit-time">{{ formatTime(user.visit_time) }}来访</text>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore" @click="loadMore">
      <text>{{ loading ? '加载中...' : '加载更多' }}</text>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-if="!loading && users.length === 0">
      <text>暂无访客</text>
    </view>
  </view>
</template>

<script>
import { getVisitList } from '@/api/index.js'

export default {
  data() {
    return {
      activeTab: 'certified',
      users: [],
      page: 1,
      limit: 20,
      total: 0,
      loading: false,
      hasMore: true
    };
  },
  computed: {
    filteredUsers() {
      if (this.activeTab === 'certified') {
        return this.users.filter(u => u.is_verified);
      }
      return this.users.filter(u => !u.is_verified);
    }
  },
  onLoad() {
    this.loadVisitors();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.users = [];
    this.hasMore = true;
    this.loadVisitors().then(() => {
      uni.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore();
    }
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab;
    },

    async loadVisitors() {
      if (this.loading) return;
      this.loading = true;

      try {
        const res = await getVisitList({
          page: this.page,
          limit: this.limit
        });

        const list = res.data.list || [];

        if (this.page === 1) {
          this.users = list;
        } else {
          this.users = [...this.users, ...list];
        }

        this.total = res.data.total;
        this.hasMore = this.users.length < this.total;
      } catch (e) {
        console.error('加载访客列表失败', e);
      } finally {
        this.loading = false;
      }
    },

    loadMore() {
      if (!this.hasMore || this.loading) return;
      this.page++;
      this.loadVisitors();
    },

    goUserDetail(userId) {
      uni.navigateTo({
        url: `/pages/index/index?user_id=${userId}`
      });
    },

    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp * 1000);
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 30) return `${days}天前`;
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #FFFFFF;
  min-height: 100vh;
}

.tabs {
  display: flex;
  margin: 30rpx;
  background-color: #F8F8F8;
  border-radius: 15rpx;
  padding: 10rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 15rpx 0;
  border-radius: 10rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background-color: #FF4D4F;
}

.tab-text {
  font-size: 28rpx;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #FFFFFF;
}

.tab-item:not(.active) .tab-text {
  color: #666666;
}

.user-list {
  padding: 0 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.certified-icon {
  font-size: 24rpx;
  color: #1890FF;
}

.user-details {
  font-size: 26rpx;
  color: #666666;
}

.visit-time {
  font-size: 24rpx;
  color: #999999;
}

.load-more {
  text-align: center;
  padding: 30rpx;
  color: #999999;
  font-size: 28rpx;
}

.empty {
  text-align: center;
  padding: 100rpx;
  color: #999999;
  font-size: 28rpx;
}
</style>
