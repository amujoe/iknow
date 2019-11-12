const db = wx.cloud.database()
const { globalData, login } = getApp()

Page({
  data: {
    x: 0,
		y: 0,
		animation: '', // 当前
		animation_t: '', // 顶
		animation_m: '', // 中
		animation_e: '', // 底
		item_active: null, // 当前
		item_active_index: 0, // 当前展示的 item 的下标 index
		item_next: null, // 下一个
		is_fling: false, // 是否在飞行
		list: [],
		pagination: {
			page: 1,
			limit: 10,
			total: 0,
		}
  },
	async onLoad () {
		
		await login()
		setTimeout(() => {
			this.getShoutsList() // 获取列表
		}, 500);
		
	},
	onShow(){
		// 初始化
    this.animation = wx.createAnimation({
      duration:0,
      timingFunction:'linear',
      delay:0
		})
		this.animation_t = wx.createAnimation({
      duration:0,
      timingFunction:'linear',
      delay:0
		})
		this.animation_m = wx.createAnimation({
      duration:0,
      timingFunction:'linear',
      delay:0
		})
		this.animation_e = wx.createAnimation({
      duration:0,
      timingFunction:'linear',
      delay:0
    })
	},
	/**
	 * bindchange 回调
	 * @param {*} e 
	 */
	cardMove(e){
		/**
		 * const { x, y, source } = e.detail
		 * source 表示产生移动的原因
		 * touch	拖动
		 * touch-out-of-bounds	超出移动范围
		 * out-of-bounds	超出移动范围后的回弹
		 * friction	惯性
		 * 空字符串	setData
		 */
		const { x, y} = e.detail
		let absX = Math.abs(x)

		// x 轴距离小于 50, 返回
		if(absX < 200 && !this.data.is_fling) {
			let r = absX < 90 ? x * 0.5 : x < 0 ? -45 : 45
			this.animation.translateX(x).translateY(y).rotate(r).step()
			// scale 0.9 -> 1
			// translateY 40px -> 0
			// opacity 0.8 -> 1
			let ts = absX < 200 ? 0.9 + Math.abs(x/2000) : 1
			let ty = absX < 200 ? 40 - absX * 40 / 200 : 0
			let tp = absX < 200 ? 0.8 + Math.abs(absX * 0.2 / 200) : 1
			this.animation_t.translateY(ty).scale(ts).opacity(tp).step()
			// scale 0.8 -> 0.9
			// translateY 70px -> 40px
			// opacity 0.5 -> 0.8
			let ms = absX < 200 ? 0.8 + Math.abs(x/2000) : 0.9
			let my = absX < 200 ? 70 - absX * 30 / 200 : 40
			let mp = absX < 200 ? 0.5 + Math.abs(absX * 0.3 / 200) : 0.8
			this.animation_m.translateY(my).scale(ms).opacity(mp).step()
			// scale 0.7 -> 0.8
			// translateY 70px -> 70px
			// opacity 0 -> 0.5
			let es = absX < 200 ? 0.7 + Math.abs(x/2000) : 0.8
			let ey = absX < 200 ? 120 - absX * 50 / 200 : 70
			let ep = absX < 200 ? Math.abs(absX * 0.5 / 200) : 0.5
			this.animation_e.translateY(ey).scale(es).opacity(ep).step()

			this.setData({
				x: 0,
				y: 0,
				animation: this.animation.export(),
				animation_t: this.animation_t.export(),
				animation_m: this.animation_m.export(),
				animation_e: this.animation_e.export()
			});
		}

		// x 轴大于 200 并且有数据
		if(absX >= 200 && !this.data.is_fling && this.data.item_next){
			this.cardFly(x, y)
		}

		// x 轴大于 200 无数据 回归
		if(absX >= 200 && !this.data.is_fling && !this.data.item_next){
			this.animation.translateX(0).translateY(0).rotate(0).step()
			this.setData({
				animation: this.animation.export(),
			});
		}
	},
	/**
	 * card 飞出去
	 * @param {*} x 
	 * @param {*} y 
	 */
	cardFly(x,y){
		// 如果在飞 请出去
		if(this.data.is_fling)
			return false

		// 飞行
		let fx = x * 5
		let fy = y
		let index = this.data.item_active_index + 1
		this.animation.translateX(fx).translateY(fy).rotate(45).opacity(0).step()
		// scale 0.9 -> 1
		// translateY 40px -> 0
		// opacity 0.8 -> 1
		this.animation_t.translateY(0).scale(1).opacity(1).step()
		// scale 0.8 -> 0.9
		// translateY 70px -> 40px
		// opacity 0.5 -> 0.8
		this.animation_m.translateY(40).scale(0.9).opacity(0.8).step()
		// scale 0.7 -> 0.8
		// translateY 70px -> 70px
		// opacity 0 -> 0.5
		this.animation_e.translateY(70).scale(0.8).opacity(0.5).step()
		this.setData({
			is_fling: true,
			item_active_index: index,
			item_active: this.data.list[index],
			animation: this.animation.export(),
			animation_t: this.animation_t.export(),
			animation_m: this.animation_m.export(),
			animation_e: this.animation_e.export()
		});

		// 回归
		setTimeout(() => {
			this.animation.translateX(0).translateY(0).rotate(0).step()
			this.setData({
				animation: this.animation.export(),
			});
		}, 500)
		setTimeout(() => {
			this.animation.translateX(0).translateY(0).rotate(0).opacity(1).step()
			this.setData({
				is_fling: false,
				item_next: this.data.list[index + 1] || null,
				animation: this.animation.export(),
			});
		}, 700)
		// 阅读过半, 加载新的(遇 5 拉新)
		if(index/ 5 % 2 === 1) {
			this.setData({
				"pagination.page": this.data.pagination.page + 1
			})
			this.getShoutsList()
		}
	},
	/**
	 * 获取列表
	 */
	async getShoutsList() {
		let page = this.data.pagination.page
		let limit = this.data.pagination.limit
		let index = this.data.item_active_index

		// 调用云函数
    wx.cloud.callFunction({
      name: 'shout',
      data: {
				action: 'get',
				page: page,
				limit: limit
			},
      success: res => {
				console.log('shout', res.result.data)

				if (page === 1) {
					// this.setData({
					// 	list: [...res.result.data[1]],
					// 	item_active: res.result.data[1],
					// 	item_next: null,
					// })
					this.setData({
						list: res.result.data,
						item_active: res.result.data[index],
						item_next: res.result.data[index + 1],
					})
				} else {
					let list = this.data.list
					list = [...list, ...res.result.data]
					this.setData({
						list: list
					})
				}
      },
      fail: err => {
        console.error('index-getShoutsList', err)
      }
    })
  },
})