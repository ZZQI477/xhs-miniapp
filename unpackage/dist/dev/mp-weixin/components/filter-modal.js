"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "FilterModal",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ["confirm", "dismiss"],
  data() {
    return {
      filterData: {
        ageRange: "",
        heightRange: "",
        education: "",
        city: ""
      },
      cityExpanded: false,
      // 城市列表是否展开
      ageOptions: [
        { label: "不限", value: "" },
        { label: "18-25", value: "18-25" },
        { label: "26-30", value: "26-30" },
        { label: "31-35", value: "31-35" },
        { label: "36-40", value: "36-40" },
        { label: "40+", value: "40-100" }
      ],
      heightOptions: [
        { label: "不限", value: "" },
        { label: "160以下", value: "0-160" },
        { label: "160-170", value: "160-170" },
        { label: "170-180", value: "170-180" },
        { label: "180以上", value: "180-250" }
      ],
      educationOptions: [
        { label: "不限", value: "" },
        { label: "专科", value: "专科" },
        { label: "本科", value: "本科" },
        { label: "硕士", value: "硕士" },
        { label: "博士", value: "博士" }
      ],
      cityOptions: [
        { label: "不限", value: "" },
        { label: "北京", value: "2" },
        { label: "上海", value: "802" },
        { label: "广州", value: "1965" },
        { label: "深圳", value: "1988" },
        { label: "香港", value: "3716" },
        { label: "合肥", value: "1047" },
        { label: "成都", value: "2368" },
        { label: "杭州", value: "934" },
        { label: "南京", value: "821" },
        { label: "武汉", value: "1710" },
        { label: "佛山", value: "2011" },
        { label: "中山", value: "2123" },
        { label: "东莞", value: "2091" },
        { label: "江门", value: "2017" },
        { label: "珠海", value: "1999" },
        { label: "无锡", value: "833" },
        { label: "天津", value: "20" },
        { label: "宁波", value: "948" },
        { label: "南通", value: "871" }
      ]
    };
  },
  computed: {
    // 根据展开状态返回要显示的城市（默认显示4个 + 不限）
    displayedCityOptions() {
      if (this.cityExpanded) {
        return this.cityOptions;
      }
      return this.cityOptions.slice(0, 5);
    }
  },
  watch: {
    visible(val) {
      if (val && this.filter) {
        this.filterData = { ...this.filterData, ...this.filter };
      }
    }
  },
  methods: {
    handleConfirm() {
      this.$emit("confirm", { ...this.filterData });
    },
    handleDismiss() {
      this.$emit("dismiss");
    },
    handleReset() {
      this.filterData = {
        ageRange: "",
        heightRange: "",
        education: "",
        city: ""
      };
      this.cityExpanded = false;
    },
    toggleCityExpand() {
      this.cityExpanded = !this.cityExpanded;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: common_vendor.o((...args) => $options.handleDismiss && $options.handleDismiss(...args), "f4"),
    c: common_vendor.f($data.ageOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: $data.filterData.ageRange === item.value ? 1 : "",
        c: item.value,
        d: common_vendor.o(($event) => $data.filterData.ageRange = item.value, item.value)
      };
    }),
    d: common_vendor.f($data.heightOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: $data.filterData.heightRange === item.value ? 1 : "",
        c: item.value,
        d: common_vendor.o(($event) => $data.filterData.heightRange = item.value, item.value)
      };
    }),
    e: common_vendor.f($data.educationOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: $data.filterData.education === item.value ? 1 : "",
        c: item.value,
        d: common_vendor.o(($event) => $data.filterData.education = item.value, item.value)
      };
    }),
    f: common_vendor.f($options.displayedCityOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: $data.filterData.city === item.value ? 1 : "",
        c: item.value,
        d: common_vendor.o(($event) => $data.filterData.city = item.value, item.value)
      };
    }),
    g: common_vendor.t($data.cityExpanded ? "收起" : "更多"),
    h: common_vendor.t($data.cityExpanded ? "↑" : "↓"),
    i: common_vendor.o((...args) => $options.toggleCityExpand && $options.toggleCityExpand(...args), "c6"),
    j: common_vendor.o((...args) => $options.handleReset && $options.handleReset(...args), "58"),
    k: common_vendor.o((...args) => $options.handleConfirm && $options.handleConfirm(...args), "de"),
    l: common_vendor.o(() => {
    }, "04"),
    m: common_vendor.o((...args) => $options.handleDismiss && $options.handleDismiss(...args), "1a")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c4fad269"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/filter-modal.js.map
