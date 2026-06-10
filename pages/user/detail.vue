<template>
  <view class="detail-container">
   <view v-if="showShareRegisterPopup" class="share-register-overlay">
      <view class="share-register-card" style="text-align: center;">
        <text class="share-register-close" @click="closeShareRegisterPopup">×</text>
        <view class="share-register-title">注册后可继续查看嘉宾信息</view>
        <view class="share-register-desc" style="text-align: left;">登录后可关注对方、申请联系方式，并查看更多同城嘉宾。</view>
        <button class="share-register-btn" @click="goRegister">立即注册</button>
		<view class="guest-chat-enter" @click="startGuestChat">免登录聊天</view>
      </view>
    </view>

    <!-- 用户不存在/已删除提示 -->
    <view v-if="userNotFound" class="user-not-found-wrapper">
      <view class="user-not-found-content">
        <image class="not-found-icon" src="/static/images/empty.png" mode="aspectFit"></image>
        <text class="not-found-title">{{ userDeletedMsg || '该用户不存在或已注销' }}</text>
        <text class="not-found-desc">去看看其他嘉宾吧</text>
        <button class="goto-btn" @click="gotoSingle">前往单身广场</button>
      </view>
    </view>

    <!-- 用户已脱单提示 -->
    <view v-else-if="userInfo.isLogout" class="logout-wrapper">
      <view class="logout-content">
        <text class="logout-desc">当前用户已经脱单啦～ 可以去平台查看其他嘉宾喔</text>
        <button class="goto-btn" @click="gotoSingle">前往单身广场</button>
      </view>
    </view>

    <!-- 正常详情页 -->
    <view v-else class="detail-content">
      <!-- 顶部广告栏（可关闭） -->
