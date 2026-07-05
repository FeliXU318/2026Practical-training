<template>
  <div class="page">
    <PageHeader title="数据看板" description="查看校园综合生活服务业务的核心运营数据、订单趋势、待办事项和用户画像。" />

    <div class="stat-grid">
      <el-card v-for="item in stats" :key="item.label" shadow="never" class="stat-card">
        <div class="stat-icon" :class="item.class"><el-icon><component :is="item.icon" /></el-icon></div>
        <div>
          <p>{{ item.label }}</p>
          <strong>{{ item.value }}</strong>
          <span>{{ item.hint }}</span>
        </div>
      </el-card>
    </div>

    <div class="chart-grid">
      <el-card shadow="never"><template #header>近 7 日订单趋势</template><div ref="lineRef" class="chart-box" /></el-card>
      <el-card shadow="never"><template #header>各业务销售额</template><div ref="barRef" class="chart-box" /></el-card>
      <el-card shadow="never"><template #header>订单状态分布</template><div ref="pieRef" class="chart-box" /></el-card>
    </div>

    <el-card shadow="never" class="table-card">
      <template #header>待办事项</template>
      <el-table :data="todos" border>
        <el-table-column prop="type" label="类型" min-width="120" />
        <el-table-column prop="title" label="事项内容" min-width="260" />
        <el-table-column prop="level" label="优先级" width="100">
          <template #default="{ row }"><el-tag :type="row.level === 'high' ? 'danger' : 'warning'">{{ levelText(row.level) }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="count" label="数量" min-width="120" />
      </el-table>
    </el-card>

    <el-card shadow="never" class="user-portrait-card">
      <template #header>
        <div class="section-title">
          <span>用户画像</span>
          <div class="section-actions">
            <small>基于 user_profile 与 user_recommendation</small>
            <el-button type="primary" size="small" :loading="agentLoading" @click="runAgent">智能分析</el-button>
          </div>
        </div>
      </template>

      <div class="portrait-summary">
        <div class="portrait-metric">
          <span>画像用户</span>
          <strong>{{ portrait.totalUsers || 0 }}</strong>
        </div>
        <div class="portrait-metric">
          <span>活跃用户</span>
          <strong>{{ portrait.activeUsers || 0 }}</strong>
        </div>
        <div class="portrait-metric">
          <span>累计消费</span>
          <strong>{{ formatMoney(portrait.totalAmount) }}</strong>
        </div>
        <div class="portrait-metric">
          <span>平均客单价</span>
          <strong>{{ formatMoney(portrait.avgOrderAmount) }}</strong>
        </div>
      </div>

      <div class="portrait-grid">
        <div class="portrait-panel">
          <h3>用户等级</h3>
          <div ref="levelRef" class="chart-box small" />
        </div>
        <div class="portrait-panel">
          <h3>偏好类目</h3>
          <div ref="categoryRef" class="chart-box small" />
        </div>
        <div class="portrait-panel">
          <h3>风险分布</h3>
          <div ref="riskRef" class="chart-box small" />
        </div>
        <div class="portrait-panel">
          <h3>推荐类目</h3>
          <div ref="recommendRef" class="chart-box small" />
        </div>
      </div>

      <div class="recommend-table">
        <h3>热门推荐商品</h3>
        <el-table :data="portrait.topRecommendations || []" border>
          <el-table-column prop="productName" label="商品" min-width="180" />
          <el-table-column prop="category" label="类目" width="120" />
          <el-table-column prop="recommendCount" label="推荐次数" width="110" />
          <el-table-column prop="avgScore" label="平均得分" width="110">
            <template #default="{ row }">{{ Number(row.avgScore || 0).toFixed(4) }}</template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="agentResult" class="agent-card">
        <div class="agent-card__header">
          <div>
            <h3>智能运营 Agent</h3>
            <span>{{ agentResult.source === 'model' ? `模型：${agentResult.modelUsed}` : '本地规则兜底' }}</span>
          </div>
          <el-tag :type="riskTag(agentResult.riskLevel)">风险：{{ riskText(agentResult.riskLevel) }}</el-tag>
        </div>
        <p class="agent-summary">{{ agentResult.summary }}</p>
        <div class="agent-grid">
          <div>
            <h4>风险提醒</h4>
            <ul><li v-for="item in agentResult.risks || []" :key="item">{{ item }}</li></ul>
          </div>
          <div>
            <h4>运营建议</h4>
            <ul><li v-for="item in agentResult.suggestions || []" :key="item">{{ item }}</li></ul>
          </div>
          <div>
            <h4>推荐动作</h4>
            <ul><li v-for="item in agentResult.actions || []" :key="item">{{ item }}</li></ul>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { Checked, Money, ShoppingCart, Warning } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'
