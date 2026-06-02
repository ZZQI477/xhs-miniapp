<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <custom-nav-bar
      title="灵魂三问"
      backgroundImage="/static/bg4.png"
    />

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

    <!-- 顶部提示 -->
    <view class="top-banner">
      <view class="banner-text">
        <text class="banner-title">请认真回答！</text>
        <text class="banner-subtitle">你的答案将会展示在个人主页上，同时也会增加你的匹配精准度。</text>
      </view>
      <image class="banner-image" src="/static/Frame 1890184003.png" mode="aspectFit"></image>
    </view>

    <!-- 说明文字 -->
	
  <!--  <view class="description">
      <text>请认真随机选取三个问题进行回答，你的答案将会展示在你的个人主页上，同时也会增加你的匹配精准度。</text>
    </view> -->

    <!-- 灵魂问答列表 -->
    <view class="question-section" v-for="(item, index) in soulAnswers" :key="index">
      <view class="question-title">
        <image class="question-icon" src="/static/Frame.png" mode="aspectFit"></image>
        <text class="question-number">灵魂{{ ['一', '二', '三'][index] }}问</text>
      </view>
      <view class="question-select" @click="showQuestionPicker(index)">
        <text class="question-text">{{ item.question || '点击选择问题' }}</text>
        <text class="select-arrow">▼</text>
      </view>
      <view class="answer-title">
        <image class="answer-icon" src="/static/Frame(1).png" mode="aspectFit"></image>
        <text>我的回答</text>
      </view>
      <textarea class="answer-input" v-model="item.answer" placeholder="请输入你的回答" placeholder-style="color: #999999;"></textarea>
    </view>

    <!-- 保存按钮 -->
    <button class="save-btn" @click="saveSoul">确定提交</button>

    <!-- 问题选择器 -->
    <view class="picker-modal" v-if="pickerVisible">
      <view class="picker-backdrop" @click="hideQuestionPicker"></view>
      <view class="picker-content">
        <view class="picker-header">
          <text class="picker-cancel" @click="hideQuestionPicker">取消</text>
          <text class="picker-title">选择问题</text>
          <text class="picker-confirm" @click="confirmQuestion">确定</text>
        </view>
        <picker-view class="picker-view" :value="pickerValue" @change="pickerChange">
          <picker-view-column>
            <view class="picker-item" v-for="(q, idx) in questions" :key="idx">{{ q.title }}</view>
          </picker-view-column>
        </picker-view>
      </view>
    </view>
  </view>
</template>

<script>
import { getQuestions, getMySoul, saveSoul } from '@/api/index.js'
import CustomNavBar from '../../components/custom-nav-bar.vue'

export default {
  components: {
    CustomNavBar
  },
  data() {
    return {
      questions: [],
      soulAnswers: [
        { question_id: '', question: '', answer: '' },
        { question_id: '', question: '', answer: '' },
        { question_id: '', question: '', answer: '' }
      ],
      pickerVisible: false,
      currentPickerIndex: 0,
      pickerValue: [0]
    };
  },
  onLoad() {
    this.loadQuestions();
    this.loadMySoul();
  },
  methods: {
    // 加载问题列表
    async loadQuestions() {
      try {
        const res = await getQuestions();
        this.questions = res.data.list || [];
      } catch (e) {
        console.error('加载问题失败', e);
      }
    },

    // 加载我的灵魂问答
    async loadMySoul() {
      try {
        const res = await getMySoul();
        const soul = res.data.soul || [];
        soul.forEach((item, index) => {
          if (index < 3) {
            this.soulAnswers[index] = {
              question_id: item.question_id,
              question: item.question,
              answer: item.answer
            };
          }
        });
      } catch (e) {
        console.error('加载灵魂问答失败', e);
      }
    },

    // 显示问题选择器
    showQuestionPicker(index) {
      this.currentPickerIndex = index;
      this.pickerVisible = true;
    },

    // 隐藏问题选择器
    hideQuestionPicker() {
      this.pickerVisible = false;
    },

    // 选择器变化
    pickerChange(e) {
      this.pickerValue = e.detail.value;
    },

    // 确认选择问题
    confirmQuestion() {
      const selectedIndex = this.pickerValue[0];
      const selectedQuestion = this.questions[selectedIndex];
      this.soulAnswers[this.currentPickerIndex] = {
        question_id: selectedQuestion.id,
        question: selectedQuestion.title,
        answer: this.soulAnswers[this.currentPickerIndex].answer
      };
      this.hideQuestionPicker();
    },

    // 保存灵魂问答
    async saveSoul() {
      // 验证是否所有问题都已选择和回答
      for (let i = 0; i < this.soulAnswers.length; i++) {
        if (!this.soulAnswers[i].question_id) {
          uni.showToast({
            title: `请选择灵魂${['一', '二', '三'][i]}问`,
            icon: 'none'
          });
          return;
        }
        if (!this.soulAnswers[i].answer || !this.soulAnswers[i].answer.trim()) {
          uni.showToast({
            title: `请回答灵魂${['一', '二', '三'][i]}问`,
            icon: 'none'
          });
          return;
        }
      }

      try {
        uni.showLoading({ title: '保存中...' });
        await saveSoul({ soul: this.soulAnswers });
        uni.hideLoading();
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (e) {
        uni.hideLoading();
        uni.showToast({
          title: e.msg || '保存失败',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.container {
  background: linear-gradient(180deg, #e2dfff61 0%, #FFFFFF 35%, #FFF 100%);
  min-height: 100vh;
  padding-bottom: 40rpx;
}

/* 导航栏占位 */
.nav-bar-placeholder {
  height: 150rpx;
}

.top-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.banner-text {
  flex: 1;
  /* margin-right: 20rpx; */
}

.banner-title {
  display: block;
  font-size: 40rpx;
  color: #4531D2;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.banner-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(69, 49, 210, 0.65);
  line-height: 1.5;
}

.banner-image {
  width: 250rpx;
  height: 250rpx;
}

.description {
  margin: 30rpx;
  padding: 20rpx;
  background-color: #FFF0F0;
  border-radius: 12rpx;
}

.description text {
  font-size: 28rpx;
  color: #FF3D58;
  line-height: 40rpx;
}

.question-section {
  margin: 30rpx;
}

.question-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.question-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.question-number {
  font-size: 28rpx;
  font-weight: bold;
  color: #000000;
}

.question-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25rpx 30rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.question-text {
  font-size: 28rpx;
  color: #333333;
  flex: 1;
}

.select-arrow {
  font-size: 20rpx;
  color: #999999;
}

.answer-title {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #000000;
  margin-bottom: 15rpx;
}

.answer-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.answer-input {
  width: 100%;
  height: 200rpx;
  padding: 25rpx 30rpx;
  border: 1rpx solid #E8E8E8;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333333;
  background-color: #F8F8F8;
  box-sizing: border-box;
  resize: none;
}

.save-btn {
  margin: 40rpx 30rpx;
  background-color: #8068F7;
  color: #FFFFFF;
  border: none;
  border-radius: 100rpx;
  padding: 20rpx 0;
  font-size: 32rpx;
  font-weight: bold;
  width: calc(100% - 60rpx);
}

.picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  pointer-events: auto;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
}

.picker-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.picker-content {
  width: 100%;
  background-color: #FFFFFF;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  position: relative;
  z-index: 10000;
  pointer-events: auto;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #E8E8E8;
}

.picker-cancel, .picker-confirm {
  font-size: 28rpx;
  color: #576B95;
  padding: 10rpx;
}

.picker-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.picker-view {
  height: 600rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}
</style>
