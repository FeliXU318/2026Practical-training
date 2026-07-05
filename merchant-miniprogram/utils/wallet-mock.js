const wallets = {};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function wait(data) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ code: 0, data: clone(data), message: 'ok' }), 160);
  });
}

function fail(message) {
  return Promise.resolve({ code: 1, data: null, message });
}

function getSeed(value) {
  return String(value || '').split('').reduce((total, char) => total + char.charCodeAt(0), 0);
}

function createWallet(businessType) {
  const offset = getSeed(businessType) % 5;
  return {
    businessType,
    availableBalance: Number((2680.5 + offset * 128.6).toFixed(2)),
    pendingSettlement: Number((328.6 + offset * 23.4).toFixed(2)),
    totalWithdrawn: Number((12600 + offset * 500).toFixed(2)),
    records: [
      {
        id: `${businessType}-income-3`,
        type: 'income',
        title: '订单结算',
        amount: 328.6,
        status: '已入账',
        createdAt: '今天 09:20'
      },
      {
        id: `${businessType}-withdraw-2`,
        type: 'withdraw',
        title: '提现至微信零钱',
        amount: -500,
        status: '已到账',
        createdAt: '06-29 16:45'
      },
      {
        id: `${businessType}-income-1`,
        type: 'income',
        title: '订单结算',
        amount: 186.8,
        status: '已入账',
        createdAt: '06-29 09:10'
      }
    ]
  };
}

function getWalletState(businessType) {
  const key = businessType || 'meiyuan-1';
  if (!wallets[key]) wallets[key] = createWallet(key);
  return wallets[key];
}

function getWallet(data) {
  return wait(getWalletState(data.businessType));
}

function withdrawWallet(data) {
  const wallet = getWalletState(data.businessType);
  const amount = Math.round(Number(data.amount) * 100) / 100;
  const isSandbox = Boolean(data.wechatpaySandbox);
  const transferId = 'withdraw-' + Date.now();

  if (!Number.isFinite(amount) || amount < 1) {
    return fail('最低提现金额为 1 元');
  }
  if (amount > wallet.availableBalance) {
    return fail('提现金额不能超过可提现余额');
  }

  wallet.availableBalance = Number((wallet.availableBalance - amount).toFixed(2));
  wallet.totalWithdrawn = Number((wallet.totalWithdrawn + amount).toFixed(2));
  wallet.records.unshift({
    id: transferId,
    type: 'withdraw',
    title: '提现至微信零钱',
    amount: -amount,
    status: isSandbox ? '仿真处理中' : '处理中',
    createdAt: '刚刚',
    wechatpaySandbox: isSandbox,
    withdrawChannel: data.withdrawChannel || 'wechat_balance',
    openid: data.openid || '',
    amountFen: data.amountFen || Math.round(amount * 100)
  });

  return wait(wallet);
}

module.exports = {
  getWallet,
  withdrawWallet
};
