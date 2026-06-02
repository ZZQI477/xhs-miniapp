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
        </view>
        <button class="cancel-follow-btn" @click.stop="cancelFollow(user)">取消关注</button>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore" @click="loadMore">
      <text>{{ loading ? '加载中...' : '加载更多' }}</text>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-if="!loading && users.length === 0">
      <text>暂无关注</text>
    </view>
  </view>
</template>

<script>
import { getFollowList, toggleFollow } from '@/api/index.js'

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
    this.loadFollows();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.users = [];
    this.hasMore = true;
    this.loadFollows().then(() => {
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

    async loadFollows() {
      if (this.loading) return;
      this.loading = true;

      try {
        const res = await getFollowList({
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
        console.error('加载关注列表失败', e);
      } finally {
        this.loading = false;
      }
    },

    loadMore() {
      if (!this.hasMore || this.loading) return;
      this.page++;
      this.loadFollows();
    },

    goUserDetail(userId) {
      uni.navigateTo({
        url: `/pages/user/detail?id=${userId}`
      });
    },

    async cancelFollow(user) {
      uni.showModal({
        title: '提示',
        content: '确定取消关注该用户吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await toggleFollow({ user_id: user.id });
              // 从列表中移除
              const index = this.users.findIndex(u => u.id === user.id);
              if (index !== -1) {
                this.users.splice(index, 1);
              }
              uni.showToast({
                title: '已取消关注',
                icon: 'success'
              });
            } catch (e) {
              uni.showToast({
                title: e.msg || '操作失败',
                icon: 'none'
              });
            }
          }
        }
      });
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

.cancel-follow-btn {
  background-color: #FFFFFF;
  color: #666666;
  border: 1px solid #E8E8E8;
  border-radius: 30rpx;
  padding: 10rpx 30rpx;
  font-size: 24rpx;
  font-weight: 500;
  line-height: 1.5;
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
