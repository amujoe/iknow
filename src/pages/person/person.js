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
		this.data.id = option.id
    // console.log(option)
    if(option.id) {
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
						image_list: result.data || []
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
        _this.getTagsDetail()
        _this.$showToast({
          title: '添加成功',
          icon: 'success',
        })
      },
      fail: err => {
        _this.$showToast({
          title: '添加失败',
          icon: 'fail',
        })
      },
      complete: () => {
        console.log('chengg')
        // 关闭输入
        _this.data.input_tag = ''
        _this.todoTag()
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
        _this.getImageDetail()
        _this.$showToast({
          title: '添加成功',
          icon: 'success',
        })
      },
      fail: err => {
        console.error('saveImg-err', err)
        _this.$showToast({
          title: '添加失败',
          icon: 'fail',
        })
      }
    })
  },
});
