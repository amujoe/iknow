// 获取应用实例
const db = wx.cloud.database()
const { globalData } = getApp()

Page({
	data: {
    id: '', // 当事人 id
		info: null, // 信息
    input_tag: '', // tag 内容
    show_create_tag: false, // 展示增加 tag 模块
    tag_list: [], // tag list
    image_list: [], // 形象 list
    pagination: { // 形象的分页
			page: 1,
			limit: 10,
			total: 0,
		}
  },
	onLoad(option) {
		this.data.id = globalData.user._id
    // console.log(option)
    if(globalData.user._id) {
      this.getDetail()
      this.getImageDetail()
      this.getTagsDetail()
    } else {
      console.error('没有传入参数')
    }
  },
  onShow() {},
  /**
	 * 获取详情
	 */
  getDetail() {
    let _this = this
    this.$showLoading({title:"加载中"})
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'queryById',
				id: this.data.id,
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
      },
      complete(){
        _this.$hideLoading()
      }
    })
  },
  /**
	 * 获取 tag
	 */
  getTagsDetail() {
    let _this = this
    let page = this.data.pagination.page
    this.$showLoading({title:"加载中"})
    // 调用云函数
    wx.cloud.callFunction({
      name: 'tag',
      data: {
				action: 'queryByParty',
        party: this.data.id, // 当事人
        page: page,
        limit: this.data.pagination.limit,
			},
      success: res => {
        const { errMsg, requestID, result} = res
        if(errMsg === "cloud.callFunction:ok") {
					this.setData({
						tag_list: result.data || []
					})
        }
      },
      fail: err => {
        console.error('getTagsDetail-err', err)
        this.$showToast({
          title: '获取形象失败',
          icon: 'fail',
        })
      },
      complete(){
        _this.$hideLoading()
      }
    })
  },
   /**
	 * 获取形象
	 */
  getImageDetail() {
    let _this = this
    let page = this.data.pagination.page
    this.$showLoading({title:"加载中"})
    // 调用云函数
    wx.cloud.callFunction({
      name: 'image',
      data: {
				action: 'queryByParty',
        party: this.data.id, // 当事人
        page: page,
        limit: this.data.pagination.limit,
			},
      success: res => {
        const { errMsg, requestID, result} = res
        if(errMsg === "cloud.callFunction:ok") {
					this.setData({
						image_list: result.data.map(item => {
              if(item.like_list){
                item.is_liked = item.like_list.indexOf(globalData.user._id) !== -1
                item.likes = item.like_list.length
              } else {
                item.is_liked = false
                item.likes = 0
              }
              return item
            })
          })
        }
      },
      fail: err => {
        console.error('getImageDetail-err', err)
        this.$showToast({
          title: '获取形象失败',
          icon: 'fail',
        })
      },
      complete(){
        _this.$hideLoading()
      }
    })
  },
  /**
   * 点赞
   * */ 
  todoLiked(e) {
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
        _this.getImageDetail()
      },
      fail: err => {
        console.error('saveImg-err', err)
      },
      complete: () => {
        this.$hideLoading()
      }
    })
  }
});
