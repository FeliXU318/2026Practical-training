/**
 * 真实后端接口集中配置。
 *
 * 接入后端时只需：
 * 1. 在 app.js 中将 mockMode 改为 false；
 * 2. 将 apiBaseUrl 改为后端服务地址；
 * 3. 如后端路径或请求方式不同，在 ENDPOINTS 中统一调整。
 */

const orderAmount = require('./order-amount');

const ENDPOINTS = {
  login: { method: 'POST', path: '/merchant/login' },
  wechatLogin: { method: 'POST', path: '/merchant/wechat/login' },
  bindPhone: { method: 'POST', path: '/merchant/wechat/bind-phone' },
  updateMerchantStatus: { method: 'PATCH', path: '/merchant/status' },
  listProducts: { method: 'GET', path: '/merchant/products' },
  getProduct: { method: 'GET', path: (data) => `/merchant/products/${encodeURIComponent(data.id)}` },
  saveProduct: { method: (data) => (data.id ? 'PUT' : 'POST'), path: '/merchant/products' },
  adjustStock: { method: 'PATCH', path: '/merchant/products/stock' },
  toggleProduct: { method: 'PATCH', path: '/merchant/products/status' },
  listOrders: { method: 'GET', path: '/merchant/orders' },
  getOrder: { method: 'GET', path: (data) => `/merchant/orders/${encodeURIComponent(data.id)}` },
  getOrderReceiver: { method: 'GET', path: (data) => `/merchant/orders/${encodeURIComponent(data.id || data.orderId)}/receiver` },
  updateOrderStatus: { method: 'PATCH', path: '/merchant/orders/status' },
  verifyPickup: { method: 'POST', path: '/merchant/orders/verify' },
  listDeliveryTasks: { method: 'GET', path: '/merchant/delivery/tasks' },
  assignDelivery: { method: 'POST', path: '/merchant/delivery/assign' },
  completeDelivery: { method: 'POST', path: '/merchant/delivery/complete' },
  listAfterSales: { method: 'GET', path: '/merchant/aftersales' },
  updateAfterSale: { method: 'POST', path: '/merchant/aftersales/result' },
  getAnalytics: { method: 'GET', path: '/merchant/analytics' },
  getWallet: { method: 'GET', path: '/merchant/wallet' },
  withdrawWallet: { method: 'POST', path: '/merchant/wallet/withdraw' },
  uploadProductPhoto: { method: 'POST', path: '/merchant/products/photo' }
};

function getSession() {
  const app = getApp();
  return app.globalData.session || wx.getStorageSync('merchantSession') || {};
}

function getRouteValue(value, data) {
  return typeof value === 'function' ? value(data) : value;
}

function getResponseData(body) {
  if (body && body.data !== undefined) return body.data;
  if (body && body.result !== undefined) return body.result;
  return body;
}

function normalizeResponse(action, data) {
  if (action === 'listOrders' || action === 'getOrder' || action === 'verifyPickup') {
    return orderAmount.normalizeOrderAmountResponse(data);
  }
  return data;
}

function getErrorMessage(body, fallback) {
  return (body && (body.message || body.msg || body.error)) || fallback;
}

function createNetworkError(error, fallback) {
  const err = new Error((error && error.errMsg) || fallback);
  err.isNetworkError = true;
  return err;
}

function isNetworkError(error) {
  return Boolean(error && error.isNetworkError);
}

function isSuccessCode(code) {
  return code === 0 || code === 200 || code === '0' || code === '200';
}

function isBusinessSuccess(body) {
  if (!body || typeof body !== 'object') return true;
  if (body.code !== undefined) return isSuccessCode(body.code);
  if (body.statusCode !== undefined) return isSuccessCode(body.statusCode);
  if (body.success !== undefined) return body.success === true;
  return true;
}

function buildHeader(session, config) {
  const data = config.data || {};
  const header = {
    'content-type': 'application/json',
    Authorization: session.token ? 'Bearer ' + session.token : ''
  };
  const negativeTest = config.negativeTest || data.wechatpayNegativeTest;
  if (negativeTest) header['Wechatpay-Negative-Test'] = negativeTest;
  return header;
}

function request(path, options) {
  const app = getApp();
  const config = options || {};
  const session = getSession();

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}${path}`,
      method: config.method || 'GET',
      data: config.data || {},
      timeout: 15000,
      header: buildHeader(session, config),
      success(res) {
        const body = res.data || {};
        const httpOk = res.statusCode >= 200 && res.statusCode < 300;
        const businessOk = isBusinessSuccess(body);
        if (httpOk && businessOk) {
          resolve(getResponseData(body));
          return;
        }
        reject(new Error(getErrorMessage(body, `请求失败（${res.statusCode}）`)));
      },
      fail(error) {
        reject(createNetworkError(error, '网络连接失败'));
      }
    });
  });
}

function call(action, data) {
  const route = ENDPOINTS[action];
  if (!route) return Promise.reject(new Error(`未配置后端接口：${action}`));
  const payload = data || {};
  return request(getRouteValue(route.path, payload), {
    method: getRouteValue(route.method, payload),
    data: payload
  }).then((responseData) => normalizeResponse(action, responseData));
}

function parseUploadBody(raw) {
  if (!raw) return {};
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return { data: raw };
  }
}

function uploadProductPhoto(filePath) {
  const app = getApp();
  const session = getSession();
  const route = ENDPOINTS.uploadProductPhoto;

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${app.globalData.apiBaseUrl}${route.path}`,
      filePath,
      name: 'file',
      formData: { type: 'product' },
      timeout: 30000,
      header: {
        Authorization: session.token ? `Bearer ${session.token}` : ''
      },
      success(res) {
        const body = parseUploadBody(res.data);
        const data = getResponseData(body);
        const imageUrl = typeof data === 'string' ? data : data && (data.imageUrl || data.url);
        const httpOk = res.statusCode >= 200 && res.statusCode < 300;
        const businessOk = isBusinessSuccess(body);
        if (httpOk && businessOk && imageUrl) {
          resolve(imageUrl);
          return;
        }
        reject(new Error(getErrorMessage(body, '商品照片上传失败')));
      },
      fail(error) {
        reject(createNetworkError(error, '商品照片上传失败'));
      }
    });
  });
}

module.exports = {
  ENDPOINTS,
  call,
  request,
  uploadProductPhoto,
  isNetworkError
};
