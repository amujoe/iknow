import {showLoading, hideLoading, showToast, showModal} from './utils/tips'

App({
	globalData: {
    /* ———————————————————————— 公共参数  —————————————————————— */
    scene: false, // 进入场景
    enterprise: null, // 企业
    user: null, // 用户信息
    system: null, // 手机系统信息
    isIpx: false, // 是否是iphonex
    // identity: 3, // 身份状态 0=无身份 1=有身份、并登陆 2=还未做判断
    /* ———————————————————————— 业务参数  —————————————————————— */
	},
	onLaunch() {
     // 云开发 初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: "test-cy001", //后续 API 调用的默认环境配置
        traceUser: true, //是否在将用户访问记录到用户管理中
      })
    }

    //  版本更新
    this.systemUpdateFn()
    // 运行环境
    this.getSystemInfo()
    // 页面增强
    this.enhancePage()
	},
	onShow() {
  },
  // 版本检测 更新
  systemUpdateFn() {
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
  // 获取系统环境
  getSystemInfo() {
    try {
      const res = wx.getSystemInfoSync();
      const { model, version, SDKVersion } = res;
      this.globalData.system = res;
      // ipx
      if (model.search("iPhone X") !== -1) {
        this.globalData.isIpx = true;
      } else {
        this.globalData.isIpx = false;
      }
      // customerNav
      let _version = parseInt(version.split(".").join(""));
      let _SDKVersion = parseInt(SDKVersion.split(".").join(""));
      if (_version > 700 && _SDKVersion > 243) {
        this.globalData.canUseCustomerNav = true;
      }
      // console.log("res", res)
      console.log("微信版本", _version)
      console.log("基础库版本", _SDKVersion)
      if (_SDKVersion < 275){
        console.log("版本过低")
        wx.redirectTo({
          url: '/pages/base/version/version',
        })
      }
    } catch (e) {
      console.log("app-getSystemInfo", e);
    }
  },
  // 增强Page能力
  enhancePage() {
    const tempPage = Page
    Page = config =>  {
      return tempPage(Object.assign(config, {
        $showToast: showToast,
        $showModal: showModal,
        $showLoading: showLoading,
        $hideLoading: hideLoading,
      }))
    }
  },
  // 登录
  async loginFn() {
    let _this = this
    let resolve = null
    let reject = null
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })
    wx.getStorage({
      key: 'USER',
      success: function(res){
        // success
        _this.globalData.user = res.data
        _this.globalData.enterprise = res.data.enterprise
        resolve(true)
      },
      fail: function(err) {
        // fail
        wx.redirectTo({
          url: '/pages/join/join',
        })
        reject(false)
      },
      complete: function() {
        // complete
      }
    })
    return promise
  },
});
