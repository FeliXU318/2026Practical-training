const STATUS_LABELS = {
  pending: '待处理',
  preparing: '备货中',
  ready: '待自提',
  delivery: '配送中',
  completed: '已完成',
  aftersale: '售后中',
  cancelled: '已取消'
};

const MERCHANT_UNITS = [
  { label: "梅园1栋", value: "meiyuan-1" },
  { label: "梅园2栋", value: "meiyuan-2" },
  { label: "梅园3栋", value: "meiyuan-3" },
  { label: "梅园4栋", value: "meiyuan-4" },
  { label: "梅园5栋", value: "meiyuan-5" },
  { label: "梅园6栋", value: "meiyuan-6" },
  { label: "梅园7栋", value: "meiyuan-7" },
  { label: "竹园1栋", value: "zhuyuan-1" },
  { label: "竹园2栋", value: "zhuyuan-2" },
  { label: "竹园3栋", value: "zhuyuan-3" },
  { label: "竹园4栋", value: "zhuyuan-4" },
  { label: "竹园5栋", value: "zhuyuan-5" },
  { label: "竹园6栋", value: "zhuyuan-6" },
  { label: "松园1栋", value: "songyuan-1" },
  { label: "松园2栋", value: "songyuan-2" },
  { label: "松园3栋", value: "songyuan-3" },
  { label: "松园4栋", value: "songyuan-4" },
  { label: "松园5栋", value: "songyuan-5" },
  { label: "松园6栋", value: "songyuan-6" },
  { label: "松园7栋", value: "songyuan-7" },
  { label: "兰园1栋", value: "lanyuan-1" },
  { label: "兰园2栋", value: "lanyuan-2" },
  { label: "兰园3栋", value: "lanyuan-3" },
  { label: "兰园4栋", value: "lanyuan-4" },
  { label: "兰园5栋", value: "lanyuan-5" },
  { label: "兰园6栋", value: "lanyuan-6" },
  { label: "兰园7栋", value: "lanyuan-7" },
  { label: "兰园8栋", value: "lanyuan-8" },
  { label: "荷园1栋", value: "heyuan-1" },
  { label: "荷园2栋", value: "heyuan-2" },
  { label: "荷园3栋", value: "heyuan-3" },
  { label: "博士生公寓楼", value: "doctor-apartment" }
];

const MERCHANT_GARDEN_UNITS = [
  { label: "梅园", value: "meiyuan" },
  { label: "竹园", value: "zhuyuan" },
  { label: "兰园", value: "lanyuan" },
  { label: "荷园", value: "heyuan" },
  { label: "松园", value: "songyuan" }
];

const DEFAULT_BUSINESS_TYPE = MERCHANT_UNITS[0].value;
const DEFAULT_GARDEN_BUSINESS_TYPE = MERCHANT_GARDEN_UNITS[0].value;
const PHONE_PATTERN = /^1[3-9]\d{9}$/;

const BUSINESS_LABELS = [...MERCHANT_UNITS, ...MERCHANT_GARDEN_UNITS].reduce((labels, unit) => {
  labels[unit.value] = unit.label;
  return labels;
}, {});

const MERCHANT_CATEGORY_LABELS = {
  convenience: '便利店商家',
  fruit: '水果商家'
};

const PRODUCT_TYPE_MAP = {
  convenience: 'supermarket',
  fruit: 'fruit'
};

function getProductType(merchantCategory) {
  return PRODUCT_TYPE_MAP[merchantCategory] || PRODUCT_TYPE_MAP.convenience;
}

function inferProductType(product) {
  if (product.product_type || product.productType) return product.product_type || product.productType;
  if (product.merchantCategory) return getProductType(product.merchantCategory);
  if (product.isDaily || ['水果单品', '果切套餐', '组合套餐'].includes(product.category)) return PRODUCT_TYPE_MAP.fruit;
  return PRODUCT_TYPE_MAP.convenience;
}

const merchantStatusState = {};

const TEST_ACCOUNTS = {
  '13800000000': {
    merchantId: 1,
    password: '123456',
    businessType: 'meiyuan-1',
    merchantCategory: 'convenience',
    phone: '13800000000'
  }
};