import { getDashboardSummary, getOrderTrend, getTodoList, getUserPortrait } from '../api/dashboard'
import { runDashboardAgent } from '../api/agent'

const summary = ref({})
const trend = ref({})
const portrait = ref({})
const todos = ref([])
const lineRef = ref()
const barRef = ref()
const pieRef = ref()
const levelRef = ref()
const categoryRef = ref()
const riskRef = ref()
const recommendRef = ref()
const agentLoading = ref(false)
const agentResult = ref(null)
let charts = []

const stats = computed(() => [
  { label: '今日订单数', value: summary.value.todayOrders || 0, icon: ShoppingCart, class: 'blue', hint: '统计当前业务订单规模' },
  { label: '今日销售额', value: formatMoney(summary.value.todaySales), icon: Money, class: 'green', hint: '覆盖便利店与水果等业务' },
  { label: '待审核商品', value: summary.value.pendingProducts || 0, icon: Checked, class: 'orange', hint: '请优先处理新品审核' },
  { label: '待处理售后', value: summary.value.pendingComplaints || 0, icon: Warning, class: 'red', hint: '客服需要及时跟进' }
])

const chartColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2']

const labelMap = {
  fruit: '水果生鲜',
  supermarket: '校园超市',
  secondhand: '二手交易',
  pending: '待处理',
  paid: '已支付',
  shipped: '配送中',
  completed: '已完成',
  cancelled: '已取消',
  unknown: '未知',
  normal: '普通用户',
  low_value: '低价值',
  medium_value: '中价值',
  high_value: '高价值',
  low_risk: '低风险',
  medium_risk: '中风险',
  high_risk: '高风险',
  bed_bath_table: '床品桌椅',
  furniture_decor: '家具装饰',
  health_beauty: '美妆健康',
  garden_tools: '园艺工具',
  sports_leisure: '运动休闲',
  computers_accessories: '电脑配件',
  housewares: '家居用品',
  watches_gifts: '手表礼品',
  telephony: '通讯设备',
  auto: '汽车用品',
  digital: '数码',
  food: '食品',
  daily: '日用百货',
  book: '图书资料',
  clothing: '服饰'
}

const displayName = (name) => labelMap[name] || name || '未知'
const formatAxisNumber = (value) => Number(value || 0).toLocaleString()
const normalizeChartData = (list = [], limit) => list
  .filter((item) => item && Number(item.value || 0) > 0)
  .map((item) => ({ ...item, name: displayName(item.name), value: Number(item.value || 0) }))
  .slice(0, limit || list.length)

const axisLabel = (rotate = 0) => ({
  interval: 0,
  rotate,
  color: '#64748b',
  formatter: (value) => String(value).length > 7 ? `${String(value).slice(0, 7)}...` : value
})

const valueAxis = (name) => ({
  type: 'value',
  name,
  nameTextStyle: { color: '#64748b' },
  axisLabel: {
    color: '#64748b',
    formatter: (value) => formatAxisNumber(value)
  },
  splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.24)' } }
})

