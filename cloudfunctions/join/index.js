// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('../user/node_modules/wx-server-sdk')

// 初始化
cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 写入 用户信息 (方法)
 * @param {*} user 
 */
const addUser = async (user) => {
  try {
    return await db.collection("_USER")
      .add({
        data: {
          _openid: OPENID,
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
      })
  } catch(e) {
    console.error(e)
  }
}

/**
 * 更新 用户信息
 * @param {*} openid
 * @param {*} user 用户信息
 */
const updateUserInfo = async (openid, user) => {
  try {
    return await db.collection("_USER")
      .where({
        "_openid": openid
      })
      .update({
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
      })
  } catch(e) {
    console.error(e)
  }
}

exports.main = (event, context) => {
  console.log(event)
  console.log(context)
  switch (event.action) {
    case 'get': {
      return queryUserInfo(event.openid)
    }
    case 'add': {
      return addUserInfo(event)
    }
    case 'update': {
      return updateUserInfo(event)
    }
    case 'remove': {
      return removeUserInfo(event.openid)
    }
    default: {
      return
    }
  }
}
