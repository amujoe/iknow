// 获取应用实例
const db = wx.cloud.database()
const { globalData } = getApp()

Page({
	data: {
		info: null, // 信息
    list: [], // 列表
  },
	async onLoad(option) {
		let id = option.id
    this.getDetail(id)
  },
  onShow() {},
  /**
	 * 获取详情
	 * @param {*} id 
	 */
  getDetail(id) {
    let page = this.data.pagination.page
    
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
        action: 'query',
        enterprise_id: globalData.enterprise_id,
        page: page,
        limit: this.data.pagination.limit,
			},
      success: res => {
        console.log('res', res)
        const { errMsg, requestID, result} = res
        if(result.data && result.data.length) {
          if (page === 1) {
            this.setData({
              list: result.data
            })
          } else {
            this.setData({
              list: [...this.data.list, ...result.data]
            })
          }
        }
      },
      fail: err => {
        console.error('getInfoList-err', err)
        this.$showToast({
          title: '获取信息失败',
          icon: 'fail',
        })
      }
    })
    
  }
});