const formatMoney = (value) => `￥${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const levelText = (level) => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[level] || level || '-'
}

const riskText = (level) => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[level] || '低'
}

const riskTag = (level) => {
  const map = { high: 'danger', medium: 'warning', low: 'success' }
  return map[level] || 'success'
}

const renderCharts = () => {
  charts.forEach((chart) => chart.dispose())
  charts = [
    echarts.init(lineRef.value),
    echarts.init(barRef.value),
    echarts.init(pieRef.value),
    echarts.init(levelRef.value),
    echarts.init(categoryRef.value),
    echarts.init(riskRef.value),
    echarts.init(recommendRef.value)
  ]

  const businessSales = normalizeChartData(trend.value.businessSales || [])
  const statusDistribution = normalizeChartData(trend.value.statusDistribution || [])
  const levelDistribution = normalizeChartData(portrait.value.levelDistribution || [])
  const categoryPreference = normalizeChartData((portrait.value.categoryPreference || []).filter((item) => item?.name), 8)
  const riskDistribution = normalizeChartData(portrait.value.riskDistribution || [])
  const recommendationCategories = normalizeChartData(portrait.value.recommendationCategories || [], 10)

  charts[0].setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 78, right: 24, bottom: 46, top: 42, containLabel: true },
    xAxis: { type: 'category', name: '日期', data: trend.value.dates || [], axisLabel: axisLabel(0) },
    yAxis: valueAxis('订单数'),
    series: [{ name: '订单数', type: 'line', smooth: true, data: trend.value.orders || [], areaStyle: {}, itemStyle: { color: '#2563eb' } }]
  })
  charts[1].setOption({
    tooltip: { trigger: 'axis', valueFormatter: (value) => `¥${formatAxisNumber(value)}` },
    grid: { left: 88, right: 24, bottom: 54, top: 42, containLabel: true },
    xAxis: { type: 'category', name: '业务类型', data: businessSales.map((i) => i.name), axisLabel: axisLabel(0) },
    yAxis: valueAxis('销售额'),
    series: [{ name: '销售额', type: 'bar', data: businessSales.map((i) => i.value), itemStyle: { color: '#16a34a' } }]
  })
  charts[2].setOption({
    tooltip: { trigger: 'item' },
    color: chartColors,
    legend: { bottom: 0, type: 'scroll' },
    series: [{ type: 'pie', radius: ['42%', '66%'], center: ['50%', '44%'], data: statusDistribution }]
  })
  charts[3].setOption({
    tooltip: { trigger: 'item' },
    color: chartColors,
    legend: { bottom: 0, type: 'scroll' },
    series: [{ type: 'pie', radius: ['42%', '66%'], center: ['50%', '42%'], data: levelDistribution }]
  })
  charts[4].setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 74, right: 18, bottom: 62, top: 34, containLabel: true },
    xAxis: { type: 'category', name: '偏好类目', data: categoryPreference.map((i) => i.name), axisLabel: axisLabel(25) },
    yAxis: valueAxis('人数'),
    series: [{ name: '人数', type: 'bar', data: categoryPreference.map((i) => i.value), itemStyle: { color: '#f59e0b' } }]
  })
  charts[5].setOption({
    tooltip: { trigger: 'item' },
    color: ['#16a34a', '#f59e0b', '#dc2626', '#64748b'],
    legend: { bottom: 0, type: 'scroll' },
    series: [{ type: 'pie', radius: ['40%', '66%'], center: ['50%', '42%'], data: riskDistribution }]
  })
  charts[6].setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 74, right: 18, bottom: 62, top: 34, containLabel: true },
    xAxis: { type: 'category', name: '推荐类目', data: recommendationCategories.map((i) => i.name), axisLabel: axisLabel(25) },
    yAxis: valueAxis('次数'),
    series: [{ name: '推荐次数', type: 'bar', data: recommendationCategories.map((i) => i.value), itemStyle: { color: '#0891b2' } }]
  })
}

const renderReadablePortraitCharts = () => {
  const categoryPreference = normalizeChartData((portrait.value.categoryPreference || []).filter((item) => item?.name), 8)
  const recommendationCategories = normalizeChartData(portrait.value.recommendationCategories || [], 10)

  charts[4].setOption({
    title: {
      show: categoryPreference.length === 0,
      text: '暂无有效偏好类目数据',
      left: 'center',
      top: '42%',
      textStyle: { color: '#94a3b8', fontSize: 14, fontWeight: 500 }
    },
    tooltip: { trigger: 'axis' },
    grid: { left: 112, right: 24, bottom: 36, top: 34, containLabel: true },
    xAxis: valueAxis('人数'),
    yAxis: {
      type: 'category',
      inverse: true,
      data: categoryPreference.map((i) => i.name),
      axisLabel: axisLabel(0)
    },
    series: [{ name: '人数', type: 'bar', data: categoryPreference.map((i) => i.value), itemStyle: { color: '#f59e0b' } }]
  }, true)

  charts[6].setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 96, right: 56, bottom: 24, top: 24, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { show: false },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.18)' } }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: recommendationCategories.map((i) => i.name),
      axisLabel: axisLabel(0)
    },
    series: [{
      name: '推荐次数',
      type: 'bar',
      data: recommendationCategories.map((i) => i.value),
      label: { show: true, position: 'right', formatter: ({ value }) => formatAxisNumber(value), color: '#64748b' },
      itemStyle: { color: '#0891b2' }
    }]
  }, true)
}

const loadData = async () => {
  const [summaryRes, trendRes, todoRes, portraitRes] = await Promise.all([
    getDashboardSummary(),
    getOrderTrend(),
    getTodoList(),
    getUserPortrait()
  ])
  summary.value = summaryRes.data || {}
  trend.value = trendRes.data || {}
  todos.value = todoRes.data || []
  portrait.value = portraitRes.data || {}
  await nextTick()
  renderCharts()
  renderReadablePortraitCharts()
}

const runAgent = async () => {
  agentLoading.value = true
  try {
    const res = await runDashboardAgent({ question: '请分析当前数据看板、用户画像和推荐数据，给出运营建议。' })
    agentResult.value = res.data
  } finally {
    agentLoading.value = false
  }
}

const handleResize = () => charts.forEach((chart) => chart.resize())

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach((chart) => chart.dispose())
})
</script>

<style scoped>
.stat-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 112px;
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card::after {
  content: "";
  position: absolute;
  right: -28px;
  bottom: -36px;
  width: 106px;
  height: 106px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.08);
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 8px;
  font-size: 22px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.46);
}

.stat-icon.blue { color: #1d4ed8; background: #dbeafe; }
.stat-icon.green { color: #047857; background: #d1fae5; }
.stat-icon.orange { color: #b45309; background: #fef3c7; }
.stat-icon.red { color: #dc2626; background: #fee2e2; }

.stat-card p {
  margin: 0 0 4px;
  color: #6b7280;
}

.stat-card strong {
  display: block;
  font-size: 26px;
  line-height: 1.15;
}

.stat-card span {
  display: block;
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}

.section-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title small {
  color: #64748b;
  font-size: 12px;
}

.portrait-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.portrait-metric {
  padding: 14px 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  background: rgba(248, 250, 252, 0.62);
}

.portrait-metric span {
  display: block;
  color: #64748b;
  font-size: 13px;
}

.portrait-metric strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 22px;
  line-height: 1.2;
}

.portrait-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 16px;
}

.portrait-panel {
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.36);
}

.portrait-panel h3,
.recommend-table h3 {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: #334155;
}

.chart-box.small {
  height: 320px;
}

.recommend-table {
  margin-top: 16px;
}

.agent-card {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(37, 99, 235, 0.22);
  border-radius: 8px;
  background: rgba(239, 246, 255, 0.52);
}

.agent-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.agent-card h3,
.agent-card h4 {
  margin: 0;
}

.agent-card__header span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.agent-summary {
  margin: 12px 0;
  color: #1e293b;
  line-height: 1.7;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.agent-grid > div {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.62);
}

.agent-grid ul {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #334155;
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .portrait-grid,
  .portrait-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .portrait-grid,
  .portrait-summary {
    grid-template-columns: 1fr;
  }

  .section-title {
    display: block;
  }

  .section-title small {
    display: block;
    margin-top: 4px;
  }

  .section-actions {
    align-items: flex-start;
    flex-direction: column;
    margin-top: 6px;
  }

  .agent-grid {
    grid-template-columns: 1fr;
  }
}
</style>
