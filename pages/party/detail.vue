<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <!-- <custom-nav-bar title="活动详情" :isShowBack="true" backgroundImage="https://minixhs.chugao520.com/makefriends/bg3.png" fontColor="#6853F0" backgroundColor="#FFFFFF" /> -->
	<custom-nav-bar title="活动详情" :isShowBack="true" fontColor="#6853F0" backgroundColor="transparent" />

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

	<view>
		  <rich-text :nodes="content"></rich-text>
	</view>

  </view>
</template>

<script>
import CustomNavBar from '../../components/custom-nav-bar.vue'
import {getPartyDetail } from '@/api/index.js'
import utils_config from "../../utils/config.js"

export default {
  components: { CustomNavBar },
  data() {
    return {
      noteInfo: {},
	  content:'',
    }
  },
  methods: {},

  async onLoad(options) {
    const res = await getPartyDetail(options.id);
    console.log(res)
    if(res.code == 1){
    	this.noteInfo = res.data ? res.data :''
		  const IMG_DOMAIN = utils_config.curlRef;
		  this.content = res.data.content.replace(/<img([^>]+)src="([^"]+)"/g, (m, p1, src) => `<img${p1}src="${IMG_DOMAIN}${src}"`);
    }
  },
}
</script>

<style scoped>
.container {
  background-color: #dedeff;
  min-height: 100vh;
}
.nav-bar-placeholder {
    height: 165rpx;
}
</style>