<!--      <view v-if="showTopAd" class="top-ad" :style="{ top: navBarHeight + 'px' }">-->
<!--        <image class="close-icon" src="/static/icons/close.png" @click="closeTopAd"></image>-->
<!--        <view class="ad-content" @click="gotoSingle">-->
<!--          <text class="ad-text">前往单身广场</text>-->
<!--          <image class="arrow-icon" src="/static/icons/arrow-right.png"></image>-->
<!--        </view>-->
<!--      </view>-->

      <!-- 滚动内容区 -->
      <scroll-view
        scroll-y
        enhanced
        :show-scrollbar="false"
        scroll-with-animation
        :scroll-into-view="scrollIntoView"
        class="scroll-content"
      >
        <view class="content-wrapper">
          <!-- 1. 照片轮播卡片 -->
          <view class="photo-card ">
            <view class="card-header">
              <swiper
                v-if="userInfo.imgList && userInfo.imgList.length > 0"
                class="photo-swiper"
                autoplay
                circular
                indicator-dots
                indicator-active-color="#fff"
              >
                <swiper-item v-for="(img, index) in userInfo.imgList" :key="index">
                  <image
                    :src="img"
                    mode="aspectFill"
                    class="swiper-image"
                    @click="previewImage(index)"
                    @error="handleImageError"
                  ></image>
                </swiper-item>
              </swiper>
              <view v-else class="no-photo">
                <image
                  v-if="userInfo.avatar"
                  :src="userInfo.avatar"
                  mode="aspectFill"
                  class="avatar-cover"
                  @error="handleAvatarError"
                ></image>
                <image
                  v-else
                  :src="userInfo.gender === '男' ? '/static/icons/male-default.png' : '/static/icons/female-default.png'"
                  class="default-avatar"
                ></image>
                <view class="want-see-btn" @click="wantSee('photo')">
                  <text class="want-text">想看{{ userInfo.gender === '男' ? '他' : '她' }}的照片</text>
                </view>
              </view>
              <!-- 个人信息悬浮在照片左下角 -->
              
              <view class="user-basic">
                <view class="name-row">
                  <text class="nickname">{{ userInfo.name }}</text>
                  <image class="gender-icon" :src="userInfo.gender === '男' ? '/static/m.png' : '/static/wm.png'" mode="aspectFit"></image>
                  <image
                    v-if="userInfo.is_vip"
                    class="vip-badge-small"
                    src="/static/images/vip-badge.png"
                    mode="aspectFit"
                  ></image>
                  <image v-if="userInfo.isRealName" class="verify-icon" src="/static/icons/verified.png"></image>
                </view>
                <view class="info-row">
                  <text class="info-text">{{ userInfo.birthday }}岁</text>
                  <text class="info-separator" v-if="userInfo.birthday && (userInfo.height || userInfo.education)">·</text>
                  <text class="info-text" v-if="userInfo.height">{{ userInfo.height }}cm</text>
                  <text class="info-separator" v-if="userInfo.height && userInfo.education">·</text>
                  <text class="info-text" v-if="userInfo.education">{{ userInfo.education }}</text>
                </view>
              </view>
            </view>
            <view class="header-overlay"></view>
          </view>

          <!-- 3. 认证信息卡片（未认证时显示） -->
          <view v-if="!isAdSource" class="auth-card card">
            <view class="card-title">
              <image class="title-icon" src="/static/Frame(2).png" mode="aspectFit"></image>
              <text>我的认证</text>
            </view>
            <view class="auth-list">
              <view
                v-for="(item, index) in authItems"
                :key="index"
                class="auth-item"
                :style="{ background: userInfo.isRealName ? item.bgColorAuth : '#fcfcfc' }"
              >
                <image
                  :src="userInfo.isRealName ? item.iconAuth : item.iconUnauth"
                  class="auth-icon"
                ></image>
                <view v-if="userInfo.isRealName" class="auth-title">{{ item.titleAuth }}</view>
                <view v-else class="unauth-wrapper">
                  <!-- <image class="warning-icon" src="/static/icons/warning.png"></image> -->
                  <view class="auth-title">{{ item.titleUnauth }}</view>
                  <view class="auth-subtitle">请仔细甄别</view>
                </view>
              </view>
            </view>
          </view>
 
		  
		  <!-- 详细信息 -->
		  <view class="section">
		    <view class="section-title">
		      <image class="section-icon" src="/static/Frame(2).png" mode="aspectFit"></image>
		      <text>详细信息</text>
		    </view>
		    <view class="detail-grid">
		      <view class="detail-item" v-if="userInfo.job">
		        <text class="detail-label">职业</text>
		        <text class="detail-value">{{ userInfo.job }}</text>
		      </view>
		      <view class="detail-item" v-if="userInfo.company">
		        <text class="detail-label">公司</text>
		        <text class="detail-value">{{ userInfo.company }}</text>
		      </view>
		      <view class="detail-item" v-if="userInfo.school">
		        <text class="detail-label">学校</text>
		        <text class="detail-value">{{ userInfo.school }}</text>
		      </view>
		      <view class="detail-item" v-if="userInfo.hometown">
		        <text class="detail-label">家乡</text>
		        <text class="detail-value">{{ userInfo.hometown_t }}</text>
		      </view> 
			  <view class="detail-item">
			    <text class="detail-label">有车</text>
			    <text class="detail-value">{{ userInfo.has_car ? '是' : '否' }}</text>
			  </view>
			  <view class="detail-item">
			    <text class="detail-label">有房</text>
			    <text class="detail-value">{{ userInfo.has_house ? '是' : '否' }}</text>
			  </view>
		    </view>
		  </view>
		<view class="guest-chat-enter" @click="startGuestChat">免登录聊天</view>
          <!-- 5. 自我介绍卡片 -->
          <view class="introduce-card card">
            <view class="card-title">
              <image class="title-icon" src="/static/Frame(2).png" mode="aspectFit"></image>
              <text>自我介绍</text>
            </view>
            <view v-if="userInfo.introduce" class="introduce-content">
              <text class="introduce-text" space="nbsp" decode>{{ formatIntroduce }}</text>
            </view>
            <view v-else-if="!isAdSource" class="want-see-wrapper">
              <view class="want-see-btn" @click="wantSee('introduce')">
                <text class="want-text">想看{{ userInfo.gender === '男' ? '他' : '她' }}的介绍</text>
              </view>
            </view>
          </view>

          <!-- 6. 个人标签卡片 -->
          <view v-if="!isAdSource" class="tags-card card">
            <view class="card-title">
              <image class="title-icon" src="/static/Frame (3).png" mode="aspectFit"></image>
              <text>{{ userInfo.gender === '男' ? '他' : '她' }}的标签</text>
            </view>
            <view v-if="filterTags(userInfo.tags).length" class="tags-wrapper">
              <text v-for="(tag, index) in filterTags(userInfo.tags)" :key="index" class="tag-item-primary">
                {{ tag }}
              </text>
            </view>
            <view v-else class="want-see-wrapper">
              <view class="want-see-btn" @click="wantSee('tag')">
                <text class="want-text">想看{{ userInfo.gender === '男' ? '他' : '她' }}的标签</text>
              </view>
            </view>
          </view>

          <!-- 7. 灵魂问答卡片 -->
          <view v-if="userInfo.questionAnswer && userInfo.questionAnswer.length" class="qa-card card">
            <view class="card-title">
              <image class="title-icon" src="/static/Frame(1).png" mode="aspectFit"></image>
              <text>灵魂问答</text>
            </view>
            <view class="question-list">
              <view v-for="(item, index) in userInfo.questionAnswer" :key="index" class="qa-item">
                <view v-if="item.question && item.answer" class="question-row">
                  <image class="q-icon" src="/static/Frame@2x(2).png"></image>
                  <view class="question-text">{{ item.question }}</view>
                </view>
                <view v-if="item.answer" class="answer-text">{{ item.answer }}</view>
              </view>
            </view>
          </view>

          <!-- 8. 好友印象卡片 -->
          <view v-if="userInfo.friends_impression && userInfo.friends_impression.length" class="impression-card card">
			  <image class="title-icon" src="/static/Frame(5).png" mode="aspectFit"></image>
            <view class="card-title">好友印象</view>
            <view v-for="(item, index) in userInfo.friends_impression" :key="index" class="impression-item">
              <view class="friend-label">
                <image class="friend-icon" src="/static/icons/friend.png"></image>
                <text>好友{{ friendLabels[index] }}</text>
              </view>
              <view class="impression-content">{{ item }}</view>
            </view>
          </view>

          <!-- 9. 理想对象卡片 -->
          <view class="ideal-partner-card card">
            <view class="card-title">
              <image class="title-icon" src="/static/Frame(7).png" mode="aspectFit"></image>
              <text>理想对象</text>
            </view>
            <view v-if="hasIdealPartner">
              <view v-if="userInfo.idealPartner.introduce" class="ideal-introduce">
                <text class="ideal-text">{{ formatIdealPartner }}</text>
              </view>
              <view v-if="userInfo.idealPartner.tags && filterTags(userInfo.idealPartner.tags).length" class="tags-wrapper">
                <text v-for="(tag, index) in filterTags(userInfo.idealPartner.tags)" :key="index" class="tag-item-primary">
                  {{ tag }}
                </text>
              </view>
            </view>
            <view v-else-if="!isAdSource" class="want-see-wrapper">
              <view class="want-see-btn" @click="wantSee('idealPartner')">
                <text class="want-text">想看{{ userInfo.gender === '男' ? '他' : '她' }}的要求</text>
              </view>
            </view>
          </view>

          <!-- 10. 隐私信息卡片 -->
          <view class="privacy-card card" style="border-bottom: 0rpx solid #F0F0F0;">
            <view class="privacy-header">
              <view class="card-title">
                <image class="title-icon" src="/static/Frame(2).png" mode="aspectFit"></image>
                <text>隐私信息</text>
              </view>
              <view v-if="!isAdSource" class="report-btn" @click="gotoReport">
                <image class="report-icon" src="/static/icons/report.png"></image>
                <text>投诉/举报</text>
              </view>
            </view>
            <view v-if="userInfo.privacyInfo" class="privacy-content" id="privacyID">
              <view v-if="userInfo.privacyInfo.income" class="info-item">
                年收入：{{ userInfo.privacyInfo.income }}万
              </view>
              <view v-if="userInfo.privacyInfo.familyBackground" class="info-item">
                家庭背景：{{ userInfo.privacyInfo.familyBackground.replace(/\\n/g, '\n') }}
              </view>
    <!--          <view v-if="userInfo.privacyInfo.hasHouse" class="info-item">
                是否购房：{{ userInfo.privacyInfo.hasHouse }}
              </view>
              <view v-if="userInfo.privacyInfo.hasCar" class="info-item">
                是否购车：{{ userInfo.privacyInfo.hasCar }}
              </view> -->
              <view v-if="!isAdSource" id="wechatNo" class="info-item wechat-item">
                <text>{{ contactFieldName }}：</text>
                <view v-if="userInfo.isBuy" class="wechat-value">
                  <text>{{ userInfo.privacyInfo.wechatNo }}</text>
                  <image
                    class="copy-icon"
                    src="/static/icons/copy.png"
                    @click="copyWechat(userInfo.privacyInfo.wechatNo)"
                  ></image>
                </view>
                <text v-else class="locked-text">申请通过后，可解锁</text>
              </view>
            </view>
          </view>

          <!-- 11. 推荐用户卡片 -->
          <view v-if="!isAdSource && recommendList.length" class="recommend-card card">
            <view class="card-title">为你推荐</view>
            <scroll-view scroll-x class="recommend-scroll">
              <view class="recommend-list">
                <view
                  v-for="(item, index) in recommendList"
                  :key="index"
                  class="recommend-item"
                  @click="gotoUserDetail(item)"
                >
                  <image :src="item.avatar" mode="aspectFill" class="recommend-avatar"></image>
                  <view class="recommend-name">{{ item.name }}</view>
                  <view class="recommend-info">
                    <text class="age">{{ item.age }}岁</text>
                    <text class="city">{{ item.livingCity.name }}</text>
                  </view>
                  <view class="recommend-edu">{{ item.university || item.education }}</view>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
      </scroll-view>

      <!-- 12. 底部操作栏 -->
      <view v-if="!isBindMode" class="bottom-bar">
        <button class="share-btn" open-type="share" @click="handleShare">
          <view class="btn-content">
            <image class="btn-icon" src="/static/icons/share.png"></image>
            <text class="btn-text">分享</text>
          </view>
        </button>
        <button class="wechat-btn" @click="handleGetWechat">
          <view class="btn-content">
            <image class="btn-icon" src="/static/icons/wechat.png"></image>
            <text class="btn-text">获取微信</text>
          </view>
        </button>
      </view>

      <!-- 绑定模式底部按钮 -->
      <view v-if="isBindMode" class="bind-bar">
        <button class="bind-btn" @click="handleBind">
          <view class="bind-content">
            <text class="bind-text">立即绑定</text>
          </view>
        </button>
      </view>

      <!-- 13. 右侧浮动按钮 -->
      <view v-if="!isBindMode" class="right-btns" @click="handleFollow">
          <image class="follow-btn" :src="userInfo.isFollow ? '/static/ygz.png' : '/static/Frame 1420074377.png'"></image>
      </view>

      <!-- 居中弹框 -->
      <center-modal
        :visible="showCenterModal"
        :title="centerModalTitle"
        :content="centerModalContent"
        :confirm-text="centerModalConfirmText"
        :cancel-text="centerModalCancelText"
        @confirm="onCenterModalConfirm"
        @cancel="onCenterModalCancel"
      />
    </view>
  </view>