const state = {
  products: [
    {
      id: 'P3001',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '每日坚果包',
      category: '零食饮料',
      price: 8.8,
      stock: 36,
      sales: 128,
      onSale: true,
      imageUrl: '/assets/products/mixed-nuts.png',
      imageTone: 'tone-orange',
      tags: ['热销', '坚果'],
      description: '独立小包装坚果，适合课间补充能量。'
    },
    {
      id: 'P3002',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '原味薯片',
      category: '零食饮料',
      price: 6.5,
      stock: 42,
      sales: 156,
      onSale: true,
      imageUrl: '/assets/products/potato-chips.png',
      imageTone: 'tone-orange',
      tags: ['膨化食品'],
      description: '经典原味袋装薯片，追剧和夜宵常备。'
    },
    {
      id: 'P3003',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '冰爽可乐',
      category: '零食饮料',
      price: 3.5,
      stock: 60,
      sales: 210,
      onSale: true,
      imageUrl: '/assets/products/cola-can.png',
      imageTone: 'tone-red',
      tags: ['冰饮'],
      description: '罐装汽水，冰镇后口感更佳。'
    },
    {
      id: 'P3004',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '冰镇柠檬茶',
      category: '零食饮料',
      price: 4.5,
      stock: 32,
      sales: 112,
      onSale: true,
      imageUrl: '/assets/products/lemon-tea.png',
      imageTone: 'tone-green',
      tags: ['茶饮', '库存预警'],
      description: '清爽柠檬茶，适合午后和晚间搭配零食。'
    },
    {
      id: 'P3005',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '鲜橙汁',
      category: '零食饮料',
      price: 5.8,
      stock: 28,
      sales: 94,
      onSale: true,
      imageUrl: '/assets/products/orange-juice.png',
      imageTone: 'tone-orange',
      tags: ['果汁'],
      description: '酸甜橙汁，冷藏饮用更清爽。'
    },
    {
      id: 'P3006',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '纯牛奶',
      category: '零食饮料',
      price: 4.2,
      stock: 45,
      sales: 76,
      onSale: true,
      imageUrl: '/assets/products/milk-carton.png',
      imageTone: 'tone-blue',
      tags: ['早餐'],
      description: '盒装纯牛奶，早餐和夜间加餐都方便。'
    },
    {
      id: 'P3007',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '牛奶巧克力',
      category: '零食饮料',
      price: 7.9,
      stock: 24,
      sales: 88,
      onSale: true,
      imageUrl: '/assets/products/chocolate-bar.png',
      imageTone: 'tone-orange',
      tags: ['甜食'],
      description: '香浓巧克力块，适合随身携带。'
    },
    {
      id: 'P3008',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '黄油曲奇',
      category: '零食饮料',
      price: 9.9,
      stock: 20,
      sales: 63,
      onSale: true,
      imageUrl: '/assets/products/cookie-pack.png',
      imageTone: 'tone-orange',
      tags: ['饼干'],
      description: '酥脆曲奇小包装，适合下午茶。'
    },
    {
      id: 'P3009',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '苏打饼干',
      category: '零食饮料',
      price: 5.5,
      stock: 38,
      sales: 57,
      onSale: true,
      imageUrl: '/assets/products/cracker-pack.png',
      imageTone: 'tone-blue',
      tags: ['饼干'],
      description: '轻盐苏打饼干，解馋不腻。'
    },
    {
      id: 'P3010',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '杯装泡面',
      category: '零食饮料',
      price: 6.8,
      stock: 34,
      sales: 145,
      onSale: true,
      imageUrl: '/assets/products/instant-noodles.png',
      imageTone: 'tone-red',
      tags: ['夜宵'],
      description: '杯装方便面，宿舍夜宵常备。'
    },
    {
      id: 'P3011',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '香甜爆米花',
      category: '零食饮料',
      price: 8.5,
      stock: 26,
      sales: 71,
      onSale: true,
      imageUrl: '/assets/products/popcorn-bag.png',
      imageTone: 'tone-orange',
      tags: ['膨化食品'],
      description: '袋装爆米花，适合追剧分享。'
    },
    {
      id: 'P3012',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '水果软糖',
      category: '零食饮料',
      price: 4.9,
      stock: 40,
      sales: 82,
      onSale: true,
      imageUrl: '/assets/products/gummy-pack.png',
      imageTone: 'tone-purple',
      tags: ['糖果'],
      description: '果味软糖，小包即食。'
    },
    {
      id: 'P3013',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '蜜桃果冻',
      category: '零食饮料',
      price: 3.2,
      stock: 50,
      sales: 92,
      onSale: true,
      imageUrl: '/assets/products/jelly-cup.png',
      imageTone: 'tone-pink',
      tags: ['果冻'],
      description: '杯装蜜桃果冻，冰镇口感更好。'
    },
    {
      id: 'P3014',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '彩虹棒棒糖',
      category: '零食饮料',
      price: 2.5,
      stock: 48,
      sales: 54,
      onSale: true,
      imageUrl: '/assets/products/lollipop.png',
      imageTone: 'tone-purple',
      tags: ['糖果'],
      description: '彩色棒棒糖，甜味小零食。'
    },
    {
      id: 'P3015',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '夹心威化',
      category: '零食饮料',
      price: 6.2,
      stock: 30,
      sales: 67,
      onSale: true,
      imageUrl: '/assets/products/wafer-pack.png',
      imageTone: 'tone-orange',
      tags: ['饼干'],
      description: '酥脆威化饼干，独立包装方便携带。'
    },
    {
      id: 'P3016',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '酸奶饮品',
      category: '零食饮料',
      price: 5.0,
      stock: 37,
      sales: 101,
      onSale: true,
      imageUrl: '/assets/products/yogurt-drink.png',
      imageTone: 'tone-pink',
      tags: ['乳饮'],
      description: '瓶装酸奶饮品，早餐和加餐都合适。'
    },
    {
      id: 'P3017',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '能量饮料',
      category: '零食饮料',
      price: 6.0,
      stock: 25,
      sales: 74,
      onSale: true,
      imageUrl: '/assets/products/energy-drink.png',
      imageTone: 'tone-blue',
      tags: ['功能饮料'],
      description: '罐装能量饮料，学习加班补给。'
    },
    {
      id: 'P3018',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '矿泉水',
      category: '零食饮料',
      price: 2.0,
      stock: 80,
      sales: 190,
      onSale: true,
      imageUrl: '/assets/products/bottled-water.png',
      imageTone: 'tone-blue',
      tags: ['饮用水'],
      description: '瓶装饮用水，日常补水常备。'
    },
    {
      id: 'P3019',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '奶香面包',
      category: '零食饮料',
      price: 4.8,
      stock: 29,
      sales: 84,
      onSale: true,
      imageUrl: '/assets/products/snack-bread.png',
      imageTone: 'tone-orange',
      tags: ['面包'],
      description: '软面包小包装，适合早餐和课间。'
    },
    {
      id: 'P3020',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '香草雪糕',
      category: '零食饮料',
      price: 5.5,
      stock: 18,
      sales: 66,
      onSale: true,
      imageUrl: '/assets/products/ice-cream-bar.png',
      imageTone: 'tone-orange',
      tags: ['冷饮'],
      description: '香草口味雪糕，夏日冷饮热销。'
    },    {
      id: 'P1001',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '元气坚果组合',
      category: '零食饮料',
      price: 9.9,
      stock: 12,
      sales: 86,
      onSale: true,
      imageUrl: '/assets/products/mixed-nuts.png',
      imageTone: 'tone-orange',
      tags: ['热销', '晚间补货'],
      description: '适合宿舍分享的坚果零食组合。'
    },
    {
      id: 'P1002',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '晨光中性笔套装',
      category: '文具日用',
      price: 12.5,
      stock: 46,
      sales: 34,
      onSale: true,
      imageTone: 'tone-blue',
      tags: ['文具'],
      description: '考试周高频补给，三支装。'
    },
    {
      id: 'P1003',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '冰镇柠檬茶',
      category: '零食饮料',
      price: 4.5,
      stock: 3,
      sales: 112,
      onSale: true,
      imageUrl: '/assets/products/lemon-tea.png',
      imageTone: 'tone-green',
      tags: ['库存预警'],
      description: '便利店高频饮品，库存不足需及时补货。'
    },
    {
      id: 'F2001',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '每日鲜果杯',
      category: '果切套餐',
      price: 15.8,
      stock: 24,
      sales: 91,
      onSale: true,
      isDaily: true,
      imageTone: 'tone-pink',
      tags: ['每日鲜果', '商家自配'],
      description: '当日现切，含西瓜、芒果、蓝莓。'
    },
    {
      id: 'F2002',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '阳光玫瑰葡萄',
      category: '水果单品',
      price: 22.8,
      stock: 8,
      sales: 67,
      onSale: true,
      imageTone: 'tone-green',
      tags: ['晚间自配'],
      description: '适合晚间商家自配的热门水果。'
    },
    {
      id: 'F2003',
      merchantId: 1,
      businessType: 'meiyuan-1',
      name: '轻食水果拼盘',
      category: '组合套餐',
      price: 18.8,
      stock: 0,
      sales: 22,
      onSale: false,
      imageTone: 'tone-purple',
      tags: ['已售罄'],
      description: '组合套餐，售罄后自动下架。'
    }
  ],
  orders: [
    {
      id: 'O20260629001',
      orderNo: '20260629001',
      merchantId: 1,
      businessType: 'zhuyuan-3',
      customer: '李同学',
      phone: '13800000001',
      dorm: '竹园 3 栋 502',
      deliveryMethod: 'pickup',
      pickupCode: '683214',
      reserveTime: '今天 18:30',
      status: 'pending',
      amount: 24.8,
      discount: 4,
      remark: '客户自提，少放辣味零食',
      createdAt: '09:42',
      items: [
        { name: '元气坚果组合', count: 2, price: 9.9 },
        { name: '冰镇柠檬茶', count: 2, price: 4.5 }
      ]
    },
    {
      id: 'O20260629002',
      orderNo: '20260629002',
      merchantId: 1,
      businessType: 'songyuan-1',
      customer: '周同学',
      phone: '13800000002',
      dorm: '松园 1 栋 318',
      deliveryMethod: 'delivery',
      reserveTime: '今天 20:00',
      status: 'preparing',
      amount: 54,
      discount: 6,
      remark: '宿舍楼下电话联系',
      createdAt: '10:18',
      items: [
        { name: '晨光中性笔套装', count: 3, price: 12.5 },
        { name: '冰镇柠檬茶', count: 5, price: 4.5 }
      ]
    },
    {
      id: 'O20260629003',
      orderNo: '20260629003',
      merchantId: 1,
      businessType: 'meiyuan-6',
      customer: '王同学',
      phone: '13800000003',
      dorm: '梅园 6 栋 211',
      deliveryMethod: 'delivery',
      reserveTime: '今天 19:30',
      status: 'delivery',
      amount: 38.6,
      discount: 0,
      remark: '水果杯放门卫架',
      createdAt: '11:06',
      items: [
        { name: '每日鲜果杯', count: 1, price: 15.8 },
        { name: '阳光玫瑰葡萄', count: 1, price: 22.8 }
      ]
    },
    {
      id: 'O20260628009',
      orderNo: '20260628009',
      merchantId: 1,
      businessType: 'lanyuan-2',
      customer: '赵同学',
      phone: '13800000004',
      dorm: '兰园 2 栋 605',
      deliveryMethod: 'delivery',
      reserveTime: '昨天 21:00',
      status: 'aftersale',
      amount: 16.8,
      discount: 2,
      remark: '反馈果切氧化较明显',
      createdAt: '昨天',
      items: [
        { name: '轻食水果拼盘', count: 1, price: 18.8 }
      ]
    },
    {
      id: 'O20260628005',
      orderNo: '20260628005',
      merchantId: 1,
      businessType: 'zhuyuan-5',
      customer: '陈同学',
      phone: '13800000005',
      dorm: '竹园 5 栋 406',
      deliveryMethod: 'pickup',
      pickupCode: '956120',
      reserveTime: '昨天 17:20',
      status: 'completed',
      amount: 41.8,
      discount: 3,
      remark: '',
      createdAt: '昨天',
      items: [
        { name: '元气坚果组合', count: 2, price: 9.9 },
        { name: '晨光中性笔套装', count: 2, price: 12.5 }
      ]
    }
  ],
  deliveryTasks: [
    {
      id: 'D1001',
      orderId: 'O20260629003',
      merchantId: 1,
      businessType: 'meiyuan-6',
      orderNo: '20260629003',
      dorm: '梅园 6 栋 211',
      reserveTime: '今天 19:30',
      riderName: '自配员阿宁',
      status: 'delivering',
      itemSummary: '每日鲜果杯等 2 件'
    },
    {
      id: 'D1002',
      orderId: 'O20260629002',
      merchantId: 1,
      businessType: 'songyuan-1',
      orderNo: '20260629002',
      dorm: '松园 1 栋 318',
      reserveTime: '今天 20:00',
      riderName: '',
      status: 'new',
      itemSummary: '中性笔套装等 8 件'
    }
  ],
  afterSales: [
    {
      id: 'A1001',
      orderId: 'O20260628009',
      orderNo: '20260628009',
      merchantId: 1,
      businessType: 'lanyuan-2',
      customer: '赵同学',
      type: '质量反馈',
      status: '待处理',
      content: '果切氧化明显，希望补发或退款。',
      result: '',
      createdAt: '昨天 22:10'
    },
    {
      id: 'A1002',
      orderId: 'O20260627011',
      orderNo: '20260627011',
      merchantId: 14,
      businessType: 'songyuan-1',
      customer: '林同学',
      type: '自配延迟',
      status: '已处理',
      content: '晚到 20 分钟。',
      result: '已沟通说明并记录处理结果。',
      createdAt: '06-27 21:30'
    }
  ],
};

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

