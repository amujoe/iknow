// 获取应用实例
const db = wx.cloud.database()
const { globalData, loginFn } = getApp()

Page({
	data: {
    input_value: "",
    list: [], // 列表
    no_more: false, // 没有更多
  },
	async onLoad() {
  },
  onShow() {},
  // 跳转详情
  goPersonDetail(e) {
    wx.redirectTo({
      url: '/pages/person/person?id=' + e.currentTarget.dataset.id,
    })
  },
  // input 改变
  inputChange(e){
    this.data.input_value = e.detail.value
  },
   // 搜索
  search() {
    if(this.data.input_value) {
      this.getInfoList()
    }
  },
  // 查询
  getInfoList() {
    this.$showLoading({title:"加载中"})
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
        action: 'queryByKey',
        enterprise_id: globalData.enterprise._id,
        keyword: this.data.input_value
			},
      success: res => {
        const { errMsg, requestID, result} = res
        if(result && result.data && result.data.length) {
            this.setData({
              list: result.data,
              no_more: false
            })
        } else {
          this.setData({
            list: [],
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
  focusBlur() {
    this.setData({
      isSearch: !this.data.isSearch
    })
  }
});
