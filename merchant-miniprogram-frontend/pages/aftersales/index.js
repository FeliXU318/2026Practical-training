const api = require('../../utils/api');

const RESULTS = [
  '已退款并记录原因',
  '已安排补发',
  '已沟通说明并记录结果'
];

Page({
  data: {
    loading: true,
    items: []
  },

  onShow() {
    this.loadList();
  },

  onPullDownRefresh() {
    this.loadList().finally(() => wx.stopPullDownRefresh());
  },

  getBusinessType() {
    const session = wx.getStorageSync('merchantSession') || {};
    return session.profile ? session.profile.businessType : 'meiyuan-1';
  },

  loadList() {
    this.setData({ loading: true });
    return api.listAfterSales({ merchantId: api.getMerchantId(), businessType: this.getBusinessType() })
      .then((items) => {
        this.setData({ items, loading: false });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  processItem(event) {
    const id = event.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: RESULTS,
      success: (res) => {
        const result = RESULTS[res.tapIndex];
        api.updateAfterSale({ id, result })
          .then(() => {
            wx.showToast({ title: '已处理售后', icon: 'success' });
            this.loadList();
          })
          .catch(api.toastError);
      }
    });
  }
});
