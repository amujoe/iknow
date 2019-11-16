const { showToast } = getApp();

/**
 * 深拷贝
 * @param obj 被拷贝对象
 * @returns {*}
 */
const cloneDeep = obj => {
  if (obj === null || typeof obj !== "object") return obj;
  let newObj = obj instanceof Array ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] =
        typeof obj[key] === "object" ? cloneDeep(obj[key]) : obj[key];
    }
  }
  return newObj;
};

/**
 * 获取数组中极值项
 * @param arr
 * @param type
 * @returns {number}
 */
const getArrMax = (arr, type = "max") => {
  return type === "max" ? Math.max(...arr) : Math.min(...arr);
};
/**
 * 获取数组中极值项索引
 * @param arr
 * @param type
 * @returns {*}
 */
const getArrMaxIndex = (arr, type = "max") => {
  return arr.indexOf(getArrMax(arr, type));
};

// /**
//  * 接口挂起异常捕获（单独调用）
//  * @param api api接口调用
//  * @returns {Function} 包装后的接口调用
//  */
// const extraErrorCatch = api => {
//   return params => {
//     let resolve;
//     let reject;
//     const promise = new Promise((rel, rej) => {
//       resolve = rel;
//       reject = rej;
//     });
//     api(params)
//       .then(data => {
//         resolve(data);
//       })
//       .catch(err => {
//         err.code ? reject(err) : showToast("接口或网络异常，请稍后再试");
//       });
//     return promise;
//   };
// };

/**
 * 判断对象是否为空
 * @param obj
 * @returns {boolean}
 */
const isEmpty = obj => {
  let result;
  if (typeof obj === "object" && obj !== null) {
    result = Object.keys(obj).length > 0;
  }
  return !result;
};
/**
 * 排列对象所有属性
 * @param obj
 * @returns {boolean}
 */
const sortObj = obj => {
  if (isEmpty(obj)) {
    return false;
  }

  const newKeys = Object.keys(obj).sort();
  let newObj = {};

  newKeys.forEach(item => {
    if (isEmpty(obj[item])) {
      newObj = [...newObj, sortObj(obj[item])];
    } else {
      newObj[item] = obj[item];
    }
  });
  return newObj;
};
/**
 * 判断两个对象相等
 * @param obj
 * @param other
 * @returns {boolean}
 */
const isEqual = (obj, other) => {
  return JSON.stringify(sortObj(obj)) === JSON.stringify(sortObj(other));
};

export {
  cloneDeep,
  memorize,
  getArrMax,
  getArrMaxIndex,
  extraErrorCatch,
  addIndex,
  permutations,
  allPermutations,
  optimal,
  sortObj,
  isEqual
};
