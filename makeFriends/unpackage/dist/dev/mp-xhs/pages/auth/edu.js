"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        edu_image: ""
      },
      submitting: false
    };
  },
  methods: {
    // 上传学历证明
    uploadEduImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          try {
            common_vendor.index.showLoading({ title: "上传中..." });
            const uploadRes = await api_index.uploadImage(res.tempFilePaths[0]);
            this.formData.edu_image = uploadRes.data.url;
            common_vendor.index.showToast({ title: "上传成功", icon: "success" });
          } catch (e) {
            common_vendor.index.showToast({ title: e.msg || "上传失败", icon: "none" });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    },
    // 提交认证
    async submitAuth() {
      if (!this.formData.edu_image) {
        common_vendor.index.showToast({ title: "请上传学历证明", icon: "none" });
        return;
      }
      this.submitting = true;
      try {
        await api_index.submitEduAuth(this.formData);
        common_vendor.index.showToast({ title: "提交成功，请等待审核", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (e) {
        common_vendor.index.showToast({ title: e.msg || "提交失败", icon: "none" });
      } finally {
        this.submitting = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.formData.edu_image
  }, $data.formData.edu_image ? {
    b: $data.formData.edu_image
  } : {}, {
    c: common_vendor.o((...args) => $options.uploadEduImage && $options.uploadEduImage(...args), "9a"),
    d: common_vendor.o((...args) => $options.submitAuth && $options.submitAuth(...args), "d0"),
    e: $data.submitting
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f702d177"]]);
xhs.createPage(MiniProgramPage);
