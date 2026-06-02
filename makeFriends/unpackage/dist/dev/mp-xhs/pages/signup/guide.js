"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      currentStep: 1,
      totalSteps: 3,
      showShaking: false,
      isSubmitting: false,
      showLocationPopup: false,
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
        cityName: ""
      },
      educationOptions: ["博士", "硕士", "本科", "专科"],
      incomeOptions: ["0万", "5万", "10万", "15万", "20万", "25万", "30万", "40万", "50万", "60万", "70万", "80万", "90万", "100万", "200万"],
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
      for (let year = 1970; year <= 2006; year++) {
        options.push(`${year}年`);
      }
      return options;
    },
    birthdayIndex() {
      if (!this.form.birthday) {
        return -1;
      }
      const index = this.form.birthday - 1970;
      return index >= 0 ? index : -1;
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
        console.error("加载省份失败", e);
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
        console.error("加载城市失败", e);
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
      this.form.birthday = 1970 + Number(e.detail.value);
      this.saveData();
    },
    onIncomeChange(e) {
      this.form.income = Number(e.detail.value);
      this.saveData();
    },
    onMaritalStatusChange(e) {
      this.form.maritalStatus = this.maritalStatusOptions[Number(e.detail.value)] || "";
      this.saveData();
    },
    async onCityChange(e) {
      const [provinceIndex, cityIndex] = e.detail.value;
      const province = this.cityColumns[0][provinceIndex];
      const city = this.cityColumns[1][cityIndex];
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
      const { column, value } = e.detail;
      if (column === 0) {
        const province = this.cityColumns[0][value];
        if (province && province.id) {
          await this.loadCities(province.id);
          this.cityValue = [value, 0];
          await this.$nextTick();
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
          income: parseInt(this.incomeOptions[this.form.income].replace("万", "")),
          marital_status: this.form.maritalStatus,
          province: this.form.provinceId,
          // 后端字段是 province
          city: this.form.cityId
          // 后端字段是 city
        };
        await api_index.updateProfile(submitData);
        try {
          const userRes = await api_index.getUserInfo();
          const latestUserInfo = userRes.data.userinfo || userRes.data;
          common_vendor.index.setStorageSync("userinfo", latestUserInfo);
          console.log("[Guide] 已更新本地用户信息", { gender: latestUserInfo.gender, education: latestUserInfo.education });
        } catch (err) {
          console.error("[Guide] 更新本地用户信息失败", err);
        }
        common_vendor.index.setStorageSync("signup_guide_completed", true);
        common_vendor.index.removeStorageSync("signup_guide_data");
        common_vendor.index.removeStorageSync("signup_guide_step");
        common_vendor.index.showToast({ title: "资料提交成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/single/index" });
        }, 1500);
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "提交失败", icon: "none" });
      } finally {
        this.isSubmitting = false;
      }
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
        console.log("开始获取位置...");
        const locationRes = await common_vendor.index.getLocation({
          type: "wgs84"
        });
        console.log("获取位置成功:", locationRes);
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
        console.log("逆地理编码响应:", geocodeRes);
        if (geocodeRes.data) {
          console.log("逆地理编码数据:", geocodeRes.data);
          if (geocodeRes.data.status === "1") {
            if (geocodeRes.data.regeocode && geocodeRes.data.regeocode.addressComponent) {
              const addressComponent = geocodeRes.data.regeocode.addressComponent;
              const provinceName = addressComponent.province;
              const cityName = addressComponent.city || addressComponent.district;
              console.log("当前位置:", provinceName, cityName);
              await this.$nextTick();
              console.log("省份数据:", this.provinceOptions);
              if (provinceName && cityName) {
                await this.setLocationCity(provinceName, cityName);
              } else {
                console.error("地址信息不完整:", addressComponent);
              }
            } else {
              console.error("没有地址组件信息:", geocodeRes.data);
            }
          } else {
            console.error("逆地理编码失败:", geocodeRes.data.info);
          }
        } else {
          console.error("逆地理编码响应异常:", geocodeRes);
        }
      } catch (e) {
        console.error("获取位置失败:", e);
      }
    },
    // 根据省份和城市名称设置城市选择器
    async setLocationCity(provinceName, cityName) {
      try {
        const province = this.provinceOptions.find((p) => p.name === provinceName);
        if (!province) {
          console.error("未找到省份:", provinceName);
          return;
        }
        await this.loadCities(province.id);
        const city = this.cityOptions.find((c) => c.name === cityName);
        if (!city) {
          console.error("未找到城市:", cityName);
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
        console.log("自动定位成功:", provinceName, cityName);
      } catch (e) {
        console.error("设置城市失败:", e);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.totalSteps, (step, k0, i0) => {
      return {
        a: step,
        b: common_vendor.n({
          "step-completed": step <= $data.currentStep
        }),
        c: common_vendor.o(($event) => $options.handleStepClick(step), step)
      };
    }),
    b: $data.currentStep === 1
  }, $data.currentStep === 1 ? common_vendor.e({
    c: !$data.form.gender ? 1 : "",
    d: $data.form.gender === "male"
  }, $data.form.gender === "male" ? {} : {}, {
    e: common_vendor.n({
      "selected": $data.form.gender === "male"
    }),
    f: $data.form.gender === "male" ? 1 : "",
    g: common_vendor.o(($event) => $options.selectGender("male"), "1c"),
    h: $data.form.gender === "female"
  }, $data.form.gender === "female" ? {} : {}, {
    i: common_vendor.n({
      "selected": $data.form.gender === "female"
    }),
    j: $data.form.gender === "female" ? 1 : "",
    k: common_vendor.o(($event) => $options.selectGender("female"), "31"),
    l: common_vendor.n({
      "shaking": $data.showShaking && !$data.form.gender
    }),
    m: common_vendor.t($data.form.birthday ? $data.form.birthday + "年" : "请选择"),
    n: common_vendor.t($data.form.birthday ? $data.form.birthday + "年" : "请选择"),
    o: $options.birthdayOptions,
    p: $options.birthdayIndex >= 0 ? $options.birthdayIndex : void 0,
    q: common_vendor.o((...args) => $options.onBirthdayChange && $options.onBirthdayChange(...args), "e3")
  }) : {}, {
    r: $data.currentStep === 2
  }, $data.currentStep === 2 ? {
    s: !$data.form.education ? 1 : "",
    t: common_vendor.f($data.educationOptions, (edu, k0, i0) => {
      return {
        a: common_vendor.t(edu),
        b: edu,
        c: common_vendor.n({
          "selected": $data.form.education === edu
        }),
        d: common_vendor.o(($event) => $options.selectEducation(edu), edu)
      };
    }),
    v: common_vendor.n({
      "shaking": $data.showShaking && !$data.form.education
    }),
    w: $data.form.position,
    x: common_vendor.o(($event) => $data.form.position = $event.detail.value, "e9"),
    y: common_vendor.t($data.form.income !== "" ? $data.incomeOptions[$data.form.income] : "请选择"),
    z: common_vendor.t($data.form.income !== "" ? $data.incomeOptions[$data.form.income] : "请选择"),
    A: $data.incomeOptions,
    B: $data.form.income !== "" ? $data.form.income : void 0,
    C: common_vendor.o((...args) => $options.onIncomeChange && $options.onIncomeChange(...args), "94"),
    D: common_vendor.t($data.form.maritalStatus || "请选择"),
    E: common_vendor.t($data.form.maritalStatus || "请选择"),
    F: $data.maritalStatusOptions,
    G: $options.maritalStatusIndex,
    H: common_vendor.o((...args) => $options.onMaritalStatusChange && $options.onMaritalStatusChange(...args), "d9")
  } : {}, {
    I: $data.currentStep === 3
  }, $data.currentStep === 3 ? common_vendor.e({
    J: $data.selectedProvinceName && $data.selectedCityName
  }, $data.selectedProvinceName && $data.selectedCityName ? {
    K: common_vendor.t($data.selectedProvinceName),
    L: common_vendor.t($data.selectedCityName)
  } : {}, {
    M: $data.cityColumns,
    N: $data.cityValue,
    O: common_vendor.o((...args) => $options.onCityChange && $options.onCityChange(...args), "30"),
    P: common_vendor.o((...args) => $options.onCityColumnChange && $options.onCityColumnChange(...args), "bc")
  }) : {}, {
    Q: $data.currentStep === 1
  }, $data.currentStep === 1 ? {} : {}, {
    R: $data.currentStep === 2
  }, $data.currentStep === 2 ? {} : {}, {
    S: $data.currentStep === 3
  }, $data.currentStep === 3 ? {} : {}, {
    T: common_vendor.t($options.buttonText),
    U: common_vendor.t($data.currentStep),
    V: common_vendor.t($data.totalSteps),
    W: common_vendor.o((...args) => $options.handleNext && $options.handleNext(...args), "f3"),
    X: $data.isSubmitting,
    Y: $data.showLocationPopup
  }, $data.showLocationPopup ? {
    Z: common_assets._imports_0$7,
    aa: common_vendor.o((...args) => $options.rejectLocation && $options.rejectLocation(...args), "6f"),
    ab: common_vendor.o((...args) => $options.allowLocation && $options.allowLocation(...args), "5d"),
    ac: common_vendor.o(() => {
    }, "57"),
    ad: common_vendor.o((...args) => $options.closeLocationPopup && $options.closeLocationPopup(...args), "21")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-dd3414a9"]]);
xhs.createPage(MiniProgramPage);
