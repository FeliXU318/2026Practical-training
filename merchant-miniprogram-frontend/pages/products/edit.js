const api = require('../../utils/api');

const CATEGORY_MAP = {
  convenience: ['零食饮料', '文具日用', '生活百货', '校园补给', '水果单品', '果切套餐', '组合套餐'],
  fruit: ['水果单品', '果切套餐', '组合套餐']
};

const PRODUCT_TYPE_MAP = {
  convenience: 'supermarket',
  fruit: 'fruit'
};

Page({
  data: {
    loading: false,
    saving: false,
    uploading: false,
    isEdit: false,
    isFruit: false,
    categories: CATEGORY_MAP.convenience,
    categoryIndex: 0,
    tagText: '',
    form: {
      id: '',
      businessType: 'meiyuan-1',
      product_type: 'supermarket',
      name: '',
      category: '零食饮料',
      price: '',
      stock: '',
      description: '',
      imageUrl: '',
      onSale: true
    }
  },

  onLoad(options) {
    const businessType = this.getBusinessType();
    const merchantCategory = this.getMerchantCategory();
    const categories = this.getCategories(merchantCategory);
    this.setData({
      categories,
      isFruit: merchantCategory === 'fruit',
      'form.businessType': businessType,
      'form.product_type': this.getProductType(merchantCategory),
      'form.category': categories[0]
    });
    if (options.id) this.loadProduct(options.id);
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

  getProductType(merchantCategory) {
    return PRODUCT_TYPE_MAP[merchantCategory] || PRODUCT_TYPE_MAP.convenience;
  },

  getCategories(merchantCategory) {
    return CATEGORY_MAP[merchantCategory] || CATEGORY_MAP.convenience;
  },

  loadProduct(id) {
    this.setData({ loading: true });
    api.getProduct({ id })
      .then((product) => {
        const merchantCategory = this.getMerchantCategory();
        const categories = this.getCategories(merchantCategory);
        const category = categories.includes(product.category) ? product.category : categories[0];
        const categoryIndex = Math.max(0, categories.indexOf(category));
        this.setData({
          loading: false,
          isEdit: true,
          isFruit: merchantCategory === 'fruit',
          categories,
          categoryIndex,
          tagText: (product.tags || []).join('、'),
          form: {
            id: product.id,
            businessType: product.businessType || this.getBusinessType(),
            product_type: this.getProductType(merchantCategory),
            name: product.name,
            category,
            price: String(product.price),
            stock: String(product.stock),
            description: product.description || '',
            imageUrl: product.imageUrl || '',
            onSale: product.onSale,
            imageTone: product.imageTone,
            sales: product.sales
          }
        });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  handleInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  handleTagInput(event) {
    this.setData({ tagText: event.detail.value });
  },

  handleCategoryChange(event) {
    const categoryIndex = Number(event.detail.value);
    this.setData({
      categoryIndex,
      'form.category': this.data.categories[categoryIndex]
    });
  },

  handleSwitch(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  chooseProductPhoto() {
    if (this.data.uploading) return;

    const uploadPickedPhoto = (filePath) => {
      if (!filePath) return;
      this.setData({ uploading: true });
      api.uploadProductPhoto(filePath)
        .then((imageUrl) => {
          this.setData({ 'form.imageUrl': imageUrl });
        })
        .catch(api.toastError)
        .finally(() => {
          this.setData({ uploading: false });
        });
    };

    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'],
        success: (res) => {
          const file = (res.tempFiles && res.tempFiles[0]) || {};
          uploadPickedPhoto(file.tempFilePath);
        }
      });
      return;
    }

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        uploadPickedPhoto(res.tempFilePaths && res.tempFilePaths[0]);
      }
    });
  },

  previewProductPhoto() {
    const imageUrl = this.data.form.imageUrl;
    if (!imageUrl) return;
    wx.previewImage({
      current: imageUrl,
      urls: [imageUrl]
    });
  },

  removeProductPhoto() {
    this.setData({ 'form.imageUrl': '' });
  },

  saveProduct() {
    if (this.data.saving) return;
    const form = this.data.form;
    if (!form.name.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      wx.showToast({ title: '请输入有效售价', icon: 'none' });
      return;
    }
    if (form.stock === '' || Number(form.stock) < 0) {
      wx.showToast({ title: '请输入有效库存', icon: 'none' });
      return;
    }
    if (form.onSale && !form.imageUrl) {
      wx.showToast({ title: '请上传商品照片', icon: 'none' });
      return;
    }

    const tags = this.data.tagText
      .split(/[、,，\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);
    const merchantCategory = this.getMerchantCategory();

    this.setData({ saving: true });
    api.saveProduct({
      ...form,
      merchantId: api.getMerchantId(),
      businessType: this.getBusinessType(),
      merchantCategory,
      product_type: this.getProductType(merchantCategory),
      name: form.name.trim(),
      description: (form.description || '').trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      tags
    })
      .then(() => {
        wx.showToast({ title: '已保存', icon: 'success' });
        setTimeout(() => wx.navigateBack(), 350);
      })
      .catch(api.toastError)
      .finally(() => {
        this.setData({ saving: false });
      });
  }
});