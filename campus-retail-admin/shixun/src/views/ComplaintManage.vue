<template>
  <div class="page">
    <PageHeader title="售后投诉" description="基于售后记录处理用户提交的退款、退货、配送及订单问题。" />

    <el-card shadow="never" class="search-card">
      <el-form :model="query" label-position="top">
        <el-form-item label="售后编号">
          <el-input v-model="query.code" clearable placeholder="请输入售后编号" />
        </el-form-item>
        <el-form-item label="售后类型">
          <el-select v-model="query.type" clearable placeholder="全部">
            <el-option v-for="t in types" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="query.status" clearable placeholder="全部">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <span class="text-muted">共 {{ total }} 条售后投诉记录</span>
        <el-button type="success" plain :icon="Download" @click="handleExport">导出 Excel</el-button>
      </div>
      <el-table :data="list" border>
        <el-table-column prop="code" label="售后编号" min-width="150" />
        <el-table-column prop="complainantUserId" label="投诉人ID" width="110" />
        <el-table-column prop="type" label="售后类型" width="120" />
        <el-table-column prop="relatedObject" label="关联对象" min-width="170" />
        <el-table-column prop="summary" label="问题摘要" min-width="230" show-overflow-tooltip />
        <el-table-column prop="submittedAt" label="提交时间" min-width="160" />
        <el-table-column prop="status" label="处理状态" width="110">
          <template #default="{ row }"><StatusTag :status="row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">查看详情</el-button>
            <el-button link type="warning" @click="runComplaint(row)">AI 建议</el-button>
            <el-button link type="success" @click="openHandle(row)">处理售后</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="loadData" />
      </div>
    </el-card>

    <el-drawer v-model="detailVisible" title="售后详情" size="460px">
      <el-descriptions v-if="current" :column="1" border>
        <el-descriptions-item label="售后编号">{{ current.code }}</el-descriptions-item>
        <el-descriptions-item label="投诉人ID">{{ current.complainantUserId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="问题详情">{{ current.detail }}</el-descriptions-item>
        <el-descriptions-item label="处理结果" v-if="current.handleResult">
          <div class="timeline-result">
            <div v-for="(item, index) in formatHandleResult(current.handleResult)" :key="index">
              {{ item }}
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <AgentResult v-if="agentResult" :result="agentResult" class="drawer-agent" @use-reply="useReply" />
    </el-drawer>

    <el-dialog v-model="handleVisible" title="处理售后" width="520px">
      <div class="dialog-toolbar">
        <el-button type="primary" plain :loading="agentLoading" @click="runComplaint(current)">生成 AI 处理建议</el-button>
      </div>
      <AgentResult v-if="agentResult" :result="agentResult" compact @use-reply="useReply" />
      <el-input v-model="handleForm.result" type="textarea" :rows="5" placeholder="请输入处理结果" />
      <template #footer>
        <el-button @click="handleVisible = false">取消</el-button>
        <el-button type="primary" @click="saveHandle">提交处理</el-button>
      </template>
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
import { getComplaintList, handleComplaint } from '../api/complaint'
import { runComplaintAgent } from '../api/agent'
import { exportExcel } from '../utils/exportExcel'
import { getPageList, getPageTotal } from '../utils/pageResult'

const types = ['退款', '退货退款', '换货', '配送问题', '商品问题', '其他']
const query = reactive({ code: '', type: '', status: '' })
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 8
const current = ref(null)
const detailVisible = ref(false)
const handleVisible = ref(false)
const agentLoading = ref(false)
const agentResult = ref(null)
const handleForm = reactive({ result: '' })

const loadData = async () => {
  const res = await getComplaintList({ ...query, page: page.value, pageSize })
  list.value = getPageList(res.data)
  total.value = getPageTotal(res.data)
}

const search = () => {
  page.value = 1
  loadData()
}

const reset = () => {
  Object.assign(query, { code: '', type: '', status: '' })
  search()
}

const showDetail = (row) => {
  current.value = row
  detailVisible.value = true
}

const openHandle = (row) => {
  current.value = row
  handleForm.result = getEditableHandleResult(row.handleResult)
  agentResult.value = null
  handleVisible.value = true
}

const runComplaint = async (row) => {
  if (!row) return
  current.value = row
  agentLoading.value = true
  try {
    const res = await runComplaintAgent({ complaintId: row.id, question: '请基于售后记录生成处理建议和客服回复模板。' })
    agentResult.value = res.data
    if (!handleVisible.value) detailVisible.value = true
  } finally {
    agentLoading.value = false
  }
}

const useReply = (reply) => {
  handleForm.result = reply
  handleVisible.value = true
}

const formatHandleResult = (value) => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        const text = item.text || item.action || ''
        const time = formatTimelineTime(item.time)
        return time ? `${time}: ${text}` : text
      }).filter(Boolean)
    }
  } catch (error) {
    // Plain handled result text, not JSON timeline.
  }
  return [value]
}

const getEditableHandleResult = (value) => {
  if (!value) return ''
  try {
    JSON.parse(value)
    return ''
  } catch (error) {
    return value
  }
}

const formatTimelineTime = (time) => {
  if (!time) return ''
  const value = Number(time)
  if (!Number.isFinite(value)) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

const saveHandle = async () => {
  if (!handleForm.result.trim()) return ElMessage.warning('请填写处理结果')
  await handleComplaint(current.value.id, handleForm)
  ElMessage.success('售后已处理')
  handleVisible.value = false
  loadData()
}

const handleExport = () => {
  exportExcel({
    data: list.value,
    fileName: '售后投诉记录',
    sheetName: '售后投诉',
    columns: [
      { label: '售后编号', prop: 'code' },
      { label: '投诉人ID', prop: 'complainantUserId' },
      { label: '售后类型', prop: 'type' },
      { label: '关联对象', prop: 'relatedObject' },
      { label: '问题摘要', prop: 'summary' },
      { label: '提交时间', prop: 'submittedAt' },
      { label: '处理状态', prop: 'status' },
      { label: '处理结果', prop: 'handleResult' }
    ]
  })
}

loadData()
</script>

<style scoped>
.dialog-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.drawer-agent {
  margin-top: 16px;
}

.timeline-result {
  line-height: 1.7;
  word-break: break-word;
}
</style>
