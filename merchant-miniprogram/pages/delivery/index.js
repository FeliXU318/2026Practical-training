const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    activeStatus: 'all',
    tabs: [
      { label: '全部', value: 'all' },
      { label: '待分配', value: 'new' },
      { label: '已分配', value: 'assigned' },
      { label: '自配中', value: 'delivering' },
      { label: '已完成', value: 'done' }
    ],
    riders: ['自配员阿宁', '自配员小周', '自配员林同学'],
    riderIndex: 0,
    tasks: []
  },

  onShow() {
    this.loadTasks();
  },

  onPullDownRefresh() {
    this.loadTasks().finally(() => wx.stopPullDownRefresh());
  },

  getBusinessType() {
    const session = wx.getStorageSync('merchantSession') || {};
    return session.profile ? session.profile.businessType : 'meiyuan-1';
  },

  loadTasks() {
    this.setData({ loading: true });
    return api.listDeliveryTasks({
      merchantId: api.getMerchantId(),
      businessType: this.getBusinessType(),
      status: this.data.activeStatus
    })
      .then((tasks) => {
        this.setData({ tasks, loading: false });
      })
      .catch((error) => {
        this.setData({ loading: false });
        api.toastError(error);
      });
  },

  changeTab(event) {
    this.setData({ activeStatus: event.currentTarget.dataset.status }, () => this.loadTasks());
  },

  handleRiderChange(event) {
    this.setData({ riderIndex: Number(event.detail.value) });
  },

  assignTask(event) {
    const id = event.currentTarget.dataset.id;
    api.assignDelivery({ id, riderName: this.data.riders[this.data.riderIndex] })
      .then(() => {
        wx.showToast({ title: '已安排自配人员', icon: 'success' });
        this.loadTasks();
      })
      .catch(api.toastError);
  },

  completeTask(event) {
    const id = event.currentTarget.dataset.id;
    wx.showModal({
      title: '完成自配',
      content: '确认该商家自配任务已送达并完成？',
      success: (res) => {
        if (!res.confirm) return;
        api.completeDelivery({ id })
          .then(() => {
            wx.showToast({ title: '自配已完成', icon: 'success' });
            this.loadTasks();
          })
          .catch(api.toastError);
      }
    });
  }
});
