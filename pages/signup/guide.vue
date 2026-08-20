<template>
  <view class="guide-container">
    <!-- 提交成功弹框 -->
    <view v-if="showSuccessPopup" class="success-popup-overlay" @click.stop>
      <view class="success-popup-content" @click.stop>
        <view class="success-icon">
          <image src="https://minixhs.chugao520.com/makefriends/images/checked.png" mode="aspectFit" class="success-img"></image>
        </view>
        <view class="success-title">资料提交成功</view>
        <view class="success-text">
          工作人员会精准推荐2-3位合适的异性，注意接听电话~
        </view>
        <button class="success-btn" @click="handleSuccessConfirm">确认</button>
      </view>
    </view>

    <!-- 步骤指示器 -->
    <view class="steps-indicator">
      <view
        v-for="step in totalSteps"
        :key="step"
        :class="['step-bar', { 'step-completed': step <= currentStep }]"
        @click="handleStepClick(step)"
      ></view>
    </view>

    <!-- Step 1: 基础信息 -->
    <scroll-view v-if="currentStep === 1" class="step-content" scroll-y>
      <view class="step-body">
        <!-- 欢迎标题 -->
        <view class="welcome-box">
          <text class="welcome-title">完善基础信息</text>
          <text class="welcome-subtitle">让我们更了解你</text>
        </view>

        <!-- 性别选择 -->
        <view :class="['form-block', { 'shaking': showShaking && !form.gender }]">
          <view class="block-title">
            <text :class="{ 'required-text': !form.gender }">选择你的性别</text>
          </view>
          <view class="gender-selection">
            <view
              class="gender-card"
              :class="{ 'selected': form.gender === 'male' }"
              @click="selectGender('male')"
            >
              <view v-if="form.gender === 'male'" class="selected-badge">
                <view class="check-mark"></view>
              </view>
              <view class="gender-icon male-icon"></view>
              <text :class="['gender-text', { 'selected': form.gender === 'male' }]">男生</text>
            </view>
            <view
              class="gender-card"
              :class="{ 'selected': form.gender === 'female' }"
              @click="selectGender('female')"
            >
              <view v-if="form.gender === 'female'" class="selected-badge">
                <view class="check-mark"></view>
              </view>
              <view class="gender-icon female-icon"></view>
              <text :class="['gender-text', { 'selected': form.gender === 'female' }]">女生</text>
            </view>
          </view>
        </view>
		
		<!-- 昵称输入 -->
		<view class="form-block">
		  <view class="block-title">
		    <text>你的昵称</text>
		  </view>
		  <view class="input-wrapper">
		    <input
		      v-model="form.nickName"
		      class="text-input"
		      placeholder="输入你的昵称..."
		      placeholder-class="input-placeholder"
		    />
		  </view>
		</view>

        <!-- 出生年份 -->
        <view class="form-block">
          <view class="block-title">
            <text>出生年份</text>
          </view>
          <custom-picker
            title="选择出生年份"
            :columns="[birthdayOptions]"
            :value="[birthdayIndex]"
            :displayText="form.birthday ? form.birthday + '年' : ''"
            placeholder="请选择"
            @change="onBirthdayChange"
            @open="pickerOpen = true"
            @close="pickerOpen = false"
          />
        </view>
      </view>
    </scroll-view>

    <!-- Step 2: 详细信息 -->
    <scroll-view v-if="currentStep === 2" class="step-content" scroll-y>
      <view class="step-body">
        <!-- 欢迎标题 -->
        <view class="welcome-box">
          <text class="welcome-title">完善详细信息</text>
          <text class="welcome-subtitle">展示更真实的你</text>
        </view>

        <!-- 学历选择 -->
        <view :class="['form-block', { 'shaking': showShaking && !form.education }]">
          <view class="block-title">
            <text :class="{ 'required-text': !form.education }">选择你的学历</text>
          </view>
          <view class="education-selection">
            <view
              v-for="edu in educationOptions"
              :key="edu"
              :class="['edu-card', { 'selected': form.education === edu }]"
              @click="selectEducation(edu)"
            >
              {{ edu }}
            </view>
          </view>
        </view>

        <!-- 职业输入 -->
        <view class="form-block">
          <view class="block-title">
            <text>你的职业</text>
          </view>
          <view class="input-wrapper">
            <input
              v-model="form.position"
              class="text-input"
              placeholder="输入你的职业..."
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <!-- 年收入 -->
        <view class="form-block">
          <view class="block-title">
            <text>你的年收入</text>
          </view>
          <custom-picker
            title="选择年收入"
            :columns="[incomeOptions]"
            :value="[form.income !== '' ? form.income : 0]"
            :displayText="form.income !== '' ? incomeOptions[form.income] : ''"
            placeholder="请选择"
            @change="onIncomeChange"
            @open="pickerOpen = true"
            @close="pickerOpen = false"
          />
        </view>

        <!-- 婚况 -->
        <view class="form-block">
          <view class="block-title">
            <text>婚况</text>
          </view>
          <custom-picker
            title="选择婚况"
            :columns="[maritalStatusOptions]"
            :value="[maritalStatusIndex]"
            :displayText="form.maritalStatus || ''"
            placeholder="请选择"
            @change="onMaritalStatusChange"
            @open="pickerOpen = true"
            @close="pickerOpen = false"
          />
        </view>
      </view>
    </scroll-view>

    <!-- Step 3: 居住地 -->
    <view v-if="currentStep === 3" class="step-content-static">
      <view class="step-body">
		  
		  <!-- 欢迎标题 -->
		  <view class="welcome-box">
		    <text class="welcome-title">选择居住城市</text>
		    <text class="welcome-subtitle">找到同城的TA</text>
		  </view>
		  
		<!-- 职业输入 -->
		<view class="form-block">
		  <view class="block-title">
		    <text>你的择偶要求</text>
		  </view>
		  <view class="input-wrapper">
		    <textarea
		      class="step-textarea"
		      v-model="form.ideal_intro"
		      placeholder="描述一下你理想中的Ta，可以从性格、外貌、工作、兴趣爱好等方面描述~"
		      maxlength="200"
		    ></textarea>
		    <view class="char-count">{{ (form.ideal_intro || '').length }}/200</view>
		  </view>
		</view>

		<!-- 电话沟通时间 -->
		<view class="form-block">
		  <view class="block-title">
		    <text>电话沟通时间</text>
		  </view>
		  <view class="input-wrapper">
		    <input
		      v-model="form.phone_time"
		      class="text-input"
		      placeholder="方便情感老师推荐意向对象"
		      placeholder-class="input-placeholder"
		      maxlength="20"
		    />
		  </view>
		</view>

		<!-- 你的微信 -->
		<view class="form-block">
		  <view class="block-title">
		    <text>你的微信</text>
		  </view>
		  <view class="input-wrapper">
		    <input
		      v-model="form.wechat"
		      class="text-input"
		      placeholder="方便情感老师沟通"
		      placeholder-class="input-placeholder"
		    />
		  </view>
		</view>

        <!-- 城市选择器 -->
        <view class="city-selector-wrapper">
          <view class="selector-label">选择你的居住地</view>
          <custom-picker
            title="选择居住城市"
            :columns="cityColumns"
            :value="cityValue"
            :displayText="selectedProvinceName && selectedCityName ? selectedProvinceName + ' - ' + selectedCityName : ''"
            placeholder="请选择省份和城市"
            labelKey="name"
            @columnchange="onCityColumnChange"
            @change="onCityChange"
            @open="pickerOpen = true"
            @close="pickerOpen = false"
          />
        </view>
      </view>
    </view>

    <!-- 底部按钮区域 -->
    <view class="bottom-actions" v-if="!pickerOpen">
      <view v-if="currentStep === 1" class="hint-text"></view>
      <view v-if="currentStep === 2" class="hint-text">让对方遇见更真实的你</view>
      <view v-if="currentStep === 3" class="hint-text">为你匹配同城最合适的异性</view>

      <button
        class="next-button"
        @click="handleNext"
        :disabled="isSubmitting"
      >
        {{ buttonText }}（{{ currentStep }}/{{ totalSteps }}）
      </button>
    </view>

    <!-- 位置权限弹窗 -->
    <view v-if="showLocationPopup" class="popup-overlay" @click="closeLocationPopup">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <image src="https://minixhs.chugao520.com/makefriends/images/location.png" class="popup-icon" mode="aspectFit"></image>
          <text class="popup-title">告白时刻Daily 申请</text>
        </view>
        <view class="popup-body">
          <text class="popup-main-text">获取你的位置信息</text>
          <text class="popup-desc-text">将获取你的大致位置信息，用于给你推荐同城市距离较近的嘉宾</text>
        </view>
        <view class="popup-buttons">
          <button class="popup-btn reject" @click="rejectLocation">拒绝</button>
          <button class="popup-btn allow" @click="allowLocation">允许</button>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
