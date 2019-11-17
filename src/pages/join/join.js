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
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
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

    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'queryByPhone',
        phone: this.data.phone,
        enterprise_id: globalData.enterprise_id,
			},
      success: data => {
        console.log('shout', data)
        const { errMsg, requestID, result} = data
        console.log('result', result)
        if(result.data && result.data.length) {
          _this.setData({
            account: result.data[0]
          })
        }
      },
      fail: err => {
        console.error('err', err)
        _this.$showToast({
          title: '查询失败失败',
          icon: 'fail',
        })
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
