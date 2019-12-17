/*
 * @Author: amujoe
 * @Date: 2019-11-17 08:20:33
 * @Description: file content
 */
// 获取应用实例
const db = wx.cloud.database()
const { globalData, loginFn } = getApp()

Page({
	data: {
    list: [], // 列表
    no_more: false, // 没有更多
    pagination: {
			page: 1,
			limit: 10
    },
  },
	async onLoad() {
    // 判断是否登陆
    if(!globalData.user) {
      const isLogged = await loginFn()
      // 已经登陆
      if(isLogged) {
        this.getInfoList()
      }
    } else {
      this.getInfoList()
    }
  },
  onShow() {},
  // 跳转详情
  goPersonDetail(e) {
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
    let limit = this.data.pagination.limit
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
        action: 'query',
        enterprise_id: globalData.enterprise._id,
        page: page,
        limit: limit,
			},
      success: res => {
        const { errMsg, requestID, result} = res
        if(result && result.data && result.data.length) {
          if(result.data.length < limit) {
            this.setData({
              list: [...this.data.list, ...result.data],
              no_more: true
            })
          } else {
            this.setData({
              list: [...this.data.list, ...result.data],
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
  },
  //search input 获取焦点 or 失去焦点
  goSearch() {
    wx.navigateTo({
      url: '/pages/enterprise-search/enterprise-search',
    })
  }
});
