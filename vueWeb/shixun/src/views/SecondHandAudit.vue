<template>
  <div class="page">
    <PageHeader title="二手商品" description="查看校园二手商品，并使用智能审核 Agent 辅助判断二手商品风险。" />
    <el-card shadow="never" class="search-card">
      <el-form :model="query" label-position="top">
        <el-form-item label="商品名称"><el-input v-model="query.name" clearable placeholder="请输入商品名称" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="query.category" clearable placeholder="如：教材书籍" /></el-form-item>
        <el-form-item label="销售状态">
          <el-select v-model="query.status" clearable placeholder="全部">
            <el-option label="在售" value="available" />
            <el-option label="已售/下架" value="sold" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" :icon="Search" @click="search">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <span class="text-muted">共 {{ total }} 条二手商品记录</span>
        <el-button type="success" plain :icon="Download" @click="handleExport">导出 Excel</el-button>
      </div>
      <el-table :data="list" border>
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="name" label="商品名称" min-width="160" />
        <el-table-column prop="category" label="分类" min-width="110" />
        <el-table-column prop="seller" label="卖家" min-width="100" />
        <el-table-column prop="price" label="价格" width="110"><template #default="{ row }">￥{{ row.price }}</template></el-table-column>
        <el-table-column prop="campus" label="校区" min-width="120" />
        <el-table-column prop="time" label="发布时间" min-width="150" />
        <el-table-column prop="auditStatus" label="销售状态" width="110"><template #default="{ row }"><StatusTag :status="row.auditStatus" /></template></el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link type="warning" :loading="agentLoadingId === row.id" @click="runAudit(row)">AI 建议</el-button>
            <el-button link type="success" :disabled="row.sold === false" @click="approve(row)">上架</el-button>
            <el-button link type="danger" :disabled="row.sold === true" @click="openReject(row)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="loadData" /></div>
    </el-card>

    <el-drawer v-model="detailVisible" title="二手商品详情" size="540px">
      <div v-if="current" class="detail">
        <el-image v-for="img in imageSources(current.image)" :key="img" :src="img" fit="cover" class="preview" />
        <el-descriptions :column="1" border>
          <el-descriptions-item label="商品名称">{{ current.name }}</el-descriptions-item>
          <el-descriptions-item label="卖家">{{ current.seller }}</el-descriptions-item>
          <el-descriptions-item label="价格">{{ current.price }}</el-descriptions-item>
          <el-descriptions-item label="原价">{{ current.originalPrice }}</el-descriptions-item>
          <el-descriptions-item label="详情">{{ current.description }}</el-descriptions-item>
        </el-descriptions>
        <div class="agent-toolbar">
          <el-button type="primary" plain :loading="agentLoadingId === current?.id" @click="runAudit(current)">生成 AI 审核建议</el-button>
        </div>
        <AgentResult v-if="agentResult" :result="agentResult" title="二手审核 Agent" />
      </div>
    </el-drawer>

    <el-dialog v-model="rejectVisible" title="确认下架" width="420px">
      <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="可填写下架原因" />
      <template #footer><el-button @click="rejectVisible = false">取消</el-button><el-button type="danger" @click="reject">确认下架</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'
import StatusTag from '../components/StatusTag.vue'
import AgentResult from '../components/AgentResult.vue'
import { approveSecondHand, getSecondHandAuditList, rejectSecondHand } from '../api/secondhand'
import { runAuditAgent } from '../api/agent'
import { exportExcel } from '../utils/exportExcel'
import { getPageList, getPageTotal } from '../utils/pageResult'

const query = reactive({ name: '', category: '', status: '' })
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 8
const current = ref(null)
const detailVisible = ref(false)
const rejectVisible = ref(false)
const rejectReason = ref('')
const agentResult = ref(null)
const agentLoadingId = ref(null)

const loadData = async () => {
  const res = await getSecondHandAuditList({ ...query, page: page.value, pageSize })
  list.value = getPageList(res.data)
  total.value = getPageTotal(res.data)
}
const search = () => { page.value = 1; loadData() }
const reset = () => { Object.assign(query, { name: '', category: '', status: '' }); search() }
const showDetail = (row) => { current.value = row; detailVisible.value = true; agentResult.value = null }
const imageSources = (image) => {
  if (Array.isArray(image)) return image
  if (!image) return []
  try {
    const parsed = JSON.parse(image)
    return Array.isArray(parsed) ? parsed : [image]
  } catch {
    return [image]
  }
}
const runAudit = async (row) => {
  if (!row) return
  current.value = row
  agentLoadingId.value = row.id
  try {
    const res = await runAuditAgent({ type: 'secondhand', id: row.id, question: '请给出二手商品审核建议。' })
    agentResult.value = res.data
    detailVisible.value = true
  } finally {
    agentLoadingId.value = null
  }
}
const approve = async (row) => { await approveSecondHand(row.id); ElMessage.success('已上架'); loadData() }
const openReject = (row) => { current.value = row; rejectReason.value = ''; rejectVisible.value = true }
const reject = async () => {
  await rejectSecondHand(current.value.id, { reason: rejectReason.value })
  ElMessage.success('已下架')
  rejectVisible.value = false
  loadData()
}
const handleExport = () => {
  exportExcel({
    data: list.value,
    fileName: '二手商品记录',
    sheetName: '二手商品',
    columns: [
      { label: 'ID', prop: 'id' },
      { label: '商品名称', prop: 'name' },
      { label: '分类', prop: 'category' },
      { label: '卖家', prop: 'seller' },
      { label: '价格', prop: 'price' },
      { label: '校区', prop: 'campus' },
      { label: '发布时间', prop: 'time' },
      { label: '销售状态', prop: 'auditStatus' }
    ]
  })
}

loadData()
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview {
  width: 240px;
  height: 160px;
  border-radius: 8px;
}

.agent-toolbar {
  display: flex;
  justify-content: flex-end;
}
</style>