function getMerchantCategory(merchantCategory) {
  return MERCHANT_CATEGORY_LABELS[merchantCategory] ? merchantCategory : 'convenience';
}

function getDefaultBusinessType(merchantCategory) {
  return getMerchantCategory(merchantCategory) === 'fruit' ? DEFAULT_GARDEN_BUSINESS_TYPE : DEFAULT_BUSINESS_TYPE;
}

function getGardenUnit(businessType) {
  const value = String(businessType || '');
  return MERCHANT_GARDEN_UNITS.find((item) => value === item.value || value.startsWith(`${item.value}-`)) || MERCHANT_GARDEN_UNITS[0];
}

function getMerchantUnit(businessType, merchantCategory) {
  const category = getMerchantCategory(merchantCategory);
  if (category === 'fruit') return getGardenUnit(businessType || DEFAULT_GARDEN_BUSINESS_TYPE);
  return MERCHANT_UNITS.find((item) => item.value === businessType) || MERCHANT_UNITS[0];
}

function normalizeBusinessType(businessType, merchantCategory) {
  return getMerchantUnit(businessType, merchantCategory).value;
}

function isGardenBusinessType(businessType) {
  return MERCHANT_GARDEN_UNITS.some((unit) => unit.value === businessType);
}

function getBusinessGardenValue(businessType) {
  return getGardenUnit(businessType).value;
}

