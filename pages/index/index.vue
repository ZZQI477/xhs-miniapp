<template>
  <view class="container">
    <!-- 资料完善弹窗 -->
    <center-modal
      :visible="showCenterModal"
      :title="centerModalTitle"
      :content="centerModalContent"
      :confirm-text="centerModalConfirmText"
      :cancel-text="centerModalCancelText"
      @confirm="onCenterModalConfirm"
      @cancel="onCenterModalCancel"
    />
	
	// 来电提示弹框
	<uni-popup ref="popup" type="message">
		<uni-popup-message type="success" message="成功消息" :duration="2000"></uni-popup-message>
	</uni-popup>

    <!-- 顶部标题栏 -->
    <custom-nav-bar
      backgroundImage="https://minixhs.chugao520.com/makefriends/bg3.png"
      fontColor="#6853F0"
      :isShowLeft="false"
      :isShowRight="false"
    >
      <template #default>
        <text style="text-align: left; width: 100%; padding-left: 20rpx;">告白时刻Daily</text>
      </template>
    </custom-nav-bar>

    <!-- 导航栏占位 -->
    <view class="nav-bar-placeholder"></view>

    <!-- 加载中 -->
    <view class="loading-container" v-if="loading && users.length === 0">
      <image src="https://minixhs.chugao520.com/makefriends/images/empty.png" class="loading-icon" mode="aspectFit"></image>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 卡片滑动区域 -->
    <swiper
      v-if="users.length > 0"
      class="card-swiper"
      :current="currentIndex"
      :duration="300"
      :circular="false"
      :vertical="false"
      :autoplay="false"
      @change="onCardSwiperChange"
      @animationfinish="onCardSwiperAnimationFinish"
    >
      <swiper-item
          v-for="(user, index) in users"
          :key="user.id || index"
          class="card-swiper-slide"
        >
        <scroll-view
          class="card-scroll"
          scroll-y
          enable-flex
          enhanced
          show-scrollbar="false"
        >
          <view class="user-card">
            <!-- 背景图 + 个人信息区域 -->
            <view class="card-header">
              <image class="header-bg" :src="user.avatar" mode="aspectFill"></image>
              <view class="header-overlay"></view>
              <view class="user-basic">
                <view class="name-row">
                  <text class="nickname">{{ user.nickname }}</text>
                  <image class="gender-icon" :src="user.gender === 1 ? 'https://minixhs.chugao520.com/makefriends/m.png' : 'https://minixhs.chugao520.com/makefriends/wm.png'" mode="aspectFit"></image>
                  <image
                    v-if="user.is_vip"
                    class="vip-badge-small"
                    src="https://minixhs.chugao520.com/makefriends/images/vip-badge.png"
                    mode="aspectFit"
                  ></image>
                </view>
                <view class="info-row">
                  <text class="info-text">{{ user.age }}岁</text>
                  <text class="info-separator" v-if="user.age && (user.height || user.education)">·</text>
                  <text class="info-text" v-if="user.height">{{ user.height }}cm</text>
                  <text class="info-separator" v-if="user.height && user.education">·</text>
                  <text class="info-text" v-if="user.education">{{ user.education }}</text>
                </view>
              </view>
            </view>

            <!-- 认证信息 -->
            <view class="section cert-section" v-if="user.is_verified || user.is_realface || user.is_education">
			  <view class="section-title">
			    <image class="section-icon" src="https://minixhs.chugao520.com/makefriends/Frame(2).png" mode="aspectFit"></image>
			    <text>认证信息</text>
			  </view>
              <view class="cert-list">
                <view class="cert-item" v-if="user.is_verified">
                  <image class="cert-icon" src="https://minixhs.chugao520.com/makefriends/images/identify-id-green.png" mode="aspectFit"></image>
                  <text class="cert-text">实名认证</text>
                </view>
                <view class="cert-item" v-if="user.is_realface">
                  <image class="cert-icon" src="https://minixhs.chugao520.com/makefriends/images/identify-real-blue.png" mode="aspectFit"></image>
                  <text class="cert-text">真人认证</text>
                </view>
                <view class="cert-item" v-if="user.is_education">
                  <text class="cert-emoji">🎓</text>
                  <text class="cert-text">学历认证</text>
                </view>
              </view>
            </view>

            <!-- 自我介绍 -->
            <view class="section" v-if="user.intro">
              <view class="section-title">
                <image class="section-icon" src="https://minixhs.chugao520.com/makefriends/Frame (3).png" mode="aspectFit"></image>
                <text>自我介绍</text>
              </view>
              <text class="intro-text">{{ user.intro }}</text>
            </view>

            <!-- 个人标签 -->
            <view class="section" v-if="user.my_tags && user.my_tags.length > 0">
              <view class="section-title">
                <image class="section-icon" src="https://minixhs.chugao520.com/makefriends/Frame(7).png" mode="aspectFit"></image>
                <text>个人标签</text>
              </view>
              <view class="tags-wrap">
                <text class="tag" v-for="(tag, idx) in filterTags(user.my_tags)" :key="idx">{{ tag }}</text>
              </view>
            </view>

            <!-- 详细信息 -->
            <view class="section">
              <view class="section-title">
                <image class="section-icon" src="https://minixhs.chugao520.com/makefriends/Frame(2).png" mode="aspectFit"></image>
                <text>详细信息</text>
              </view>
              <view class="detail-grid">
                <view class="detail-item" v-if="user.job">
                  <text class="detail-label">职业</text>
                  <text class="detail-value">{{ user.job }}</text>
                </view>
                <view class="detail-item" v-if="user.company">
                  <text class="detail-label">公司</text>
                  <text class="detail-value">{{ user.company }}</text>
                </view>
                <view class="detail-item" v-if="user.school">
                  <text class="detail-label">学校</text>
                  <text class="detail-value">{{ user.school }}</text>
                </view>
                <view class="detail-item" v-if="user.hometown_city">
                  <text class="detail-label">家乡</text>
                  <text class="detail-value">{{ user.hometown_province_t }}{{ user.hometown_city_t }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">有车</text>
                  <text class="detail-value">{{ user.has_car ? '是' : '否' }}</text>
                </view>
                <view class="detail-item">
                  <text class="detail-label">有房</text>
                  <text class="detail-value">{{ user.has_house ? '是' : '否' }}</text>
                </view>
              </view>
            </view>

            <!-- 照片墙 -->
            <view class="section" v-if="user.images && user.images.length > 0">
              <view class="section-title">
                <image class="section-icon" src="https://minixhs.chugao520.com/makefriends/Frame(3).png" mode="aspectFit"></image>
                <text>我的照片</text>
              </view>
              <view class="photo-grid">
                <image
                  class="photo-item"
                  v-for="(img, idx) in user.images"
                  :key="idx"
                  :src="img"
                  mode="aspectFill"
                  @click="previewImages(user.images, idx)"
                ></image>
              </view>
            </view>

            <!-- 灵魂问答 -->
            <view class="section" v-if="user.soul_answers && user.soul_answers.length > 0">
              <view class="section-title">灵魂问答</view>
              <view class="soul-list">
                <view class="soul-item" v-for="(item, idx) in user.soul_answers" :key="idx">
                  <text class="soul-q">Q: {{ item.question }}</text>
                  <text class="soul-a">A: {{ item.answer }}</text>
                </view>
              </view>
            </view>

            <!-- 理想对象 -->
            <view class="section" v-if="user.ideal_intro || (user.ideal_tags && user.ideal_tags.length > 0)">
              <view class="section-title">
                <image class="section-icon" src="https://minixhs.chugao520.com/makefriends/Frame(4).png" mode="aspectFit"></image>
                <text>理想对象</text>
              </view>
              <text class="intro-text" v-if="user.ideal_intro">{{ user.ideal_intro }}</text>
              <view class="tags-wrap" v-if="filterTags(user.ideal_tags).length > 0">
                <text class="tag " v-for="(tag, idx) in filterTags(user.ideal_tags)" :key="idx">{{ tag }}</text>
              </view>
            </view>
			
			<!-- 温馨提示 -->
            <view class="section">
              <view class="section-title color-999 section-note">
                <text>温馨提示</text>
              </view>
              <text class="intro-text color-999 section-notetitle">本文内容由嘉宾个人提供，平台已对嘉宾信息进行核实，但无法保证100%真实，交友过程注意风险。
			  </text>
            </view>

            <!-- 底部占位 -->
            <view class="card-footer" v-if="!hasEnoughContent"></view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>

    <!-- 空状态 -->
    <view class="empty-container" v-if="!loading && users.length === 0">
      <image src="https://minixhs.chugao520.com/makefriends/images/empty.png" class="empty-icon" mode="aspectFit"></image>
      <text class="empty-text">暂无推荐用户</text>
      <button class="refresh-btn" @click="loadRecommendList">刷新试试</button>
    </view>

    <!-- 右侧功能栏 -->
    <view class="side-actions" v-if="users.length > 0 && currentUser">
      <view class="action-item" @click="handleFollow">
          <view class="action-icon-wrap" :class="{ active: currentUser.is_followed }">
            <image :src="currentUser.is_followed ? 'https://minixhs.chugao520.com/makefriends/ygz.png' : 'https://minixhs.chugao520.com/makefriends/Frame 1420074377.png'" class="action-icon" mode="aspectFit"></image>
          </view>
          <!-- <text class="action-label">{{ currentUser.is_followed ? '关注' : '已关注' }}</text> -->
        </view>

      <view class="action-item" @click="handleContact">
        <view class="action-icon-wrap">
          <image src="https://minixhs.chugao520.com/makefriends/Frame 1420074379.png" class="action-icon" mode="aspectFit"></image>
        </view>
        <!-- <text class="action-label">联系</text> -->
      </view>
      
      <view class="action-item">
        <button
          class="service-button"
          open-type="contact"
          contact-type="seller"
          @contact="handleServiceContact"
        >
          <view class="action-icon-wrap">
            <image src="https://minixhs.chugao520.com/makefriends/Frame 1420074380.png" class="action-icon" mode="aspectFit"></image>
          </view>
          <!-- <text class="action-label">客服</text> -->
        </button>
      </view>

    </view>

    <!-- 右上角分享按钮 -->
    <view class="share-button" v-if="users.length > 0">
      <button
        class="share-btn"
        open-type="share"
      >
        <image src="https://minixhs.chugao520.com/makefriends/icons/share.svg" class="share-icon" mode="aspectFit"></image>
      </button>
    </view>
  </view>
</template>

<script>
import { getRecommendList, toggleFollow, sendRequest, wantView } from '@/api/index.js'
import { profileCheckMixin } from '@/utils/profileCheck.js'
import CenterModal from '@/components/center-modal.vue'
import CustomNavBar from '../../components/custom-nav-bar.vue'
import utils_config from "../../utils/config.js"

export default {
  components: {
    CenterModal,
    CustomNavBar
  },
  mixins: [profileCheckMixin],
  data() {
    return {
      users: [],
      currentIndex: 0,
      loading: false,
      page: 1,
      limit: 10,
      hasMore: true,
      // 居中弹框
      showCenterModal: false,
      centerModalTitle: '提示',
      centerModalContent: '',
      centerModalConfirmText: '确定',
      centerModalCancelText: '取消',
      centerModalOnConfirm: null // 确认回调
    }
  },
  computed: {
    currentUser() {
      return this.users[this.currentIndex] || null
    },
    hasEnoughContent() {
      const user = this.currentUser
      if (!user) return false
      // 判断是否有足够内容填满卡片（至少有自我介绍、照片、灵魂问答中的任意一项）
      return !!(user.intro || (user.images && user.images.length > 2) || 
                (user.soul_answers && user.soul_answers.length > 0) ||
                (user.my_tags && user.my_tags.length > 2))
    }
  },
  onLoad() {
    this.loadRecommendList()
  },
  onShow() {
    this.checkProfileCompletion()
  },
  onPullDownRefresh() {
    this.page = 1
    this.users = []
    this.hasMore = true
    this.loadRecommendList().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  onShareAppMessage() {
	
    // 邀请人 = 当前登录用户（发起分享的人），而非被查看的用户
    const loginUser = uni.getStorageSync('userinfo') || {}
    const inviterId = loginUser.id || ''

    const shareConfig = {
      title: `告白时刻Daily`,
	  content:'小红书小程序拯救单身互联网人',
      // todo：分享图片写死图片
	  imageUrl: this.currentUser.blur_avatar? this.currentUser.blur_avatar : utils_config.curlRef + '/uploads/sharecover.jpg',
      path: `/pages/user/detail?id=${this.currentUser.id}&share=true&inviter_id=${inviterId}`,
    }

    console.log('[ShareDebug] 首页分享:', shareConfig, 'currentUser:', this.currentUser)

    if (this.currentUser) {
      return shareConfig 
    }
    return {
      title: '告白时刻Daily - 遇见对的人',
	  content:'小红书小程序拯救单身互联网人',
      path: '/pages/user/detail?id=${this.currentUser.id}&share=true&inviter_id=${inviterId}',
	  // 26.04.25 @zq todo: 分享的图片先临时用服务器上照片
      imageUrl: this.currentUser.blur_avatar? this.currentUser.blur_avatar : utils_config.curlRef + '/uploads/sharecover.jpg'
    }
  },
  methods: {
    // 过滤标签中的链接内容
    filterTags(tags) {
      if (!tags || !Array.isArray(tags)) return []
      const urlPattern = /(https?:\/\/|www\.)/i
      return tags.filter(tag => tag && !urlPattern.test(tag))
    },
    getActionRequiredMissingFields() {
      const optionalFields = ['家乡', '职业', '是否购房', '微信号']
      return (this.profileMissingFields || []).filter((field) => !optionalFields.includes(field))
    },
    onCardSwiperChange(e) {
      const nextIndex = typeof e.detail?.current === 'number' ? e.detail.current : 0
      if (nextIndex !== this.currentIndex) {
        this.currentIndex = nextIndex
      }
    },
    onCardSwiperAnimationFinish(e) {
      const nextIndex = typeof e.detail?.current === 'number' ? e.detail.current : this.currentIndex
      this.currentIndex = nextIndex
      this.tryLoadMore()
    },

    // 加载推荐列表
    async loadRecommendList() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await getRecommendList({
          page: this.page,
          limit: this.limit
        })
        const list = res.data.list || []
        if (this.page === 1) {
          this.users = list
        } else {
          this.users = [...this.users, ...list]
        }
        this.hasMore = res.data.hasMore
      } catch (e) {
        console.error('加载推荐列表失败', e)
        if (e._isAuthError) {
          // token 已过期，清空列表并引导登录
          this.users = []
          this.hasMore = false
          this.checkLogin()
        }
      } finally {
        this.loading = false
      }
    },

    tryLoadMore() {
      if (this.currentIndex >= this.users.length - 3 && this.hasMore && !this.loading) {
        this.page++
        this.loadRecommendList()
      }
    },
    // 预览头像
    previewAvatar(user) {
      uni.previewImage({
        current: user.avatar,
        urls: [user.avatar]
      })
    },

    // 预览照片
    previewImages(images, index) {
      uni.previewImage({
        current: index,
        urls: images
      })
    },

    // 检查登录
    checkLogin() {
      const token = uni.getStorageSync('token')
      if (!token) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再操作',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/login/index' })
            }
          }
        })
        return false
      }
      return true
    },

    // 检查资料完成度
    async checkProfileComplete() {
      try {
        // 获取用户资料
        const token = uni.getStorageSync('token')
        if (!token) {
          uni.showToast({ title: '请先登录', icon: 'none' })
          return false
        }
        
        // 直接从本地存储获取用户资料
        const userInfo = uni.getStorageSync('userinfo') || uni.getStorageSync('userInfo') || {}
        console.log('用户资料:', userInfo)
        
        // 检查关注和联系前需要完善的字段
        const requiredFields = [
          { key: 'birthday', name: '出生年份', altKeys: ['birthday'] },
          { key: 'marital_status', name: '婚况', altKeys: ['marital_status', 'maritalStatus', 'marriage'] },
          { key: 'province', name: '所在省份', altKeys: ['province', 'provinceId', 'province_id'] },
          { key: 'city', name: '所在城市', altKeys: ['city', 'cityId', 'city_id'] },
          { key: 'education', name: '学历', altKeys: ['education', 'education_level'] },
          { key: 'job', name: '职业', altKeys: ['job', 'occupation', 'profession', 'position'] },
          { key: 'income', name: '年收入', altKeys: ['income', 'annual_income'] },
          { key: 'has_house', name: '是否购房', altKeys: ['has_house', 'hasHouse', 'house'] },
          { key: 'nickname', name: '昵称', altKeys: ['nickname'] },
          { key: 'has_car', name: '是否购车', altKeys: ['has_car'] },
          { key: 'intro', name: '自我介绍', altKeys: ['intro'] },
          { key: 'my_tags', name: '我的标签', altKeys: ['my_tags'] },
          { key: 'ideal_intro', name: '择偶要求', altKeys: ['ideal_intro'] },
          { key: 'ideal_tags', name: '择偶标签', altKeys: ['ideal_tags'] },
          { key: 'wechat', name: '微信号', altKeys: ['wechat', 'wechatNo', 'wechat_no'] },
        ]
        
        const missingFields = []
        for (const field of requiredFields) {
          let value = null
          for (const key of field.altKeys) {
            if (userInfo[key] !== undefined && userInfo[key] !== null && userInfo[key] !== '') {
              value = userInfo[key]
              break
            }
          }
          console.log(`校验：${field.name}: ${value}`)
          // 对于数字类型的字段，0也是有效数据
          if (value === null || value === undefined || value === '') {
            missingFields.push(field.name)
          }
        }
        
        console.log('缺少的字段:', missingFields)
        
        if (missingFields.length > 0) {
          // 使用居中弹框组件（支持换行显示）
          this.centerModalTitle = '资料完善提醒'
          this.centerModalContent = `为方便他人联系，请先完善以下资料：${missingFields.join('、')}\n资料越真实完整，对方通过你申请的概率越高哦～`
          this.centerModalConfirmText = '去完善'
          this.centerModalCancelText = '取消'
          this.centerModalOnConfirm = () => {
            this.onProfileGuide()
          }
          this.showCenterModal = true
          return false
        }
        
        return true
      } catch (error) {
        console.error('检查资料失败:', error)
        uni.showToast({
          title: '检查资料失败',
          icon: 'none'
        })
        return false
      }
    },

    // 检查认证完成度（实名+真人）
    checkAuthComplete() {
      const userInfo = uni.getStorageSync('userinfo') || uni.getStorageSync('userInfo') || {}
      if (!userInfo.is_verified || !userInfo.is_education) {
        const missingAuths = []
        if (!userInfo.is_verified) missingAuths.push('实名认证')
        if (!userInfo.is_education) missingAuths.push('学历认证')
        // if (!userInfo.is_realface) missingAuths.push('真人认证')

        uni.showModal({
          title: '认证提醒',
          content: `请先完成${missingAuths.join('、')}后再发起联系`,
          confirmText: '去认证',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/auth/index' })
            }
          }
        })
        return false
      }
      return true
    },

    // 关注/取消关注
    async handleFollow() {
		console.log('this.currentUser:',this.currentUser)
      if (!this.checkLogin()) return
      if (!(await this.checkProfileComplete())) return
      if (!this.currentUser) return

      try {
        const res = await toggleFollow({ user_id: this.currentUser.id })
        this.currentUser.is_followed = res.data.is_followed
        uni.showToast({
          title: this.currentUser.is_followed ? '关注成功' : '取消关注',
          icon: 'success'
        })
      } catch (e) {
        uni.showToast({ title: e.msg || '操作失败', icon: 'none' })
      }
    },

    // 联系
    async handleContact() {
      if (!this.checkLogin()) return
      if (!(await this.checkProfileComplete())) return
	  // 26.08.08 注销认证校验
      // if (!this.checkAuthComplete()) return
      if (!this.currentUser) return

      uni.showModal({
        title: '发起联系申请',
        content: '消耗10脱单币发起好友申请，对方同意后可查看联系方式',
        confirmText: '确认申请',
        success: async (res) => {
          if (res.confirm) {
            try {
              await sendRequest({ target_id: this.currentUser.id, message: '想认识你' })
              uni.showToast({ title: '申请已发送', icon: 'success' })
            } catch (e) {
              uni.showToast({ title: e.msg || '申请失败', icon: 'none' })
            }
          }
        }
      })
    },

    // 客服
    handleService() {
      // 已改为使用 button open-type="contact" 方式
      // 此方法保留作为降级方案
      uni.showModal({
        title: '联系客服',
        content: '如有问题请联系客服咨询',
        showCancel: false
      })
    },

    // 客服消息回调
    handleServiceContact(e) {
      console.log('客服消息事件', e)
      // 可以在这里处理客服消息的回调
      // e.detail.path: 用户进入客服会话的页面路径
      // e.detail.query: 用户进入客服会话的页面参数
    },

    // 订阅（开通VIP）
    handleSubscribe() {
      uni.navigateTo({
        url: '/pages/vip/index'
      })
    },
    
    // 跳转到我想看的页面
    goToWantPage() {
      uni.navigateTo({
        url: '/pages/want/my'
      })
    },

    // 居中弹框确认
    onCenterModalConfirm() {
      this.showCenterModal = false
      if (this.centerModalOnConfirm) {
        this.centerModalOnConfirm()
        this.centerModalOnConfirm = null
      }
    },

    // 居中弹框取消
    onCenterModalCancel() {
      this.showCenterModal = false
      this.centerModalOnConfirm = null
    }
  }
}
</script>