</template>

<script>
import { getUserDetail, toggleFollow, sendRequest, wantView, getBlur } from '@/api/index.js'
import utils_config from "../../utils/config.js"
import CenterModal from '@/components/center-modal.vue'
import { getOrCreateGuestId } from '@/utils/guestAuth.js'

export default {
  name: 'UserDetail',
  components: {
    CenterModal
  },
  data() {
    return {
      // 8种渐变色背景
      gradientColors: [
        'linear-gradient(158deg, #FF89F0 0%, #FB7798 100%)',
        'linear-gradient(164deg, #FF9293 0%, #F87E7B 100%)',
        'linear-gradient(148deg, #8D92F8 0%, #8B8BFB 100%)',
        'linear-gradient(143deg, #18DC9B 0%, #00C181 100%)',
        'linear-gradient(160deg, #FCC58A 0%, #F5B84D 100%)',
        'linear-gradient(153deg, #ACB4FF 0%, #5867FF 100%)',
        'linear-gradient(155deg, #BCA4FF 0%, #8D75E4 100%)',
        'linear-gradient(151deg, #5FD3FC 0%, #4BA6FF 100%)',
        'linear-gradient(143deg, #FF9F6A 0%, #FF6A17 100%)'
      ],
      // 认证项配置
      authItems: [
        {
          iconAuth: '/static/images/identify-id-green.png',
          iconUnauth: '/static/images/identify-id-grey.png',
          titleAuth: '实名认证',
          titleUnauth: '实名认证',
          bgColorAuth: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
          iconAuth: '/static/images/identify-real-blue.png',
          iconUnauth: '/static/images/identify-real-grey.png',
          titleAuth: '真人认证',
          titleUnauth: '真人认证',
          bgColorAuth: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }
      ],
      // 好友标签
      friendLabels: ['甲', '乙', '丙', '丁'],
      // 响应式数据
      userId: '',
      navBarHeight: 0,
      showTopAd: true,
      scrollIntoView: '',
      loading: true,
      isBindMode: false,
      isAdSource: false,
      isShareVisitor: false,
      showShareRegisterPopup: false,
      userNotFound: false,      // 用户不存在/已删除
      userDeletedMsg: '',       // 用户删除的提示信息
      contactFieldName: '微信号',
      recommendList: [],
      userInfo: {
        gender: '男',
        name: '',
        avatar: '',
		blur_avatar:'',
        common_tags: [],
        birthday: 0,
        height: 0,
        livingPlace: '',
        hometown: '',
        education: '',
        school: '',
        job: '',
        position: '',
        introduce: '',
        tags: [],
        questionAnswer: [],
        friends_impression: [],
        idealPartner: {
          introduce: '',
          tags: []
        },
        privacyInfo: {
          id: '',
          phone: '',
          wechatNo: '',
          qqNo: '',
          income: 0,
          familyBackground: '',
          relationshipHistory: '',
          hasHouse: false,
          hasCar: false,
          otherAssets: false
        },
        friendRequest: null,
        isFollow: false,
        isBuy: false,
        isLogout: false,
        headList: [],
        imgList: [],
        isRealName: false
      },
      // 居中弹框
      showCenterModal: false,
      centerModalTitle: '提示',
      centerModalContent: '',
      centerModalConfirmText: '确定',
      centerModalCancelText: '取消',
      centerModalOnConfirm: null
    }
  },
  computed: {
    formatIntroduce() {
      return this.userInfo.introduce ? this.userInfo.introduce.replace(/\\n/g, '\n') : ''
    },
    formatIdealPartner() {
      return this.userInfo.idealPartner?.introduce
        ? this.userInfo.idealPartner.introduce.replace(/\\n/g, '\n')
        : ''
    },
    hasIdealPartner() {
      if (!this.userInfo.idealPartner) return false
      const filteredTags = this.filterTags(this.userInfo.idealPartner.tags)
      return !!(
        this.userInfo.idealPartner.introduce ||
        filteredTags.length > 0
      )
    }
  },
  onLoad(options) {
    this.userId = options.id || options.user_id || ''
    this.isShareVisitor = options.share === 'true' || options.share === '1'
    const inviterId = Number(options.inviter_id || 0)
    if (inviterId > 0) {
      uni.setStorageSync('share_inviter_id', inviterId)
    }

    // 获取导航栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.navBarHeight = systemInfo.statusBarHeight + 44

    if (this.isShareVisitor && !uni.getStorageSync('token')) {
      this.showShareRegisterPopup = true
    }

    // 加载数据
    if (this.userId) {
      this.loadUserDetail()
      this.loadRecommendList()
    }
  },
  onShareAppMessage() {
	  console.log('头像',this.userInfo.blur_avatar)
    // 邀请人 = 当前登录用户（发起分享的人），而非被查看的用户
    const loginUser = uni.getStorageSync('userinfo') || {}
    const inviterId = loginUser.id || ''
	
    // 分享卡片图片：优先用模糊头像，其次固定封面图
    // let shareImageUrl = this.userInfo.blur_avatar? this.userInfo.blur_avatar : utils_config.curlRef + '/uploads/sharecover.jpg'
    let shareImageUrl = this.userInfo.avatar? this.userInfo.blur_avatar : utils_config.curlRef + '/uploads/sharecover.jpg'

    console.log('[ShareDebug] 分享卡片配置:', {
      title: `我发现一个不错的人：${this.userInfo.name}`,
      imageUrl: shareImageUrl,
      imgListLength: this.userInfo.imgList?.length || 0,
      avatar: this.userInfo.avatar || '(empty)',
      userId: this.userId
    })

    return {
      title: `告白时刻Daily - 遇见对的人`,
	  content:'小红书小程序拯救单身互联网人',
	  // title: `我发现一个不错的人：${this.userInfo.name}`,
      imageUrl: shareImageUrl,
      path: `/pages/user/detail?id=${this.userId}&share=true&inviter_id=${inviterId}`
    }
  },
  methods: {
    // 过滤标签中的链接内容
    filterTags(tags) {
      if (!tags || !Array.isArray(tags)) return []
      const urlPattern = /(https?:\/\/|www\.)/i
      return tags.filter(tag => tag && !urlPattern.test(tag))
    },
    async loadUserDetail() {
      try {
        this.loading = true
        const res = await getUserDetail(this.userId)
        console.log('用户详情API返回:', res)
        if (res && res.data && res.data.user) {
          console.log('用户数据:', res.data.user)
          console.log('用户图片:', res.data.user.images)
          console.log('用户头像:', res.data.user.avatar)
          this.userInfo = this.transformUserData(res.data.user)
          console.log('转换后的userInfo:', this.userInfo)
          console.log('图片列表imgList:', this.userInfo.imgList)

          // 2026.05.14 预先获取模糊头像，用于分享
          // try {
          //   const blurRes = await getBlur(this.userId)
          //   if (blurRes && blurRes.data && blurRes.data.blur_avatar) {
          //     this.userInfo.blur_avatar = blurRes.data.blur_avatar
          //     console.log('模糊头像:', this.userInfo.blur_avatar)
          //   }
          // } catch (e) {
          //   console.warn('获取模糊头像失败:', e)
          // }

          // 调试验证图片
          this.debugCheckImage(this.userInfo.avatar, '头像')
          if (this.userInfo.imgList.length > 0) {
            this.debugCheckImage(this.userInfo.imgList[0], '照片墙第1张')
          }
        }
      } catch (error) {
        console.error('加载用户详情失败:', error)

        // 判断错误类型
        const isUserNotFound = error.code === 404 || error.code === 0 ||
          (error.msg && /用户不存在|用户已删除|用户已注销|not found/i.test(error.msg))
        const isAuthError = error._isAuthError || error.code === 401

        if (isUserNotFound) {
          // 用户不存在/已删除：展示友好提示页，不强制跳转
          this.userNotFound = true
          this.userDeletedMsg = error.msg || '该用户不存在或已注销'
          console.log('[Detail] 用户不存在，切换为游客态浏览')
        } else if (isAuthError) {
          // 登录过期：清除本地存储，降级为游客态
          uni.removeStorageSync('token')
          uni.removeStorageSync('userinfo')
          uni.removeStorageSync('userInfo')
          uni.removeStorageSync('xhs_openid')
          uni.setStorageSync('is_guest_mode', true)
          console.log('[Detail] 登录状态过期，已清除本地存储，降级为游客态')

          // 如果是分享访客，弹出注册引导；否则静默处理让用户继续浏览
          if (this.isShareVisitor) {
            this.showShareRegisterPopup = true
          }
        } else {
          // 其他错误（网络问题等）：显示轻提示，不影响页面展示
          uni.showToast({
            title: error.msg || '加载失败，请稍后重试',
            icon: 'none'
          })
        }
      } finally {
        this.loading = false
      }
    },

    transformUserData(user) {
      // 处理图片列表 - 确保是数组
      let imgList = []
      if (user.images) {
        if (Array.isArray(user.images) && user.images.length > 0) {
          imgList = user.images.filter(img => img && typeof img === 'string' && img.length > 0)
        } else if (typeof user.images === 'string') {
          // 如果是字符串，尝试解析JSON
          try {
            const parsed = JSON.parse(user.images)
            if (Array.isArray(parsed) && parsed.length > 0) {
              imgList = parsed.filter(img => img && typeof img === 'string' && img.length > 0)
            }
          } catch (e) {
            console.error('解析图片JSON失败:', e)
          }
        }
      }

      console.log('处理后的图片列表:', imgList)

      return {
        isFollow: user.is_followed || false,
        isBuy: user.can_view_wechat || false,
        isLogout: !user.is_single,
		blur_avatar:user.blur_avatar || '',
        headList: [],
        imgList: imgList,
        avatar: user.avatar || '',
        gender: user.gender === 1 ? '男' : '女',
        name: user.nickname || '',
        isRealName: user.is_verified || false,
        common_tags: user.my_tags || [],
        birthday: user.age || 0,
        height: user.height || 0,
        livingPlace: `${user.province || ''}${user.city || ''}`,
        hometown: `${user.hometown_province || ''}${user.hometown_city || ''}`,
		hometown_t: `${user.hometown_province_t || ''}${user.hometown_city_t || ''}`,
        education: user.education || '',
        school: user.school || '',
        job: user.job || '',
        position: user.job || '',
        introduce: user.intro || '',
        tags: user.my_tags || [],
        questionAnswer: user.soul_answers || [],
        friends_impression: [],
        idealPartner: {
          introduce: user.ideal_intro || '',
          tags: user.ideal_tags || []
        },
        privacyInfo: {
          id: user.id,
          phone: '',
          wechatNo: user.wechat || '',
          qqNo: '',
          income: user.income || 0,
          familyBackground: '',
          relationshipHistory: '',
          hasHouse: user.has_house ? '是' : '否',
          hasCar: user.has_car ? '是' : '否',
          otherAssets: false
        },
        friendRequest: null
      }
    },

    async loadRecommendList() {
      try {
        // 这里应该调用推荐列表API
        // const res = await getRecommendList({ user_id: this.userId })
        // if (res && res.data) {
        //   this.recommendList = res.data
        // }
      } catch (error) {
        console.error('加载推荐列表失败:', error)
      }
    },

    calculateAge(birthday) {
      if (!birthday) return 0
      const birthYear = new Date(birthday).getFullYear()
      const currentYear = new Date().getFullYear()
      return currentYear - birthYear
    },

    previewImage(index) {
      if (this.userInfo.imgList && this.userInfo.imgList.length > 0) {
        uni.previewImage({
          urls: this.userInfo.imgList,
          current: this.userInfo.imgList[index]
        })
      }
    },

    handleImageError(e) {
      console.error('[ImageDebug] 图片加载失败:', e)
    },

    handleAvatarError(e) {
      console.error('[ImageDebug] 头像加载失败，清空avatar使用默认图标:', e)
      this.userInfo.avatar = ''
    },

    // 调试用：验证图片URL是否可访问
    debugCheckImage(url, label = '图片') {
      if (!url) {
        console.warn(`[ImageDebug] ${label}: URL为空`)
        return
      }
      console.log(`[ImageDebug] ${label} URL:`, url)

      // 本地图片直接判定为可用
      if (url.startsWith('/static/')) {
        console.log(`[ImageDebug] ${label}: 本地图片，路径正确`)
        return
      }

      // 网络图片用 getImageInfo 验证
      uni.getImageInfo({
        src: url,
        success: (res) => {
          console.log(`[ImageDebug] ${label} 验证成功:`, res.width + 'x' + res.height, res.type)
        },
        fail: (err) => {
          console.error(`[ImageDebug] ${label} 验证失败:`, err.errMsg, 'URL:', url)
        }
      })
    },

    // 检查是否已登录，未登录则弹出注册引导
    requireLogin() {
      const token = uni.getStorageSync('token')
      if (!token) {
        this.showShareRegisterPopup = true
        return false
      }
      return true
    },

    async wantSee(type) {
      if (!this.requireLogin()) return

      try {
        // 后端支持多种类型：wechat, images, introduce, tag, idealPartner
        const typeMap = {
          tag: 'tag',              // 标签 -> 标签
          introduce: 'introduce',  // 介绍 -> 介绍
          idealPartner: 'idealPartner',  // 理想对象 -> 理想对象
          photo: 'images'          // 照片 -> 照片
        }

        await wantView({
          user_id: this.userId,
          type: typeMap[type] || type
        })

        uni.showToast({
          title: '已提醒该嘉宾',
          icon: 'none'
        })
      } catch (error) {
        console.error('想看操作失败:', error)
        uni.showToast({
          title: error.msg || '操作失败',
          icon: 'none'
        })
      }
    },

    async handleFollow() {
      if (!this.requireLogin()) return

      // 检查用户资料是否完善
      if (!await this.checkProfileComplete()) {
        return
      }

      try {
        const res = await toggleFollow({
          user_id: this.userId
        })
        if (res && res.data) {
          this.userInfo.isFollow = res.data.is_followed
          uni.showToast({
            title: res.data.is_followed ? '关注成功' : '取消关注',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('关注操作失败:', error)
        uni.showToast({
          title: error.msg || '操作失败',
          icon: 'none'
        })
      }
    },

    async handleGetWechat() {
      if (!this.requireLogin()) return

      // 检查用户资料是否完善
      if (!await this.checkProfileComplete()) {
        return
      }
	// 检查是否完成认证
	 if (!this.checkAuthComplete()) return

      if (this.userInfo.isBuy) {
        uni.showToast({
          title: '已购买',
          icon: 'none'
        })
        this.scrollIntoView = 'wechatNo'
        return
      }

      // 这里应该打开申请微信的弹窗
      uni.showModal({
        title: '发起好友申请',
        content: '消耗10脱单币发起好友申请，对方同意后双方互相解锁微信号',
        confirmText: '确认申请',
        success: async (res) => {
          if (res.confirm) {
            try {
              await sendRequest({ target_id: this.userId, message: '想认识你' })
              uni.showToast({ title: '申请已发送', icon: 'success' })
            } catch (e) {
              uni.showToast({ title: e.msg || '申请失败', icon: 'none' })
            }
          }
        }
      })
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

    handleShare() {
      console.log('分享')
    },

    closeShareRegisterPopup() {
      this.showShareRegisterPopup = false
    },

    goRegister() {
      this.showShareRegisterPopup = false
      // 邀请人 = 当前登录用户，从 Storage 中读取（由分享卡片 onLoad 时存入）
      const inviterId = uni.getStorageSync('share_inviter_id') || ''
      uni.navigateTo({
        url: `/pages/login/index?inviter_id=${inviterId}`
      })
    },

    async startGuestChat() {
      try {
        // 获取或创建游客身份，传入邀请人ID
        const inviterId = uni.getStorageSync('share_inviter_id') || ''
        // const inviterId = '1796'
        const guestInfo = await getOrCreateGuestId(inviterId ? { inviter_id: inviterId } : {})
        console.log('[GuestChat] 游客身份创建成功', guestInfo)
        
        // 关闭弹窗，跳转聊天详情页
        this.showShareRegisterPopup = false
        uni.navigateTo({
          url: `/pages/chat/detail?to_user_id=${this.userId}&guest=1`
        })
      } catch (e) {
        console.error('[GuestChat] 创建游客身份失败', e)
        uni.showToast({
          title: '请稍后重试',
          icon: 'none'
        })
      }
    },

    async handleBind() {
      try {
        // 绑定逻辑
        console.log('执行绑定')
      } catch (error) {
        console.error('绑定失败:', error)
      }
    },

    copyWechat(wechat) {
      if (wechat) {
        uni.setClipboardData({
          data: wechat,
          success: () => {
            uni.showToast({
              title: '复制成功',
              icon: 'success'
            })
          }
        })
      }
    },

    async checkProfileComplete() {
      try {
        // 获取用户资料
        const token = uni.getStorageSync('token')
        if (!token) {
          this.showShareRegisterPopup = true
          return false
        }
        
        // 直接从本地存储获取用户资料
        const userInfo = uni.getStorageSync('userinfo') || uni.getStorageSync('userInfo') || {}
        console.log('用户资料:', userInfo)
        
        // 检查关注和联系前需要完善的字段
        const requiredFields = [
          // { key: 'birthday', name: '出生年份', altKeys: ['birthday'] },
          // { key: 'marital_status', name: '婚况', altKeys: ['marital_status', 'maritalStatus', 'marriage'] },
          // { key: 'province', name: '所在省份', altKeys: ['province', 'provinceId', 'province_id'] },
          // { key: 'city', name: '所在城市', altKeys: ['city', 'cityId', 'city_id'] },
          // { key: 'education', name: '学历', altKeys: ['education', 'education_level'] },
          // { key: 'job', name: '职业', altKeys: ['job', 'occupation', 'profession', 'position'] },
          // { key: 'income', name: '年收入', altKeys: ['income', 'annual_income'] },
          // { key: 'has_house', name: '是否购房', altKeys: ['has_house', 'hasHouse', 'house'] },
          // { key: 'wechat', name: '微信号', altKeys: ['wechat', 'wechatNo', 'wechat_no'] },
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
          console.log(`${field.name}: ${value}`)
          // 对于数字类型的字段，0也是有效数据
          if (value === null || value === undefined || value === '') {
            missingFields.push(field.name)
          }
        }
        
        console.log('缺少的字段:', missingFields)
        
        if (missingFields.length > 0) {
          // 使用居中弹框组件（支持换行显示）
          this.centerModalTitle = '资料完善提醒'
          this.centerModalContent = `请先完善以下资料：${missingFields.join('、')}\n资料越真实完整，对方通过你申请的概率越高哦～`
          this.centerModalConfirmText = '去完善'
          this.centerModalCancelText = '取消'
          this.centerModalOnConfirm = () => {
            uni.navigateTo({
              url: '/pages/profile/edit'
            })
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

    closeTopAd() {
      this.showTopAd = false
    },

    gotoSingle() {
      uni.switchTab({
        url: '/pages/single/index'
      })
    },

    gotoReport() {
      if (!this.requireLogin()) return
      uni.navigateTo({
        url: `/pages/report/index?id=${this.userId}`
      })
    },

    gotoUserDetail(user) {
      if (user && user.id) {
        uni.navigateTo({
          url: `/pages/user/detail?id=${user.id}`
        })
      }
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

<style lang="scss" scoped>
.detail-container {
  width: 100%;
  min-height: 100vh;
  background: #f9f9f9;
}

.share-register-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
  z-index: 999;
}

.share-register-card {
  width: 100%;
  background: #fff;
  border-radius: 32rpx;
  padding: 56rpx 40rpx 40rpx;
  box-sizing: border-box;
  position: relative;
}

.share-register-close {
  position: absolute;
  top: 18rpx;
  right: 24rpx;
  width: 56rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  font-size: 44rpx;
  color: #999;
}

.share-register-title {
  font-size: 38rpx;
  line-height: 1.4;
  color: #222;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.share-register-desc {
  font-size: 28rpx;
  line-height: 1.7;
  color: #666;
  margin-bottom: 32rpx;
}

.share-register-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #ff4d4f;
  color: #fff;
  border-radius: 44rpx;
  border: none;
  margin-bottom: 1rem;

  &::after {
    border: none;
  }
}

.guest-chat-enter{
	color: #384582;
	font-size: 0.85rem;
}

/* 脱单提示 */
.logout-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  overflow: hidden;

  .logout-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 460rpx;

    .logout-desc {
      width: 350rpx;
      font-size: 28rpx;
      color: #131313;
      line-height: 50rpx;
      text-align: center;
    }

    .goto-btn {
      width: 420rpx;
      height: 90rpx;
      margin-top: 50rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #FF4D4F;
      font-size: 30rpx;
      font-weight: 500;
      color: white;
      border-radius: 46rpx;
      box-shadow: 0 10rpx 10rpx 0 rgba(227, 84, 80, 0.2);
    }
  }
}

/* 详情内容 */
.detail-content {
	
  position: relative;
  width: 100%;
  min-height: 100vh;
}

/* 顶部广告栏 */
.top-ad {
  position: absolute;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #FF4D4F;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  z-index: 2;
  padding: 0 30rpx;

  .close-icon {
    width: 36rpx;
    height: 36rpx;
    flex-shrink: 0;
  }

  .ad-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: white;

    .ad-text {
      font-size: 30rpx;
    }

    .arrow-icon {
      width: 36rpx;
      height: 36rpx;
      margin-left: 10rpx;
    }
  }
}

/* 滚动内容 */
.scroll-content {
	
  height: calc(100vh - 132rpx - env(safe-area-inset-bottom));
}

.content-wrapper {
  // width: 100%;
  border-radius: 30rpx;
  // padding: 60rpx;
  margin: 30rpx;
  // display: flex;
  background-color: #F4F7FF;
  // flex-direction: column;
  // align-items: center;
  padding-bottom: 60rpx;
}

/* 通用卡片样式 */
.card {
//   width: 690rpx;
  padding: 30rpx;
border-bottom: 1rpx solid #F0F0F0;
  // margin-top: 30rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  line-height: 40rpx;
  color: #131313;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  
  .title-icon {
    width: 30rpx;
    height: 30rpx;
    margin-right: 16rpx;
  }
}

.info-item {
  font-size: 28rpx;
  line-height: 28rpx;
  color: #6e6e6e;
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

/* 用户不存在提示 */
.user-not-found-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  overflow: hidden;

  .user-not-found-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 300rpx;

    .not-found-icon {
      width: 300rpx;
      height: 300rpx;
      margin-bottom: 40rpx;
      opacity: 0.6;
    }

    .not-found-title {
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
      text-align: center;
      margin-bottom: 16rpx;
    }

    .not-found-desc {
      font-size: 28rpx;
      color: #999;
      text-align: center;
      margin-bottom: 60rpx;
    }

    .goto-btn {
      width: 420rpx;
      height: 90rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #FF4D4F;
      font-size: 30rpx;
      font-weight: 500;
      color: white;
      border-radius: 46rpx;
      box-shadow: 0 10rpx 10rpx 0 rgba(227, 84, 80, 0.2);
    }
  }
}

/* 照片卡片 */
.photo-card {
  height: 550rpx;
  border-radius: 30rpx 30rpx 0 0 ;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  .card-header {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .photo-swiper {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 0;

    .swiper-image {
      width: 100%;
      height: 100%;
    }
  }

  .no-photo {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 0;

    .default-avatar {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: auto;
      margin-top: 100rpx;
    }

    .avatar-cover {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }

    .want-see-btn {
      width: 250rpx;
      height: 80rpx;
      border: 2rpx solid #FF4D4F;
      border-radius: 46rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 150rpx;

      .want-text {
        font-size: 28rpx;
        color: #FF4D4F;
        line-height: 28rpx;
        font-weight: 500;
      }
    }
  }

  .header-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.65) 100%);
    z-index: 99;
    pointer-events: none;
  }

  .user-basic {
    position: absolute;
    bottom: 40rpx;
    left: 30rpx;
    text-align: left;
    z-index: 100;

    .name-row {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

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

      .verify-icon {
        width: 34rpx;
        height: 34rpx;
        margin-left: 12rpx;
      }
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 12rpx;

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
    }
  }
}

/* 基本信息卡片 */
.basic-info-card {
  .name-row {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .name {
      font-size: 38rpx;
      font-weight: 600;
      line-height: 40rpx;
      color: #131313;
    }

    .verify-icon {
      width: 34rpx;
      height: 34rpx;
      margin-left: 20rpx;
    }

    .unverified-text {
      font-size: 24rpx;
      color: #6e6e6e;
      margin-left: 16rpx;
      margin-top: 10rpx;
    }
  }

  .common-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 30rpx;

    .tag-item {
      font-size: 24rpx;
      line-height: 50rpx;
      border-radius: 30rpx;
      margin-right: 10rpx;
      padding: 0 18rpx;
      height: 50rpx;
      margin-bottom: 10rpx;
      color: #384582;
	  background-color: #DEE4FF;
    }
  }

  .card-content {
    display: flex;
    flex-direction: column;
    color: #6e6e6e;
  }
}

/* 认证卡片 */
.auth-card {
  .auth-list {
    display: flex;
    justify-content: space-between;

    .auth-item {
      width: 294rpx;
      height: 128rpx;
      border-radius: 16rpx;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      position: relative;

      .auth-icon {
        width: 64rpx;
        height: 64rpx;
      }

      .auth-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #000;
      }

      .unauth-wrapper {
        position: relative;

        .warning-icon {
          width: 30rpx;
          height: 30rpx;
          position: absolute;
          top: -40rpx;
          right: -40rpx;
        }

        .auth-subtitle {
          font-size: 24rpx;
          color: #000;
        }
      }
    }
  }
}

/* 学历工作卡片 */
.education-card {
  display: flex;
  flex-direction: column;
  color: #131313;
}

/* 自我介绍卡片 */
.introduce-card {
  .introduce-content {
    .introduce-text {
      font-size: 28rpx;
      color: #6e6e6e;
      line-height: 40rpx;
      white-space: pre-line;
      word-break: break-all;
    }
  }

  .want-see-wrapper {
    display: flex;
    justify-content: center;

    .want-see-btn {
      width: 250rpx;
      height: 80rpx;
      border: 2rpx solid #FF4D4F;
      border-radius: 46rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .want-text {
        font-size: 28rpx;
        color: #FF4D4F;
        line-height: 28rpx;
        font-weight: 500;
      }
    }
  }
}

/* 标签卡片 */
.tags-card {
  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;

    .tag-item-primary {
      color: #384582;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      height: 70rpx;
      background: #DEE4FF;
      border-radius: 36rpx;
      margin-right: 20rpx;
      margin-bottom: 20rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
  }

  .want-see-wrapper {
    display: flex;
    justify-content: center;

    .want-see-btn {
      width: 250rpx;
      height: 80rpx;
      border: 2rpx solid #FF4D4F;
      border-radius: 46rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .want-text {
        font-size: 28rpx;
        color: #FF4D4F;
        line-height: 28rpx;
        font-weight: 500;
      }
    }
  }
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
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  
  .section-icon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 12rpx;
  }
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

/* 灵魂问答卡片 */
.qa-card {
  .question-list {
    .qa-item {
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 48rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .question-row {
        display: flex;
        align-items: flex-start;

        .q-icon {
          width: 44rpx;
          height: 44rpx;
          flex-shrink: 0;
          margin-right: 16rpx;
        }

        .question-text {
          font-size: 28rpx;
          font-weight: 600;
          color: #131313;
          line-height: 40rpx;
          padding-top: 2rpx;
          word-break: break-all;
        }
      }

      .answer-text {
        margin-top: 22rpx;
        margin-left: 60rpx;
        line-height: 40rpx;
        font-size: 28rpx;
        color: #6e6e6e;
      }
    }
  }
}

/* 好友印象卡片 */
.impression-card {
  .impression-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 36rpx;
    font-size: 28rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .friend-label {
      width: 170rpx;
      height: 60rpx;
      font-weight: 500;
      color: #FF4D4F;
      line-height: 28rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(227, 84, 80, 0.06);
      border-radius: 30rpx;
      margin-bottom: 20rpx;

      .friend-icon {
        width: 30rpx;
        height: 30rpx;
        margin-right: 10rpx;
      }
    }

    .impression-content {
      line-height: 40rpx;
      color: #131313;
    }
  }
}

