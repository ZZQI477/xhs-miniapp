<template>
  <view class="container">
    <!-- 资料完善弹窗 -->
    <profile-check-modal
      :visible="showProfileModal"
      :percent="stats.profile_percent"
      :missing-fields="profileMissingFields"
      @confirm="onProfileGuide"
      @dismiss="onProfileDismiss"
    />

    <!-- 未登录状态 -->
    <view class="not-login" v-if="!isLoggedIn">
    <!-- <view class="not-login" v-if="!isLoggedIn"> -->
      <view class="login-prompt">
        <image class="prompt-icon" src="https://minixhs.chugao520.com/makefriends/logo.png" mode="aspectFit"></image>
        <text class="prompt-title">登录后查看更多内容</text>
        <text class="prompt-desc">登录后可查看个人信息、互动消息等</text>
        <button class="login-btn" @click="goLogin">立即登录</button>
      </view>
    </view>

    <!-- 已登录状态 -->
    <view v-else>
      <!-- 用户信息区 -->
      <view class="user-section">
        <!-- 背景图片 -->
        <image class="background-image" :src="userInfo.avatar || 'https://minixhs.chugao520.com/makefriends/logo.png'" mode="aspectFill"></image>
        
        <!-- 左上角：返回按钮 -->
        <!-- <view class="back-btn">
          <image class="back-icon" src="https://minixhs.chugao520.com/makefriends/back.png" mode="aspectFit"></image>
        </view> -->
        
        <!-- 右上角：设置和消息图标 -->
        <view class="top-right-icons">
          <image class="top-icon" src="/static/settings.png" mode="aspectFit"></image>
          <image class="top-icon" src="/static/notification.png" mode="aspectFit"></image>
        </view>
        

        <!-- 白色信息区域 -->
        <view class="info-section">
          <!-- 头像 -->
          <view class="avatar-container" @click="changeAvatar">
            <image class="avatar" :src="userInfo.avatar || 'https://minixhs.chugao520.com/makefriends/logo.png'" mode="aspectFill"></image>
          </view>
          <!-- 昵称和基本信息 -->
          <view class="basic-info">
            <!-- 统计数据 -->
            <view class="header-row">
              <view class="stats-container">
				  <navigator class="stat-item" >
				    <text class="stat-number"></text>
				    <text class="stat-label"></text>
				  </navigator>
				  <navigator class="stat-item" >
				    <text class="stat-number"></text>
				    <text class="stat-label"></text>
				  </navigator>
                <navigator class="stat-item" url="/pages/visited/index">
                  <text class="stat-number">{{ stats.visit_count || 0 }}</text>
                  <text class="stat-label">最近来访</text>
                </navigator>
                <navigator class="stat-item" url="/pages/fans/index">
                  <text class="stat-number">{{ stats.fans_count || 0 }}</text>
                  <text class="stat-label">喜欢我的</text>
                </navigator>
                <navigator class="stat-item" url="/pages/like/index">
                  <text class="stat-number">{{ stats.follow_count || 0 }}</text>
                  <text class="stat-label">我喜欢的</text>
                </navigator>
              </view>
            </view>
            
            <!-- 昵称和编辑资料按钮 -->
            <view class="name-row">
				<view class="user-tags">
					<text class="user-name">{{ userInfo.nickname || '未设置昵称' }}</text>
					<image class="gender-icon" :src="userInfo.gender === 1 ? 'https://minixhs.chugao520.com/makefriends/m.png' : 'https://minixhs.chugao520.com/makefriends/wm.png'" mode="aspectFit"></image>
				</view>
           
              <navigator class="edit-profile-btn" url="/pages/profile/edit">
                <image class="edit-profile-icon" src="https://minixhs.chugao520.com/makefriends/Frame 1890182609@2x.png" mode="aspectFit"></image>
              </navigator>
            </view>
            
            <!-- 详细信息 -->
            <view class="detail-row">
              <text class="detail-text">📍 {{ userInfo.city ? this.getCityName(userInfo.city) : '未设置城市' }}</text>
              <text class="detail-text">{{ userInfo.age || '未设置年龄' }}岁</text>
              <text class="detail-text">小红书号:{{ userInfo.xiaohongshu || '未设置' }}</text>
              <image class="vip-icon" src="/static/vip.png" mode="aspectFit"></image>
            </view>
          </view>

          <!-- 用户标签 -->
          <view class="user-tags">
            <text v-for="(tag, index) in userTags" :key="index" class="tag-item">{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 资料完善提醒条 -->
 <!--     <view class="profile-tip" v-if="stats.profile_percent < 100">
        <image class="floating-image" src="https://minixhs.chugao520.com/makefriends/位图(5).png" mode="aspectFit"></image>
        <text class="tip-text">资料完善度{{ stats.profile_percent }}%,完善资料获得曝光</text>
        <navigator class="tip-btn" url="/pages/profile/edit" > <text class="menu-arrow" decode>去完善 &gt;</text></navigator>
      </view> -->

      <!-- 脱单币区 -->
      <navigator url="/pages/coin/index">
        <view class="coin-section">
          <view class="coin-info">
            <text class="coin-amount">我的脱单币:</text>
            <text class=" coin-title">{{ userInfo.score || 0 }}</text>
          </view>
          <view class="button-row">
            <view class="get-more-btn">获取更多</view>
          </view>
        </view>
      </navigator>

      <!-- 功能图标区 -->
      <view class="feature-grid-section">
        <navigator class="feature-grid-item" url="/pages/want/my">
          <image class="feature-grid-icon" src="https://minixhs.chugao520.com/makefriends/Frame@2x(9).png" mode="aspectFit"></image>
          <text class="feature-grid-text">我想看的</text>
        </navigator>
        <navigator class="feature-grid-item" url="/pages/want/me">
          <image class="feature-grid-icon" src="https://minixhs.chugao520.com/makefriends/Frame@2x(10).png" mode="aspectFit"></image>
          <text class="feature-grid-text">想看我的</text>
        </navigator>
        <navigator class="feature-grid-item" url="/pages/soul/questions">
          <image class="feature-grid-icon" src="https://minixhs.chugao520.com/makefriends/Frame@2x(11).png" mode="aspectFit"></image>
          <text class="feature-grid-text">灵魂三问</text>
        </navigator>
        <!-- <navigator class="feature-grid-item" url="/pages/group/index">
          <image class="feature-grid-icon" src="https://minixhs.chugao520.com/makefriends/Frame@2x(12).png" mode="aspectFit"></image>
          <text class="feature-grid-text">同城单身群</text>
        </navigator> -->
      </view>

      <!-- 设置和认证 -->
      <view class="setting-section">
        <navigator class="setting-item" url="/pages/profile/core-info">
          <view class="setting-left">
            <image class="setting-icon" src="https://minixhs.chugao520.com/makefriends/Frame 1890182609@2x.png" mode="aspectFit"></image>
            <text class="setting-text">完善基本资料</text>
          </view>
          <image class="arrow-icon" src="https://minixhs.chugao520.com/makefriends/右.png" mode="aspectFit"></image>
        </navigator>
        <navigator class="setting-item" url="/pages/setting/index">
          <view class="setting-left">
            <image class="setting-icon" src="https://minixhs.chugao520.com/makefriends/Frame@2x (3).png" mode="aspectFit"></image>
            <text class="setting-text">设置</text>
          </view>
          <image class="arrow-icon" src="https://minixhs.chugao520.com/makefriends/右.png" mode="aspectFit"></image>
        </navigator>
        <navigator class="setting-item" url="/pages/auth/index">
          <view class="setting-left">
            <image class="setting-icon" src="https://minixhs.chugao520.com/makefriends/Frame@2x (1).png" mode="aspectFit"></image>
            <text class="setting-text">认证</text>
          </view>
          <image class="arrow-icon" src="https://minixhs.chugao520.com/makefriends/右.png" mode="aspectFit"></image>
        </navigator>
        <!-- <navigator class="setting-item" url="/pages/party/index">
          <view class="setting-left">
            <image class="setting-icon" src="https://minixhs.chugao520.com/makefriends/Frame@2x(14).png" mode="aspectFit"></image>
            <text class="setting-text">线下活动</text>
          </view>
          <image class="arrow-icon" src="https://minixhs.chugao520.com/makefriends/右.png" mode="aspectFit"></image>
        </navigator>
		<navigator class="setting-item" url="/pages/cases/index">
          <view class="setting-left">
            <image class="setting-icon" src="https://minixhs.chugao520.com/makefriends/Frame@2x(14).png" mode="aspectFit"></image>
            <text class="setting-text">成功案例</text>
          </view>
          <image class="arrow-icon" src="https://minixhs.chugao520.com/makefriends/右.png" mode="aspectFit"></image>
        </navigator> -->
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo, getUserStats, uploadAvatar, getAreaList } from '@/api/index.js'
import { profileCheckMixin } from '@/utils/profileCheck.js'

