const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    periods: ['今日', '近 7 天', '本月'],
    periodIndex: 1,
    summary: [],
    trend: [],
    topProducts: [],
    inventory: []
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().finally(() => wx.stopPullDownRefresh());
  },

  getBusinessType() {
    const session = wx.getStorageSync('merchantSession') || {};
    return session.profile ? session.profile.businessType : 'meiyuan-1';
  },

  loadData() {
    this.setData({ loading: true });
    return api.getAnalytics({
      businessType: this.getBusinessType(),
      period: this.data.periods[this.data.periodIndex]
    })
      .then((data) => {
        const maxTrend = Math.max(...data.trend.map((item) => item.value), 1);
        this.setData({
          loading: false,
          summary: data.summary,
          trend: data.trend.map((item) => ({
            ...item,
            height: Math.max(18, Math.round((item.value / maxTrend) * 100))
          })),
          topProducts: data.topProducts,
          inventory: data.inventory
        });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  changePeriod(event) {
    this.setData({ periodIndex: Number(event.detail.value) }, () => this.loadData());
  }
});
