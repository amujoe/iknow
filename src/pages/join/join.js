const { globalData } = getApp()

Page({
	data: {
    user: null, // 用户授权信息
    phone: "13260269699", // 电话
    account: null, // 账户信息
    enterprise_list: [
      {
        "_id": "b040a67a5deb4bad01142d3a3db1b0b0",
        "avatar": "",
        "enterprise": {
          "_id": "b040a67a5deb3e6001105c2116c2ecd8",
          "logo": "cloud://test-cy001.7465-test-cy001-1300855043/images/1575698847969.png",
          "name": "畅展科技有限公司"
        },
        "gender": 1,
        "name": "杨乔",
        "phone": "13260269699"
      },
      {
        "_id": "7799745c5deb4c1b0113c9ec2a84d466",
        "avatar": "",
        "enterprise": {
          "_id": "7799745c5deb49220112f67e4e390cfa",
          "name": "畅移(上海)科技有限公司"
        },
        "gender": 1,
        "name": "左木子",
        "phone": "13260269699"
      }
    ] // 企业
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
            enterprise_list: result.data
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
