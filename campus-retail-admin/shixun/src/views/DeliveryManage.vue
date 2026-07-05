<template>
  <div class="page">
    <PageHeader title="配送管理" description="管理宿舍配送任务，支持分配配送员、更新配送状态和异常标记。" />
    <el-card shadow="never" class="search-card">
      <el-form :model="query" label-position="top">
        <el-form-item label="配送单号"><el-input v-model="query.deliveryNo" clearable placeholder="请输入配送单号" /></el-form-item>
        <el-form-item label="配送员"><el-input v-model="query.rider" clearable placeholder="请输入配送员" /></el-form-item>
        <el-form-item label="配送状态"><el-select v-model="query.status" clearable placeholder="全部"><el-option v-for="s in statuses" :key="s.value" :label="s.label" :value="s.value" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" :icon="Search" @click="search">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <span class="text-muted">共 {{ total }} 条配送任务</span>
        <el-button type="success" plain :icon="Download" @click="handleExport">导出 Excel</el-button>
      </div>
      <el-table :data="list" border>
        <el-table-column prop="deliveryNo" label="配送单号" min-width="150" />
        <el-table-column prop="orderNo" label="关联订单" min-width="150" />
        <el-table-column prop="receiver" label="收货人" width="100" />
        <el-table-column prop="dormAddress" label="宿舍地址" min-width="150" />
        <el-table-column prop="riderName" label="配送员" min-width="110" />
        <el-table-column prop="deliveryStatus" label="配送状态" width="110"><template #default="{ row }"><StatusTag :status="row.deliveryStatus" /></template></el-table-column>
        <el-table-column prop="estimatedArrivalAt" label="预计送达时间" min-width="160" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openAssign(row)">分配配送员</el-button>
            <el-button link type="success" @click="openStatus(row)">更新状态</el-button>
            <el-button link type="danger" @click="markError(row)">标记异常</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="loadData" /></div>
    </el-card>

    <el-dialog v-model="assignVisible" title="分配配送员" width="420px">
      <el-input v-model="assignForm.rider" placeholder="请输入配送员姓名" />
      <template #footer><el-button @click="assignVisible = false">取消</el-button><el-button type="primary" @click="saveAssign">保存</el-button></template>
    </el-dialog>
    <el-dialog v-model="statusVisible" title="更新配送状态" width="420px">
      <el-select v-model="statusForm.status" style="width: 100%"><el-option v-for="s in statuses" :key="s.value" :label="s.label" :value="s.value" /></el-select>
      <template #footer><el-button @click="statusVisible = false">取消</el-button><el-button type="primary" @click="saveStatus">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'
import StatusTag from '../components/StatusTag.vue'
import { assignDelivery, getDeliveryList, updateDeliveryStatus } from '../api/delivery'
import { exportExcel } from '../utils/exportExcel'
import { getPageList, getPageTotal } from '../utils/pageResult'

const statuses = [
  { label: '待分配', value: 'waiting' },
  { label: '配送中', value: 'delivering' },
  { label: '已送达', value: 'finished' },
  { label: '异常', value: '异常' }
]
const query = reactive({ deliveryNo: '', rider: '', status: '' })
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 8
const current = ref(null)
const assignVisible = ref(false)
const statusVisible = ref(false)
const assignForm = reactive({ rider: '' })
const statusForm = reactive({ status: '' })

const loadData = async () => {
  const res = await getDeliveryList({ ...query, page: page.value, pageSize })
  list.value = getPageList(res.data)
  total.value = getPageTotal(res.data)
}
const search = () => { page.value = 1; loadData() }
const reset = () => { Object.assign(query, { deliveryNo: '', rider: '', status: '' }); search() }
const openAssign = (row) => { current.value = row; assignForm.rider = row.riderName || ''; assignVisible.value = true }
const openStatus = (row) => { current.value = row; statusForm.status = row.deliveryStatus; statusVisible.value = true }
const saveAssign = async () => {
  if (!assignForm.rider.trim()) return ElMessage.warning('请输入配送员')
  await assignDelivery(current.value.id, assignForm)
  ElMessage.success('配送员已分配')
  assignVisible.value = false
  loadData()
}
const saveStatus = async () => {
  await updateDeliveryStatus(current.value.id, statusForm)
  ElMessage.success('配送状态已更新')
  statusVisible.value = false
  loadData()
}
const markError = async (row) => { await updateDeliveryStatus(row.id, { status: '异常' }); ElMessage.success('已标记异常'); loadData() }
const handleExport = () => {
  exportExcel({
    data: list.value,
    fileName: '配送任务',
    sheetName: '配送管理',
    columns: [
      { label: '配送单号', prop: 'deliveryNo' },
      { label: '关联订单', prop: 'orderNo' },
      { label: '收货人', prop: 'receiver' },
      { label: '宿舍地址', prop: 'dormAddress' },
      { label: '配送员', prop: 'riderName' },
      { label: '配送状态', prop: 'deliveryStatus' },
      { label: '预计送达时间', prop: 'estimatedArrivalAt' }
    ]
  })
}

loadData()
</script>
