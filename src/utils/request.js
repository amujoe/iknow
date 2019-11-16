
/**
 * 判断session 是否过期
 * 只服务于 request()
 * _request {function} 需要回调的方法
 * */ 
function checkSession (_request) {
  const {globalData} = getApp();
  let resolve = null
  let reject = null
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  wx.checkSession({
    success: function () {
      // 没有过期
      let code = wx.getStorageSync('tokenWx')
      let codeTimes = wx.getStorageSync('codeTimes')
      let nowTimes = new Date().getTime() - codeTimes
      if (code && nowTimes<=280000) {
        // 4分钟内, 不重新拿 code
        globalData.code = code
        _request && _request()
        resolve()
      } else {
        // 超过4分钟, 重新拿 code
        getCode().then(() => {
          // 成功拿到 code
          _request && _request()
          resolve()
        }, () => {
          // 失败
          reject()
        })
      }
    },
    fail: function () {
      // 已过期 重新拿 code
      getCode().then(() => {
        // 成功拿到 code
        _request && _request()
        resolve()
      }, () => {
        // 失败
        reject()
      })
    }
  })
  return promise
}

/**
 * 微信登陆获取 code
 * 只服务于 checkSession()
 * */ 
function getCode () {
  const {globalData, showMessage} = getApp()
  let resolve = null
  let reject = null
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  wx.login({
    success: (res) => {
      globalData.code = res.code
      // code 写缓存 保存1小时
      wx.setStorageSync('tokenWx', res.code)
      wx.setStorageSync('codeTimes', new Date().getTime())
      resolve(res)
    },
    fail: (err) => {
      console.log('wxlogin 登录失败')
      showMessage({
        title: 'Sorry！我还不知道你是谁',
        content: '快重启小程序，注册下告诉我你是谁',
      })
      reject(err)
    },
  })
  return promise
}

async function isRegistered ( _request ) {
  const {globalData} = getApp();
  let resolve = null
  let reject = null
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  if (globalData.identity !== 3) {
    resolve(true)
  }

  try {
    await getCode()
    const {statusCode, data, code, message} = await request('mini/is_register', {
      method: 'POST',
      data: {
        'code': globalData.code,
        'invite_customer_id': globalData.inviter_id
      }
    })
    if (statusCode === 200 && parseInt(code) === 0) {
      let status = data.status
      let role = data.role
      // status 用户是否注册（0=否，1=是)
      // role 用户角色(1=经销商，2=门店)
      if(status === 1 && role === 1) {
        // 经销商
        globalData.identity = 1
        console.log('经销商登录成功')
      } else if(status === 1 && role === 2) {
        // 门店
        globalData.identity = 2
        globalData.store_hash = data.store_hash
        console.log('门店登录成功')
      } else {
        // 无身份
        globalData.identity = 0
      }
     
      globalData.token = data.token
      globalData.userInfo = data.customer
      _request && _request()
      resolve(true)
    } else {
      console.error('身份获取失败', message)
      wx.showModal({
        title: "获取身份信息失败",
        content: message,
        showCancel: false,
        success(res) {
          console.log('res', res)
        },
      }); 
      reject(false)
    }
  } catch (err) {
    console.error('app-isRegistered:', err)
    reject(false)
  }
  return promise
}

/**
 * 网络状况
 * 只服务于 request()
 * */ 
function detectNetwork () {
  let resolve = null
  let reject = null
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  wx.getNetworkType({
    success (res) {
      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
      if (res.networkType === 'none') {
        reject()
      } else {
        resolve()
      }
    },
  })
  return promise
}


/**
 * 网络请求
 * path {string} 地址
 * options {object} 参数对象
 * contentType {string} 表头, 内容类型
 * */ 
function request (path, options, contentType = 'application/json') {
  const {globalData, showMessage} = getApp();
  let resolve
  let reject
  const requesting = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  // 初始化 options
  options = {
    method: 'GET',
    header: {
      'content-type': contentType,
      'Accept': 'application/json',
    },
    data: undefined,
    needToken: true,
    ...options,
  }
  // 接口传参加入当前门店的id
  let current_store_id = wx.getStorageSync('current_store_id')
  if (options.data && current_store_id && !options.data.no_store) {
    options.data.store_id = current_store_id
  } else if (options.data && current_store_id && options.data.no_store) {
    delete(options.data['no_store']);
  } else if (current_store_id) {
    options.data = {
      store_id: current_store_id
    }
  }

  // 过滤 不存在健值的字段
  if (options.data) {
    options.data = Object.keys(options.data).reduce((result, key) => {
      if (options.data[key] !== undefined && options.data[key] !== null && (!Array.isArray(options.data[key]) || options.data[key].length) ) {
        result[key] = options.data[key]
      }
      return result
    }, {})
  }
  
  // 微信请求
  const $request = () => wx.request({
    url: globalData.host + globalData.apiRoot + path,
    data: options.data,
    method: options.method,
    header: {'Authorization': (globalData.token?`Bearer ${globalData.token}`:''), 'Store-Hash': globalData.store_hash, ...options.header},
    success: ({data, statusCode, header}) => {
      // 400002 = token失效
      if (parseInt(data.code) === 400002) {
        // token 无效, 缺少token
        globalData.token = ''
        isRegistered($request)
      } else if(parseInt(data.code) === 400020) {
        // 用户账号异常：代表用户已注册，但是目前身份已被清除或者所在门店或者经销商被删除或者禁用
        wx.reLaunch({
          url: '/pages/join/join-null/join-null?type=1',
        })
      } else if(parseInt(data.code) === 400005 || parseInt(data.code) === 400006) {
        // 经销商用户、经销商被禁用
        wx.reLaunch({
          url: '/pages/join/join-null/join-null?type=1',
        })
      } else if(parseInt(data.code) === 400007) {
        globalData.dealer = data.data
        // 门店被禁用
        wx.reLaunch({
          url: '/pages/join/join-null/join-null?type=2',
        })
      } else {
        resolve({
          ...data,
          statusCode,
          header,
        })
      }
    },
    fail: (err) => {
      reject(err)
    },
  })

  detectNetwork().then( _ => {
    $request()
  }).catch( _ => {
    showMessage({
      title: '你的网络好像罢工了',
      content: '我不喜欢网络罢工，快去检查下吧',
    })
  })

  return requesting
}

/**
 * 网络请求(加标示)
 * module {string} 标示
 * 
 * 实例方法
 * path {string} 地址
 * options {object} 参数对象
 * contentType {string} 表头, 内容类型
 * */ 
const createModuleRequest = module => {
  return (path, options, contentType) => {
    if (module) {
      return request(`${module}/${path}`, options, contentType)
    } else {
      return request(`${path}`, options, contentType)
    }
  }
}

export { checkSession, getCode, request, createModuleRequest, isRegistered};
