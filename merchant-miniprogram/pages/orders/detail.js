const api = require('../../utils/api');
const orderActions = require('../../utils/order-actions');
const orderAmount = require('../../utils/order-amount');

const PRODUCT_TYPE_MAP = {
  convenience: 'supermarket',
  fruit: 'fruit'
};

function firstValue(values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') || '';
}

function formatMoney(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function getItemName(item) {
  const product = item.product || item.goods || item.sku || {};
  return firstValue([
    item.productName,
    item.product_name,
    item.goodsName,
    item.goods_name,
    item.skuName,
    item.sku_name,
    item.title,
    item.name,
    product.productName,
    product.product_name,
    product.goodsName,
    product.goods_name,
    product.skuName,
    product.sku_name,
    product.title,
    product.name
  ]) || '商品';
}

function normalizeSpecValue(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeSpecValue).filter(Boolean).join('/');
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .map((key) => normalizeSpecValue(value[key]))
      .filter(Boolean)
      .join('/');
  }
  return String(value || '').trim();
}

function getItemSpec(item) {
  const product = item.product || item.goods || item.sku || {};
  const spec = firstValue([
    item.spec,
    item.specText,
    item.specification,
    item.skuSpec,
    item.sku_spec,
    item.attributes,
    item.attrs,
    item.options,
    product.spec,
    product.specText,
    product.specification,
    product.skuSpec,
    product.sku_spec,
    product.attributes,
    product.attrs,
    product.options
  ]);
  return normalizeSpecValue(spec) || '默认';
}

function isOrderTitleName(name) {
  return /订单\s*\(\s*\d+\s*件商品\s*\)/.test(name || '') || (/订单/.test(name || '') && /件商品/.test(name || ''));
}

