import {showLoading, hideLoading, showToast, showModal} from './utils/tips'

import { debounce } from './utils/fnc'

App({
	globalData: {
    /* ———————————————————————— 公共参数  —————————————————————— */
    scene: false, // 进入场景
    enterprise_id: "fbe35240-423c-4df4-8d15-27ad2a7d629a", // 企业id
    openid: '', 
    // user: null, // 用户信息
    user: {
      _id: "05a1947c5dd00dad00da6a0e653427b6",
      name: "左木子",
      phone: "13260269699",
      image: ['']
    },
    system: null, // 手机系统信息
    isIpx: false, // 是否是iphonex
    // identity: 3, // 身份状态 0=无身份 1=有身份、并登陆 2=还未做判断
    location: { // 位置信息
      latitude: '',
      longitude: ''
    },
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
    // this.login() // 登录
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
        $debounce: debounce // 防多触
      }))
    }
  },
  // 登录
  async login() {
    let resolve = null
    let reject = null
    const promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })
    
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.openid = res.result.openid
        resolve()
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        reject()
      }
    })

    return promise
  },
});