import { updateProfile, getAreaList, getUserInfo } from '@/api/index.js'
import CustomPicker from '@/components/custom-picker.vue'

export default {
  components: {
    CustomPicker
  },
  data() {
    return {
      currentStep: 1,
      totalSteps: 3,
      showShaking: false,
      isSubmitting: false,
      showLocationPopup: false,
      showSuccessPopup: false, // 是否显示提交成功弹框
      pickerOpen: false, // 选择器是否打开

      form: {
        gender: '',
        birthday: '',
        education: '',
        position: '',
        income: '',
        maritalStatus: '',
        provinceId: '',
        provinceName: '',
        cityId: '',
        cityName: '',
		nickName:'',
		ideal_intro:'',
		phone_time: '',
		wechat: ''
      },

      educationOptions: ['博士', '硕士', '本科', '大专','高中','中专'],

      incomeOptions: ['5万以下', '5-10万', '10-20万', '20-30万', '30-50万', '50-100万', '100万以上'],
      maritalStatusOptions: ['未婚', '丧偶', '离异'],

      cityColumns: [
        [],
        []
      ],
      cityValue: [0, 0],

      provinceOptions: [],
      cityOptions: [],
      citiesMap: {},

      selectedProvinceName: '',
      selectedCityName: ''
    }
  },

  computed: {
    birthdayOptions() {
      const options = []
      const maxYear = new Date().getFullYear() - 18
      for (let year = 1970; year <= maxYear; year++) {
        options.push(`${year}年`)
      }
      return options
    },
    birthdayIndex() {
      if (!this.form.birthday) {
        // 未选择时，picker 默认打开到 1990 年
        return 1990 - 1970
      }
      const index = this.form.birthday - 1970
      return index >= 0 ? index : 1990 - 1970
    },
    maritalStatusIndex() {
      const index = this.maritalStatusOptions.findIndex(item => item === this.form.maritalStatus)
      return index >= 0 ? index : 0
    },
    buttonText() {
      return this.currentStep < this.totalSteps ? '下一步' : '完成'
    }
  },

  onLoad() {
    this.loadProvinces()
    this.loadSavedData()
    // 延迟获取用户当前位置，确保省份数据已经加载完成
    setTimeout(() => {
      this.getCurrentLocation()
    }, 1000)
  },

  methods: {
    // 加载城市数据
    // 加载省份数据
    async loadProvinces() {
      try {
        const res = await getAreaList(0)
        this.provinceOptions = res.data.list || []
        this.$set(this.cityColumns, 0, this.provinceOptions)

        // 默认加载第一个省份（通常是北京）的城市列表
        if (this.provinceOptions.length > 0 && !this.form.provinceId) {
          const firstProvince = this.provinceOptions[0]
          await this.loadCities(firstProvince.id)
        }

        // 如果有保存的省份，加载对应的城市
        if (this.form.provinceId) {
          await this.loadCities(this.form.provinceId)
          // 恢复选中状态
          const provinceIndex = this.provinceOptions.findIndex(p => p.id === this.form.provinceId)
          let newCityValueIndex = 0
          if (provinceIndex >= 0) {
            newCityValueIndex = provinceIndex
            this.selectedProvinceName = this.provinceOptions[provinceIndex].name
          }
          let newCityIndex = 0
          if (this.form.cityId && this.cityOptions.length > 0) {
            const cityIndex = this.cityOptions.findIndex(c => c.id === this.form.cityId)
            if (cityIndex >= 0) {
              newCityIndex = cityIndex
              this.selectedCityName = this.cityOptions[cityIndex].name
            }
          }
          this.cityValue = [newCityValueIndex, newCityIndex]
        }
      } catch (e) {
        console.error('加载省份失败', e)
        uni.showToast({ title: '加载地区数据失败', icon: 'none' })
      }
    },

    // 加载城市数据
    async loadCities(provinceId) {
      try {
        // 如果已经缓存过，直接使用
        if (this.citiesMap[provinceId]) {
          this.cityOptions = this.citiesMap[provinceId]
          this.$set(this.cityColumns, 1, this.cityOptions)
          return
        }

        const res = await getAreaList(provinceId)
        const cities = res.data.list || []
        this.citiesMap[provinceId] = cities
        this.cityOptions = cities
        this.$set(this.cityColumns, 1, this.cityOptions)
      } catch (e) {
        console.error('加载城市失败', e)
        uni.showToast({ title: '加载城市数据失败', icon: 'none' })
      }
    },

    // 加载已保存的数据
    loadSavedData() {
      const savedData = uni.getStorageSync('signup_guide_data')
      if (savedData) {
        // 只加载非空的字段，避免覆盖默认值
        if (savedData.gender) this.form.gender = savedData.gender
        if (savedData.birthday) this.form.birthday = savedData.birthday
        if (savedData.education) this.form.education = savedData.education
        if (savedData.position) this.form.position = savedData.position
        if (savedData.income !== undefined && savedData.income !== null && savedData.income !== '') this.form.income = savedData.income
        if (savedData.maritalStatus) this.form.maritalStatus = savedData.maritalStatus
        if (savedData.provinceId) this.form.provinceId = savedData.provinceId
        if (savedData.provinceName) this.form.provinceName = savedData.provinceName
        if (savedData.cityId) this.form.cityId = savedData.cityId
        if (savedData.cityName) this.form.cityName = savedData.cityName
        if (savedData.nickName) this.form.nickName = savedData.nickName
        if (savedData.ideal_intro) this.form.ideal_intro = savedData.ideal_intro
        if (savedData.phone_time !== undefined) this.form.phone_time = savedData.phone_time
        if (savedData.wechat !== undefined) this.form.wechat = savedData.wechat
        const savedStep = uni.getStorageSync('signup_guide_step')
        if (savedStep) {
          this.currentStep = savedStep
        }
      }
    },

    // 保存数据
    saveData() {
      uni.setStorageSync('signup_guide_data', this.form)
      uni.setStorageSync('signup_guide_step', this.currentStep)
    },

    // 选择性别
    selectGender(gender) {
      this.form.gender = gender
      this.saveData()
    },

    // 选择学历
    selectEducation(education) {
      this.form.education = education
      this.saveData()
    },

    onBirthdayChange(e) {
      // 自定义组件返回 { value: [index], items: [item] }
      this.form.birthday = 1970 + Number(e.value[0])
      this.saveData()
      // 第一页最后一项，选择后自动跳转下一页
      setTimeout(() => {
        this.handleNext()
      }, 300)
    },
    onIncomeChange(e) {
      // 自定义组件返回 { value: [index], items: [item] }
      this.form.income = Number(e.value[0])
      this.saveData()
    },
    onMaritalStatusChange(e) {
      // 自定义组件返回 { value: [index], items: [item] }
      this.form.maritalStatus = e.items[0] || ''
      this.saveData()
      // 第二页最后一项，选择后自动跳转下一页
      setTimeout(() => {
        this.handleNext()
      }, 300)
    },

    async onCityChange(e) {
      // 自定义组件返回 { value: [provinceIndex, cityIndex], items: [province, city] }
      const [provinceIndex, cityIndex] = e.value
      const province = e.items[0]
      const city = e.items[1]

      if (province && city) {
        this.form.provinceId = province.id
        this.form.provinceName = province.name
        this.form.cityId = city.id
        this.form.cityName = city.name
        this.selectedProvinceName = province.name
        this.selectedCityName = city.name
        this.cityValue = [provinceIndex, cityIndex]
        this.saveData()
      }
    },

    async onCityColumnChange(e) {
      // 自定义组件返回 { column, value }
      const { column, value } = e
      if (column === 0) {
        const province = this.cityColumns[0][value]
        if (province && province.id) {
          await this.loadCities(province.id)
          this.cityValue = [value, 0]
        }
      }
    },

    // 验证当前步骤
    validateCurrentStep() {
      if (this.currentStep === 1) {
        if (!this.form.gender) {
          this.showShakingAnimation()
          uni.showToast({ title: '请选择性别', icon: 'none' })
          return false
        }
        if (!this.form.nickName || !this.form.nickName.trim()) {
          uni.showToast({ title: '请输入昵称', icon: 'none' })
          return false
        }
        if (!this.form.birthday) {
          uni.showToast({ title: '请选择出生年份', icon: 'none' })
          return false
        }
      } else if (this.currentStep === 2) {
        if (!this.form.education) {
          this.showShakingAnimation()
          uni.showToast({ title: '请选择学历', icon: 'none' })
          return false
        }
        if (!this.form.position || !String(this.form.position).trim()) {
          uni.showToast({ title: '请输入职业', icon: 'none' })
          return false
        }
        if (this.form.income === '' || this.form.income === null || this.form.income === undefined) {
          uni.showToast({ title: '请选择年收入', icon: 'none' })
          return false
        }
        if (!this.form.maritalStatus) {
          uni.showToast({ title: '请选择婚况', icon: 'none' })
          return false
        }
      } else if (this.currentStep === 3) {
        if (!this.form.provinceId || !this.form.cityId) {
          uni.showToast({ title: '请选择居住城市', icon: 'none' })
          return false
        }
		if (!this.form.ideal_intro) {
          uni.showToast({ title: '请输入择偶要求', icon: 'none' })
          return false
        }
      }
      return true 
    },

    // 显示抖动动画
    showShakingAnimation() {
      this.showShaking = true
      setTimeout(() => {
        this.showShaking = false
      }, 500)
    },

    // 下一步
    async handleNext() {
      if (this.isSubmitting) return

      // 验证当前步骤
      if (!this.validateCurrentStep()) {
        return
      }

      if (this.currentStep < this.totalSteps) {
        // 进入下一步
        this.currentStep++
        this.saveData()
      } else {
        // 最后一步，提交数据
        await this.submitForm()
      }
    },

    handleStepClick(step) {
      if (this.isSubmitting || step === this.currentStep) {
        return
      }

      if (step > this.currentStep && !this.validateCurrentStep()) {
        return
      }

      this.currentStep = step
      this.saveData()
    },

    // 提交表单
    async submitForm() {
      this.isSubmitting = true

      try {
        // 构造提交数据
        const submitData = {
          gender: this.form.gender === 'male' ? 1 : 2,
          birthday: `${this.form.birthday}-01-01`,
          education: this.form.education,
          job: this.form.position,  // 后端字段是 job
          income: this.incomeOptions[this.form.income],
		  // todo: 前端临时修改收入填写
          // income: parseInt(this.incomeOptions[this.form.income].replace('万', '')),
          marital_status: this.form.maritalStatus,
		  // TODO: 临时修改所在地信息
		  province: this.form.provinceId,  // 后端字段是 province
		  city: this.form.cityId  ,// 后端字段是 city
          // province: this.form.provinceName,  // 后端字段是 province
          city_cn: this.form.cityName  ,// 后端字段是 city
		  nickname:this.form.nickName,
		  ideal_intro:this.form.ideal_intro,
		  phone_time: this.form.phone_time,
		  wechat: this.form.wechat
        }

        await updateProfile(submitData)

        // 重新获取用户信息并更新本地存储
        try {
          const userRes = await getUserInfo()
          const latestUserInfo = userRes.data.userinfo || userRes.data
          uni.setStorageSync('userinfo', latestUserInfo)
          console.log('[Guide] 已更新本地用户信息', { gender: latestUserInfo.gender, education: latestUserInfo.education })
        } catch (err) {
          console.error('[Guide] 更新本地用户信息失败', err)
        }

        // 标记已完成引导
        uni.setStorageSync('signup_guide_completed', true)

        // 清除临时数据
        uni.removeStorageSync('signup_guide_data')
        uni.removeStorageSync('signup_guide_step')

        // 显示成功弹框
        this.showSuccessPopup = true
      } catch (e) {
        uni.showToast({ title: e.msg || '提交失败', icon: 'none' })
      } finally {
        this.isSubmitting = false
      }
    },

    // 点击确认跳转到单身库首页
    handleSuccessConfirm() {
      this.showSuccessPopup = false
      uni.switchTab({ url: '/pages/single/index' })
    },

    // 关闭位置弹窗
    closeLocationPopup() {
      // 不允许点击遮罩关闭
    },

    // 拒绝位置权限
    rejectLocation() {
      this.showLocationPopup = false
      // 继续下一步，但不自动填充城市
      this.currentStep++
      this.saveData()
    },

    // 允许位置权限
    async allowLocation() {
      this.showLocationPopup = false

      // 尝试获取位置
      try {
        const res = await uni.getLocation({ type: 'wgs84' })
        // 这里应该调用API将经纬度转换为城市
        // 简化处理，直接进入下一步
        this.currentStep++
        this.saveData()
      } catch (e) {
        uni.showToast({ title: '获取位置失败', icon: 'none' })
        this.currentStep++
        this.saveData()
      }
    },

    // 获取用户当前位置
    async getCurrentLocation() {
      try {
        console.log('开始获取位置...')
        // 获取位置信息
        const locationRes = await uni.getLocation({
          type: 'wgs84'
        })

        console.log('获取位置成功:', locationRes)

        // 使用逆地理编码获取地址信息
        const geocodeRes = await uni.request({
          url: `https://restapi.amap.com/v3/geocode/regeo`,
          method: 'GET',
          data: {
            key: 'f242a58a1b50a16f387b0a5c0af3f637', // 公开的测试API密钥
            location: `${locationRes.longitude},${locationRes.latitude}`,
            radius: 1000,
            extensions: 'all'
          }
        })

        console.log('逆地理编码响应:', geocodeRes)

        if (geocodeRes.data) {
          console.log('逆地理编码数据:', geocodeRes.data)
          if (geocodeRes.data.status === '1') {
            if (geocodeRes.data.regeocode && geocodeRes.data.regeocode.addressComponent) {
              const addressComponent = geocodeRes.data.regeocode.addressComponent
              const provinceName = addressComponent.province
              const cityName = addressComponent.city || addressComponent.district
              console.log('当前位置:', provinceName, cityName)

            // 等待省份数据加载完成
              await this.$nextTick()
              console.log('省份数据:', this.provinceOptions)

              // 查找对应的省份和城市
              if (provinceName && cityName) {
                await this.setLocationCity(provinceName, cityName)
              } else {
                console.error('地址信息不完整:', addressComponent)
              }
            } else {
              console.error('没有地址组件信息:', geocodeRes.data)
            }
          } else {
            console.error('逆地理编码失败:', geocodeRes.data.info)
          }
        } else {
          console.error('逆地理编码响应异常:', geocodeRes)
        }
      } catch (e) {
        console.error('获取位置失败:', e)
        // 位置获取失败不影响页面正常显示
      }
    },

    // 根据省份和城市名称设置城市选择器
    async setLocationCity(provinceName, cityName) {
      try {
        // 查找省份
        const province = this.provinceOptions.find(p => p.name === provinceName)
        if (!province) {
          console.error('未找到省份:', provinceName)
          return
        }

        // 加载该省份的城市
        await this.loadCities(province.id)

        // 查找城市
        const city = this.cityOptions.find(c => c.name === cityName)
        if (!city) {
          console.error('未找到城市:', cityName)
          return
        }

        // 更新表单数据
        this.form.provinceId = province.id
        this.form.provinceName = province.name
        this.form.cityId = city.id
        this.form.cityName = city.name
        this.selectedProvinceName = province.name
        this.selectedCityName = city.name

        // 更新选择器值
        const provinceIndex = this.provinceOptions.findIndex(p => p.id === province.id)
        const cityIndex = this.cityOptions.findIndex(c => c.id === city.id)
        this.cityValue = [provinceIndex, cityIndex]

        // 保存数据
        this.saveData()

        console.log('自动定位成功:', provinceName, cityName)
      } catch (e) {
        console.error('设置城市失败:', e)
      }
    }
  }
}
</script>

