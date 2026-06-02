<template>
  <view class="modal-overlay" v-if="visible" @click="handleDismiss">
    <view class="modal-card" @click.stop>
      <!-- 标题 -->
      <view class="modal-header">
        <text class="modal-title">筛选条件</text>
        <text class="modal-close" @click="handleDismiss">✕</text>
      </view>

      <!-- 年龄 -->
      <view class="filter-section">
        <text class="section-label">年龄</text>
        <view class="option-list">
          <view
            class="option-item"
            :class="{ active: filterData.ageRange === item.value }"
            v-for="item in ageOptions"
            :key="item.value"
            @click="filterData.ageRange = item.value"
          >{{ item.label }}</view>
        </view>
      </view>

      <!-- 身高 -->
      <view class="filter-section">
        <text class="section-label">身高</text>
        <view class="option-list">
          <view
            class="option-item"
            :class="{ active: filterData.heightRange === item.value }"
            v-for="item in heightOptions"
            :key="item.value"
            @click="filterData.heightRange = item.value"
          >{{ item.label }}</view>
        </view>
      </view>

      <!-- 学历 -->
      <view class="filter-section">
        <text class="section-label">学历</text>
        <view class="option-list">
          <view
            class="option-item"
            :class="{ active: filterData.education === item.value }"
            v-for="item in educationOptions"
            :key="item.value"
            @click="filterData.education = item.value"
          >{{ item.label }}</view>
        </view>
      </view>

      <!-- 城市 -->
      <view class="filter-section">
        <text class="section-label">城市</text>
        <view class="option-list city-option-list">
          <view
            class="option-item"
            :class="{ active: filterData.city === item.value }"
            v-for="item in displayedCityOptions"
            :key="item.value"
            @click="filterData.city = item.value"
          >{{ item.label }}</view>
          <!-- 展开/收起按钮 -->
          <view class="option-item expand-btn" @click="toggleCityExpand">
            <text>{{ cityExpanded ? '收起' : '更多' }}</text>
            <text class="expand-icon">{{ cityExpanded ? '↑' : '↓' }}</text>
          </view>
        </view>
      </view>

      <!-- 按钮区 -->
      <view class="modal-buttons">
        <button class="btn-reset" @click="handleReset">重置</button>
        <button class="btn-confirm" @click="handleConfirm">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FilterModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['confirm', 'dismiss'],
  data() {
    return {
      filterData: {
        ageRange: '',
        heightRange: '',
        education: '',
        city: ''
      },
      cityExpanded: false, // 城市列表是否展开
      ageOptions: [
        { label: '不限', value: '' },
        { label: '18-25', value: '18-25' },
        { label: '26-30', value: '26-30' },
        { label: '31-35', value: '31-35' },
        { label: '36-40', value: '36-40' },
        { label: '40+', value: '40-100' }
      ],
      heightOptions: [
        { label: '不限', value: '' },
        { label: '160以下', value: '0-160' },
        { label: '160-170', value: '160-170' },
        { label: '170-180', value: '170-180' },
        { label: '180以上', value: '180-250' }
      ],
      educationOptions: [
        { label: '不限', value: '' },
        { label: '专科', value: '专科' },
        { label: '本科', value: '本科' },
        { label: '硕士', value: '硕士' },
        { label: '博士', value: '博士' }
      ],
      cityOptions: [
        { label: '不限', value: '' },
        { label: '北京', value: '2' },
        { label: '上海', value: '802' },
        { label: '广州', value: '1965' },
        { label: '深圳', value: '1988' },
        { label: '香港', value: '3716' },
        { label: '合肥', value: '1047' },
        { label: '成都', value: '2368' },
        { label: '杭州', value: '934' },
        { label: '南京', value: '821' },
        { label: '武汉', value: '1710' },
        { label: '佛山', value: '2011' },
        { label: '中山', value: '2123' },
        { label: '东莞', value: '2091' },
        { label: '江门', value: '2017' },
        { label: '珠海', value: '1999' },
        { label: '无锡', value: '833' },
        { label: '天津', value: '20' },
        { label: '宁波', value: '948' },
        { label: '南通', value: '871' }
      ]
    }
  },
  computed: {
    // 根据展开状态返回要显示的城市（默认显示4个 + 不限）
    displayedCityOptions() {
      if (this.cityExpanded) {
        return this.cityOptions
      }
      // 默认显示前5个（不限 + 4个热门城市）
      return this.cityOptions.slice(0, 5)
    }
  },
  watch: {
    visible(val) {
      if (val && this.filter) {
        this.filterData = { ...this.filterData, ...this.filter }
      }
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm', { ...this.filterData })
    },
    handleDismiss() {
      this.$emit('dismiss')
    },
    handleReset() {
      this.filterData = {
        ageRange: '',
        heightRange: '',
        education: '',
        city: ''
      }
      this.cityExpanded = false // 重置时收起城市列表
    },
    toggleCityExpand() {
      this.cityExpanded = !this.cityExpanded
    }
  }
}
</script>

<style scoped>
.modal-overlay {
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

.modal-card {
  width: 100%;
  max-height: 80vh;
  background-color: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx;
  animation: slideUp 0.3s ease-out;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.modal-close {
  font-size: 36rpx;
  color: #999999;
  padding: 10rpx;
}

.filter-section {
  margin-bottom: 36rpx;
}

.section-label {
  font-size: 30rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 20rpx;
  display: block;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-item {
  padding: 14rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666666;
  background-color: #F5F5F5;
  transition: all 0.2s;
}

.option-item.active {
  background-color: #FF4D4F;
  color: #FFFFFF;
}

/* 展开按钮样式 */
.expand-btn {
  background-color: #F0F0F0;
  color: #999999;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.expand-btn .expand-icon {
  font-size: 20rpx;
}

/* 城市列表样式 */
.city-option-list {
  align-items: flex-start;
}

.modal-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 50rpx;
  padding-bottom: 40rpx;
}

.btn-reset {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #F5F5F5;
  color: #666666;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
}

.btn-reset::after {
  border: none;
}

.btn-confirm {
  flex: 2;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(90deg, #FF4D4F, #FF7875);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 44rpx;
  border: none;
}

.btn-confirm::after {
  border: none;
}
</style>
