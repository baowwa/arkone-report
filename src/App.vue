<template>
  <el-container class="app-shell">
    <el-aside width="240px" class="app-aside print-hidden">
      <div class="brand">
        <div class="brand-title">ArkOne 报告</div>
        <div class="brand-sub">标准化检验报告中心</div>
      </div>
      <el-menu
        router
        :default-active="activeMenu"
        class="menu"
        background-color="transparent"
        text-color="#e6f2f1"
        active-text-color="#f7faf9"
      >
        <el-menu-item index="/reports">
          <el-icon><Document /></el-icon>
          <span>报告中心</span>
        </el-menu-item>
        <el-menu-item index="/templates">
          <el-icon><Tickets /></el-icon>
          <span>模板中心</span>
        </el-menu-item>
        <el-menu-item index="/ingest">
          <el-icon><Connection /></el-icon>
          <span>数据接入</span>
        </el-menu-item>
        <el-menu-item index="/dictionary">
          <el-icon><Collection /></el-icon>
          <span>标准字典</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
        <el-menu-item index="/help">
          <el-icon><QuestionFilled /></el-icon>
          <span>帮助</span>
        </el-menu-item>
      </el-menu>
      <div class="aside-footer">
        <div class="status-dot"></div>
        <span>前端独立运行</span>
      </div>
    </el-aside>

    <el-container>
      <el-header class="app-header print-hidden">
        <div class="header-left">
          <div class="header-title">检验报告打印系统</div>
          <div class="header-sub">统一模板 · 稳定预览 · 规范输出</div>
        </div>
        <div class="header-right">
          <el-tag type="success" effect="dark">标准化产品</el-tag>
          <el-tag type="info" effect="plain">Mock 数据</el-tag>
        </div>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Document,
  Tickets,
  Connection,
  Collection,
  Setting,
  QuestionFilled
} from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => {
  if (route.path.startsWith('/templates')) return '/templates'
  return route.path
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: radial-gradient(circle at top right, #f4f0e8 0%, #f7f4ef 40%, #f1f4f3 100%);
}

.app-aside {
  background: linear-gradient(180deg, #0b3b3a 0%, #0c4845 50%, #0b3b3a 100%);
  padding: 28px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: #e6f2f1;
}

.brand-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.brand-sub {
  margin-top: 6px;
  font-size: 13px;
  color: #a8c9c5;
}

.menu {
  border-right: none;
  background: transparent;
  flex: 1;
}

.menu :deep(.el-menu-item) {
  margin-bottom: 6px;
  border-radius: 10px;
}

.menu :deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.12);
}

.aside-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #b7d6d2;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #4ade80;
}

.app-header {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.header-sub {
  font-size: 13px;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-main {
  padding: 28px 32px 40px;
}
</style>