<style scoped>
.guide-container {
  min-height: 100vh;
  background-color: #F8F8F8;
  padding-bottom: 240rpx;
}

/* 步骤指示器 */
.steps-indicator {
  display: flex;
  justify-content: space-evenly;
  padding: 20rpx 30rpx;
  gap: 20rpx;
}

.step-bar {
  flex: 1;
  height: 12rpx;
  background-color: #DADADA;
  border-radius: 6rpx;
  transition: background-color 0.3s;
}

.step-bar.step-completed {
  background-color: #57B976;
}

/* 内容区域 */
.step-content {
  height: 100vh;
}

.step-content-static {
  min-height: calc(100vh - 52rpx - 240rpx);
}

.step-body {
  padding: 0 30rpx 30rpx;
}

/* 欢迎区域 */
.welcome-box {
  text-align: center;
  padding: 40rpx 0 50rpx;
}

.welcome-title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 15rpx;
}

.welcome-subtitle {
  display: block;
  font-size: 28rpx;
  color: #999999;
}

/* 表单块 */
.form-block {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  border: 2rpx dashed transparent;
}

.form-block.shaking {
  border-color: #FF4D4F;
  animation: shake-horizontal 0.5s ease-in-out;
}

@keyframes shake-horizontal {
  0% { transform: translateX(0) rotate(-2deg); }
  25% { transform: translateX(10rpx) rotate(2deg); }
  50% { transform: translateX(-10rpx) rotate(-2deg); }
  75% { transform: translateX(10rpx) rotate(2deg); }
  100% { transform: translateX(0) rotate(0deg); }
}

