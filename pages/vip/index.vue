<template>
  <view class="container">
    <!-- VIP特权介绍 -->
    <view class="vip-header">
      <view class="vip-title">开通VIP会员</view>
      <view class="vip-subtitle">解锁全部特权，遇见更多缘分</view>
    </view>

    <!-- 特权列表 -->
    <view class="privilege-list">
      <view class="privilege-item">
        <view class="privilege-icon">👥</view>
        <view class="privilege-content">
          <text class="privilege-title">查看全部嘉宾</text>
          <text class="privilege-desc">不限数量，浏览所有单身用户</text>
        </view>
      </view>
      <view class="privilege-item">
        <view class="privilege-icon">💬</view>
        <view class="privilege-content">
          <text class="privilege-title">无限发送申请</text>
          <text class="privilege-desc">不限次数，主动出击</text>
        </view>
      </view>
      <view class="privilege-item">
        <view class="privilege-icon">👀</view>
        <view class="privilege-content">
          <text class="privilege-title">查看访客记录</text>
          <text class="privilege-desc">知道谁来看过你</text>
        </view>
      </view>
      <view class="privilege-item">
        <view class="privilege-icon">⭐</view>
        <view class="privilege-content">
          <text class="privilege-title">VIP专属标识</text>
          <text class="privilege-desc">提升曝光率，更受欢迎</text>
        </view>
      </view>
      <view class="privilege-item">
        <view class="privilege-icon">🎁</view>
        <view class="privilege-content">
          <text class="privilege-title">每月赠送脱单币</text>
          <text class="privilege-desc">免费获得100脱单币</text>
        </view>
      </view>
    </view>

    <!-- VIP套餐选择 -->
    <view class="package-list">
      <view
        class="package-item"
        :class="{ active: selectedPackage === index, 'recommend-type': pkg.is_hot }"
        v-for="(pkg, index) in packages"
        :key="index"
        @click="selectPackage(index)"
      >
        <view class="package-duration">{{ pkg.name }}</view>
        <view class="package-price">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ pkg.price }}</text>
        </view>
        <view class="package-original" v-if="pkg.original_price">原价¥{{ pkg.original_price }}</view>
        <view class="package-daily">{{ pkg.daily_price }}/天</view>
      </view>
    </view>

    <!-- 购买按钮 -->
    <view class="buy-section">
      <button class="buy-btn" @click="handleBuy">立即开通VIP</button>
      <view class="agreement">
        <text>开通即代表同意</text>
        <text class="link" @click="openAgreement">《VIP会员服务协议》</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getPackages, createOrder, wxPay } from '@/api/index.js'

export default {
  data() {
    return {
      packages: [
        {
          name: '1个月',
          price: 68,
          original_price: 98,
          daily_price: '2.3',
          duration: 1,
          is_hot: false
        },
        {
          name: '3个月',
          price: 168,
          original_price: 294,
          daily_price: '1.9',
          duration: 3,
          is_hot: true
        },
        {
          name: '6个月',
          price: 298,
          original_price: 588,
          daily_price: '1.6',
          duration: 6,
          is_hot: false
        },
        {
          name: '12个月',
          price: 498,
          original_price: 1176,
          daily_price: '1.4',
          duration: 12,
          is_hot: false
        }
      ],
      selectedPackage: 1 // 默认选中第二个（推荐）
    }
  },
  onLoad() {
    // 可以从后端加载VIP套餐
    // this.loadPackages()
  },
  methods: {
    // 加载VIP套餐
    async loadPackages() {
      try {
        const res = await getPackages()
        if (res.data.list && res.data.list.length > 0) {
          this.packages = res.data.list
        }
      } catch (e) {
        console.error('加载套餐失败', e)
      }
    },

    // 选择套餐
    selectPackage(index) {
      this.selectedPackage = index
    },

    // 购买VIP
    async handleBuy() {
      const pkg = this.packages[this.selectedPackage]

      uni.showLoading({ title: '正在创建订单...' })

      try {
        // 创建订单
        const orderRes = await createOrder({
          type: 'vip',
          package_id: this.selectedPackage,
          duration: pkg.duration,
          amount: pkg.price
        })

        uni.hideLoading()

        // 获取支付参数
        const payRes = await wxPay({
          order_id: orderRes.data.order_id
        })

        // 小红书小程序支付
        // #ifdef MP-XHS
        xhs.requestOrderPayment({
          orderInfo: payRes.data.orderInfo || payRes.data,
          success: () => {
            uni.showToast({ title: '开通成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          },
          fail: (err) => {
            console.error('支付失败', err)
            uni.showToast({ title: '支付取消', icon: 'none' })
          }
        })
        // #endif

        // 微信小程序支付
        // #ifdef MP-WEIXIN
        uni.requestPayment({
          provider: 'wxpay',
          timeStamp: payRes.data.timeStamp,
          nonceStr: payRes.data.nonceStr,
          package: payRes.data.package,
          signType: payRes.data.signType,
          paySign: payRes.data.paySign,
          success: () => {
            uni.showToast({ title: '开通成功', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          },
          fail: (err) => {
            console.error('支付失败', err)
            uni.showToast({ title: '支付取消', icon: 'none' })
          }
        })
        // #endif
      } catch (e) {
        uni.hideLoading()
        uni.showToast({
          title: e.msg || '创建订单失败',
          icon: 'none'
        })
      }
    },

    // 打开协议
    openAgreement() {
      uni.navigateTo({
        url: '/pages/agreement/vip'
      })
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx 120rpx;
}

/* VIP头部 */
.vip-header {
  text-align: center;
  padding: 60rpx 0 40rpx;
  color: #FFFFFF;
}

.vip-title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.vip-subtitle {
  font-size: 28rpx;
  opacity: 0.9;
}

/* 特权列表 */
.privilege-list {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 40rpx;
}

.privilege-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.privilege-item:last-child {
  margin-bottom: 0;
}

.privilege-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
  width: 60rpx;
  text-align: center;
}

.privilege-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.privilege-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.privilege-desc {
  font-size: 24rpx;
  color: #999999;
}

/* 套餐列表 */
.package-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.package-item {
  position: relative;
  width: calc(50% - 10rpx);
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  border: 3rpx solid transparent;
  transition: all 0.3s;
}

.package-item.active {
  background-color: #FFFFFF;
  border-color: #FA731D;
  box-shadow: 0 8rpx 24rpx rgba(250, 115, 29, 0.3);
  transform: scale(1.05);
}

/* 推荐标签 - 参考项目样式 */
.recommend-type {
  position: relative;
}

.recommend-type::before {
  content: '推荐';
  position: absolute;
  top: -18rpx;
  left: -2rpx;
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  border-radius: 14rpx 2rpx 14rpx 2rpx;
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 500;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  width: 76rpx;
}

.package-duration {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 15rpx;
}

.package-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 10rpx;
}

.price-symbol {
  font-size: 28rpx;
  color: #FF4D4F;
  font-weight: bold;
}

.price-value {
  font-size: 48rpx;
  color: #FF4D4F;
  font-weight: bold;
}

.package-original {
  font-size: 24rpx;
  color: #999999;
  text-decoration: line-through;
  margin-bottom: 8rpx;
}

.package-daily {
  font-size: 24rpx;
  color: #666666;
}

/* 购买按钮 */
.buy-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx 40rpx;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
}

.buy-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333333;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 215, 0, 0.4);
}

.agreement {
  text-align: center;
  font-size: 24rpx;
  color: #999999;
  margin-top: 20rpx;
}

.link {
  color: #667eea;
}
</style>
