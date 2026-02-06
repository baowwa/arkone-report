<template>
  <div class="reports-page">
    <PageHeader
      title="报告详情"
      subtitle="从报告列表进入预览与打印，确保输出一致。"
    >
      <el-button @click="goList">返回列表</el-button>
      <el-button @click="openPreflight">打印预检</el-button>
      <el-button type="primary" @click="handlePrint">打印</el-button>
      <el-button type="success" @click="handleDownload">下载 PDF</el-button>
    </PageHeader>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="panel">
          <div class="panel-title">报告信息</div>
          <el-form label-position="top">
            <el-form-item label="审核状态">
              <el-tag :type="auditTag(reportStatus.auditStatus)" effect="plain">
                {{ auditLabel(reportStatus.auditStatus) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="发送状态">
              <el-tag :type="sendTag(reportStatus.sendStatus)" effect="plain">
                {{ sendLabel(reportStatus.sendStatus) }}
              </el-tag>
            </el-form-item>
            <el-form-item label="选择模板">
              <el-select v-model="activeTemplateId" style="width: 100%">
                <el-option
                  v-for="item in store.templates"
                  :key="item.id"
                  :label="`${item.name} (${item.version})`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="报告号">
              <el-input v-model="reportData.order.reportNo" />
            </el-form-item>
            <el-form-item label="提示">
              <el-alert
                v-if="validationIssues.length"
                title="存在待处理项"
                type="warning"
                show-icon
                :closable="false"
              >
                <div class="issue-list">
                  <div v-for="issue in validationIssues" :key="issue.id">{{ issue.message }}</div>
                </div>
              </el-alert>
              <el-alert v-else title="校验通过" type="success" show-icon :closable="false" />
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="panel">
          <div class="panel-title">标准化闭环检查</div>
          <div class="checklist">
            <div v-for="item in checklist" :key="item.label" class="check-item">
              <el-icon :class="item.ok ? 'ok' : 'pending'">
                <CircleCheckFilled v-if="item.ok" />
                <WarningFilled v-else />
              </el-icon>
              <span>{{ item.label }}</span>
            </div>
          </div>
          <el-button class="full-btn" @click="handleRebuild">重新渲染</el-button>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="panel">
          <div class="panel-title">报告预览</div>
          <div id="print-root" ref="previewRef" class="report-preview-shell">
            <div v-html="sanitizedHtml"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="preflightVisible" title="打印预检" width="640px">
      <div class="preflight">
        <div class="preflight-item">
          <span>模板模式</span>
          <strong>{{ store.activeTemplate?.mode === 'structured' ? '结构化' : 'HTML' }}</strong>
        </div>
        <div class="preflight-item">
          <span>模板名称</span>
          <strong>{{ store.activeTemplate?.name }}</strong>
        </div>
        <div class="preflight-item">
          <span>页眉/页脚检查</span>
          <strong>{{ preflightHeaderFooter }}</strong>
        </div>
        <div class="preflight-item">
          <span>打印页边距</span>
          <strong>12mm（A4）</strong>
        </div>
        <div class="preflight-item">
          <span>校验问题</span>
          <strong>{{ validationIssues.length ? '存在待处理项' : '无' }}</strong>
        </div>
      </div>
      <template #footer>
        <el-button @click="preflightVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrint">继续打印</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Mustache from 'mustache'
import DOMPurify from 'dompurify'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import { CircleCheckFilled, WarningFilled } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAppStore } from '@/stores/app'
import { prepareTemplateData } from '@/utils/template'
import { validateReport } from '@/utils/validate'
import html2pdf from 'html2pdf.js'
import { resolveTemplateHtml } from '@/utils/templateRenderer'

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const previewRef = ref<HTMLElement | null>(null)

const activeTemplateId = computed({
  get: () => store.activeTemplateId,
  set: (value: string) => store.setActiveTemplate(value)
})

const reportData = computed(() => store.reportData)
const reportStatus = computed(() => {
  const report = store.reports.find((item) => item.id === store.activeReportId)
  return {
    auditStatus: report?.auditStatus || 'pending',
    sendStatus: report?.sendStatus || 'pending'
  }
})
const preparedData = computed(() => prepareTemplateData(reportData.value))
const templateHtml = computed(() =>
  store.activeTemplate ? resolveTemplateHtml(store.activeTemplate, preparedData.value) : ''
)
const renderedHtml = computed(() => Mustache.render(templateHtml.value, preparedData.value))
const sanitizedHtml = computed(() =>
  DOMPurify.sanitize(renderedHtml.value, {
    ADD_TAGS: [
      'svg',
      'path',
      'g',
      'rect',
      'line',
      'polyline',
      'text',
      'image',
      'circle',
      'ellipse',
      'img'
    ],
    ADD_ATTR: [
      'id',
      'class',
      'style',
      'data-barcode',
      'data-qr',
      'src',
      'alt',
      'd',
      'x',
      'y',
      'width',
      'height',
      'fill',
      'stroke',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'cx',
      'cy',
      'r',
      'rx',
      'ry',
      'viewBox',
      'xmlns',
      'preserveAspectRatio'
    ]
  })
)

const validationIssues = computed(() => validateReport(reportData.value))

const checklist = computed(() => [
  { label: '报告数据加载', ok: Boolean(reportData.value) },
  { label: '模板已选择', ok: Boolean(store.activeTemplateId) },
  { label: '预览渲染成功', ok: Boolean(renderedHtml.value) }
])

const renderCodes = async () => {
  await nextTick()
  const root = previewRef.value
  if (!root) return
  const barcodeEls = root.querySelectorAll('[data-barcode]') as NodeListOf<SVGElement>
  const reportNo = reportData.value.order.reportNo || 'RPT-UNKNOWN'
  barcodeEls.forEach((barcodeEl) => {
    JsBarcode(barcodeEl, reportNo, {
      format: 'CODE128',
      displayValue: false,
      height: 40,
      margin: 0
    })
  })
  const qrEls = root.querySelectorAll('[data-qr]') as NodeListOf<HTMLImageElement>
  if (qrEls.length) {
    const dataUrl = await QRCode.toDataURL(reportNo, { margin: 0, width: 120 })
    qrEls.forEach((qrEl) => {
      qrEl.src = dataUrl
    })
  }
}

const handlePrint = () => {
  window.print()
}

const handleDownload = async () => {
  const root = previewRef.value
  if (!root) return
  const target = root.querySelector('.report-sheet') || root
  await html2pdf()
    .set({
      margin: 10,
      filename: `report-${reportData.value.order.reportNo || 'preview'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(target)
    .save()
}

const handleRebuild = () => {
  renderCodes()
}

const preflightVisible = ref(false)

const preflightHeaderFooter = computed(() => {
  const blocks = store.activeTemplate?.blocks || []
  const headerCount = blocks.filter((block) => block.type === 'header').length
  const footerCount = blocks.filter((block) => block.type === 'footer').length
  if (headerCount === 1 && footerCount === 1) return '正常'
  return `页眉 ${headerCount} 个 / 页脚 ${footerCount} 个`
})

const openPreflight = () => {
  preflightVisible.value = true
}

const goList = () => {
  router.push('/reports')
}

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

watch([renderedHtml, () => reportData.value.order.reportNo], () => {
  renderCodes()
})

watch(
  () => route.params.id,
  (id) => {
    if (!id || typeof id !== 'string') return
    store.setActiveReport(id)
  },
  { immediate: true }
)

watch(
  () => route.query.action,
  (action) => {
    if (action === 'print') {
      setTimeout(() => handlePrint(), 0)
    }
    if (action === 'download') {
      setTimeout(() => handleDownload(), 0)
    }
  },
  { immediate: true }
)

onMounted(() => {
  renderCodes()
})
</script>

<style scoped>
.reports-page {
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

.issue-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #334155;
}

.check-item .ok {
  color: #16a34a;
}

.check-item .pending {
  color: #f59e0b;
}

.full-btn {
  width: 100%;
}

.preflight {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  color: #334155;
}

.preflight-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #e2e8f0;
  padding-bottom: 8px;
}
</style>