/* 理想对象卡片 */
.ideal-partner-card {
  .ideal-introduce {
    margin-bottom: 20rpx;

    .ideal-text {
      font-size: 28rpx;
      color: #6e6e6e;
      line-height: 36rpx;
    }
  }

  .tags-wrapper {
    display: flex;
    flex-wrap: wrap;

    .tag-item-primary {
      color: #384582;
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      height: 70rpx;
      background: #DEE4FF;
      border-radius: 36rpx;
      margin-right: 20rpx;
      margin-bottom: 20rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
  }

  .want-see-wrapper {
    display: flex;
    justify-content: center;

    .want-see-btn {
      width: 250rpx;
      height: 80rpx;
      border: 2rpx solid #FF4D4F;
      border-radius: 46rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .want-text {
        font-size: 28rpx;
        color: #FF4D4F;
        line-height: 28rpx;
        font-weight: 500;
      }
    }
  }
}

/* 隐私信息卡片 */
.privacy-card {
  .privacy-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40rpx;

    .report-btn {
      font-size: 26rpx;
      color: #6e6e6e;
      display: flex;
      align-items: center;

      .report-icon {
        width: 28rpx;
        height: 28rpx;
        margin-right: 10rpx;
      }
    }
  }

  .privacy-content {
    color: #6e6e6e;

    .wechat-item {
      display: flex;
      align-items: center;
      color: #FF4D4F;

      .wechat-value {
        display: flex;
        align-items: center;

        .copy-icon {
          width: 40rpx;
          height: 40rpx;
          padding: 0 6rpx;
        }
      }

      .locked-text {
        color: #FF4D4F;
      }
    }
  }
}

