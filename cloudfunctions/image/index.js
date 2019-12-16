// 云函数模板
// 部署：在 cloud-functions/** 文件夹右击选择 “上传并部署”
const cloud = require('wx-server-sdk')

cloud.init()                              // 初始化 cloud
const db = cloud.database()               // 初始化 database
const { OPENID } = cloud.getWXContext()   // 获取 openid

/**
 * 查询企业下的
 * 排行榜
 */
const queryForRanking = async (params) => {
  let limit = params.limit ? params.limit : 15
  const $ = db.command.aggregate
  try {
    return await db.collection("_IMAGE").aggregate()
      .match({
        "_enterprise_id": params.enterprise_id
      })
      .addFields({
        "likes": $.size('$like_list')
      })
      .sort({
        likes: -1
      })
      .limit(limit)
      .project({ // 过滤
        _id: true,
        image: true,
        likes: true,
        party_name: true,
        originator_name: true, // 发起人
      })
      .end()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 查询随机
 */
const queryByRandom = async (params) => {
  let limit = params.limit || 10
  try {
    return await db.collection("_IMAGE").aggregate()
      .match({
        "_enterprise_id": params.enterprise_id
      })
      .sample({ // 随机
        size: limit
      }) 
      .lookup({ // 链表
        from: '_ACCOUNT', // 关联表
        localField: 'party', // 本表 要匹配字段
        foreignField: '_id', // 关联表 要匹配字段
        as: 'party_info',
      })
      .project({ // 过滤
        _id: true,
        image: true,
        party_name: true,
        originator_name: true,
        like_list: true,
        party_info: true,
      })
      .end()
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
          originator_name: true, // 发起人
          like_list: true, // 点赞人
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
        like_list: true, // 点赞人
        party_name: true, // 点赞人
      })
      .get()
  } catch(e) {
    console.error(e)
  }
}

/**
 * 写入 形象信息
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
          originator_name: info.originator_name, // 发起人 id
          party: info.party, // 当事人 id
          party_name: info.party_name, // 当事人 id
          like_list: [], // 点赞人列表
          create_time: db.serverDate(), // 创建时间(服务端时间)
        }
      })
  } catch(e) {
    console.error(e)
  }
}

/**
 * 删除形象
 */
const remove = async (params) => {
  try {
    const fileIDs = [params.image]
    const result = await cloud.deleteFile({
      fileList: fileIDs,
    })
    console.log('result', result)

    return await db.collection("_IMAGE")
      .where({
        "_id": params._id
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
        like_list: true, // 点赞人列表
      })
      .get()
    if(errMsg === "collection.get:ok") {
      let list = data[0].like_list || []

      let isLiked = list.indexOf(originator) !== -1
      console.log('isLiked', isLiked)
      let object;
      if(isLiked) {
        object = {
          _id: params._id,
          like_list: list.filter(item => {
            return item !== originator
          })
        }
      } else {
        list.push(originator)
        object = {
          _id: params._id,
          like_list: list
        }
      }
      return update(object)
    } else {
      return {errMsg, data}
    }
  } catch(err){
    console.error(err)
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
          like_list: info.like_list, // 点赞人列表
        }
      })
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
    // 查询排行榜
    case 'queryForRanking': {
      return queryForRanking(event)
    }
    // 随机获取形象
    case 'queryByRandom': {
      return queryByRandom(event)
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
      return remove(event)
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
