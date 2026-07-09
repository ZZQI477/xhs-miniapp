"use strict";
require("../common/vendor.js");
const isXhsMiniApp = () => {
  return false;
};
const getLoginCode = () => {
  return new Promise((resolve, reject) => {
    reject(new Error("当前环境不支持小红书登录"));
  });
};
exports.getLoginCode = getLoginCode;
exports.isXhsMiniApp = isXhsMiniApp;
//# sourceMappingURL=../../.sourcemap/mp-toutiao/utils/xhsLogin.js.map
