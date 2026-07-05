<template>
  <el-empty :description="description" />
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' }
})
</script>
