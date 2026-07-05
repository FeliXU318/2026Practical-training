const api = require('../../utils/api');

const PRODUCT_TYPE_MAP = {
  convenience: 'supermarket',
  fruit: 'fruit'
};

Page({
  data: {
    loading: true,
    keyword: '',
    activeStatus: 'all',
    tabs: [
      { label: '仓库', value: 'all' },
      { label: '已上架', value: 'on' },
      { label: '未上架', value: 'off' }
    ],
    products: []
  },

  onShow() {
    if (this.ensureLogin()) this.loadProducts();
  },

  onPullDownRefresh() {
    this.loadProducts().finally(() => wx.stopPullDownRefresh());
  },

  ensureLogin() {
    const session = wx.getStorageSync('merchantSession');
    if (!session || !session.token) {
      wx.reLaunch({ url: '/pages/login/index' });
      return false;
    }
    return true;
  },

  getSession() {
    return wx.getStorageSync('merchantSession') || {};
  },

  getBusinessType() {
    const session = this.getSession();
    return session.profile ? session.profile.businessType : 'meiyuan-1';
  },

  getMerchantCategory() {
    const session = this.getSession();
    return session.profile && session.profile.merchantCategory === 'fruit' ? 'fruit' : 'convenience';
  },

  getProductType() {
    return PRODUCT_TYPE_MAP[this.getMerchantCategory()] || PRODUCT_TYPE_MAP.convenience;
  },

  loadProducts() {
    this.setData({ loading: true });
    return api.listProducts({
      merchantId: api.getMerchantId(),
      businessType: this.getBusinessType(),
      merchantCategory: this.getMerchantCategory(),
      product_type: this.getProductType(),
      keyword: this.data.keyword,
      status: this.data.activeStatus
    })
      .then((products) => {
        this.setData({ products, loading: false });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  changeTab(event) {
    this.setData({ activeStatus: event.currentTarget.dataset.status }, () => this.loadProducts());
  },

  handleSearch(event) {
    this.setData({ keyword: event.detail.value });
  },

  clearSearch() {
    this.setData({ keyword: '' }, () => this.loadProducts());
  },

  addProduct() {
    wx.navigateTo({ url: '/pages/products/edit' });
  },

  editProduct(event) {
    wx.navigateTo({ url: `/pages/products/edit?id=${event.currentTarget.dataset.id}` });
  },

  adjustStock(event) {
    const id = event.currentTarget.dataset.id;
    const delta = Number(event.currentTarget.dataset.delta);
    api.adjustStock({ id, delta })
      .then(() => {
        wx.showToast({ title: delta > 0 ? '已补货' : '已扣减', icon: 'success' });
        this.loadProducts();
      })
      .catch(api.toastError);
  },

  toggleProduct(event) {
    const id = event.currentTarget.dataset.id;
    const product = this.data.products.find((item) => item.id === id);
    wx.showModal({
      title: product && product.onSale ? '下架商品' : '上架商品',
      content: product && product.onSale ? '下架后用户端将不可购买该商品。' : '上架后商品会同步到用户端展示。',
      success: (res) => {
        if (!res.confirm) return;
        api.toggleProduct({ id })
          .then(() => {
            wx.showToast({ title: '状态已更新', icon: 'success' });
            this.loadProducts();
          })
          .catch(api.toastError);
      }
    });
  }
});