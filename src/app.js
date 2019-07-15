import { camelCase } from 'lodash';

App({
	globalData: {
		scene: undefined, // 进入场景
    user: null, // 接口返回来的用户信息
    location: { // 位置信息
      latitude: '',
      longitude: ''
    },
    openid: '',
    // code: undefined, // wx.login =》 code 换 token
    // token: undefined, // token，传给后端
		system: null, // 当前系统环境
		windowWidth: 0, // 屏幕宽度
		windowHeight: 0, // 屏幕高度
    // is_registered: 2, // 是否注册过 (0=未注册，1=已注册, 2= 还没判断)
	},
	onLaunch() {
     // 云开发 初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

		this.getSystemInfo() // 手机系统信息
    this.systemUpdateFn() // 版本更新
    this.login() // 登录
	},
	onShow() {
	},
  // 获取手机系统信息
  getSystemInfo () {
    try {
      const res = wx.getSystemInfoSync()
      console.log('system', res)
			this.globalData.system = res
			this.globalData.windowWidth = res.windowWidth
			this.globalData.windowHeight = res.windowHeight
      // // 判断是否支持单页面自定义导航栏
      // let version = parseInt(res.version.split('.').join(''))
      // let SDKVersion = parseInt(res.SDKVersion.split('.').join(''))
      // if (version > 700 && SDKVersion > 243) {
      //   this.globalData.nav_custom = true
      //   // 计算导航栏高度
      //   let titleBarHeight = res.model.indexOf('iPhone') !== -1 ? 44 : 48
      //   let statusBarHeight = res.statusBarHeight || 20
      //   this.globalData.nav_height = parseInt(titleBarHeight) + parseInt(statusBarHeight)
      // }
    } catch (err) {
      console.error('app.js-getSystemInfo:', err)
    }
  },
  // 版本检测 更新
  systemUpdateFn () {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate((res) => {
        wx.showLoading({
          title: '检查更新中...',
          mask: true,
        })
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate()
                  wx.hideLoading()
                } else {
                  wx.hideLoading()
                }
              },
            })
          })
          updateManager.onUpdateFailed(() => {
            wx.hideLoading()
          })
        } else {
          wx.hideLoading()
        }
      })
    }
  },
  // 授权地理位置
  getLocationFn () {
    wx.getLocation({
      type: 'wgs84',
      success (res) {
        this.setData({
          "location.latitude": res.latitude,
          "location.longitude": res.longitude
        })
      }
    })
  },
  // 登录
  login() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('openid', res.result.openid)
        this.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
});
