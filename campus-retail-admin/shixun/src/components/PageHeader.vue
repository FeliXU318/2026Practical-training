<template>
  <el-card shadow="never" class="page-header">
    <div>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    <slot />
  </el-card>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.page-header {
  border: 0;
}

.page-header :deep(.el-card__body) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

h2 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 700;
}

p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 760px) {
  .page-header :deep(.el-card__body) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
