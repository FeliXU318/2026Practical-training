<template>
  <div class="page">
    <PageHeader title="订单管理" description="查询 orders 表中的订单、跑腿和售后关联信息，并调整订单状态。" />
    <el-card shadow="never" class="search-card">
      <el-form :model="query" label-position="top">
        <el-form-item label="订单编号"><el-input v-model="query.orderNo" clearable placeholder="请输入订单编号" /></el-form-item>
        <el-form-item label="订单类型"><el-input v-model="query.type" clearable placeholder="请输入订单类型" /></el-form-item>
        <el-form-item label="订单状态"><el-select v-model="query.status" clearable placeholder="全部"><el-option v-for="s in statuses" :key="s" :label="s" :value="s" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" :icon="Search" @click="search">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <span class="text-muted">共 {{ total }} 条订单记录</span>
        <el-button type="success" plain :icon="Download" @click="handleExport">导出 Excel</el-button>
      </div>
      <el-table :data="list" border>
        <el-table-column prop="orderNo" label="订单编号" min-width="120" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="merchantId" label="商家ID" width="100" />
        <el-table-column prop="orderType" label="订单类型" width="110" />
        <el-table-column prop="amount" label="金额" width="100"><template #default="{ row }">￥{{ row.amount }}</template></el-table-column>
        <el-table-column prop="payStatus" label="支付状态" width="110" />
        <el-table-column prop="fulfillType" label="配送方式" width="120" />
        <el-table-column prop="orderStatus" label="订单状态" width="110"><template #default="{ row }"><StatusTag :status="row.orderStatus" /></template></el-table-column>
        <el-table-column prop="time" label="时间" min-width="140" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">查看详情</el-button>
            <el-button link type="success" @click="openStatus(row)">修改状态</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="loadData" /></div>
    </el-card>

    <el-dialog v-model="detailVisible" title="订单详情" width="520px">
      <el-descriptions v-if="current" :column="1" border>
        <el-descriptions-item label="订单编号">{{ current.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ current.userId }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ current.title }}</el-descriptions-item>
        <el-descriptions-item label="内容">{{ current.item }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ current.address }}</el-descriptions-item>
        <el-descriptions-item label="悬赏">{{ current.reward }}</el-descriptions-item>
        <el-descriptions-item label="售后ID">{{ current.afterSaleId }}</el-descriptions-item>
        <el-descriptions-item label="订单状态"><StatusTag :status="current.orderStatus" /></el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    <el-dialog v-model="statusVisible" title="修改订单状态" width="420px">
      <el-select v-model="statusForm.status" style="width: 100%"><el-option v-for="s in statuses" :key="s" :label="s" :value="s" /></el-select>
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
import { getOrderList, updateOrderStatus } from '../api/order'
import { exportExcel } from '../utils/exportExcel'
import { getPageList, getPageTotal } from '../utils/pageResult'

const statuses = ['pending', 'paid', 'delivering', 'finished', 'cancelled', 'refund']
const query = reactive({ orderNo: '', phone: '', type: '', status: '' })
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 8
const current = ref(null)
const detailVisible = ref(false)
const statusVisible = ref(false)
const statusForm = reactive({ status: '' })

const loadData = async () => {
  const res = await getOrderList({ ...query, page: page.value, pageSize })
  list.value = getPageList(res.data)
  total.value = getPageTotal(res.data)
}
const search = () => { page.value = 1; loadData() }
const reset = () => { Object.assign(query, { orderNo: '', phone: '', type: '', status: '' }); search() }
const showDetail = (row) => { current.value = row; detailVisible.value = true }
const openStatus = (row) => { current.value = row; statusForm.status = row.orderStatus; statusVisible.value = true }
const saveStatus = async () => {
  await updateOrderStatus(current.value.id, statusForm)
  ElMessage.success('订单状态已更新')
  statusVisible.value = false
  loadData()
}
const handleExport = () => {
  exportExcel({
    data: list.value,
    fileName: '订单记录',
    sheetName: '订单管理',
    columns: [
      { label: '订单编号', prop: 'orderNo' },
      { label: '用户ID', prop: 'userId' },
      { label: '商家ID', prop: 'merchantId' },
      { label: '订单类型', prop: 'orderType' },
      { label: '金额', prop: 'amount' },
      { label: '支付状态', prop: 'payStatus' },
      { label: '配送方式', prop: 'fulfillType' },
      { label: '订单状态', prop: 'orderStatus' },
      { label: '内容', prop: 'item' }
    ]
  })
}

loadData()
</script>
