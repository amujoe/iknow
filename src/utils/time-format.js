/**
 * 深拷贝
 * @param obj 被拷贝对象
 * @returns {*}
 */
const toDate = (time, format) => {
  if (time.toString().length < 13) {
    time = parseInt(time) * 1000;
  }
  let t = new Date(time);
  let nowYear = t.getFullYear(); // 年
  let nowMonth = t.getMonth() + 1; // 月
  let nowDate = t.getDate(); // 日
  let nowHour = t.getHours(); // 时
  let nowMinutes = t.getMinutes(); // 分
  let nowSeconds = t.getSeconds(); // 秒
  let nowDayOfWeek = t.getDay(); // 今天本周的第几天

  let tf = function(i) {
    return (i < 10 ? "0" : "") + i;
  };
  // 当前时间
  let nowTime = function(format) {
    return format.replace(/yyyy|MM|dd|hh|mm|ss/g, function(a) {
      let str = "";
      switch (a) {
        case "yyyy":
          str = tf(nowYear);
          break;
        case "MM":
          str = tf(nowMonth);
          break;
        case "dd":
          str = tf(nowDate);
          break;
        case "hh":
          str = tf(nowHour);
          break;
        case "mm":
          str = tf(nowMinutes);
          break;
        case "ss":
          str = tf(nowSeconds);
          break;
      }
      return str;
    });
  };
  return {
    nowTime: nowTime(format),
    nowYear: nowYear,
    nowMonth: nowMonth,
    nowDate: nowDate,
    nowHour: nowHour,
    nowMinutes: nowMinutes,
    nowSeconds: nowSeconds,
    nowDayOfWeek: nowDayOfWeek
  };
}

export { toDate }
