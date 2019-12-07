// 获取应用实例
const db = wx.cloud.database()
const { globalData } = getApp()

Page({
	data: {
    list: [], // 列表
    pagination: {
			page: 1,
			limit: 10
    },
    no_more: false, // 没有更多
  },
	async onLoad() {
    this.getInfoList()
  },
  onShow() {},
  // 跳转详情
  goPersonDetail(e) {
    console.log('e', e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/person/person?id=' + e.currentTarget.dataset.id,
    })
  },
  // 到底部
  onReachBottom() {
    if(!this.data.no_more) {
      this.data.pagination.page += 1
      this.getInfoList()
    }
  },
  // 获取详情
  getInfoList() {
    this.$showLoading({title:"加载中"})
    let page = this.data.pagination.page
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
        action: 'query',
        enterprise_id: globalData.enterprise._id,
        page: page,
        limit: this.data.pagination.limit,
			},
      success: res => {
        console.log('res', res)
        const { errMsg, requestID, result} = res
        if(result && result.data && result.data.length) {
          if (page === 1) {
            this.setData({
              list: result.data
            })
          } else {
            this.setData({
              list: [...this.data.list, ...result.data]
            })
          }
        } else {
          this.setData({
            no_more: true
          })
        }
      },
      fail: err => {
        console.error('getInfoList-err', err)
        this.$showToast({
          title: '获取信息失败',
        })
      },
      complete: res => {
        this.$hideLoading()
      }
    })
  }
});
