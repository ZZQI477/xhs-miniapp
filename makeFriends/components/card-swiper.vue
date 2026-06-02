<template>
  <view
    class="card-swiper"
    :style="wrapperStyle"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <view
      ref="track"
      class="card-swiper__track"
      :style="trackStyle"
      @transitionend="onTransitionEnd"
    >
      <view
        v-for="(item, index) in items"
        :key="item.id || index"
        class="card-swiper__slide"
        :style="slideStyle"
      >
        <slot :item="item" :index="index"></slot>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CardSwiper',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    current: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    width: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      innerCurrent: 0,
      dragging: false,
      animating: false,
      dragOffsetX: 0,
      startX: 0,
      startY: 0,
      deltaX: 0,
      deltaY: 0,
      direction: '',
      transitionFallbackTimer: null
    }
  },
  computed: {
    wrapperStyle() {
      return {
        height: this.height ? `${this.height}px` : '100%'
      }
    },
    trackStyle() {
      const width = this.slideWidth
      return {
        transform: `translate3d(${-this.innerCurrent * width + this.dragOffsetX}px, 0, 0)`,
        transition: this.dragging ? 'none' : 'transform 0.28s ease'
      }
    },
    slideStyle() {
      return {
        width: `${this.slideWidth}px`
      }
    },
    slideWidth() {
      return this.width || 375
    }
  },
  watch: {
    current: {
      immediate: true,
      handler(value) {
        const safeIndex = this.getSafeIndex(value)
        if (!this.dragging) {
          this.innerCurrent = safeIndex
        }
      }
    }
  },
  beforeDestroy() {
    if (this.transitionFallbackTimer) {
      clearTimeout(this.transitionFallbackTimer)
    }
  },
  methods: {
    clearTransitionFallback() {
      if (this.transitionFallbackTimer) {
        clearTimeout(this.transitionFallbackTimer)
        this.transitionFallbackTimer = null
      }
    },
    finishAnimation() {
      this.clearTransitionFallback()
      if (!this.animating) return
      this.animating = false
      this.$emit('animationfinish', { current: this.innerCurrent })
    },
    getSafeIndex(index) {
      return Math.max(0, Math.min(index, this.items.length - 1))
    },
    onTouchStart(e) {
      const touch = e.touches && e.touches[0]
      if (!touch || this.items.length <= 1) return

      this.clearTransitionFallback()
      this.animating = false

      this.dragging = false
      this.dragOffsetX = 0
      this.startX = touch.clientX
      this.startY = touch.clientY
      this.deltaX = 0
      this.deltaY = 0
      this.direction = ''
    },
    onTouchMove(e) {
      const touch = e.touches && e.touches[0]
      if (!touch || this.items.length <= 1) return

      this.deltaX = touch.clientX - this.startX
      this.deltaY = touch.clientY - this.startY

      if (!this.direction) {
        const absX = Math.abs(this.deltaX)
        const absY = Math.abs(this.deltaY)
        if (absX < 8 && absY < 8) return
        this.direction = absX > absY ? 'horizontal' : 'vertical'
      }

      if (this.direction !== 'horizontal') return

      this.dragging = true
      const limit = this.slideWidth * 0.35
      this.dragOffsetX = Math.max(-limit, Math.min(this.deltaX, limit))
    },
    onTouchEnd() {
      if (this.direction !== 'horizontal') {
        this.resetTouch()
        return
      }

      const threshold = this.slideWidth * 0.18
      let nextIndex = this.innerCurrent
      const previousIndex = this.innerCurrent
      if (this.deltaX <= -threshold) {
        nextIndex += 1
      } else if (this.deltaX >= threshold) {
        nextIndex -= 1
      }

      nextIndex = this.getSafeIndex(nextIndex)
      this.dragging = false
      this.dragOffsetX = 0
      this.animating = true

      if (nextIndex !== previousIndex) {
        this.innerCurrent = nextIndex
        this.$emit('change', { current: nextIndex })
      } else {
        this.innerCurrent = previousIndex
      }

      if (nextIndex === previousIndex) {
        this.animating = false
        this.$emit('animationfinish', { current: this.innerCurrent })
      } else {
        this.clearTransitionFallback()
        this.transitionFallbackTimer = setTimeout(() => {
          this.finishAnimation()
        }, 340)
      }

      this.resetTouch(false)
    },
    onTransitionEnd(e) {
      if (!e || !e.target || e.target !== this.$refs.track) return
      if (this.dragging) return
      this.finishAnimation()
    },
    resetTouch(resetDragging = true) {
      if (resetDragging) {
        this.dragging = false
        this.dragOffsetX = 0
      }
      this.startX = 0
      this.startY = 0
      this.deltaX = 0
      this.deltaY = 0
      this.direction = ''
    }
  }
}
</script>

<style scoped>
.card-swiper {
  width: 100%;
  overflow: hidden;
  touch-action: pan-x;
}

.card-swiper__track {
  display: inline-flex;
  height: 100%;
  will-change: transform;
  min-width: 100%;
}

.card-swiper__slide {
  height: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: pan-x;
}
</style>