.block-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #000000;
  margin-bottom: 30rpx;
}

.required-text {
  color: #FF4D4F;
}

.value-text {
  color: #FF4D4F;
  font-size: 26rpx;
}
/* 文本域 */
.step-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx 22rpx;
  background-color: transparent;
  border: 1rpx solid #CBCBCB;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999999;
  margin-top: 10rpx;
  margin-bottom: 40rpx;
}

/* 性别选择 */
.gender-selection {
  display: flex;
  justify-content: space-around;
  gap: 30rpx;
}

.gender-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 20rpx;
  background-color: #F5F5F5;
  border-radius: 22rpx;
  position: relative;
  border: 3rpx solid transparent;
  transition: all 0.3s;
}

.gender-card.selected {
  background-color: #FFF0F0;
  border-color: #FF4D4F;
}

.selected-badge {
  position: absolute;
  top: 15rpx;
  right: 15rpx;
  width: 44rpx;
  height: 44rpx;
  background-color: #FF4D4F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-mark {
  width: 24rpx;
  height: 12rpx;
  border-left: 4rpx solid #FFFFFF;
  border-bottom: 4rpx solid #FFFFFF;
  transform: rotate(-45deg);
  margin-top: -6rpx;
}

.gender-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.male-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.male-icon::before {
  content: '';
  position: absolute;
  width: 50rpx;
  height: 50rpx;
  border: 6rpx solid #FFFFFF;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.male-icon::after {
  content: '';
  position: absolute;
  width: 30rpx;
  height: 6rpx;
  background-color: #FFFFFF;
  top: 20rpx;
  right: 15rpx;
  transform: rotate(45deg);
}

