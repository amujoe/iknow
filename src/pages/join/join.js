const { globalData } = getApp()

Page({
	data: {
    user: null, // 用户授权信息
    phone: "13260269699", // 电话
    account: null, // 账户信息
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
          enterprise_id: globalData.enterprise_id,
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
    // 标题
    if(!this.data.phone) {
      this.$showModal({
        title: '手机号不能为空'
      })
      return false
    }
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
        console.log('shout', data)
        const { errMsg, requestID, result} = data
        console.log('result', result)
        if(result.data && result.data.length) {
          this.setData({
            account: result.data[0]
          })
        } else {
          this.$showModal({
            title: "对不起, 你还不是圈内人"
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
        this.$hideLoading()
      }
    })
    
  },
  // 进入新世界
  enterTheNewWorld(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
});