<style scoped>
.color-999{color: #999999 !important}
.section-note{font-size: 30rpx !important;}
.section-notetitle{font-size: 24rpx !important;}
	
.container {
  background-image: url('https://minixhs.chugao520.com/makefriends/bg3.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  position: relative;
  z-index: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 导航栏占位 */
.nav-bar-placeholder {
  height: 150rpx;
  flex-shrink: 0;
}

/* 首页导航栏标题靠左 */
:deep(.custom-nav-bar .nav-title) {
  text-align: left;
  padding-left: 20rpx;
}



/* 加载中 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.loading-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  opacity: 0.6;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

/* 卡片滑动区域 */
.card-swiper {
  width: 100%;
  flex-shrink: 0;
  height: calc(100vh - 10vh);
  /* margin-top: 40rpx; */
  overflow: hidden;
}

.card-swiper :deep(.uni-swiper-wrapper) {
  height: 100%;
}

.card-swiper :deep(swiper-item) {
  height: 100%;
}

.card-swiper :deep(.uni-swiper-item) {
  height: 100%;
}

.card-swiper-slide {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-scroll {
  height: calc(100% - 80rpx);
  width: calc(100% - 40rpx);
  box-sizing: border-box;
  margin: 0 20rpx 40rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

.card-scroll :deep(.uni-scroll-view) {
  height: 100%;
  overflow-y: auto !important;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

.card-scroll :deep(.uni-scroll-view-content) {
  touch-action: pan-y;
}

/* 用户卡片 */
.user-card {
  width: 100%;
  box-sizing: border-box;
  background: #f4f7ff;
}

/* 卡片头部 */
.card-header {
  position: relative;
  height: 550rpx;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  width: 100%;
  height: 100%;
}

.header-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%);
}

.user-basic {
  position: absolute;
  bottom: 40rpx;
  left: 30rpx;
  text-align: left;
}

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.nickname {
  font-size: 44rpx;
  font-weight: bold;
  color: #FFFFFF;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.4);
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12rpx;
}

.gender-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
}

.vip-badge-small {
  width: 48rpx;
  height: 48rpx;
  margin-left: 12rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.info-text {
  font-size: 26rpx;
  color: #FFFFFF;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.4);
}

.info-separator {
  font-size: 26rpx;
  color: #FFFFFF;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.4);
}

/* 内容区块 */
.section {
  padding: 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
  background-color: #F4F7FF;
}

.section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

/* 认证区域 */
.cert-section {
  background: #F4F7FF;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #131313;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
}

.section-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
}

.section-title::before {
  content: '';
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  border-radius: 3rpx;
  margin-right: 12rpx;
  display: none;
}

.cert-list {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.cert-item {
  flex: 1;
  min-width: 150rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  padding: 24rpx 16rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.cert-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 10rpx;
}

.cert-emoji {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.cert-text {
  font-size: 26rpx;
  color: #52C41A;
  font-weight: 500;
}

/* 自我介绍 */
.intro-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
}

/* 标签 */
.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  font-size: 26rpx;
  color: #384582;
  background: #DEE4FF;
  padding: 12rpx 28rpx;
  border-radius: 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(222, 228, 255, 0.3);
}

.tag.ideal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.2);
}

/* 详细信息 */
.detail-grid {
  display: flex;
  flex-wrap: wrap;
}

.detail-item {
  width: 50%;
  display: flex;
  margin-bottom: 16rpx;
}

.detail-label {
  font-size: 26rpx;
  color: #999999;
  width: 100rpx;
}

.detail-value {
  font-size: 26rpx;
  color: #333333;
  flex: 1;
}

/* 照片墙 */
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  min-height: 200rpx;
}