.female-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.female-icon::before {
  content: '';
  position: absolute;
  width: 50rpx;
  height: 50rpx;
  border: 6rpx solid #FFFFFF;
  border-radius: 50%;
  top: 30rpx;
  left: 50%;
  transform: translateX(-50%);
}

.female-icon::after {
  content: '';
  position: absolute;
  width: 6rpx;
  height: 35rpx;
  background-color: #FFFFFF;
  bottom: 15rpx;
  left: 50%;
  transform: translateX(-50%);
}

.gender-text {
  font-size: 28rpx;
  color: #666666;
}

.gender-text.selected {
  color: #FF4D4F;
  font-weight: 600;
}

/* 学历选择 */
.education-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.edu-card {
  flex: 0 0 calc(33.33% - 11rpx);
  height: 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F4F4F4;
  border-radius: 22rpx;
  font-size: 32rpx;
  color: #000000;
  transition: all 0.3s;
}

.edu-card.selected {
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  color: #FFFFFF;
}

/* 输入框 */
.input-wrapper {
  background-color: #F5F5F5;
  border-radius: 16rpx;
  padding: 0 20rpx;
}

.text-input {
  height: 80rpx;
  font-size: 28rpx;
  color: #333333;
}

.input-placeholder {
  color: #999999;
}

