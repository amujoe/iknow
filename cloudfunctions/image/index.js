// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 查询企业下的
 */
const query = async (params) => {
  let page = params.page || 1
  let limit = params.limit || 10
  try {
    return await db.collection("_IMAGE")
      .where({
        "_enterprise_id": params.enterprise_id
      })
      .skip(limit * (page - 1)) // 跳过结果集中的前 10 条，从第 11 条开始返回, 用于分页
      .limit(limit) // 限制返回数量为 10 条
      .field({ // 过滤字段
        _id: true,
        image: true, // 图像
        originator: true // 发起人
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 查询
 * 根据当事人的id
 */
const queryByParty = async (params) => {
  let page = params.page || 1
  let limit = params.limit || 10
  try {
    return await 
      db.collection("_IMAGE")
        .where({
          "party": params.party, // 当事人
        })
        .skip(limit * (page - 1)) // 跳过结果集中的前 10 条，从第 11 条开始返回, 用于分页
        .limit(limit) // 限制返回数量为 10 条
        .field({ // 过滤字段
          _id: true,
          image: true, // 图像
          originator: true, // 发起人
          likes: true, // 点赞数
          likes_list: true, // 点赞人
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
    return await db.collection("_IMAGE")
      .where({
        "originator": params.originator,
      })
      .skip(limit * (page - 1)) // 跳过结果集中的前 10 条，从第 11 条开始返回, 用于分页
      .limit(limit) // 限制返回数量为 10 条
      .field({ // 过滤字段
        _id: true,
        image: true, // 图像
        likes: true, // 点赞数
        likes_list: true, // 点赞人
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
    return await db.collection("_IMAGE")
      .add({
        data: {
          _openid: OPENID, // 操作人 openid
          _enterprise_id: info.enterprise_id, // 公司 id
          image: info.image, // 形象
          originator: info.originator, // 发起人 id
          party: info.party, // 当事人 id
          likes: 0, // 点赞
          likes_list: [], // 点赞人列表
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
 * 写入 用户信息 (方法)
 * @param {*} info 
 */
const update = async (info) => {
  try {
    return await db.collection("_IMAGE")
      .where({
        "_id": info._id
      })
      .update({
        data: {
          likes: info.likes, // 点赞
          likes_list: info.likes_list, // 点赞人列表
          create_time: db.serverDate(), // 创建时间(服务端时间)
        }
      })
  } catch(e) {
    console.error(e)
  }
}

/**
 * 删除形象
 * @param {*} id 
 */
const remove = async (id) => {
  try {
    return await db.collection("_IMAGE")
      .where({
        "_id": id
      })
      .remove()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 点赞
 * @param {*} params 
 */
const clickLike = async(params) => {
  let originator = params.originator
  try{
    const {errMsg, data} = await db.collection("_IMAGE")
      .where({
        "_id": params._id,
      })
      .field({ // 过滤字段
        _id: true,
        likes: true, // 点赞数
        likes_list: true, // 点赞人列表
      })
      .get()
    if(errMsg === "collection.get:ok") {
      let num = parseInt(data[0].likes)
      let list = data[0].likes_list || []

      let isLiked = list.indexOf(originator) !== -1
      console.log('isLiked', isLiked)
      let object;
      if(isLiked) {
        object = {
          _id: params._id,
          likes: num - 1,
          likes_list: list.filter(item => {
            return item !== originator
          })
        }
      } else {
        list.push(originator)
        object = {
          _id: params._id,
          likes: num + 1,
          likes_list: list
        }
      }
      console.log('object', object)
      return update(object)
    } else {
      return {errMsg, data}
    }
  } catch(err){
    console.error(err)
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
    // 查当事人的形象
    case 'queryByParty': {
      return queryByParty(event)
    }
    // 查自己爆料的形象
    case 'queryByOriginator': {
      return queryByOriginator(event)
    }
    // 新增
    case 'create': {
      return create(event)
    }
    // 删除
    case 'remove': {
      return remove(event.id)
    }
    // 点赞
    case 'clickLike': {
      return clickLike(event)
    }
    default: {
      return
    }
  }
}