export default {
  mixins: [profileCheckMixin],
  data() {
    return {
      isLoggedIn: false,
      userInfo: {},
      stats: {
        visit_count: 0,
        fans_count: 0,
        follow_count: 0,
        profile_percent: 0
      },
      userTags: ['K歌小公举', '动漫迷', '购物达人'],
      cityMap: {} // 城市代码到城市名称的映射
    };
  },
  onShow() {
    this.checkLoginStatus();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = uni.getStorageSync('token');
      this.isLoggedIn = !!token;
      if (this.isLoggedIn) {
        this.loadUserInfo();
        this.loadStats();
        this.checkProfileCompletion();
      }
    },

    // 跳转登录页
    goLogin() {
      uni.navigateTo({ url: '/pages/login/index' });
    },

    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await getUserInfo();
        this.userInfo = res.data.userinfo || res.data;
        this.userTags = (res.data.userinfo && res.data.userinfo.my_tags) || []

        // 同步更新本地存储
        uni.setStorageSync('userinfo', this.userInfo);
        console.log('[Mine] 已更新本地用户信息');

        // 加载城市信息
        this.loadCityInfo();
      } catch (e) {
        console.error('加载用户信息失败', e);
        if (e._isAuthError) {
          // token 已过期，request.js 已清除存储，同步页面状态
          console.log('[Mine] 检测到登录过期，切换为未登录状态');
          this.isLoggedIn = false;
          this.userInfo = {};
        }
      }
    },
    
    // 加载城市信息
    async loadCityInfo() {
      try {
        // 检查本地缓存
        const cachedCityMap = uni.getStorageSync('cityMap');
        const cacheExpiry = uni.getStorageSync('cityMapExpiry');
        const now = Date.now();
        
        // 如果缓存存在且未过期（7天），直接使用缓存
        if (cachedCityMap && cacheExpiry && now < cacheExpiry) {
          this.cityMap = cachedCityMap;
          console.log('[Mine] 从缓存加载城市信息');
          return;
        }
        
        // 缓存不存在或已过期，重新请求
        console.log('[Mine] 缓存过期或不存在，重新加载城市信息');
        
        // 加载所有省份
        const provinceRes = await getAreaList(0);
        const provinces = provinceRes.data.list || [];
        
        // 构建新的城市映射
        const newCityMap = {};
        
        // 遍历省份，加载每个省份的城市
        for (const province of provinces) {
          const cityRes = await getAreaList(province.id);
          const cities = cityRes.data.list || [];
          
          // 构建城市映射
          for (const city of cities) {
            newCityMap[city.id] = city.name;
          }
        }
        
        // 更新城市映射
        this.cityMap = newCityMap;
        
        // 缓存城市信息，设置7天过期
        uni.setStorageSync('cityMap', newCityMap);
        uni.setStorageSync('cityMapExpiry', now + 7 * 24 * 60 * 60 * 1000);
        
        console.log('[Mine] 城市信息加载完成并缓存');
      } catch (e) {
        console.error('加载城市信息失败', e);
      }
    },
    
    // 获取城市名称
    getCityName(cityId) {
      return this.cityMap[cityId] || '未知城市';
    },

    // 加载统计数据
    async loadStats() {
      try {
        const res = await getUserStats();
        this.stats = res.data;
        this.profilePercent = res.data.profile_percent || 0;
      } catch (e) {
        console.error('加载统计数据失败', e);
      }
    },

    // 更换头像
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          try {
            uni.showLoading({ title: '上传中...' });
            const uploadRes = await uploadAvatar(tempFilePath);
            this.userInfo.avatar = uploadRes.data.url;
            uni.showToast({
              title: '头像更新成功',
              icon: 'success'
            });
          } catch (e) {
            uni.showToast({
              title: e.msg || '上传失败',
              icon: 'none'
            });
          } finally {
            uni.hideLoading();
          }
        }
      });
    }
  }
};
</script>

