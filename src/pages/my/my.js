// 获取应用实例
const app = getApp();

Page({
	data: {
		userInfo: {},
		menu_list: [
			{
				name: "我的呐喊"
			}
		]
	},
	async onLoad() {
	},
	// 关于我们
	goAbout() {
		wx.navigateTo({
			url: '/pages/about/about',
		})
	}
});
