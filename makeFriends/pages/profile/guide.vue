<template>
  <view class="container">
    <!-- 顶部步骤指示器 -->
    <view class="step-indicator">
      <view class="step-item" v-for="i in 4" :key="i" :class="{ active: currentStep >= i, done: currentStep > i }">
        <view class="step-dot">
          <text v-if="currentStep > i">✓</text>
          <text v-else>{{ i }}</text>
        </view>
        <text class="step-label">{{ stepLabels[i - 1] }}</text>
      </view>
      <view class="step-line" :style="{ width: ((currentStep - 1) / 3 * 100) + '%' }"></view>
    </view>

    <!-- Step 1: 基础信息 -->
    <view class="step-content" v-if="currentStep === 1">
      <view class="step-title">填写基础信息</view>
      <view class="step-desc">让大家更好地认识你</view>

      <view class="form-section">
        <view class="form-item">
          <text class="label required">昵称</text>
          <input class="input" v-model="form.nickname" placeholder="请输入昵称" maxlength="20" />
        </view>

        <view class="form-item">
          <text class="label required">性别</text>
          <view class="gender-cards">
            <view class="gender-card" :class="{ active: form.gender === 1 }" @click="form.gender = 1">
              <text class="gender-icon">👨</text>
              <text class="gender-text">男</text>
            </view>
            <view class="gender-card" :class="{ active: form.gender === 2 }" @click="form.gender = 2">
              <text class="gender-icon">👩</text>
              <text class="gender-text">女</text>
            </view>
          </view>
        </view>

        <view class="form-item" @click="openBirthdayPicker">
          <text class="label required">出生年份</text>
          <text class="value" :class="{ placeholder: !form.birthday }">
            {{ form.birthday ? form.birthday.split('-')[0] + '年' : '请选择' }}
          </text>
          <text class="arrow">→</text>
        </view>

        <view class="form-item" @click="openHeightPicker">
          <text class="label required">身高</text>
          <text class="value" :class="{ placeholder: !form.height }">
            {{ form.height ? form.height + 'cm' : '请选择' }}
          </text>
          <text class="arrow">→</text>
        </view>
      </view>
    </view>

    <!-- Step 2: 手机验证 -->
    <view class="step-content" v-if="currentStep === 2">
      <view class="step-title">手机号验证</view>
      <view class="step-desc">用于接收重要通知</view>

      <view class="phone-section">
        <view class="phone-verified" v-if="hasPhone">
          <text class="verified-icon">✓</text>
          <view class="verified-info">
            <text class="phone-number">{{ maskedPhone }}</text>
            <text class="verified-text">手机号已验证</text>
          </view>
        </view>
        <view class="phone-unverified" v-else>
          <text class="unverified-icon">📱</text>
          <text class="unverified-text">您已通过手机号登录，无需再次验证</text>
        </view>
      </view>
    </view>

    <!-- Step 3: 理想型描述 -->
    <view class="step-content" v-if="currentStep === 3">
      <view class="step-title">描述你的理想型</view>
      <view class="step-desc">帮助系统更精准匹配</view>

      <view class="form-section">
        <view class="textarea-section">
          <text class="textarea-label required">理想对象描述</text>
          <textarea
            class="textarea"
            v-model="form.ideal_intro"
            placeholder="描述一下你理想中的Ta，如年龄、性格、职业、爱好等偏好..."
            maxlength="500"
          />
          <text class="char-count" :class="{ warning: (form.ideal_intro || '').length < 30 }">
            {{ (form.ideal_intro || '').length }}/500 (至少30字)
          </text>
        </view>

        <view class="tags-section">
          <text class="tags-label required">理想对象标签 (最多5个)</text>
          <view class="tags-wrap">
            <view
              class="tag-item"
              v-for="tag in allTags"
              :key="'ideal-' + tag.id"
              :class="{ active: form.ideal_tags.includes(tag.name) }"
              @click="toggleTag('ideal_tags', tag.name)"
            >
              {{ tag.name }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Step 4: 照片和自我介绍 -->
    <view class="step-content" v-if="currentStep === 4">
      <view class="step-title">上传头像和自我介绍</view>
      <view class="step-desc">展示真实的你</view>

      <view class="form-section">
        <!-- 头像 -->
        <view class="avatar-section" @click="chooseAvatar">
          <view class="avatar-wrapper">
            <image v-if="form.avatar" class="avatar" :src="form.avatar" mode="aspectFill"></image>
            <view v-else class="avatar-empty">
              <text class="avatar-empty-icon">+</text>
              <text class="avatar-empty-text">点击上传</text>
            </view>
            <view v-if="form.avatar" class="avatar-mask">
              <text>重新上传</text>
            </view>
          </view>
          <text class="avatar-tip required">头像 (必填)</text>
        </view>

        <!-- 相册 -->
        <view class="images-section">
          <text class="images-label">个人相册 (可选，最多9张)</text>
          <view class="images-grid">
            <view class="image-item" v-for="(img, index) in form.images" :key="index">
              <image class="uploaded-image" :src="img" mode="aspectFill" @click="previewImage(index)"></image>
              <view class="delete-btn" @click.stop="deleteImage(index)">×</view>
            </view>
            <view class="image-item add-btn" v-if="form.images.length < 9" @click="chooseImage">
              <text class="add-icon">+</text>
              <text class="add-text">添加</text>
            </view>
          </view>
        </view>

        <!-- 自我介绍 -->
        <view class="textarea-section">
          <text class="textarea-label required">自我介绍</text>
          <textarea
            class="textarea"
            v-model="form.intro"
            placeholder="介绍一下自己吧，可以聊聊你的性格、兴趣爱好、工作经历等..."
            maxlength="500"
          />
          <text class="char-count" :class="{ warning: (form.intro || '').length < 30 }">
            {{ (form.intro || '').length }}/500 (至少30字)
          </text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <button class="btn-secondary" v-if="currentStep > 1" @click="prevStep">上一步</button>
      <button class="btn-primary" v-if="currentStep < 4" @click="nextStep">下一步</button>
      <button class="btn-primary" v-if="currentStep === 4" @click="submitProfile" :loading="saving">完成</button>
    </view>

    <!-- 出生年份选择器弹窗 -->
    <view class="picker-overlay" v-if="showBirthdayPicker" @click="showBirthdayPicker = false">
      <view class="picker-popup" @click.stop>
        <view class="picker-header">
          <text class="picker-cancel" @click="showBirthdayPicker = false">取消</text>
          <text class="picker-title">选择出生年份</text>
          <text class="picker-confirm" @click="confirmBirthday">确定</text>
        </view>
        <picker-view :value="[yearIndex]" @change="onYearChange" class="picker-view">
          <picker-view-column>
            <view class="picker-item" v-for="year in years" :key="year">{{ year }}年</view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>

    <!-- 身高选择器弹窗 -->
    <view class="picker-overlay" v-if="showHeightPicker" @click="showHeightPicker = false">
      <view class="picker-popup" @click.stop>
        <view class="picker-header">
          <text class="picker-cancel" @click="showHeightPicker = false">取消</text>
          <text class="picker-title">选择身高</text>
          <text class="picker-confirm" @click="confirmHeight">确定</text>
        </view>
        <picker-view :value="[heightIndex]" @change="onHeightChange" class="picker-view">
          <picker-view-column>
            <view class="picker-item" v-for="h in heights" :key="h">{{ h }}cm</view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo, updateProfile, uploadAvatar, uploadImage, getTags } from '@/api/index.js'