function filterBusiness(list, businessType) {
  const selectedBusinessType = String(businessType || DEFAULT_BUSINESS_TYPE);
  if (isGardenBusinessType(selectedBusinessType)) {
    return list.filter((item) => getBusinessGardenValue(item.businessType) === selectedBusinessType);
  }
  return list.filter((item) => item.businessType === normalizeBusinessType(selectedBusinessType, 'convenience'));
}

function getProfile(businessType, merchantCategory, merchantId) {
  const category = getMerchantCategory(merchantCategory);
  const unit = getMerchantUnit(businessType, category);
  const storeName = category === 'fruit' ? '水果店' : '便利店';
  return {
    merchantId: merchantId || 0,
    merchantName: `${unit.label}${storeName}`,
    businessType: unit.value,
    businessLabel: unit.label,
    merchantCategory: category,
    merchantCategoryLabel: MERCHANT_CATEGORY_LABELS[category],
    dormBuilding: unit.label,
    manager: `${unit.label}管理员`
  };
}

function sum(list, selector) {
  return list.reduce((total, item) => total + selector(item), 0);
}

function normalizeProduct(product) {
  return {
    ...product,
    product_type: inferProductType(product),
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    sales: Number(product.sales || 0),
    onSale: Boolean(product.onSale)
  };
}

