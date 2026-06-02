"use strict";
const common_vendor = require("../../common/vendor.js");
const api_index = require("../../api/index.js");
const CustomNavBar = () => "../../components/custom-nav-bar.js";
const _sfc_main = {
  components: { CustomNavBar },
  data() {
    return {
      currentCity: "深圳",
      cities: ["深圳", "北京", "上海", "广州", "杭州", "成都"],
      activities: []
    };
  },
  methods: {
    showCityPicker() {
      common_vendor.index.showActionSheet({
        itemList: this.cities,
        success: (res) => {
          this.currentCity = this.cities[res.tapIndex];
        }
      });
    },
    goMyActivity() {
      common_vendor.index.showToast({ title: "我的活动功能开发中", icon: "none" });
    },
    goService() {
      common_vendor.index.showToast({ title: "一对一服务了解中", icon: "none" });
    },
    handleAction(item) {
      if (item.btnType === "share") {
        common_vendor.index.showShareMenu({
          withShareTicket: true,
          menus: ["shareAppMessage", "shareTimeline"]
        });
      } else if (item.btnType === "join") {
        common_vendor.index.showModal({
          title: "报名确认",
          content: `确认报名参加「${item.title}」？`,
          success: (res) => {
            if (res.confirm) {
              common_vendor.index.showToast({ title: "报名成功", icon: "success" });
            }
          }
        });
      } else {
        common_vendor.index.showToast({ title: "查看活动详情", icon: "none" });
      }
    },
    goPartyDetail(id) {
      console.log("id:", id);
      common_vendor.index.navigateTo({
        url: `/pages/party/detail?id=${id}`
      });
    },
    getTagList(tags) {
      if (typeof tags === "string") {
        return tags.split(",").map((t) => t.trim()).filter((t) => t);
      }
      if (Array.isArray(tags)) {
        return tags.map((t) => String(t).trim()).filter((t) => t);
      }
      return [];
    }
  },
  async onShow() {
    const res = await api_index.getPartyLists();
    console.log(res);
    if (res.code == 1) {
      console.log(res.data.list);
      this.activities = res.data.list ? res.data.list : "";
    }
  }
};
if (!Array) {
  const _component_custom_nav_bar = common_vendor.resolveComponent("custom-nav-bar");
  _component_custom_nav_bar();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.p({
      title: "线下活动",
      isShowBack: true,
      fontColor: "#6853F0",
      backgroundColor: "transparent"
    }),
    b: common_vendor.f($data.activities, (item, index, i0) => {
      return common_vendor.e({
        a: item.drawimg
      }, item.drawimg ? {
        b: item.drawimg
      } : item.thumbimg ? {
        d: item.thumbimg
      } : {}, {
        c: item.thumbimg,
        e: common_vendor.t(item.title),
        f: common_vendor.t(item.sub_title ? item.sub_title : "--"),
        g: common_vendor.f($options.getTagList(item.tags), (tag, tIdx, i1) => {
          return {
            a: common_vendor.t(tag),
            b: tIdx
          };
        }),
        h: item.begin_time
      }, item.begin_time ? {
        i: common_vendor.t(item.state_text),
        j: common_vendor.n(item.state_text === "已报满" ? "full" : "open"),
        k: common_vendor.t(item.begin_time ? item.begin_time : "--")
      } : {}, {
        l: item.btnType === "share"
      }, item.btnType === "share" ? {
        m: common_vendor.t(item.btnText),
        n: common_vendor.n(item.btnType),
        o: common_vendor.o(($event) => $options.handleAction(item), index)
      } : {}, {
        p: index,
        q: common_vendor.o(($event) => $options.goPartyDetail(item.partyid), index)
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5452fbff"]]);
xhs.createPage(MiniProgramPage);
