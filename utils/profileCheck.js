import { getUserInfo, getUserStats } from '@/api/index.js'

// 防并发标记
let isChecking = false

// 完善度阈值
const PROFILE_THRESHOLD = 90
const PROFILE_PROMPT_KEY = 'profile_prompt_last_time'
const PROFILE_PROMPT_INTERVAL = 1 * 60 * 1000

// 全局会话标记：每次小程序启动期间最多只弹一次
const SESSION_PROMPT_KEY = 'hasProfilePromptedInSession'

const REQUIRED_FIELDS = [
  { key: 'birthday', label: '出生年份', check: (data) => Boolean(data.birthday) },
  {
    key: 'livingPlace',
    label: '现居地',
    check: (data) => Boolean(data.province && data.city)
  },
  { key: 'education', label: '学历', check: (data) => Boolean(data.education) },
  { key: 'maritalStatus', label: '婚况', check: (data) => Boolean(data.marital_status) },
  {
    key: 'income',
    label: '年收入',
    check: (data) => data.income !== undefined && data.income !== null && String(data.income) !== ''
  },
  { key: 'avatar', label: '头像', check: (data) => Boolean(data.avatar) }
]

function normalizeUserInfo(res) {
  return res?.data?.userinfo || res?.data || {}
}

function getMissingFields(userInfo) {
  return REQUIRED_FIELDS.filter((field) => !field.check(userInfo)).map((field) => field.label)
}

/**
 * 获取 globalData（小程序运行期间全局状态）
 */
function getAppGlobalData() {
  try {
    const app = getApp()
    if (app && app.globalData) {
      return app.globalData
    }
  } catch (e) {
    console.warn('getApp() 不可用', e)
  }
  return null
}

/**
 * 检查当前会话是否已弹过弹框
 */
function hasPromptedInSession() {
  const globalData = getAppGlobalData()
  if (globalData) {
    return globalData[SESSION_PROMPT_KEY] === true
  }
  // 降级：使用本地存储（关闭小程序后需手动清除）
  return uni.getStorageSync(SESSION_PROMPT_KEY) === true
}

/**
 * 标记当前会话已弹过弹框
 */
function markPromptedInSession() {
  const globalData = getAppGlobalData()
  if (globalData) {
    globalData[SESSION_PROMPT_KEY] = true
  }
  // 同时存本地存储作为降级方案
  uni.setStorageSync(SESSION_PROMPT_KEY, true)
}

/**
 * 重置提示标记（登录后调用）
 */
export function resetProfilePrompt() {
  uni.removeStorageSync(PROFILE_PROMPT_KEY)
  // 不重置会话标记，保持当前会话状态
}

/**
 * 重置会话提示标记（小程序启动时调用）
 */
export function resetSessionPromptFlag() {
  const globalData = getAppGlobalData()
  if (globalData) {
    globalData[SESSION_PROMPT_KEY] = false
  }
  uni.removeStorageSync(SESSION_PROMPT_KEY)
}

/**
 * 清除缓存
 */
export function clearProfileCache() {
  uni.removeStorageSync(PROFILE_PROMPT_KEY)
  uni.removeStorageSync(SESSION_PROMPT_KEY)
}

/**
 * 资料检查 Mixin
 * 混入到需要检查资料完善度的页面
 */
export const profileCheckMixin = {
  data() {
    return {
      showProfileModal: false,
      profilePercent: 0,
      profileMissingFields: []
    }
  },
  methods: {
    /**
     * 检查资料完善度
     * @returns {Promise<void>}
     */
    async checkProfileCompletion() {
      // 未登录则跳过检查
      const token = uni.getStorageSync('token')
      if (!token) {
        return
      }

      // 每次小程序打开期间最多只弹一次
      if (hasPromptedInSession()) {
        return
      }

      // 防并发
      if (isChecking) {
        return
      }

      isChecking = true

      try {
        const [infoRes, statsRes] = await Promise.all([
          getUserInfo(),
          getUserStats().catch(() => ({ data: {} }))
        ])
        const userInfo = normalizeUserInfo(infoRes)
        const percent = statsRes?.data?.profile_percent || 0
        const missingFields = getMissingFields(userInfo)

        this.profilePercent = percent
        this.profileMissingFields = missingFields

        if (percent < PROFILE_THRESHOLD) {
          this.showProfileModal = true
          // 标记当前会话已弹过弹框
          markPromptedInSession()
        }
      } catch (e) {
        // 网络错误静默失败，不阻塞用户
        console.error('检查资料完善度失败', e)
      } finally {
        isChecking = false
      }
    },

    /**
     * 点击「立即完善」
     */
    onProfileGuide() {
      uni.setStorageSync(PROFILE_PROMPT_KEY, Date.now())
      this.showProfileModal = false
      uni.navigateTo({
        // url: '/pages/profile/core-info'  // 跳转到核心资料页面
        url: '/pages/profile/edit'  // 跳转到
      })
    },

    /**
     * 点击「稍后再说」
     */
    onProfileDismiss() {
      uni.setStorageSync(PROFILE_PROMPT_KEY, Date.now())
      this.showProfileModal = false
    }
  }
}

export default profileCheckMixin
