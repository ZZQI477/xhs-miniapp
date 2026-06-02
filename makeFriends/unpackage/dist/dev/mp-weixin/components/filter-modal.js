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
        { label: "北京", value: "北京" },
        { label: "上海", value: "上海" },
        { label: "广州", value: "广州" },
        { label: "深圳", value: "深圳" }
      ]
    };
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
    f: common_vendor.f($data.cityOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: $data.filterData.city === item.value ? 1 : "",
        c: item.value,
        d: common_vendor.o(($event) => $data.filterData.city = item.value, item.value)
      };
    }),
    g: common_vendor.o((...args) => $options.handleReset && $options.handleReset(...args), "47"),
    h: common_vendor.o((...args) => $options.handleConfirm && $options.handleConfirm(...args), "f0"),
    i: common_vendor.o(() => {
    }, "04"),
    j: common_vendor.o((...args) => $options.handleDismiss && $options.handleDismiss(...args), "1a")
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c4fad269"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/filter-modal.js.map
