const api = require('../../utils/api');

const CONVENIENCE_UNITS = api.merchantUnits || [
  { label: '梅园1栋', value: 'meiyuan-1' },
  { label: '竹园1栋', value: 'zhuyuan-1' },
  { label: '博士生公寓楼', value: 'doctor-apartment' }
];

const FRUIT_GARDEN_UNITS = api.merchantGardenUnits || [
  { label: '梅园', value: 'meiyuan' },
  { label: '竹园', value: 'zhuyuan' },
  { label: '兰园', value: 'lanyuan' },
  { label: '荷园', value: 'heyuan' },
  { label: '松园', value: 'songyuan' }
];

const MERCHANT_TYPES = [
  { label: '便利店商家', value: 'convenience', icon: '店', storeName: '便利店' },
  { label: '水果商家', value: 'fruit', icon: '果', storeName: '水果店' }
];

function getUnitsByMerchantType(merchantType) {
  return merchantType === 'fruit' ? FRUIT_GARDEN_UNITS : CONVENIENCE_UNITS;
}

const PHONE_PATTERN = /^1[3-9]\d{9}$/;

Page({
  data: {
    typeIndex: 0,
    typeOptions: CONVENIENCE_UNITS.map((item) => item.label),
    locationPickerText: '切换楼栋',
    merchantTypes: MERCHANT_TYPES,
    merchantTypeIndex: 0,
    loginMode: 'phone',
    phone: '',
    password: '',
    loading: false,
    binding: false,
    loginStep: 'wechat',
    tempSession: null
  },

  onLoad() {
    const session = wx.getStorageSync('merchantSession');
    if (session && session.token) {
      wx.switchTab({ url: '/pages/orders/index' });
    }
  },

  handleLoginModeChange(event) {
    this.setData({ loginMode: event.currentTarget.dataset.mode });
  },

  handleLoginInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [field]: event.detail.value });
  },

  loginWithPhone() {
    if (this.data.loading) return;
    const phone = this.data.phone.trim();
    const password = this.data.password.trim();
    if (!phone || !password) {
      wx.showToast({ title: '请输入手机号和密码', icon: 'none' });
      return;
    }
    if (!PHONE_PATTERN.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    const registerProfile = this.buildRegisterProfile(phone);
    this.setData({ loading: true });
    api.login({
      phone,
      account: phone,
      password,
      autoRegister: true,
      registerOnLogin: true,
      ...registerProfile
    })
      .then((session) => {
        const storedSession = this.storeSession(session, registerProfile);
        this.setData({ loading: false });
        wx.showToast({ title: storedSession.registered ? '注册成功' : '登录成功', icon: 'success' });
        wx.switchTab({ url: '/pages/orders/index' });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  handleTypeChange(event) {
    this.setData({ typeIndex: Number(event.detail.value) });
  },

  handleMerchantTypeChange(event) {
    const merchantTypeIndex = Number(event.currentTarget.dataset.index);
    const merchantType = MERCHANT_TYPES[merchantTypeIndex] || MERCHANT_TYPES[0];
    const units = getUnitsByMerchantType(merchantType.value);
    this.setData({
      merchantTypeIndex,
      typeIndex: 0,
      typeOptions: units.map((item) => item.label),
      locationPickerText: merchantType.value === 'fruit' ? '切换园区' : '切换楼栋'
    });
  },

  getSelectedUnit() {
    const units = getUnitsByMerchantType(this.getSelectedMerchantType());
    return units[this.data.typeIndex] || units[0];
  },

  getSelectedMerchantTypeItem() {
    return MERCHANT_TYPES[this.data.merchantTypeIndex] || MERCHANT_TYPES[0];
  },

  getSelectedBusinessType() {
    return this.getSelectedUnit().value;
  },

  getSelectedMerchantType() {
    return this.getSelectedMerchantTypeItem().value;
  },

  buildRegisterProfile(manager) {
    const unit = this.getSelectedUnit();
    const merchantType = this.getSelectedMerchantTypeItem();
    return {
      businessType: unit.value,
      businessLabel: unit.label,
      dormBuilding: unit.label,
      merchantCategory: merchantType.value,
      merchantCategoryLabel: merchantType.label,
      merchantName: `${unit.label}${merchantType.storeName}`,
      manager
    };
  },

  normalizeSession(session, selectedProfile) {
    const source = session || {};
    const profile = source.profile || {};
    const selected = selectedProfile || {};
    const merchantCategory = selected.merchantCategory || profile.merchantCategory || 'convenience';
    const defaultBusinessType = merchantCategory === 'fruit' ? 'meiyuan' : 'meiyuan-1';
    return {
      ...source,
      profile: {
        ...profile,
        businessType: selected.businessType || profile.businessType || defaultBusinessType,
        businessLabel: selected.businessLabel || profile.businessLabel || selected.dormBuilding || '',
        dormBuilding: selected.dormBuilding || profile.dormBuilding || selected.businessLabel || '',
        merchantCategory,
        merchantCategoryLabel: selected.merchantCategoryLabel || profile.merchantCategoryLabel || '便利店商家',
        merchantName: selected.merchantName || profile.merchantName || '校园商户',
        manager: selected.manager || profile.manager || ''
      }
    };
  },

  storeSession(session, selectedProfile) {
    const normalizedSession = this.normalizeSession(session, selectedProfile);
    const app = getApp();
    app.globalData.session = normalizedSession;
    wx.setStorageSync('merchantSession', normalizedSession);
    return normalizedSession;
  },

  loginWithWechat() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    wx.login({
      success: (res) => {
        this.exchangeWechatCode(res.code || 'mock-wechat-code');
      },
      fail: () => {
        this.exchangeWechatCode('mock-wechat-code');
      }
    });
  },

  exchangeWechatCode(code) {
    api.wechatLogin({ code })
      .then((tempSession) => {
        this.setData({
          loading: false,
          loginStep: 'phone',
          tempSession
        });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  bindPhone(event) {
    if (this.data.binding) return;
    const detail = event.detail || {};
    if (detail.errMsg && detail.errMsg.indexOf('fail') >= 0) {
      wx.showToast({ title: '手机号授权未完成', icon: 'none' });
      return;
    }
    this.completePhoneBind({ phoneCode: detail.code || '', encryptedData: detail.encryptedData || '' });
  },

  bindMockPhone() {
    this.completePhoneBind({ mockPhone: '13800000000' });
  },

  completePhoneBind(payload) {
    if (!this.data.tempSession || !this.data.tempSession.loginToken) {
      wx.showToast({ title: '请先微信登录', icon: 'none' });
      return;
    }
    if (this.data.merchantTypeIndex < 0) {
      wx.showToast({ title: '请选择商家类型', icon: 'none' });
      return;
    }

    const selectedProfile = this.buildRegisterProfile('微信商户');
    this.setData({ binding: true });
    api.bindPhone({
      ...payload,
      loginToken: this.data.tempSession.loginToken,
      businessType: selectedProfile.businessType,
      merchantCategory: selectedProfile.merchantCategory
    })
      .then((session) => {
        this.storeSession({
          ...session,
          openid: session.openid || this.data.tempSession.openid || ''
        }, selectedProfile);
        wx.showToast({ title: '绑定成功', icon: 'success' });
        this.setData({ binding: false });
        wx.switchTab({ url: '/pages/orders/index' });
      })
      .catch((error) => {
        this.setData({ binding: false });
        api.toastError(error);
      });
  }
});