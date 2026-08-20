<template>
  <view class="edit-container">
    <!-- 顶部标题栏 -->
    <custom-nav-bar
      title="编辑资料"
      backgroundImage="https://minixhs.chugao520.com/makefriends/bg3.png"
    />

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

    <!-- 步骤进度条 -->
    <view class="steps-bar">
      <view class="step-progress" :style="{ width: (currentStep / 4 * 100) + '%' }"></view>
    </view>

    <!-- 提示文字 -->
    <view class="tip-banner">
      告白时刻Daily鼓励真诚的社交方式，请认真填写资料，否则将不予通过!
    </view>

    <!-- 滚动内容区 -->
    <scroll-view class="content-scroll" scroll-y>
      <view class="content-wrapper">

        <!-- 步骤1: 基本联系信息 -->
        <view v-if="currentStep === 1" class="step-content">
          <view class="step-title">给自己取个名字吧</view>
          <input
            class="step-input"
            v-model="form.nickname"
            placeholder="真实姓名更有诚意"
          />

          <view class="step-title">互相同意查看微信号</view>
          <input
            class="step-input"
            v-model="form.wechat"
            placeholder="请输入微信号"
          />

          <view class="step-title">小红书号</view>
          <input
            class="step-input"
            v-model="form.xiaohongshu"
            placeholder="请输入小红书号"
          />

          <view class="step-title">是否购房或购车</view>
          <view class="property-options">
            <view
              class="property-btn"
              :class="{ active: !form.has_house && !form.has_car }"
              @click="selectProperty('none')"
            >
              未购
            </view>
            <view
              class="property-btn"
              :class="{ active: form.has_house }"
              @click="selectProperty('house')"
            >
              购房
            </view>
            <view
              class="property-btn"
              :class="{ active: form.has_car }"
              @click="selectProperty('car')"
            >
              购车
            </view>
          </view>
        </view>

        <!-- 步骤2: 照片上传 -->
        <view v-if="currentStep === 2" class="step-content">
          <view class="photo-section-title">
            <text class="title-main">我的照片</text>
            <text class="title-sub">*形象照片一定要上传本人正脸照片</text>
          </view>

          <!-- 头像 -->
          <view class="avatar-upload" @click="chooseAvatar">
            <image
              v-if="form.avatar"
              class="avatar-img"
              :src="form.avatar"
              mode="aspectFill"
            ></image>
            <view v-else class="avatar-placeholder">
              <text class="upload-icon">+</text>
              <text class="upload-text">上传头像</text>
              <text class="upload-required">*</text>
            </view>
            <image
              v-if="form.avatar"
              class="delete-icon"
              src="/static/close.png"
              @click.stop="deleteAvatar"
            ></image>
          </view>

          <!-- 相册 -->
          <view class="photo-grid">
            <view
              v-for="(img, index) in displayImages"
              :key="index"
              class="photo-item"
              @click="img ? previewImage(index) : chooseImage()"
            >
              <image
                v-if="img"
                class="photo-img"
                :src="img"
                mode="aspectFill"
              ></image>
              <view v-else class="photo-placeholder">
                <text class="upload-icon">+</text>
                <text class="upload-label">{{ getPhotoLabel(index) }}</text>
              </view>
              <image
                v-if="img"
                class="delete-icon"
                src="/static/close.png"
                @click.stop="deleteImage(index)"
              ></image>
            </view>
          </view>
        </view>

        <!-- 步骤3: 自我介绍 -->
        <view v-if="currentStep === 3" class="step-content">
          <view class="step-title">我是一个怎样的人</view>
          <textarea
            class="step-textarea"
            v-model="form.intro"
            placeholder="可以从自己的兴趣爱好、工作经历、性格特征、家庭情况、情感经历等方面介绍自己。一段好的自我介绍，可以极大提升自己的曝光率和推荐率喔！"
            maxlength="200"
          ></textarea>
          <view class="char-count">{{ (form.intro || '').length }}/200</view>

          <view class="step-title">看看别人怎么写？</view>
          <view class="example-box">
            <view class="example-header">
              <image class="example-avatar" :src="exampleAvatar" mode="aspectFill"></image>
              <text class="example-name">{{ exampleName }}</text>
              <view class="example-badge">
                <image class="badge-icon" src="/static/success.png"></image>
                <text class="badge-text">审核通过，收到1000+喜欢</text>
              </view>
            </view>
            <view class="example-content">{{ exampleIntro }}</view>
          </view>

          <view class="step-title">我的标签</view>
          <view class="tags-container">
            <view
              v-for="tag in allTags"
              :key="tag.id"
              class="tag-item"
              :class="{ active: form.my_tags.includes(tag.name) }"
              @click="toggleTag('my_tags', tag.name)"
            >
              {{ tag.name }}
            </view>
          </view>
        </view>

        <!-- 步骤4: 理想对象 -->
        <view v-if="currentStep === 4" class="step-content">
          <view class="step-title">我理想中的她/他</view>
          <textarea
            class="step-textarea"
            v-model="form.ideal_intro"
            placeholder="描述一下你理想中的Ta，可以从性格、外貌、工作、兴趣爱好等方面描述~"
            maxlength="200"
          ></textarea>
          <view class="char-count">{{ (form.ideal_intro || '').length }}/200</view>

          <view class="step-title">看看别人怎么写？</view>
          <view class="example-box">
            <view class="example-header">
              <image class="example-avatar" :src="exampleAvatar" mode="aspectFill"></image>
              <text class="example-name">{{ exampleName }}</text>
              <view class="example-badge">
                <image class="badge-icon" src="/static/success.png"></image>
                <text class="badge-text">审核通过，收到1000+喜欢</text>
              </view>
            </view>
            <view class="example-content">{{ exampleIdealIntro }}</view>
          </view>

          <view class="step-title">理想对象的标签</view>
          <view class="tags-container">
            <view
              v-for="tag in allTags"
              :key="'ideal-' + tag.id"
              class="tag-item"
              :class="{ active: form.ideal_tags.includes(tag.name) }"
              @click="toggleTag('ideal_tags', tag.name)"
            >
              {{ tag.name }}
            </view>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <button
        v-if="currentStep > 1"
        class="btn btn-secondary"
        @click="prevStep"
      >
        上一步
      </button>
      <button
        class="btn btn-primary"
        :class="{ 'btn-full': currentStep === 1 }"
        @click="nextStep"
      >
        {{ currentStep === 4 ? '完成' : '下一步' }}
      </button>
    </view>
  </view>