/* 下拉选择 */
.select-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25rpx 20rpx;
  background-color: #F8F8F8;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: #333333;
}

.select-display .selected-text {
  flex: 1;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10rpx;
}

.select-display .arrow {
  font-size: 40rpx;
  color: #999999;
  font-weight: 300;
}

/* 城市选择器 */
.city-selector-wrapper {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.selector-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
}

.city-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 30rpx;
  color: #333333;
  padding: 25rpx 20rpx;
  background-color: #F8F8F8;
  border-radius: 16rpx;
}

.city-display .selected-text {
  flex: 1;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10rpx;
}

.city-display .placeholder {
  flex: 1;
  color: #999999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 10rpx;
}

.city-display .arrow {
  font-size: 40rpx;
  color: #999999;
  font-weight: 300;
}

/* 底部按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.hint-text {
  text-align: center;
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 20rpx;
  height: 40rpx;
  line-height: 40rpx;
}

.next-button {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 45rpx;
  border: none;
  box-shadow: 0 10rpx 10rpx 0 rgba(227, 84, 80, 0.2);
}

.next-button::after {
  border: none;
}

.next-button[disabled] {
  opacity: 0.6;
}

/* 位置权限弹窗 */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 9999;
}

.picker-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 10000;
}

.picker-popup-container {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  padding-bottom: calc(env(safe-area-inset-bottom));
}