function parseRemarkItems(remark) {
  return String(remark || '')
    .split(/[、,，;；\n]/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => {
      const match = text.match(/^(.+?)\s*[x×*]\s*(\d+)$/i);
      return {
        name: (match ? match[1] : text).trim(),
        count: match ? Number(match[2]) : 1
      };
    })
    .filter((item) => item.name && !/^备注[:：]?$/.test(item.name));
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function getItemCount(item) {
  const count = Number(item.count || item.quantity || item.num || item.qty || 1);
  return count > 0 ? count : 1;
}

function normalizeLookupKey(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function getLookupKeys(item) {
  return [
    item.productId,
    item.product_id,
    item.goodsId,
    item.goods_id,
    item.skuId,
    item.sku_id,
    item.id,
    item.name,
    getItemName(item)
  ]
    .filter(Boolean)
    .flatMap((key) => {
      const text = String(key);
      const normalized = normalizeLookupKey(text);
      const withoutParen = normalizeLookupKey(text.replace(/[（(].*?[）)]/g, ''));
      return [text, normalized, withoutParen].filter(Boolean);
    });
}

function getProductPrice(product) {
  return toNumberOrNull(firstValue([
    product.unitPrice,
    product.unit_price,
    product.salePrice,
    product.sale_price,
    product.price,
    product.originalPrice,
    product.original_price
  ]));
}

function buildProductPriceMap(products) {
  return (products || []).reduce((map, product) => {
    const price = getProductPrice(product);
    if (price === null) return map;
    getLookupKeys(product).forEach((key) => { map[key] = price; });
    return map;
  }, {});
}

function getCatalogUnitPrice(item, productPriceMap) {
  const map = productPriceMap || {};
  const keys = getLookupKeys(item);
  for (let i = 0; i < keys.length; i += 1) {
    if (map[keys[i]] !== undefined) return map[keys[i]];
  }
  return null;
}
function buildItemPriceInfo(item, count, fallbackPrice, productPriceMap) {
  const catalogUnitPrice = getCatalogUnitPrice(item, productPriceMap);
  const unitPrice = toNumberOrNull(firstValue([
    item.unitPrice,
    item.unit_price,
    item.salePrice,
    item.sale_price,
    item.price
  ]));
  const totalPrice = toNumberOrNull(firstValue([
    item.totalPrice,
    item.total_price,
    item.lineTotal,
    item.line_total,
    item.subtotal,
    item.amount,
    fallbackPrice
  ]));

  const finalUnitPrice = unitPrice !== null
    ? unitPrice
    : catalogUnitPrice !== null
      ? catalogUnitPrice
      : totalPrice !== null
        ? totalPrice / count
        : 0;
  const finalTotalPrice = totalPrice !== null ? totalPrice : finalUnitPrice * count;

  return {
    unitPriceText: formatMoney(finalUnitPrice),
    totalPriceText: formatMoney(finalTotalPrice),
    totalPriceValue: finalTotalPrice
  };
}

function decorateDetailItem(item, index, fallbackPrice, productPriceMap) {
  const count = getItemCount(item);
  const priceInfo = buildItemPriceInfo(item, count, index === 0 ? fallbackPrice : '', productPriceMap);
  return {
    ...item,
    name: getItemName(item),
    count,
    ...priceInfo
  };
}

function normalizeDetailItems(order, productPriceMap) {
  const rawItems = Array.isArray(order.items) ? order.items : [];
  const remarkItems = parseRemarkItems(order.remark);
  const hasOrderTitleItem = rawItems.some((item) => isOrderTitleName(getItemName(item)));

  if (remarkItems.length && hasOrderTitleItem) {
    const fallbackPrice = remarkItems.length === 1 ? firstValue([
      rawItems[0] && rawItems[0].price,
      rawItems[0] && rawItems[0].amount,
      order.amount,
      order.reward
    ]) : '';
    return {
      items: remarkItems.map((item, index) => decorateDetailItem(item, index, index === 0 ? fallbackPrice : '', productPriceMap)),
      displayRemark: ''
    };
  }

  return {
    items: rawItems.map((item, index) => decorateDetailItem(item, index, '', productPriceMap)),
    displayRemark: order.remark || ''
  };
}

function normalizeDetailOrder(order, productPriceMap) {
  if (!order || typeof order !== 'object') return order;
  const normalized = normalizeDetailItems(order, productPriceMap || {});
  const itemsTotal = normalized.items.reduce((total, item) => total + Number(item.totalPriceValue || 0), 0);
  const hasPricedItem = normalized.items.some((item) => Number(item.totalPriceValue || 0) > 0);
  const fallbackTotal = toNumberOrNull(firstValue([order.amount, order.reward])) || 0;
  const finalItemsTotal = hasPricedItem ? itemsTotal : fallbackTotal;
  return {
    ...order,
    items: normalized.items,
    itemsTotal: finalItemsTotal,
    itemsTotalText: formatMoney(finalItemsTotal),
    displayRemark: normalized.displayRemark
  };
}

function getReceiverPayload(receiver) {
  if (!receiver || typeof receiver !== 'object') return null;
  return receiver.receiver || receiver.user || receiver.customerInfo || receiver;
}

function getReceiverAddress(order, payload) {
  return payload.address
    || payload.receiverAddress
    || payload.detailAddress
    || payload.fullAddress
    || payload.dorm
    || payload.room
    || order.address
    || order.dorm
    || '';
}

function withOrderAddress(order) {
  if (!order || typeof order !== 'object') return order;
  return {
    ...order,
    address: order.address || order.dorm || ''
  };
}

function mergeReceiverInfo(order, receiver) {
  const payload = getReceiverPayload(receiver);
  if (!payload) return withOrderAddress(order);
  const address = getReceiverAddress(order, payload);
  return {
    ...order,
    customer: payload.nidname || payload.nickname || payload.nickName || payload.name || payload.customer || order.customer,
    phone: payload.phone || payload.mobile || payload.tel || payload.telephone || order.phone,
    address,
    receiver: {
      ...(order.receiver || {}),
      ...payload,
      address
    }
  };
}

function buildReceiverParams(order, fallbackId) {
  return {
    id: order.id || fallbackId,
    orderId: order.id || fallbackId,
    merchantId: api.getMerchantId(),
    userId: order.userId || order.user_id || order.customerId || order.customer_id || order.uid || ''
  };
}
Page({
  data: {
    id: '',
    loading: true,
    order: null,
    actions: [],
    timeline: []
  },

  onLoad(options) {
    this.setData({ id: options.id || '' });
    this.loadOrder();
  },

  getSessionProfile() {
    const session = wx.getStorageSync('merchantSession') || {};
    return session.profile || {};
  },

  getMerchantCategory() {
    const profile = this.getSessionProfile();
    return profile.merchantCategory === 'fruit' ? 'fruit' : 'convenience';
  },

  getProductType() {
    return PRODUCT_TYPE_MAP[this.getMerchantCategory()] || PRODUCT_TYPE_MAP.convenience;
  },

  loadProductPriceMap(order) {
    const profile = this.getSessionProfile();
    return api.listProducts({
      merchantId: api.getMerchantId(),
      businessType: order.businessType || profile.businessType || 'meiyuan-1',
      merchantCategory: this.getMerchantCategory(),
      product_type: this.getProductType(),
      status: 'all'
    })
      .then(buildProductPriceMap)
      .catch((error) => {
        console.warn('[orders/detail] product prices unavailable:', error.message || error);
        return {};
      });
  },
  loadOrder() {
    if (!this.data.id) return;
    this.setData({ loading: true });
    api.getOrder({ id: this.data.id, merchantId: api.getMerchantId() })
      .then((order) => {
        const baseOrder = withOrderAddress(orderAmount.withOrderAmount(order));
        return this.loadProductPriceMap(baseOrder)
          .then((productPriceMap) => normalizeDetailOrder(baseOrder, productPriceMap));
      })
      .then((normalizedOrder) => api.getOrderReceiver(buildReceiverParams(normalizedOrder, this.data.id))
        .then((receiver) => mergeReceiverInfo(normalizedOrder, receiver))
        .catch((error) => {
          console.warn('[orders/detail] receiver info unavailable:', error.message || error);
          return normalizedOrder;
        }))      .then((order) => {
        this.setData({
          loading: false,
          order,
          actions: orderActions.buildOrderActions(order),
          timeline: orderActions.buildTimeline(order)
        });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  handleAction(event) {
    const status = event.currentTarget.dataset.status;
    if (status === 'verify') {
      wx.navigateTo({ url: '/pages/verify/index' });
      return;
    }
    if (status === 'aftersale') {
      wx.navigateTo({ url: '/pages/aftersales/index' });
      return;
    }
    api.updateOrderStatus({ id: this.data.order.id, status, merchantId: api.getMerchantId() })
      .then(() => {
        wx.showToast({ title: '订单已更新', icon: 'success' });
        this.loadOrder();
      })
      .catch(api.toastError);
  }
});
