/*
 * @Author: amujoe
 * @Date: 2019-11-17 16:15:38
 * @Description: file content
 */
// 获取应用实例
const { globalData } = getApp();

Page({
	data: {
		user: {},
	},
	async onLoad() {
		// 判断是否登陆
    if(!globalData.user) {
      const isLogged = await loginFn()
      // 已经登陆
      if(isLogged) {
        this.getDetail()
      }
    } else {
      this.getDetail()
    }
	},
	getDetail() {
    let _this = this
    this.$showLoading({title:"加载中"})
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'queryForMy',
        id: globalData.user._id, // 当事人
			},
      success: res => {
        const { errMsg, requestID, result} = res
				if(result.list && result.list.length) {

					let info;
					info = result.list[0]
					// 点赞
					info.likes = 0
					if(info.image_list && info.image_list.length) {
						info.image_list.forEach(item => {
							info.likes += item.like_list.length || 0
						})
					}
					// 认识
					info.knows = info.i_know.length || 0
					// 焦点
					info.focus = info.know_me.length || 0
					this.setData({
						user: info
					})
					console.log('res', this.data.user)
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
	// 我的形象
	goMyImage() {
		wx.navigateTo({
			url: '/pages/my-image/my-image',
		})
	},
	// 我的爆料
	goMyUpload() {
		wx.navigateTo({
			url: '/pages/my-upload/my-upload',
		})
	},
	// 关于我们
	goAbout() {
		wx.navigateTo({
			url: '/pages/about/about',
		})
	}
});
