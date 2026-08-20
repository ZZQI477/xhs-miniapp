"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const CustomPicker = () => "../../components/custom-picker.js";
const _sfc_main = {
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
      showSuccessPopup: false,
      // 是否显示提交成功弹框
      pickerOpen: false,
      // 选择器是否打开
      form: {
        gender: "",
        birthday: "",
        education: "",
        position: "",
        income: "",
        maritalStatus: "",
        provinceId: "",
        provinceName: "",
        cityId: "",
        cityName: "",
        nickName: "",
        ideal_intro: "",
        phone_time: "",
        wechat: ""
      },
      educationOptions: ["博士", "硕士", "本科", "大专", "高中", "中专"],
      incomeOptions: ["5万以下", "5-10万", "10-20万", "20-30万", "30-50万", "50-100万", "100万以上"],
      maritalStatusOptions: ["未婚", "丧偶", "离异"],
      cityColumns: [
        [],
        []
      ],
      cityValue: [0, 0],
      provinceOptions: [],
      cityOptions: [],
      citiesMap: {},
      selectedProvinceName: "",
      selectedCityName: ""
    };
  },
  computed: {
    birthdayOptions() {
      const options = [];
      const maxYear = (/* @__PURE__ */ new Date()).getFullYear() - 18;
      for (let year = 1970; year <= maxYear; year++) {
        options.push(`${year}年`);
      }
      return options;
    },
    birthdayIndex() {
      if (!this.form.birthday) {
        return 1990 - 1970;
      }
      const index = this.form.birthday - 1970;
      return index >= 0 ? index : 1990 - 1970;
    },
    maritalStatusIndex() {
      const index = this.maritalStatusOptions.findIndex((item) => item === this.form.maritalStatus);
      return index >= 0 ? index : 0;
    },
    buttonText() {
      return this.currentStep < this.totalSteps ? "下一步" : "完成";
    }
  },
  onLoad() {
    this.loadProvinces();
    this.loadSavedData();
    setTimeout(() => {
      this.getCurrentLocation();
    }, 1e3);
  },
  methods: {
    // 加载城市数据
    // 加载省份数据
    async loadProvinces() {
      try {
        const res = await api_index.getAreaList(0);
        this.provinceOptions = res.data.list || [];
        this.$set(this.cityColumns, 0, this.provinceOptions);
        if (this.provinceOptions.length > 0 && !this.form.provinceId) {
          const firstProvince = this.provinceOptions[0];
          await this.loadCities(firstProvince.id);
        }
        if (this.form.provinceId) {
          await this.loadCities(this.form.provinceId);
          const provinceIndex = this.provinceOptions.findIndex((p) => p.id === this.form.provinceId);
          let newCityValueIndex = 0;
          if (provinceIndex >= 0) {
            newCityValueIndex = provinceIndex;
            this.selectedProvinceName = this.provinceOptions[provinceIndex].name;
          }
          let newCityIndex = 0;
          if (this.form.cityId && this.cityOptions.length > 0) {
            const cityIndex = this.cityOptions.findIndex((c) => c.id === this.form.cityId);
            if (cityIndex >= 0) {
              newCityIndex = cityIndex;
              this.selectedCityName = this.cityOptions[cityIndex].name;
            }
          }
          this.cityValue = [newCityValueIndex, newCityIndex];
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/signup/guide.vue:416", "加载省份失败", e);
        common_vendor.index.showToast({ title: "加载地区数据失败", icon: "none" });
      }
    },
    // 加载城市数据
    async loadCities(provinceId) {
      try {
        if (this.citiesMap[provinceId]) {
          this.cityOptions = this.citiesMap[provinceId];
          this.$set(this.cityColumns, 1, this.cityOptions);
          return;
        }
        const res = await api_index.getAreaList(provinceId);
        const cities = res.data.list || [];
        this.citiesMap[provinceId] = cities;
        this.cityOptions = cities;
        this.$set(this.cityColumns, 1, this.cityOptions);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/signup/guide.vue:437", "加载城市失败", e);
        common_vendor.index.showToast({ title: "加载城市数据失败", icon: "none" });
      }
    },
    // 加载已保存的数据
    loadSavedData() {
      const savedData = common_vendor.index.getStorageSync("signup_guide_data");
      if (savedData) {
        if (savedData.gender)
          this.form.gender = savedData.gender;
        if (savedData.birthday)
          this.form.birthday = savedData.birthday;
        if (savedData.education)
          this.form.education = savedData.education;
        if (savedData.position)
          this.form.position = savedData.position;
        if (savedData.income !== void 0 && savedData.income !== null && savedData.income !== "")
          this.form.income = savedData.income;
        if (savedData.maritalStatus)
          this.form.maritalStatus = savedData.maritalStatus;
        if (savedData.provinceId)
          this.form.provinceId = savedData.provinceId;
        if (savedData.provinceName)
          this.form.provinceName = savedData.provinceName;
        if (savedData.cityId)
          this.form.cityId = savedData.cityId;
        if (savedData.cityName)
          this.form.cityName = savedData.cityName;
        if (savedData.nickName)
          this.form.nickName = savedData.nickName;
        if (savedData.ideal_intro)
          this.form.ideal_intro = savedData.ideal_intro;
        if (savedData.phone_time !== void 0)
          this.form.phone_time = savedData.phone_time;
        if (savedData.wechat !== void 0)
          this.form.wechat = savedData.wechat;
        const savedStep = common_vendor.index.getStorageSync("signup_guide_step");
        if (savedStep) {
          this.currentStep = savedStep;
        }
      }
    },
    // 保存数据
    saveData() {
      common_vendor.index.setStorageSync("signup_guide_data", this.form);
      common_vendor.index.setStorageSync("signup_guide_step", this.currentStep);
    },
    // 选择性别
    selectGender(gender) {
      this.form.gender = gender;
      this.saveData();
    },
    // 选择学历
    selectEducation(education) {
      this.form.education = education;
      this.saveData();
    },
    onBirthdayChange(e) {
      this.form.birthday = 1970 + Number(e.value[0]);
      this.saveData();
      setTimeout(() => {
        this.handleNext();
      }, 300);
    },
    onIncomeChange(e) {
      this.form.income = Number(e.value[0]);
      this.saveData();
    },
    onMaritalStatusChange(e) {
      this.form.maritalStatus = e.items[0] || "";
      this.saveData();
      setTimeout(() => {
        this.handleNext();
      }, 300);
    },
    async onCityChange(e) {
      const [provinceIndex, cityIndex] = e.value;
      const province = e.items[0];
      const city = e.items[1];
      if (province && city) {
        this.form.provinceId = province.id;
        this.form.provinceName = province.name;
        this.form.cityId = city.id;
        this.form.cityName = city.name;
        this.selectedProvinceName = province.name;
        this.selectedCityName = city.name;
        this.cityValue = [provinceIndex, cityIndex];
        this.saveData();
      }
    },
    async onCityColumnChange(e) {
      const { column, value } = e;
      if (column === 0) {
        const province = this.cityColumns[0][value];
        if (province && province.id) {
          await this.loadCities(province.id);
          this.cityValue = [value, 0];
        }
      }
    },
    // 验证当前步骤
    validateCurrentStep() {
      if (this.currentStep === 1) {
        if (!this.form.gender) {
          this.showShakingAnimation();
          common_vendor.index.showToast({ title: "请选择性别", icon: "none" });
          return false;
        }
        if (!this.form.nickName || !this.form.nickName.trim()) {
          common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
          return false;
        }
        if (!this.form.birthday) {
          common_vendor.index.showToast({ title: "请选择出生年份", icon: "none" });
          return false;
        }
      } else if (this.currentStep === 2) {
        if (!this.form.education) {
          this.showShakingAnimation();
          common_vendor.index.showToast({ title: "请选择学历", icon: "none" });
          return false;
        }
        if (!this.form.position || !String(this.form.position).trim()) {
          common_vendor.index.showToast({ title: "请输入职业", icon: "none" });
          return false;
        }
        if (this.form.income === "" || this.form.income === null || this.form.income === void 0) {
          common_vendor.index.showToast({ title: "请选择年收入", icon: "none" });
          return false;
        }
        if (!this.form.maritalStatus) {
          common_vendor.index.showToast({ title: "请选择婚况", icon: "none" });
          return false;
        }
      } else if (this.currentStep === 3) {
        if (!this.form.provinceId || !this.form.cityId) {
          common_vendor.index.showToast({ title: "请选择居住城市", icon: "none" });
          return false;
        }
        if (!this.form.ideal_intro) {
          common_vendor.index.showToast({ title: "请输入择偶要求", icon: "none" });
          return false;
        }
      }
      return true;
    },
    // 显示抖动动画
    showShakingAnimation() {
      this.showShaking = true;
      setTimeout(() => {
        this.showShaking = false;
      }, 500);
    },
    // 下一步
    async handleNext() {
      if (this.isSubmitting)
        return;
      if (!this.validateCurrentStep()) {
        return;
      }
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.saveData();
      } else {
        await this.submitForm();
      }
    },
    handleStepClick(step) {
      if (this.isSubmitting || step === this.currentStep) {
        return;
      }
      if (step > this.currentStep && !this.validateCurrentStep()) {
        return;
      }
      this.currentStep = step;
      this.saveData();
    },
    // 提交表单
    async submitForm() {
      this.isSubmitting = true;
      try {
        const submitData = {
          gender: this.form.gender === "male" ? 1 : 2,
          birthday: `${this.form.birthday}-01-01`,
          education: this.form.education,
          job: this.form.position,
          // 后端字段是 job
          income: this.incomeOptions[this.form.income],
          // todo: 前端临时修改收入填写
          // income: parseInt(this.incomeOptions[this.form.income].replace('万', '')),
          marital_status: this.form.maritalStatus,
          // TODO: 临时修改所在地信息
          province: this.form.provinceId,
          // 后端字段是 province
          city: this.form.cityId,
          // 后端字段是 city
          // province: this.form.provinceName,  // 后端字段是 province
          city_cn: this.form.cityName,
          // 后端字段是 city
          nickname: this.form.nickName,
          ideal_intro: this.form.ideal_intro,
          phone_time: this.form.phone_time,
          wechat: this.form.wechat
        };
        await api_index.updateProfile(submitData);
        try {
          const userRes = await api_index.getUserInfo();
          const latestUserInfo = userRes.data.userinfo || userRes.data;
          common_vendor.index.setStorageSync("userinfo", latestUserInfo);
          common_vendor.index.__f__("log", "at pages/signup/guide.vue:660", "[Guide] 已更新本地用户信息", { gender: latestUserInfo.gender, education: latestUserInfo.education });
        } catch (err) {
          common_vendor.index.__f__("error", "at pages/signup/guide.vue:662", "[Guide] 更新本地用户信息失败", err);
        }
        common_vendor.index.setStorageSync("signup_guide_completed", true);
        common_vendor.index.removeStorageSync("signup_guide_data");
        common_vendor.index.removeStorageSync("signup_guide_step");
        this.showSuccessPopup = true;
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "提交失败", icon: "none" });
      } finally {
        this.isSubmitting = false;
      }
    },
    // 点击确认跳转到单身库首页
    handleSuccessConfirm() {
      this.showSuccessPopup = false;
      common_vendor.index.switchTab({ url: "/pages/single/index" });
    },
    // 关闭位置弹窗
    closeLocationPopup() {
    },
    // 拒绝位置权限
    rejectLocation() {
      this.showLocationPopup = false;
      this.currentStep++;
      this.saveData();
    },
    // 允许位置权限
    async allowLocation() {
      this.showLocationPopup = false;
      try {
        const res = await common_vendor.index.getLocation({ type: "wgs84" });
        this.currentStep++;
        this.saveData();
      } catch (e) {
        common_vendor.index.showToast({ title: "获取位置失败", icon: "none" });
        this.currentStep++;
        this.saveData();
      }
    },
    // 获取用户当前位置
    async getCurrentLocation() {
      try {
        common_vendor.index.__f__("log", "at pages/signup/guide.vue:721", "开始获取位置...");
        const locationRes = await common_vendor.index.getLocation({
          type: "wgs84"
        });
        common_vendor.index.__f__("log", "at pages/signup/guide.vue:727", "获取位置成功:", locationRes);
        const geocodeRes = await common_vendor.index.request({
          url: `https://restapi.amap.com/v3/geocode/regeo`,
          method: "GET",
          data: {
            key: "f242a58a1b50a16f387b0a5c0af3f637",
            // 公开的测试API密钥
            location: `${locationRes.longitude},${locationRes.latitude}`,
            radius: 1e3,
            extensions: "all"
          }
        });
        common_vendor.index.__f__("log", "at pages/signup/guide.vue:741", "逆地理编码响应:", geocodeRes);
        if (geocodeRes.data) {
          common_vendor.index.__f__("log", "at pages/signup/guide.vue:744", "逆地理编码数据:", geocodeRes.data);
          if (geocodeRes.data.status === "1") {
            if (geocodeRes.data.regeocode && geocodeRes.data.regeocode.addressComponent) {
              const addressComponent = geocodeRes.data.regeocode.addressComponent;
              const provinceName = addressComponent.province;
              const cityName = addressComponent.city || addressComponent.district;
              common_vendor.index.__f__("log", "at pages/signup/guide.vue:750", "当前位置:", provinceName, cityName);
              await this.$nextTick();
              common_vendor.index.__f__("log", "at pages/signup/guide.vue:754", "省份数据:", this.provinceOptions);
              if (provinceName && cityName) {
                await this.setLocationCity(provinceName, cityName);
              } else {
                common_vendor.index.__f__("error", "at pages/signup/guide.vue:760", "地址信息不完整:", addressComponent);
              }
            } else {
              common_vendor.index.__f__("error", "at pages/signup/guide.vue:763", "没有地址组件信息:", geocodeRes.data);
            }
          } else {
            common_vendor.index.__f__("error", "at pages/signup/guide.vue:766", "逆地理编码失败:", geocodeRes.data.info);
          }
        } else {
          common_vendor.index.__f__("error", "at pages/signup/guide.vue:769", "逆地理编码响应异常:", geocodeRes);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/signup/guide.vue:772", "获取位置失败:", e);
      }
    },
    // 根据省份和城市名称设置城市选择器
    async setLocationCity(provinceName, cityName) {
      try {
        const province = this.provinceOptions.find((p) => p.name === provinceName);
        if (!province) {
          common_vendor.index.__f__("error", "at pages/signup/guide.vue:783", "未找到省份:", provinceName);
          return;
        }
        await this.loadCities(province.id);
        const city = this.cityOptions.find((c) => c.name === cityName);
        if (!city) {
          common_vendor.index.__f__("error", "at pages/signup/guide.vue:793", "未找到城市:", cityName);
          return;
        }
        this.form.provinceId = province.id;
        this.form.provinceName = province.name;
        this.form.cityId = city.id;
        this.form.cityName = city.name;
        this.selectedProvinceName = province.name;
        this.selectedCityName = city.name;
        const provinceIndex = this.provinceOptions.findIndex((p) => p.id === province.id);
        const cityIndex = this.cityOptions.findIndex((c) => c.id === city.id);
        this.cityValue = [provinceIndex, cityIndex];
        this.saveData();
        common_vendor.index.__f__("log", "at pages/signup/guide.vue:813", "自动定位成功:", provinceName, cityName);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/signup/guide.vue:815", "设置城市失败:", e);
      }
    }
  }
};
if (!Array) {
  const _component_custom_picker = common_vendor.resolveComponent("custom-picker");
  _component_custom_picker();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.showSuccessPopup
  }, $data.showSuccessPopup ? {
    b: common_vendor.o((...args) => $options.handleSuccessConfirm && $options.handleSuccessConfirm(...args), "b0"),
    c: common_vendor.o(() => {
    }, "39"),
    d: common_vendor.o(() => {
    }, "b9")
  } : {}, {
    e: common_vendor.f($data.totalSteps, (step, k0, i0) => {
      return {
        a: step,
        b: common_vendor.n({
          "step-completed": step <= $data.currentStep
        }),
        c: common_vendor.o(($event) => $options.handleStepClick(step), step)
      };
    }),
    f: $data.currentStep === 1
  }, $data.currentStep === 1 ? common_vendor.e({
    g: !$data.form.gender ? 1 : "",
    h: $data.form.gender === "male"
  }, $data.form.gender === "male" ? {} : {}, {
    i: common_vendor.n({
      "selected": $data.form.gender === "male"
    }),
    j: $data.form.gender === "male" ? 1 : "",
    k: common_vendor.o(($event) => $options.selectGender("male"), "7b"),
    l: $data.form.gender === "female"
  }, $data.form.gender === "female" ? {} : {}, {
    m: common_vendor.n({
      "selected": $data.form.gender === "female"
    }),
    n: $data.form.gender === "female" ? 1 : "",
    o: common_vendor.o(($event) => $options.selectGender("female"), "55"),
    p: common_vendor.n({
      "shaking": $data.showShaking && !$data.form.gender
    }),
    q: $data.form.nickName,
    r: common_vendor.o(($event) => $data.form.nickName = $event.detail.value, "d2"),
    s: common_vendor.o($options.onBirthdayChange, "59"),
    t: common_vendor.o(($event) => $data.pickerOpen = true, "74"),
    v: common_vendor.o(($event) => $data.pickerOpen = false, "55"),
    w: common_vendor.p({
      title: "选择出生年份",
      columns: [$options.birthdayOptions],
      value: [$options.birthdayIndex],
      displayText: $data.form.birthday ? $data.form.birthday + "年" : "",
      placeholder: "请选择"
    })
  }) : {}, {
    x: $data.currentStep === 2
  }, $data.currentStep === 2 ? {
    y: !$data.form.education ? 1 : "",
    z: common_vendor.f($data.educationOptions, (edu, k0, i0) => {
      return {
        a: common_vendor.t(edu),
        b: edu,
        c: common_vendor.n({
          "selected": $data.form.education === edu
        }),
        d: common_vendor.o(($event) => $options.selectEducation(edu), edu)
      };
    }),
    A: common_vendor.n({
      "shaking": $data.showShaking && !$data.form.education
    }),
    B: $data.form.position,
    C: common_vendor.o(($event) => $data.form.position = $event.detail.value, "58"),
    D: common_vendor.o($options.onIncomeChange, "18"),
    E: common_vendor.o(($event) => $data.pickerOpen = true, "b9"),
    F: common_vendor.o(($event) => $data.pickerOpen = false, "f2"),
    G: common_vendor.p({
      title: "选择年收入",
      columns: [$data.incomeOptions],
      value: [$data.form.income !== "" ? $data.form.income : 0],
      displayText: $data.form.income !== "" ? $data.incomeOptions[$data.form.income] : "",
      placeholder: "请选择"
    }),
    H: common_vendor.o($options.onMaritalStatusChange, "5a"),
    I: common_vendor.o(($event) => $data.pickerOpen = true, "56"),
    J: common_vendor.o(($event) => $data.pickerOpen = false, "2e"),
    K: common_vendor.p({
      title: "选择婚况",
      columns: [$data.maritalStatusOptions],
      value: [$options.maritalStatusIndex],
      displayText: $data.form.maritalStatus || "",
      placeholder: "请选择"
    })
  } : {}, {
    L: $data.currentStep === 3
  }, $data.currentStep === 3 ? {
    M: $data.form.ideal_intro,
    N: common_vendor.o(($event) => $data.form.ideal_intro = $event.detail.value, "5d"),
    O: common_vendor.t(($data.form.ideal_intro || "").length),
    P: $data.form.phone_time,
    Q: common_vendor.o(($event) => $data.form.phone_time = $event.detail.value, "d3"),
    R: $data.form.wechat,
    S: common_vendor.o(($event) => $data.form.wechat = $event.detail.value, "b1"),
    T: common_vendor.o($options.onCityColumnChange, "9d"),
    U: common_vendor.o($options.onCityChange, "b2"),
    V: common_vendor.o(($event) => $data.pickerOpen = true, "50"),
    W: common_vendor.o(($event) => $data.pickerOpen = false, "b8"),
    X: common_vendor.p({
      title: "选择居住城市",
      columns: $data.cityColumns,
      value: $data.cityValue,
      displayText: $data.selectedProvinceName && $data.selectedCityName ? $data.selectedProvinceName + " - " + $data.selectedCityName : "",
      placeholder: "请选择省份和城市",
      labelKey: "name"
    })
  } : {}, {
    Y: !$data.pickerOpen
  }, !$data.pickerOpen ? common_vendor.e({
    Z: $data.currentStep === 1
  }, $data.currentStep === 1 ? {} : {}, {
    aa: $data.currentStep === 2
  }, $data.currentStep === 2 ? {} : {}, {
    ab: $data.currentStep === 3
  }, $data.currentStep === 3 ? {} : {}, {
    ac: common_vendor.t($options.buttonText),
    ad: common_vendor.t($data.currentStep),
    ae: common_vendor.t($data.totalSteps),
    af: common_vendor.o((...args) => $options.handleNext && $options.handleNext(...args), "75"),
    ag: $data.isSubmitting
  }) : {}, {
    ah: $data.showLocationPopup
  }, $data.showLocationPopup ? {
    ai: common_vendor.o((...args) => $options.rejectLocation && $options.rejectLocation(...args), "bf"),
    aj: common_vendor.o((...args) => $options.allowLocation && $options.allowLocation(...args), "1d"),
    ak: common_vendor.o(() => {
    }, "70"),
    al: common_vendor.o((...args) => $options.closeLocationPopup && $options.closeLocationPopup(...args), "50")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd3414a9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/signup/guide.js.map
