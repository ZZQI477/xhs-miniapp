/**
 * CDN 图片资源工具
 * 将静态图片迁移到七牛云存储，减少小程序包体积
 */

// 七牛云 CDN 基础路径
const CDN_BASE = 'https://minixhs.chugao520.com/makefriends';

// 图片路径映射表
const CDN_MAPPING = {
  // 根目录图片
  '/static/1_4婚礼婚庆.png': `${CDN_BASE}/1_4婚礼婚庆.png`,
  '/static/3、单身库 1.png': `${CDN_BASE}/3、单身库 1.png`,
  'https://minixhs.chugao520.com/makefriends/back.png': `${CDN_BASE}/back.png`,
  'https://minixhs.chugao520.com/makefriends/bg1.png': `${CDN_BASE}/bg1.png`,
  'https://minixhs.chugao520.com/makefriends/bg2.png': `${CDN_BASE}/bg2.png`,
  'https://minixhs.chugao520.com/makefriends/bg3.png': `${CDN_BASE}/bg3.png`,
  'https://minixhs.chugao520.com/makefriends/bg4.png': `${CDN_BASE}/bg4.png`,
  'https://minixhs.chugao520.com/makefriends/Frame (1).png': `${CDN_BASE}/Frame (1).png`,
  'https://minixhs.chugao520.com/makefriends/Frame (2).png': `${CDN_BASE}/Frame (2).png`,
  'https://minixhs.chugao520.com/makefriends/Frame (3).png': `${CDN_BASE}/Frame (3).png`,
  'https://minixhs.chugao520.com/makefriends/Frame 1420074377.png': `${CDN_BASE}/Frame 1420074377.png`,
  'https://minixhs.chugao520.com/makefriends/Frame 1420074379.png': `${CDN_BASE}/Frame 1420074379.png`,
  'https://minixhs.chugao520.com/makefriends/Frame 1420074380.png': `${CDN_BASE}/Frame 1420074380.png`,
  'https://minixhs.chugao520.com/makefriends/Frame 1420074381.png': `${CDN_BASE}/Frame 1420074381.png`,
  'https://minixhs.chugao520.com/makefriends/Frame 1890182609@2x.png': `${CDN_BASE}/Frame 1890182609@2x.png`,
  'https://minixhs.chugao520.com/makefriends/Frame 1890183229@2x.png': `${CDN_BASE}/Frame 1890183229@2x.png`,
  'https://minixhs.chugao520.com/makefriends/Frame 1890184003.png': `${CDN_BASE}/Frame 1890184003.png`,
  'https://minixhs.chugao520.com/makefriends/Frame(1).png': `${CDN_BASE}/Frame(1).png`,
  'https://minixhs.chugao520.com/makefriends/Frame(2).png': `${CDN_BASE}/Frame(2).png`,
  'https://minixhs.chugao520.com/makefriends/Frame(3).png': `${CDN_BASE}/Frame(3).png`,
  'https://minixhs.chugao520.com/makefriends/Frame(4).png': `${CDN_BASE}/Frame(4).png`,
  'https://minixhs.chugao520.com/makefriends/Frame(5).png': `${CDN_BASE}/Frame(5).png`,
  'https://minixhs.chugao520.com/makefriends/Frame(6).png': `${CDN_BASE}/Frame(6).png`,
  'https://minixhs.chugao520.com/makefriends/Frame(7).png': `${CDN_BASE}/Frame(7).png`,
  'https://minixhs.chugao520.com/makefriends/Frame.png': `${CDN_BASE}/Frame.png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x (1).png': `${CDN_BASE}/Frame@2x (1).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x (2).png': `${CDN_BASE}/Frame@2x (2).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x (3).png': `${CDN_BASE}/Frame@2x (3).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x (4).png': `${CDN_BASE}/Frame@2x (4).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x(10).png': `${CDN_BASE}/Frame@2x(10).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x(11).png': `${CDN_BASE}/Frame@2x(11).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x(12).png': `${CDN_BASE}/Frame@2x(12).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x(13).png': `${CDN_BASE}/Frame@2x(13).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x(14).png': `${CDN_BASE}/Frame@2x(14).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x(8).png': `${CDN_BASE}/Frame@2x(8).png`,
  'https://minixhs.chugao520.com/makefriends/Frame@2x(9).png': `${CDN_BASE}/Frame@2x(9).png`,
  'https://minixhs.chugao520.com/makefriends/logo.png': `${CDN_BASE}/logo.png`,
  'https://minixhs.chugao520.com/makefriends/m.png': `${CDN_BASE}/m.png`,
  'https://minixhs.chugao520.com/makefriends/round_right_fill.png': `${CDN_BASE}/round_right_fill.png`,
  'https://minixhs.chugao520.com/makefriends/wm.png': `${CDN_BASE}/wm.png`,
  'https://minixhs.chugao520.com/makefriends/ygz.png': `${CDN_BASE}/ygz.png`,
  'https://minixhs.chugao520.com/makefriends/位图(1).png': `${CDN_BASE}/位图(1).png`,
  'https://minixhs.chugao520.com/makefriends/位图(2).png': `${CDN_BASE}/位图(2).png`,
  'https://minixhs.chugao520.com/makefriends/位图(3).png': `${CDN_BASE}/位图(3).png`,
  'https://minixhs.chugao520.com/makefriends/位图(4).png': `${CDN_BASE}/位图(4).png`,
  'https://minixhs.chugao520.com/makefriends/位图(5).png': `${CDN_BASE}/位图(5).png`,
  'https://minixhs.chugao520.com/makefriends/位图.png': `${CDN_BASE}/位图.png`,
  'https://minixhs.chugao520.com/makefriends/位图5.png': `${CDN_BASE}/位图5.png`,
  'https://minixhs.chugao520.com/makefriends/位图6.png': `${CDN_BASE}/位图6.png`,
  'https://minixhs.chugao520.com/makefriends/位图7.png': `${CDN_BASE}/位图7.png`,
  '/static/关注.png': `${CDN_BASE}/关注.png`,
  'https://minixhs.chugao520.com/makefriends/右.png': `${CDN_BASE}/右.png`,
  '/static/客户维护.png': `${CDN_BASE}/客户维护.png`,
  '/static/社区-01.png': `${CDN_BASE}/社区-01.png`,
  '/static/编组 14.png': `${CDN_BASE}/编组 14.png`,
  '/static/编组 6.png': `${CDN_BASE}/编组 6.png`,
  '/static/设置.png': `${CDN_BASE}/设置.png`,
  
  // icons 目录
  'https://minixhs.chugao520.com/makefriends/icons/arrow-right.png': `${CDN_BASE}/icons/arrow-right.png`,
  'https://minixhs.chugao520.com/makefriends/icons/close.png': `${CDN_BASE}/icons/close.png`,
  'https://minixhs.chugao520.com/makefriends/icons/copy.png': `${CDN_BASE}/icons/copy.png`,
  'https://minixhs.chugao520.com/makefriends/icons/female-default.png': `${CDN_BASE}/icons/female-default.png`,
  'https://minixhs.chugao520.com/makefriends/icons/follow.png': `${CDN_BASE}/icons/follow.png`,
  'https://minixhs.chugao520.com/makefriends/icons/friend.png': `${CDN_BASE}/icons/friend.png`,
  'https://minixhs.chugao520.com/makefriends/icons/male-default.png': `${CDN_BASE}/icons/male-default.png`,
  'https://minixhs.chugao520.com/makefriends/icons/question.png': `${CDN_BASE}/icons/question.png`,
  'https://minixhs.chugao520.com/makefriends/icons/real-person-auth.png': `${CDN_BASE}/icons/real-person-auth.png`,
  'https://minixhs.chugao520.com/makefriends/icons/real-person-unauth.png': `${CDN_BASE}/icons/real-person-unauth.png`,
  'https://minixhs.chugao520.com/makefriends/icons/realname-auth.png': `${CDN_BASE}/icons/realname-auth.png`,
  'https://minixhs.chugao520.com/makefriends/icons/realname-unauth.png': `${CDN_BASE}/icons/realname-unauth.png`,
  'https://minixhs.chugao520.com/makefriends/icons/report.png': `${CDN_BASE}/icons/report.png`,
  'https://minixhs.chugao520.com/makefriends/icons/share.png': `${CDN_BASE}/icons/share.png`,
  'https://minixhs.chugao520.com/makefriends/icons/share.svg': `${CDN_BASE}/icons/share.svg`,
  'https://minixhs.chugao520.com/makefriends/icons/verified.png': `${CDN_BASE}/icons/verified.png`,
  'https://minixhs.chugao520.com/makefriends/icons/warning.png': `${CDN_BASE}/icons/warning.png`,
  'https://minixhs.chugao520.com/makefriends/icons/wechat.png': `${CDN_BASE}/icons/wechat.png`,
  
  // images 目录
  'https://minixhs.chugao520.com/makefriends/images/arrow.png': `${CDN_BASE}/images/arrow.png`,
  'https://minixhs.chugao520.com/makefriends/images/backward.png': `${CDN_BASE}/images/backward.png`,
  'https://minixhs.chugao520.com/makefriends/images/checked.png': `${CDN_BASE}/images/checked.png`,
  'https://minixhs.chugao520.com/makefriends/images/close-grey.png': `${CDN_BASE}/images/close-grey.png`,
  'https://minixhs.chugao520.com/makefriends/images/close-white.png': `${CDN_BASE}/images/close-white.png`,
  'https://minixhs.chugao520.com/makefriends/images/coin.png': `${CDN_BASE}/images/coin.png`,
  'https://minixhs.chugao520.com/makefriends/images/empty.png': `${CDN_BASE}/images/empty.png`,
  'https://minixhs.chugao520.com/makefriends/images/expect.png': `${CDN_BASE}/images/expect.png`,
  'https://minixhs.chugao520.com/makefriends/images/filter.png': `${CDN_BASE}/images/filter.png`,
  'https://minixhs.chugao520.com/makefriends/images/headset.png': `${CDN_BASE}/images/headset.png`,
  'https://minixhs.chugao520.com/makefriends/images/home-selected.png': `${CDN_BASE}/images/home-selected.png`,
  'https://minixhs.chugao520.com/makefriends/images/home.png': `${CDN_BASE}/images/home.png`,
  'https://minixhs.chugao520.com/makefriends/images/identify-id-green.png': `${CDN_BASE}/images/identify-id-green.png`,
  'https://minixhs.chugao520.com/makefriends/images/identify-id-grey.png': `${CDN_BASE}/images/identify-id-grey.png`,
  'https://minixhs.chugao520.com/makefriends/images/identify-real-blue.png': `${CDN_BASE}/images/identify-real-blue.png`,
  'https://minixhs.chugao520.com/makefriends/images/identify-real-grey.png': `${CDN_BASE}/images/identify-real-grey.png`,
  'https://minixhs.chugao520.com/makefriends/images/location.png': `${CDN_BASE}/images/location.png`,
  'https://minixhs.chugao520.com/makefriends/images/lock-red.png': `${CDN_BASE}/images/lock-red.png`,
  'https://minixhs.chugao520.com/makefriends/images/message-selected.png': `${CDN_BASE}/images/message-selected.png`,
  'https://minixhs.chugao520.com/makefriends/images/message.png': `${CDN_BASE}/images/message.png`,
  'https://minixhs.chugao520.com/makefriends/images/mine-selected.png': `${CDN_BASE}/images/mine-selected.png`,
  'https://minixhs.chugao520.com/makefriends/images/mine.png': `${CDN_BASE}/images/mine.png`,
  'https://minixhs.chugao520.com/makefriends/images/qrcode.png': `${CDN_BASE}/images/qrcode.png`,
  'https://minixhs.chugao520.com/makefriends/images/recommend-selected.png': `${CDN_BASE}/images/recommend-selected.png`,
  'https://minixhs.chugao520.com/makefriends/images/recommend.png': `${CDN_BASE}/images/recommend.png`,
  'https://minixhs.chugao520.com/makefriends/images/reset.png': `${CDN_BASE}/images/reset.png`,
  'https://minixhs.chugao520.com/makefriends/images/right-arrow.png': `${CDN_BASE}/images/right-arrow.png`,
  'https://minixhs.chugao520.com/makefriends/images/unchecked.png': `${CDN_BASE}/images/unchecked.png`,
  'https://minixhs.chugao520.com/makefriends/images/vip-badge.png': `${CDN_BASE}/images/vip-badge.png`,
  'https://minixhs.chugao520.com/makefriends/images/vip.png': `${CDN_BASE}/images/vip.png`,
  'https://minixhs.chugao520.com/makefriends/images/warning.png': `${CDN_BASE}/images/warning.png`,
  'https://minixhs.chugao520.com/makefriends/images/成功案例@2x.png': `${CDN_BASE}/images/成功案例@2x.png`,
  'https://minixhs.chugao520.com/makefriends/images/线下活动@2x.png': `${CDN_BASE}/images/线下活动@2x.png`,
  'https://minixhs.chugao520.com/makefriends/images/首页背景图@2x.png': `${CDN_BASE}/images/首页背景图@2x.png`,
};

/**
 * 获取 CDN 图片地址
 * @param {string} localPath 本地路径，如 'https://minixhs.chugao520.com/makefriends/bg3.png'
 * @returns {string} CDN 地址
 */
export function getCdnUrl(localPath) {
  return CDN_MAPPING[localPath] || localPath;
}

/**
 * CDN 基础路径
 */
export const CDN = CDN_BASE;

/**
 * 常用图片快捷访问
 */
export const IMG = {
  // 背景图
  bg1: `${CDN}/bg1.png`,
  bg2: `${CDN}/bg2.png`,
  bg3: `${CDN}/bg3.png`,
  bg4: `${CDN}/bg4.png`,
  
  // 图标
  ygz: `${CDN}/ygz.png`,
  logo: `${CDN}/logo.png`,
  m: `${CDN}/m.png`,
  wm: `${CDN}/wm.png`,
  back: `${CDN}/back.png`,
  
  // Frame 图标
  follow: `${CDN}/Frame 1420074377.png`,
  contact: `${CDN}/Frame 1420074379.png`,
  more: `${CDN}/Frame 1420074380.png`,
  
  // 登录相关
  loginTitle: `${CDN}/Frame 1890183229@2x.png`,
  soulBanner: `${CDN}/Frame 1890184003.png`,
  
  // 我的页面
  editIcon: `${CDN}/Frame 1890182609@2x.png`,
  
  // 位图
  coin: `${CDN}/位图.png`,
  coinBg: `${CDN}/位图5.png`,
  mineBg: `${CDN}/位图7.png`,
};

export default {
  getCdnUrl,
  CDN,
  IMG
};
