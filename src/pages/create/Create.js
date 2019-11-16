// 获取应用实例
const db = wx.cloud.database()

Page({
	data: {
    name: '左木子', // 名称
    sex_arr: ['保密','男', '女'], 
    sex: 0, // 性别 index
    phone: '13260269699', // 入职日期
    temp_images: [], // 临时形象地址, 用作展示
    image: [] // 形象
  },
	async onLoad() {
  },
  onShow() {},
  // 性别- 改变
  sexChange(e){
    const { value, cursor, keyCode } = e.detail
    console.log('value', value)
    this.setData({
      "sex": value
    })
  },
  // 入职日期- 完成
  dateChange(e) {
    const { value, cursor, keyCode } = e.detail
    console.log('value', value)
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
        console.log('tempFilePaths', tempFilePaths)
        console.log('tempFiles', tempFiles)
        _this.uploadImg(tempFilePaths[0])
      }, 
      fail(err) {
        console.log('err', err)
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
    // 内容
    if(!this.data.image && this.data.image.length) {
      this.$showModal({
        title: '形象不能为空'
      })
      return false
    }

    // // 调用云函数
    // wx.cloud.callFunction({
    //   name: 'account',
    //   data: {
		// 		action: 'queryByName',
    //     name: this.data.name,
    //   },
    //   success: res => {
    //     console.log('ers', res)
    //   }
    // })

    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'create',
        name: this.data.name,
        gender: this.data.sex,
        phone: this.data.phone,
        image: this.data.image,
			},
      success: data => {
        console.log('shout', data)
        const { errMsg, requestID, result} = data
        _this.$showToast({
          title: '添加成功',
          icon: 'success',
        })
      },
      fail: err => {
        console.error('err', err)
        _this.$showToast({
          title: '添加失败',
          icon: 'fail',
        })
      }
    })
    
  }
});
