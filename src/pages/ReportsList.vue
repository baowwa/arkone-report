<template>
  <div class="reports-page">
    <PageHeader
      title="报告中心"
      subtitle="从列表进入报告预览、打印与下载。"
    >
      <el-input v-model="keyword" placeholder="搜索报告号/患者姓名" style="width: 220px" />
      <el-select v-model="selectedItem" clearable placeholder="检验项目" style="width: 180px">
        <el-option
          v-for="item in testItemOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
      <el-select v-model="selectedAudit" clearable placeholder="审核状态" style="width: 160px">
        <el-option v-for="item in auditOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="selectedSend" clearable placeholder="发送状态" style="width: 160px">
        <el-option v-for="item in sendOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="selectedTemplate" clearable placeholder="模板" style="width: 180px">
        <el-option
          v-for="item in store.templates"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </PageHeader>

    <el-card>
      <div class="panel-title">报告列表</div>
      <el-table :data="filteredReports" row-key="id">
        <el-table-column prop="reportNo" label="报告号" width="180" />
        <el-table-column prop="patientName" label="患者" width="120" />
        <el-table-column label="检验项目">
          <template #default="scope">
            {{ itemSummary(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="templateName" label="模板" width="160" />
        <el-table-column label="审核状态" width="120">
          <template #default="scope">
            <el-tag :type="auditTag(scope.row.auditStatus)" effect="plain">
              {{ auditLabel(scope.row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发送状态" width="120">
          <template #default="scope">
            <el-tag :type="sendTag(scope.row.sendStatus)" effect="plain">
              {{ sendLabel(scope.row.sendStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reportTime" label="报告时间" width="180" />
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button size="small" type="primary" link @click="openDetail(scope.row.id)">
              预览
            </el-button>
            <el-button size="small" link @click="printReport(scope.row.id)">打印</el-button>
            <el-button size="small" link @click="downloadReport(scope.row.id)">
              下载 PDF
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const router = useRouter()
const keyword = ref('')
const selectedItem = ref('')
const selectedAudit = ref('')
const selectedSend = ref('')
const selectedTemplate = ref('')

const testItemOptions = computed(() =>
  store.dictionary.items.map((item) => item.name)
)

const auditOptions = [
  { value: 'pending', label: '未审核' },
  { value: 'approved', label: '已审核' },
  { value: 'rejected', label: '退回' }
]

const sendOptions = [
  { value: 'pending', label: '未发送' },
  { value: 'sent', label: '已发送' },
  { value: 'failed', label: '发送失败' }
]

const filteredReports = computed(() => {
  const keywordValue = keyword.value.trim()
  return store.reports.filter((report) => {
    const matchKeyword =
      !keywordValue ||
      report.reportNo.includes(keywordValue) ||
      report.patientName.includes(keywordValue)
    const matchTemplate = !selectedTemplate.value || report.templateId === selectedTemplate.value
    const matchAudit = !selectedAudit.value || report.auditStatus === selectedAudit.value
    const matchSend = !selectedSend.value || report.sendStatus === selectedSend.value
    const matchItem = !selectedItem.value
      || report.data.results.some((item) => item.itemName === selectedItem.value)
    return matchKeyword && matchTemplate && matchItem && matchAudit && matchSend
  })
})

const itemSummary = (report: typeof store.reports[number]) => {
  const names = report.data.results.map((item) => item.itemName).filter(Boolean)
  if (names.length <= 2) return names.join('、') || '-'
  return `${names.slice(0, 2).join('、')} 等 ${names.length} 项`
}

const auditLabel = (status: string) => {
  return auditOptions.find((item) => item.value === status)?.label || '未审核'
}

const sendLabel = (status: string) => {
  return sendOptions.find((item) => item.value === status)?.label || '未发送'
}

const auditTag = (status: string) => {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  return 'warning'
}

const sendTag = (status: string) => {
  if (status === 'sent') return 'success'
  if (status === 'failed') return 'danger'
  return 'info'
}

const openDetail = (id: string) => {
  router.push(`/reports/${id}`)
}

const printReport = (id: string) => {
  router.push(`/reports/${id}?action=print`)
}

const downloadReport = (id: string) => {
  router.push(`/reports/${id}?action=download`)
}
</script>

<style scoped>
.reports-page {
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
