"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "CustomNavBar",
  props: {
    title: {
      type: String,
      default: ""
    },
    homeUrl: {
      type: String,
      default: "/pages/index/index"
    },
    homeIcon: {
      type: String,
      default: ""
    },
    backUrl: {
      type: String,
      default: ""
    },
    backIcon: {
      type: String,
      default: ""
    },
    fixed: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: Number,
      default: 100
    },
    backgroundColor: {
      type: String,
      default: "transparent"
    },
    backgroundImage: {
      type: String,
      default: ""
    },
    fontColor: {
      type: String,
      default: "#333333"
    },
    isShowBack: {
      type: Boolean,
      default: true
    },
    isShowLeft: {
      type: Boolean,
      default: true
    },
    isShowRight: {
      type: Boolean,
      default: true
    },
    defaultNavBarheight: {
      type: Number,
      default: 44
    },
    defaultMenuWidth: {
      type: Number,
      default: 80
    }
  },
  data() {
    return {
      statusBarHeight: 0,
      navBarHeight: 0,
      height: 0,
      menuButtonRect: {
        width: 80,
        top: 20,
        height: 32
      },
      isFirstPage: false
    };
  },
  mounted() {
    this.getRectInfo();
    this.checkIsFirstPage();
  },
  methods: {
    getRectInfo() {
      const sysInfo = common_vendor.index.getSystemInfoSync();
      this.statusBarHeight = sysInfo.statusBarHeight || 0;
      this.navBarHeight = this.defaultNavBarheight;
      this.height = this.statusBarHeight + this.defaultNavBarheight;
      if (common_vendor.index.canIUse("getMenuButtonBoundingClientRect") && typeof common_vendor.index.getMenuButtonBoundingClientRect === "function") {
        const menuButtonRect = common_vendor.index.getMenuButtonBoundingClientRect();
        const isValidRect = menuButtonRect && menuButtonRect.width && menuButtonRect.height && menuButtonRect.top >= this.statusBarHeight;
        if (isValidRect) {
          this.menuButtonRect = menuButtonRect;
          this.navBarHeight = (menuButtonRect.top - this.statusBarHeight) * 2 + menuButtonRect.height;
          this.height = this.statusBarHeight + this.navBarHeight;
        }
      }
    },
    checkIsFirstPage() {
      const pages = getCurrentPages();
      this.isFirstPage = pages.length === 1;
    },
    handleBack() {
      if (this.isFirstPage) {
        common_vendor.index.switchTab({ url: this.homeUrl });
      } else if (this.backUrl) {
        common_vendor.index.navigateTo({ url: this.backUrl });
      } else {
        common_vendor.index.navigateBack();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.backgroundImage,
    b: $data.height + "px",
    c: $data.statusBarHeight + "px",
    d: $props.isShowLeft
  }, $props.isShowLeft ? common_vendor.e({
    e: $props.isShowBack
  }, $props.isShowBack ? common_vendor.e({
    f: $data.isFirstPage
  }, $data.isFirstPage ? {
    g: $props.homeIcon || "https://minixhs.chugao520.com/makefriends/images/home.png"
  } : {
    h: $props.backIcon || "https://minixhs.chugao520.com/makefriends/back.png"
  }) : {}, {
    i: $data.menuButtonRect.width + "px",
    j: common_vendor.o((...args) => $options.handleBack && $options.handleBack(...args), "2d")
  }) : {}, {
    k: common_vendor.t($props.title),
    l: $props.isShowRight
  }, $props.isShowRight ? {
    m: $data.menuButtonRect.width + "px"
  } : {}, {
    n: $data.navBarHeight + "px",
    o: $props.fixed ? 1 : "",
    p: $data.height + "px",
    q: $props.backgroundColor,
    r: $props.zIndex,
    s: $props.fontColor
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-48606061"]]);
xhs.createComponent(Component);