<style scoped>
/* 整体容器 */
.container {
  background-color: #F8F8F8;
  min-height: 100vh;
}

/* 未登录状态 */
.not-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60rpx;
}

.login-prompt {
  text-align: center;
  width: 100%;
}

.prompt-icon {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 40rpx;
}

.prompt-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.prompt-desc {
  font-size: 28rpx;
  color: #999999;
  display: block;
  margin-bottom: 60rpx;
}

.login-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #FF6B81 0%, #FF4D4F 100%);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 1. 用户信息区 */
.user-section {
  position: relative;
  /* margin-bottom: 20rpx; */
  border-radius: 0;
  overflow: hidden;
}

/* 背景图片 */
.background-image {
  width: 100%;
  height: 400rpx;
  object-fit: cover;
}

/* 左上角：返回按钮 */
.back-btn {
  position: absolute;
  top: 30rpx;
  left: 30rpx;
  width: 50rpx;
  height: 50rpx;
  z-index: 20;
}

/* 返回图标 */
.back-icon {
  width: 50rpx;
  height: 50rpx;
}

/* 右上角：设置和消息图标 */
.top-right-icons {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  display: flex;
  gap: 20rpx;
  z-index: 20;
}

/* 顶部图标 */
.top-icon {
  width: 50rpx;
  height: 50rpx;
}

