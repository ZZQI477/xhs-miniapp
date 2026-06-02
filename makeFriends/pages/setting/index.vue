<template>
  <view class="container">
    <!-- 设置列表 -->
    <view class="setting-list">
      <!-- 账号隐身 -->
      <view class="setting-item">
        <text class="setting-label">账号隐身</text>
        <switch class="toggle-switch" :checked="isHidden" @change="toggleHidden" color="#FF3D58"></switch>
      </view>

      <!-- UID -->
      <view class="setting-item">
        <text class="setting-label">UID</text>
        <view class="uid-container">
          <text class="uid-text">{{ userInfo.uid || '加载中...' }}</text>
          <view class="copy-btn" @click="copyUID">
            <text class="copy-icon">📋</text>
          </view>
        </view>
      </view>

      <!-- 个人信息 -->
      <navigator class="setting-item" url="/pages/profile/edit">
        <text class="setting-label">个人信息</text>
        <text class="arrow-icon">→</text>
      </navigator>

      <!-- 关于我们 -->
      <navigator class="setting-item" url="/pages/about/index">
        <text class="setting-label">关于我们</text>
        <view class="version-container">
          <text class="version-text">v1.3.5</text>
          <text class="arrow-icon">→</text>
        </view>
      </navigator>

      <!-- 注销账号 -->
      <navigator class="setting-item" url="/pages/account/cancel">
        <text class="setting-label">注销账号</text>
        <text class="arrow-icon">→</text>
      </navigator>
    </view>

    <!-- 底部隐私政策 -->
    <view class="privacy-policy">
      <text class="policy-text">《隐私政策》</text>
      <text class="policy-separator">《</text>
      <text class="policy-text">用户协议</text>
      <text class="policy-separator">》</text>
      <text class="policy-text">《第三方数据信息合作共享清单》</text>
    </view>
  </view>
</template>

<script>
import { getUserInfo } from '@/api/index.js'

export default {
  data() {
    return {
      userInfo: {},
      isHidden: false
    };
  },
  onLoad() {
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await getUserInfo();
        this.userInfo = res.data;
        this.isHidden = res.data.is_hidden || false;
      } catch (e) {
        console.error('加载用户信息失败', e);
      }
    },

    // 复制UID
    copyUID() {
      if (!this.userInfo.uid) {
        uni.showToast({
          title: '数据未加载',
          icon: 'none'
        });
        return;
      }

      uni.setClipboardData({
        data: this.userInfo.uid,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'success'
          });
        }
      });
    },

    // 切换隐身状态
    toggleHidden(e) {
      this.isHidden = e.detail.value;
      // TODO: 调用API更新隐身状态
      uni.showToast({
        title: this.isHidden ? '已开启隐身' : '已关闭隐身',
        icon: 'success'
      });
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #FFFFFF;
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.setting-list {
  margin: 20rpx 0;
  padding: 0 30rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background-color: #FFFFFF;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  border: none;
}

.setting-label {
  font-size: 30rpx;
  color: #333333;
}

.toggle-switch {
  transform: scale(0.9);
}

.uid-container {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.uid-text {
  font-size: 28rpx;
  color: #999999;
}

.copy-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-icon {
  font-size: 28rpx;
}

.arrow-icon {
  font-size: 28rpx;
  color: #999999;
}

.version-container {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.version-text {
  font-size: 28rpx;
  color: #999999;
}

.privacy-policy {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 80rpx;
  padding: 0 30rpx;
}

.policy-text {
  font-size: 24rpx;
  color: #999999;
}

.policy-separator {
  font-size: 24rpx;
  color: #999999;
}
</style>