function getProductTags(product) {
  const tags = [...(product.tags || [])];
  if (product.stock <= 5 && !tags.includes('库存预警')) tags.unshift('库存预警');
  if (product.isDaily && !tags.includes('每日鲜果')) tags.unshift('每日鲜果');
  if (!product.onSale && !tags.includes('已下架')) tags.unshift('已下架');
  return tags;
}

function decorateProduct(product) {
  return {
    ...product,
    shortName: product.name ? product.name.slice(0, 1) : '商',
    statusText: product.onSale ? '已上架' : '已下架',
    statusClass: product.onSale ? 'status-on' : 'status-off',
    stockStatus: product.stock <= 5 ? '库存预警' : '库存正常',
    tags: getProductTags(product)
  };
}

function decorateOrder(order) {
  return {
    ...order,
    statusText: STATUS_LABELS[order.status] || order.status,
    deliveryText: order.deliveryMethod === 'pickup' ? '客户自提' : '商家自配',
    itemSummary: order.items.map((item) => `${item.name} x${item.count}`).join('、')
  };
}

function login(data) {
  const phone = (data.phone || data.account || '').trim();
  const password = (data.password || '').trim();
  if (!phone || !password) {
    return fail('请输入手机号和密码');
  }
  if (!PHONE_PATTERN.test(phone)) {
    return fail('请输入正确的手机号');
  }

  let account = TEST_ACCOUNTS[phone];
  if (account && account.password !== password) {
    return fail('手机号或密码错误');
  }

  const merchantCategory = getMerchantCategory(data.merchantCategory || (account && account.merchantCategory));
  const businessType = normalizeBusinessType(data.businessType || (account && account.businessType) || getDefaultBusinessType(merchantCategory), merchantCategory);
  const registered = !account;

  if (!account) {
    if (!data.autoRegister && !data.registerOnLogin) {
      return fail('手机号未注册');
    }
    account = {
      merchantId: Object.keys(TEST_ACCOUNTS).length + 1,
      password,
      businessType,
      merchantCategory,
      phone
    };
    TEST_ACCOUNTS[phone] = account;
  } else if (data.autoRegister || data.registerOnLogin) {
    account.businessType = businessType;
    account.merchantCategory = merchantCategory;
    account.phone = account.phone || phone;
  }

  const baseProfile = getProfile(account.businessType, account.merchantCategory, account.merchantId);
  const profile = {
    ...baseProfile,
    merchantName: data.merchantName || baseProfile.merchantName,
    businessLabel: data.businessLabel || baseProfile.businessLabel,
    merchantCategoryLabel: data.merchantCategoryLabel || baseProfile.merchantCategoryLabel,
    dormBuilding: data.dormBuilding || baseProfile.dormBuilding,
    manager: data.manager || baseProfile.manager,
    phone: account.phone
  };

  return wait({
    token: `mock-token-${account.businessType}-${phone}`,
    account: phone,
    registered,
    profile,
    loginType: 'password',
    phoneBound: Boolean(account.phone),
    phone: account.phone
  });
}