export default {
  data() {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = currentYear - 60; i <= currentYear - 18; i++) {
      years.push(i)
    }

    const heights = []
    for (let i = 140; i <= 220; i++) {
      heights.push(i)
    }

    return {
      currentStep: 1,
      stepLabels: ['基础信息', '手机验证', '理想型', '照片介绍'],

      form: {
        nickname: '',
        avatar: '',
        gender: '',
        birthday: '',
        height: 0,
        intro: '',
        images: [],
        ideal_intro: '',
        ideal_tags: []
      },

      allTags: [],
      saving: false,
      hasPhone: true,
      maskedPhone: '',

      // 选择器相关
      years,
      yearIndex: 20,
      showBirthdayPicker: false,

      heights,
      heightIndex: 30,
      showHeightPicker: false
    }
  },
  onLoad() {
    this.loadUserInfo()
    this.loadTags()
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await getUserInfo()
        const data = res.data.userinfo

        // 同步更新本地存储
        uni.setStorageSync('userinfo', data);
        console.log('[ProfileGuide] 已更新本地用户信息');

        this.form = {
          nickname: data.nickname || '',
          avatar: data.avatar || '',
          gender: data.gender || '',
          birthday: data.birthday || '',
          height: data.height || 0,
          intro: data.intro || '',
          images: data.images || [],
          ideal_intro: data.ideal_intro || '',
          ideal_tags: data.ideal_tags || []
        }

        // 设置选择器初始值
        if (this.form.birthday) {
          const year = parseInt(this.form.birthday.split('-')[0])
          this.yearIndex = this.years.indexOf(year)
          if (this.yearIndex < 0) this.yearIndex = 20
        }
        if (this.form.height) {
          this.heightIndex = this.heights.indexOf(this.form.height)
          if (this.heightIndex < 0) this.heightIndex = 30
        }

        // 获取手机号（从本地存储）
        const userinfo = uni.getStorageSync('userinfo')
        if (userinfo && userinfo.mobile) {
          this.hasPhone = true
          const mobile = userinfo.mobile
          this.maskedPhone = mobile.substring(0, 3) + '****' + mobile.substring(7)
        }
      } catch (e) {
        console.error('加载用户信息失败', e)
      } finally {
        uni.hideLoading()
      }
    },

    // 加载标签
    async loadTags() {
      try {
        const res = await getTags()
        this.allTags = res.data.list || []
      } catch (e) {
        console.error('加载标签失败', e)
      }
    },

    // 上一步
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    // 下一步
    nextStep() {
      if (!this.validateStep()) {
        return
      }
      if (this.currentStep < 4) {
        this.currentStep++
      }
    },

    // 验证当前步骤
    validateStep() {
      if (this.currentStep === 1) {
        if (!this.form.nickname) {
          uni.showToast({ title: '请输入昵称', icon: 'none' })
          return false
        }
        if (!this.form.gender) {
          uni.showToast({ title: '请选择性别', icon: 'none' })
          return false
        }
        if (!this.form.birthday) {
          uni.showToast({ title: '请选择出生年份', icon: 'none' })
          return false
        }
        if (!this.form.height) {
          uni.showToast({ title: '请选择身高', icon: 'none' })
          return false
        }
      } else if (this.currentStep === 3) {
        if (!this.form.ideal_intro || this.form.ideal_intro.length < 30) {
          uni.showToast({ title: '理想对象描述至少30字', icon: 'none' })
          return false
        }
        if (this.form.ideal_tags.length === 0) {
          uni.showToast({ title: '请选择至少一个理想对象标签', icon: 'none' })
          return false
        }
      }
      return true
    },

    // 提交资料
    async submitProfile() {
      if (!this.form.avatar) {
        uni.showToast({ title: '请上传头像', icon: 'none' })
        return
      }
      if (!this.form.intro || this.form.intro.length < 30) {
        uni.showToast({ title: '自我介绍至少30字', icon: 'none' })
        return
      }

      this.saving = true
      try {
        await updateProfile(this.form)
        uni.showToast({ title: '资料保存成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (e) {
        uni.showToast({ title: e.msg || '保存失败', icon: 'none' })
      } finally {
        this.saving = false
      }
    },

    // 切换标签
    toggleTag(field, tagName) {
      const index = this.form[field].indexOf(tagName)
      if (index > -1) {
        this.form[field].splice(index, 1)
      } else {
        if (this.form[field].length >= 5) {
          uni.showToast({ title: '最多选择5个标签', icon: 'none' })
          return
        }
        this.form[field].push(tagName)
      }
    },

    // 选择头像
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          try {
            uni.showLoading({ title: '上传中...' })
            const uploadRes = await uploadAvatar(res.tempFilePaths[0])
            this.form.avatar = uploadRes.data.url
            uni.showToast({ title: '上传成功', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: e.msg || '上传失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    },

    // 选择相册图片
    chooseImage() {
      const remainCount = 9 - this.form.images.length
      uni.chooseImage({
        count: remainCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          try {
            uni.showLoading({ title: '上传中...' })
            for (const tempPath of res.tempFilePaths) {
              const uploadRes = await uploadImage(tempPath)
              this.form.images.push(uploadRes.data.url)
            }
            uni.showToast({ title: '上传成功', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: e.msg || '上传失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    },

    // 预览图片
    previewImage(index) {
      uni.previewImage({
        current: index,
        urls: this.form.images
      })
    },

    // 删除图片
    deleteImage(index) {
      this.form.images.splice(index, 1)
    },

    // 打开年份选择器
    openBirthdayPicker() {
      this.showBirthdayPicker = true
    },

    // 年份选择器
    onYearChange(e) {
      this.yearIndex = e.detail.value[0]
    },
    confirmBirthday() {
      const year = this.years[this.yearIndex]
      this.form.birthday = `${year}-01-01`
      this.showBirthdayPicker = false
    },

    // 打开身高选择器
    openHeightPicker() {
      this.showHeightPicker = true
    },

    // 身高选择器
    onHeightChange(e) {
      this.heightIndex = e.detail.value[0]
    },
    confirmHeight() {
      this.form.height = this.heights[this.heightIndex]
      this.showHeightPicker = false
    }
  }
}
</script>

<style scoped>
.container {
  background-color: #F8F8F8;
  min-height: 100vh;
  padding-bottom: 150rpx;
}

/* 步骤指示器 */
.step-indicator {
  background-color: #FFFFFF;
  padding: 40rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  flex: 1;
}

.step-dot {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background-color: #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 10rpx;
}

.step-item.active .step-dot {
  background-color: #FF4D4F;
  color: #FFFFFF;
}

.step-item.done .step-dot {
  background-color: #52C41A;
  color: #FFFFFF;
}

.step-label {
  font-size: 22rpx;
  color: #999999;
}

.step-item.active .step-label {
  color: #FF4D4F;
  font-weight: bold;
}

.step-line {
  position: absolute;
  top: 65rpx;
  left: 12.5%;
  height: 4rpx;
  background-color: #FF4D4F;
  z-index: 1;
  transition: width 0.3s ease;
}

/* 步骤内容 */
.step-content {
  padding: 30rpx;
}

.step-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 15rpx;
}

.step-desc {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
}

.form-section {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
}

/* 表单项 */
.form-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.form-item:last-child {
  border-bottom: none;
}

.label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333333;
  flex-shrink: 0;
}

.label.required::before {
  content: '*';
  color: #FF4D4F;
  margin-right: 5rpx;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  text-align: right;
}

.value {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  text-align: right;
}

.value.placeholder {
  color: #CCCCCC;
}

.arrow {
  font-size: 28rpx;
  color: #CCCCCC;
  margin-left: 10rpx;
}

/* 性别选择卡片 */
.gender-cards {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
}

.gender-card {
  width: 120rpx;
  height: 100rpx;
  background-color: #F5F5F5;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
}

.gender-card.active {
  background-color: #FFF0F0;
  border-color: #FF4D4F;
}

.gender-icon {
  font-size: 36rpx;
  margin-bottom: 5rpx;
}

.gender-text {
  font-size: 24rpx;
  color: #666666;
}

.gender-card.active .gender-text {
  color: #FF4D4F;
}

/* 手机验证区域 */
.phone-section {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 50rpx 30rpx;
}

.phone-verified {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #F6FFED;
  border-radius: 12rpx;
}

.verified-icon {
  width: 60rpx;
  height: 60rpx;
  background-color: #52C41A;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 20rpx;
}

.verified-info {
  display: flex;
  flex-direction: column;
}

.phone-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 5rpx;
}

.verified-text {
  font-size: 24rpx;
  color: #52C41A;
}

.phone-unverified {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.unverified-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.unverified-text {
  font-size: 28rpx;
  color: #666666;
  text-align: center;
}

/* 文本域 */
.textarea-section {
  margin-bottom: 30rpx;
}

.textarea-label,
.tags-label,
.images-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 15rpx;
}

.textarea-label.required::before,
.tags-label.required::before {
  content: '*';
  color: #FF4D4F;
  margin-right: 5rpx;
}

.textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  background-color: #F5F5F5;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999999;
  margin-top: 10rpx;
}

.char-count.warning {
  color: #FF4D4F;
}

/* 标签区域 */
.tags-section {
  margin-bottom: 30rpx;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.tag-item {
  padding: 15rpx 25rpx;
  background-color: #F5F5F5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666666;
  border: 2rpx solid transparent;
}

.tag-item.active {
  background-color: #FFF0F0;
  color: #FF4D4F;
  border-color: #FF4D4F;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
  margin-bottom: 30rpx;
}

.avatar-wrapper {
  position: relative;
  width: 180rpx;
  height: 180rpx;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #F5F5F5;
}

.avatar-empty {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f7f7f7;
  border: 2rpx dashed #d9d9d9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999999;
}

.avatar-empty-icon {
  font-size: 56rpx;
  line-height: 1;
  margin-bottom: 8rpx;
}

.avatar-empty-text {
  font-size: 22rpx;
}

.avatar-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 24rpx;
}

.avatar-tip {
  font-size: 26rpx;
  color: #666666;
  margin-top: 15rpx;
}

.avatar-tip.required::before {
  content: '*';
  color: #FF4D4F;
  margin-right: 5rpx;
}

/* 相册区域 */
.images-section {
  margin-bottom: 30rpx;
}

.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.image-item {
  width: 150rpx;
  height: 150rpx;
  position: relative;
  border-radius: 10rpx;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 5rpx;
  right: 5rpx;
  width: 36rpx;
  height: 36rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #FFFFFF;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.add-btn {
  background-color: #F5F5F5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #CCCCCC;
}

.add-icon {
  font-size: 40rpx;
  color: #CCCCCC;
}

.add-text {
  font-size: 20rpx;
  color: #999999;
  margin-top: 5rpx;
}

/* 底部按钮 */
.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #FFFFFF;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20rpx;
}

.btn-primary {
  flex: 1;
  height: 90rpx;
  background: linear-gradient(90deg, #FF4D4F, #FF7875);
  color: #FFFFFF;
  font-size: 32rpx;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-primary::after {
  border: none;
}

.btn-secondary {
  flex: 1;
  height: 90rpx;
  background-color: #F5F5F5;
  color: #666666;
  font-size: 32rpx;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-secondary::after {
  border: none;
}

/* 选择器弹窗遮罩层 */
.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}

/* 选择器弹窗 */
.picker-popup {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 20rpx 20rpx 0 0;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.picker-cancel {
  font-size: 28rpx;
  color: #999999;
}

.picker-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.picker-confirm {
  font-size: 28rpx;
  color: #FF4D4F;
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #333333;
}
</style>
