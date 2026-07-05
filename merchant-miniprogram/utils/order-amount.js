function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function getOrderAmount(order) {
  if (!order || typeof order !== 'object') return 0;
  return hasValue(order.reward) ? order.reward : order.amount;
}

function withOrderAmount(order) {
  if (!order || typeof order !== 'object') return order;
  if (!hasOwn(order, 'reward') && !hasOwn(order, 'amount')) return order;
  return {
    ...order,
    amount: getOrderAmount(order)
  };
}

function isOrderObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return hasOwn(value, 'reward')
    || hasOwn(value, 'amount')
    || hasOwn(value, 'orderNo')
    || hasOwn(value, 'order_no')
    || hasOwn(value, 'pickupCode')
    || hasOwn(value, 'pickup_code');
}

function normalizeOrderAmountResponse(data) {
  if (Array.isArray(data)) return data.map(withOrderAmount);
  if (!data || typeof data !== 'object') return data;
  if (isOrderObject(data)) return withOrderAmount(data);

  const result = { ...data };
  ['records', 'list', 'rows', 'orders', 'items'].forEach((key) => {
    if (Array.isArray(result[key])) result[key] = result[key].map(withOrderAmount);
  });
  return result;
}

module.exports = {
  getOrderAmount,
  withOrderAmount,
  normalizeOrderAmountResponse
};