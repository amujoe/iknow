/*
 * @Author: amujoe
 * @Date: 2019-12-09 14:45:07
 * @Description: file content
 */
// 获取应用实例
const db = wx.cloud.database()
const { globalData, loginFn } = getApp()

Page({
	data: {
    list: [], // 列表
    limit: 20, // 只展示前20
    no_more: false, // 没有更多
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
  // 获取详情
  getInfoList() {
    this.$showLoading({title:"加载中"})
    // 调用云函数
    wx.cloud.callFunction({
      name: 'image',
      data: {
        action: 'queryForRanking',
        enterprise_id: globalData.enterprise._id,
        limit: this.data.limit,
			},
      success: res => {
        console.log('res', res)
        const { errMsg, requestID, result} = res
        if(result && result.list && result.list.length) {
          this.setData({
            list: result.list
          })
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
  // 查看大图
  previewImage(e) {
    let url = e.currentTarget.dataset.image
    let arr = [url]
    if(url) {
      wx.previewImage({
        current: url, // 当前显示图片的http链接
        urls: arr, // 需要预览的图片http链接列表
      })
    }
   
  },
});
