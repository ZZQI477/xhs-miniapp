"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: {
    CustomNavBar
  },
  data() {
    return {
      loading: false,
      showPopup: false,
      contactFieldName: "微信号",
      currentField: "",
      inputValue: "",
      livingPlaceValue: [0, 0],
      hometownValue: [0, 0],
      formData: {
        birthday: "",
        livingPlace: [],
        livingPlaceText: "",
        hometown: [],
        hometownText: "",
        education: "",
        maritalStatus: "",
        position: "",
        income: "",
        hasHouse: "",
        name: "",
        wechatNo: "",
        avatar: ""
      },
      // 选项数据
      birthdayOptions: [],
      provinceOptions: [],
      cityOptions: [],
      educationOptions: [
        { text: "中专", value: "中专" },
        { text: "高中", value: "高中" },
        { text: "大专", value: "大专" },
        { text: "本科", value: "本科" },
        { text: "硕士", value: "硕士" },
        { text: "博士", value: "博士" }
      ],
      maritalStatusOptions: [
        { text: "未婚", value: "未婚" },
        { text: "丧偶", value: "丧偶" },
        { text: "离异", value: "离异" }
      ],
      incomeOptions: [],
      hasHouseOptions: [
        { text: "是", value: "是" },
        { text: "否", value: "否" }
      ],
      // 缓存
      citiesMap: {}
    };
  },
  computed: {
    birthdayRange() {
      return this.birthdayOptions.map((item) => item.text);
    },
    birthdayIndex() {
      if (this.formData.birthday === null) {
        return null;
      }
      const index = this.birthdayOptions.findIndex((item) => item.value === this.formData.birthday);
      return index >= 0 ? index : null;
    },
    educationRange() {
      return this.educationOptions.map((item) => item.text);
    },
    educationIndex() {
      const index = this.educationOptions.findIndex((item) => item.value === this.formData.education);
      return index >= 0 ? index : 1;
    },
    maritalStatusRange() {
      return this.maritalStatusOptions.map((item) => item.text);
    },
    maritalStatusIndex() {
      const index = this.maritalStatusOptions.findIndex((item) => item.value === this.formData.maritalStatus);
      return index >= 0 ? index : 0;
    },
    incomeRange() {
      return this.incomeOptions.map((item) => item.text);
    },
    incomeIndex() {
      if (this.formData.income === null) {
        return null;
      }
      const index = this.incomeOptions.findIndex((item) => item.value === this.formData.income);
      return index >= 0 ? index : null;
    },
    hasHouseRange() {
      return this.hasHouseOptions.map((item) => item.text);
    },
    hasHouseIndex() {
      const index = this.hasHouseOptions.findIndex((item) => item.value === this.formData.hasHouse);
      return index >= 0 ? index : 0;
    },
    livingPlaceRange() {
      return [this.provinceOptions, this.cityOptions];
    },
    hometownRange() {
      return [this.provinceOptions, this.cityOptions];
    },
    pickerTitle() {
      const titles = {
        position: "职业",
        name: "真实姓名",
        wechatNo: this.contactFieldName
      };
      return titles[this.currentField] || "";
    },
    inputPlaceholder() {
      const placeholders = {
        position: "请输入职业",
        name: "请输入姓名",
        wechatNo: `请输入${this.contactFieldName}`
      };
      return placeholders[this.currentField] || "";
    }
  },
  async onLoad(options) {
    this.initOptions();
    await this.loadAreaData();
    await this.loadUserInfo();
  },
  methods: {
    // 初始化选项数据
    initOptions() {
      this.birthdayOptions = Array.from({ length: 35 }, (_, i) => ({
        text: `${1970 + i}年`,
        value: 1970 + i
      }));
      const incomes = ["5万以下", "5-10万", "10-20万", "20-30万", "30-50万", "50-100万", "100万以上"];
      this.incomeOptions = incomes.map((v) => ({
        text: `${v}`,
        // text: `${v}万`,
        value: v
      }));
    },
    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await api_index.getUserInfo();
        const userinfo = res.data.userinfo || res.data;
        console.log("[CoreInfo] 加载用户信息", userinfo);
        console.log("[CoreInfo] birthday:", userinfo.birthday);
        if (userinfo.birthday) {
          const year = new Date(userinfo.birthday).getFullYear();
          console.log("[CoreInfo] setting birthday:", year);
          this.formData.birthday = year;
        }
        this.formData.education = userinfo.education || "";
        this.formData.maritalStatus = userinfo.marital_status || "";
        this.formData.position = userinfo.job || userinfo.position || "";
        this.formData.name = userinfo.realname || "";
        this.formData.avatar = userinfo.avatar || "";
        if (userinfo.province && userinfo.city) {
          this.formData.livingPlace = [userinfo.province, userinfo.city];
          await this.loadAreaNames("livingPlace", userinfo.province, userinfo.city);
          const provinceIndex = this.provinceOptions.findIndex((item) => item.id == userinfo.province);
          const cityIndex = this.cityOptions.findIndex((item) => item.id == userinfo.city);
          this.livingPlaceValue = [provinceIndex >= 0 ? provinceIndex : 0, cityIndex >= 0 ? cityIndex : 0];
        }
        if (userinfo.hometown_province && userinfo.hometown_city) {
          this.formData.hometown = [userinfo.hometown_province, userinfo.hometown_city];
          await this.loadAreaNames("hometown", userinfo.hometown_province, userinfo.hometown_city);
          const provinceIndex = this.provinceOptions.findIndex((item) => item.id == userinfo.hometown_province);
          const cityIndex = this.cityOptions.findIndex((item) => item.id == userinfo.hometown_city);
          this.hometownValue = [provinceIndex >= 0 ? provinceIndex : 0, cityIndex >= 0 ? cityIndex : 0];
        }
        console.log("[CoreInfo] income:", userinfo.income);
        if (userinfo.income !== void 0 && userinfo.income !== null && userinfo.income !== "") {
          const income = userinfo.income || 0;
          console.log("[CoreInfo] setting income:", income);
          this.formData.income = income;
        }
        if (userinfo.has_house !== void 0 && userinfo.has_house !== null) {
          this.formData.hasHouse = userinfo.has_house == 1 ? "是" : "否";
        }
        this.formData.wechatNo = userinfo.wechat || userinfo.wechat_no || "";
        console.log("[CoreInfo] 表单数据已填充", this.formData);
      } catch (e) {
        console.error("加载用户信息失败", e);
      }
    },
    // 加载地区名称
    async loadAreaNames(field, provinceCode, cityCode) {
      try {
        const province = this.provinceOptions.find((p) => p.id == provinceCode);
        if (!province)
          return;
        await this.loadCities(provinceCode);
        const city = this.cityOptions.find((c) => c.id == cityCode);
        if (!city)
          return;
        if (field === "livingPlace") {
          this.formData.livingPlaceText = `${province.name}-${city.name}`;
        } else if (field === "hometown") {
          this.formData.hometownText = `${province.name}-${city.name}`;
        }
      } catch (e) {
        console.error("加载地区名称失败", e);
      }
    },
    // 加载地区数据
    async loadAreaData() {
      try {
        const res = await api_index.getAreaList(0);
        this.provinceOptions = res.data.list || [];
        if (this.provinceOptions.length > 0) {
          await this.loadCities(this.provinceOptions[0].id);
        }
      } catch (e) {
        console.error("加载地区数据失败", e);
      }
    },
    // 加载城市数据
    async loadCities(provinceId) {
      if (this.citiesMap[provinceId]) {
        this.cityOptions = this.citiesMap[provinceId];
        return;
      }
      try {
        const res = await api_index.getAreaList(provinceId);
        const cities = res.data.list || [];
        this.citiesMap[provinceId] = cities;
        this.cityOptions = cities;
      } catch (e) {
        console.error("加载城市数据失败", e);
      }
    },
    onBirthdayChange(e) {
      const selected = this.birthdayOptions[Number(e.detail.value)];
      this.formData.birthday = selected ? selected.value : "";
    },
    onEducationChange(e) {
      const selected = this.educationOptions[Number(e.detail.value)];
      this.formData.education = selected ? selected.value : "";
    },
    onMaritalStatusChange(e) {
      const selected = this.maritalStatusOptions[Number(e.detail.value)];
      this.formData.maritalStatus = selected ? selected.value : "";
    },
    onIncomeChange(e) {
      const selected = this.incomeOptions[Number(e.detail.value)];
      this.formData.income = selected ? selected.value : "";
    },
    onHasHouseChange(e) {
      const selected = this.hasHouseOptions[Number(e.detail.value)];
      this.formData.hasHouse = selected ? selected.value : "";
    },
    onLivingPlaceChange(e) {
      const [provinceIndex, cityIndex] = e.detail.value;
      const province = this.provinceOptions[provinceIndex];
      const city = this.cityOptions[cityIndex];
      if (province && city) {
        this.formData.livingPlace = [province.id, city.id];
        this.formData.livingPlaceText = `${province.name}-${city.name}`;
        this.livingPlaceValue = [provinceIndex, cityIndex];
      }
    },
    async onLivingPlaceColumnChange(e) {
      if (e.detail.column === 0) {
        const province = this.provinceOptions[e.detail.value];
        if (province) {
          await this.loadCities(province.id);
          this.livingPlaceValue = [e.detail.value, 0];
        }
      }
    },
    onHometownChange(e) {
      const [provinceIndex, cityIndex] = e.detail.value;
      const province = this.provinceOptions[provinceIndex];
      const city = this.cityOptions[cityIndex];
      if (province && city) {
        this.formData.hometown = [province.id, city.id];
        this.formData.hometownText = `${province.name}-${city.name}`;
        this.hometownValue = [provinceIndex, cityIndex];
      }
    },
    async onHometownColumnChange(e) {
      if (e.detail.column === 0) {
        const province = this.provinceOptions[e.detail.value];
        if (province) {
          await this.loadCities(province.id);
          this.hometownValue = [e.detail.value, 0];
        }
      }
    },
    showPicker(field) {
      this.currentField = field;
      if (field === "position") {
        this.inputValue = this.formData.position;
      } else if (field === "name") {
        this.inputValue = this.formData.name;
      } else if (field === "wechatNo") {
        this.inputValue = this.formData.wechatNo;
      }
      this.showPopup = true;
    },
    // 关闭弹窗
    closePopup() {
      this.showPopup = false;
    },
    confirmPicker() {
      const field = this.currentField;
      if (field === "position") {
        this.formData.position = this.inputValue;
      } else if (field === "name") {
        this.formData.name = this.inputValue;
      } else if (field === "wechatNo") {
        this.formData.wechatNo = this.inputValue;
      }
      this.closePopup();
    },
    // 选择图片
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.uploadImage(tempFilePath);
        }
      });
    },
    // 上传图片
    async uploadImage(filePath) {
      try {
        common_vendor.index.showLoading({ title: "上传中..." });
        const uploadRes = await api_index.uploadAvatar(filePath);
        if (uploadRes.data && uploadRes.data.url) {
          this.formData.avatar = uploadRes.data.url;
          common_vendor.index.showToast({ title: "上传成功", icon: "success" });
        } else {
          common_vendor.index.showToast({ title: "上传失败", icon: "none" });
        }
      } catch (e) {
        console.error("[CoreInfo] 上传图片失败", e);
        common_vendor.index.showToast({ title: e.msg || "上传失败", icon: "none" });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 提交表单
    async handleSubmit() {
      if (!this.formData.birthday) {
        return common_vendor.index.showToast({ title: "请选择出生年份", icon: "none" });
      }
      if (!this.formData.livingPlace || this.formData.livingPlace.length === 0) {
        return common_vendor.index.showToast({ title: "请选择现居地", icon: "none" });
      }
      if (!this.formData.education) {
        return common_vendor.index.showToast({ title: "请选择学历", icon: "none" });
      }
      if (!this.formData.maritalStatus) {
        return common_vendor.index.showToast({ title: "请选择婚况", icon: "none" });
      }
      if (this.formData.income === "") {
        return common_vendor.index.showToast({ title: "请选择年收入", icon: "none" });
      }
      if (!this.formData.avatar) {
        return common_vendor.index.showToast({ title: "请上传头像", icon: "none" });
      }
      this.loading = true;
      try {
        const isBase64Avatar = typeof this.formData.avatar === "string" && this.formData.avatar.startsWith("data:");
        const submitData = {
          birthday: `${this.formData.birthday}-01-01`,
          education: this.formData.education,
          marital_status: this.formData.maritalStatus,
          // 后端字段是 marital_status
          job: this.formData.position,
          // 后端字段是 job
          income: this.formData.income,
          realname: this.formData.name,
          // 后端字段是 realname
          // 现居地 - 后端字段是 province 和 city
          province: this.formData.livingPlace[0],
          city: this.formData.livingPlace[1],
          // 家乡 - 后端字段是 hometown_province 和 hometown_city
          hometown_province: this.formData.hometown[0] || "",
          hometown_city: this.formData.hometown[1] || "",
          // 购房状态
          has_house: this.formData.hasHouse ? this.formData.hasHouse === "是" ? 1 : 0 : "",
          // 微信号
          wechat: this.formData.wechatNo
        };
        if (!isBase64Avatar) {
          submitData.avatar = this.formData.avatar;
        }
        console.log("[CoreInfo] 提交数据", submitData);
        await api_index.updateProfile(submitData);
        const userinfo = common_vendor.index.getStorageSync("userinfo") || {};
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
        });
        if (!isBase64Avatar && submitData.avatar) {
          userinfo.avatar = submitData.avatar;
        }
        common_vendor.index.setStorageSync("userinfo", userinfo);
        console.log("[CoreInfo] 本地存储已更新", userinfo);
        common_vendor.index.showToast({ title: "提交成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (e) {
        console.error("[CoreInfo] 提交失败", e);
        common_vendor.index.showToast({ title: e.msg || "提交失败", icon: "none" });
      } finally {
        this.loading = false;
      }
    }
  }
};
if (!Array) {
  const _component_custom_nav_bar = common_vendor.resolveComponent("custom-nav-bar");
  _component_custom_nav_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.p({
      title: "核心资料",
      isShowBack: true,
      backgroundImage: "/static/bg3.png"
    }),
    b: common_vendor.t($data.formData.birthday ? $data.formData.birthday + "年" : "请选择"),
    c: $options.birthdayRange,
    d: $options.birthdayIndex || void 0,
    e: common_vendor.o((...args) => $options.onBirthdayChange && $options.onBirthdayChange(...args), "4a"),
    f: common_vendor.t($data.formData.maritalStatus || "请选择"),
    g: $options.maritalStatusRange,
    h: $options.maritalStatusIndex,
    i: common_vendor.o((...args) => $options.onMaritalStatusChange && $options.onMaritalStatusChange(...args), "97"),
    j: common_vendor.t($data.formData.livingPlaceText || "请选择"),
    k: $options.livingPlaceRange,
    l: $data.livingPlaceValue,
    m: common_vendor.o((...args) => $options.onLivingPlaceChange && $options.onLivingPlaceChange(...args), "c5"),
    n: common_vendor.o((...args) => $options.onLivingPlaceColumnChange && $options.onLivingPlaceColumnChange(...args), "f1"),
    o: common_vendor.t($data.formData.hometownText || "请选择"),
    p: $options.hometownRange,
    q: $data.hometownValue,
    r: common_vendor.o((...args) => $options.onHometownChange && $options.onHometownChange(...args), "ee"),
    s: common_vendor.o((...args) => $options.onHometownColumnChange && $options.onHometownColumnChange(...args), "c7"),
    t: common_vendor.t($data.formData.education || "请选择"),
    v: $options.educationRange,
    w: $options.educationIndex,
    x: common_vendor.o((...args) => $options.onEducationChange && $options.onEducationChange(...args), "fb"),
    y: common_vendor.t($data.formData.position || "请填写"),
    z: common_vendor.o(($event) => $options.showPicker("position"), "82"),
    A: common_vendor.t($data.formData.income ? $data.formData.income : "请选择"),
    B: $options.incomeRange,
    C: $options.incomeIndex || void 0,
    D: common_vendor.o((...args) => $options.onIncomeChange && $options.onIncomeChange(...args), "32"),
    E: common_vendor.t($data.formData.hasHouse || "请选择"),
    F: $options.hasHouseRange,
    G: $options.hasHouseIndex,
    H: common_vendor.o((...args) => $options.onHasHouseChange && $options.onHasHouseChange(...args), "50"),
    I: common_vendor.t($data.formData.name || "请填写"),
    J: common_vendor.o(($event) => $options.showPicker("name"), "c8"),
    K: common_vendor.t($data.contactFieldName),
    L: common_vendor.t($data.formData.wechatNo || "请填写"),
    M: common_vendor.o(($event) => $options.showPicker("wechatNo"), "01"),
    N: $data.formData.avatar
  }, $data.formData.avatar ? {
    O: $data.formData.avatar
  } : {}, {
    P: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args), "e8"),
    Q: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args), "2a"),
    R: $data.loading,
    S: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "8c"),
    T: common_vendor.t($options.pickerTitle),
    U: $data.currentField === "position" || $data.currentField === "name" || $data.currentField === "wechatNo",
    V: common_vendor.o((...args) => $options.confirmPicker && $options.confirmPicker(...args), "39"),
    W: $options.inputPlaceholder,
    X: $data.currentField === "wechatNo" ? 50 : 20,
    Y: $data.inputValue,
    Z: common_vendor.o(($event) => $data.inputValue = $event.detail.value, "1f"),
    aa: $data.currentField === "position" || $data.currentField === "name" || $data.currentField === "wechatNo",
    ab: common_vendor.o(() => {
    }, "f8"),
    ac: $data.showPopup,
    ad: common_vendor.o((...args) => $options.closePopup && $options.closePopup(...args), "93")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ee97244e"]]);
xhs.createPage(MiniProgramPage);
