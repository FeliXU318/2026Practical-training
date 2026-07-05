const api = require('../../utils/api');

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function decorateWallet(data) {
  const wallet = data || {};
  return {
    ...wallet,
    availableText: formatMoney(wallet.availableBalance),
    pendingText: formatMoney(wallet.pendingSettlement),
    withdrawnText: formatMoney(wallet.totalWithdrawn),
    records: (wallet.records || []).map((record) => ({
      ...record,
      amountText: `${Number(record.amount) >= 0 ? '+' : '-'}¥${formatMoney(Math.abs(Number(record.amount || 0)))}`,
      amountClass: Number(record.amount) >= 0 ? 'income' : 'expense'
    }))
  };
}

Page({
  data: {
    loading: true,
    submitting: false,
    amount: '',
    canWithdraw: false,
    wallet: decorateWallet({})
  },

  onShow() {
    this.loadWallet();
  },

  onPullDownRefresh() {
    this.loadWallet().finally(() => wx.stopPullDownRefresh());
  },

  getSession() {
    return wx.getStorageSync('merchantSession') || {};
  },

  getBusinessType() {
    const session = this.getSession();
    return session.profile ? session.profile.businessType : 'meiyuan-1';
  },

  getWithdrawContext() {
    const session = this.getSession();
    const profile = session.profile || {};
    return {
      merchantId: profile.merchantId || api.getMerchantId(),
      businessType: profile.businessType || this.getBusinessType(),
      openid: session.openid || profile.openid || api.getOpenid(),
      withdrawChannel: 'wechat_balance',
      ...api.getWechatpaySandboxConfig()
    };
  },

  loadWallet() {
    this.setData({ loading: true });
    const context = this.getWithdrawContext();
    return api.getWallet({ merchantId: context.merchantId, businessType: context.businessType })
      .then((wallet) => {
        this.setData({
          loading: false,
          wallet: decorateWallet(wallet)
        });
        this.updateWithdrawState(this.data.amount);
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  handleAmountInput(event) {
    const amount = event.detail.value;
    this.setData({ amount });
    this.updateWithdrawState(amount);
  },

  updateWithdrawState(value) {
    const amount = Number(value);
    const available = Number(this.data.wallet.availableBalance || 0);
    this.setData({
      canWithdraw: amount >= 1 && amount <= available && !this.data.submitting
    });
  },

  withdrawAll() {
    const available = Number(this.data.wallet.availableBalance || 0);
    if (available <= 0) return;
    const amount = formatMoney(available);
    this.setData({ amount });
    this.updateWithdrawState(amount);
  },

  submitWithdraw() {
    if (!this.data.canWithdraw || this.data.submitting) {
      wx.showToast({ title: '请输入有效的提现金额', icon: 'none' });
      return;
    }

    const amount = Number(this.data.amount);
    wx.showModal({
      title: '确认提现',
      content: `确认提现 ¥${formatMoney(amount)} 到微信零钱？`,
      confirmText: '确认提现',
      success: (res) => {
        if (!res.confirm) return;
        this.setData({ submitting: true, canWithdraw: false });
        api.withdrawWallet({
          ...this.getWithdrawContext(),
          amount,
          amountFen: Math.round(amount * 100)
        })
          .then((wallet) => {
            this.setData({
              submitting: false,
              amount: '',
              canWithdraw: false,
              wallet: decorateWallet(wallet)
            });
            wx.showToast({ title: '提现申请成功', icon: 'success' });
          })
          .catch((error) => {
            this.setData({ submitting: false });
            this.updateWithdrawState(this.data.amount);
            api.toastError(error);
          });
      }
    });
  }
});