</template>

<script>
import { getUserInfo, updateProfile, uploadAvatar, uploadImage, getTags } from '@/api/index.js'
import CustomNavBar from '../../components/custom-nav-bar.vue'

export default {
  components: {
    CustomNavBar
  },
  data() {
    return {
      currentStep: 1,
      form: {
        nickname: '',
        avatar: '',
        wechat: '',
        xiaohongshu: '',
        has_house: 0,
        has_car: 0,
        images: [],
        intro: '',
        my_tags: [],
        ideal_intro: '',
        ideal_tags: []
      },
      allTags: [],
      saving: false
    }
  },
  computed: {
    displayImages() {
      // 显示3个图片位置
      const result = []
      for (let i = 0; i < 3; i++) {
        result.push(this.form.images[i] || '')
      }
      return result
    },
    exampleAvatar() {
      return this.form.gender === 1 ? '/static/male-avatar.png' : '/static/female-avatar.png'
    },
    exampleName() {
      return this.form.gender === 1 ? '晓杨' : '梅林'
    },
    exampleIntro() {
      return this.form.gender === 1
        ? '我目前是一名大厂的项目经理，我的家乡是内蒙古乌兰察布，因为在北京上学多年，在北京也买了房，北京算是我的第二故乡。性格方面是典型的摩羯男性格，踏实稳重，具有责任感，懂得知足，懂得感恩。外冷内热，在熟人面前就是一个沙雕，在恋人面前有时幼稚又沙雕。喜欢运动，每周至少去两次健身房，喜欢旅行和拍照。'
        : '你好吖，目前我在深圳做舞蹈老师。平时很爱笑，会变月牙眼，是容易从生活中获得快乐的性格，喜欢吃草莓和拍照。平时有点宅，在家喜欢研究新菜或烘焙，吃美食能让我能量满满。喜欢在B站看番，阅读让我心情轻松愉悦，在家练习古典舞和民族舞。我曾经喜欢玩游戏，若未来另一半不嫌弃我技术小白的话，我们一起玩吧。期待平淡温馨的小日子。'
    },
    exampleIdealIntro() {
      return this.form.gender === 1
        ? '希望你善良一些，可爱一些，温柔大方，善解人意。希望你有自己的爱好和伙伴，追求向上，愿意一起把日子过得越来越好。希望情侣之间的关系能够是轻松、愉快的、相互扶持的。'
        : '希望你无不良嗜好、无黑历史。希望你有过恋爱史，对感情专一认真，希望你有养小动物。加分项：偏宅、会玩游戏、生活作息规律、饮食健康。'
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
        const data = res.data.userinfo || res.data

        this.form = {
          nickname: data.nickname || '',
          avatar: data.avatar || '',
          wechat: data.wechat || '',
          xiaohongshu: data.xiaohongshu || '',
          has_house: data.has_house || 0,
          has_car: data.has_car || 0,
          images: data.images || [],
          intro: data.intro || '',
          my_tags: data.my_tags || [],
          ideal_intro: data.ideal_intro || '',
          ideal_tags: data.ideal_tags || [],
          gender: data.gender || 1
        }
      } catch (e) {
        console.error('加载用户信息失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
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

    // 选择属性
    selectProperty(type) {
      if (type === 'none') {
        this.form.has_house = 0
        this.form.has_car = 0
      } else if (type === 'house') {
        this.form.has_house = this.form.has_house ? 0 : 1
        if (this.form.has_house) {
          // 如果选中购房，取消"未购"状态
        }
      } else if (type === 'car') {
        this.form.has_car = this.form.has_car ? 0 : 1
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

    // 删除头像
    deleteAvatar() {
      this.form.avatar = ''
    },

    // 选择相册图片
    chooseImage() {
      const remainCount = 3 - this.form.images.length
      if (remainCount <= 0) {
        uni.showToast({ title: '最多上传3张照片', icon: 'none' })
        return
      }

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
      if (!this.form.images[index]) return
      uni.previewImage({
        current: index,
        urls: this.form.images
      })
    },

    // 删除图片
    deleteImage(index) {
      this.form.images.splice(index, 1)
    },

    // 获取照片标签
    getPhotoLabel(index) {
      const labels = ['旅行照片', '兴趣照片', '更多照片']
      return labels[index] || '添加照片'
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

    // 上一步
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    // 下一步/完成
    async nextStep() {
      // 验证当前步骤
      if (this.currentStep === 1) {
        if (!this.form.nickname) {
          uni.showToast({ title: '请输入姓名', icon: 'none' })
          return
        }
        if (!this.form.wechat) {
          uni.showToast({ title: '请输入微信号', icon: 'none' })
          return
        }
      } else if (this.currentStep === 2) {
        if (!this.form.avatar) {
          uni.showToast({ title: '请上传头像', icon: 'none' })
          return
        }
      } else if (this.currentStep === 3) {
        if (!this.form.intro || this.form.intro.length < 30) {
          uni.showToast({ title: '自我介绍至少30字', icon: 'none' })
          return
        }
		if (this.form.my_tags.length <= 0) {
		  uni.showToast({ title: '请选择你的标签', icon: 'none' })
		  return
		}
      }

      // 最后一步，保存数据
      if (this.currentStep === 4) {
		  // 26.05.08 增加标签和择偶必填验证
		  if (!this.form.ideal_intro || this.form.ideal_intro.length < 30) {
		    uni.showToast({ title: '择偶要求至少30字', icon: 'none' })
		    return
		  }
		  if (this.form.ideal_tags.length <= 0) {
		    uni.showToast({ title: '请选择你的择偶标签', icon: 'none' })
		    return
		  }
        await this.saveProfile()
      } else {
		  console.log(this.form)
        this.currentStep++
      }
    },

    // 保存资料
    async saveProfile() {
      this.saving = true
      try {
        uni.showLoading({ title: '保存中...' })
        await updateProfile(this.form)
        uni.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (e) {
        uni.showToast({ title: e.msg || '保存失败', icon: 'none' })
      } finally {
        this.saving = false
        uni.hideLoading()
      }
    }
  }
}
</script>

<style scoped>
.edit-container {
  min-height: 100vh;
  background-color: #F9F9F9;
  padding-bottom: calc(220rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

/* 导航栏占位 */
.nav-bar-placeholder {
  height: 156rpx;
}

/* 步骤进度条 */
.steps-bar {
  width: 100%;
  height: 7rpx;
  background-color: rgba(254, 245, 245, 1);
  margin-bottom: 30rpx;
}

.step-progress {
  height: 100%;
  background-color: #FF4D4F;
  transition: width 0.3s ease;
}

/* 提示横幅 */
.tip-banner {
  color: #FF4D4F;
  height: 120rpx;
  width: 650rpx;
  margin: 0 auto 30rpx;
  font-size: 28rpx;
  padding: 20rpx;
  line-height: 42rpx;
  background-color: #FCF5F5;
  border-radius: 20rpx;
  box-sizing: border-box;
}

/* 滚动内容区 */
.content-scroll {
  height: calc(100vh - 277rpx - 200rpx - env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.content-wrapper {
  padding: 30rpx 30rpx calc(80rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.step-content {
  width: 100%;
}

/* 步骤标题 */
.step-title {
  margin-bottom: 32rpx;
  height: 44rpx;
  line-height: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #000000;
}

/* 输入框 */
.step-input {
  width: 100%;
  height: 128rpx;
  background-color: #FFFFFF;
  border-radius: 50rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 32rpx;
  box-sizing: border-box;
}

/* 属性选择按钮 */
.property-options {
  display: flex;
  gap: 14rpx;
  margin: 30rpx auto;
}

.property-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #FFFFFF;
  border: 4rpx solid rgba(255, 0, 89, 0.2);
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #333333;
}

.property-btn.active {
  background-color: #FF4D4F;
  color: #FFFFFF;
  border-color: #FF4D4F;
}

/* 照片区域 */
.photo-section-title {
  display: flex;
  flex-direction: column;
  padding-bottom: 25rpx;
}

.title-main {
  font-size: 28rpx;
  font-weight: 600;
  line-height: 40rpx;
}

.title-sub {
  color: #FF4D4F;
  font-size: 24rpx;
  margin-top: 8rpx;
}

/* 头像上传 */
.avatar-upload {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto 25rpx;
  border-radius: 30rpx;
  border: 2rpx dashed #FF4D4F;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 50rpx;
  color: #CCCCCC;
  margin-bottom: 20rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #FF4D4F;
}

.upload-required {
  color: #FF4D4F;
  font-size: 24rpx;
}

.delete-icon {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 34rpx;
  height: 34rpx;
}

/* 照片网格 */
.photo-grid {
  display: flex;
  justify-content: space-between;
  gap: 15rpx;
}

.photo-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 30rpx;
  border: 2rpx dashed #FF4D4F;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-label {
  font-size: 20rpx;
  color: #FF4D4F;
  margin-top: 10rpx;
}

/* 文本域 */
.step-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx 22rpx;
  background-color: transparent;
  border: 1rpx solid #CBCBCB;
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
  margin-bottom: 40rpx;
}

/* 示例框 */
.example-box {
  width: 100%;
  border: 1rpx solid #CBCBCB;
  border-radius: 10rpx;
  padding: 22rpx 30rpx;
  line-height: 40rpx;
  margin-top: 40rpx;
  margin-bottom: 60rpx;
  box-sizing: border-box;
}

.example-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.example-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.example-name {
  font-size: 28rpx;
  margin-right: 30rpx;
}

.example-badge {
  flex: 1;
  display: flex;
  align-items: center;
  height: 70rpx;
  background-color: rgba(227, 184, 180, 0.06);
  border-radius: 45rpx;
  padding: 0 20rpx;
}

.badge-icon {
  width: 50rpx;
  height: 50rpx;
  margin-top: 6rpx;
  margin-right: 10rpx;
}

.badge-text {
  color: #FF4D4F;
  font-size: 24rpx;
  line-height: 70rpx;
}

.example-content {
  font-size: 26rpx;
  color: #131313;
  line-height: 40rpx;
}

/* 标签容器 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
  margin-bottom: 300rpx;
}

.tag-item {
  height: 70rpx;
  padding: 0 30rpx;
  line-height: 70rpx;
  font-size: 28rpx;
  font-weight: 500;
  background-color: rgba(216, 216, 216, 0.2);
  border-radius: 35rpx;
}

.tag-item.active {
  background-color: #FCF6F5;
  color: #FF4D4F;
}

/* 底部按钮 */
.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  padding: 0 0 env(safe-area-inset-bottom);
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  background-color: #FFFFFF;
  box-sizing: border-box;
}

.btn {
  width: 310rpx;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.btn-full {
  width: 654rpx;
}

.btn-primary {
  background-color: #FF4D4F;
  color: #FFFFFF;
}

.btn-secondary {
  background-color: #FF4D4F;
  color: #FFFFFF;
}
</style>
