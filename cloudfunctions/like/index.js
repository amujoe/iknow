// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 查询点赞数
 */
const query = async (shoutid, openid) => {
  try {
    return await db.collection("_LIKE")
      .where({
        _relation_id: params.relation_id, // 关联的id = tag_id or image_id
      })
      .count()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 查询是否点过赞
 */
const isLiked = async (shoutid, openid) => {
  try {
    return await db.collection("_LIKE")
      .where({
        _relation_id: params.relation_id, // 关联的id = tag_id or image_id
        _originator_id: params.originator_id, // 点赞人的id
      })
      .count()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 记录点赞
 * @param {*} params
 */
const create = async (params) => {
  try {
    return await db.collection("_LIKE")
      .add({
        data: {
          _openid: OPENID,
          _relation_id: params.relation_id, // 关联的id = tag_id or image_id
          _originator_id: params.originator_id, // 点赞人的id
          type: params.type, // tag or image
          create_time: db.serverDate(), // 创建时间(服务端时间)
        },
      })
  } catch(e) {
    console.error(e)
  }
}

/**
 * 删除点赞
 * @param {*} params 
 */
const remove = async (params) => {
  try {
    return await db.collection("_LIKE")
      .where({
        _relation_id: params.relation_id, // 关联的id = tag_id or image_id
        _originator_id: params.originator_id, // 点赞人的id
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
    // 查询点赞数
    case 'query': {
      return query(event)
    }
    // 查询是否点过赞
    case 'isLiked': {
      return isLiked(event)
    }
    // 记录点赞
    case 'create': {
      return create(event)
    }
    // 删除点赞
    case 'remove': {
      return remove(event)
    }
    default: {
      return
    }
  }
}
