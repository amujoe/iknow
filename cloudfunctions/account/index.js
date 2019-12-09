// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 查询 企业下的 用户信息, 
 * 列表用
 */
const query = async (params) => {
  let page = params.page || 1
  let limit = params.limit || 10
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "enterprise": {
          "_id": params.enterprise_id
        } 
      })
      .skip(limit * (page - 1)) // 跳过结果集中的前 10 条，从第 11 条开始返回, 用于分页
      .limit(limit) // 限制返回数量为 10 条
      .field({ // 过滤字段
        _id: true,
        name: true, // 姓名
        gender: true, // 性别 0保密, 1男, 2女
        phone: true, // 电话
        avatar: true, // 头像
      })
      .orderBy('name', 'asc')
      .get()
  } catch(e) {
    console.error(e)
  }
}


/**
 * 查询 企业下的 用户信息, 
 * 列表用
 */
const queryByKey = async (params) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "enterprise": {
          "_id": params.enterprise_id
        },
        "name": params.keyword
      })
      .field({ // 过滤字段
        _id: true,
        name: true, // 姓名
        gender: true, // 性别 0保密, 1男, 2女
        phone: true, // 电话
        avatar: true, // 头像
      })
      .orderBy('name', 'asc')
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 查询用户详情
 * 详情用
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
        avatar: true, // 头像
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}


/**
 * 查询用户详情
 * 详情用
 */
const queryForMy = async (params) => {
  try {
    return await db.collection("_ACCOUNT").aggregate()
      .match({
        "_id": params.id,
      })
      .lookup({ // 链表
        from: '_IMAGE', // 关联表
        localField: '_id', // 本表 要匹配字段
        foreignField: 'party', // 关联表 要匹配字段
        as: 'image_list',
      })
      .project({ // 过滤字段
        _id: true,
        name: true, // 姓名
        gender: true, // 性别 0保密, 1男, 2女
        avatar: true, // 头像
        image_list: true, // 标签
        i_know: true, // 标签
        know_me: true // 标签
      })
      .end()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 核实身份, 返回 _id
 * 注册时候用
 */
const queryByPhone = async (params) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "phone": params.phone,
      })
      .field({ // 过滤字段
        _id: true,
        enterprise: true, // 企业
        name: true, // 姓名
        gender: true, // 性别 0保密, 1男, 2女
        phone: true, // 电话
        avatar: true // 头像
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 核实身份, 返回 _id
 * 新增时候用
 */
const checkByPhone = async (params) => {
  try {
    return await db.collection("_ACCOUNT")
      .where({
        "phone": params.phone,
        "enterprise": {
          "_id": params.enterprise._id
        }
      })
      .field({ // 过滤字段
        _id: true,
        name: true, // 姓名
        gender: true, // 性别 0保密, 1男, 2女
        phone: true, // 电话
        avatar: true // 形象
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
    const {errMsg, data} = await checkByPhone(info)
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
          enterprise: info.enterprise, // 关联的公司 id
          name: info.name, // 姓名
          gender: info.gender, // 性别 0保密, 1男, 2女
          phone: info.phone, // 电话
          avatar: info.image || "", // 形象
          i_know: [], // 我认识的
          know_me: [], // 认识我的
          create_time: db.serverDate(), // 创建时间(服务端时间)
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
          name: info.name,
          gender: info.gender, // 性别 0保密, 1男, 2女
          phone: info.phone, // 电话
          avatar: info.image, // 形象
        }
      })
  } catch(e) {
    console.error(e)
  }
}

/**
 * 更新 用户关系
 * @param {*} params 用户信息
 */
const updateKnow = async (params) => {
  try {
    // 1.1 更新当事人的, 认识 ta 的人
    await db.collection("_ACCOUNT")
      .where({
        "_id": params.party // 当事人
      })
      .update({
        data: {
          know_me: db.command.pull(params.originator),
        }
      })
    // 1.2 更新当事人的, 认识 ta 的人
    await db.collection("_ACCOUNT")
      .where({
        "_id": params.party // 当事人
      })
      .update({
        data: {
          know_me: db.command.push(params.originator)
        }
      })
    // 2.1 更新发起人的 ta 认识的人
    await db.collection("_ACCOUNT")
      .where({
        "_id": params.originator // 发起人
      })
      .update({
        data: {
          i_know: db.command.pull(params.party)
        }
      })
    // 2.2 更新发起人的 ta 认识的人
    return await db.collection("_ACCOUNT")
      .where({
        "_id": params.originator // 发起人
      })
      .update({
        data: {
          i_know: db.command.push(params.party)
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
    // 根据名字查人
    case 'queryByKey': {
      return queryByKey(event)
    }
    // 核实手机号
    case 'queryByPhone': {
      return queryByPhone(event)
    }
    // 个人中心
    case 'queryForMy': {
      return queryForMy(event)
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
    // 更新 关系
    case 'updateKnow': {
      return updateKnow(event)
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
