import { getUserInfo, getUserStats } from '@/api/index.js'

// 防并发标记
let isChecking = false

// 完善度阈值
const PROFILE_THRESHOLD = 90
const PROFILE_PROMPT_KEY = 'profile_prompt_last_time'
const PROFILE_PROMPT_INTERVAL = 1 * 60 * 1000

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
 * 重置提示标记（登录后调用）
 */
export function resetProfilePrompt() {
  uni.removeStorageSync(PROFILE_PROMPT_KEY)
}

/**
 * 清除缓存
 */
export function clearProfileCache() {
  uni.removeStorageSync(PROFILE_PROMPT_KEY)
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

      const lastPromptTime = Number(uni.getStorageSync(PROFILE_PROMPT_KEY) || 0)
      if (lastPromptTime && (Date.now() - lastPromptTime) < PROFILE_PROMPT_INTERVAL) {
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