function wechatLogin(data) {
  const merchantCategory = getMerchantCategory(data.merchantCategory);
  const businessType = normalizeBusinessType(data.businessType || getDefaultBusinessType(merchantCategory), merchantCategory);
  if (!data.code) {
    return fail('微信登录凭证无效');
  }
  const merchantId = data.merchantId || Object.keys(TEST_ACCOUNTS).length + 1;
  const profile = getProfile(businessType, data.merchantCategory, merchantId);
  return wait({
    loginToken: `mock-wechat-login-${businessType}-${Date.now()}`,
    openid: `wx_openid_${businessType}_****`,
    profile,
    phoneBound: false
  });
}

function updateMerchantStatus(data) {
  const merchantCategory = getMerchantCategory(data.merchantCategory);
  const businessType = normalizeBusinessType(data.businessType || getDefaultBusinessType(merchantCategory), merchantCategory);
  const stasus = data.stasus === '已打烊' ? '已打烊' : '营业中';
  const status = stasus === '已打烊' ? 'closed' : 'open';
  const result = {
    businessType,
    merchantCategory,
    stasus,
    status,
    isOpen: status === 'open'
  };
  merchantStatusState[businessType] = result;
  return wait(result);
}

function bindPhone(data) {
  const merchantCategory = getMerchantCategory(data.merchantCategory);
  const businessType = normalizeBusinessType(data.businessType || getDefaultBusinessType(merchantCategory), merchantCategory);
  if (!data.loginToken) {
    return fail('请先完成微信登录');
  }
  if (!data.phoneCode && !data.encryptedData && !data.mockPhone) {
    return fail('请先授权绑定手机号');
  }
  const phone = data.mockPhone || '微信授权手机号';
  const merchantId = data.merchantId || Object.keys(TEST_ACCOUNTS).length + 1;
  const profile = {
    ...getProfile(businessType, merchantCategory, merchantId),
    phone
  };
  return wait({
    token: `mock-wechat-token-${businessType}`,
    loginType: 'wechat',
    phoneBound: true,
    phone,
    profile
  });
}

function listProducts(data) {
  const merchantId = data.merchantId || '';
  const businessType = data.businessType || getDefaultBusinessType(data.merchantCategory);
  const keyword = (data.keyword || '').trim();
  const status = data.status || 'all';
  const productType = data.product_type || data.productType || (data.merchantCategory ? getProductType(data.merchantCategory) : '');
  let products = state.products;

  if (merchantId) {
    products = products.filter((product) => product.merchantId === merchantId);
  } else {
    products = filterBusiness(products, businessType);
  }

  if (productType) {
    products = products.filter((product) => normalizeProduct(product).product_type === productType);
  }
  if (keyword) {
    products = products.filter((product) => product.name.includes(keyword) || product.category.includes(keyword));
  }
  if (status === 'on') products = products.filter((product) => product.onSale);
  if (status === 'off') products = products.filter((product) => !product.onSale);
  if (status === 'low') products = products.filter((product) => product.stock <= 5);
  if (status === 'daily') products = products.filter((product) => product.isDaily);

  return wait(products.map((product) => decorateProduct(normalizeProduct(product))));
}

