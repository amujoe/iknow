// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database

/**
 * 删除关联的用户信息
 * @param {*} parmas 
 */
const getPhone = async (parmas) => {
  try {

    return parmas
      
  } catch(e) {
    console.error(e)
  }
}

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {
  switch (event.action) {
    case 'getPhone': {
      return getPhone(event)
    }
    default: {
      return
    }
  }
}
