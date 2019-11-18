// 获取应用实例
const db = wx.cloud.database()
const { globalData } = getApp()

Page({
	data: {
		info: null, // 信息
    list: [], // 列表
  },
	onLoad(option) {
		let id = option.id
		// console.log(option)
    this.getDetail(id)
  },
  onShow() {},
  /**
	 * 获取详情
	 * @param {*} id 账号id
	 */
  getDetail(id) {
    
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'queryById',
				id: id,
        enterprise_id: globalData.enterprise_id,
			},
      success: res => {
        console.log('res', res)
        const { errMsg, requestID, result} = res
        if(result && result.data && result.data.length) {
					this.setData({
						info: result.data[0]
					})
        }
      },
      fail: err => {
        console.error('getDetail-err', err)
        this.$showToast({
          title: '获取详情失败',
          icon: 'fail',
        })
      }
    })
    
  }
});
