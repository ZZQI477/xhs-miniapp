<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <custom-nav-bar title="成功案例" :isShowBack="true" fontColor="#6853F0" backgroundColor="transparent" />
    <!-- <custom-nav-bar title="成功案例" :isShowBack="true" backgroundImage="https://minixhs.chugao520.com/makefriends/bg3.png" fontColor="#6853F0" backgroundColor="transparent" /> -->

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>


    <!-- 活动列表 -->
    <view class="activity-list">
      <view class="activity-item" v-for="(item, index) in casesList" :key="index" @click="toCasesDetail(item.caseid)">
        <view class="activity-image-wrap">
          <view class="activity-image" >
			<!-- <image :src="item.drawimg? item.drawimg : item.thumbimg" mode=""></image> -->
			<image :src="item.drawimg" mode="aspectFit" v-if="item.drawimg"></image>
			<image :src="item.thumbimg" mode="aspectFit" v-else-if="item.thumbimg"></image>
			<!-- todo: 当封面和缩略图都没有的时候，使用默认图 -->
			<!-- <image :src="item.thumbimg" mode="aspectFit" v-else></image> -->
          </view>
        </view>
        <view class="activity-content">
          <text class="activity-title">{{ item.title }}</text>
          <view class="activity-note">
            <text class="">{{ item.sub_title }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavBar from '../../components/custom-nav-bar.vue'
import {getCasesLists } from '@/api/index.js'

export default {
  components: { CustomNavBar },
  data() {
    return {
      currentCity: '深圳',
      cities: ['深圳', '北京', '上海', '广州', '杭州', '成都'],
      casesList: []
    }
  },
  methods: {
	  toCasesDetail(id){
	    console.log('id:',id)
	    uni.navigateTo({
	      url: `/pages/cases/detail?id=${id}`
	    });
	  },
  },
  async onShow() {
  	const res = await getCasesLists();
    console.log(res)
    if(res.code == 1){
      console.log(res.data.list)
      this.casesList = res.data.list ? res.data.list :''
    }
  }
}
</script>

<style scoped>
.container {
  /* background-color: #F8F8F8; */
  background-color: #dedeff;
  min-height: 100vh;
}

.nav-bar-placeholder {
  /* height: 165rpx; */
  height: 175rpx;
}


/* 活动列表 */
.activity-list {
  padding: 0 30rpx 40rpx;
}

.activity-item {
  display: flex;
  gap: 45rpx;
  /* background-color: #FFFFFF; */
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 1px #fff, 0 2px 1px #33333;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  align-items: center;
  height: 194rpx;
}

.activity-image-wrap {
  flex-shrink: 0;
}

.activity-image {
  width: 204rpx;
  height: 204rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  height: 170rpx;
}

.activity-title {
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 80rpx;
  font-family: PingFangSC, PingFang SC;
  font-weight: bold;
  font-size: 30rpx;
  color: #333333;
}

.activity-note {
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  font-family: PingFangSC, PingFang SC;
  font-weight: 400;
  font-size: 25rpx;
  color: #999999;
}
</style>
