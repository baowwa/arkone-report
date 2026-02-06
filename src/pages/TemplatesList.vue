<template>
  <div class="templates-page">
    <PageHeader
      title="模板中心"
      subtitle="管理模板列表，标准化模板可复制、对比与编辑。"
    >
      <el-button type="primary" @click="handleCreate">新增模板</el-button>
    </PageHeader>

    <el-card>
      <div class="panel-title">模板列表</div>
      <el-table :data="store.templates" row-key="id">
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="version" label="版本" width="110" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="openEditor(scope.row.id)">
              编辑
            </el-button>
            <el-button size="small" link @click="handleDuplicate(scope.row.id)">复制</el-button>
            <el-button size="small" type="danger" link @click="handleRemove(scope.row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const router = useRouter()

const handleCreate = () => {
  store.addTemplate()
  router.push(`/templates/${store.activeTemplateId}`)
}

const openEditor = (id: string) => {
  store.setActiveTemplate(id)
  router.push(`/templates/${id}`)
}

const handleDuplicate = (id: string) => {
  store.duplicateTemplate(id)
  router.push(`/templates/${store.activeTemplateId}`)
}

const handleRemove = (id: string) => {
  store.removeTemplate(id)
}
</script>

<style scoped>
.templates-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #0f172a;
}
</style>
