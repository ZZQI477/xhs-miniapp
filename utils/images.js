/**
 * 图片资源配置文件
 * 统一管理项目中使用的所有图片和图标资源
 */

const BASE_PATH = 'https://minixhs.chugao520.com/makefriends/images/'

export default {
  // TabBar 图标
  tabBar: {
    recommend: '/static/Frame@2x(1).png',
    recommendSelected: '/static/Frame@2x(5).png',
    home: '/static/Frame@2x.png',
    homeSelected: '/static/Frame@2x(4).png',
    message: '/static/Frame@2x(2).png',
    messageSelected: '/static/Frame@2x(6).png',
    mine: '/static/Frame@2x(3).png',
    mineSelected: '/static/Frame@2x(7).png'
  },

  // 筛选和UI图标
  filter: {
    icon: BASE_PATH + 'filter.png',
    reset: BASE_PATH + 'reset.png',
    location: BASE_PATH + 'location.png',
    rightArrow: BASE_PATH + 'right-arrow.png',
    arrow: BASE_PATH + 'arrow.png'
  },

  // VIP和会员相关
  vip: {
    icon: BASE_PATH + 'vip.png',
    badge: BASE_PATH + 'vip-badge.png',
    coin: BASE_PATH + 'coin.png',
    lockRed: BASE_PATH + 'lock-red.png'
  },

  // 认证图标
  identify: {
    idGreen: BASE_PATH + 'identify-id-green.png',
    idGrey: BASE_PATH + 'identify-id-grey.png',
    realBlue: BASE_PATH + 'identify-real-blue.png',
    realGrey: BASE_PATH + 'identify-real-grey.png'
  },

  // 通用UI图标
  common: {
    empty: BASE_PATH + 'empty.png',
    backward: BASE_PATH + 'backward.png',
    closeWhite: BASE_PATH + 'close-white.png',
    closeGrey: BASE_PATH + 'close-grey.png',
    warning: BASE_PATH + 'warning.png',
    checked: BASE_PATH + 'checked.png',
    unchecked: BASE_PATH + 'unchecked.png',
    qrcode: BASE_PATH + 'qrcode.png'
  },

  // 充值相关
  recharge: {
    expect: BASE_PATH + 'expect.png',
    headset: BASE_PATH + 'headset.png'
  }
}
