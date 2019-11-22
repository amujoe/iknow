// 获取应用实例
const db = wx.cloud.database()
const { globalData } = getApp()

Page({
	data: {
		info: null, // 信息
    list: [], // 列表
    input_tag: '', // tag 内容
    show_create_tag: false, // 展示增加 tag 模块
  },
	onLoad(option) {
		let id = option.id
		// console.log(option)
    this.getDetail(id)

    console.log('globalData.user._id', globalData.user._id)
  },
  onShow() {},
  /**
	 * 获取详情
	 * @param {*} id 账号id
	 */
  getDetail(id) {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'queryById',
				id: id,
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
      }
    })
  },
   /**
	 * 获取形象
	 * @param {*} id 账号id
	 */
  getImageDetail() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'account',
      data: {
				action: 'queryById',
				id: id,
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
      }
    })
  },
  /**
   * 打标签
   */
  todoTag() {
    this.setData({
      'show_create_tag': !this.data.show_create_tag
    })
  },
  // 输入框改变
  tagChange(e) {
    this.data.input_tag = e.detail.value
  },
  /**
   * 打标签
   */
  toCreateTag() {
    let _this = this
    if(!this.data.input_tag) {
      this.$showToast({
        title: '标签不能为空'
      })
      return
    }
    
    // 调用云函数
    wx.cloud.callFunction({
      name: 'tag',
      data: {
				action: 'create',
        tag: this.data.input_tag,
        originator: globalData.user._id, // 发起人 id
        party: this.data.info._id, // 当事人 id
        enterprise_id: globalData.enterprise_id, // 公司编码
			},
      success: data => {
        console.log('pers', data)
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
  },
  /**
   * 爆黑料 
   * 1. 选图片
   */
  outputImage() {
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
  /**
   * 爆黑料 
   * 2. 上传图片
   * img_path 选中的图片临时地址
   */
  uploadImg(img_path){
    let _this = this
    this.$showLoading({title:"上传中"})
    let time = new Date().getTime()
    wx.cloud.uploadFile({
      cloudPath: 'images/' + time + '.png', // 上传至云端的路径
      filePath: img_path, // 小程序临时文件路径
      success: res => {
        console.log('上传成功', res)
        // 保存关联关系
        _this.saveImg(res.fileID)
      },
      fail(err) {
        console.error(err)
      }
    })
  },
  /**
   * 爆黑料 
   * 3. 上传完图片, 保存关系
   * img_url 图片id
   */
  saveImg(img_url){
    let _this = this
    // 调用云函数
    wx.cloud.callFunction({
      name: 'image',
      data: {
				action: 'create',
        image: img_url,
        originator: globalData.user._id, // 发起人 id
        party: this.data.info._id, // 当事人 id
        enterprise_id: globalData.enterprise_id, // 公司编码
			},
      success: data => {
        console.log('pers', data)
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
  },
});
