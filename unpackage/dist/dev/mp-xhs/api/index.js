"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const utils_request = require("../utils/request.js");
const mobileLogin = (data) => {
  return utils_request.http.post("/user/mobilelogin", data);
};
const sendSms = (data) => {
  return utils_request.http.post("/user/sendcode", data);
};
const xhsLogin = (data) => {
  return utils_request.http.post("/user/xhslogin", data);
};
const resetPassword = (data) => {
  return utils_request.http.post("/user/resetpwd", data);
};
const cancelAccount = (data) => {
  return utils_request.http.post("/user/cancel", data);
};
const getUserInfo = () => {
  return utils_request.http.get("/profile/index");
};
const updateProfile = (data) => {
  return utils_request.http.post("/profile/update", data);
};
const getUserStats = () => {
  return utils_request.http.get("/profile/stats");
};
const uploadAvatar = (filePath) => {
  return utils_request.http.upload("/profile/uploadAvatar", filePath);
};
const uploadImage = (filePath) => {
  return utils_request.http.upload("/profile/uploadImage", filePath);
};
const getBanners = (position = "home") => {
  return utils_request.http.get("/dating/banners", { position });
};
const getTags = (type = "") => {
  return utils_request.http.get("/dating/tags", { type });
};
const getQuestions = () => {
  return utils_request.http.get("/dating/questions");
};
const getPackages = () => {
  return utils_request.http.get("/dating/packages");
};
const getVipPackages = () => {
  return utils_request.http.get("/dating/vipPackages");
};
const getGroups = (city = "") => {
  return utils_request.http.get("/dating/groups", { city });
};
const getAreaList = (pid = 0) => {
  return utils_request.http.get("/dating/areaList", { pid });
};
const getUserList = (params) => {
  return utils_request.http.get("/dating/userList", params);
};
const getCoupleList = (params) => {
  return utils_request.http.get("/dating/coupleList", params);
};
const getRecommendList = (params) => {
  return utils_request.http.get("/dating/recommendList", params);
};
const getUserDetail = (userId) => {
  return utils_request.http.get("/dating/userDetail", { user_id: userId });
};
const toggleFollow = (data) => {
  return utils_request.http.post("/social/follow", data);
};
const getFollowList = (params) => {
  return utils_request.http.get("/social/followList", params);
};
const getFansList = (params) => {
  return utils_request.http.get("/social/fansList", params);
};
const getVisitList = (params) => {
  return utils_request.http.get("/social/visitList", params);
};
const sendRequest = (data) => {
  return utils_request.http.post("/request/send", data);
};
const getRequestList = (params) => {
  return utils_request.http.get("/request/lists", params);
};
const handleRequest = (data) => {
  return utils_request.http.post("/request/handle", data);
};
const wantView = (data) => {
  return utils_request.http.post("/social/want", data);
};
const getWantMeList = (params) => {
  return utils_request.http.get("/social/wantMeList", params);
};
const getMyWantList = (params) => {
  return utils_request.http.get("/social/myWantList", params);
};
const handleWant = (data) => {
  return utils_request.http.post("/social/handleWant", data);
};
const getMySoul = () => {
  return utils_request.http.get("/profile/soul");
};
const saveSoul = (data) => {
  return utils_request.http.post("/profile/soul", data);
};
const createOrder = (data) => {
  return utils_request.http.post("/pay/create", data);
};
const wxPay = (data) => {
  return utils_request.http.post("/pay/wxpay", data);
};
const faceVerifyInit = (data) => {
  return utils_request.http.post("/auth/faceVerifyInit", data);
};
const faceVerifyResult = (data) => {
  return utils_request.http.post("/auth/faceVerifyResult", data);
};
const submitEduAuth = (data) => {
  return utils_request.http.post("/auth/education", data);
};
const getAuthStatus = () => {
  return utils_request.http.get("/auth/status");
};
const getMessageList = (params) => {
  return utils_request.http.get("/message/index", params);
};
const getUnreadCount = () => {
  return utils_request.http.get("/message/unread");
};
const markMessageRead = (data) => {
  return utils_request.http.post("/message/read", data);
};
const clearMessages = (data) => {
  return utils_request.http.post("/message/clear", data);
};
const getAgreement = (params) => {
  return utils_request.http.get("/agreement/detail", params);
};
const getPartyLists = (params) => {
  return utils_request.http.get("/party/lists", params);
};
const getPartyDetail = (id) => {
  return utils_request.http.get("/party/detail", { id });
};
const getCasesLists = (params) => {
  return utils_request.http.get("/cases/lists", params);
};
const getCasesDetail = (id) => {
  return utils_request.http.get("/cases/detail", { id });
};
exports.cancelAccount = cancelAccount;
exports.clearMessages = clearMessages;
exports.createOrder = createOrder;
exports.faceVerifyInit = faceVerifyInit;
exports.faceVerifyResult = faceVerifyResult;
exports.getAgreement = getAgreement;
exports.getAreaList = getAreaList;
exports.getAuthStatus = getAuthStatus;
exports.getBanners = getBanners;
exports.getCasesDetail = getCasesDetail;
exports.getCasesLists = getCasesLists;
exports.getCoupleList = getCoupleList;
exports.getFansList = getFansList;
exports.getFollowList = getFollowList;
exports.getGroups = getGroups;
exports.getMessageList = getMessageList;
exports.getMySoul = getMySoul;
exports.getMyWantList = getMyWantList;
exports.getPackages = getPackages;
exports.getPartyDetail = getPartyDetail;
exports.getPartyLists = getPartyLists;
exports.getQuestions = getQuestions;
exports.getRecommendList = getRecommendList;
exports.getRequestList = getRequestList;
exports.getTags = getTags;
exports.getUnreadCount = getUnreadCount;
exports.getUserDetail = getUserDetail;
exports.getUserInfo = getUserInfo;
exports.getUserList = getUserList;
exports.getUserStats = getUserStats;
exports.getVipPackages = getVipPackages;
exports.getVisitList = getVisitList;
exports.getWantMeList = getWantMeList;
exports.handleRequest = handleRequest;
exports.handleWant = handleWant;
exports.markMessageRead = markMessageRead;
exports.mobileLogin = mobileLogin;
exports.resetPassword = resetPassword;
exports.saveSoul = saveSoul;
exports.sendRequest = sendRequest;
exports.sendSms = sendSms;
exports.submitEduAuth = submitEduAuth;
exports.toggleFollow = toggleFollow;
exports.updateProfile = updateProfile;
exports.uploadAvatar = uploadAvatar;
exports.uploadImage = uploadImage;
exports.wantView = wantView;
exports.wxPay = wxPay;
exports.xhsLogin = xhsLogin;
