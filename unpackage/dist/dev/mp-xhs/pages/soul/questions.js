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
      questions: [],
      soulAnswers: [
        { question_id: "", question: "", answer: "" },
        { question_id: "", question: "", answer: "" },
        { question_id: "", question: "", answer: "" }
      ],
      pickerVisible: false,
      currentPickerIndex: 0,
      pickerValue: [0]
    };
  },
  onLoad() {
    this.loadQuestions();
    this.loadMySoul();
  },
  methods: {
    // 加载问题列表
    async loadQuestions() {
      try {
        const res = await api_index.getQuestions();
        this.questions = res.data.list || [];
      } catch (e) {
        console.error("加载问题失败", e);
      }
    },
    // 加载我的灵魂问答
    async loadMySoul() {
      try {
        const res = await api_index.getMySoul();
        const soul = res.data.soul || [];
        soul.forEach((item, index) => {
          if (index < 3) {
            this.soulAnswers[index] = {
              question_id: item.question_id,
              question: item.question,
              answer: item.answer
            };
          }
        });
      } catch (e) {
        console.error("加载灵魂问答失败", e);
      }
    },
    // 显示问题选择器
    showQuestionPicker(index) {
      this.currentPickerIndex = index;
      this.pickerVisible = true;
    },
    // 隐藏问题选择器
    hideQuestionPicker() {
      this.pickerVisible = false;
    },
    // 选择器变化
    pickerChange(e) {
      this.pickerValue = e.detail.value;
    },
    // 确认选择问题
    confirmQuestion() {
      const selectedIndex = this.pickerValue[0];
      const selectedQuestion = this.questions[selectedIndex];
      this.soulAnswers[this.currentPickerIndex] = {
        question_id: selectedQuestion.id,
        question: selectedQuestion.title,
        answer: this.soulAnswers[this.currentPickerIndex].answer
      };
      this.hideQuestionPicker();
    },
    // 保存灵魂问答
    async saveSoul() {
      for (let i = 0; i < this.soulAnswers.length; i++) {
        if (!this.soulAnswers[i].question_id) {
          common_vendor.index.showToast({
            title: `请选择灵魂${["一", "二", "三"][i]}问`,
            icon: "none"
          });
          return;
        }
        if (!this.soulAnswers[i].answer || !this.soulAnswers[i].answer.trim()) {
          common_vendor.index.showToast({
            title: `请回答灵魂${["一", "二", "三"][i]}问`,
            icon: "none"
          });
          return;
        }
      }
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        await api_index.saveSoul({ soul: this.soulAnswers });
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (e) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: e.msg || "保存失败",
          icon: "none"
        });
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
      title: "灵魂三问",
      backgroundImage: "https://minixhs.chugao520.com/makefriends/bg4.png"
    }),
    b: common_vendor.f($data.soulAnswers, (item, index, i0) => {
      return {
        a: common_vendor.t(["一", "二", "三"][index]),
        b: common_vendor.t(item.question || "点击选择问题"),
        c: common_vendor.o(($event) => $options.showQuestionPicker(index), index),
        d: item.answer,
        e: common_vendor.o(($event) => item.answer = $event.detail.value, index),
        f: index
      };
    }),
    c: common_vendor.o((...args) => $options.saveSoul && $options.saveSoul(...args), "2a"),
    d: $data.pickerVisible
  }, $data.pickerVisible ? {
    e: common_vendor.o((...args) => $options.hideQuestionPicker && $options.hideQuestionPicker(...args), "b6"),
    f: common_vendor.o((...args) => $options.hideQuestionPicker && $options.hideQuestionPicker(...args), "3d"),
    g: common_vendor.o((...args) => $options.confirmQuestion && $options.confirmQuestion(...args), "8d"),
    h: common_vendor.f($data.questions, (q, idx, i0) => {
      return {
        a: common_vendor.t(q.title),
        b: idx
      };
    }),
    i: $data.pickerValue,
    j: common_vendor.o((...args) => $options.pickerChange && $options.pickerChange(...args), "fc")
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-de60bf8e"]]);
xhs.createPage(MiniProgramPage);
