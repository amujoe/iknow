// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid


/**
 * 查询关联的用户信息
 * @param {*} openid 
 */
const queryByOpenid = async (openid) => {
  try {
    return await db.collection("_USER")
      .where({
        "_openid": openid
      })
      .field({ // 过滤字段
        nick_name: true,
        avatar: true,
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 新增 用户信息(去重)
 * @param {*} user 用户信息
 */
const createBefore = async (user) => {
  // 先查询有木有
  try {
    const {errMsg, data} = await queryByOpenid(OPENID)
    if (data && data.length) {
      // 更新
      return await update(data[0]._id, user)
    } else {
      // 写入
      return await create(user)
    }
  } catch (err) {
    console.error('createBefore-err', err)
  }
}

/**
 * 写入 用户信息 (方法)
 * @param {*} user 
 */
const create = async (user) => {
  try {
    return await db.collection("_USER")
      .add({
        data: {
          _enterprise_id: user.enterprise_id,
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
const update = async (openid, user) => {
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


/**
 * 删除关联的用户信息
 * @param {*} openid 
 */
const remove = async (openid) => {
  try {
    return await db.collection("_USER")
      .where({
        "_openid": openid
      })
      .remove()
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
    case 'queryByOpenid': {
      return queryByOpenid(event.openid)
    }
    case 'create': {
      return createBefore(event)
    }
    case 'update': {
      return update(event)
    }
    case 'remove': {
      return remove(event.openid)
    }
    default: {
      return
    }
  }
}