/* 推荐用户卡片 */
.recommend-card {
  .recommend-scroll {
    width: 610rpx;
    height: 366rpx;
    white-space: nowrap;

    .recommend-list {
      display: flex;

      .recommend-item {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
        margin-right: 20rpx;

        .recommend-avatar {
          width: 160rpx;
          height: 160rpx;
          border-radius: 50%;
          margin-bottom: 20rpx;
        }

        .recommend-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 180rpx;
          margin: 0 10rpx 20rpx;
          text-align: center;
          font-size: 30rpx;
          font-weight: bold;
          line-height: 42rpx;
        }

        .recommend-info {
          font-size: 26rpx;
          color: #131313;
          display: flex;
          justify-content: center;
          padding-bottom: 20rpx;

          .age {
            margin-right: 6rpx;
          }

          .city {
            text-align: right;
            padding-left: 6rpx;
            height: 30rpx;
            max-width: 120rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .recommend-edu {
          font-size: 26rpx;
          color: #131313;
          text-align: center;
          margin: 0 10rpx;
          width: 180rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: calc(132rpx + env(safe-area-inset-bottom));
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 2rpx solid rgba(11, 11, 11, 0.1);
  z-index: 10;

  button {
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;

    &::after {
      border: none;
    }
  }

  .share-btn {
    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: white;
      border-radius: 78rpx;
      width: 290rpx;
      height: 98rpx;
      background: linear-gradient(140deg, #ab60ff 0%, #8a69ff 100%);

      .btn-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 18rpx;
      }

      .btn-text {
        font-weight: 600;
      }
    }
  }

  .wechat-btn {
    margin-left: 20rpx;

    .btn-content {
      background: #FF4D4F;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: white;
      border-radius: 78rpx;
      width: 290rpx;
      height: 98rpx;

      .btn-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 18rpx;
      }

      .btn-text {
        font-weight: 600;
      }
    }
  }
}

/* 绑定模式底部栏 */
.bind-bar {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: calc(132rpx + env(safe-area-inset-bottom));
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 2rpx solid rgba(11, 11, 11, 0.1);
  z-index: 10;

  .bind-btn {
    margin: 0;
    padding: 0;
    background: transparent;
    border: none;

    &::after {
      border: none;
    }

    .bind-content {
      background: #4CAF50;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: white;
      border-radius: 78rpx;
      width: 600rpx;
      height: 98rpx;
      box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);

      .bind-text {
        font-weight: 600;
      }
    }
  }
}

/* 右侧浮动按钮 */
.right-btns {
  position: fixed;
  right: 30rpx;
  bottom: calc(200rpx + env(safe-area-inset-bottom));
  z-index: 10;

  .follow-btn {
    width: 100rpx;
    height: 100rpx;
    background: white;
    border-radius: 50%;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .follow-icon {
      width: 40rpx;
      height: 40rpx;
      margin-bottom: 4rpx;
    }

    .follow-text {
      font-size: 20rpx;
      line-height: 24rpx;
      color: #131313;
    }

    &.followed {
      background: #FF4D4F;

      .follow-text {
        color: white;
      }
    }
  }
}
</style>