.picker-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-popup-cancel,
.picker-popup-confirm {
  font-size: 28rpx;
  color: #57B976;
}

.picker-popup-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.picker-view {
  width: 100%;
  height: 420rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 32rpx;
  color: #333333;
}

.popup-content {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  padding: 50rpx 40rpx;
  padding-bottom: calc(50rpx + env(safe-area-inset-bottom));
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

.popup-icon {
  width: 48rpx;
  height: 48rpx;
}

.popup-title {
  font-size: 32rpx;
  color: #333333;
}

.popup-body {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 80rpx;
}

.popup-main-text {
  font-size: 36rpx;
  font-weight: 500;
  color: #333333;
}

.popup-desc-text {
  font-size: 28rpx;
  color: #999999;
  line-height: 1.6;
}

.popup-buttons {
  display: flex;
  justify-content: center;
  gap: 30rpx;
}

.popup-btn {
  width: 220rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;
}

.popup-btn::after {
  border: none;
}

.popup-btn.reject {
  background-color: #F6F6F6;
  color: #07C160;
}

.popup-btn.allow {
  background-color: #07C160;
  color: #FFFFFF;
}

/* 提交成功弹框样式 */
.success-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.success-popup-content {
  width: 600rpx;
  background-color: #FFFFFF;
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  animation: popupFadeIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
}

@keyframes popupFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 30rpx;
}

.success-img {
  width: 100%;
  height: 100%;
}

.success-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.success-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 50rpx;
}

.success-btn {
  width: 400rpx;
  height: 90rpx;
  background: linear-gradient(135deg, #FA731D 0%, #FF4D4F 100%);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 45rpx;
  border: none;
  box-shadow: 0 10rpx 20rpx rgba(227, 84, 80, 0.2);
}

.success-btn::after {
  border: none;
}
</style>
