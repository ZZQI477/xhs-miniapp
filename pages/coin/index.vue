<template>
  <view class="container">
    <!-- 脱单币余额 -->
    <view class="coin-balance" @click="showRecharge">
      <view class="coin-icon-container">
        <image class="coin-icon" src="https://minixhs.chugao520.com/makefriends/位图.png" mode="aspectFit"></image>
      </view>
      <view class="balance-info">
        <text class="balance-label">我的脱单币</text>
        <text class="balance-amount">{{ coinBalance }}</text>
      </view>
      <view class="get-more-btn">获取更多 <image class="more-icon" src="https://minixhs.chugao520.com/makefriends/round_right_fill.png" mode="aspectFit"></image></view>
    </view>

    <!-- 底部火箭图标 -->
    <view class="rocket-icon">
      <text class="rocket">🚀</text>
    </view>

    <!-- 充值弹窗 -->
    <view class="recharge-modal" v-if="isRechargeVisible">
      <view class="modal-backdrop" @click="hideRecharge"></view>
      <view class="recharge-content">
        <!-- 弹窗标题 -->
        <view class="recharge-title">脱单币充值</view>

        <!-- 充值选项 -->
        <view class="recharge-options">
          <view class="option-item" :class="{ active: selectedPackage && selectedPackage.id === pkg.id }"
                v-for="pkg in packages" :key="pkg.id" @click="selectPackage(pkg)">
            <view class="recommended-tag" v-if="pkg.is_hot">推荐</view>
            <view class="option-content">
              <text class="option-coin">{{ pkg.coin }}脱单币</text>
              <text class="option-price">{{ pkg.price }}元</text>
            </view>
          </view>
        </view>

        <!-- 确定按钮 -->
        <button class="confirm-btn" :disabled="!isAgreed || !selectedPackage" @click="confirmRecharge">确定</button>

        <!-- 协议同意 -->
        <view class="agreement">
          <checkbox-group @change="onAgreementChange">
            <checkbox :checked="isAgreed" color="#FF4D4F" class="agreement-checkbox" />
          </checkbox-group>
          <text class="agreement-text" @click="toggleAgreement">同意</text>
          <text class="agreement-link">《在线充值服务协议》</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo, getPackages, createOrder, wxPay, xhsPay, paySuccess } from '@/api/index.js'

