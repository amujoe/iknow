// 封装 modal 提示
const showModal = ({
  title = '',
  content = '',
  isRejectable = false,
  cancelText = '取消',
  confirmText = '确定',
  confirmColor = '#dd1d21',
  resolve,
  reject,
  complete,
  fail}) => {
  wx.showModal({
    title: title,
    content: content,
    showCancel: isRejectable, // 是否显示取消按钮
    cancelText: cancelText,
    confirmText: confirmText,
    confirmColor: confirmColor,
    success(res) {
      if (res.confirm) {
        resolve && resolve();
      } else if (res.cancel) {
        reject && reject();
      }
    },
    fail() {
      fail && fail();
    },
    complete() {
      complete && complete();
    }
  });
}

// 封装 toast 提示
const showToast = ({
  title = '',
  icon = "none",
  duration = 1500,
  mask = false
  }) => {

  wx.showToast({
    title,
    icon: icon,
    duration: duration,
    mask: mask
  });
}


// 封装 showLoading 提示
const showLoading = ({
  title = '',
  mask = false
  }) => {

  wx.showLoading({
    title,
    mask: mask
  });
}

// 封装 hideLoading 提示
const hideLoading = () => {

  wx.hideLoading()
}
  
export {showModal, showToast, showLoading, hideLoading}