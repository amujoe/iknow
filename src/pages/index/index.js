const db = wx.cloud.database()
const { globalData } = getApp()
const {getCurrentDate, getWeek, getCal } = require('../../utils/gettime')

Page({
  data: {
		date: { // 日期
			day: getCurrentDate(), // 天
			week: getWeek(), // 星期
			cal: getCal() // 农历
		},
    list: [],
		limit: 10, // 一次获取几条数据
  },
	onLoad () {
		this.getImageList()
		
	},
	onShow(){
		// 初始化
	},
  /**
   * 点赞
   * */ 
  todoLiked(e) {
    let _this = this
    let id = e.currentTarget.dataset.id
    // 调用云函数
    wx.cloud.callFunction({
      name: 'image',
      data: {
        action: 'clickLike',
        _id: id, // image id
        originator: globalData.user._id, // 发起人 id
			},
      success: data => {
        _this.getImageDetail()
      },
      fail: err => {
        console.error('saveImg-err', err)
      }
    })
  },
	/**
	 * 获取列表
	 */
	async getImageList() {
		let limit = this.data.limit

		// 调用云函数
    wx.cloud.callFunction({
      name: 'image',
      data: {
				action: 'queryByRandom',
				enterprise_id: globalData.enterprise_id,
				limit: limit
			},
      success: res => {
				this.setData({
					list: res.result.list
				})
      },
      fail: err => {
        console.error('index-getImageList', err)
      }
    })
  },
})