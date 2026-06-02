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
        <view class="option-list">
          <view
            class="option-item"
            :class="{ active: filterData.city === item.value }"
            v-for="item in cityOptions"
            :key="item.value"
            @click="filterData.city = item.value"
          >{{ item.label }}</view>
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
        { label: '北京', value: '北京' },
        { label: '上海', value: '上海' },
        { label: '广州', value: '广州' },
        { label: '深圳', value: '深圳' }
      ]
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
