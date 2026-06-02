<template>
  <view class="vip-popup-mask" v-if="visible" @click="handleClose">
    <view class="vip-popup-container" @click.stop>
      <!-- 关闭按钮 -->
      <view class="close-btn" @click="handleClose">
        <image src="/static/images/close-white.png" class="close-icon" />
      </view>

      <!-- 标题 -->
      <view class="popup-title">会员功能介绍</view>

      <!-- 功能介绍面板 -->
      <view class="feature-panel">
        <view class="feature-item">
          <image src="/static/images/vip.png" class="feature-icon" />
          <view class="feature-content">
            <text class="feature-title">查看喜欢我的人</text>
            <view class="feature-desc">
              <text>查看喜欢我的人，</text>
              <text class="highlight">直接免费解锁微信</text>
            </view>
          </view>
        </view>

        <view class="feature-item">
          <image src="/static/images/filter.png" class="feature-icon" />
          <view class="feature-content">
            <text class="feature-title">高级筛选功能</text>
            <text class="feature-desc">根据收入、学历、购房等条件筛选嘉宾</text>
          </view>
        </view>

        <view class="feature-item">
          <image src="/static/images/lock-red.png" class="feature-icon" />
          <view class="feature-content">
            <text class="feature-title">查看所有嘉宾</text>
            <text class="feature-desc">查看全站嘉宾，不包含微信解锁</text>
          </view>
        </view>
      </view>

      <!-- VIP套餐选择 -->
      <view class="package-list">
        <view
          v-for="(pkg, index) in packages"
          :key="index"
          :class="['package-item', { active: selectedIndex === index, 'recommend-type': pkg.isRecommended }]"
          @click="selectPackage(index)"
        >
          <view class="package-title">{{ pkg.title }}</view>
          <view class="package-price">
            <text class="price-value">{{ pkg.value }}</text>
            元/月
          </view>
          <view class="package-subtitle" v-if="index !== 0">{{ pkg.subTitle }}</view>
        </view>
      </view>

      <!-- 立即开通按钮 -->
      <button class="pay-btn" @click="handlePay">立即开通</button>

      <!-- 协议勾选 -->
      <view class="protocol">
        <image
          :src="agreeProtocol ? '/static/images/checked.png' : '/static/images/unchecked.png'"
          class="checkbox-icon"
          @click="toggleProtocol"
        />
        <text>同意《</text>
        <text class="protocol-link" @click="openProtocol">在线充值服务协议</text>
        <text>》</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getVipPackages } from '@/api/index.js'

export default {
  name: 'VipPopup',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedIndex: -1, // 默认选中推荐套餐
      agreeProtocol: false,
      packages: []
    };
  },
  watch: {
    visible(newVal) {
      if (newVal && this.packages.length === 0) {
        this.loadPackages();
      }
    }
  },
  methods: {
    // 加载VIP套餐
    async loadPackages() {
      try {
        const res = await getVipPackages();
        if (res.code === 1 && res.data.list) {
          this.packages = res.data.list.map(item => ({
            title: item.name,
            value: parseFloat(item.price),
            subTitle: item.original_price > item.price ? `原价${item.original_price}元` : '',
            type: item.type,
            monthCount: item.duration,
            isRecommended: item.is_recommend === 1
          }));

          // 默认选中推荐套餐
          const recommendIndex = this.packages.findIndex(p => p.isRecommended);
          this.selectedIndex = recommendIndex >= 0 ? recommendIndex : 0;
        }
      } catch (e) {
        console.error('加载VIP套餐失败', e);
        // 使用默认套餐数据
        this.packages = [
          {
            title: '1个月',
            value: 68,
            subTitle: '',
            type: 'month_1',
            monthCount: 1,
            isRecommended: false
          },
          {
            title: '3个月',
            value: 168,
            subTitle: '原价294元',
            type: 'month_3',
            monthCount: 3,
            isRecommended: true
          },
          {
            title: '6个月',
            value: 298,
            subTitle: '原价588元',
            type: 'month_6',
            monthCount: 6,
            isRecommended: false
          }
        ];
        this.selectedIndex = 1;
      }
    },
    handleClose() {
      this.$emit('close');
    },
    selectPackage(index) {
      this.selectedIndex = index;
    },
    toggleProtocol() {
      this.agreeProtocol = !this.agreeProtocol;
    },
    openProtocol() {
      uni.navigateTo({
        url: '/pages/agreement/vip'
      });
    },
    handlePay() {
      if (!this.agreeProtocol) {
        uni.showToast({
          title: '请先同意协议',
          icon: 'none'
        });
        return;
      }

      const selectedPackage = this.packages[this.selectedIndex];
      this.$emit('pay', selectedPackage);
    }
  }
};
</script>

<style scoped>
.vip-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.vip-popup-container {
  width: 600rpx;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 20rpx;
  position: relative;
  max-height: 85vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.close-icon {
  width: 28rpx;
  height: 28rpx;
}

.popup-title {
  color: #FA731D;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  margin: 15rpx 0;
}

/* 功能介绍面板 */
.feature-panel {
  width: 520rpx;
  height: auto;
  background: linear-gradient(180deg, rgba(34, 123, 129, 0.06) 0%, rgba(247, 132, 162, 0.06) 100%);
  border-radius: 16rpx;
  padding: 25rpx;
  margin: 0 auto 30rpx;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 25rpx;
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-icon {
  width: 38rpx;
  height: 38rpx;
  margin-right: 14rpx;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 4rpx;
}

.feature-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #131313;
  margin-bottom: 12rpx;
  line-height: 26rpx;
}

.feature-desc {
  font-size: 22rpx;
  color: #505050;
  line-height: 32rpx;
}

.highlight {
  color: #FA731D;
}

/* VIP套餐 */
.package-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 20rpx;
  justify-content: space-between;
  width: 520rpx;
  margin: 0 auto 30rpx;
}

.package-item {
  position: relative;
  flex: 1;
  height: 180rpx;
  border-radius: 10rpx;
  padding: 30rpx 0;
  border: 2rpx solid #bebecef;
  text-align: center;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.package-item.active {
  border-color: #FA731D;
  background-color: rgba(250, 115, 29, 0.05);
  box-shadow: 0 6rpx 20rpx rgba(250, 115, 29, 0.2);
}

/* 推荐标签 */
.recommend-type::before {
  content: '推荐';
  position: absolute;
  top: -16rpx;
  left: -2rpx;
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  border-radius: 12rpx 2rpx 12rpx 2rpx;
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 500;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  width: 68rpx;
}

.package-title {
  font-size: 26rpx;
  color: #131313;
  font-weight: 500;
}

.package-price {
  font-size: 28rpx;
  color: #FA731D;
  font-weight: 600;
  margin: 15rpx 0;
  line-height: 28rpx;
}

.price-value {
  font-size: 34rpx;
  margin-right: -6rpx;
}

.package-subtitle {
  font-size: 22rpx;
  color: #BBBBBB;
  font-weight: 500;
}

/* 立即开通按钮 */
.pay-btn {
  width: 380rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  box-shadow: 0px 8rpx 16rpx 0px rgba(227, 184, 128, 0.2);
  border-radius: 40rpx;
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
  margin: 0 auto;
  border: none;
  display: block;
}

.pay-btn::after {
  border: none;
}

/* 协议 */
.protocol {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
  margin-bottom: 15rpx;
  font-size: 22rpx;
  color: #505050;
}

.checkbox-icon {
  width: 26rpx;
  height: 26rpx;
  margin-right: 6rpx;
}

.protocol-link {
  color: #FA731D;
}
</style>
