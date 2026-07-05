<template>
  <el-tag :type="tagType" effect="light">{{ displayStatus }}</el-tag>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const statusTextMap = {
  pending: '待审核',
  pass: '已通过',
  approved: '已通过',
  reject: '已驳回',
  rejected: '已驳回',
  processing: '处理中',
  waiting: '待分配',
  delivering: '配送中',
  finished: '已送达',
  closed: '已处理',
  online: '启用',
  offline: '停用',
  show: '启用',
  hide: '停用',
  draft: '停用',
  running: '启用',
  end: '停用',
  unpaid: '待支付',
  preparing: '待备货',
  self_pickup: '待自提',
  paid: '已完成',
  refund: '已取消',
  cancelled: '已取消'
}

const displayStatus = computed(() => statusTextMap[props.status] || props.status)

const tagType = computed(() => {
  const map = {
    待审核: 'warning',
    待处理: 'warning',
    处理中: 'primary',
    待支付: 'info',
    待备货: 'warning',
    待自提: 'primary',
    待分配: 'warning',
    待取货: 'primary',
    配送中: 'primary',
    已通过: 'success',
    已完成: 'success',
    已送达: 'success',
    已处理: 'success',
    启用: 'success',
    已驳回: 'danger',
    已取消: 'info',
    异常: 'danger',
    停用: 'info'
  }
  return map[displayStatus.value] || 'info'
})
</script>
