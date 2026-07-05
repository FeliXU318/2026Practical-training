<template>
  <el-container class="admin-shell">
    <el-aside class="sidebar" width="232px">
      <div class="brand">
        <div class="brand-mark">零</div>
        <div>
          <strong>重庆大学校园服务</strong>
          <span>新零售运营后台</span>
        </div>
      </div>
      <el-menu
        :default-active="route.path"
        router
        background-color="#111827"
        text-color="#cbd5e1"
        active-text-color="#ffffff"
        class="side-menu"
      >
        <el-menu-item index="/dashboard"><el-icon><DataLine /></el-icon><span>数据看板</span></el-menu-item>
        <el-menu-item index="/product-audit"><el-icon><Goods /></el-icon><span>商品审核</span></el-menu-item>
        <el-menu-item index="/secondhand-audit"><el-icon><Box /></el-icon><span>二手审核</span></el-menu-item>
        <el-menu-item index="/orders"><el-icon><Tickets /></el-icon><span>订单管理</span></el-menu-item>
        <el-menu-item index="/members"><el-icon><User /></el-icon><span>用户管理</span></el-menu-item>
        <el-menu-item index="/delivery"><el-icon><Van /></el-icon><span>配送管理</span></el-menu-item>
        <el-menu-item index="/phone-card"><el-icon><Iphone /></el-icon><span>电话卡管理</span></el-menu-item>
        <el-menu-item index="/activity"><el-icon><Bell /></el-icon><span>活动公告</span></el-menu-item>
        <el-menu-item index="/complaints"><el-icon><Warning /></el-icon><span>投诉举报</span></el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <div>
          <div class="system-title">社交新零售电商平台后台管理端</div>
          <div class="system-subtitle">校园综合生活服务运营中心</div>
        </div>
        <div class="admin-actions">
          <el-popover placement="bottom-end" width="300" trigger="click">
            <template #reference>
              <el-button class="notice-button" circle :icon="Bell" />
            </template>
            <div class="notice-panel">
              <strong>待办提醒</strong>
              <div class="notice-item"><span class="dot warning"></span>12 个商品等待审核</div>
              <div class="notice-item"><span class="dot danger"></span>5 条投诉待处理</div>
              <div class="notice-item"><span class="dot primary"></span>2 个配送任务需要分配</div>
            </div>
          </el-popover>
          <span>当前管理员：{{ adminName }}</span>
          <el-button type="danger" plain :icon="SwitchButton" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { Bell, SwitchButton } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const adminName = computed(() => userStore.adminInfo?.username || 'admin')

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-shell {
  min-height: 100vh;
  background: transparent;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(17, 24, 39, 0.94)),
    rgba(17, 24, 39, 0.96);
  box-shadow: 12px 0 34px rgba(15, 23, 42, 0.2);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 72px;
  padding: 0 18px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.35);
  font-weight: 800;
}

.brand strong,
.brand span {
  display: block;
}

.brand span {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 12px;
}

.side-menu {
  border-right: 0;
  padding: 10px 10px 18px;
  background: transparent;
}

.side-menu :deep(.el-menu-item) {
  height: 46px;
  margin: 4px 0;
  border-radius: 8px;
}

.side-menu :deep(.el-menu-item:hover) {
  background: rgba(37, 99, 235, 0.18);
}

.side-menu :deep(.el-menu-item.is-active) {
  position: relative;
  background: linear-gradient(90deg, #2563eb, #0891b2);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.24);
}

.side-menu :deep(.el-menu-item.is-active::before) {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  width: 3px;
  height: 26px;
  border-radius: 0 4px 4px 0;
  background: #fff;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.58);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px) saturate(1.08);
}

.system-title {
  font-size: 18px;
  font-weight: 700;
}

.system-subtitle {
  margin-top: 3px;
  color: #64748b;
  font-size: 12px;
}

.admin-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
}

.notice-button {
  background: rgba(255, 255, 255, 0.56);
  border-color: rgba(148, 163, 184, 0.38);
}

.notice-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 14px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.dot.warning { background: #f59e0b; }
.dot.danger { background: #ef4444; }
.dot.primary { background: #2563eb; }

.main-content {
  min-width: 0;
  padding: 20px;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 160ms ease, transform 160ms ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (max-width: 900px) {
  .admin-shell {
    display: block;
  }

  .sidebar {
    position: relative;
    width: 100% !important;
    height: auto;
  }

  .side-menu {
    display: flex;
    overflow-x: auto;
  }

  .topbar {
    height: auto;
    padding: 12px 16px;
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
