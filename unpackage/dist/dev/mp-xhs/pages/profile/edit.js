"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const common_assets = require("../../common/assets.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: {
    CustomNavBar
  },
  data() {
    return {
      currentStep: 1,
      form: {
        nickname: "",
        avatar: "",
        wechat: "",
        xiaohongshu: "",
        has_house: 0,
        has_car: 0,
        images: [],
        intro: "",
        my_tags: [],
        ideal_intro: "",
        ideal_tags: []
      },
      allTags: [],
      saving: false
    };
  },
  computed: {
    displayImages() {
      const result = [];
      for (let i = 0; i < 3; i++) {
        result.push(this.form.images[i] || "");
      }
      return result;
    },
    exampleAvatar() {
      return this.form.gender === 1 ? "/static/male-avatar.png" : "/static/female-avatar.png";
    },
    exampleName() {
      return this.form.gender === 1 ? "晓杨" : "梅林";
    },
    exampleIntro() {
      return this.form.gender === 1 ? "我目前是一名大厂的项目经理，我的家乡是内蒙古乌兰察布，因为在北京上学多年，在北京也买了房，北京算是我的第二故乡。性格方面是典型的摩羯男性格，踏实稳重，具有责任感，懂得知足，懂得感恩。外冷内热，在熟人面前就是一个沙雕，在恋人面前有时幼稚又沙雕。喜欢运动，每周至少去两次健身房，喜欢旅行和拍照。" : "你好吖，目前我在深圳做舞蹈老师。平时很爱笑，会变月牙眼，是容易从生活中获得快乐的性格，喜欢吃草莓和拍照。平时有点宅，在家喜欢研究新菜或烘焙，吃美食能让我能量满满。喜欢在B站看番，阅读让我心情轻松愉悦，在家练习古典舞和民族舞。我曾经喜欢玩游戏，若未来另一半不嫌弃我技术小白的话，我们一起玩吧。期待平淡温馨的小日子。";
    },
    exampleIdealIntro() {
      return this.form.gender === 1 ? "希望你善良一些，可爱一些，温柔大方，善解人意。希望你有自己的爱好和伙伴，追求向上，愿意一起把日子过得越来越好。希望情侣之间的关系能够是轻松、愉快的、相互扶持的。" : "希望你无不良嗜好、无黑历史。希望你有过恋爱史，对感情专一认真，希望你有养小动物。加分项：偏宅、会玩游戏、生活作息规律、饮食健康。";
    }
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
        const data = res.data.userinfo || res.data;
        this.form = {
          nickname: data.nickname || "",
          avatar: data.avatar || "",
          wechat: data.wechat || "",
          xiaohongshu: data.xiaohongshu || "",
          has_house: data.has_house || 0,
          has_car: data.has_car || 0,
          images: data.images || [],
          intro: data.intro || "",
          my_tags: data.my_tags || [],
          ideal_intro: data.ideal_intro || "",
          ideal_tags: data.ideal_tags || [],
          gender: data.gender || 1
        };
      } catch (e) {
        console.error("加载用户信息失败", e);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
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
        console.error("加载标签失败", e);
      }
    },
    // 选择属性
    selectProperty(type) {
      if (type === "none") {
        this.form.has_house = 0;
        this.form.has_car = 0;
      } else if (type === "house") {
        this.form.has_house = this.form.has_house ? 0 : 1;
        if (this.form.has_house)
          ;
      } else if (type === "car") {
        this.form.has_car = this.form.has_car ? 0 : 1;
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
    // 删除头像
    deleteAvatar() {
      this.form.avatar = "";
    },
    // 选择相册图片
    chooseImage() {
      const remainCount = 3 - this.form.images.length;
      if (remainCount <= 0) {
        common_vendor.index.showToast({ title: "最多上传3张照片", icon: "none" });
        return;
      }
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
      if (!this.form.images[index])
        return;
      common_vendor.index.previewImage({
        current: index,
        urls: this.form.images
      });
    },
    // 删除图片
    deleteImage(index) {
      this.form.images.splice(index, 1);
    },
    // 获取照片标签
    getPhotoLabel(index) {
      const labels = ["旅行照片", "兴趣照片", "更多照片"];
      return labels[index] || "添加照片";
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
    // 上一步
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    // 下一步/完成
    async nextStep() {
      if (this.currentStep === 1) {
        if (!this.form.nickname) {
          common_vendor.index.showToast({ title: "请输入姓名", icon: "none" });
          return;
        }
        if (!this.form.wechat) {
          common_vendor.index.showToast({ title: "请输入微信号", icon: "none" });
          return;
        }
      } else if (this.currentStep === 2) {
        if (!this.form.avatar) {
          common_vendor.index.showToast({ title: "请上传头像", icon: "none" });
          return;
        }
      } else if (this.currentStep === 3) {
        if (!this.form.intro || this.form.intro.length < 30) {
          common_vendor.index.showToast({ title: "自我介绍至少30字", icon: "none" });
          return;
        }
        if (this.form.my_tags.length <= 0) {
          common_vendor.index.showToast({ title: "请选择你的标签", icon: "none" });
          return;
        }
      }
      if (this.currentStep === 4) {
        if (!this.form.ideal_intro || this.form.ideal_intro.length < 30) {
          common_vendor.index.showToast({ title: "择偶要求至少30字", icon: "none" });
          return;
        }
        if (this.form.ideal_tags.length <= 0) {
          common_vendor.index.showToast({ title: "请选择你的择偶标签", icon: "none" });
          return;
        }
        await this.saveProfile();
      } else {
        console.log(this.form);
        this.currentStep++;
      }
    },
    // 保存资料
    async saveProfile() {
      this.saving = true;
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        await api_index.updateProfile(this.form);
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "保存失败", icon: "none" });
      } finally {
        this.saving = false;
        common_vendor.index.hideLoading();
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
      title: "编辑资料",
      backgroundImage: "/static/bg3.png"
    }),
    b: $data.currentStep / 4 * 100 + "%",
    c: $data.currentStep === 1
  }, $data.currentStep === 1 ? {
    d: $data.form.nickname,
    e: common_vendor.o(($event) => $data.form.nickname = $event.detail.value, "cf"),
    f: $data.form.wechat,
    g: common_vendor.o(($event) => $data.form.wechat = $event.detail.value, "10"),
    h: $data.form.xiaohongshu,
    i: common_vendor.o(($event) => $data.form.xiaohongshu = $event.detail.value, "3b"),
    j: !$data.form.has_house && !$data.form.has_car ? 1 : "",
    k: common_vendor.o(($event) => $options.selectProperty("none"), "ad"),
    l: $data.form.has_house ? 1 : "",
    m: common_vendor.o(($event) => $options.selectProperty("house"), "5f"),
    n: $data.form.has_car ? 1 : "",
    o: common_vendor.o(($event) => $options.selectProperty("car"), "25")
  } : {}, {
    p: $data.currentStep === 2
  }, $data.currentStep === 2 ? common_vendor.e({
    q: $data.form.avatar
  }, $data.form.avatar ? {
    r: $data.form.avatar
  } : {}, {
    s: $data.form.avatar
  }, $data.form.avatar ? {
    t: common_assets._imports_0$5,
    v: common_vendor.o((...args) => $options.deleteAvatar && $options.deleteAvatar(...args), "c5")
  } : {}, {
    w: common_vendor.o((...args) => $options.chooseAvatar && $options.chooseAvatar(...args), "32"),
    x: common_vendor.f($options.displayImages, (img, index, i0) => {
      return common_vendor.e({
        a: img
      }, img ? {
        b: img
      } : {
        c: common_vendor.t($options.getPhotoLabel(index))
      }, {
        d: img
      }, img ? {
        e: common_assets._imports_0$5,
        f: common_vendor.o(($event) => $options.deleteImage(index), index)
      } : {}, {
        g: index,
        h: common_vendor.o(($event) => img ? $options.previewImage(index) : $options.chooseImage(), index)
      });
    })
  }) : {}, {
    y: $data.currentStep === 3
  }, $data.currentStep === 3 ? {
    z: $data.form.intro,
    A: common_vendor.o(($event) => $data.form.intro = $event.detail.value, "44"),
    B: common_vendor.t(($data.form.intro || "").length),
    C: $options.exampleAvatar,
    D: common_vendor.t($options.exampleName),
    E: common_assets._imports_1$5,
    F: common_vendor.t($options.exampleIntro),
    G: common_vendor.f($data.allTags, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag.name),
        b: tag.id,
        c: $data.form.my_tags.includes(tag.name) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleTag("my_tags", tag.name), tag.id)
      };
    })
  } : {}, {
    H: $data.currentStep === 4
  }, $data.currentStep === 4 ? {
    I: $data.form.ideal_intro,
    J: common_vendor.o(($event) => $data.form.ideal_intro = $event.detail.value, "4f"),
    K: common_vendor.t(($data.form.ideal_intro || "").length),
    L: $options.exampleAvatar,
    M: common_vendor.t($options.exampleName),
    N: common_assets._imports_1$5,
    O: common_vendor.t($options.exampleIdealIntro),
    P: common_vendor.f($data.allTags, (tag, k0, i0) => {
      return {
        a: common_vendor.t(tag.name),
        b: "ideal-" + tag.id,
        c: $data.form.ideal_tags.includes(tag.name) ? 1 : "",
        d: common_vendor.o(($event) => $options.toggleTag("ideal_tags", tag.name), "ideal-" + tag.id)
      };
    })
  } : {}, {
    Q: $data.currentStep > 1
  }, $data.currentStep > 1 ? {
    R: common_vendor.o((...args) => $options.prevStep && $options.prevStep(...args), "d0")
  } : {}, {
    S: common_vendor.t($data.currentStep === 4 ? "完成" : "下一步"),
    T: $data.currentStep === 1 ? 1 : "",
    U: common_vendor.o((...args) => $options.nextStep && $options.nextStep(...args), "e9")
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-ead3e541"]]);
xhs.createPage(MiniProgramPage);
