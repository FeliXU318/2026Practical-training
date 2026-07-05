const api = require('../../utils/api');
const orderActions = require('../../utils/order-actions');
const orderAmount = require('../../utils/order-amount');

const PRODUCT_TYPE_MAP = {
  convenience: 'supermarket',
  fruit: 'fruit'
};

function formatMoney(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) ? String(number) : number.toFixed(1);
}

function firstValue(values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') || '';
}

function getProductImage(product) {
  const source = product || {};
  return firstValue([
    source.imageUrl,
    source.image_url,
    source.productImage,
    source.productImageUrl,
    source.product_image,
    source.goodsImage,
    source.goodsImageUrl,
    source.photo,
    source.photoUrl,
    source.cover,
    source.coverUrl,
    source.mainImage,
    source.mainImageUrl,
    source.thumbnail,
    source.thumbnailUrl,
    source.picture,
    source.pictureUrl,
    source.productPhoto,
    source.productPhotoUrl,
    source.product_photo,
    source.image,
    source.imagePath,
    source.image_path,
    source.pic,
    source.picUrl,
    source.img,
    source.imgUrl,
    source.img_url,
    source.url
  ]);
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

function normalizeLookupKey(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function getLookupKeys(item) {
  const source = item || {};
  const product = source.product || source.goods || source.sku || {};
  return [
    source.productId,
    source.product_id,
    source.goodsId,
    source.goods_id,
    source.skuId,
    source.sku_id,
    source.id,
    source.productName,
    source.product_name,
    source.goodsName,
    source.goods_name,
    source.skuName,
    source.sku_name,
    source.title,
    source.name,
    product.productId,
    product.product_id,
    product.goodsId,
    product.goods_id,
    product.skuId,
    product.sku_id,
    product.id,
    product.productName,
    product.product_name,
    product.goodsName,
    product.goods_name,
    product.skuName,
    product.sku_name,
    product.title,
    product.name,
    getItemName(source)
  ]
    .filter(Boolean)
    .flatMap((key) => {
      const text = String(key);
      const normalized = normalizeLookupKey(text);
      const withoutParen = normalizeLookupKey(text.replace(/[（(].*?[）)]/g, ''));
      return [text, normalized, withoutParen].filter(Boolean);
    });
}

function getItemImage(item, productImageMap) {
  const product = item.product || item.goods || item.sku || {};
  const directImage = getProductImage(item) || getProductImage(product);
  if (directImage) return directImage;
  const map = productImageMap || {};
  const keys = getLookupKeys(item);
  for (let i = 0; i < keys.length; i += 1) {
    if (map[keys[i]]) return map[keys[i]];
  }
  return '';
}

function getItemIdentity(item) {
  return getLookupKeys(item)[0] || '';
}

function buildProductImageMap(products) {
  return (products || []).reduce((map, product) => {
    const imageUrl = getProductImage(product);
    if (!imageUrl) return map;
    getLookupKeys(product).forEach((key) => { map[key] = imageUrl; });
    return map;
  }, {});
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
      if (!match) return null;
      return {
        name: match[1].trim(),
        count: Number(match[2]) || 1
      };
    })
    .filter(Boolean);
}

function getOrderItems(order) {
  const rawItems = Array.isArray(order.items) ? order.items : [];
  const hasOrderTitleItem = rawItems.some((item) => isOrderTitleName(getItemName(item)));
  const remarkItems = parseRemarkItems(order.remark);
  return hasOrderTitleItem && remarkItems.length ? remarkItems : rawItems;
}

function getSessionProfile() {
  const session = wx.getStorageSync('merchantSession') || {};
  return session.profile || {};
}

function getMerchantName(order) {
  const profile = getSessionProfile();
  return firstValue([
    order.merchantName,
    order.storeName,
    order.shopName,
    order.sellerName,
    order.businessName,
    order.name,
    order.seller_name,
    order.shop_name,
    order.store_name,
    profile.merchantName,
    profile.storeName,
    profile.shopName,
    profile.businessName,
    profile.businessLabel
  ]) || '商户';
}

function getMerchantAvatar(order) {
  const profile = getSessionProfile();
  return firstValue([
    order.merchantAvatar,
    order.merchantAvatarUrl,
    order.avatar,
    order.avatarUrl,
    order.logo,
    order.logoUrl,
    order.shopAvatar,
    order.shopAvatarUrl,
    order.shopLogo,
    order.storeAvatar,
    order.storeLogo,
    order.merchantLogo,
    order.merchantLogoUrl,
    order.sellerAvatar,
    order.sellerLogo,
    order.businessAvatar,
    order.businessLogo,
    order.headImg,
    order.headImgUrl,
    order.headimgurl,
    order.logo_url,
    order.avatar_url,
    order.shop_logo,
    order.store_logo,
    profile.merchantAvatar,
    profile.merchantAvatarUrl,
    profile.avatar,
    profile.avatarUrl,
    profile.logo,
    profile.logoUrl,
    profile.shopAvatar,
    profile.shopLogo,
    profile.merchantLogo,
    profile.merchantLogoUrl,
    profile.businessAvatar,
    profile.businessLogo,
    profile.headImg,
    profile.headImgUrl,
    profile.headimgurl,
    profile.logo_url,
    profile.avatar_url,
    profile.shop_logo,
    profile.store_logo
  ]);
}

