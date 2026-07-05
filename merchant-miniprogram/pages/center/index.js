const api = require('../../utils/api');
const orderAmount = require('../../utils/order-amount');

function formatMoney(value) {
  const amount = Number(value || 0);
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(1);
}

const ORDER_STATUSES = [
  { status: 'pending', label: '待接单', icon: '/assets/icons/status-pending.svg', count: 0 },
  { status: 'preparing', label: '备货中', icon: '/assets/icons/status-preparing.svg', count: 0 },
  { status: 'ready', label: '待自提', icon: '/assets/icons/status-pickup.svg', count: 0 },
  { status: 'delivery', label: '配送中', icon: '/assets/icons/delivery.svg', count: 0 }
];

Page({
  data: {
    profile: {},
    phone: '',
    isOpen: true,
    businessStatusUpdating: false,
    overviewLoading: true,
    overview: {
      revenueText: '0',
      orderCount: 0
    },
    orderStatuses: ORDER_STATUSES,
    features: [
      { key: 'wallet', icon: '/assets/icons/wallet.svg', title: '商家钱包', desc: '余额明细与提现', path: '/pages/wallet/index' },
      { key: 'verify', icon: '/assets/icons/verify.svg', title: '自提核销', desc: '取货码核验', path: '/pages/verify/index' },
      { key: 'aftersales', icon: '/assets/icons/aftersales.svg', title: '售后处理', desc: '退款与补发记录', path: '/pages/aftersales/index' }
    ]
  },

  onShow() {
    const session = wx.getStorageSync('merchantSession');
    if (!session || !session.token) {
      wx.reLaunch({ url: '/pages/login/index' });
      return;
    }

    const profile = session.profile || {};
    const businessType = profile.businessType || 'meiyuan-1';
    this.setData({
      profile,
      phone: session.phone || profile.phone || '',
      isOpen: this.getBusinessStatus(businessType, profile)
    });
    this.loadOverview(businessType);
  },

  getBusinessStatusKey(businessType) {
    return `businessStatus:${businessType || 'meiyuan-1'}`;
  },

  getBusinessStatus(businessType, profile) {
    const merchantProfile = profile || {};
    const rawStatus = merchantProfile.stasus || merchantProfile.status || '';
    if (rawStatus === '已打烊' || rawStatus === 'closed') return false;
    if (rawStatus === '营业中' || rawStatus === 'open') return true;
    const stored = wx.getStorageSync(this.getBusinessStatusKey(businessType));
    return stored === '' || stored === undefined ? true : Boolean(stored);
  },

  getMerchantCategory() {
    return this.data.profile && this.data.profile.merchantCategory === 'fruit' ? 'fruit' : 'convenience';
  },

  syncBusinessStatus(stasus, isOpen) {
    const session = wx.getStorageSync('merchantSession') || {};
    const profile = {
      ...(session.profile || {}),
      stasus,
      status: isOpen ? 'open' : 'closed'
    };
    const nextSession = {
      ...session,
      profile
    };
    const app = getApp();
    app.globalData.session = nextSession;
    wx.setStorageSync('merchantSession', nextSession);
    wx.setStorageSync(this.getBusinessStatusKey(profile.businessType), isOpen);
    this.setData({ profile, isOpen });
  },

  toggleBusinessStatus() {
    if (this.data.businessStatusUpdating) return;
    const nextOpen = !this.data.isOpen;
    const profile = this.data.profile || {};
    const businessType = profile.businessType || 'meiyuan-1';
    const merchantCategory = this.getMerchantCategory();
    const stasus = nextOpen ? '营业中' : '已打烊';

    this.setData({ businessStatusUpdating: true });
    api.updateMerchantStatus({
      businessType,
      merchantCategory,
      stasus
    })
      .then(() => {
        this.syncBusinessStatus(stasus, nextOpen);
        wx.showToast({
          title: nextOpen ? '已恢复营业' : '已打烊',
          icon: 'none'
        });
      })
      .catch(api.toastError)
      .finally(() => {
        this.setData({ businessStatusUpdating: false });
      });
  },

  loadOverview(businessType) {
    this.setData({ overviewLoading: true });
    api.listOrders({ merchantId: api.getMerchantId(), businessType, status: 'all' })
      .then((orders) => {
        const orderCount = orders.length;
        const revenue = orders
          .filter((order) => order.status !== 'cancelled')
          .reduce((total, order) => total + Number(orderAmount.getOrderAmount(order) || 0), 0);
        const orderStatuses = ORDER_STATUSES.map((item) => ({
          ...item,
          count: orders.filter((order) => order.status === item.status).length
        }));

        this.setData({
          overviewLoading: false,
          overview: {
            revenueText: formatMoney(revenue),
            orderCount
          },
          orderStatuses
        });
      })
      .catch((error) => {
        this.setData({ overviewLoading: false });
        api.toastError(error);
      });
  },

  openOrders(event) {
    const status = event.currentTarget.dataset.status || 'all';
    wx.setStorageSync('orderStatusFilter', status);
    wx.switchTab({ url: '/pages/orders/index' });
  },

  openFeature(event) {
    const path = event.currentTarget.dataset.path;
    if (path) wx.navigateTo({ url: path });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '退出后需要重新登录。',
      success(res) {
        if (!res.confirm) return;
        const app = getApp();
        app.globalData.session = null;
        wx.removeStorageSync('merchantSession');
        wx.reLaunch({ url: '/pages/login/index' });
      }
    });
  }
});