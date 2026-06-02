<template>
  <view class="container">
    <!-- 加载状态 -->
    <view class="loading-mask" v-if="loading">
      <view class="loading-content">
        <text class="loading-text">页面加载中...</text>
      </view>
    </view>

    <!-- web-view 组件 (小红书/微信等小程序通用) -->
    <web-view
      :src="h5Url"
      @message="handleMessage"
      @load="handleLoad"
      @error="handleError"
    ></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      h5Url: '',
      verifyToken: '',
      loading: true
    }
  },
  onLoad(options) {
    // 从URL参数获取百度H5认证地址和verify_token
    this.h5Url = decodeURIComponent(options.url || '')
    this.verifyToken = options.verify_token || ''

    if (!this.h5Url) {
      uni.showToast({ title: '认证地址错误', icon: 'none' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  methods: {
    // 处理webview加载成功
    handleLoad(e) {
      console.log('webview loaded:', e.detail)
      this.loading = false
    },

    // 处理webview加载失败
    handleError(e) {
      console.error('webview error:', e.detail)
      this.loading = false
      uni.showModal({
        title: '加载失败',
        content: '认证页面加载失败，请检查网络后重试',
        showCancel: false,
        success: () => {
          uni.navigateBack()
        }
      })
    },

    // 处理webview返回的消息
    // 小红书JSSDK通过 xhs.miniProgram.postMessage({ data: {...} }) 发送
    // 会在小程序后退、组件销毁、分享时触发
    handleMessage(e) {
      console.log('webview message:', e)

      // e.detail.data 是一个数组，包含多次postMessage的参数
      const messages = e.detail?.data || []

      for (const msg of messages) {
        // 处理认证结果消息
        if (msg.type === 'verify_result') {
          if (msg.status === 'success') {
            uni.showToast({ title: '认证成功', icon: 'success' })
            // 返回并刷新认证状态
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          } else if (msg.status === 'failed') {
            uni.showToast({ title: msg.message || '认证失败', icon: 'none' })
          }
        }

        // 处理页面跳转请求
        if (msg.type === 'navigate') {
          if (msg.action === 'back') {
            uni.navigateBack()
          } else if (msg.url) {
            uni.navigateTo({ url: msg.url })
          }
        }
      }
    }
  },
  onUnload() {
    // 用户从webview返回，自动返回到idcard页面
    // idcard页面会显示"查询认证结果"按钮
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-content {
  text-align: center;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
