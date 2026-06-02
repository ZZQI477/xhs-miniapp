"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const years = [];
    for (let i = currentYear - 60; i <= currentYear - 18; i++) {
      years.push(i);
    }
    const heights = [];
    for (let i = 140; i <= 220; i++) {
      heights.push(i);
    }
    return {
      currentStep: 1,
      stepLabels: ["基础信息", "手机验证", "理想型", "照片介绍"],
      form: {
        nickname: "",
        avatar: "",
        gender: "",
        birthday: "",
        height: 0,
        intro: "",
        images: [],
        ideal_intro: "",
        ideal_tags: []
      },
      allTags: [],
      saving: false,
      hasPhone: true,
      maskedPhone: "",
      // 选择器相关
      years,
      yearIndex: 20,
      showBirthdayPicker: false,
      heights,
      heightIndex: 30,
      showHeightPicker: false
    };
  },
  onLoad() {
    this.loadUserInfo();
    this.loadTags();
  },
  methods: {
    // 加载用户信息
    async loadUserInfo() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_index.getUserInfo();
        const data = res.data.userinfo;
        common_vendor.index.setStorageSync("userinfo", data);
        common_vendor.index.__f__("log", "at pages/profile/guide.vue:268", "[ProfileGuide] 已更新本地用户信息");
        this.form = {
          nickname: data.nickname || "",
          avatar: data.avatar || "",
          gender: data.gender || "",
          birthday: data.birthday || "",
          height: data.height || 0,
          intro: data.intro || "",
          images: data.images || [],
          ideal_intro: data.ideal_intro || "",
          ideal_tags: data.ideal_tags || []
        };
        if (this.form.birthday) {
          const year = parseInt(this.form.birthday.split("-")[0]);
          this.yearIndex = this.years.indexOf(year);
          if (this.yearIndex < 0)
            this.yearIndex = 20;
        }
        if (this.form.height) {
          this.heightIndex = this.heights.indexOf(this.form.height);
          if (this.heightIndex < 0)
            this.heightIndex = 30;
        }
        const userinfo = common_vendor.index.getStorageSync("userinfo");
        if (userinfo && userinfo.mobile) {
          this.hasPhone = true;
          const mobile = userinfo.mobile;
          this.maskedPhone = mobile.substring(0, 3) + "****" + mobile.substring(7);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/profile/guide.vue:301", "加载用户信息失败", e);
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 加载标签
    async loadTags() {
      try {
        const res = await api_index.getTags();
        this.allTags = res.data.list || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/profile/guide.vue:313", "加载标签失败", e);
      }
    },
    // 上一步
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    // 下一步
    nextStep() {
      if (!this.validateStep()) {
        return;
      }
      if (this.currentStep < 4) {
        this.currentStep++;
      }
    },
    // 验证当前步骤
    validateStep() {
      if (this.currentStep === 1) {
        if (!this.form.nickname) {
          common_vendor.index.showToast({ title: "请输入昵称", icon: "none" });
          return false;
        }
        if (!this.form.gender) {
          common_vendor.index.showToast({ title: "请选择性别", icon: "none" });
          return false;
        }
        if (!this.form.birthday) {
          common_vendor.index.showToast({ title: "请选择出生年份", icon: "none" });
          return false;
        }
        if (!this.form.height) {
          common_vendor.index.showToast({ title: "请选择身高", icon: "none" });
          return false;
        }
      } else if (this.currentStep === 3) {
        if (!this.form.ideal_intro || this.form.ideal_intro.length < 30) {
          common_vendor.index.showToast({ title: "理想对象描述至少30字", icon: "none" });
          return false;
        }
        if (this.form.ideal_tags.length === 0) {
          common_vendor.index.showToast({ title: "请选择至少一个理想对象标签", icon: "none" });
          return false;
        }
      }
      return true;
    },
    // 提交资料
    async submitProfile() {
      if (!this.form.avatar) {
        common_vendor.index.showToast({ title: "请上传头像", icon: "none" });
        return;
      }
      if (!this.form.intro || this.form.intro.length < 30) {
        common_vendor.index.showToast({ title: "自我介绍至少30字", icon: "none" });
        return;
      }
      this.saving = true;
      try {
        await api_index.updateProfile(this.form);
        common_vendor.index.showToast({ title: "资料保存成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "保存失败", icon: "none" });
      } finally {
        this.saving = false;
      }
    },
    // 切换标签
    toggleTag(field, tagName) {
      const index = this.form[field].indexOf(tagName);
      if (index > -1) {
        this.form[field].splice(index, 1);
      } else {
        if (this.form[field].length >= 5) {
          common_vendor.index.showToast({ title: "最多选择5个标签", icon: "none" });
          return;
        }
        this.form[field].push(tagName);
      }
    },
    // 选择头像
    chooseAvatar() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          try {
            common_vendor.index.showLoading({ title: "上传中..." });
            const uploadRes = await api_index.uploadAvatar(res.tempFilePaths[0]);
            this.form.avatar = uploadRes.data.url;
            common_vendor.index.showToast({ title: "上传成功", icon: "success" });
          } catch (e) {
            common_vendor.index.showToast({ title: e.msg || "上传失败", icon: "none" });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    },
    // 选择相册图片
    chooseImage() {
      const remainCount = 9 - this.form.images.length;
      common_vendor.index.chooseImage({
        count: remainCount,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          try {
            common_vendor.index.showLoading({ title: "上传中..." });
            for (const tempPath of res.tempFilePaths) {
              const uploadRes = await api_index.uploadImage(tempPath);
              this.form.images.push(uploadRes.data.url);
            }
            common_vendor.index.showToast({ title: "上传成功", icon: "success" });
          } catch (e) {
            common_vendor.index.showToast({ title: e.msg || "上传失败", icon: "none" });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    },
    // 预览图片
    previewImage(index) {
      common_vendor.index.previewImage({
        current: index,
        urls: this.form.images
      });
    },
    // 删除图片
    deleteImage(index) {
      this.form.images.splice(index, 1);
    },
    // 打开年份选择器
    openBirthdayPicker() {
      this.showBirthdayPicker = true;
    },
    // 年份选择器
    onYearChange(e) {
      this.yearIndex = e.detail.value[0];
    },
    confirmBirthday() {
      const year = this.years[this.yearIndex];
      this.form.birthday = `${year}-01-01`;
      this.showBirthdayPicker = false;
    },
    // 打开身高选择器
    openHeightPicker() {
      this.showHeightPicker = true;
    },
    // 身高选择器
    onHeightChange(e) {
      this.heightIndex = e.detail.value[0];
    },
    confirmHeight() {
      this.form.height = this.heights[this.heightIndex];
      this.showHeightPicker = false;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f(4, (i, k0, i0) => {
      return common_vendor.e({
        a: $data.currentStep > i
      }, $data.currentStep > i ? {} : {
        b: common_vendor.t(i)
      }, {
        c: common_vendor.t($data.stepLabels[i - 1]),
        d: i,
        e: $data.currentStep >= i ? 1 : "",
        f: $data.currentStep > i ? 1 : ""
      });
    }),
    b: ($data.currentStep - 1) / 3 * 100 + "%",
    c: $data.currentStep === 1
  }, $data.currentStep === 1 ? {
    d: $data.form.nickname,
    e: common_vendor.o(($event) => $data.form.nickname = $event.detail.value, "73"),
    f: $data.form.gender === 1 ? 1 : "",
    g: common_vendor.o(($event) => $data.form.gender = 1, "d2"),
    h: $data.form.gender === 2 ? 1 : "",
    i: common_vendor.o(($event) => $data.form.gender = 2, "01"),
    j: common_vendor.t($data.form.birthday ? $data.form.birthday.split("-")[0] + "年" : "请选择"),
    k: !$data.form.birthday ? 1 : "",
    l: common_vendor.o((...args) => $options.openBirthdayPicker && $options.openBirthdayPicker(...args), "3c"),
    m: common_vendor.t($data.form.height ? $data.form.height + "cm" : "请选择"),
    n: !$data.form.height ? 1 : "",
    o: common_vendor.o((...args) => $options.openHeightPicker && $options.openHeightPicker(...args), "a0")
  } : {}, {
    p: $data.currentStep === 2
  }, $data.currentStep === 2 ? common_vendor.e({
    q: $data.hasPhone
  }, $data.hasPhone ? {
    r: common_vendor.t($data.maskedPhone)
  } : {}) : {}, {
    s: $data.currentStep === 3
  }, $data.currentStep === 3 ? {
    t: $data.form.ideal_intro,
    v: common_vendor.o(($event) => $data.form.ideal_intro = $event.detail.value, "06"),
    w: common_vendor.t(($data.form.ideal_intro || "").length),
    x: ($data.form.ideal_intro || "").length < 30 ? 1 : "",
    y: common_vendor.f($data.allTags, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag.name),
        b: "ideal-" + tag.id,
        c: $data.form.ideal_tags.includes(tag.name) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleTag("ideal_tags", tag.name), "dc")
      };
    })
  } : {}, {
    z: $data.currentStep === 4
  }, $data.currentStep === 4 ? common_vendor.e({
    A: $data.form.avatar
  }, $data.form.avatar ? {
    B: $data.form.avatar
  } : {}, {
    C: $data.form.avatar
  }, $data.form.avatar ? {} : {}, {
    D: common_vendor.o((...args) => $options.chooseAvatar && $options.chooseAvatar(...args), "b2"),
    E: common_vendor.f($data.form.images, (img, index, i0) => {
      return {
        a: img,
        b: common_vendor.o(($event) => $options.previewImage(index), "0f"),
        c: common_vendor.o(($event) => $options.deleteImage(index), "35"),
        d: index
      };
    }),
    F: $data.form.images.length < 9
  }, $data.form.images.length < 9 ? {
    G: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args), "5f")
  } : {}, {
    H: $data.form.intro,
    I: common_vendor.o(($event) => $data.form.intro = $event.detail.value, "5c"),
    J: common_vendor.t(($data.form.intro || "").length),
    K: ($data.form.intro || "").length < 30 ? 1 : ""
  }) : {}, {
    L: $data.currentStep > 1
  }, $data.currentStep > 1 ? {
    M: common_vendor.o((...args) => $options.prevStep && $options.prevStep(...args), "8a")
  } : {}, {
    N: $data.currentStep < 4
  }, $data.currentStep < 4 ? {
    O: common_vendor.o((...args) => $options.nextStep && $options.nextStep(...args), "7e")
  } : {}, {
    P: $data.currentStep === 4
  }, $data.currentStep === 4 ? {
    Q: common_vendor.o((...args) => $options.submitProfile && $options.submitProfile(...args), "3a"),
    R: $data.saving
  } : {}, {
    S: $data.showBirthdayPicker
  }, $data.showBirthdayPicker ? {
    T: common_vendor.o(($event) => $data.showBirthdayPicker = false, "aa"),
    U: common_vendor.o((...args) => $options.confirmBirthday && $options.confirmBirthday(...args), "51"),
    V: common_vendor.f($data.years, (year, k0, i0) => {
      return {
        a: common_vendor.t(year),
        b: year
      };
    }),
    W: [$data.yearIndex],
    X: common_vendor.o((...args) => $options.onYearChange && $options.onYearChange(...args), "24"),
    Y: common_vendor.o(() => {
    }, "7c"),
    Z: common_vendor.o(($event) => $data.showBirthdayPicker = false, "41")
  } : {}, {
    aa: $data.showHeightPicker
  }, $data.showHeightPicker ? {
    ab: common_vendor.o(($event) => $data.showHeightPicker = false, "d3"),
    ac: common_vendor.o((...args) => $options.confirmHeight && $options.confirmHeight(...args), "25"),
    ad: common_vendor.f($data.heights, (h, k0, i0) => {
      return {
        a: common_vendor.t(h),
        b: h
      };
    }),
    ae: [$data.heightIndex],
    af: common_vendor.o((...args) => $options.onHeightChange && $options.onHeightChange(...args), "69"),
    ag: common_vendor.o(() => {
    }, "18"),
    ah: common_vendor.o(($event) => $data.showHeightPicker = false, "da")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-9842a0fa"]]);
tt.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-toutiao/pages/profile/guide.js.map