export default {
  data() {
    return {
      coinBalance: 0,
      isRechargeVisible: false,
      selectedPackage: null,
      isAgreed: false,
      packages: []
    };
  },
  onLoad() {
    this.loadCoinBalance();
    this.loadPackages();
  },
  onShow() {
    this.loadCoinBalance();
  },
  methods: {
    // 加载脱单币余额
    async loadCoinBalance() {
      try {
        const res = await getUserInfo();
        this.coinBalance = res.data.userinfo?.score || 0;
      } catch (e) {
        console.error('加载余额失败', e);
      }
    },

    // 加载充值套餐
    async loadPackages() {
      try {
        const res = await getPackages();
        this.packages = res.data.list || [];
        // 默认选择推荐套餐
        const hotPkg = this.packages.find(p => p.is_hot);
        if (hotPkg) {
          this.selectedPackage = hotPkg;
        } else if (this.packages.length > 0) {
          this.selectedPackage = this.packages[0];
        }
      } catch (e) {
        console.error('加载套餐失败', e);
      }
    },

    showRecharge() {
      this.isRechargeVisible = true;
    },

    hideRecharge() {
      this.isRechargeVisible = false;
    },

    selectPackage(pkg) {
      this.selectedPackage = pkg;
    },

    // 切换协议同意状态
    toggleAgreement() {
      this.isAgreed = !this.isAgreed;
    },

    // 协议勾选变化
    onAgreementChange(e) {
      this.isAgreed = e.detail.value.length > 0;
    },

    // 确认充值
    async confirmRecharge() {
      if (!this.isAgreed) {
        uni.showToast({
          title: '请同意充值服务协议',
          icon: 'none'
        });
        return;
      }

      if (!this.selectedPackage) {
        uni.showToast({
          title: '请选择充值套餐',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({ title: '正在创建订单...' });

        // 创建订单
        const orderRes = await createOrder({ package_id: this.selectedPackage.id });
        const orderNo = orderRes.data.order_no;

        // 获取微信支付参数
        const payRes = await wxPay({ order_no: orderNo });

        uni.hideLoading();

        // 小红书小程序支付
        // #ifdef MP-XHS
        // xhs.requestOrderPayment({
        xhs.requestGuaranteeOrderPayment({
          orderInfo: payRes.data.orderInfo || payRes.data,
          success: (res) => {
            uni.showToast({ title: '支付成功', icon: 'success' });
            this.hideRecharge();
            this.loadCoinBalance();
          },
          fail: (err) => {
            console.error('支付失败：', err);
            uni.showToast({ title: '支付已取消', icon: 'none' });
          }
        });
        // #endif

        // 微信小程序支付
        // #ifdef MP-WEIXIN
        uni.requestPayment({
          provider: 'wxpay',
          timeStamp: payRes.data.pay_params.timeStamp,
          nonceStr: payRes.data.pay_params.nonceStr,
          package: payRes.data.pay_params.package,
          signType: payRes.data.pay_params.signType,
          paySign: payRes.data.pay_params.paySign,
          success: (res) => {
            uni.showToast({ title: '支付成功', icon: 'success' });
            this.hideRecharge();
            this.loadCoinBalance();
          },
          fail: (err) => {
            console.error('支付失败', err);
            uni.showToast({ title: '支付已取消', icon: 'none' });
          }
        });
        // #endif
      } catch (e) {
        uni.hideLoading();
        uni.showToast({
          title: e.msg || '充值失败',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #F8F8F8;
  min-height: 100vh;
  padding-bottom: 40rpx;
  position: relative;
}

.coin-balance {
  background-image: url('https://minixhs.chugao520.com/makefriends/位图5.png');
  background-size: cover;
  background-position: center;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.coin-icon-container {
  width: 110rpx;
  height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.coin-icon {
  width: 100%;
  height: 100%;
}

.balance-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.balance-label {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.balance-amount {
  font-size: 30rpx;
  color: #FFFFFF;
}

.get-more-btn {
  background-color: #FFFFFF;
  color: #FA7B88;
  border: none;
  border-radius: 20rpx;
  padding: 0rpx 20rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.more-icon {
  width: 30rpx;
  height: 30rpx;
}

.rocket-icon {
  position: absolute;
  bottom: 200rpx;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.rocket {
  font-size: 120rpx;
  opacity: 0.5;
}

.recharge-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.recharge-content {
  width: 100%;
  background-color: #FFFFFF;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 30rpx;
  position: relative;
  z-index: 1000;
}

.recharge-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 30rpx;
}

.recharge-options {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
  flex-wrap: wrap;
}

.option-item {
  flex: 1;
  min-width: 180rpx;
  padding: 30rpx 20rpx;
  border: 1px solid #E8E8E8;
  border-radius: 15rpx;
  text-align: center;
  position: relative;
}

.option-item.active {
  border-color: #FF4D4F;
  background-color: #FFF2F0;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.option-coin {
  font-size: 28rpx;
  color: #333333;
}

.option-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF4D4F;
}

.recommended-tag {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #FF4D4F;
  color: #FFFFFF;
  font-size: 20rpx;
  padding: 5rpx 15rpx;
  border-top-right-radius: 15rpx;
  border-bottom-left-radius: 15rpx;
}

.confirm-btn {
  width: 100%;
  background-color: #FF4D4F;
  color: #FFFFFF;
  border: none;
  border-radius: 30rpx;
  padding: 20rpx 0;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.confirm-btn:disabled {
  background-color: #E8E8E8;
  color: #999999;
}

.agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  font-size: 24rpx;
  color: #666666;
}

.agreement-checkbox {
  transform: scale(0.7);
  margin-right: -10rpx;
}

.agreement-text {
  margin-left: 5rpx;
}

.agreement-link {
  color: #FF4D4F;
}
</style>
