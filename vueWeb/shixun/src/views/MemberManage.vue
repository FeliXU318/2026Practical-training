<template>
  <div class="page">
    <PageHeader title="用户管理" description="查看会员等级、积分成长、消费与签到情况，并追踪积分和成长值流水。" />

    <el-card shadow="never" class="search-card">
      <el-form :model="query" label-position="top">
        <el-form-item label="用户ID">
          <el-input-number v-model="query.userId" :min="1" controls-position="right" placeholder="全部" />
        </el-form-item>
        <el-form-item label="会员等级">
          <el-select v-model="query.level" clearable placeholder="全部">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="member-summary">
      <el-card shadow="never">
        <span>会员总数</span>
        <strong>{{ total }}</strong>
      </el-card>
      <el-card shadow="never">
        <span>当前页总积分</span>
        <strong>{{ formatNumber(pagePoints) }}</strong>
      </el-card>
      <el-card shadow="never">
        <span>当前页总成长值</span>
        <strong>{{ formatNumber(pageGrowth) }}</strong>
      </el-card>
      <el-card shadow="never">
        <span>当前页累计消费</span>
        <strong>{{ formatMoney(pageSpend) }}</strong>
      </el-card>
    </div>

    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <span class="text-muted">共 {{ total }} 条会员记录</span>
        <el-button type="success" plain :icon="Download" @click="handleExport">导出 Excel</el-button>
      </div>
      <el-table :data="list" border>
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="level" label="等级" width="130">
          <template #default="{ row }">
            <el-tag :type="levelTag(row.level)">{{ levelName(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="130">
          <template #default="{ row }">{{ formatNumber(row.points) }}</template>
        </el-table-column>
        <el-table-column prop="growth" label="成长值" width="130">
          <template #default="{ row }">{{ formatNumber(row.growth) }}</template>
        </el-table-column>
        <el-table-column prop="totalSpend" label="累计消费" width="150">
          <template #default="{ row }">{{ formatMoney(row.totalSpend) }}</template>
        </el-table-column>
        <el-table-column prop="checkinDate" label="最近签到" min-width="140">
          <template #default="{ row }">{{ row.checkinDate || '-' }}</template>
        </el-table-column>
        <el-table-column prop="continuousCheckin" label="连续签到" width="120">
          <template #default="{ row }">{{ row.continuousCheckin || 0 }} 天</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showDetail(row)">查看流水</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination layout="total, prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="page" @current-change="loadData" />
      </div>
    </el-card>

    <el-drawer v-model="detailVisible" title="会员详情" size="620px">
      <el-descriptions v-if="current" :column="1" border>
        <el-descriptions-item label="用户ID">{{ current.userId }}</el-descriptions-item>
        <el-descriptions-item label="会员等级">{{ levelName(current) }}</el-descriptions-item>
        <el-descriptions-item label="积分">{{ formatNumber(current.points) }}</el-descriptions-item>
        <el-descriptions-item label="成长值">{{ formatNumber(current.growth) }}</el-descriptions-item>
        <el-descriptions-item label="累计消费">{{ formatMoney(current.totalSpend) }}</el-descriptions-item>
        <el-descriptions-item label="连续签到">{{ current.continuousCheckin || 0 }} 天</el-descriptions-item>
      </el-descriptions>

      <div class="record-header">
        <h3>积分/成长值流水</h3>
        <el-select v-model="recordQuery.type" clearable placeholder="全部类型" size="small" @change="loadRecords">
          <el-option label="积分" value="points" />
          <el-option label="成长值" value="growth" />
        </el-select>
      </div>

      <el-table :data="records" border>
        <el-table-column prop="recordId" label="流水号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">{{ recordType(row.type) }}</template>
        </el-table-column>
        <el-table-column prop="change" label="变动" width="90">
          <template #default="{ row }">
            <span :class="{ positive: Number(row.change) > 0, negative: Number(row.change) < 0 }">{{ signedNumber(row.change) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="100" />
        <el-table-column prop="reason" label="原因" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ readableReason(row.reason) }}</template>
        </el-table-column>
        <el-table-column prop="orderId" label="订单ID" width="100">
          <template #default="{ row }">{{ row.orderId || '-' }}</template>
        </el-table-column>
        <el-table-column prop="time" label="时间" min-width="160" />
      </el-table>
      <div class="pagination">
        <el-pagination layout="total, prev, pager, next" :total="recordTotal" :page-size="recordPageSize" v-model:current-page="recordPage" @current-change="loadRecords" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Download, Search } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'
import { getMemberList, getMemberRecordList } from '../api/member'
import { exportExcel } from '../utils/exportExcel'
import { getPageList, getPageTotal } from '../utils/pageResult'

const levelOptions = [
  { label: '普通会员', value: 'normal' },
  { label: '银卡会员', value: 'silver' },
  { label: '金卡会员', value: 'gold' },
  { label: '钻石会员', value: 'diamond' }
]

const query = reactive({ userId: null, level: '' })
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const current = ref(null)
const detailVisible = ref(false)
const records = ref([])
const recordTotal = ref(0)
const recordPage = ref(1)
const recordPageSize = 8
const recordQuery = reactive({ type: '' })

const pagePoints = computed(() => list.value.reduce((sum, item) => sum + Number(item.points || 0), 0))
const pageGrowth = computed(() => list.value.reduce((sum, item) => sum + Number(item.growth || 0), 0))
const pageSpend = computed(() => list.value.reduce((sum, item) => sum + Number(item.totalSpend || 0), 0))

const levelMap = {
  normal: '普通会员',
  silver: '银卡会员',
  gold: '金卡会员',
  diamond: '钻石会员'
}

const reasonMap = {
  checkin: '签到奖励',
  order: '订单奖励',
  refund: '售后扣回',
  adjust: '人工调整'
}

const loadData = async () => {
  const params = { page: page.value, pageSize }
  if (query.userId) params.userId = query.userId
  if (query.level) params.level = query.level
  const res = await getMemberList(params)
  list.value = getPageList(res.data)
  total.value = getPageTotal(res.data)
}

const search = () => {
  page.value = 1
  loadData()
}

const reset = () => {
  Object.assign(query, { userId: null, level: '' })
  search()
}

const showDetail = async (row) => {
  current.value = row
  recordQuery.type = ''
  recordPage.value = 1
  detailVisible.value = true
  await loadRecords()
}

const loadRecords = async () => {
  if (!current.value) return
  const params = {
    userId: String(current.value.userId),
    page: recordPage.value,
    pageSize: recordPageSize
  }
  if (recordQuery.type) params.type = recordQuery.type
  const res = await getMemberRecordList(params)
  records.value = getPageList(res.data)
  recordTotal.value = getPageTotal(res.data)
}

const levelName = (row) => levelMap[row.level] || row.levelName || row.level || '-'
const levelTag = (level) => ({ diamond: 'danger', gold: 'warning', silver: 'info', normal: 'success' }[level] || '')
const recordType = (type) => ({ points: '积分', growth: '成长值' }[type] || type || '-')
const readableReason = (reason) => reasonMap[reason] || reason || '-'
const formatNumber = (value) => Number(value || 0).toLocaleString()
const formatMoney = (value) => `RMB ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const signedNumber = (value) => {
  const number = Number(value || 0)
  return number > 0 ? `+${number}` : String(number)
}

const handleExport = () => {
  exportExcel({
    data: list.value,
    fileName: '会员用户列表',
    sheetName: '会员用户',
    columns: [
      { label: '用户ID', prop: 'userId' },
      { label: '会员等级', value: levelName },
      { label: '积分', prop: 'points' },
      { label: '成长值', prop: 'growth' },
      { label: '累计消费', prop: 'totalSpend' },
      { label: '最近签到', prop: 'checkinDate' },
      { label: '连续签到', prop: 'continuousCheckin' }
    ]
  })
}

loadData()
</script>

<style scoped>
.member-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.member-summary :deep(.el-card__body) {
  min-height: 82px;
}

.member-summary span {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.member-summary strong {
  display: block;
  margin-top: 8px;
  font-size: 22px;
  line-height: 1.2;
}

.record-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 18px 0 12px;
}

.record-header h3 {
  margin: 0;
  font-size: 16px;
}

.positive {
  color: #16a34a;
  font-weight: 700;
}

.negative {
  color: #dc2626;
  font-weight: 700;
}

@media (max-width: 900px) {
  .member-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .member-summary {
    grid-template-columns: 1fr;
  }
}
</style>