.photo-item {
  width: calc(33.33% - 8rpx);
  height: 200rpx;
  min-height: 200rpx;
  border-radius: 12rpx;
}

/* 灵魂问答 */
.soul-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.soul-item {
  background-color: #F8F8F8;
  padding: 20rpx;
  border-radius: 12rpx;
}

.soul-q {
  font-size: 28rpx;
  color: #FF4D4F;
  display: block;
  margin-bottom: 12rpx;
}

.soul-a {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
}

/* 卡片底部占位 */
.card-footer {
  height: 80rpx;
  background-color: #F4F7FF;
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0 60rpx;
  overflow: hidden;
}

:deep(uni-page),
:deep(uni-page-wrapper),
:deep(uni-page-body) {
  height: 100%;
  overflow: hidden;
}

.empty-icon {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 40rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  color: #999999;
  margin-bottom: 50rpx;
}

.refresh-btn {
  width: 280rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 44rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(250, 115, 29, 0.3);
}

.refresh-btn::after {
  border: none;
}

/* 右侧功能栏 */
.side-actions {
  position: fixed;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  z-index: 100;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.action-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  /* border-radius: 50%; */
  /* background: rgba(255, 255, 255, 0.95); */
  /* backdrop-filter: blur(10rpx); */
  display: flex;
  align-items: center;
  justify-content: center;
  /* box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12); */
  transition: all 0.3s;
}

/* .action-icon-wrap.active {
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  box-shadow: 0 6rpx 20rpx rgba(250, 115, 29, 0.4);
}

.action-icon-wrap.vip {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  box-shadow: 0 6rpx 20rpx rgba(255, 215, 0, 0.4);
} */

.action-icon-wrap:active {
  transform: scale(0.9);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 96rpx;
  height: 96rpx;
}

.action-emoji {
  font-size: 48rpx;
  line-height: 1;
}

.action-label {
  font-size: 22rpx;
  color: #333333;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  font-weight: 500;
}

/* 客服按钮特殊样式 */
.service-button {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  line-height: 1;
}

.service-button::after {
  border: none;
}

/* 右上角分享按钮 */
.share-button {
  position: fixed;
  top: 210rpx;
  right: 30rpx;
  z-index: 1000;
}

.share-btn {
  width: auto;
  height: auto;
  min-width: 0;
  min-height: 0;
  border-radius: 0;
  background: transparent;
  backdrop-filter: none;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  margin: 0;
  line-height: 1;
}

.share-btn::after {
  border: none;
}

.share-icon {
  width: 64rpx;
  height: 64rpx;
  display: block;
}
</style>
