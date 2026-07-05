<template>
  <div class="page">
    <PageHeader title="活动公告" description="配置营销活动并发布面向用户、商家和配送员的运营公告。" />
    <el-card shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="活动配置" name="activity">
          <div class="table-toolbar">
            <span class="text-muted">管理满减、优惠券、拼团和限时特价活动</span>
            <div class="toolbar-actions">
              <el-button type="success" plain :icon="Download" @click="exportActivities">导出活动</el-button>
              <el-button type="primary" :icon="Plus" @click="openActivity()">新增活动</el-button>
            </div>
          </div>
          <el-table :data="activities" border>
            <el-table-column prop="name" label="活动名称" min-width="180" />
            <el-table-column prop="type" label="活动类型" width="120" />
            <el-table-column prop="startTime" label="开始时间" min-width="160" />
            <el-table-column prop="endTime" label="结束时间" min-width="160" />
            <el-table-column prop="status" label="状态" width="100"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column>
            <el-table-column label="操作" width="230" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openActivity(row)">编辑</el-button>
                <el-button link type="success" @click="toggleActivity(row)">{{ isEnabled(row.status) ? '停用' : '启用' }}</el-button>
                <el-button link type="danger" @click="removeActivity(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="activityTotal" :page-size="pageSize" v-model:current-page="activityPage" @current-change="loadActivities" /></div>
        </el-tab-pane>

        <el-tab-pane label="公告发布" name="notice">
          <div class="table-toolbar">
            <span class="text-muted">维护平台公告和分角色通知</span>
            <div class="toolbar-actions">
              <el-button type="success" plain :icon="Download" @click="exportNotices">导出公告</el-button>
              <el-button type="primary" :icon="Plus" @click="openNotice()">新增公告</el-button>
            </div>
          </div>
          <el-table :data="notices" border>
            <el-table-column prop="title" label="公告标题" min-width="220" />
            <el-table-column prop="target" label="发布对象" width="120" />
            <el-table-column prop="publishTime" label="发布时间" min-width="160" />
            <el-table-column prop="status" label="状态" width="100"><template #default="{ row }"><StatusTag :status="row.status" /></template></el-table-column>
            <el-table-column label="操作" width="230" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openNotice(row)">编辑</el-button>
                <el-button link type="success" @click="toggleNotice(row)">{{ isEnabled(row.status) ? '停用' : '启用' }}</el-button>
                <el-button link type="danger" @click="removeNotice(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="noticeTotal" :page-size="pageSize" v-model:current-page="noticePage" @current-change="loadNotices" /></div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="activityDialog" :title="activityForm.id ? '编辑活动' : '新增活动'" width="560px">
      <el-form :model="activityForm" label-width="90px">
        <el-form-item label="活动名称"><el-input v-model="activityForm.name" /></el-form-item>
        <el-form-item label="活动类型"><el-select v-model="activityForm.type" style="width: 100%"><el-option v-for="t in activityTypes" :key="t" :label="t" :value="t" /></el-select></el-form-item>
        <el-form-item label="开始时间"><el-input v-model="activityForm.startTime" placeholder="2026-06-29 00:00" /></el-form-item>
        <el-form-item label="结束时间"><el-input v-model="activityForm.endTime" placeholder="2026-07-05 23:59" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="activityForm.status"><el-radio-button label="启用" value="running" /><el-radio-button label="停用" value="end" /></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="activityDialog = false">取消</el-button><el-button type="primary" @click="saveActivity">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="noticeDialog" :title="noticeForm.id ? '编辑公告' : '新增公告'" width="560px">
      <el-form :model="noticeForm" label-width="90px">
        <el-form-item label="公告标题"><el-input v-model="noticeForm.title" /></el-form-item>
        <el-form-item label="发布对象"><el-select v-model="noticeForm.target" style="width: 100%"><el-option v-for="t in targets" :key="t" :label="t" :value="t" /></el-select></el-form-item>
        <el-form-item label="发布时间"><el-input v-model="noticeForm.publishTime" placeholder="2026-06-29 12:00" /></el-form-item>
        <el-form-item label="公告内容"><el-input v-model="noticeForm.content" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="noticeForm.status"><el-radio-button label="启用" value="show" /><el-radio-button label="停用" value="hide" /></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="noticeDialog = false">取消</el-button><el-button type="primary" @click="saveNotice">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Plus } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'
