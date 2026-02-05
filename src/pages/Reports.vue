<template>
  <div class="reports-page">
    <PageHeader
      title="报告中心"
      subtitle="以标准化数据驱动模板渲染，确保预览、打印与 PDF 一致。"
    >
      <el-button type="primary" @click="handlePrint">打印</el-button>
      <el-button type="success" @click="handleDownload">下载 PDF</el-button>
    </PageHeader>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="panel">
          <div class="panel-title">报告控制</div>
          <el-form label-position="top">
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
              <el-input v-model="store.standardData.order.reportNo" />
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
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, onMounted } from 'vue'
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
const previewRef = ref<HTMLElement | null>(null)

const activeTemplateId = computed({
  get: () => store.activeTemplateId,
  set: (value: string) => store.setActiveTemplate(value)
})

const templateHtml = computed(() =>
  store.activeTemplate ? resolveTemplateHtml(store.activeTemplate, preparedData.value) : ''
)
const preparedData = computed(() => prepareTemplateData(store.standardData))
const renderedHtml = computed(() => Mustache.render(templateHtml.value, preparedData.value))
const sanitizedHtml = computed(() =>
  DOMPurify.sanitize(renderedHtml.value, {
    ADD_TAGS: ['svg', 'path', 'g', 'rect', 'line', 'polyline', 'text', 'image'],
    ADD_ATTR: [
      'id',
      'class',
      'style',
      'data-barcode',
      'data-qr',
      'd',
      'x',
      'y',
      'width',
      'height',
      'fill',
      'stroke',
      'stroke-width',
      'viewBox',
      'xmlns',
      'preserveAspectRatio'
    ]
  })
)

const validationIssues = computed(() => validateReport(store.standardData))

const checklist = computed(() => [
  { label: '原始数据解析', ok: Boolean(store.rawData) },
  { label: '字段映射完成', ok: store.standardData.results.length > 0 },
  { label: '模板已选择', ok: Boolean(store.activeTemplateId) },
  { label: '预览渲染成功', ok: Boolean(renderedHtml.value) }
])

const renderCodes = async () => {
  await nextTick()
  const root = previewRef.value
  if (!root) return
  const barcodeEls = root.querySelectorAll('[data-barcode]') as NodeListOf<SVGElement>
  const reportNo = store.standardData.order.reportNo || 'RPT-UNKNOWN'
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
      filename: `report-${store.standardData.order.reportNo || 'preview'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(target)
    .save()
}

const handleRebuild = () => {
  store.applyMapping()
  renderCodes()
}

watch([renderedHtml, () => store.standardData.order.reportNo], () => {
  renderCodes()
})

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
</style>
