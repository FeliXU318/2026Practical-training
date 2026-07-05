<template>
  <div class="page">
    <PageHeader title="商品审核" description="查看商品基础信息，并使用智能审核 Agent 辅助判断商品风险。" />
    <el-card shadow="never" class="search-card">
      <el-form :model="query" label-position="top">
        <el-form-item label="商品名称"><el-input v-model="query.name" clearable placeholder="请输入商品名称" /></el-form-item>
        <el-form-item label="商品类型"><el-input v-model="query.type" clearable placeholder="请输入商品类型" /></el-form-item>
        <el-form-item label="商品标记">
          <el-select v-model="query.status" clearable placeholder="全部">
            <el-option label="待处理" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" :icon="Search" @click="search">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <span class="text-muted">共 {{ total }} 条商品记录</span>
        <el-button type="success" plain :icon="Download" @click="handleExport">导出 Excel</el-button>
      </div>
      <el-table :data="list" border>
        <el-table-column prop="productId" label="商品ID" width="100" />
        <el-table-column prop="name" label="商品名称" min-width="150" />
        <el-table-column prop="category" label="分类" min-width="120" />
        <el-table-column prop="type" label="商品类型" min-width="120" />
        <el-table-column prop="merchantId" label="商家ID" width="100" />
        <el-table-column prop="price" label="价格" width="100"><template #default="{ row }">￥{{ row.price }}</template></el-table-column>
        <el-table-column prop="stock" label="库存" width="90" />
        <el-table-column prop="sales" label="销量" width="90" />
        <el-table-column prop="auditStatus" label="标记状态" width="110"><template #default="{ row }"><StatusTag :status="row.auditStatus" /></template></el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">详情</el-button>
            <el-button link type="warning" :loading="agentLoadingId === row.productId" @click="runAudit(row)">AI 建议</el-button>
            <el-button link type="success" :disabled="!canAudit(row.auditStatus)" @click="approve(row)">通过</el-button>
            <el-button link type="danger" :disabled="!canAudit(row.auditStatus)" @click="openReject(row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination"><el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="loadData" /></div>
    </el-card>

    <el-drawer v-model="detailVisible" title="商品详情" size="520px">
      <el-descriptions v-if="current" :column="1" border>
        <el-descriptions-item label="商品ID">{{ current.productId }}</el-descriptions-item>
        <el-descriptions-item label="商品名称">{{ current.name }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ current.category }}</el-descriptions-item>
        <el-descriptions-item label="单位">{{ current.unit }}</el-descriptions-item>
        <el-descriptions-item label="价格">{{ current.price }}</el-descriptions-item>
        <el-descriptions-item label="原价">{{ current.originalPrice }}</el-descriptions-item>
        <el-descriptions-item label="图片">{{ current.image }}</el-descriptions-item>
      </el-descriptions>
      <div class="agent-toolbar">
        <el-button type="primary" plain :loading="agentLoadingId === current?.productId" @click="runAudit(current)">生成 AI 审核建议</el-button>
      </div>
      <AgentResult v-if="agentResult" :result="agentResult" title="商品审核 Agent" />
    </el-drawer>

    <el-dialog v-model="rejectVisible" title="填写驳回原因" width="420px">
      <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请输入驳回原因" />
      <template #footer><el-button @click="rejectVisible = false">取消</el-button><el-button type="danger" @click="reject">确认驳回</el-button></template>
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
import { approveProduct, getAuditProducts, rejectProduct } from '../api/product'
import { runAuditAgent } from '../api/agent'
import { exportExcel } from '../utils/exportExcel'
import { getPageList, getPageTotal } from '../utils/pageResult'

const query = reactive({ name: '', type: '', status: '' })
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
  const res = await getAuditProducts({ ...query, page: page.value, pageSize })
  list.value = getPageList(res.data)
  total.value = getPageTotal(res.data)
}
const search = () => { page.value = 1; loadData() }
const reset = () => { Object.assign(query, { name: '', type: '', status: '' }); search() }
const showDetail = (row) => { current.value = row; detailVisible.value = true; agentResult.value = null }
const canAudit = (status) => !['approved', 'rejected'].includes(status)
const runAudit = async (row) => {
  if (!row) return
  current.value = row
  agentLoadingId.value = row.productId
  try {
    const res = await runAuditAgent({ type: 'product', id: row.productId, question: '请给出商品审核建议。' })
    agentResult.value = res.data
    detailVisible.value = true
  } finally {
    agentLoadingId.value = null
  }
}
const approve = async (row) => { await approveProduct(row.productId); ElMessage.success('已通过'); loadData() }
const openReject = (row) => { current.value = row; rejectReason.value = ''; rejectVisible.value = true }
const reject = async () => {
  if (!rejectReason.value.trim()) return ElMessage.warning('请填写驳回原因')
  await rejectProduct(current.value.productId, { reason: rejectReason.value })
  ElMessage.success('已驳回')
  rejectVisible.value = false
  loadData()
}
const handleExport = () => {
  exportExcel({
    data: list.value,
    fileName: '商品记录',
    sheetName: '商品记录',
    columns: [
      { label: '商品ID', prop: 'productId' },
      { label: '商品名称', prop: 'name' },
      { label: '分类', prop: 'category' },
      { label: '商品类型', prop: 'type' },
      { label: '商家ID', prop: 'merchantId' },
      { label: '价格', prop: 'price' },
      { label: '库存', prop: 'stock' },
      { label: '销量', prop: 'sales' },
      { label: '标记状态', prop: 'auditStatus' }
    ]
  })
}

loadData()
</script>

<style scoped>
.agent-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: 14px 0;
}
</style>
