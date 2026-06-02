<template>
  <view class="container">
    <!-- 资料完善弹窗 -->
    <profile-check-modal
      :visible="showProfileModal"
      :percent="profilePercent"
      :missing-fields="profileMissingFields"
      @confirm="onProfileGuide"
      @dismiss="onProfileDismiss"
    />

    <!-- 筛选弹窗 -->
    <filter-modal
      :visible="showFilterModal"
      :filter="filterDisplayData"
      @confirm="onFilterConfirm"
      @dismiss="showFilterModal = false"
    />

    <!-- 加群二维码弹窗 -->
    <qrcode-modal
      :visible="showQrcodeModal"
      :qrcodeUrl="groupQrcode"
      title="告白时刻Daily公众号"
      @close="showQrcodeModal = false"
    />

    <!-- VIP支付弹窗 -->
    <vip-popup
      :visible="showVipPopup"
      @close="showVipPopup = false"
      @pay="handleVipPay"
    />

    <!-- 顶部标题栏 -->
    <custom-nav-bar
      title="单身库"
      :isShowBack="false"
      backgroundImage="/static/bg4.png"
    />

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

    <!-- 顶部轮播图 -->
    <swiper
      class="banner"
      :current="bannerCurrent"
      :duration="300"
      @animationfinish="onBannerAnimationFinish"
      @touchstart="onBannerTouchStart"
      @touchend="onBannerTouchEnd"
      v-if="displayBanners.length > 0"
    >
      <swiper-item v-for="(banner, index) in displayBanners" :key="index">
        <view class="banner-item">
          <image :src="banner.image" mode="aspectFill"></image>
        </view>
      </swiper-item>
    </swiper>

    <!-- 自定义指示器 -->
    <view class="banner-dots" v-if="banners.length > 1">
      <view
        v-for="(item, index) in banners"
        :key="index"
        class="dot"
        :class="{ active: bannerRealIndex === index }"
      ></view>
    </view>
    

    <!-- 筛选标签 -->
    <view class="filter-tabs">
		<view class="" style="display: flex;">
			<view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">女嘉宾</view>
			<view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">男嘉宾</view>
			<!-- <view class="tab-item" :class="{ active: currentTab === 2 }" @click="switchTab(3)">线下脱单</view> -->
		</view>
     
     <!-- <view class="tab-item" :class="{ active: currentTab === 2 }" @click="switchTab(2)">已脱单</view> -->
    
	
	
	  <view class="">
	  	<image class="filter-icon" src="/static/Frame (2).png" mode="aspectFit" @click="showFilterModal = true" v-if="currentTab !== 2"></image>
	  </view>
    </view>

    <!-- 单身用户卡片列表 -->
    <view class="user-list" v-if="currentTab !== 2">
      <view class="li-item" v-for="(user, index) in users" :key="user.id" @click="goUserDetail(user.id)">
        <view style="position: relative;">
          <!-- 骨架屏占位 -->
          <view class="img-skeleton" v-if="!loadedImages[user.id]"></view>
          <image
            class="header-img"
            :class="{ 'img-loaded': loadedImages[user.id], 'img-error': errorImages[user.id] }"
            :src="errorImages[user.id] ? '' : user.avatar"
            mode="aspectFill"
            lazy-load
            @load="onImageLoad(user.id)"
            @error="onImageError(user.id)"
          ></image>
          <view class="age-tag">{{ user.age }}岁</view>
        </view>
        <view class="user-info">
          <view class="user-name">
            <text>{{ user.nickname || '匿名用户' }}</text>
            <image class="gender-icon" :src="user.gender === 1 ? '/static/m.png' : '/static/wm.png'" mode="aspectFit"></image>
          </view>
          <view class="user-city">{{ user.city_t }}</view>
          <view class="user-tags" v-if="user.tags && user.tags.length > 0">
            <text v-for="(tag, idx) in user.tags.slice(0, 3)" :key="idx">{{ tag }}</text>
          </view>
          <view class="user-tags" v-else-if="user.education">
            <text>{{ user.education }}</text>
          </view>
        </view>
      </view>

      <!-- 解锁全部嘉宾卡片 -->
      <view class="extra-list" v-if="showUnlock" @click="handleUnlockClick">
        <!-- 模糊头像预览 -->
        <view class="headers" v-if="extraUsers.length > 0">
          <view
            v-for="(user, idx) in extraUsers.slice(0, 5)"
            :key="idx"
            class="header-img-parent">
            <image
              :src="user.avatar + '?imageView2/1/w/80/h/80/q/50'"
              class="header-img-blur"
              mode="aspectFill"
            />
          </view>
        </view>

        <!-- 解锁按钮 -->
        <view class="unlock-btn-wrapper">
          <text class="unlock-btn-text">解锁全部嘉宾</text>
        </view>
      </view>
    </view>

    <!-- 已脱单案例列表 -->
    <view class="couple-list" v-if="currentTab === 2">
      <view class="couple-card" v-for="(item, index) in coupleList" :key="index">
        <view class="couple-avatar">
          <image class="avatar-blur" :src="item.avatar" mode="aspectFill"></image>
        </view>
        <view class="couple-info">
          <text class="couple-name">{{ item.name }}</text>
          <view class="couple-detail">
            <text>注册时间: {{ item.register_date }}</text>
          </view>
          <view class="couple-detail">
            <text>脱单时间: {{ item.success_date }}</text>
          </view>
          <view class="couple-detail">
            <text>脱单方式: {{ item.matched_way }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore" @click="loadMore">
      <text>{{ loading ? '加载中...' : '加载更多' }}</text>
    </view>

    <!-- 无数据提示 -->
    <view class="empty" v-if="!loading && currentList.length === 0">
      <text>暂无数据</text>
    </view>
  </view>
</template>

<script>
import { getUserList, getBanners, getCoupleList } from '@/api/index.js'
import { profileCheckMixin } from '@/utils/profileCheck.js'
import ProfileCheckModal from '@/components/profile-check-modal.vue'
import FilterModal from '@/components/filter-modal.vue'
import QrcodeModal from '@/components/qrcode-modal.vue'
import VipPopup from '@/components/vip-popup.vue'
import CustomNavBar from '../../components/custom-nav-bar.vue'

export default {
  components: {
    ProfileCheckModal,
    FilterModal,
    QrcodeModal,
    VipPopup,
    CustomNavBar
  },
  mixins: [profileCheckMixin],
  data() {
    return {
      banners: [],
      displayBanners: [],
      bannerCurrent: 0,
      bannerRealIndex: 0,
      bannerTimer: null,
      users: [],
      coupleList: [],
      currentTab: 0, // 0=女嘉宾, 1=男嘉宾, 2=已脱单
      page: 1,
      limit: 12,
      total: 0,
      loading: false,
      hasMore: true,
      showFilterModal: false,
      filterParams: {}, // 当前使用的筛选参数（后端API格式）
      filterDisplayData: { ageRange: '', heightRange: '', education: '', city: '' }, // 前端格式筛选参数（用于弹窗显示）
      showQrcodeModal: false,
      groupQrcode: '/static/images/qrcode.png', // 公众号二维码图片
      isVip: false, // 是否VIP
      showUnlock: false, // 是否显示解锁卡片
      extraUsers: [], // 额外的模糊用户列表
      showVipPopup: false, // 显示VIP支付弹窗
      loadedImages: {}, // 图片加载状态跟踪
      errorImages: {} // 图片加载失败状态跟踪
    };
  },
  computed: {
    currentList() {
      return this.currentTab === 2 ? this.coupleList : this.users;
    }
  },
  onLoad() {
    this.initTabByGender(); // 判断当前用户展示异性嘉宾
    this.loadBanners();
    this.loadUsers();
  },
  onShow() {
    this.startBannerAutoplay();
    this.checkProfileCompletion();
  },
  onHide() {
    this.stopBannerAutoplay();
  },
  onPullDownRefresh() {
    this.page = 1;
    this.hasMore = true;
    if (this.currentTab === 2) {
      this.coupleList = [];
      this.loadCoupleList().then(() => {
        uni.stopPullDownRefresh();
      });
    } else {
      this.users = [];
      this.loadUsers().then(() => {
        uni.stopPullDownRefresh();
      });
    }
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore();
    }
  },
  methods: {
    // 根据当前用户性别初始化默认Tab：展示异性嘉宾
    initTabByGender() {
      const userinfo = uni.getStorageSync('userinfo') || {}
      const userGender = Number(userinfo.gender)
      if (userGender === 2) {
        this.currentTab = 1 // 女性用户默认看男嘉宾
      } else if (userGender === 1) {
        this.currentTab = 0 // 男性用户默认看女嘉宾
      }
    },

    // 加载Banner
    async loadBanners() {
      try {
        const res = await getBanners('single');
        this.banners = res.data.list || [];
        this.buildDisplayBanners();
      } catch (e) {
        console.error('加载Banner失败', e);
      }
    },

    // 构建首尾复制的轮播数组，实现无缝衔接
    buildDisplayBanners() {
      if (this.banners.length <= 1) {
        this.displayBanners = this.banners;
        this.bannerCurrent = 0;
        this.bannerRealIndex = 0;
        return;
      }
      const first = this.banners[0];
      const last = this.banners[this.banners.length - 1];
      this.displayBanners = [last, ...this.banners, first];
      this.bannerCurrent = 1;
      this.bannerRealIndex = 0;
    },

    // 轮播动画结束：处理首尾复制边界的静默跳转
    onBannerAnimationFinish(e) {
      const current = e.detail.current;
      const len = this.displayBanners.length;
      const realLen = this.banners.length;
      if (realLen <= 1) return;

      if (current === len - 1) {
        // 滑到末尾复制的第一张，静默跳回真正的第一张
        this.bannerCurrent = 1;
        this.bannerRealIndex = 0;
      } else if (current === 0) {
        // 滑到开头复制的最后一张，静默跳回真正的最后一张
        this.bannerCurrent = len - 2;
        this.bannerRealIndex = realLen - 1;
      } else {
        this.bannerRealIndex = current - 1;
      }
    },

    // 启动自动轮播
    startBannerAutoplay() {
      this.stopBannerAutoplay();
      if (this.banners.length <= 1) return;
      this.bannerTimer = setInterval(() => {
        let next = this.bannerCurrent + 1;
        if (next >= this.displayBanners.length) {
          next = 0;
        }
        this.bannerCurrent = next;
      }, 3000);
    },

    // 停止自动轮播
    stopBannerAutoplay() {
      if (this.bannerTimer) {
        clearInterval(this.bannerTimer);
        this.bannerTimer = null;
      }
    },

    // 触摸轮播时暂停自动播放
    onBannerTouchStart() {
      this.stopBannerAutoplay();
    },

    // 触摸结束后恢复自动播放
    onBannerTouchEnd() {
      this.startBannerAutoplay();
    },

    // 加载用户列表（备份原方法）
    async loadUsers() {
      if (this.loading) return;

      this.loading = true;
      try { 
        const params = {
          gender: this.currentTab === 0 ? 2 : 1,
          is_single: 1,
          page: this.page,
          limit: this.isVip ? 20 : 6, // VIP用户加载20个，非VIP加载15个
          ...this.filterParams
        };
        const res = await getUserList(params);

        const list = res.data.list || [];

        if (this.page === 1) {
          // 非VIP用户：前14个正常显示，后面的作为模糊预览
          if (!this.isVip && list.length > 14) {
            this.users = list.slice(0, 14);
            this.extraUsers = list.slice(14, 19); // 最多5个模糊头像
          } else {
            this.users = list;
            this.extraUsers = [];
          }
        } else {
          this.users = [...this.users, ...list];
        }

        this.total = res.data.total;
        this.isVip = res.data.is_vip || false;
        this.showUnlock = res.data.show_unlock || false;
        this.hasMore = this.users.length < this.total;
      } catch (e) {
        console.error('加载用户列表失败', e);
      } finally {
        this.loading = false;
      }
    },

    // 重构加载用户列表（仅展示6条）
    // async loadUsers() {
    //   if (this.loading) return;

    //   this.loading = true;
    //   try {
    //     const params = {
    //       gender: this.currentTab === 0 ? 2 : 1,
    //       is_single: 1,
    //       ...this.filterParams
    //     };
    //     const res = await getUserList(params);

    //     const list = res.data.list || [];
    //     // 仅展示前6条数据
    //     this.users = list.slice(0, 6);
    //     this.hasMore = false;
    //   } catch (e) {
    //     console.error('加载用户列表失败', e);
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    // 加载已脱单案例列表
    async loadCoupleList() {
      if (this.loading) return;

      this.loading = true;
      try {
        const res = await getCoupleList({
          page: this.page,
          limit: this.limit
        });

        const list = res.data.list || [];

        if (this.page === 1) {
          this.coupleList = list;
        } else {
          this.coupleList = [...this.coupleList, ...list];
        }

        this.total = res.data.total;
        this.hasMore = this.coupleList.length < this.total;
      } catch (e) {
        console.error('加载脱单案例失败', e);
      } finally {
        this.loading = false;
      }
    },

    // 加载更多
    loadMore() {
      if (!this.hasMore || this.loading) return;
      this.page++;
      if (this.currentTab === 2) {
        this.loadCoupleList();
      } else {
        this.loadUsers();
      }
    },

    // 切换Tab
    switchTab(tab) {
		if(tab === 3){
			uni.navigateTo({
				url:'/pages/action/index'
			})
					
			return;
		}
		
      if (this.currentTab === tab) return;

      this.currentTab = tab;
      this.page = 1;
      this.hasMore = true;

      if (tab === 2) {
        this.coupleList = [];
        this.loadCoupleList();
      } else {
        // 切换Tab时保持筛选参数不变
        this.users = [];
        this.loadUsers();
      }
    },

    // 筛选确认
    onFilterConfirm(params) {
      // 转换筛选参数为后端API格式
      const apiParams = {};

      // 年龄范围转换 (例如: "18-25" -> age_min: 18, age_max: 25)
      if (params.ageRange) {
        const [min, max] = params.ageRange.split('-');
        if (min) apiParams.age_min = parseInt(min);
        if (max) apiParams.age_max = parseInt(max);
      }

      // 身高范围转换 (例如: "160-170" -> height_min: 160, height_max: 170)
      if (params.heightRange) {
        const [min, max] = params.heightRange.split('-');
        if (min) apiParams.height_min = parseInt(min);
        if (max) apiParams.height_max = parseInt(max);
      }

      // 学历直接传递
      if (params.education) {
        apiParams.education = params.education;
      }

      // 城市直接传递
      if (params.city) {
        apiParams.city = params.city;
      }

      this.filterParams = apiParams;
      this.filterDisplayData = { ...params }; // 保存前端格式筛选参数用于弹窗显示
      this.showFilterModal = false;
      this.page = 1;
      this.users = [];
      this.hasMore = true;
      this.loadUsers();
    },

    // 跳转用户详情
    goUserDetail(userId) {
      uni.navigateTo({
        url: `/pages/user/detail?user_id=${userId}`
      });
    },

    // 加入交友群
    joinGroup() {
      uni.navigateTo({
        url: '/pages/group/index'
      });
    },

    // 获取标签样式
    getTagClass(tag) {
      if (tag.includes('cm')) {
        return 'tag-height';
      } else if (tag.includes('本科') || tag.includes('硕士') || tag.includes('专科') || tag.includes('985') || tag.includes('211')) {
        return 'tag-education';
      } else if (tag.includes('有房') || tag.includes('有车')) {
        return 'tag-property';
      } else if (tag.includes('万')) {
        return 'tag-income';
      } else {
        return 'tag-other';
      }
    },

    // 跳转VIP页面
    goVipPage() {
      uni.navigateTo({
        url: '/pages/vip/index'
      });
    },

    // 点击解锁按钮
    handleUnlockClick() {
      // 显示VIP支付弹窗
      this.showVipPopup = true;
    },

    // 处理VIP支付
    async handleVipPay(packageInfo) {
      uni.showLoading({ title: '正在创建订单...' });

      try {
        const { createOrder, wxPay } = await import('@/api/index.js');

        // 创建订单
        const orderRes = await createOrder({
          type: 'vip',
          package_id: packageInfo.type,
          duration: packageInfo.monthCount,
          amount: packageInfo.value
        });

        uni.hideLoading();

        // 获取支付参数
        const payRes = await wxPay({
          order_id: orderRes.data.order_id
        });

        // 小红书小程序支付
        // #ifdef MP-XHS
        xhs.requestOrderPayment({
          orderInfo: payRes.data.orderInfo || payRes.data,
          success: () => {
            uni.showToast({ title: '开通成功', icon: 'success' });
            this.showVipPopup = false;
            this.page = 1;
            this.users = [];
            this.loadUsers();
          },
          fail: (err) => {
            console.error('支付失败', err);
            uni.showToast({ title: '支付取消', icon: 'none' });
          }
        });
        // #endif

        // 微信小程序支付
        // #ifdef MP-WEIXIN
        uni.requestPayment({
          provider: 'wxpay',
          timeStamp: payRes.data.timeStamp,
          nonceStr: payRes.data.nonceStr,
          package: payRes.data.package,
          signType: payRes.data.signType,
          paySign: payRes.data.paySign,
          success: () => {
            uni.showToast({ title: '开通成功', icon: 'success' });
            this.showVipPopup = false;
            this.page = 1;
            this.users = [];
            this.loadUsers();
          },
          fail: (err) => {
            console.error('支付失败', err);
            uni.showToast({ title: '支付取消', icon: 'none' });
          }
        });
        // #endif
      } catch (e) {
        uni.hideLoading();
        uni.showToast({
          title: e.msg || '创建订单失败',
          icon: 'none'
        });
      }
    },

    // 图片加载完成
    onImageLoad(userId) {
      this.loadedImages[userId] = true;
    },

    // 图片加载失败，显示默认占位背景
    onImageError(userId) {
      this.errorImages[userId] = true;
      this.loadedImages[userId] = true;
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
/* 定义状态栏高度变量 */
:root {
  --status-bar-height: 0px;
}

.container {
  /* background-image: url('/static/bg1.png'); */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  /* padding-bottom: 120rpx; */
  position: relative;
  z-index: 0;
}

/* 导航栏占位 */
.nav-bar-placeholder {
  height: 165rpx;
}



/* 顶部轮播图 */
.banner {
  width: 100%;
  height: 300rpx;
  margin-bottom: 40rpx;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 300rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.banner-item image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.banner-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 60rpx;
  color: #FFFFFF;
  text-align: left;
}

.banner-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.banner-subtitle {
  font-size: 28rpx;
  margin-bottom: 30rpx;
  display: block;
}

.join-btn {
  background-color: #FF4D4F;
  color: #FFFFFF;
  border: none;
  border-radius: 32rpx;
  padding: 0rpx 24rpx;
  font-size: 24rpx;
  width: auto;
}

/* 自定义指示器 */
.banner-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  margin-top: -30rpx;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 10;
}

.banner-dots .dot {
  width: 16rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background-color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
}

.banner-dots .dot.active {
  width: 32rpx;
  background-color: #FFFFFF;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* background-color: #FFFFFF; */
  padding: 0 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  overflow-x: auto;
}

.tab-item {
  font-size: 28rpx;
  padding: 16rpx 24rpx;
  margin-right: 30rpx;
  color: #666666;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-item.active {
  font-size: 30rpx;
  font-weight: bold;
  /* color: #FF4D4F; */
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 100rpx;
  height: 8rpx;
  background-color: #8f4dffa8;
  border-radius: 2rpx;
}

.filter-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  border: 2rpx solid #E8E8E8;
  border-radius: 50rpx;
  padding: 0rpx;
  width: 70rpx;
  height: 70rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
}

.filter-icon {
  width: 32rpx;
  height: 32rpx;
}

/* 用户卡片列表 */
.user-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  padding: 30rpx 50rpx;
  background-color: #FFFFFF;
}

