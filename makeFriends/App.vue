<script>
	import { isXhsMiniApp, checkSession } from '@/utils/xhsLogin.js'
	import { getUserInfo } from '@/api/index.js'

	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 检查登录状态
			this.checkLoginStatus()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			// 检查登录状态
			async checkLoginStatus() {
				const token = uni.getStorageSync('token')

				if (!token) {
					console.log('[App] 未登录，游客态浏览')
					uni.setStorageSync('is_guest_mode', true)
					return
				}

				// 检查是否需要填写引导信息（只检查基础信息：性别和学历）
				const userinfo = uni.getStorageSync('userinfo')

				// 如果 userinfo 是空对象或不存在，可能是存储损坏，清除后返回
				if (!userinfo || !userinfo.id) {
					console.log('[App] 本地用户信息异常，清除后降级为游客态')
					this.clearLoginState()
					return
				}

				// 小红书环境下检查 session 是否有效
				if (isXhsMiniApp()) {
					const sessionValid = await checkSession()
					if (!sessionValid) {
						console.log('[App] 小红书 session 已过期，清除登录信息降级为游客态')
						this.clearLoginState()
						return
					}
				}

				// 关键：调用后端接口验证 token 是否仍然有效，并刷新用户信息
				try {
					const res = await getUserInfo()
					const freshUserInfo = res.data.userinfo || res.data || {}
					if (!freshUserInfo.id) {
						console.log('[App] 后端返回用户信息异常，降级为游客态')
						this.clearLoginState()
						return
					}
					// 更新本地存储，确保信息最新
					uni.setStorageSync('userinfo', freshUserInfo)
					console.log('[App] token 验证通过，用户信息已刷新')

					// 明确检查：gender 必须是 1 或 2，education 必须非空
					const hasGender = freshUserInfo.gender && freshUserInfo.gender !== 0
					const hasEducation = freshUserInfo.education && freshUserInfo.education !== ''
					if (!hasGender || !hasEducation) {
						console.log('[App] 基础信息未完成，需要填写引导信息', { gender: freshUserInfo.gender, education: freshUserInfo.education })
						// 延迟跳转，确保页面已加载
						setTimeout(() => {
							const pages = getCurrentPages()
							const currentPage = pages[pages.length - 1]
							// 如果当前不在引导页，则跳转
							if (currentPage && currentPage.route !== 'pages/signup/guide') {
								uni.redirectTo({ url: '/pages/signup/guide' })
							}
						}, 500)
					}
				} catch (e) {
					if (e._isAuthError) {
						console.log('[App] token 已过期，降级为游客态')
						// request.js 已清除存储，这里只需确保状态一致
						uni.setStorageSync('is_guest_mode', true)
					} else {
						console.error('[App] 验证登录状态失败', e)
						// 网络异常时不盲目清除，但标记需要重新验证
						uni.setStorageSync('login_needs_refresh', true)
					}
				}
			},

			clearLoginState() {
				uni.removeStorageSync('token')
				uni.removeStorageSync('userinfo')
				uni.removeStorageSync('userInfo')
				uni.removeStorageSync('xhs_openid')
				uni.setStorageSync('is_guest_mode', true)
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
