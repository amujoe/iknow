// 获取应用实例
const { globalData, showMessage } = getApp();
const db = wx.cloud.database()

Page({
	data: {
    title: '',
    content_html: '',
    content_text: '',
  },
	async onLoad() {
  },
  onShow() {},
  // 标题 - 改变
  onTitleInputChange(e){
    const { value, cursor, keyCode } = e.detail
    this.setData({
      "title": value
    })
  },
  // 标题 - 完成
  onTitleInputConfirm(e) {
    const { value, cursor, keyCode } = e.detail
    this.setData({
      "title": value
    })
  },
  // content change
  onContentInputChange(e) {
    const { html, text, delta } = e.detail
    this.setData({
      "content_html": html,
      "content_text": text
    })
    
  },
  // blur 失去焦点
  onContentInputBlur(e) {
    const { html, text, delta } = e.detail

    this.setData({
      "content_html": html
    })
  },
  // 拿去授权信息
  bindGetUserInfo(e){
    let user = e.detail.userInfo
    globalData.user =  user
    console.log('user', user)
    // 存数据库
    // 调用云函数
    wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'add',
				nick_name: user.nickName,
        avatar: user.avatarUrl, // 助力
        gender: user.gender, // 性别
        country: user.country,
        province: user.province,
        city: user.city,
        create_time: db.serverDate(), // 创建时间(服务端时间)
        delete: 0, // 标记删除, 0 未删除 , 1 删除
			},
      success: res => {
        console.log('shout', res)
        // this.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })

    // 创建
    this.onCreateShout()
  },
  // 创建
  onCreateShout() {
    console.log('this.data.title', this.data.title)
    // 标题
    if(!this.data.title) {
      wx.showModal({
        title: '标题丢了',
        content: '赶快去输入标题',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        },
      })
      return false
    }
    // 内容
    if(!this.data.content_text) {
      wx.showModal({
        title: '内容丢了',
        content: '赶快去输入内容',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        },
      })
      return false
    }

    // 调用云函数
    wx.cloud.callFunction({
      name: 'shout',
      data: {
				action: 'add',
				openid: globalData.openid,
        title: this.data.title,
        content: this.data.content_html,
        likes: 0, // 助力
        comments: 0, // 评论数
        create_time: db.serverDate(), // 创建时间(服务端时间)
        delete: 0, // 标记删除, 0 未删除 , 1 删除
			},
      success: res => {
				console.log('shout', res)
        wx.showToast({
          title: '添加成功',
          icon: 'success',
          duration: 2000,
          success() {
          }
        })
      },
      fail: err => {
        wx.showToast({
          title: '添加失败',
          icon: 'fail',
          duration: 2000,
          success() {
          }
        })
      }
    })
    
  }
});
