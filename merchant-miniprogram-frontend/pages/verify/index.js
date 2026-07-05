const api = require('../../utils/api');
const orderAmount = require('../../utils/order-amount');

Page({
  data: {
    code: '',
    loading: false,
    result: null
  },

  onLoad(options) {
    if (options.code) this.setData({ code: options.code });
  },

  handleInput(event) {
    this.setData({ code: event.detail.value });
  },

  scanCode() {
    wx.scanCode({
      onlyFromCamera: false,
      success: (res) => {
        this.setData({ code: res.result });
        this.verifyCode();
      },
      fail() {
        wx.showToast({ title: '可手动输入取货码', icon: 'none' });
      }
    });
  },

  verifyCode() {
    if (!this.data.code.trim()) {
      wx.showToast({ title: '请输入取货码', icon: 'none' });
      return;
    }
    this.setData({ loading: true, result: null });
    api.verifyPickup({ code: this.data.code.trim(), merchantId: api.getMerchantId() })
      .then((order) => {
        this.setData({ loading: false, result: orderAmount.withOrderAmount(order) });
        wx.showToast({ title: '核销完成', icon: 'success' });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  }
});