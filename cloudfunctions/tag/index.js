// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 查询
 * 根据当事人的id
 */
const queryByParty = async (params) => {
  let page = params.page || 1
  let limit = params.limit || 10
  try {
    return await db.collection("_TAG")
      .where({
        "party": params.party, // 当事人
      })
      .skip(limit * (page - 1)) // 跳过结果集中的前 10 条，从第 11 条开始返回, 用于分页
      .limit(limit) // 限制返回数量为 10 条
      .field({ // 过滤字段
        _id: true,
        tag: true, // 图像
        originator_name: true // 发起人
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 查询
 * 根据发起人的id
 */
const queryByOriginator = async (params) => {
  let page = params.page || 1
  let limit = params.limit || 10
  try {
    return await db.collection("_TAG")
      .where({
        "originator": params.originator,
      })
      .skip(limit * (page - 1)) // 跳过结果集中的前 10 条，从第 11 条开始返回, 用于分页
      .limit(limit) // 限制返回数量为 10 条
      .field({ // 过滤字段
        _id: true,
        tag: true, // 图像
        party_name: true, // 当事人
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 写入 用户信息 (方法)
 * @param {*} info 
 */
const create = async (info) => {
  try {
    return await db.collection("_TAG")
      .add({
        data: {
          _openid: OPENID, // 操作人 openid
          _enterprise_id: info.enterprise_id, // 公司 id
          tag: info.tag, // 姓名
          originator: info.originator, // 发起人 id
          originator_name: info.originator_name, // 发起人
          party: info.party, // 当事人 id
          party_name: info.party_name, // 当事人
          likes: 0, // 点赞
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
 * 新增 用户信息(去重)
 * @param {*} info 用户信息
 */
const createBefore = async (info) => {
  // 先查询有木有
  try {
    const {errMsg, data} = await queryByName(info)
    if (data && data.length) {
      // 更新
      return {errMsg, data}
    } else {
      // 写入
      return await create(info)
    }
  } catch (err) {
    console.error('createBefore-err', err)
  }
}

/**
 * 删除用户信息
 * @param {*} id 
 */
const remove = async (id) => {
  try {
    return await db.collection("_TAG")
      .where({
        "_id": id
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
    // 查当事人的tag
    case 'queryByParty': {
      return queryByParty(event)
    }
    // 查自己爆料的tag
    case 'queryByOriginator': {
      return queryByOriginator(event)
    }
    // 新增
    case 'createBefore': {
      return createBefore(event)
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