function getProduct(data) {
  const product = state.products.find((item) => item.id === data.id);
  return product ? wait(decorateProduct(normalizeProduct(product))) : fail('商品不存在');
}

function saveProduct(data) {
  const merchantCategory = getMerchantCategory(data.merchantCategory);
  const productType = data.product_type || data.productType || getProductType(merchantCategory);
  const product = {
    ...normalizeProduct({ ...data, product_type: productType }),
    businessType: normalizeBusinessType(data.businessType || getDefaultBusinessType(merchantCategory), merchantCategory),
    merchantId: data.merchantId || 0
  };
  if (!product.name) return fail('请输入商品名称');
  if (!product.category) return fail('请选择商品分类');

  if (product.id) {
    const index = state.products.findIndex((item) => item.id === product.id);
    if (index >= 0) {
      state.products[index] = { ...state.products[index], ...product };
      return wait(decorateProduct(normalizeProduct(state.products[index])));
    }
  }

  const prefix = 'P';
  const newProduct = {
    ...product,
    id: `${prefix}${Date.now().toString().slice(-6)}`,
    sales: 0,
    imageTone: product.imageTone || 'tone-blue',
    tags: product.tags || []
  };
  state.products.unshift(newProduct);
  return wait(decorateProduct(normalizeProduct(newProduct)));
}

function adjustStock(data) {
  const product = state.products.find((item) => item.id === data.id);
  if (!product) return fail('商品不存在');
  product.stock = Math.max(0, Number(product.stock) + Number(data.delta || 0));
  return wait(decorateProduct(normalizeProduct(product)));
}

function toggleProduct(data) {
  const product = state.products.find((item) => item.id === data.id);
  if (!product) return fail('商品不存在');
  product.onSale = !product.onSale;
  return wait(decorateProduct(normalizeProduct(product)));
}

function listOrders(data) {
  const merchantId = data.merchantId || '';
  const businessType = data.businessType || getDefaultBusinessType(data.merchantCategory);
  const status = data.status || 'all';
  let orders = state.orders;
  if (merchantId) {
    orders = orders.filter((order) => order.merchantId === merchantId);
  } else {
    orders = filterBusiness(orders, businessType);
  }
  if (status !== 'all') orders = orders.filter((order) => order.status === status);
  return wait(orders.map(decorateOrder));
}

function getOrder(data) {
  const merchantId = data.merchantId || '';
  let order = state.orders.find((item) => item.id === data.id);
  if (order && merchantId && order.merchantId !== merchantId) {
    return fail('订单不存在');
  }
  return order ? wait(decorateOrder(order)) : fail('订单不存在');
}

function getOrderReceiver(data) {
  const id = data.id || data.orderId;
  const merchantId = data.merchantId || '';
  const order = state.orders.find((item) => item.id === id);
  if (order && merchantId && order.merchantId !== merchantId) {
    return fail('订单不存在');
  }
  if (!order) return fail('订单不存在');
  return wait({
    orderId: order.id,
    nidname: order.nidname || order.customer,
    phone: order.phone,
    address: order.address || order.dorm
  });
}

function updateOrderStatus(data) {
  const merchantId = data.merchantId || '';
  let order = state.orders.find((item) => item.id === data.id);
  if (order && merchantId && order.merchantId !== merchantId) {
    return fail('订单不存在');
  }
  if (!order) return fail('订单不存在');
  order.status = data.status;

  if (data.status === 'delivery') {
    const exists = state.deliveryTasks.some((task) => task.orderId === order.id);
    if (!exists) {
      state.deliveryTasks.unshift({
        id: `D${Date.now().toString().slice(-5)}`,
        orderId: order.id,
        merchantId: order.merchantId,
        businessType: order.businessType,
        orderNo: order.orderNo,
        dorm: order.dorm,
        reserveTime: order.reserveTime,
        riderName: '',
        status: 'new',
        itemSummary: `${order.items[0].name}等 ${sum(order.items, (item) => item.count)} 件`
      });
    }
  }

  return wait(decorateOrder(order));
}

