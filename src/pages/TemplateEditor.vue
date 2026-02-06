<template>
  <div class="templates-page">
    <PageHeader
      title="模板设计"
      subtitle="结构化拖拽与属性面板协作，确保模板可控且可扩展。"
    >
      <el-button @click="goList">返回列表</el-button>
      <el-select v-model="activeTemplateId" style="width: 220px">
        <el-option
          v-for="item in store.templates"
          :key="item.id"
          :label="`${item.name} (${item.version})`"
          :value="item.id"
        />
      </el-select>
    </PageHeader>

    <el-row :gutter="20">
      <el-col :span="5">
        <el-card class="panel">
          <div class="panel-title">组件库</div>
          <div class="library">
            <div
              v-for="item in componentLibrary"
              :key="item.type"
              class="library-item"
              :class="{ disabled: item.single && hasBlockType(item.type) }"
              draggable="true"
              @dragstart="handleLibraryDrag(item.type)"
              @click="addBlock(item.type)"
            >
              <div class="library-title">{{ item.label }}</div>
              <div class="library-desc">{{ item.desc }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="panel">
          <div class="canvas-toolbar">
            <el-radio-group v-model="templateMode" size="small">
              <el-radio-button label="structured">结构化预览</el-radio-button>
              <el-radio-button label="html">HTML 预览</el-radio-button>
            </el-radio-group>
            <div class="toolbar-actions">
              <el-button size="small" @click="syncHtmlFromBlocks">覆盖 HTML</el-button>
            </div>
          </div>

          <div
            ref="canvasRef"
            class="report-preview-shell"
            @dragover.prevent
            @drop="handleDropToCanvas"
          >
            <div v-if="templateMode === 'structured'" class="report-sheet">
              <div
                v-for="block in displayBlocks"
                :key="block.id"
                class="editor-block"
                :class="{
                  'is-selected': block.id === selectedBlockId,
                  'is-drag-over': block.id === dragOverId,
                  'is-muted': !isVisible(block)
                }"
                draggable="true"
                @dragstart="handleDragStart(block.id)"
                @dragover.prevent="handleDragOver(block.id)"
                @drop.stop="handleDrop(block.id)"
                @dragend="resetDrag"
                @click="selectBlock(block.id)"
              >
                <div class="block-hint">
                  {{ blockLabel(block) }}
                  <span v-if="!isVisible(block)" class="block-muted">条件未满足</span>
                </div>

                <template v-if="block.type === 'header'">
                  <header class="report-header" :style="blockStyle(block)">
                    <div class="report-brand">
                      <div class="report-org">{{ preparedData.org.name }}</div>
                      <div class="report-org-sub">
                        {{ preparedData.org.address }} · {{ preparedData.org.phone }}
                      </div>
                    </div>
                    <div class="report-title">{{ block.title }}</div>
                    <div v-if="block.showBarcode || block.showQr" class="report-codes">
                      <svg v-if="block.showBarcode" data-barcode></svg>
                      <img v-if="block.showQr" data-qr alt="二维码" />
                    </div>
                  </header>
                </template>

                <template v-else-if="block.type === 'info'">
                  <section class="report-section" :style="blockStyle(block)">
                    <div class="section-title">{{ block.title }}</div>
                    <div
                      class="info-grid"
                      :style="{
                        gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))`
                      }"
                    >
                      <div v-for="field in block.fields" :key="field.id">
                        <span>{{ field.label }}</span>
                        {{ getFieldValue(field.path) }}
                      </div>
                    </div>
                  </section>
                </template>

                <template v-else-if="block.type === 'results'">
                  <section class="report-section" :style="blockStyle(block)">
                    <div class="section-title">{{ block.title }}</div>
                    <table class="result-table">
                      <thead>
                        <tr>
                          <th v-for="column in block.columns" :key="column.id" :style="columnStyle(column)">
                            {{ column.label }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(row, index) in getResultsData(block)"
                          :key="index"
                          :class="row.flagClass"
                        >
                          <td v-for="column in block.columns" :key="column.id" :style="columnStyle(column)">
                            {{ row[column.key] }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                </template>

                <template v-else-if="block.type === 'cards'">
                  <section class="report-section" :style="blockStyle(block)">
                    <div class="section-title">{{ block.title }}</div>
                    <div
                      class="report-cards"
                      :style="{
                        gridTemplateColumns: `repeat(${block.columns || 3}, minmax(0, 1fr))`
                      }"
                    >
                      <div
                        v-for="(card, index) in getCardsData(block)"
                        :key="index"
                        class="report-card"
                        :style="{ background: card.bgColor, borderColor: card.borderColor }"
                      >
                        <div class="report-card-icon">
                          <img v-if="card.iconUrl" :src="card.iconUrl" :alt="card.iconAlt || '图标'" />
                          <div v-else v-html="card.iconSvg"></div>
                        </div>
                        <div class="report-card-label">{{ card.title }}</div>
                        <div class="report-card-value">{{ card.value }}</div>
                      </div>
                    </div>
                  </section>
                </template>

                <template v-else-if="block.type === 'image'">
                  <section class="report-section" :style="blockStyle(block)">
                    <div v-if="block.title" class="section-title">{{ block.title }}</div>
                    <div class="report-image">
                      <img
                        v-if="resolveImageSrc(block)"
                        :src="resolveImageSrc(block)"
                        :alt="block.alt || '图片'"
                        :style="imageStyle(block)"
                      />
                      <div v-else class="report-image-placeholder">暂无图片</div>
                      <div v-if="block.caption" class="report-image-caption">{{ block.caption }}</div>
                    </div>
                  </section>
                </template>

                <template v-else-if="block.type === 'text'">
                  <section class="report-section" :style="blockStyle(block)">
                    <div class="report-text">{{ block.text }}</div>
                  </section>
                </template>

                <template v-else-if="block.type === 'code'">
                  <section class="report-section" :style="blockStyle(block)">
                    <div class="section-title">{{ block.label || '条码信息' }}</div>
                    <div class="report-codes horizontal">
                      <svg v-if="block.showBarcode" data-barcode></svg>
                      <img v-if="block.showQr" data-qr alt="二维码" />
                    </div>
                  </section>
                </template>

                <template v-else-if="block.type === 'footer'">
                  <footer class="report-footer" :style="blockStyle(block)">
                    <div v-if="block.showGeneratedAt">报告生成时间: {{ preparedData.meta.generatedAt }}</div>
                    <div class="report-note">{{ block.note }}</div>
                  </footer>
                </template>
              </div>
            </div>

            <div v-else v-html="sanitizedHtml"></div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="7">
        <el-card class="panel">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="属性" name="props">
              <div class="panel-title">模板信息</div>
              <el-form label-position="top">
                <el-form-item label="模板名称">
                  <el-input v-model="templateName" />
                </el-form-item>
                <el-form-item label="版本号">
                  <el-input v-model="templateVersion" />
                </el-form-item>
                <el-form-item label="描述">
                  <el-input v-model="templateDescription" type="textarea" :rows="2" />
                </el-form-item>
              </el-form>

              <el-divider />

              <div class="panel-title">块级属性</div>
              <div v-if="selectedBlock" class="block-props">
                <el-form label-position="top">
                  <el-form-item label="标题" v-if="hasTitle(selectedBlock)">
                    <el-input v-model="selectedBlock.title" />
                  </el-form-item>

                  <template v-if="selectedBlock.type === 'header'">
                    <el-form-item label="条码">
                      <el-switch v-model="selectedBlock.showBarcode" />
                    </el-form-item>
                    <el-form-item label="二维码">
                      <el-switch v-model="selectedBlock.showQr" />
                    </el-form-item>
                  </template>

                  <template v-else-if="selectedBlock.type === 'info'">
                    <el-form-item label="列数">
                      <el-radio-group v-model="selectedBlock.columns">
                        <el-radio-button :label="2">2</el-radio-button>
                        <el-radio-button :label="3">3</el-radio-button>
                        <el-radio-button :label="4">4</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                    <div class="field-title">字段列表</div>
                    <div v-for="field in selectedBlock.fields" :key="field.id" class="field-row">
                      <el-input v-model="field.label" placeholder="字段标题" />
                      <el-input v-model="field.path" placeholder="标准字段路径" />
                      <el-button type="danger" link @click="removeInfoField(field.id)">删除</el-button>
                    </div>
                    <el-button size="small" @click="addInfoField">新增字段</el-button>
                  </template>

                  <template v-else-if="selectedBlock.type === 'results'">
                    <el-form-item label="数据源">
                      <el-select v-model="selectedBlock.dataPath" placeholder="选择数据源">
                        <el-option
                          v-for="option in resultDataOptions"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        />
                      </el-select>
                    </el-form-item>
                    <div class="field-title">表头配置</div>
                    <div
                      v-for="column in selectedBlock.columns"
                      :key="column.id"
                      class="field-row result-row"
                    >
                      <el-input v-model="column.label" placeholder="表头名称" />
                      <el-select v-model="column.key" placeholder="字段">
                        <el-option
                          v-for="item in resultColumnOptions"
                          :key="item.key"
                          :label="item.label"
                          :value="item.key"
                        />
                      </el-select>
                      <el-select v-model="column.align" placeholder="对齐">
                        <el-option label="左对齐" value="left" />
                        <el-option label="居中" value="center" />
                        <el-option label="右对齐" value="right" />
                      </el-select>
                      <el-button type="danger" link @click="removeResultColumn(column.id)">删除</el-button>
                    </div>
                    <el-button size="small" @click="addResultColumn">新增列</el-button>
                  </template>

                  <template v-else-if="selectedBlock.type === 'cards'">
                    <el-form-item label="数据源">
                      <el-select v-model="selectedBlock.dataPath" placeholder="选择数据源">
                        <el-option
                          v-for="option in cardDataOptions"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="列数">
                      <el-radio-group v-model="selectedBlock.columns">
                        <el-radio-button :label="2">2</el-radio-button>
                        <el-radio-button :label="3">3</el-radio-button>
                        <el-radio-button :label="4">4</el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                  </template>

                  <template v-else-if="selectedBlock.type === 'image'">
                    <el-form-item label="图片字段">
                      <el-select
                        v-model="selectedBlock.srcPath"
                        filterable
                        allow-create
                        default-first-option
                        placeholder="选择或输入图片字段路径"
                      >
                        <el-option
                          v-for="option in fieldOptions"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="替代文本">
                      <el-input v-model="selectedBlock.alt" />
                    </el-form-item>
                    <el-form-item label="宽度">
                      <el-input v-model="selectedBlock.width" placeholder="例如 120px 或 60%" />
                    </el-form-item>
                    <el-form-item label="高度">
                      <el-input v-model="selectedBlock.height" placeholder="例如 120px" />
                    </el-form-item>
                    <el-form-item label="圆角">
                      <el-input v-model="selectedBlock.radius" placeholder="例如 8px 或 50%" />
                    </el-form-item>
                    <el-form-item label="说明文字">
                      <el-input v-model="selectedBlock.caption" />
                    </el-form-item>
                  </template>

                  <template v-else-if="selectedBlock.type === 'text'">
                    <el-form-item label="说明文字">
                      <el-input v-model="selectedBlock.text" type="textarea" :rows="4" />
                    </el-form-item>
                  </template>

                  <template v-else-if="selectedBlock.type === 'code'">
                    <el-form-item label="说明标题">
                      <el-input v-model="selectedBlock.label" />
                    </el-form-item>
                    <el-form-item label="条码">
                      <el-switch v-model="selectedBlock.showBarcode" />
                    </el-form-item>
                    <el-form-item label="二维码">
                      <el-switch v-model="selectedBlock.showQr" />
                    </el-form-item>
                  </template>

                  <template v-else-if="selectedBlock.type === 'footer'">
                    <el-form-item label="底部说明">
                      <el-input v-model="selectedBlock.note" type="textarea" :rows="3" />
                    </el-form-item>
                    <el-form-item label="显示生成时间">
                      <el-switch v-model="selectedBlock.showGeneratedAt" />
                    </el-form-item>
                  </template>

                  <el-divider />

                  <div class="field-title">样式设置</div>
                  <el-form-item label="字体大小">
                    <el-input-number v-model="selectedBlock.style.fontSize" :min="10" :max="24" />
                  </el-form-item>
                  <el-form-item label="对齐方式">
                    <el-select v-model="selectedBlock.style.textAlign" placeholder="选择对齐方式">
                      <el-option label="左对齐" value="left" />
                      <el-option label="居中" value="center" />
                      <el-option label="右对齐" value="right" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="内边距">
                    <el-input v-model="selectedBlock.style.padding" placeholder="例如 12px 16px" />
                  </el-form-item>
                  <el-form-item label="外边距">
                    <el-input v-model="selectedBlock.style.marginBottom" placeholder="例如 12px" />
                  </el-form-item>
                  <el-form-item label="背景色">
                    <el-color-picker v-model="selectedBlock.style.background" />
                  </el-form-item>
                  <el-form-item label="边框">
                    <el-input v-model="selectedBlock.style.border" placeholder="例如 1px solid #e5e7eb" />
                  </el-form-item>

                  <el-divider />

                  <div class="field-title">显示规则</div>
                  <el-form-item label="规则类型">
                    <el-select v-model="selectedBlock.condition.type" placeholder="选择显示规则">
                      <el-option
                        v-for="option in conditionTypeOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    v-if="selectedBlock.condition.type === 'fieldHasValue'"
                    label="字段路径"
                  >
                    <el-select
                      v-model="selectedBlock.condition.path"
                      filterable
                      allow-create
                      default-first-option
                      placeholder="选择或输入字段"
                    >
                      <el-option
                        v-for="option in fieldOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    v-if="selectedBlock.condition.type === 'resultsHasFlag'"
                    label="异常标记"
                  >
                    <el-select
                      v-model="selectedBlock.condition.flag"
                      filterable
                      allow-create
                      default-first-option
                      placeholder="选择标记"
                    >
                      <el-option
                        v-for="option in flagOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-divider />
                  <el-form-item label="显示">
                    <el-switch v-model="selectedBlock.hidden" active-text="隐藏" inactive-text="显示" />
                  </el-form-item>
                  <el-button type="danger" plain @click="removeBlock">删除当前块</el-button>
                </el-form>
              </div>
              <el-empty v-else description="请选择一个块进行编辑" />
            </el-tab-pane>

            <el-tab-pane label="高级 HTML" name="html">
              <el-alert
                title="高级模式"
                type="warning"
                show-icon
                :closable="false"
                description="HTML 模式不与结构化块自动同步，显示规则仅结构化生效，请在修改后使用『覆盖 HTML』按钮。"
              />
              <el-input v-model="templateHtml" type="textarea" :rows="18" class="html-editor" />
            </el-tab-pane>

            <el-tab-pane label="对比" name="compare">
              <el-form label-position="top">
                <el-form-item label="选择对比模板">
                  <el-select v-model="compareTemplateId" placeholder="选择模板" style="width: 100%">
                    <el-option
                      v-for="item in compareOptions"
                      :key="item.id"
                      :label="`${item.name} (${item.version})`"
                      :value="item.id"
                    />
                  </el-select>
                </el-form-item>
              </el-form>

              <el-empty v-if="!compareOptions.length" description="暂无可对比模板" />

              <div v-else class="diff-panel">
                <div class="diff-section">
                  <div class="diff-title">模板元数据差异</div>
                  <div v-if="!diffSummary.metaChanges.length" class="diff-empty">无</div>
                  <div v-else class="diff-list">
                    <div v-for="item in diffSummary.metaChanges" :key="item" class="diff-item">
                      {{ item }}
                    </div>
                  </div>
                </div>

                <div class="diff-section">
                  <div class="diff-title">HTML 内容差异</div>
                  <div class="diff-item">{{ diffSummary.htmlChanged ? '存在差异' : '一致' }}</div>
                </div>

                <div class="diff-section">
                  <div class="diff-title">新增块 ({{ diffSummary.added.length }})</div>
                  <div v-if="!diffSummary.added.length" class="diff-empty">无</div>
                  <div v-else class="diff-list">
                    <div v-for="block in diffSummary.added" :key="block.id" class="diff-item">
                      + {{ blockLabel(block) }} · {{ block.title || block.id }}
                    </div>
                  </div>
                </div>

                <div class="diff-section">
                  <div class="diff-title">删除块 ({{ diffSummary.removed.length }})</div>
                  <div v-if="!diffSummary.removed.length" class="diff-empty">无</div>
                  <div v-else class="diff-list">
                    <div v-for="block in diffSummary.removed" :key="block.id" class="diff-item">
                      - {{ blockLabel(block) }} · {{ block.title || block.id }}
                    </div>
                  </div>
                </div>

                <div class="diff-section">
                  <div class="diff-title">修改块 ({{ diffSummary.modified.length }})</div>
                  <div v-if="!diffSummary.modified.length" class="diff-empty">无</div>
                  <div v-else class="diff-list">
                    <div v-for="item in diffSummary.modified" :key="item.block.id" class="diff-item">
                      * {{ blockLabel(item.block) }} · 变化字段: {{ item.changes.join(', ') }}
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DOMPurify from 'dompurify'
import Mustache from 'mustache'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'
import PageHeader from '@/components/PageHeader.vue'
import { useAppStore } from '@/stores/app'
import { prepareTemplateData } from '@/utils/template'
import { getValueByPath } from '@/utils/path'
import { buildTemplateHtml, isBlockVisible } from '@/utils/templateRenderer'
import { STANDARD_FIELDS } from '@/data/standardFields'
import type { TemplateBlock, TemplateMode } from '@/types/template'

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const canvasRef = ref<HTMLElement | null>(null)
const activeTab = ref('props')
const selectedBlockId = ref<string>('')
const draggingId = ref<string>('')
const dragOverId = ref<string>('')
const compareTemplateId = ref('')

const componentLibrary = [
  { type: 'header', label: '页眉', desc: '机构信息 + 标题 + 条码', single: true },
  { type: 'info', label: '信息块', desc: '字段网格展示' },
  { type: 'results', label: '结果表格', desc: '动态行结果' },
  { type: 'cards', label: '结果卡片', desc: '图文综述卡片' },
  { type: 'image', label: '图片', desc: '单张图片展示' },
  { type: 'text', label: '文本说明', desc: '补充说明与声明' },
  { type: 'code', label: '条码/二维码', desc: '单独的条码区' },
  { type: 'footer', label: '页脚', desc: '时间与提示', single: true }
] as const

const resultColumnOptions = [
  { key: 'itemName', label: '项目名称' },
  { key: 'value', label: '结果值' },
  { key: 'unit', label: '单位' },
  { key: 'refRange', label: '参考范围' },
  { key: 'flagLabel', label: '结果提示' },
  { key: 'flag', label: '异常标记' },
  { key: 'category', label: '分类' },
  { key: 'name', label: '中文名' },
  { key: 'latinName', label: '拉丁文名' },
  { key: 'resistantDrug', label: '疑似耐药药物' },
  { key: 'geneRegion', label: '基因区' },
  { key: 'mutation', label: '相关突变' },
  { key: 'drug', label: '抗病毒药物' },
  { key: 'level', label: '耐药程度' }
]

const resultDataOptions = [
  { value: 'results', label: '检验结果' },
  { value: 'resistanceResults', label: '耐药结果' },
  { value: 'hivResistanceResults', label: 'HIV 耐药结果' }
]

const cardDataOptions = [{ value: 'summaryCards', label: '检测结果卡片' }]

const conditionTypeOptions = [
  { value: 'always', label: '始终显示' },
  { value: 'fieldHasValue', label: '字段有值时显示' },
  { value: 'resultsHasFlag', label: '存在异常标记时显示' }
]

const fieldOptions = STANDARD_FIELDS.map((item) => ({
  value: item.path,
  label: `${item.label} (${item.path})`
}))

const activeTemplateId = computed({
  get: () => store.activeTemplateId,
  set: (value: string) => {
    store.setActiveTemplate(value)
    router.replace(`/templates/${value}`)
  }
})

const templateMode = computed({
  get: () => store.activeTemplate?.mode || 'structured',
  set: (value: string) => store.setTemplateMode(store.activeTemplateId, value as TemplateMode)
})

const templateName = computed({
  get: () => store.activeTemplate?.name || '',
  set: (value: string) => store.updateTemplateMeta(store.activeTemplateId, { name: value })
})

const templateVersion = computed({
  get: () => store.activeTemplate?.version || '',
  set: (value: string) => store.updateTemplateMeta(store.activeTemplateId, { version: value })
})

const templateDescription = computed({
  get: () => store.activeTemplate?.description || '',
  set: (value: string) => store.updateTemplateMeta(store.activeTemplateId, { description: value })
})

const templateHtml = computed({
  get: () => store.activeTemplate?.html || '',
  set: (value: string) => store.updateTemplateHtml(store.activeTemplateId, value)
})

const preparedData = computed(() => prepareTemplateData(store.standardData))

const flagOptions = computed(() =>
  store.dictionary.flags.map((flag) => ({
    value: flag.code,
    label: `${flag.label} (${flag.code})`
  }))
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

const displayBlocks = computed(() => store.activeTemplate?.blocks || [])

const selectedBlock = computed(() =>
  store.activeTemplate?.blocks.find((block) => block.id === selectedBlockId.value)
)

const isVisible = (block: TemplateBlock) => isBlockVisible(block, preparedData.value)

watch(
  selectedBlock,
  (block) => {
    if (!block) return
    if (!block.style) block.style = {}
    if (!block.condition) block.condition = { type: 'always' }
    if (block.type === 'results' && !block.dataPath) block.dataPath = 'results'
    if (block.type === 'cards' && !block.dataPath) block.dataPath = 'summaryCards'
    if (block.type === 'cards' && !block.columns) block.columns = 3
    if (block.type === 'image' && !block.srcPath) block.srcPath = 'org.logo'
  },
  { immediate: true }
)

watch(
  () => selectedBlock.value?.condition?.type,
  (type) => {
    if (!selectedBlock.value || !selectedBlock.value.condition) return
    if (type === 'fieldHasValue' && !selectedBlock.value.condition.path) {
      selectedBlock.value.condition.path = 'patient.name'
    }
    if (type === 'resultsHasFlag' && !selectedBlock.value.condition.flag) {
      selectedBlock.value.condition.flag = 'H'
    }
  }
)

const compareOptions = computed(() =>
  store.templates.filter((item) => item.id !== store.activeTemplateId)
)

const compareTemplate = computed(() =>
  store.templates.find((item) => item.id === compareTemplateId.value)
)

const diffSummary = computed(() => {
  if (!store.activeTemplate || !compareTemplate.value) {
    return {
      added: [],
      removed: [],
      modified: [],
      metaChanges: [],
      htmlChanged: false
    }
  }
  const current = store.activeTemplate
  const other = compareTemplate.value
  const mapOther = new Map(other.blocks.map((block) => [block.id, block]))
  const mapCurrent = new Map(current.blocks.map((block) => [block.id, block]))

  const added = current.blocks.filter((block) => !mapOther.has(block.id))
  const removed = other.blocks.filter((block) => !mapCurrent.has(block.id))
  const modified = current.blocks
    .map((block) => {
      const otherBlock = mapOther.get(block.id)
      if (!otherBlock) return null
      const changes = diffBlock(block, otherBlock)
      if (!changes.length) return null
      return { block, changes }
    })
    .filter(Boolean) as { block: TemplateBlock; changes: string[] }[]

  const metaChanges: string[] = []
  if (current.name !== other.name) metaChanges.push('模板名称')
  if (current.version !== other.version) metaChanges.push('版本号')
  if (current.description !== other.description) metaChanges.push('描述')

  return {
    added,
    removed,
    modified,
    metaChanges,
    htmlChanged: current.html !== other.html
  }
})

const selectBlock = (id: string) => {
  selectedBlockId.value = id
}

const addBlock = (type: TemplateBlock['type']) => {
  if ((type === 'header' || type === 'footer') && hasBlockType(type)) {
    return
  }
  const id = store.addBlock(store.activeTemplateId, type)
  if (id) {
    selectedBlockId.value = id
  }
}

const removeBlock = () => {
  if (!selectedBlock.value) return
  const id = selectedBlock.value.id
  store.removeBlock(store.activeTemplateId, id)
  selectedBlockId.value = store.activeTemplate?.blocks[0]?.id || ''
}

const syncHtmlFromBlocks = () => {
  if (!store.activeTemplate) return
  const html = buildTemplateHtml(store.activeTemplate.blocks, preparedData.value)
  store.updateTemplateHtml(store.activeTemplateId, html)
}

const goList = () => {
  router.push('/templates')
}

const handleLibraryDrag = (type: TemplateBlock['type']) => {
  if ((type === 'header' || type === 'footer') && hasBlockType(type)) {
    return
  }
  draggingId.value = `LIB:${type}`
}

const handleDragStart = (id: string) => {
  draggingId.value = id
}

const handleDragOver = (id: string) => {
  dragOverId.value = id
}

const handleDrop = (id: string) => {
  if (!draggingId.value) return
  if (draggingId.value.startsWith('LIB:')) {
    const type = draggingId.value.replace('LIB:', '') as TemplateBlock['type']
    if ((type === 'header' || type === 'footer') && hasBlockType(type)) {
      resetDrag()
      return
    }
    const index = store.activeTemplate?.blocks.findIndex((block) => block.id === id) ?? -1
    const newId = store.addBlock(store.activeTemplateId, type, index)
    if (newId) selectedBlockId.value = newId
  } else if (draggingId.value !== id) {
    store.moveBlock(store.activeTemplateId, draggingId.value, id)
  }
  resetDrag()
}

const handleDropToCanvas = () => {
  if (!draggingId.value) return
  if (draggingId.value.startsWith('LIB:')) {
    const type = draggingId.value.replace('LIB:', '') as TemplateBlock['type']
    if ((type === 'header' || type === 'footer') && hasBlockType(type)) {
      resetDrag()
      return
    }
    const newId = store.addBlock(store.activeTemplateId, type)
    if (newId) selectedBlockId.value = newId
  } else {
    store.moveBlockToEnd(store.activeTemplateId, draggingId.value)
  }
  resetDrag()
}

const resetDrag = () => {
  draggingId.value = ''
  dragOverId.value = ''
}

const getFieldValue = (path: string) => {
  const value = getValueByPath(preparedData.value, path)
  return value ?? ''
}

const getResultsData = (block: TemplateBlock) => {
  if (block.type !== 'results') return []
  const path = block.dataPath || 'results'
  const data = getValueByPath(preparedData.value, path)
  return Array.isArray(data) ? data : []
}

const getCardsData = (block: TemplateBlock) => {
  if (block.type !== 'cards') return []
  const path = block.dataPath || 'summaryCards'
  const data = getValueByPath(preparedData.value, path)
  return Array.isArray(data) ? data : []
}

const resolveImageSrc = (block: TemplateBlock) => {
  if (block.type !== 'image') return ''
  const srcPath = block.srcPath?.trim()
  if (!srcPath) return ''
  if (srcPath.startsWith('http') || srcPath.startsWith('data:') || srcPath.startsWith('/')) {
    return srcPath
  }
  const value = getValueByPath(preparedData.value, srcPath)
  return typeof value === 'string' ? value : ''
}

const imageStyle = (block: TemplateBlock) => {
  if (block.type !== 'image') return {}
  const style: Record<string, string> = {}
  if (block.width) style.width = block.width
  if (block.height) style.height = block.height
  if (block.radius) style.borderRadius = block.radius
  return style
}

const addInfoField = () => {
  if (!selectedBlock.value || selectedBlock.value.type !== 'info') return
  selectedBlock.value.fields.push({
    id: `field-${Date.now()}`,
    label: '字段标题',
    path: 'patient.name'
  })
}

const removeInfoField = (id: string) => {
  if (!selectedBlock.value || selectedBlock.value.type !== 'info') return
  selectedBlock.value.fields = selectedBlock.value.fields.filter((field) => field.id !== id)
}

const addResultColumn = () => {
  if (!selectedBlock.value || selectedBlock.value.type !== 'results') return
  selectedBlock.value.columns.push({
    id: `col-${Date.now()}`,
    label: '新列',
    key: 'value'
  })
}

const removeResultColumn = (id: string) => {
  if (!selectedBlock.value || selectedBlock.value.type !== 'results') return
  selectedBlock.value.columns = selectedBlock.value.columns.filter((column) => column.id !== id)
}

const hasTitle = (block: TemplateBlock) => {
  return ['header', 'info', 'results', 'cards', 'image', 'text', 'code', 'footer'].includes(block.type)
}

const hasBlockType = (type: TemplateBlock['type']) => {
  return Boolean(store.activeTemplate?.blocks.some((block) => block.type === type))
}

const blockStyle = (block: TemplateBlock) => {
  const style = block.style || {}
  const output: Record<string, string> = {}
  if (style.fontSize) output.fontSize = `${style.fontSize}px`
  if (style.textAlign) output.textAlign = style.textAlign
  if (style.padding) output.padding = style.padding
  if (style.marginBottom) output.marginBottom = style.marginBottom
  if (style.background) output.background = style.background
  if (style.border) output.border = style.border
  if (style.borderBottom) output.borderBottom = style.borderBottom
  if (style.borderRadius) output.borderRadius = style.borderRadius
  return output
}

const columnStyle = (column: { align?: string; width?: string }) => {
  const output: Record<string, string> = {}
  if (column.align) output.textAlign = column.align
  if (column.width) output.width = column.width
  return output
}

const blockLabel = (block: TemplateBlock) => {
  const map: Record<string, string> = {
    header: '页眉',
    info: '信息块',
    results: '结果表',
    cards: '结果卡片',
    image: '图片',
    text: '文本说明',
    code: '条码/二维码',
    footer: '页脚'
  }
  return map[block.type] || '模块'
}

const diffBlock = (current: TemplateBlock, other: TemplateBlock) => {
  const pick = (block: TemplateBlock) => {
    switch (block.type) {
      case 'header':
        return {
          title: block.title,
          showBarcode: block.showBarcode,
          showQr: block.showQr,
          style: block.style,
          condition: block.condition
        }
      case 'info':
        return {
          title: block.title,
          columns: block.columns,
          fields: block.fields,
          style: block.style,
          condition: block.condition
        }
      case 'results':
        return {
          title: block.title,
          columns: block.columns,
          dataPath: block.dataPath,
          style: block.style,
          condition: block.condition
        }
      case 'cards':
        return {
          title: block.title,
          dataPath: block.dataPath,
          columns: block.columns,
          style: block.style,
          condition: block.condition
        }
      case 'image':
        return {
          title: block.title,
          srcPath: block.srcPath,
          alt: block.alt,
          width: block.width,
          height: block.height,
          radius: block.radius,
          caption: block.caption,
          style: block.style,
          condition: block.condition
        }
      case 'text':
        return {
          title: block.title,
          text: block.text,
          style: block.style,
          condition: block.condition
        }
      case 'code':
        return {
          title: block.title,
          label: block.label,
          showBarcode: block.showBarcode,
          showQr: block.showQr,
          style: block.style,
          condition: block.condition
        }
      case 'footer':
        return {
          note: block.note,
          showGeneratedAt: block.showGeneratedAt,
          style: block.style,
          condition: block.condition
        }
      default:
        return block
    }
  }
  const a = pick(current)
  const b = pick(other)
  const changes: string[] = []
  Object.keys(a).forEach((key) => {
    if (JSON.stringify((a as any)[key]) !== JSON.stringify((b as any)[key])) {
      changes.push(key)
    }
  })
  return changes
}

const renderCodes = async () => {
  await nextTick()
  const root = canvasRef.value
  if (!root) return
  const reportNo = store.standardData.order.reportNo || 'RPT-UNKNOWN'
  const barcodeEls = root.querySelectorAll('[data-barcode]') as NodeListOf<SVGElement>
  barcodeEls.forEach((el) => {
    JsBarcode(el, reportNo, {
      format: 'CODE128',
      displayValue: false,
      height: 40,
      margin: 0
    })
  })
  const qrEls = root.querySelectorAll('[data-qr]') as NodeListOf<HTMLImageElement>
  if (qrEls.length) {
    const dataUrl = await QRCode.toDataURL(reportNo, { margin: 0, width: 120 })
    qrEls.forEach((el) => {
      el.src = dataUrl
    })
  }
}

watch(
  () => [templateMode.value, store.activeTemplate?.blocks, store.activeTemplate?.html, store.standardData.order.reportNo],
  () => {
    if (templateMode.value === 'html' && !store.activeTemplate?.html) {
      syncHtmlFromBlocks()
    }
    renderCodes()
    if (!selectedBlockId.value) {
      selectedBlockId.value = store.activeTemplate?.blocks[0]?.id || ''
    }
  },
  { deep: true }
)

watch(
  () => store.activeTemplateId,
  () => {
    selectedBlockId.value = store.activeTemplate?.blocks[0]?.id || ''
  }
)

watch(
  [() => store.activeTemplateId, compareOptions],
  () => {
    if (!compareTemplateId.value || compareTemplateId.value === store.activeTemplateId) {
      compareTemplateId.value = compareOptions.value[0]?.id || ''
    }
  },
  { immediate: true }
)

watch(
  () => route.params.id,
  (id) => {
    if (!id || typeof id !== 'string') return
    store.setActiveTemplate(id)
  },
  { immediate: true }
)

onMounted(() => {
  selectedBlockId.value = store.activeTemplate?.blocks[0]?.id || ''
  renderCodes()
})
</script>

<style scoped>
.templates-page {
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

.library {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.library-item {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: grab;
  transition: all 0.2s ease;
}

.library-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-style: dashed;
}

.library-item:hover {
  border-color: #14b8a6;
  background: #ecfeff;
}

.library-title {
  font-weight: 600;
  font-size: 13px;
}

.library-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.canvas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.result-row {
  grid-template-columns: 1fr 1fr 110px auto;
}

.field-title {
  font-size: 12px;
  color: #475569;
  margin-bottom: 8px;
}

.block-props {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.html-editor {
  margin-top: 12px;
}

.block-muted {
  margin-left: 8px;
  font-size: 11px;
  color: #f59e0b;
}

.editor-block.is-muted {
  opacity: 0.6;
}

.diff-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.diff-section {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.diff-title {
  font-size: 12px;
  color: #0f172a;
  font-weight: 600;
  margin-bottom: 8px;
}

.diff-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.diff-item {
  font-size: 12px;
  color: #334155;
}

.diff-empty {
  font-size: 12px;
  color: #94a3b8;
}
</style>
