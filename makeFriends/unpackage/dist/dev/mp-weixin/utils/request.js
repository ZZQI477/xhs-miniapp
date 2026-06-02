"use strict";
const common_vendor = require("../common/vendor.js");
const utils_config = require("./config.js");
const getToken = () => {
  return common_vendor.index.getStorageSync("token") || "";
};
const setToken = (token) => {
  common_vendor.index.setStorageSync("token", token);
};
const removeToken = () => {
  common_vendor.index.removeStorageSync("token");
};
const getUserInfo = () => {
  const userInfo = common_vendor.index.getStorageSync("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};
const setUserInfo = (userInfo) => {
  common_vendor.index.setStorageSync("userInfo", JSON.stringify(userInfo));
};
const removeUserInfo = () => {
  common_vendor.index.removeStorageSync("userInfo");
};
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const header = {
      ...utils_config.config.headers,
      ...options.header
    };
    if (token) {
      header["token"] = token;
    }
    common_vendor.index.request({
      url: utils_config.config.baseUrl + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header,
      timeout: utils_config.config.timeout,
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data;
          if (data.code === 1) {
            resolve(data);
          } else if (data.code === 401) {
            removeToken();
            removeUserInfo();
            common_vendor.index.removeStorageSync("xhs_openid");
            common_vendor.index.setStorageSync("is_guest_mode", true);
            reject({ ...data, _isAuthError: true });
          } else {
            common_vendor.index.showToast({
              title: data.msg || "请求失败",
              icon: "none"
            });
            reject(data);
          }
        } else {
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({
          title: "网络连接失败",
          icon: "none"
        });
        reject(err);
      }
    });
  });
};
const get = (url, data = {}) => {
  return request({
    url,
    method: "GET",
    data
  });
};
const post = (url, data = {}) => {
  return request({
    url,
    method: "POST",
    data
  });
};
const upload = (url, filePath, name = "file") => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    common_vendor.index.uploadFile({
      url: utils_config.config.baseUrl + url,
      filePath,
      name,
      header: {
        "token": token
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          if (data.code === 1) {
            resolve(data);
          } else {
            common_vendor.index.showToast({
              title: data.msg || "上传失败",
              icon: "none"
            });
            reject(data);
          }
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        common_vendor.index.showToast({
          title: "上传失败",
          icon: "none"
        });
        reject(err);
      }
    });
  });
};
const http = {
  request,
  get,
  post,
  upload,
  getToken,
  setToken,
  removeToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo
};
exports.http = http;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
