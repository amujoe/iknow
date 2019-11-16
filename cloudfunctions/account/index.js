// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 查询关联的用户信息
 * @param {*} id 
 */
const queryById = async (id) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "_id_": id
      })
      .field({ // 过滤字段
        name: true,
        avatar: true,
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 查询是否有木有用户信息, 返回 _id_
 * @param {*} name 名字
 */
const queryByName = async (name) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "name": name
      })
      .field({ // 过滤字段
        _id_: true,
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 新增 用户信息(去重)
 * @param {*} param 用户信息
 */
const createBefore = async (param) => {
  let already = false
  // 先查询有木有
  await queryByName(param.name).then(res => {
    if (res.data && res.data.length) {
      already = true
    }
  })
  if (already) {
    // 更新
    return await updateUserInfo(OPENID, user)
  } else {
    // 写入
    return await create(user)
  }
}

/**
 * 写入 用户信息 (方法)
 * @param {*} info 
 */
const create = async (info) => {
  try {
    return await db.collection("_ACCOUNT")
      .add({
        data: {
          name: info.name,
          gender: info.gender, // 性别
          phone: info.phone, // 电话
          image: info.image, // 形象
          create_time: db.serverDate(), // 创建时间(服务端时间)
          delete: 0, // 标记删除, 0 未删除 , 1 删除
          // location: db.Geo.Point(113, 23) // 地理位置
        }
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
const updateInfo = async (openid, user) => {
  try {
    return await db.collection("_ACCOUNT")
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
 * @param {*} id 
 */
const removeInfo = async (id) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "_id_": id
      })
      .remove()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * event 参数包含小程序端调用传入的 data
 */
exports.main = (event, context) => {
  switch (event.action) {
    // 根据 id 查信息
    case 'queryById': {
      return queryById(event.openid)
    }
    // 根据名字查 id
    case 'queryByName': {
      return queryByName(event.openid)
    }
    // 新增
    case 'create': {
      return create(event)
      return createBefore(event)
    }
    // 更新
    case 'update': {
      return update(event)
    }
    // 删除
    case 'remove': {
      return remove(event.id)
    }
    default: {
      return
    }
  }
}
