<template>
  <!-- #ifndef MP-ALIPAY -->
  <view class="custom-nav-bar" :class="{ 'is-fixed': fixed }"
    :style="{ height: height + 'px', backgroundColor: backgroundColor, zIndex: zIndex, color: fontColor }">
    <image :src="backgroundImage" class="nav-bg" mode="scaleToFill" :style="{ height: height + 'px' }"></image>
    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <!-- 导航栏 -->
    <view class="nav-wrapper" :style="{ height: navBarHeight + 'px' }">
      <!-- 返回按钮 -->
      <view class="nav-back" v-if="isShowLeft" :style="{ width: menuButtonRect.width + 'px' }" @click="handleBack">
        <slot name="left">
          <!-- 支付宝自定义还是有返回按钮 -->
          <template v-if="isShowBack">
            <image v-if="isFirstPage" :src="homeIcon || 'https://minixhs.chugao520.com/makefriends/images/home.png'" class="img">
            </image>
            <image v-else :src="backIcon || 'https://minixhs.chugao520.com/makefriends/back.png'" class="img"></image>
          </template>
        </slot>
      </view>
      <view class="nav-title">
        <slot>
          {{ title }}
        </slot>
      </view>
      <!-- 胶囊位置 -->
      <view class="nav-menu" v-if="isShowRight" :style="{ width: menuButtonRect.width + 'px' }">
        <slot name="right"></slot>
      </view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script>
export default {
  name: "CustomNavBar",
  props: {
    title: {
      type: String,
      default: ''
    },
    homeUrl: {
      type: String,
      default: '/pages/index/index'
    },
    homeIcon: {
      type: String,
      default: ''
    },
    backUrl: {
      type: String,
      default: ''
    },
    backIcon: {
      type: String,
      default: ''
    },
    fixed: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: Number,
      default: 100
    },
    backgroundColor: {
      type: String,
      default: 'transparent'
    },
    backgroundImage: {
      type: String,
      default: ''
    },
    fontColor: {
      type: String,
      default: '#333333'
    },
    isShowBack: {
      type: Boolean,
      default: true
    },
    isShowLeft: {
      type: Boolean,
      default: true
    },
    isShowRight: {
      type: Boolean,
      default: true
    },
    defaultNavBarheight: {
      type: Number,
      default: 44
    },
    defaultMenuWidth: {
      type: Number,
      default: 80
    }
  },
  data() {
    return {
      statusBarHeight: 0,
      navBarHeight: 0,
      height: 0,
      menuButtonRect: {
        width: 80,
        top: 20,
        height: 32
      },
      isFirstPage: false
    }
  },
  mounted() {
    this.getRectInfo()
    this.checkIsFirstPage()
  },
  methods: {
    getRectInfo() {
      // 获取状态栏高度
      const sysInfo = uni.getSystemInfoSync()
      this.statusBarHeight = sysInfo.statusBarHeight || 0
      // 默认高度
      this.navBarHeight = this.defaultNavBarheight
      this.height = this.statusBarHeight + this.defaultNavBarheight
      // #ifndef APP || H5
      // 判断获取微信小程序胶囊API是否可用 H5出现为true情况无法使用
      if (uni.canIUse('getMenuButtonBoundingClientRect') && typeof uni.getMenuButtonBoundingClientRect === 'function') {
        // 获取微信小程序胶囊布局位置信息
        const menuButtonRect = uni.getMenuButtonBoundingClientRect()
        const isValidRect = menuButtonRect && menuButtonRect.width && menuButtonRect.height && menuButtonRect.top >= this.statusBarHeight

        if (isValidRect) {
          this.menuButtonRect = menuButtonRect
          // (胶囊上部高度-状态栏高度)*2 + 胶囊高度 = 导航栏高度（不包含状态栏）
          // 以此保证胶囊位于中间位置，多机型适配
          this.navBarHeight = (menuButtonRect.top - this.statusBarHeight) * 2 + menuButtonRect.height
          // 状态栏高度 + 导航栏高度 = 自定义导航栏高度总和
          this.height = this.statusBarHeight + this.navBarHeight
        }
      }
      // #endif
    },
    checkIsFirstPage() {
      const pages = getCurrentPages()
      this.isFirstPage = pages.length === 1
    },
    handleBack() {
      if (this.isFirstPage) {
        uni.switchTab({ url: this.homeUrl })
      } else if (this.backUrl) {
        uni.navigateTo({ url: this.backUrl })
      } else {
        uni.navigateBack()
      }
    }
  }
}
</script>

<style scoped>
.custom-nav-bar {
  position: relative;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  flex-shrink: 0;
}

.custom-nav-bar.is-fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 999;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.nav-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: -1;
}

.nav-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.status-bar {
  width: 100%;
  flex-shrink: 0;
}

.nav-back {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-menu {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.img {
  width: 50rpx;
  height: 50rpx;
}
</style>
