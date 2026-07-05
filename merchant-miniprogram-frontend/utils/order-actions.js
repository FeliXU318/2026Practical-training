function buildOrderActions(order) {
  if (!order) return [];
  if (order.status === 'pending') {
    return [{ text: '接单备货', status: 'preparing', primary: true }];
  }
  if (order.status === 'preparing') {
    if (order.deliveryMethod === 'pickup') {
      return [{ text: '标记待自提', status: 'ready', primary: true }];
    }
    return [{ text: '安排商家自配', status: 'delivery', primary: true }];
  }
  if (order.status === 'ready') {
    return [{ text: '核销取货', status: 'verify', primary: true }];
  }
  if (order.status === 'delivery') {
    return [{ text: '完成自配', status: 'completed', primary: true }];
  }
  if (order.status === 'aftersale') {
    return [{ text: '处理售后', status: 'aftersale', primary: false }];
  }
  return [];
}

function buildTimeline(order) {
  if (!order) return [];
  const steps = order.deliveryMethod === 'pickup'
    ? [
      { status: 'pending', label: '待处理' },
      { status: 'preparing', label: '备货中' },
      { status: 'ready', label: '待自提' },
      { status: 'completed', label: '已完成' }
    ]
    : [
      { status: 'pending', label: '待处理' },
      { status: 'preparing', label: '备货中' },
      { status: 'delivery', label: '配送中' },
      { status: 'completed', label: '已完成' }
    ];
  const rawIndex = steps.findIndex((item) => item.status === order.status);
  const currentIndex = order.status === 'completed' || order.status === 'aftersale' ? steps.length - 1 : Math.max(0, rawIndex);
  return steps.map((item, index) => ({
    ...item,
    active: index === currentIndex,
    done: index < currentIndex || order.status === 'completed'
  }));
}

module.exports = {
  buildOrderActions,
  buildTimeline
};
