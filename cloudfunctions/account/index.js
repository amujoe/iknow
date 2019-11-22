// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 查询关联的用户信息
 */
const query = async (params) => {
  let page = params.page || 1
  let limit = params.limit || 10
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "_enterprise_id": params.enterprise_id
      })
      .skip(limit * (page - 1)) // 跳过结果集中的前 10 条，从第 11 条开始返回, 用于分页
      .limit(limit) // 限制返回数量为 10 条
      .field({ // 过滤字段
        _id: true,
        name: true, // 姓名
        gender: true, // 性别 0保密, 1男, 2女
        phone: true, // 电话
        image: true // 形象
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 查询用户详情
 */
const queryById = async (params) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "_id": params.id,
      })
      .field({ // 过滤字段
        _id: true,
        name: true, // 姓名
        gender: true, // 性别 0保密, 1男, 2女
        phone: true, // 电话
        image: true // 形象
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 查询是否有木有用户信息, 返回 _id
 */
const queryByName = async (params) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "name": params.name,
        "_enterprise_id": params.enterprise_id
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
 * 核实身份, 返回 _id
 */
const queryByPhone = async (params) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "phone": params.phone,
        "_enterprise_id": params.enterprise_id
      })
      .field({ // 过滤字段
        _id: true,
        name: true, // 姓名
        gender: true, // 性别 0保密, 1男, 2女
        phone: true, // 电话
        image: true // 形象
      })
      .get()
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
      return await update(data[0]._id, info)
    } else {
      // 写入
      return await create(info)
    }
  } catch (err) {
    console.error('createBefore-err', err)
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
          _openid: '', // 关联的 openid
          _enterprise_id: info.enterprise_id, // 关联的公司 id
          name: info.name, // 姓名
          gender: info.gender, // 性别 0保密, 1男, 2女
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
 * @param {*} id
 * @param {*} info 用户信息
 */
const update = async (id, info) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "_id": id
      })
      .update({
        data: {
          // _enterprise_id: info.enterprise_id, // 关联的企业
          name: info.name,
          gender: info.gender, // 性别 0保密, 1男, 2女
          phone: info.phone, // 电话
          image: info.image, // 形象
          create_time: db.serverDate(), // 创建时间(服务端时间)
          delete: 0, // 标记删除, 0 未删除 , 1 删除
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
    return await db.collection("_ACCOUNT")
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
    // 根据 id 查信息
    case 'queryById': {
      return queryById(event)
    }
    // 根据名字查 id
    case 'queryByName': {
      return queryByName(event)
    }
    // 核实手机号
    case 'queryByPhone': {
      return queryByPhone(event)
    }
    // 新增
    case 'create': {
      // return create(event)
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
