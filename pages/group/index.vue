<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <custom-nav-bar
      title="同城单身群"
      backgroundImage="https://minixhs.chugao520.com/makefriends/bg3.png"
    />

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

    <!-- 顶部介绍 -->
    <view class="intro-bar">
      <text>专为20-35岁互联网人建立的城市单身社群(程序员为主)，脱单人数已超过1000人，限时免费加入</text>
    </view>

    <!-- 群聊列表 -->
    <scroll-view scroll-y class="group-scroll" v-if="list.length > 0">
      <view class="group-item" v-for="(item, index) in list" :key="index" @click="onGroupTap(item)">
        <view class="group-icon">
          <image :src="item.qrcode || 'https://minixhs.chugao520.com/makefriends/logo.png'" mode="aspectFill" class="group-img"></image>
        </view>
        <view class="group-content">
          
            <text class="group-name">{{ item.name }}</text>
            <view class="group-row">
				<text class="group-msg">{{ item.member_count || 0 }}人已加入</text>
				<view class="city-container">
					<image class="city-icon" src="https://minixhs.chugao520.com/makefriends/Frame@2x(13).png" mode="aspectFit"></image>
					<text class="group-time">{{ item.city }}</text>
				</view>
          </view>
          
		</view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty" v-else-if="!loading">
      <text class="empty-text">暂无相关群聊信息</text>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="bottom-btn single-btn" @click="goSingle">进入单身广场</view>
      <view class="bottom-btn group-btn" @click="joinGroupFree">免费加入单身群</view>
    </view>

    <!-- 群二维码弹窗 -->
    <view class="qrcode-overlay" v-if="showQrcode" @click="showQrcode = false">
      <view class="qrcode-card" @click.stop>
        <text class="qrcode-title">长按图片扫一扫快速加入</text>
        <image
          class="qrcode-img"
          :src="currentQrcode"
          mode="aspectFit"
          show-menu-by-longpress
        ></image>
        <view class="qrcode-btn" @click="goSingle">逛逛单身广场</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getGroups } from '@/api/index.js'
import CustomNavBar from '../../components/custom-nav-bar.vue'

export default {
  components: {
    CustomNavBar
  },
  data() {
    return {
      list: [],
      loading: false,
      showQrcode: false,
      currentQrcode: ''
    }
  },
  onLoad() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.loadData().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getGroups()
        this.list = res.data.list || []
      } catch (e) {
        console.error('加载失败', e)
      } finally {
        this.loading = false
      }
    },

    onGroupTap(item) {
      if (item.qrcode) {
        this.currentQrcode = item.qrcode
        this.showQrcode = true
      } else {
        uni.showToast({ title: '暂无群二维码', icon: 'none' })
      }
    },

    joinGroupFree() {
      if (this.list.length > 0 && this.list[0].qrcode) {
        this.currentQrcode = this.list[0].qrcode
        this.showQrcode = true
      } else {
        uni.showToast({ title: '暂无可加入的群', icon: 'none' })
      }
    },

    goSingle() {
      this.showQrcode = false
      uni.switchTab({
        url: '/pages/single/index'
      })
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
.container {
  /* background-image: url('https://minixhs.chugao520.com/makefriends/bg2.png'); */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
  position: relative;
  z-index: 0;
}

/* 导航栏占位 */
.nav-bar-placeholder {
  height: 165rpx;
}



/* 顶部介绍 */
.intro-bar {
  margin: 30rpx 50rpx 0;
  background: #FFF7F2;
  border-radius: 20rpx;
  padding: 18rpx 20rpx;
  font-size: 28rpx;
  color: #FF7915;
  line-height: 42rpx;
}

/* 群聊列表 */
.group-scroll {
  flex: 1;
  margin-top: 30rpx;
  padding: 0 50rpx;
  box-sizing: border-box;
  width: 100%;
}

.group-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: rgba(216, 216, 216, 0.2);
  border-radius: 10rpx;
  padding: 20rpx 30rpx 20rpx 14rpx;
  margin-bottom: 30rpx;
}

.group-icon {
  width: 92rpx;
  height: 92rpx;
  background-color: #DEDFDF;
  border-radius: 4rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 28rpx;
  flex-shrink: 0;
}

.group-img {
  width: 80rpx;
  height: 80rpx;
}

.group-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.group-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 24rpx;
}

.group-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #131313;
  line-height: 24rpx;
}

.group-time {
  font-size: 24rpx;
  color: #999999;
  line-height: 24rpx;
}

.city-container {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.city-icon {
  width: 24rpx;
  height: 24rpx;
}

.group-msg {
  font-size: 26rpx;
  color: #999999;
  line-height: 26rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 空状态 */
.empty {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 180rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #CCCCCC;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  width: 100%;
  bottom: 0;
  padding: 10rpx 20rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: #FFFFFF;
  border-top: 2rpx solid rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.bottom-btn {
  width: 310rpx;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  border-radius: 46rpx;
  font-size: 30rpx;
}

.single-btn {
  color: #6853F0;
  background: #FFFFFF;
  border: 1rpx solid #6853F0;
}

.group-btn {
  color: #FFFFFF;
  background: linear-gradient(270deg, #8068F7 0%, #624EEE 100%);
}

/* 二维码弹窗 */
.qrcode-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
}

.qrcode-card {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  padding: 60rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.qrcode-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #131313;
  margin-bottom: 60rpx;
}

.qrcode-img {
  width: 320rpx;
  height: 320rpx;
  margin-bottom: 40rpx;
}

.qrcode-btn {
  width: 310rpx;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  color: #FFFFFF;
  font-weight: 500;
  border-radius: 45rpx;
  background: linear-gradient(135deg, #FF4D4F, #FF7875);
}
</style>
