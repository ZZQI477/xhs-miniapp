<template>
  <view class="custom-picker-wrapper">
    <!-- 触发元素 -->
    <view class="picker-trigger" @click="openPicker">
      <slot>
        <view class="default-trigger">
          <text class="trigger-text">{{ displayText || placeholder }}</text>
          <text class="trigger-arrow">›</text>
        </view>
      </slot>
    </view>

    <!-- 弹窗遮罩 -->
    <view 
      v-if="visible" 
      class="picker-overlay" 
      @click="closePicker"
      @touchmove.prevent
    >
      <!-- 选择器容器 -->
      <view class="picker-container" @click.stop>
        <!-- 头部 -->
        <view class="picker-header">
          <text class="picker-title">{{ title }}</text>
          <text class="picker-cancel" @click="closePicker">取消</text>
        </view>

        <!-- 滚动选择区域 -->
        <picker-view 
          class="picker-view" 
          :value="pickerValue" 
          @change="onPickerChange"
          indicator-style="height: 44px;"
        >
          <picker-view-column v-for="(column, colIndex) in columns" :key="colIndex">
            <view class="picker-item" v-for="(item, itemIndex) in column" :key="itemIndex">
              {{ getItemLabel(item) }}
            </view>
          </picker-view-column>
        </picker-view>

        <!-- 下一步按钮 -->
        <view class="picker-footer">
          <button class="picker-confirm-btn" @click="confirmSelection">
            下一步
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomPicker',
  props: {
    // 选择器标题
    title: {
      type: String,
      default: '请选择'
    },
    // 当前选中值（索引数组，支持多列）
    value: {
      type: Array,
      default: () => [0]
    },
    // 选择列数据，每列是一个数组
    columns: {
      type: Array,
      default: () => []
    },
    // 显示的文本
    displayText: {
      type: String,
      default: ''
    },
    // 未选择时的占位文本
    placeholder: {
      type: String,
      default: '请选择'
    },
    // 获取选项显示文本的方法，item 可以是字符串或对象
    labelKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      pickerValue: [] // 当前滚动位置索引
    }
  },
  watch: {
    value: {
      handler(newVal) {
        // 确保 pickerValue 是有效数组
        if (newVal && newVal.length > 0) {
          this.pickerValue = [...newVal]
        } else {
          // 默认选择每列的第一个
          this.pickerValue = this.columns.map(() => 0)
        }
      },
      immediate: true
    }
  },
  methods: {
    // 打开选择器
    openPicker() {
      // 打开时同步当前选中值到滚动位置
      if (this.value && this.value.length > 0) {
        this.pickerValue = [...this.value]
      } else {
        this.pickerValue = this.columns.map(() => 0)
      }
      this.visible = true
      this.$emit('open')
	  // 26.07.10  @zzqi  兼容ios滑动选择器样式
	  // #ifdef MP
	  uni.pageScrollTo({ scrollTop: 0, duration: 0 })
	  // #endif
    },

    // 关闭选择器（点击遮罩或取消）
    closePicker() {
      this.visible = false
      // 不保存选择，恢复原始值
      this.pickerValue = this.value && this.value.length > 0 ? [...this.value] : this.columns.map(() => 0)
      this.$emit('close')
    },

    // 滚动时更新临时选中值
    onPickerChange(e) {
      const oldValue = [...this.pickerValue]
      this.pickerValue = [...e.detail.value]
      
      // 检测哪一列发生了变化，发出 columnchange 事件
      for (let i = 0; i < this.pickerValue.length; i++) {
        if (oldValue[i] !== this.pickerValue[i]) {
          this.$emit('columnchange', {
            column: i,
            value: this.pickerValue[i]
          })
          break // 只发出第一个变化的列事件
        }
      }
    },

    // 确认选择（点击下一步）
    confirmSelection() {
      this.visible = false
      // 发出 change 事件，携带选中的索引和值
      const selectedItems = this.pickerValue.map((index, colIndex) => {
        const column = this.columns[colIndex]
        return column && column[index] ? column[index] : null
      })
      
      this.$emit('change', {
        value: [...this.pickerValue],
        items: selectedItems
      })
      this.$emit('close')
    },

    // 获取选项显示文本
    getItemLabel(item) {
      if (typeof item === 'string') {
        return item
      }
      if (typeof item === 'object' && item !== null) {
        return this.labelKey ? item[this.labelKey] : item.name || item.label || ''
      }
      return ''
    }
  }
}
</script>

<style scoped>
.custom-picker-wrapper {
  width: 100%;
}

/* 触发元素 */
.picker-trigger {
  width: 100%;
}

.default-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25rpx 20rpx;
  background-color: #F8F8F8;
  border-radius: 16rpx;
  font-size: 30rpx;
}

.trigger-text {
  flex: 1;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trigger-arrow {
  font-size: 40rpx;
  color: #999999;
  font-weight: 300;
}

/* 弹窗遮罩 */
.picker-overlay {
  /* position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99999;
  display: flex;
  align-items: flex-end; */
   /* 26.07.10  @zzqi  兼容ios滑动选择器样式 */
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh; /* 替换 right/bottom 四向拉伸，更稳定 */
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99999;
  display: flex;
  align-items: flex-end;
  /* 新增兼容属性 */
  -webkit-overflow-scrolling: touch;
  touch-action: none; /* 禁止遮罩滑动穿透底层 */
}
/* 适配苹果底部安全区 */
/* #ifdef IOS */
.mask {
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}
/* #endif */

/* 选择器容器 */
.picker-container {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

/* 头部 */
.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.picker-cancel {
  font-size: 28rpx;
  color: #999999;
  padding: 10rpx 20rpx;
}

/* 滚动选择区域 */
.picker-view {
  width: 100%;
  height: 420rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  font-size: 32rpx;
  color: #333333;
}

/* 底部按钮 */
.picker-footer {
  padding: 20rpx 30rpx;
}

.picker-confirm-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 45rpx;
  border: none;
  box-shadow: 0 10rpx 10rpx 0 rgba(227, 84, 80, 0.2);
}

.picker-confirm-btn::after {
  border: none;
}
</style>