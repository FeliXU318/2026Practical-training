const mock = require('./mock');
const walletMock = require('./wallet-mock');
const backendApi = require('./backend-api');
const orderAmount = require('./order-amount');

const MOCK_ACTIONS = {
  login: mock.login,
  wechatLogin: mock.wechatLogin,
  bindPhone: mock.bindPhone,
  updateMerchantStatus: mock.updateMerchantStatus,
  listProducts: mock.listProducts,
  getProduct: mock.getProduct,
  saveProduct: mock.saveProduct,
  adjustStock: mock.adjustStock,
  toggleProduct: mock.toggleProduct,
  listOrders: mock.listOrders,
  getOrder: mock.getOrder,
  getOrderReceiver: mock.getOrderReceiver,
  updateOrderStatus: mock.updateOrderStatus,
  verifyPickup: mock.verifyPickup,
  listDeliveryTasks: mock.listDeliveryTasks,
  assignDelivery: mock.assignDelivery,
  completeDelivery: mock.completeDelivery,
  listAfterSales: mock.listAfterSales,
  updateAfterSale: mock.updateAfterSale,
  getAnalytics: mock.getAnalytics,
  getWallet: walletMock.getWallet,
  withdrawWallet: walletMock.withdrawWallet
};

const ORDER_AMOUNT_ACTIONS = {
  listOrders: true,
  getOrder: true,
  verifyPickup: true
};

const PRODUCT_TYPE_MAP = {
  convenience: 'supermarket',
  fruit: 'fruit'
};

const FRUIT_CATEGORIES = ['\u6c34\u679c\u5355\u54c1', '\u679c\u5207\u5957\u9910', '\u7ec4\u5408\u5957\u9910'];

function getRequestedProductType(data) {
  const payload = data || {};
  return payload.product_type || payload.productType || PRODUCT_TYPE_MAP[payload.merchantCategory] || '';
}

function inferProductType(product) {
  const item = product || {};
  const explicitType = item.product_type || item.productType;
  if (explicitType) return explicitType;
  if (item.merchantCategory && PRODUCT_TYPE_MAP[item.merchantCategory]) {
    return PRODUCT_TYPE_MAP[item.merchantCategory];
  }
  if (item.isDaily || FRUIT_CATEGORIES.includes(item.category)) return PRODUCT_TYPE_MAP.fruit;
  return PRODUCT_TYPE_MAP.convenience;
}

function normalizeProductQuery(data) {
  const payload = { ...(data || {}) };
  const productType = getRequestedProductType(payload);
  if (productType) {
    payload.product_type = productType;
    payload.productType = productType;
  }
  return payload;
}

function filterProductsByType(products, data) {
  if (!Array.isArray(products)) return products;
  const productType = getRequestedProductType(data);
  if (!productType) return products;
  return products.filter((product) => inferProductType(product) === productType);
}

function normalizeResponse(action, data) {
  return ORDER_AMOUNT_ACTIONS[action] ? orderAmount.normalizeOrderAmountResponse(data) : data;
}

function isSuccessCode(code) {
  return code === 0 || code === 200 || code === '0' || code === '200';
}

function unwrap(response) {
  if (isSuccessCode(response.code)) return response.data;
  throw new Error(response.message || response.msg || '请求失败');
}

function request(path, options) {
  const app = getApp();
  const config = options || {};
  const data = config.data || {};
  const mockAction = MOCK_ACTIONS[config.mockAction];

  if (app.globalData.mockMode && mockAction) {
    return mockAction(data)
      .then(unwrap)
      .then((responseData) => normalizeResponse(config.mockAction, responseData));
  }

  return backendApi.call(config.mockAction, data)
    .then((responseData) => normalizeResponse(config.mockAction, responseData))
    .catch((error) => {
      const shouldFallback = app.globalData.mockFallback && mockAction && backendApi.isNetworkError(error);
      if (shouldFallback) {
        console.warn('[api] backend unavailable, using local mock:', error.message);
        return mockAction(data)
          .then(unwrap)
          .then((responseData) => normalizeResponse(config.mockAction, responseData));
      }
      throw error;
    });
}

function toastError(error) {
  wx.showToast({
    title: error.message || '操作失败',
    icon: 'none'
  });
}

