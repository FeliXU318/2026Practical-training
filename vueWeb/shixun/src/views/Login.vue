<template>
  <div class="login-page">
    <el-card class="login-card" shadow="always">
      <h1>后台管理登录</h1>
      <el-form :model="form" label-position="top" @keyup.enter="handleLogin">
        <el-form-item label="账号">
          <el-input v-model="form.username" size="large" placeholder="请输入账号" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" size="large" show-password placeholder="请输入密码" :prefix-icon="Lock" />
        </el-form-item>
        <el-button type="primary" size="large" class="login-button" :loading="loading" @click="handleLogin">登录</el-button>
      </el-form>
      <div class="password-actions">
        <el-button link type="primary" @click="changeDialogVisible = true">修改密码</el-button>
        <el-button link type="primary" @click="resetDialogVisible = true">找回密码</el-button>
      </div>
      <p class="tip">请输入管理员账号和密码</p>
    </el-card>

    <el-dialog v-model="changeDialogVisible" title="修改密码" width="420px">
      <el-form :model="changeForm" label-position="top">
        <el-form-item label="账号">
          <el-input v-model="changeForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="原密码">
          <el-input v-model="changeForm.oldPassword" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="changeForm.newPassword" show-password placeholder="至少 6 位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="changeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleChangePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resetDialogVisible" title="找回密码" width="420px">
      <el-form :model="resetForm" label-position="top">
        <el-form-item label="账号">
          <el-input v-model="resetForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="找回校验码">
          <el-input v-model="resetForm.resetCode" placeholder="请输入找回校验码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="resetForm.newPassword" show-password placeholder="至少 6 位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleResetPassword">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { changePassword, login, resetPassword } from '../api/auth'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const passwordLoading = ref(false)
const changeDialogVisible = ref(false)
const resetDialogVisible = ref(false)
const form = reactive({ username: 'admin', password: '' })
const changeForm = reactive({ username: 'admin', oldPassword: '', newPassword: '' })
const resetForm = reactive({ username: 'admin', resetCode: '', newPassword: '' })

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await login(form)
    userStore.setLogin(res.data.token, res.data.adminInfo)
    ElMessage.success('登录成功')
    router.push(route.query.redirect || '/dashboard')
  } finally {
    loading.value = false
  }
}

const handleChangePassword = async () => {
  if (!validatePassword(changeForm.newPassword)) {
    return
  }
  passwordLoading.value = true
  try {
    await changePassword(changeForm)
    ElMessage.success('密码修改成功，请用新密码登录')
    form.username = changeForm.username
    form.password = changeForm.newPassword
    changeDialogVisible.value = false
    changeForm.oldPassword = ''
    changeForm.newPassword = ''
  } finally {
    passwordLoading.value = false
  }
}

const handleResetPassword = async () => {
  if (!validatePassword(resetForm.newPassword)) {
    return
  }
  passwordLoading.value = true
  try {
    await resetPassword(resetForm)
    ElMessage.success('密码重置成功，请用新密码登录')
    form.username = resetForm.username
    form.password = resetForm.newPassword
    resetDialogVisible.value = false
    resetForm.resetCode = ''
    resetForm.newPassword = ''
  } finally {
    passwordLoading.value = false
  }
}

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    ElMessage.warning('新密码至少需要 6 位')
    return false
  }
  return true
}
</script>

<style scoped>
.login-page {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  background: transparent;
}

.login-card {
  width: min(430px, 100%);
  border: 0;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
}

h1 {
  margin: 8px 0 28px;
  text-align: center;
  font-size: 24px;
}

.login-button {
  width: 100%;
  margin-top: 8px;
}

.password-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 14px;
}

.tip {
  margin: 12px 0 0;
  color: #6b7280;
  text-align: center;
}
</style>
