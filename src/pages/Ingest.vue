<template>
  <div class="ingest-page">
    <PageHeader
      title="数据接入"
      subtitle="通过字段映射把医院与第三方数据转换为统一标准模型。"
    >
      <el-button @click="handleLoadSample">加载样例</el-button>
      <el-button type="primary" @click="handleParse">解析 JSON</el-button>
      <el-button type="success" @click="handleApply">应用映射</el-button>
      <el-button @click="store.resetMappings">重置映射</el-button>
    </PageHeader>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="panel">
          <div class="panel-title">原始数据</div>
          <el-input
            v-model="store.rawInput"
            type="textarea"
            :rows="18"
            resize="vertical"
          />
          <div class="parse-status">
            <el-tag v-if="parseStatus.ok" type="success">解析成功</el-tag>
            <el-tag v-else type="danger">解析失败</el-tag>
            <span v-if="!parseStatus.ok" class="parse-error">{{ parseStatus.error }}</span>
          </div>
        </el-card>

        <el-card class="panel">
          <div class="panel-title">结果数组配置</div>
          <el-form label-position="top">
            <el-form-item label="结果数组路径">
              <el-input v-model="store.resultArrayPath" placeholder="例如 results" />
            </el-form-item>
          </el-form>
          <el-table :data="store.resultMappings" size="small">
            <el-table-column prop="key" label="标准字段" width="140">
              <template #default="scope">
                {{ resultLabel(scope.row.key) }}
              </template>
            </el-table-column>
            <el-table-column label="来源字段">
              <template #default="scope">
                <el-input v-model="scope.row.sourceKey" placeholder="来源字段名" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="panel">
          <div class="panel-title">字段映射</div>
          <el-table :data="store.fieldMappings" size="small">
            <el-table-column label="标准字段" width="180">
              <template #default="scope">
                <el-select v-model="scope.row.targetPath" placeholder="选择标准字段" style="width: 100%">
                  <el-option-group
                    v-for="group in groupedFields"
                    :key="group.label"
                    :label="group.label"
                  >
                    <el-option
                      v-for="item in group.items"
                      :key="item.path"
                      :label="item.label"
                      :value="item.path"
                    />
                  </el-option-group>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="来源字段路径">
              <template #default="scope">
                <el-input v-model="scope.row.sourcePath" placeholder="例如 patientInfo.name" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70">
              <template #default="scope">
                <el-button type="danger" link @click="removeMapping(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="table-actions">
            <el-button size="small" @click="addMapping">新增字段</el-button>
          </div>
        </el-card>

        <el-card class="panel">
          <div class="panel-title">标准化输出预览</div>
          <pre class="json-preview">{{ formattedStandardData }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAppStore } from '@/stores/app'
import { sampleRawData } from '@/data/sampleRawData'
import { RESULT_ITEM_FIELDS, STANDARD_FIELDS } from '@/data/standardFields'

const store = useAppStore()
const parseStatus = reactive({ ok: true, error: '' })

const groupedFields = computed(() => {
  const groups: Record<string, { label: string; items: typeof STANDARD_FIELDS }> = {}
  STANDARD_FIELDS.forEach((field) => {
    const key = field.group || '其他'
    if (!groups[key]) {
      groups[key] = { label: key, items: [] }
    }
    groups[key].items.push(field)
  })
  return Object.values(groups)
})

const formattedStandardData = computed(() => JSON.stringify(store.standardData, null, 2))

const resultLabel = (key: string) => {
  return RESULT_ITEM_FIELDS.find((item) => item.key === key)?.label || key
}

const handleParse = () => {
  const result = store.parseRawInput()
  parseStatus.ok = result.ok
  parseStatus.error = result.error
}

const handleLoadSample = () => {
  store.rawInput = JSON.stringify(sampleRawData, null, 2)
  const result = store.parseRawInput()
  parseStatus.ok = result.ok
  parseStatus.error = result.error
}

const handleApply = () => {
  store.applyMapping()
}

const addMapping = () => {
  store.fieldMappings.push({
    id: `m-${Date.now()}`,
    sourcePath: '',
    targetPath: ''
  })
}

const removeMapping = (id: string) => {
  store.fieldMappings = store.fieldMappings.filter((item) => item.id !== id)
}
</script>

<style scoped>
.ingest-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel {
  margin-bottom: 20px;
}

.panel-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #0f172a;
}

.parse-status {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.parse-error {
  font-size: 12px;
  color: #b91c1c;
}

.table-actions {
  margin-top: 12px;
}

.json-preview {
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: 10px;
  min-height: 220px;
  font-size: 12px;
  overflow: auto;
}
</style>
