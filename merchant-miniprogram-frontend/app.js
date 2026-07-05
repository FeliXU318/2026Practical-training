App({
  globalData: {
    apiBaseUrl: 'http://10.120.113.18:8080/api',
    mockMode: false,
    mockFallback: false,
    wechatpaySandbox: true,
    wechatpayNegativeTest: '',
    session: null,
    version: '1.0.0'
  },

  onLaunch() {
    const session = wx.getStorageSync('merchantSession');
    if (session && session.token) {
      this.globalData.session = session;
    }
  }
});
