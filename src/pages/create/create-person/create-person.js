// 获取应用实例
const db = wx.cloud.database()
const { globalData } = getApp()

Page({
	data: {
    enterprise: 0,
    enterprise_arr: [], // 企业数据
    name: '左木子', // 名称
    sex_arr: ['保密','男', '女'], 
    sex: 1, // 性别 index
    phone: '13260269699', // 入职日期
    temp_images: [], // 临时形象地址, 用作展示
    image: [] // 形象
  },
	async onLoad() {
    this.getEnterprise()
  },
  onShow() {},
  // 获取企业
  getEnterprise() {
    let _this = this
    this.$showLoading({title:"加载中"})
    // 调用云函数
    wx.cloud.callFunction({
      name: 'enterprise',
      data: {
				action: 'query',
			},
      success: res => {
        const { errMsg, requestID, result} = res
        if(result && result.data && result.data.length) {
					this.setData({
						enterprise_arr: result.data
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
  // 名字 - 改变
  nameChange(e) {
    this.data.name = e.detail.value
  },
  // 企业- 改变
  enterpriseChange(e){
    const { value, cursor, keyCode } = e.detail
    this.setData({
      "enterprise": value
    })
  },
  // 性别- 改变
  sexChange(e){
    const { value, cursor, keyCode } = e.detail
    this.setData({
      "sex": value
    })
  },
  // 电话
  phoneChange(e) {
    this.data.phone = e.detail.value
    // this.setData({
    //   "name": e.detail.value
    // })
  },
  // 入职日期- 完成
  dateChange(e) {
    const { value, cursor, keyCode } = e.detail
    this.setData({
      "date": value
    })
  },
  // 选择图片
  chooseImage(){
    let _this = this
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'], // 选择图片的来源
      sizeType: ['original'], // 所选的图片的尺寸 original 原图、 compressed 压缩
      success(res) {
        let {tempFilePaths, tempFiles} = res
        // console.log('tempFilePaths', tempFilePaths)
        // console.log('tempFiles', tempFiles)
        _this.uploadImg(tempFilePaths[0])
      }, 
      fail(err) {
        console.error('err', err)
      },
      complete() {

      }
    })
  },
  // 上传
  uploadImg(img_path){
    let _this = this
    let temp = this.data.temp_images
    let time = new Date().getTime()
    wx.cloud.uploadFile({
      cloudPath: 'images/' + time + '.png', // 上传至云端的路径
      filePath: img_path, // 小程序临时文件路径
      success: res => {
        // 返回文件 ID
        _this.data.image.push(res.fileID)
        // 临时记录图片
        temp.push(img_path)
        _this.setData({
          "temp_images": temp
        })
      },
      fail(err) {
        console.error(err)
      }
    })
  },
  // 删除照片
  deleteImg() {
    this.data.image = []
    this.setData({
      "temp_images": []
    })
  },
  // 保存
  saveInfo() {
    let _this = this
    // 标题
    if(!this.data.name) {
      this.$showModal({
        title: '姓名不能为空'
      })
      return false
    }
    
    this.$showLoading({
      title: "提交中"
    })

    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'create',
        name: this.data.name,
        gender: this.data.sex,
        phone: this.data.phone,
        image: this.data.image ? this.data.image[0] : '',
        enterprise: this.data.enterprise_arr[this.data.enterprise], // 公司id
			},
      success: data => {
        const { errMsg, requestID, result} = data
        if(result.errMsg === "collection.add:ok") {
          this.$showToast({
            title: '添加成功',
            icon: 'success',
          })
        }
        if(result.errMsg === "collection.update:ok") {
          this.$showToast({
            title: '更新成功',
            icon: 'success',
          })
        }
      },
      fail: err => {
        console.error('err', err)
        _this.$showToast({
          title: '添加失败',
        })
      },
      complete() {
        _this.$hideLoading()
      }
    })
    
  }
});
