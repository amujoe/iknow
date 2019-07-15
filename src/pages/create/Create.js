// 获取应用实例
const { globalData } = getApp();
const db = wx.cloud.database()

Page({
	data: {
    content: {},
    html: '123',
    text: '',
    placeholder: "喊吧! 喊出来就痛快了..."
  },
	async onLoad() {
  },
  onShow() {},
  // ready
  onEditorReady() {
    const that = this
    wx.createSelectorQuery().select('#editor').context(function (res) {
      that.editorCtx = res.context
    }).exec()
  },
  // change
  onInputChange(e) {
    const { html, text, delta } = e.detail
    
  },
  // blur 失去焦点
  onInputBlur(e) {
    const { html, text, delta } = e.detail

    console.log('html', html)
    this.setData({
      "html": html
    })
    console.log('html', this.data.html)
  },
  // 拿去授权信息
  bindGetUserInfo(e){
    console.log(e.detail.userInfo)
    let user = e.detail.userInfo
    globalData.user =  user
    console.log('user', user)
    // 存数据库
    db.collection("_USER").add({
      data: {
        nick_name: user.nickName,
        avatar: user.avatarUrl, // 助力
        gender: user.gender, // 性别
        country: user.country,
        province: user.province,
        city: user.city,
        create_time: db.serverDate(), // 创建时间(服务端时间)
        delete: 0, // 标记删除, 0 未删除 , 1 删除
        // location: db.Geo.Point(113, 23) // 地理位置
      },
      success: res => {
        console.log('res', res)
      },
      fail: err => {
        console.log('err', err)
      },
      complete: msg => {
        console.log('msg', msg)
      }
    })

    // 创建
    this.onCreateShout()
  },
  // 创建
  onCreateShout() {

    db.collection("_SHOUT").add({
      data: {
        content: this.data.html,
        likes: 0, // 助力
        comments: 0, // 评论数
        create_time: db.serverDate(), // 创建时间(服务端时间)
        delete: 0, // 标记删除, 0 未删除 , 1 删除
        // location: db.Geo.Point(113, 23) // 地理位置
      },
      success: res => {
        console.log('res', res)
      },
      fail: err => {
        console.log('err', err)
      },
      complete: msg => {
        console.log('msg', msg)
      }
    })
  }
});
