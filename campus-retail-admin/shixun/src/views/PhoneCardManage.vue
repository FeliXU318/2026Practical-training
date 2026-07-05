<template>
  <div class="page">
    <PageHeader title="电话卡管理" description="维护 simcard 表中的套餐名称、价格、流量、通话和推荐状态。" />
    <el-card shadow="never">
      <div class="phone-layout">
        <el-form :model="form" label-width="110px">
          <el-form-item label="套餐名称"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" style="width: 100%" /></el-form-item>
          <el-form-item label="流量"><el-input v-model="form.data" /></el-form-item>
          <el-form-item label="通话"><el-input v-model="form.calls" /></el-form-item>
          <el-form-item label="套餐权益"><el-input v-model="form.features" type="textarea" :rows="4" /></el-form-item>
          <el-form-item label="推荐"><el-switch v-model="form.recommended" /></el-form-item>
          <el-form-item><el-button type="primary" :icon="Check" @click="save">保存套餐</el-button></el-form-item>
        </el-form>
        <el-card shadow="never" class="qr-card">
          <template #header>套餐预览</template>
          <h3>{{ form.name || '未命名套餐' }}</h3>
          <strong>￥{{ form.price || 0 }}</strong>
          <p>{{ form.data }}</p>
          <p>{{ form.calls }}</p>
          <p>{{ form.features }}</p>
          <StatusTag :status="form.recommended ? 'recommended' : 'normal'" />
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'
import StatusTag from '../components/StatusTag.vue'
import { getPhoneCardConfig, updatePhoneCardConfig } from '../api/phoneCard'

const form = reactive({ id: null, name: '', price: 0, data: '', calls: '', features: '', recommended: false })
const loadData = async () => {
  const res = await getPhoneCardConfig()
  if (res.data) Object.assign(form, res.data)
}
const save = async () => { await updatePhoneCardConfig(form); ElMessage.success('保存成功') }

loadData()
</script>

<style scoped>
.phone-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
}

.qr-card {
  align-self: start;
  text-align: center;
}

.qr-card h3 {
  margin: 0 0 12px;
}

.qr-card strong {
  display: block;
  font-size: 28px;
  margin-bottom: 12px;
}

.qr-card p {
  color: #6b7280;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .phone-layout {
    grid-template-columns: 1fr;
  }
}
</style>
