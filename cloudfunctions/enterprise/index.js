// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 查询所有企业, 
 * 列表用
 */
const query = async (params) => {
  try {
    return await db.collection("_ENTERPRISE")
      .field({ // 过滤字段
        _id: true,
        name: true, // 姓名
        logo: true, // logo
      })
      .orderBy('name', 'asc')
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 查询是否已经新增, 返回 _id
 */
const queryByName = async (params) => {
  try {
    return await db.collection("_ENTERPRISE")
      .where({
        "name": params.name,
      })
      .field({ // 过滤字段
        _id: true,
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 新增 (去重)
 * @param {*} params 企业信息
 */
const createBefore = async (params) => {
  // 先查询有木有
  try {
    const {errMsg, data} = await queryByName(params)
    if (data && data.length) {
      // 更新
      return update(data[0]._id, params)
    } else {
      // 写入
      return await create(params)
    }
  } catch (err) {
    console.error('createBefore-err', err)
  }
}

/**
 * 写入 用户信息 (方法)
 * @param {*} params 
 */
const create = async (params) => {
  try {
    return await db.collection("_ENTERPRISE")
      .add({
        data: {
          name: params.name, // 企业名称
          logo: params.image, //
          create_time: db.serverDate(), // 创建时间(服务端时间)
        }
      })
  } catch(e) {
    console.error(e)
  }
}


/**
 * 更新 信息
 * @param {*} id
 * @param {*} params 信息
 */
const update = async (id, params) => {
  try {
    return await db.collection("_ENTERPRISE")
      .where({
        "_id": id
      })
      .update({
        data: {
          name: params.name, // 企业名称
          logo: params.image, // logo
        }
      })
  } catch(e) {
    console.error(e)
  }
}

/**
 * 删除用户信息
 * @param {*} id 
 */
const remove = async (id) => {
  try {
    return await db.collection("_ENTERPRISE")
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
    // 查询
    case 'query': {
      return query(event)
    }
    // 新增
    case 'create': {
      // return create(event)
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
