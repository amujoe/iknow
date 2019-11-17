// 获取应用实例
const db = wx.cloud.database()
const { globalData } = getApp()

Page({
	data: {
    list: []
  },
	async onLoad() {
  },
  onShow() {},
  // 保存
  saveInfo() {
    let _this = this
    // 标题
    if(!this.data.name) {
      this.$showModal({
        title: '姓名不能为空'
      })
      return false
    }
    // 内容
    if(!this.data.image && this.data.image.length) {
      this.$showModal({
        title: '形象不能为空'
      })
      return false
    }

    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'query',
        name: this.data.name,
        gender: this.data.sex,
        phone: this.data.phone,
        image: this.data.image,
        enterprise_id: globalData.enterprise_id, // 公司编码
			},
      success: data => {
        console.log('shout', data)
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
});
