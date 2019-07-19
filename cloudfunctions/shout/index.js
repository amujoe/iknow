// 云函数模板
// 部署：在 cloud-functions/**  文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

// 初始化 database
const db = cloud.database()
// 获取 openid
const { OPENID } = cloud.getWXContext()

/**
 * 获取 shout 数据(外部调用)
 * @param {*} page 
 * @param {*} limit 
 */
const queryShouts = async event => {
  let res = await getShouts(event.page, event.limit, event.openid)

  // 如果有数据
  if(res.data && res.data.length) {
    // 循环抓取用户信息
    for(let item of res.data) {
      // 请求user
      let user = await queryUserInfo(item.openid)
      // 如果有数据
      if(user.data && user.data.length) {
        item.nick_name = user.data[0].nick_name
        item.avatar = user.data[0].avatar
      } else {
        item.nick_name = ''
        item.avatar = ''
      }
    }
  }
  
  return res
}

/**
 * 获取 shout 数据(内部用)
 * @param {*} page 
 * @param {*} limit 
 */
const getShouts = async (page = 1, limit = 10, openid) => {

  let params = {}
  if (openid) params = {"_openid": openid}

  return await db.collection("_SHOUT")
    .where(params)
    .skip(limit * (page - 1)) // 跳过结果集中的前 10 条，从第 11 条开始返回, 用于分页
    .limit(limit) // 限制返回数量为 10 条
    .field({ // 过滤字段
      _id: true,
      openid: true,
      content: true,
      title: true,
      likes: true, // 助力
      comments: true, // 评论数
      update_time: true, // 创建时间(服务端时间)
    })
    .get()
}

/**
 * 查询关联的用户信息
 * @param {*} page 
 * @param {*} limit 
 */
const queryUserInfo = async (openid) => {
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
 * 写入
 * @param {*} item 
 */
const addShout = async (item) => {
  try {
    return await db.collection("_SHOUT")
      .add({
        data: {
          _openid: OPENID,
          title: item.title,
          content: item.content,
          likes: 0, // 助力
          comments: 0, // 评论数
          update_time: db.serverDate(), // 创建时间(服务端时间)
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
 * 更新
 * @param {*} id
 * @param {*} item 用户信息
 */
const updateShout = async (id, item) => {
  try {
    return await db.collection("_SHOUT")
      .where({
        "_id": id
      })
      .update({
        data: {
          title: item.title,
          content: item.content,
          likes: 0, // 助力
          comments: 0, // 评论数
          update_time: db.serverDate(), // 创建时间(服务端时间)
          delete: 0, // 标记删除, 0 未删除 , 1 删除
          // location: db.Geo.Point(113, 23) // 地理位置
        },
      })
  } catch(e) {
    console.error(e)
  }
}


/**
 * 删除
 * @param {*} id 
 */
const removeShout = async (id) => {
  try {
    return await db.collection("_SHOUT")
      .where({
        "_id": id
      })
      .remove()
  } catch(e) {
    console.error(e)
  }
}

/**
 * return
 */
exports.main = async (event, context) => {
  switch (event.action) {
    case 'get': {
      return queryShouts(event)
    }
    case 'add': {
      return addShout(event)
    }
    case 'update': {
      return updateShout(event)
    }
    case 'remove': {
      return removeShout(event.id)
    }
    default: {
      return
    }
  }
}
