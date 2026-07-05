<template>
  <div class="agent-result" :class="{ compact }">
    <div class="agent-result__head">
      <div>
        <h3>{{ title }}</h3>
        <span>{{ result.source === 'model' ? `模型：${result.modelUsed}` : '本地规则兜底' }}</span>
      </div>
      <el-tag :type="riskTag(result.riskLevel || result.urgency)">风险：{{ riskText(result.riskLevel || result.urgency) }}</el-tag>
    </div>

    <p v-if="result.summary" class="summary">{{ result.summary }}</p>
    <p v-if="result.decision" class="decision">{{ result.decision }}</p>

    <div class="list-grid">
      <section v-if="hasItems(result.risks)">
        <h4>风险提醒</h4>
        <ul><li v-for="item in result.risks" :key="item">{{ item }}</li></ul>
      </section>
      <section v-if="hasItems(result.suggestions)">
        <h4>建议</h4>
        <ul><li v-for="item in result.suggestions" :key="item">{{ item }}</li></ul>
      </section>
      <section v-if="hasItems(result.actions)">
        <h4>动作</h4>
        <ul><li v-for="item in result.actions" :key="item">{{ item }}</li></ul>
      </section>
      <section v-if="hasItems(result.reasons)">
        <h4>理由</h4>
        <ul><li v-for="item in result.reasons" :key="item">{{ item }}</li></ul>
      </section>
      <section v-if="hasItems(result.manualChecks)">
        <h4>人工复核点</h4>
        <ul><li v-for="item in result.manualChecks" :key="item">{{ item }}</li></ul>
      </section>
    </div>

    <div v-if="result.replyDraft" class="reply">
      <h4>回复模板</h4>
      <p>{{ result.replyDraft }}</p>
      <el-button size="small" type="primary" plain @click="$emit('use-reply', result.replyDraft)">套用模板</el-button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  result: { type: Object, required: true },
  title: { type: String, default: '智能 Agent 建议' },
  compact: { type: Boolean, default: false }
})

defineEmits(['use-reply'])

const hasItems = (items) => Array.isArray(items) && items.length > 0
const riskText = (level) => ({ high: '高', medium: '中', low: '低' }[level] || '低')
const riskTag = (level) => ({ high: 'danger', medium: 'warning', low: 'success' }[level] || 'success')
</script>

<style scoped>
.agent-result {
  padding: 16px;
  border: 1px solid rgba(37, 99, 235, 0.22);
  border-radius: 8px;
  background: rgba(239, 246, 255, 0.58);
}

.agent-result.compact {
  margin-bottom: 12px;
  padding: 12px;
}

.agent-result__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

h3,
h4,
p {
  margin: 0;
}

.agent-result__head span {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.summary,
.decision {
  margin-top: 12px;
  color: #1e293b;
  line-height: 1.7;
}

.decision {
  font-weight: 700;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

section,
.reply {
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.68);
}

ul {
  margin: 8px 0 0;
  padding-left: 18px;
  line-height: 1.7;
}

.reply {
  margin-top: 12px;
}

.reply p {
  margin: 8px 0 10px;
  line-height: 1.7;
}
</style>