function verifyPickup(data) {
  const code = (data.code || '').trim();
  const merchantId = data.merchantId || '';
  let order = state.orders.find((item) => item.pickupCode === code);
  if (order && merchantId && order.merchantId !== merchantId) {
    return fail('未找到对应客户自提订单');
  }
  if (!order) return fail('未找到对应客户自提订单');
  if (order.status === 'completed') return fail('该订单已完成核销');
  order.status = 'completed';
  return wait(decorateOrder(order));
}

function listDeliveryTasks(data) {
  const merchantId = data.merchantId || '';
  const businessType = data.businessType || getDefaultBusinessType(data.merchantCategory);
  const status = data.status || 'all';
  let tasks = state.deliveryTasks;
  if (merchantId) {
    tasks = tasks.filter((task) => task.merchantId === merchantId);
  } else {
    tasks = filterBusiness(tasks, businessType);
  }
  if (status !== 'all') tasks = tasks.filter((task) => task.status === status);
  return wait(tasks);
}

function assignDelivery(data) {
  const task = state.deliveryTasks.find((item) => item.id === data.id);
  if (!task) return fail('商家自配任务不存在');
  task.riderName = data.riderName || '自配员';
  task.status = 'assigned';
  const order = state.orders.find((item) => item.id === task.orderId);
  if (order) order.status = 'delivery';
  return wait(task);
}

function completeDelivery(data) {
  const task = state.deliveryTasks.find((item) => item.id === data.id);
  if (!task) return fail('商家自配任务不存在');
  task.status = 'done';
  const order = state.orders.find((item) => item.id === task.orderId);
  if (order) order.status = 'completed';
  return wait(task);
}

function listAfterSales(data) {
  const merchantId = data.merchantId || '';
  const businessType = data.businessType || getDefaultBusinessType(data.merchantCategory);
  let items = state.afterSales;
  if (merchantId) {
    items = items.filter((item) => item.merchantId === merchantId);
  } else {
    items = filterBusiness(items, businessType);
  }
  return wait(items);
}

function updateAfterSale(data) {
  const item = state.afterSales.find((entry) => entry.id === data.id);
  if (!item) return fail('售后记录不存在');
  item.status = '已处理';
  item.result = data.result;
  const order = state.orders.find((entry) => entry.id === item.orderId);
  if (order) order.status = 'completed';
  return wait(item);
}

function getAnalytics(data) {
  const businessType = data.businessType || getDefaultBusinessType(data.merchantCategory);
  const products = filterBusiness(state.products, businessType);
  const orders = filterBusiness(state.orders, businessType);
  const completed = orders.filter((order) => ['completed', 'delivery'].includes(order.status));
  const totalSales = sum(completed, (order) => order.amount);
  const topProducts = [...products]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      percent: Math.max(18, Math.round((item.sales / Math.max(products[0].sales, 1)) * 100))
    }));

  return wait({
    summary: [
      { label: '销售额', value: `¥${totalSales.toFixed(1)}`, delta: '+12.8%' },
      { label: '订单数', value: orders.length, delta: '+6 单' },
      { label: '客单价', value: `¥${orders.length ? (sum(orders, (order) => order.amount) / orders.length).toFixed(1) : '0.0'}`, delta: '+3.1%' },
      { label: '履约完成率', value: '94%', delta: '+4.2%' }
    ],
    trend: [
      { label: '周一', value: 46, amount: 328 },
      { label: '周二', value: 58, amount: 420 },
      { label: '周三', value: 41, amount: 301 },
      { label: '周四', value: 72, amount: 526 },
      { label: '周五', value: 88, amount: 684 },
      { label: '周六', value: 63, amount: 473 },
      { label: '周日', value: 76, amount: 591 }
    ],
    topProducts,
    inventory: products.map((product) => ({
      name: product.name,
      stock: product.stock,
      status: product.stock <= 5 ? '需补货' : product.onSale ? '可售' : '下架'
    }))
  });
}

module.exports = {
  STATUS_LABELS,
  BUSINESS_LABELS,
  MERCHANT_UNITS,
  MERCHANT_GARDEN_UNITS,
  login,
  wechatLogin,
  bindPhone,
  updateMerchantStatus,
  listProducts,
  getProduct,
  saveProduct,
  adjustStock,
  toggleProduct,
  listOrders,
  getOrder,
  getOrderReceiver,
  updateOrderStatus,
  verifyPickup,
  listDeliveryTasks,
  assignDelivery,
  completeDelivery,
  listAfterSales,
  updateAfterSale,
  getAnalytics
};
