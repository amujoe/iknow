// 获取应用实例
const db = wx.cloud.database()
const { globalData } = getApp()

Page({
	data: {
    name: '畅展科技有限公司', // 名称
    temp_images: [], // 临时形象地址, 用作展示
    image: [] // 形象
  },
	async onLoad() {
  },
  onShow() {},
  // 名字变化
  nameChange(e) {
    this.data.name = e.detail.value
  },
  // 上传: 1. 选择图片
  chooseImage(){
    let _this = this
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'], // 选择图片的来源
      sizeType: ['original'], // 所选的图片的尺寸 original 原图、 compressed 压缩
      success(res) {
        let {tempFilePaths, tempFiles} = res
        _this.uploadImg(tempFilePaths[0])
      }, 
      fail(err) {
        console.log('err', err)
      },
      complete() {

      }
    })
  },
  // 上传: 2. 上传图片
  uploadImg(img_path){
    let _this = this
    let temp = this.data.temp_images
    let time = new Date().getTime()
    this.$showLoading({
      title: "上传中"
    })
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
      },
      complete() {
        _this.$hideLoading()
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
        title: '企业名称不能为空'
      })
      return false
    }
    // logo
    if(!this.data.image || !this.data.image.length) {
      this.$showModal({
        title: 'logo 不能为空'
      })
      return false
    }
    
    this.$showLoading({
      title: "提交中"
    })
    // 调用云函数
    wx.cloud.callFunction({
      name: 'enterprise',
      data: {
				action: 'create',
        name: this.data.name,
        image: this.data.image ? this.data.image[0] : '',
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