function getDeliveryAddress(order) {
  return firstValue([
    order.address,
    order.receiverAddress,
    order.detailAddress,
    order.fullAddress,
    order.deliveryAddress,
    order.dorm,
    order.room
  ]);
}

function decorateItem(item, index, productImageMap, caption) {
  const name = getItemName(item);
  return {
    ...item,
    imageUrl: getItemImage(item, productImageMap),
    shortName: name.slice(0, 1),
    caption: index === 0 ? caption : '',
    previewClass: `preview-tone-${index % 5}`
  };
}

function buildPromoTags(order, itemQuantity) {
  const tags = [];
  if (order.deliveryText) tags.push(order.deliveryText);
  if (Number(order.discount || 0) > 0) tags.push(`优惠 ¥${formatMoney(order.discount)}`);
  tags.push(`共 ${itemQuantity} 件`);
  return tags;
}

function decorateOrder(order, productImageMap) {
  const items = getOrderItems(order);
  const itemQuantity = items.reduce((total, item) => total + Number(item.count || 0), 0);
  const subtotal = items.reduce((total, item) => total + Number(item.price || 0) * Number(item.count || 0), 0);
  const amount = orderAmount.getOrderAmount(order);
  const deliveryAddress = getDeliveryAddress(order);
  const displayItems = items.slice(0, 2).map((item, index) => decorateItem(item, index, productImageMap || {}, deliveryAddress));
  const merchantName = getMerchantName(order);
  return {
    ...order,
    amount,
    itemQuantity,
    itemKindCount: items.length,
    displayItems,
    extraItemCount: Math.max(0, items.length - displayItems.length),
    merchantName,
    merchantAvatar: getMerchantAvatar(order),
    merchantLogoText: merchantName.slice(0, 1),
    deliveryAddress,
    orderTitle: merchantName,
    subtotalText: formatMoney(subtotal),
    discountText: formatMoney(order.discount),
    amountText: formatMoney(amount),
    promoTags: buildPromoTags(order, itemQuantity),
    actions: orderActions.buildOrderActions(order)
  };
}

Page({
  data: {
    loading: true,
    activeStatus: 'all',
    tabs: [
      { label: '全部', value: 'all' },
      { label: '待接单', value: 'pending' },
      { label: '备货中', value: 'preparing' },
      { label: '待自提', value: 'ready' },
      { label: '配送中', value: 'delivery' },
      { label: '已完成', value: 'completed' }
    ],
    orders: []
  },

  onShow() {
    if (!this.ensureLogin()) return;

    const preferredStatus = wx.getStorageSync('orderStatusFilter');
    if (preferredStatus) wx.removeStorageSync('orderStatusFilter');
    const statusExists = this.data.tabs.some((item) => item.value === preferredStatus);
    if (statusExists) {
      this.setData({ activeStatus: preferredStatus }, () => this.loadOrders());
      return;
    }
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.loadOrders().finally(() => wx.stopPullDownRefresh());
  },

  ensureLogin() {
    const session = wx.getStorageSync('merchantSession');
    if (!session || !session.token) {
      wx.reLaunch({ url: '/pages/login/index' });
      return false;
    }
    return true;
  },

  getBusinessType() {
    const session = wx.getStorageSync('merchantSession') || {};
    return session.profile ? session.profile.businessType : 'meiyuan-1';
  },

  getMerchantCategory() {
    const profile = getSessionProfile();
    return profile.merchantCategory === 'fruit' ? 'fruit' : 'convenience';
  },

  getProductType() {
    return PRODUCT_TYPE_MAP[this.getMerchantCategory()] || PRODUCT_TYPE_MAP.convenience;
  },

  loadProductImageMap() {
    return api.listProducts({
      merchantId: api.getMerchantId(),
      businessType: this.getBusinessType(),
      merchantCategory: this.getMerchantCategory(),
      product_type: this.getProductType(),
      status: 'all'
    })
      .then(buildProductImageMap)
      .catch((error) => {
        console.warn('[orders/index] product images unavailable:', error.message || error);
        return {};
      });
  },

  loadOrders() {
    this.setData({ loading: true });
    return Promise.all([
      api.listOrders({
        merchantId: api.getMerchantId(),
        businessType: this.getBusinessType(),
        status: this.data.activeStatus
      }),
      this.loadProductImageMap()
    ])
      .then(([orders, productImageMap]) => {
        this.setData({
          loading: false,
          orders: orders.map((order) => decorateOrder(order, productImageMap))
        });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  changeTab(event) {
    this.setData({ activeStatus: event.currentTarget.dataset.status }, () => this.loadOrders());
  },

  openDetail(event) {
    wx.navigateTo({ url: `/pages/orders/detail?id=${event.currentTarget.dataset.id}` });
  },

  handleAction(event) {
    const id = event.currentTarget.dataset.id;
    const status = event.currentTarget.dataset.status;
    if (status === 'verify') {
      wx.navigateTo({ url: '/pages/verify/index' });
      return;
    }
    if (status === 'aftersale') {
      wx.navigateTo({ url: '/pages/aftersales/index' });
      return;
    }
    wx.showModal({
      title: '更新订单状态',
      content: '确认执行该订单操作？',
      success: (res) => {
        if (!res.confirm) return;
        api.updateOrderStatus({ id, status, merchantId: api.getMerchantId() })
          .then(() => {
            wx.showToast({ title: '订单已更新', icon: 'success' });
            this.loadOrders();
          })
          .catch(api.toastError);
      }
    });
  }
});