/* 用户卡片 */
.li-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20rpx;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.header-img {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx 12rpx 0 0;
  margin-bottom: 0;
  position: relative;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.header-img.img-loaded {
  opacity: 1;
}

.header-img.img-error {
  opacity: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 骨架屏占位 */
.img-skeleton {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx 12rpx 0 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.age-tag {
  position: absolute;
  top: 0rpx;
  right: 0rpx;
  background-color: #9370DB;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 0 20rpx 0 20rpx;
  z-index: 1;
}

.user-info {
  padding: 20rpx;
}

.user-name {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.gender-icon {
  width: 32rpx;
  height: 32rpx;
  margin-left: 10rpx;
}

.user-city {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

/* 标签样式 */
.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.user-tags text {
  background: #DEE4FF;
  color: #384582;
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 16rpx;
  white-space: nowrap;
}

.education {
  font-size: 26rpx;
  color: #6E6E6E;
  text-align: center;
  width: 180rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 解锁全部嘉宾 */
.extra-list {
  grid-column: span 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  width: 100%;
}

/* 模糊头像预览 */
.headers {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10rpx;
}

.header-img-parent {
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background-color: white;
  margin-right: -16rpx;
  padding: 4rpx;
  border: 2rpx solid white;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header-img-blur {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  filter: blur(8px);
  will-change: filter;
}

/* 解锁按钮 */
.unlock-btn-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 260rpx;
  height: 80rpx;
  border-radius: 46rpx;
  margin-top: 30rpx;
  margin-bottom: 40rpx;
  border: 2rpx solid rgba(250, 115, 29, 0.2);
  background-color: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.unlock-btn-wrapper:active {
  background-color: rgba(250, 115, 29, 0.1);
  transform: scale(0.98);
  border-color: rgba(250, 115, 29, 0.4);
}

.unlock-btn-text {
  color: #FA731D;
  font-size: 28rpx;
  font-weight: 500;
}

/* 已脱单案例列表 */
.couple-list {
  padding: 0 50rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
}

.couple-card {
  width: 310rpx;
  background-color: #F9F9F9;
  border-radius: 20rpx;
  padding: 30rpx 20rpx 38rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30rpx;
  box-sizing: border-box;
}

.couple-avatar {
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 28rpx;
}

.avatar-blur {
  width: 180rpx;
  height: 180rpx;
  border-radius: 90rpx;
  filter: blur(6rpx);
}

.couple-info {
  text-align: center;
  width: 100%;
}

.couple-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #131313;
  display: block;
  margin-bottom: 20rpx;
  max-width: 270rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.couple-detail {
  font-size: 26rpx;
  color: #6E6E6E;
  margin-bottom: 20rpx;
  text-align: left;
  margin-left: 20rpx;
}

.couple-detail:last-child {
  margin-bottom: 0;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 40rpx;
  color: #999999;
}

/* 空状态 */
.empty {
  text-align: center;
  padding: 100rpx;
  color: #999999;
}

/* 解锁全部嘉宾卡片 */
.unlock-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.unlock-card:active {
  transform: scale(0.98);
}

.unlock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20rpx;
}

.unlock-icon {
  font-size: 60rpx;
  margin-bottom: 15rpx;
  animation: shake 2s infinite;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

.unlock-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 10rpx;
}

.unlock-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}
</style>
