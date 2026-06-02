<template>
  <view class="core-info-container">
    <!-- 自定义导航栏 -->
	<custom-nav-bar
	  title="核心资料"
	  :isShowBack="true"
	  backgroundImage="/static/bg3.png"
	/>
    <!-- 占位元素，防止导航栏遮挡内容 -->
    <view style="height: 170rpx;"></view>
    <!-- 顶部提示 -->
    <view class="tips-section">
      <text class="tips-text">告白时刻Daily鼓励真实、真诚的社交方式，完善个人信息后，才可获取嘉宾联系方式。</text>
    </view>

    <!-- 表单区域 -->
    <scroll-view class="form-scroll" scroll-y>
      <view class="form-section">
        <!-- 出生年份 -->
        <picker mode="selector" :range="birthdayRange" :value="birthdayIndex || undefined" @change="onBirthdayChange">
        <view class="form-item">
          <text class="item-label">出生年份<text class="required-star">*</text></text>
          <view class="item-value">
            <text class="value-text">{{ formData.birthday ? formData.birthday + '年' : '请选择' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        </picker>

        <!-- 婚况 -->
        <picker mode="selector" :range="maritalStatusRange" :value="maritalStatusIndex" @change="onMaritalStatusChange">
        <view class="form-item">
          <text class="item-label">婚况<text class="required-star">*</text></text>
          <view class="item-value">
            <text class="value-text">{{ formData.maritalStatus || '请选择' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        </picker>

        <!-- 现居地 -->
        <picker mode="multiSelector" :range="livingPlaceRange" :range-key="'name'" :value="livingPlaceValue" @change="onLivingPlaceChange" @columnchange="onLivingPlaceColumnChange">
        <view class="form-item">
          <text class="item-label">现居地<text class="required-star">*</text></text>
          <view class="item-value">
            <text class="value-text">{{ formData.livingPlaceText || '请选择' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        </picker>

        <!-- 家乡 -->
        <picker mode="multiSelector" :range="hometownRange" :range-key="'name'" :value="hometownValue" @change="onHometownChange" @columnchange="onHometownColumnChange">
        <view class="form-item">
          <text class="item-label">家乡</text>
          <view class="item-value">
            <text class="value-text">{{ formData.hometownText || '请选择' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        </picker>

        <!-- 学历 -->
        <picker mode="selector" :range="educationRange" :value="educationIndex" @change="onEducationChange">
        <view class="form-item">
          <text class="item-label">学历<text class="required-star">*</text></text>
          <view class="item-value">
            <text class="value-text">{{ formData.education || '请选择' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        </picker>

        <!-- 职业 -->
        <view class="form-item" @click="showPicker('position')">
          <text class="item-label">职业</text>
          <view class="item-value">
            <text class="value-text">{{ formData.position || '请填写' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 年收入 -->
        <picker mode="selector" :range="incomeRange" :value="incomeIndex || undefined" @change="onIncomeChange">
        <view class="form-item">
          <text class="item-label">年收入<text class="required-star">*</text></text>
          <view class="item-value">
            <text class="value-text">{{ formData.income ? formData.income  : '请选择' }}</text>
            <!-- // todo： 前端临时调整数据格式 <text class="value-text">{{ formData.income ? formData.income + '万' : '请选择' }}</text> -->
            <text class="arrow">›</text>
          </view>
        </view>
        </picker>

        <!-- 是否购房 -->
        <picker mode="selector" :range="hasHouseRange" :value="hasHouseIndex" @change="onHasHouseChange">
        <view class="form-item">
          <text class="item-label">是否购房</text>
          <view class="item-value">
            <text class="value-text">{{ formData.hasHouse || '请选择' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>
        </picker>

        <!-- 真实姓名 -->
        <view class="form-item" @click="showPicker('name')">
          <text class="item-label">真实姓名</text>
          <view class="item-value">
            <text class="value-text">{{ formData.name || '请填写' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 微信号/联系方式 -->
        <view class="form-item" @click="showPicker('wechatNo')">
          <text class="item-label">{{ contactFieldName }}</text>
          <view class="item-value">
            <text class="value-text">{{ formData.wechatNo || '请填写' }}</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <!-- 上传头像 -->
        <view class="photo-section">
          <text class="section-title">上传头像<text class="required-star">*</text></text>
          <view class="photo-upload" @click="chooseImage">
            <image v-if="formData.avatar" :src="formData.avatar" class="avatar-img" mode="aspectFill"></image>
            <view v-else class="upload-placeholder">
              <text class="upload-icon">+</text>
              <text class="upload-text">上传头像</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="footer-btn">
      <button class="submit-btn" @click="handleSubmit" :loading="loading">保存资料</button>
    </view>

    <!-- 底部弹出层 -->
    <view v-show="showPopup" class="popup-overlay" @click="closePopup">
      <view class="popup-container" @click.stop>
        <view class="popup-header">
          <text class="popup-cancel" @click="closePopup">取消</text>
          <text class="popup-title">{{ pickerTitle }}</text>
          <text v-show="currentField === 'position' || currentField === 'name' || currentField === 'wechatNo'" class="popup-confirm" @click="confirmPicker">确定</text>
        </view>

        <!-- 文本输入框 -->
        <view v-show="currentField === 'position' || currentField === 'name' || currentField === 'wechatNo'" class="input-container">
          <input
            v-model="inputValue"
            :placeholder="inputPlaceholder"
            class="text-input"
            :maxlength="currentField === 'wechatNo' ? 50 : 20"
            :focus="true"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import CustomNavBar from '../../components/custom-nav-bar.vue'
import { getUserInfo, updateProfile, getAreaList, uploadAvatar } from '@/api/index.js'

export default {
  components: {
    CustomNavBar
  },
  data() {
    return {
      loading: false,
      showPopup: false,
      contactFieldName: '微信号',
      currentField: '',
      inputValue: '',
      livingPlaceValue: [0, 0],
      hometownValue: [0, 0],

      formData: {
        birthday: '',
        livingPlace: [],
        livingPlaceText: '',
        hometown: [],
        hometownText: '',
        education: '',
        maritalStatus: '',
        position: '',
        income: '',
        hasHouse: '',
        name: '',
        wechatNo: '',
        avatar: ''
      },

      // 选项数据
      birthdayOptions: [],
      provinceOptions: [],
      cityOptions: [],
      educationOptions: [
		  { text: '中专', value: '中专' },
		  { text: '高中', value: '高中' },
        { text: '大专', value: '大专' },
        { text: '本科', value: '本科' },
        { text: '硕士', value: '硕士' },
        { text: '博士', value: '博士' }
      ],
      maritalStatusOptions: [
        { text: '未婚', value: '未婚' },
        { text: '丧偶', value: '丧偶' },
        { text: '离异', value: '离异' }
      ],
      incomeOptions: [],
      hasHouseOptions: [
        { text: '是', value: '是' },
        { text: '否', value: '否' }
      ],

      // 缓存
      citiesMap: {}
    }
  },

  computed: {
    birthdayRange() {
      return this.birthdayOptions.map(item => item.text)
    },
    birthdayIndex() {
      if (this.formData.birthday === null) {
        return null
      }
      const index = this.birthdayOptions.findIndex(item => item.value === this.formData.birthday)
      return index >= 0 ? index : null
    },
    educationRange() {
      return this.educationOptions.map(item => item.text)
    },
    educationIndex() {
      const index = this.educationOptions.findIndex(item => item.value === this.formData.education)
      return index >= 0 ? index : 1
    },
    maritalStatusRange() {
      return this.maritalStatusOptions.map(item => item.text)
    },
    maritalStatusIndex() {
      const index = this.maritalStatusOptions.findIndex(item => item.value === this.formData.maritalStatus)
      return index >= 0 ? index : 0
    },
    incomeRange() {
      return this.incomeOptions.map(item => item.text)
    },
    incomeIndex() {
      if (this.formData.income === null) {
        return null
      }
      const index = this.incomeOptions.findIndex(item => item.value === this.formData.income)
      return index >= 0 ? index : null
    },
    hasHouseRange() {
      return this.hasHouseOptions.map(item => item.text)
    },
    hasHouseIndex() {
      const index = this.hasHouseOptions.findIndex(item => item.value === this.formData.hasHouse)
      return index >= 0 ? index : 0
    },
    livingPlaceRange() {
      return [this.provinceOptions, this.cityOptions]
    },
    hometownRange() {
      return [this.provinceOptions, this.cityOptions]
    },
    pickerTitle() {
      const titles = {
        position: '职业',
        name: '真实姓名',
        wechatNo: this.contactFieldName
      }
      return titles[this.currentField] || ''
    },

    inputPlaceholder() {
      const placeholders = {
        position: '请输入职业',
        name: '请输入姓名',
        wechatNo: `请输入${this.contactFieldName}`
      }
      return placeholders[this.currentField] || ''
    }
  },

  async onLoad(options) {
    this.initOptions()
    // 先加载地区数据，再加载用户信息（这样才能正确显示地区名称）
    await this.loadAreaData()
    await this.loadUserInfo()
  },

  methods: {
    // 初始化选项数据
    initOptions() {
      // 出生年份：1970-2004
      this.birthdayOptions = Array.from({ length: 35 }, (_, i) => ({
        text: `${1970 + i}年`,
        value: 1970 + i
      }))

      // 年收入：0-200万
      const incomes = ['5万以下', '5-10万', '10-20万', '20-30万', '30-50万', '50-100万', '100万以上']
      this.incomeOptions = incomes.map(v => ({
        text: `${v}`,
        // text: `${v}万`,
        value: v
      }))
    },

    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await getUserInfo()
        const userinfo = res.data.userinfo || res.data

        console.log('[CoreInfo] 加载用户信息', userinfo)

        // 填充表单数据
        console.log('[CoreInfo] birthday:', userinfo.birthday)
        if (userinfo.birthday) {
          const year = new Date(userinfo.birthday).getFullYear()
          console.log('[CoreInfo] setting birthday:', year)
          this.formData.birthday = year
        }
        this.formData.education = userinfo.education || ''
        // 婚况字段是 marital_status
        this.formData.maritalStatus = userinfo.marital_status || ''
        // 职业字段是 job，不是 position
        this.formData.position = userinfo.job || userinfo.position || ''
        // 真实姓名字段是 realname，不是 name
        this.formData.name = userinfo.realname || ''
        this.formData.avatar = userinfo.avatar || ''

        // 现居地 - 字段名是 province 和 city
        if (userinfo.province && userinfo.city) {
          this.formData.livingPlace = [userinfo.province, userinfo.city]
          // 从地区列表中查找名称
          await this.loadAreaNames('livingPlace', userinfo.province, userinfo.city)
          const provinceIndex = this.provinceOptions.findIndex(item => item.id == userinfo.province)
          const cityIndex = this.cityOptions.findIndex(item => item.id == userinfo.city)
          this.livingPlaceValue = [provinceIndex >= 0 ? provinceIndex : 0, cityIndex >= 0 ? cityIndex : 0]
        }

        // 家乡 - 字段名是 hometown_province 和 hometown_city
        if (userinfo.hometown_province && userinfo.hometown_city) {
          this.formData.hometown = [userinfo.hometown_province, userinfo.hometown_city]
          // 从地区列表中查找名称
          await this.loadAreaNames('hometown', userinfo.hometown_province, userinfo.hometown_city)
          const provinceIndex = this.provinceOptions.findIndex(item => item.id == userinfo.hometown_province)
          const cityIndex = this.cityOptions.findIndex(item => item.id == userinfo.hometown_city)
          this.hometownValue = [provinceIndex >= 0 ? provinceIndex : 0, cityIndex >= 0 ? cityIndex : 0]
        }

        // 隐私信息
        // income 是字符串，需要转换为数字
        console.log('[CoreInfo] income:', userinfo.income)
        if (userinfo.income !== undefined && userinfo.income !== null && userinfo.income !== '') {
          const income = userinfo.income || 0
          // todo: 前端临时处理数据格式 const income = parseInt(userinfo.income) || 0
          console.log('[CoreInfo] setting income:', income)
          this.formData.income = income
        }
        // has_house 是数字 0/1，需要转换为字符串
        if (userinfo.has_house !== undefined && userinfo.has_house !== null) {
          this.formData.hasHouse = userinfo.has_house == 1 ? '是' : '否'
        }
        // 微信号字段是 wechat，不是 wechat_no
        this.formData.wechatNo = userinfo.wechat || userinfo.wechat_no || ''

        console.log('[CoreInfo] 表单数据已填充', this.formData)

      } catch (e) {
        console.error('加载用户信息失败', e)
      }
    },

    // 加载地区名称
    async loadAreaNames(field, provinceCode, cityCode) {
      try {
        // 查找省份名称
        const province = this.provinceOptions.find(p => p.id == provinceCode)
        if (!province) return

        // 加载该省份的城市列表
        await this.loadCities(provinceCode)

        // 查找城市名称
        const city = this.cityOptions.find(c => c.id == cityCode)
        if (!city) return

        // 设置显示文本
        if (field === 'livingPlace') {
          this.formData.livingPlaceText = `${province.name}-${city.name}`
        } else if (field === 'hometown') {
          this.formData.hometownText = `${province.name}-${city.name}`
        }
      } catch (e) {
        console.error('加载地区名称失败', e)
      }
    },

    // 加载地区数据
    async loadAreaData() {
      try {
        const res = await getAreaList(0)
        this.provinceOptions = res.data.list || []

        // 默认加载第一个省份的城市
        if (this.provinceOptions.length > 0) {
          await this.loadCities(this.provinceOptions[0].id)
        }
      } catch (e) {
        console.error('加载地区数据失败', e)
      }
    },

    // 加载城市数据
    async loadCities(provinceId) {
      if (this.citiesMap[provinceId]) {
        this.cityOptions = this.citiesMap[provinceId]
        return
      }

      try {
        const res = await getAreaList(provinceId)
        const cities = res.data.list || []
        this.citiesMap[provinceId] = cities
        this.cityOptions = cities
      } catch (e) {
        console.error('加载城市数据失败', e)
      }
    },

    onBirthdayChange(e) {
      const selected = this.birthdayOptions[Number(e.detail.value)]
      this.formData.birthday = selected ? selected.value : ''
    },
    onEducationChange(e) {
      const selected = this.educationOptions[Number(e.detail.value)]
      this.formData.education = selected ? selected.value : ''
    },
    onMaritalStatusChange(e) {
      const selected = this.maritalStatusOptions[Number(e.detail.value)]
      this.formData.maritalStatus = selected ? selected.value : ''
    },
    onIncomeChange(e) {
      const selected = this.incomeOptions[Number(e.detail.value)]
      this.formData.income = selected ? selected.value : ''
    },
    onHasHouseChange(e) {
      const selected = this.hasHouseOptions[Number(e.detail.value)]
      this.formData.hasHouse = selected ? selected.value : ''
    },
    onLivingPlaceChange(e) {
      const [provinceIndex, cityIndex] = e.detail.value
      const province = this.provinceOptions[provinceIndex]
      const city = this.cityOptions[cityIndex]
      if (province && city) {
        this.formData.livingPlace = [province.id, city.id]
        this.formData.livingPlaceText = `${province.name}-${city.name}`
        this.livingPlaceValue = [provinceIndex, cityIndex]
      }
    },
    async onLivingPlaceColumnChange(e) {
      if (e.detail.column === 0) {
        const province = this.provinceOptions[e.detail.value]
        if (province) {
          await this.loadCities(province.id)
          this.livingPlaceValue = [e.detail.value, 0]
        }
      }
    },
    onHometownChange(e) {
      const [provinceIndex, cityIndex] = e.detail.value
      const province = this.provinceOptions[provinceIndex]
      const city = this.cityOptions[cityIndex]
      if (province && city) {
        this.formData.hometown = [province.id, city.id]
        this.formData.hometownText = `${province.name}-${city.name}`
        this.hometownValue = [provinceIndex, cityIndex]
      }
    },
    async onHometownColumnChange(e) {
      if (e.detail.column === 0) {
        const province = this.provinceOptions[e.detail.value]
        if (province) {
          await this.loadCities(province.id)
          this.hometownValue = [e.detail.value, 0]
        }
      }
    },

    showPicker(field) {
      this.currentField = field
      if (field === 'position') {
        this.inputValue = this.formData.position
      } else if (field === 'name') {
        this.inputValue = this.formData.name
      } else if (field === 'wechatNo') {
        this.inputValue = this.formData.wechatNo
      }
      this.showPopup = true
    },

    // 关闭弹窗
    closePopup() {
      this.showPopup = false
    },

    confirmPicker() {
      const field = this.currentField
      if (field === 'position') {
        this.formData.position = this.inputValue
      } else if (field === 'name') {
        this.formData.name = this.inputValue
      } else if (field === 'wechatNo') {
        this.formData.wechatNo = this.inputValue
      }

      this.closePopup()
    },

    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.uploadImage(tempFilePath)
        }
      })
    },

    // 上传图片
    async uploadImage(filePath) {
      try {
        uni.showLoading({ title: '上传中...' })

        const uploadRes = await uploadAvatar(filePath)

        if (uploadRes.data && uploadRes.data.url) {
          this.formData.avatar = uploadRes.data.url
          uni.showToast({ title: '上传成功', icon: 'success' })
        } else {
          uni.showToast({ title: '上传失败', icon: 'none' })
        }
      } catch (e) {
        console.error('[CoreInfo] 上传图片失败', e)
        uni.showToast({ title: e.msg || '上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    // 提交表单
    async handleSubmit() {
      // 验证必填项
      if (!this.formData.birthday) {
        return uni.showToast({ title: '请选择出生年份', icon: 'none' })
      }
      if (!this.formData.livingPlace || this.formData.livingPlace.length === 0) {
        return uni.showToast({ title: '请选择现居地', icon: 'none' })
      }
      if (!this.formData.education) {
        return uni.showToast({ title: '请选择学历', icon: 'none' })
      }
      if (!this.formData.maritalStatus) {
        return uni.showToast({ title: '请选择婚况', icon: 'none' })
      }
      if (this.formData.income === '') {
        return uni.showToast({ title: '请选择年收入', icon: 'none' })
      }
      if (!this.formData.avatar) {
        return uni.showToast({ title: '请上传头像', icon: 'none' })
      }

      this.loading = true

      try {
        const isBase64Avatar = typeof this.formData.avatar === 'string' && this.formData.avatar.startsWith('data:')

        // 构造提交数据
        const submitData = {
          birthday: `${this.formData.birthday}-01-01`,
          education: this.formData.education,
          marital_status: this.formData.maritalStatus,  // 后端字段是 marital_status
          job: this.formData.position,  // 后端字段是 job
          income: this.formData.income,
          realname: this.formData.name,  // 后端字段是 realname
          // 现居地 - 后端字段是 province 和 city
          province: this.formData.livingPlace[0],
          city: this.formData.livingPlace[1],
          // 家乡 - 后端字段是 hometown_province 和 hometown_city
          hometown_province: this.formData.hometown[0] || '',
          hometown_city: this.formData.hometown[1] || '',
          // 购房状态
          has_house: this.formData.hasHouse ? (this.formData.hasHouse === '是' ? 1 : 0) : '',
          // 微信号
          wechat: this.formData.wechatNo
        }

        if (!isBase64Avatar) {
          submitData.avatar = this.formData.avatar
        }

        console.log('[CoreInfo] 提交数据', submitData)

        await updateProfile(submitData)

        // 更新本地存储
        const userinfo = uni.getStorageSync('userinfo') || {}
        Object.assign(userinfo, {
          birthday: submitData.birthday,
          education: submitData.education,
          marital_status: submitData.marital_status,
          job: submitData.job,
          income: String(submitData.income),
          realname: submitData.realname,
          province: submitData.province,
          city: submitData.city,
          hometown_province: submitData.hometown_province,
          hometown_city: submitData.hometown_city,
          has_house: submitData.has_house,
          wechat: submitData.wechat
        })
        if (!isBase64Avatar && submitData.avatar) {
          userinfo.avatar = submitData.avatar
        }
        uni.setStorageSync('userinfo', userinfo)

        console.log('[CoreInfo] 本地存储已更新', userinfo)

        uni.showToast({ title: '提交成功', icon: 'success' })

        setTimeout(() => {
          uni.navigateBack()
        }, 1500)

      } catch (e) {
        console.error('[CoreInfo] 提交失败', e)
        uni.showToast({ title: e.msg || '提交失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.core-info-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.tips-section {
  background: linear-gradient(135deg, #ffe5e5 0%, #fff0f0 100%);
  border: 2rpx solid #ffd4d4;
  border-radius: 20rpx;
  margin: 30rpx;
  padding: 30rpx;
}

.tips-text {
  font-size: 28rpx;
  color: #ff4d4f;
  line-height: 42rpx;
}

.form-scroll {
  height: calc(100vh - 280rpx);
}

.form-section {
  background-color: #ffffff;
  margin: 20rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.required-star {
  color: #FF4D4F;
  font-size: 32rpx;
  margin-left: 8rpx;
}

.item-value {
  display: flex;
  align-items: center;
}

.value-text {
  font-size: 30rpx;
  color: #666666;
  margin-right: 10rpx;
}

.arrow {
  font-size: 40rpx;
  color: #999999;
}

.photo-section {
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  display: block;
  margin-bottom: 30rpx;
}

.photo-upload {
  width: 240rpx;
  height: 240rpx;
  border: 2rpx solid #eeeeee;
  border-radius: 10rpx;
  margin: 0 auto 20rpx;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.upload-icon {
  font-size: 80rpx;
  color: #cccccc;
  margin-bottom: 20rpx;
}

.upload-text {
  font-size: 28rpx;
  color: #999999;
}

.photo-tips {
  font-size: 24rpx;
  color: #999999;
  text-align: center;
  display: block;
}

.footer-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(270deg, #8068F7 0%, #624EEE 100%);
  color: #FFFFFF;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 50rpx;
  border: none;
  line-height: 100rpx;
}

/* 弹窗样式 */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.popup-container {
  width: 100%;
  background-color: #ffffff;
  border-radius: 20rpx 20rpx 0 0;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-cancel {
  font-size: 30rpx;
  color: #999999;
}

.popup-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.popup-confirm {
  font-size: 30rpx;
  color: #ff4d4f;
}

.picker-view {
  height: 500rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #333333;
}

/* 自定义滚动选择器样式 */
.custom-picker-container {
  position: relative;
  height: 500rpx;
  overflow: hidden;
}

.custom-picker-scroll {
  height: 100%;
  width: 100%;
}

.custom-picker-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.custom-picker-item {
  height: 80rpx;
  line-height: 80rpx;
  font-size: 30rpx;
  color: #999999;
  transition: all 0.3s ease;
}

.custom-picker-item.active {
  color: #333333;
  font-size: 34rpx;
  font-weight: 500;
}

.custom-picker-indicator {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 80rpx;
  margin-top: -40rpx;
  border-top: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
  pointer-events: none;
}

.input-container {
  padding: 30rpx;
  min-height: 300rpx;
}

.text-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #eeeeee;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 30rpx;
  color: #333333;
}
</style>
