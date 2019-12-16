const { globalData } = getApp()

Page({
	data: {
    user: null, // 用户授权信息
    phone: "13260269699", // 电话
    account: null, // 账户信息
    enterprise_list: [], // 企业
    search_over: false, // 搜索完毕
  },
	async onLoad() {
  },
  onShow() {},
  // 获取用户授权
  getUserInfo(e) {
    let _this = this

    if(e.detail.userInfo) {
      // 调用云函数
      wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'create',
          ...e.detail.userInfo
        },
        success: data => {
          const { errMsg, requestID, result} = data
          _this.$showToast({
            title: '添加成功',
            icon: 'success',
          })
        },
        fail: err => {
          console.error('err', err)
          _this.$showToast({
            title: '添加失败',
            icon: 'fail',
          })
        }
      })
    }
  },
  // 获取手机号
  getPhoneNumber(e) {
    // if(!this.data.user) {
    //   this.$showModal({
    //     content: "请先授权用户信息"
    //   })
    //   return false
    // }
    // 调用云函数
    wx.cloud.callFunction({
      name: 'common',
      data: {
        action: 'getPhone',
        weRunData: wx.cloud.CloudID(e.detail.cloudID), // cloudID
			},
      success: res => {
        if(res.errMsg === "cloud.callFunction:ok") {
          this.data.phone = res.result.weRunData.data.purePhoneNumber
          this.verifyPhone() // 验证手机号
        } else {
          this.$showModal({
            title: "获取手机号失败"
          })
        }
      },
      fail: err => {
        console.error('saveImg-err', err)
      }
    })
  },
  // 验证手机号
  verifyPhone() {
    let _this = this
    this.$showLoading({
      title: "获取身份"
    })
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'queryByPhone',
        phone: this.data.phone,
			},
      success: data => {
        const { errMsg, requestID, result} = data
        if(result.data && result.data.length) {
          this.setData({
            search_over: true,
            enterprise_list: result.data
          })
        } else {
          this.setData({
            search_over: true,
          })
          this.$showModal({
            title: "没有找到你的身份牌",
            content: "请联系贵公司管理员"
          })
        }
      },
      fail: err => {
        console.error('err', err)
        this.$showToast({
          title: '查询失败失败',
          icon: 'fail',
        })
      },
      complete() {
        _this.$hideLoading()
      }
    })
    
  },
  // 进入新世界
  chooseEnterprise(e){

    let item = e.currentTarget.dataset.item
    console.log('item', item)
    globalData.user = item
    globalData.enterprise = item.enterprise
    wx.setStorage({
      key: 'USER',
      data: item
    })

    wx.switchTab({
      url: '/pages/index/index',
    })
  }
});
