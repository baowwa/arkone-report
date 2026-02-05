<template>
  <div class="dictionary-page">
    <PageHeader
      title="标准字典"
      subtitle="统一检验项目与结果标记，保障跨机构一致性。"
    >
      <el-button type="primary" @click="addItem">新增项目</el-button>
      <el-button @click="addFlag">新增标记</el-button>
    </PageHeader>

    <el-row :gutter="20">
      <el-col :span="14">
        <el-card>
          <div class="panel-title">检验项目字典</div>
          <el-table :data="store.dictionary.items" size="small">
            <el-table-column label="编码" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.code" placeholder="例如 WBC" />
              </template>
            </el-table-column>
            <el-table-column label="项目名称">
              <template #default="scope">
                <el-input v-model="scope.row.name" placeholder="例如 白细胞计数" />
              </template>
            </el-table-column>
            <el-table-column label="单位" width="140">
              <template #default="scope">
                <el-input v-model="scope.row.unit" placeholder="10^9/L" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card>
          <div class="panel-title">结果标记规则</div>
          <el-table :data="store.dictionary.flags" size="small">
            <el-table-column label="编码" width="90">
              <template #default="scope">
                <el-input v-model="scope.row.code" placeholder="H" />
              </template>
            </el-table-column>
            <el-table-column label="说明">
              <template #default="scope">
                <el-input v-model="scope.row.label" placeholder="偏高" />
              </template>
            </el-table-column>
            <el-table-column label="级别" width="120">
              <template #default="scope">
                <el-select v-model="scope.row.level" placeholder="级别">
                  <el-option label="提示" value="info" />
                  <el-option label="警告" value="warning" />
                  <el-option label="危急" value="critical" />
                </el-select>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()

const addItem = () => {
  store.dictionary.items.push({ code: '', name: '', unit: '' })
}

const addFlag = () => {
  store.dictionary.flags.push({ code: '', label: '', level: 'info' })
}
</script>

<style scoped>
.dictionary-page {
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
