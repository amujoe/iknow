import { debounce, throttle } from '../../utils/fnc'

const db = wx.cloud.database()
const { globalData, loginFn } = getApp()
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
    input_show: false,
    temp_id: "", // 临时保存 id
    temp_name: "", // 临时保存name
    input_name: "" //
  },
	async onLoad () {
    // 判断是否登陆
    if(!globalData.user) {
      const isLogged = await loginFn()
      // 已经登陆
      if(isLogged) {
        this.getImageList()
      }
    } else {
      this.getImageList()
    }
	},
	onShow(){
		// 初始化
  },
  /**
   * 换一批
   */
  changeOther() {
    this.getImageList()
  },
	/**
	 * 获取列表
	 */
	async getImageList() {
    this.$showLoading({
      title: '加载中',
      mask: true
    })
    let limit = this.data.limit
    try{
      // 调用云函数
      wx.cloud.callFunction({
        name: 'image',
        data: {
          action: 'queryByRandom',
          enterprise_id: globalData.enterprise._id,
          limit: limit
        },
        success: res => {
          if(res.result.list && res.result.list.length) {
            this.setData({
              list: res.result.list.map(item => {
                // 认识
                if(item.party_info && item.party_info.length) {
                  item.knows = item.party_info[0].know_me.length
                } else {
                  item.knows = 0
                }
    
                // 点赞
                if(item.like_list){
                  item.is_liked = item.like_list.indexOf(globalData.user._id) !== -1
                  item.likes = item.like_list.length
                } else {
                  item.is_liked = false
                  item.likes = 0
                }
                
                return {
                  ...item,
                  input_show: false
                }
              })
            })
          }
        },
        fail: err => {
          console.error('index-getImageList', err)
        },
        complete: res => {
          this.$hideLoading()
        }
      })
    } catch(err){
      console.error('getImageList-err', err)
    }
  },

  /**
   * 点赞
   * */ 
  todoLike(e) {
    let _this = this
    let id = e.currentTarget.dataset.id
    this.$showLoading({
      title: '点赞进行中',
    })
    // 调用云函数
    wx.cloud.callFunction({
      name: 'image',
      data: {
        action: 'clickLike',
        _id: id, // image id
        originator: globalData.user._id, // 发起人 id
			},
      success: data => {
        if(data.result.stats.updated > 0) {
          _this.$showToast({
            title: '成功'
          })
        } else {
          _this.$showToast({
            title: '失败'
          })
        }
      },
      fail: err => {
        console.error('saveImg-err', err)
      }
    })
  },
  // 认识01. 隐藏 input
  inputHide() {
    let list = this.data.list.map(item => {
      item.input_show = false
      return item
    })
    this.setData({
      list: list
    })
  },
  // 认识01. 显示input
  todoShowInput(e){
    let id = e.currentTarget.dataset.id
    this.data.temp_id = e.currentTarget.dataset.party
    this.data.temp_name = e.currentTarget.dataset.name
    let list = this.data.list.map(item => {
      if(item._id === id) {
        item.input_show = !item.input_show
      } else {
        item.input_show = false
      }
      return item
    })
    this.setData({
      list: list
    })
  },
  // 认识02.  input 改变
  inputChange(e) {
    this.data.input_name = e.detail.value
  },
  // 认识03.  input 完成
  inputDone: throttle(function(e) {
    let name = e.detail.value
    if(name === this.data.temp_name) {
      this.$showToast({
        title: '恭喜你找到一个小伙伴'
      })
      this.sendInfo()
    } else {
      this.$showToast({
        title: '我想你还需要再深入认识一下ta'
      })
    }
  }, 3000),
  // 认识04. 发送消息
  sendInfo() {
		// 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'updateKnow',
        originator: globalData.user._id, // 发起人
        party: this.data.temp_id
			},
      success: res => {
        // console.log('res', res)
      },
      fail: err => {
        console.error('index-getImageList', err)
      }
    })
  },
  // swiperChange
  swiperChange(e) {
    let list = this.data.list.map(item => {
      item.input_show = false
      return item
    })
    this.data.temp_name = ''
    this.setData({
      list: list
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
  // 星云榜
  goRanking() {
    wx.navigateTo({
      url: '/pages/ranking/ranking',
    })
  }
})