/* 统计数据行 */
.header-row {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

/* 左侧：圆形头像 */
.avatar-container {
  position: absolute;
  top: -50rpx;
  left: 30rpx;
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #F5F5F5;
}

/* 右侧：统计数据 */
.stats-container {
  display: flex;
  flex: 1;
  justify-content: end;
}

/* 统计项 */
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 60rpx;
}

/* 统计数字 */
.stat-number {
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 2rpx;
  display: block;
  color: #333333;
}

/* 统计标签 */
.stat-label {
  font-size: 24rpx;
  font-weight: 400;
  display: block;
  color: #919191;
}

/* 白色信息区域 */
.info-section {
  position: relative;
  margin-top: -30rpx; 
  padding: 30rpx;
  background-color: #FFFFFF;
  border-radius: 30rpx 30rpx 0 0;
  /* box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1); */
  z-index: 5;
}

/* 基本信息 */
.basic-info {
  margin-bottom: 20rpx;
}

/* 名字行 */
.name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

/* 用户名 */
.user-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 5rpx;
}

/* 性别图标 */
.gender-icon {
  width: 40rpx;
  height: 40rpx;
  /* margin-right: 10rpx; */
}

/* 验证图标 */
.verify-icon {
  width: 30rpx;
  height: 30rpx;
}

/* 详情行 */
.detail-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  align-items: center;
}

/* 详情文本 */
.detail-text {
  font-size: 24rpx;
  color: #666666;
}

/* VIP图标 */
.vip-icon {
  width: 30rpx;
  height: 30rpx;
}

/* 用户标签 */
.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

/* 标签项 */
.tag-item {
  font-size: 22rpx;
  color: #666666;
  padding: 8rpx 16rpx;
  background-color: #F5F5F5;
  border-radius: 15rpx;
}

/* 右侧：编辑资料图标 */
.edit-profile-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 编辑资料图标 */
.edit-profile-icon {
  width: 50rpx;
  height: 50rpx;
}

/* 2. 资料完善提醒条 */
.profile-tip {
  background-color: #F9D4D7;
  padding: 20rpx 20rpx 20rpx 40rpx;
  margin: 30rpx 30rpx 20rpx;
  display: flex;
  align-items: center;
  border-radius: 15rpx;
  position: relative;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.floating-image {
  width: 110rpx;
  height: 110rpx;
  position: absolute;
  left: -20rpx;
  top: 40%;
  transform: translateY(-50%);
  z-index: 2;
}

.tip-text {
	padding-left: 60rpx;
  font-size: 28rpx;
  color: #E5606E;
  font-weight: 400;
  flex: 1;
}

.tip-btn {
  font-size: 28rpx;
  color: #FF4D4F;
  font-weight: 500;
  padding: 0;
  background-color: transparent;
  border: none;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5rpx);
  }
}

/* 4. 脱单币区 */
.coin-section {
  background-image: url('https://minixhs.chugao520.com/makefriends/位图7.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin: 0 30rpx 20rpx;
  padding: 30rpx 30rpx;
  border-radius: 15rpx; 
  display: flex;
  flex-direction: column;
  min-height: 150rpx;
}

/* 硬币信息 */
.coin-info {
  width: 100%;
  margin: 30rpx 0 10rpx 0;
}

/* 按钮行 */
.button-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.coin-icon-container {
  width: 110rpx;
  height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}
 
 

.coin-title {
  font-size: 32rpx;
  font-weight: 500;
  font-weight: bold;
  margin-left: 40rpx;
}

.coin-amount {
  font-size: 26rpx;
}

.get-more-btn {
  background-color: #9370DB;
  color: #FFFFFF;
  border-radius: 40rpx;
  padding: 10rpx 25rpx;
  font-size: 24rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-shadow: 0 2rpx 8rpx rgba(147, 112, 219, 0.3);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: auto;
  cursor: pointer;
  user-select: none;
}

.more-icon {
  width: 30rpx;
  height: 30rpx;
}

/* 5. 功能图标区 */
.feature-grid-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;
  background-color: #ffffff;
  margin: 0 30rpx 20rpx;
  border-radius: 15rpx;
}

.feature-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  border-radius: 20rpx;
  text-align: center;
}

.feature-grid-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 10rpx;
}

.feature-grid-text {
  font-size: 24rpx;
  color: #333333;
  font-weight: 400;
}

/* 6. 设置和认证区域 */
.setting-section {
  margin: 0 5rpx 30rpx 20rpx;
  background-color: #FFFFFF;
  border-radius: 15rpx;
  overflow: hidden;
  
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-bottom: 1px solid #F0F0F0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-left {
  display: flex;
  align-items: center;
}

.setting-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.setting-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 400;
}

.arrow-icon {
  width: 30rpx;
  height: 30rpx;
  color: #999999;
}
</style>