import StatusTag from '../components/StatusTag.vue'
import { createActivity, createNotice, deleteActivity, deleteNotice, getActivityList, getNoticeList, updateActivity, updateNotice } from '../api/activity'
import { exportExcel } from '../utils/exportExcel'
import { getPageList, getPageTotal } from '../utils/pageResult'

const activeTab = ref('activity')
const pageSize = 8
const activityPage = ref(1)
const noticePage = ref(1)
const activities = ref([])
const notices = ref([])
const activityTotal = ref(0)
const noticeTotal = ref(0)
const activityDialog = ref(false)
const noticeDialog = ref(false)
const activityTypes = ['满减', '优惠券', '拼团', '限时特价']
const targets = ['全部用户', '商家', '配送员']
const activityForm = reactive({ id: null, name: '', type: '满减', startTime: '', endTime: '', status: 'running' })
const noticeForm = reactive({ id: null, title: '', target: '全部用户', publishTime: '', status: 'show', content: '' })

const loadActivities = async () => {
  const res = await getActivityList({ page: activityPage.value, pageSize })
  activities.value = getPageList(res.data)
  activityTotal.value = getPageTotal(res.data)
}
const loadNotices = async () => {
  const res = await getNoticeList({ page: noticePage.value, pageSize })
  notices.value = getPageList(res.data)
  noticeTotal.value = getPageTotal(res.data)
}
const openActivity = (row) => {
  Object.assign(activityForm, row || { id: null, name: '', type: '满减', startTime: '', endTime: '', status: 'running' })
  activityDialog.value = true
}
const openNotice = (row) => {
  Object.assign(noticeForm, row || { id: null, title: '', target: '全部用户', publishTime: '', status: 'show', content: '' })
  noticeDialog.value = true
}
const saveActivity = async () => {
  if (!activityForm.name.trim()) return ElMessage.warning('请输入活动名称')
  activityForm.id ? await updateActivity(activityForm.id, activityForm) : await createActivity(activityForm)
  ElMessage.success('活动已保存')
  activityDialog.value = false
  loadActivities()
}
const saveNotice = async () => {
  if (!noticeForm.title.trim()) return ElMessage.warning('请输入公告标题')
  noticeForm.id ? await updateNotice(noticeForm.id, noticeForm) : await createNotice(noticeForm)
  ElMessage.success('公告已保存')
  noticeDialog.value = false
  loadNotices()
}
const isEnabled = (status) => ['启用', 'online', 'show', 'running'].includes(status)
const toggleActivity = async (row) => { await updateActivity(row.id, { ...row, status: isEnabled(row.status) ? 'end' : 'running' }); loadActivities() }
const toggleNotice = async (row) => { await updateNotice(row.id, { ...row, status: isEnabled(row.status) ? 'hide' : 'show' }); loadNotices() }
const removeActivity = async (row) => { await ElMessageBox.confirm(`确认删除活动「${row.name}」吗？`, '删除确认', { type: 'warning' }); await deleteActivity(row.id); ElMessage.success('已删除'); loadActivities() }
const removeNotice = async (row) => { await ElMessageBox.confirm(`确认删除公告「${row.title}」吗？`, '删除确认', { type: 'warning' }); await deleteNotice(row.id); ElMessage.success('已删除'); loadNotices() }
const exportActivities = () => {
  exportExcel({
    data: activities.value,
    fileName: '活动配置',
    sheetName: '活动配置',
    columns: [
      { label: '活动名称', prop: 'name' },
      { label: '活动类型', prop: 'type' },
      { label: '开始时间', prop: 'startTime' },
      { label: '结束时间', prop: 'endTime' },
      { label: '状态', prop: 'status' }
    ]
  })
}
const exportNotices = () => {
  exportExcel({
    data: notices.value,
    fileName: '公告发布',
    sheetName: '公告发布',
    columns: [
      { label: '公告标题', prop: 'title' },
      { label: '发布对象', prop: 'target' },
      { label: '发布时间', prop: 'publishTime' },
      { label: '状态', prop: 'status' },
      { label: '公告内容', prop: 'content' }
    ]
  })
}

loadActivities()
loadNotices()
</script>

<style scoped>
.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
</style>
