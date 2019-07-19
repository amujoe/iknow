// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 查询点赞个数
 * 有 openid =》   某人对某条数据点赞次数
 * 没有 openid =》 某条‘喊话’被点赞总次数
 * @param {*} shoutid
 * @param {*} openid  user'openid
 */
const queryLike = async (shoutid, openid) => {
  try {
    return await db.collection("_LIKE")
      .where({
        "_shoutid": shoutid,
        "_openid": openid || ''
      })
      .count()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 新增 点赞数据
 * @param {*} shoutid  喊话 shout'id
 */
const like = async (shoutid) => {
  let already = false
  // 先查询有木有
  await queryLike(shoutid, OPENID).then(res => {
    if (res.data && res.data.total) {
      already = true
    }
  })
  // 是否点过赞
  if (already) {
    // 删除
    return await removeLike(shoutid, openid)
  } else {
    // 写入
    return await addLink(shoutid)
  }
}

/**
 * 新增 点赞数据
 * @param {*} shoutid
 */
const addLink = async (shoutid) => {
  try {
    return await db.collection("_LIKE")
      .add({
        data: {
          _openid: OPENID,
          _shoutid: shoutid,
          update_time: db.serverDate(), // 创建时间(服务端时间)
        },
      })
  } catch(e) {
    console.error(e)
  }
}

/**
 * 更新 用户信息
 * @param {*} id 喊话 shout'id
 */
const removeLike = async (id) => {
  try {
    return await db.collection("_LIKE")
      .where({
        "_shoutid": id,
        "_openid": openid
      })
      .remove()
  } catch(e) {
    console.error(e)
  }
}


/**
 * 删除关联的用户信息
 * @param {*} openid 
 */
const removeUserInfo = async (openid) => {
  try {
    return await db.collection("_LIKE")
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
    case 'get': {
      return queryUserInfo(event.shoutid, event.openid)
    }
    case 'like': {
      return like(event.shoutid)
    }
    default: {
      return
    }
  }
}
