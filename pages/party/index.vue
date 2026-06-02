<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <!-- <custom-nav-bar title="线下活动" :isShowBack="true" backgroundImage="/static/bg3.png" fontColor="#6853F0" backgroundColor="#FFFFFF" /> -->
	<custom-nav-bar title="线下活动" :isShowBack="true" fontColor="#6853F0" backgroundColor="transparent" />

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

    <!-- 活动列表 -->
    <view class="activity-list">
      <view class="activity-item" v-for="(item, index) in activities" :key="index" @click="goPartyDetail(item.partyid)">
        <view class="activity-image-wrap">
          <view class="activity-image">
			<!-- <image :src="item.drawimg? item.drawimg : item.thumbimg" mode=""></image> -->
			<image :src="item.drawimg" mode="aspectFit" v-if="item.drawimg"></image>
			<image :src="item.thumbimg" mode="aspectFit" v-else-if="item.thumbimg"></image>
			<!-- todo: 当封面和缩略图都没有的时候，使用默认图 -->
<!-- 			<image :src="item.thumbimg" mode="aspectFit" v-else></image> -->
          </view>
        </view>
        <view class="activity-content">
          <text class="activity-title">{{ item.title }}</text>
          <text class="activity-title activity-subtitle">{{ item.sub_title ? item.sub_title :'--' }}</text>
          <view class="activity-tags">
            <text v-for="(tag, tIdx) in getTagList(item.tags)" :key="tIdx" class="info-tag">{{ tag }}</text>
          </view>
          <view class="activity-meta" v-if="item.begin_time">
			<text :class="['status-tag', item.state_text === '已报满' ? 'full' : 'open']">{{ item.state_text }}</text>
            <text class="meta-text">{{ item.begin_time ? item.begin_time : '--' }}</text>
          </view>
            <view :class="['action-btn', item.btnType]" @click="handleAction(item)" v-if="item.btnType === 'share'">
              <text class="share-icon">🔗</text>
              <text>{{ item.btnText }}</text>
            </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavBar from '../../components/custom-nav-bar.vue'
import { getPartyLists} from '@/api/index.js'

export default {
  components: { CustomNavBar },
  data() {
    return {
      currentCity: '深圳',
      cities: ['深圳', '北京', '上海', '广州', '杭州', '成都'],
      activities: [],
    }
  },
  methods: {
    showCityPicker() {
      uni.showActionSheet({
        itemList: this.cities,
        success: (res) => {
          this.currentCity = this.cities[res.tapIndex]
        }
      })
    },
    goMyActivity() {
      uni.showToast({ title: '我的活动功能开发中', icon: 'none' })
    },
    goService() {
	  // todo：
      uni.showToast({ title: '一对一服务了解中', icon: 'none' })
    },
    handleAction(item) {
      if (item.btnType === 'share') {
        uni.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        })
      } else if (item.btnType === 'join') {
        uni.showModal({
          title: '报名确认',
          content: `确认报名参加「${item.title}」？`,
          success: (res) => {
            if (res.confirm) {
              uni.showToast({ title: '报名成功', icon: 'success' })
            }
          }
        })
      } else {
        uni.showToast({ title: '查看活动详情', icon: 'none' })
      }
    },
    goPartyDetail(id){
      console.log('id:',id)
      uni.navigateTo({
        url: `/pages/party/detail?id=${id}`
      });
    },
    getTagList(tags) {                                           
      if (typeof tags === 'string') {                            
        return tags.split(',').map(t => t.trim()).filter(t => t) 
      }                                                          
      if (Array.isArray(tags)) {                                 
        return tags.map(t => String(t).trim()).filter(t => t)    
      }                                                          
      return []                                                  
    }     
  },

  async onShow() {
  	const res = await getPartyLists();
    console.log(res)
    if(res.code == 1){
      console.log(res.data.list)
      this.activities = res.data.list ? res.data.list :''
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
  height: 165rpx;
}

/* 活动列表 */
.activity-list {
  padding: 0 30rpx 40rpx;
}

.activity-item {
  display: flex;
  gap: 45rpx;
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

.image-text {
  font-size: 40rpx;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.activity-title {
  font-size: 31rpx;
  font-weight: bold;
  color: #333333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.activity-subtitle{
	font-size: 26rpx;
	color: #999999;
	font-weight: normal;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.activity-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.status-tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-weight: 500;
}

.status-tag.full {
  color: #FF4D4F;
  background-color: #FFF0F0;
}

.status-tag.open {
  color: #fff;
  background-color: #DFA6ED;
}

.info-tag {                                                    
    /* display: inline-block;                                       */
    /* padding: 6rpx 20rpx;                                         */
    /* margin-right: 12rpx;                                         */
    /* background-color: #f0f0f0;                                   */
    color: #7D6FF6;                                                
    font-size: 24rpx;                                           
    /* border-radius: 30rpx;                                        */
    /* line-height: 1;                                             */
	font-weight: 400;
	padding-right: 7rpx;
	border-right: 1px solid;
}  
.info-tag:last-child{
	border: 0;
}

.activity-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #999999;
  float: right;
}

/* 底部操作区 */
.activity-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

.join-info {
  flex: 1;
  min-width: 0;
}

.avatar-list {
  display: flex;
  margin-bottom: 8rpx;
}

.join-avatar-wrap {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  border: 2rpx solid #FFFFFF;
  margin-left: -10rpx;
  overflow: hidden;
  background-color: #F0F0F0;
}

.join-avatar-wrap:first-child {
  margin-left: 0;
}

.join-avatar {
  width: 100%;
  height: 100%;
}

.progress-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.progress-bar {
  width: 80rpx;
  height: 8rpx;
  background-color: #EEEEEE;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7B68EE 0%, #9B82FF 100%);
  border-radius: 4rpx;
}

.progress-text {
  font-size: 22rpx;
  color: #999999;
}

.action-btn {
  padding: 12rpx 32rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.action-btn.view,
.action-btn.join {
  background: linear-gradient(135deg, #7B68EE 0%, #9B82FF 100%);
  color: #FFFFFF;
}

.action-btn.share {
  background-color: #FFFFFF;
  color: #666666;
  border: 2rpx solid #E8E8E8;
}

.share-icon {
  font-size: 24rpx;
}
</style>