function getSession() {
  return wx.getStorageSync('merchantSession') || {};
}

function getMerchantId() {
  const session = getSession();
  return session.profile ? session.profile.merchantId : '';
}

function getOpenid() {
  const session = getSession();
  const profile = session.profile || {};
  return session.openid || profile.openid || '';
}

function getWechatpaySandboxConfig() {
  const app = getApp();
  return {
    wechatpaySandbox: Boolean(app.globalData.wechatpaySandbox),
    wechatpayNegativeTest: app.globalData.wechatpayNegativeTest || ''
  };
}

module.exports = {
  toastError,
  getMerchantId,
  getOpenid,
  getWechatpaySandboxConfig,
  statusLabels: mock.STATUS_LABELS,
  businessLabels: mock.BUSINESS_LABELS,
  merchantUnits: mock.MERCHANT_UNITS,
  merchantGardenUnits: mock.MERCHANT_GARDEN_UNITS,
  login(data) {
    return request('/merchant/login', { method: 'POST', data, mockAction: 'login' });
  },
  wechatLogin(data) {
    return request('/merchant/wechat/login', { method: 'POST', data, mockAction: 'wechatLogin' });
  },
  bindPhone(data) {
    return request('/merchant/wechat/bind-phone', { method: 'POST', data, mockAction: 'bindPhone' });
  },
  updateMerchantStatus(data) {
    return request('/merchant/status', { method: 'PATCH', data, mockAction: 'updateMerchantStatus' });
  },
  uploadProductPhoto(filePath) {
    if (!filePath) return Promise.reject(new Error('请选择商品照片'));
    const app = getApp();
    if (app.globalData.mockMode) return Promise.resolve(filePath);
    return backendApi.uploadProductPhoto(filePath);
  },
  listProducts(data) {
    const query = normalizeProductQuery(data);
    return request('/merchant/products', { data: query, mockAction: 'listProducts' })
      .then((products) => filterProductsByType(products, query));
  },
  getProduct(data) {
    return request(`/merchant/products/${data.id}`, { data, mockAction: 'getProduct' });
  },
  saveProduct(data) {
    return request('/merchant/products', { method: data.id ? 'PUT' : 'POST', data, mockAction: 'saveProduct' });
  },
  adjustStock(data) {
    return request('/merchant/products/stock', { method: 'PATCH', data, mockAction: 'adjustStock' });
  },
  toggleProduct(data) {
    return request('/merchant/products/status', { method: 'PATCH', data, mockAction: 'toggleProduct' });
  },
  listOrders(data) {
    return request('/merchant/orders', { data, mockAction: 'listOrders' });
  },
  getOrder(data) {
    return request(`/merchant/orders/${data.id}`, { data, mockAction: 'getOrder' });
  },
  getOrderReceiver(data) {
    return request(`/merchant/orders/${data.id || data.orderId}/receiver`, { data, mockAction: 'getOrderReceiver' });
  },
  updateOrderStatus(data) {
    return request('/merchant/orders/status', { method: 'PATCH', data, mockAction: 'updateOrderStatus' });
  },
  verifyPickup(data) {
    return request('/merchant/orders/verify', { method: 'POST', data, mockAction: 'verifyPickup' });
  },
  listDeliveryTasks(data) {
    return request('/merchant/delivery/tasks', { data, mockAction: 'listDeliveryTasks' });
  },
  assignDelivery(data) {
    return request('/merchant/delivery/assign', { method: 'POST', data, mockAction: 'assignDelivery' });
  },
  completeDelivery(data) {
    return request('/merchant/delivery/complete', { method: 'POST', data, mockAction: 'completeDelivery' });
  },
  listAfterSales(data) {
    return request('/merchant/aftersales', { data, mockAction: 'listAfterSales' });
  },
  updateAfterSale(data) {
    return request('/merchant/aftersales/result', { method: 'POST', data, mockAction: 'updateAfterSale' });
  },
  getAnalytics(data) {
    return request('/merchant/analytics', { data, mockAction: 'getAnalytics' });
  },
  getWallet(data) {
    return request('/merchant/wallet', { data, mockAction: 'getWallet' });
  },
  withdrawWallet(data) {
    return request('/merchant/wallet/withdraw', { method: 'POST', data, mockAction: 'withdrawWallet' });
  }
};
