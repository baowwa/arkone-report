import { defineStore } from 'pinia'
import { defaultStandardData, type StandardReportData } from '@/data/defaultStandardData'
import { defaultTemplate } from '@/data/defaultTemplate'
import { TEMPLATE_PRESETS } from '@/data/templatePresets'
import { sampleRawData } from '@/data/sampleRawData'
import { getValueByPath, setValueByPath } from '@/utils/path'
import type { TemplateBlock, TemplateItem, TemplateMode } from '@/types/template'

const STORAGE_KEY = 'arkone-report-app'

export type FieldMapping = {
  id: string
  sourcePath: string
  targetPath: string
}

export type ResultItemMapping = {
  key: string
  sourceKey: string
}

export type DictionaryItem = {
  code: string
  name: string
  unit?: string
}

export type DictionaryFlag = {
  code: string
  label: string
  level: 'info' | 'warning' | 'critical'
}

export type ReportItem = {
  id: string
  reportNo: string
  patientName: string
  reportTime: string
  templateId: string
  templateName: string
  auditStatus: 'pending' | 'approved' | 'rejected'
  sendStatus: 'pending' | 'sent' | 'failed'
  data: StandardReportData
}

const defaultFieldMappings: FieldMapping[] = [
  { id: 'm1', sourcePath: 'patientInfo.name', targetPath: 'patient.name' },
  { id: 'm2', sourcePath: 'patientInfo.sex', targetPath: 'patient.gender' },
  { id: 'm3', sourcePath: 'patientInfo.age', targetPath: 'patient.age' },
  { id: 'm4', sourcePath: 'patientInfo.id', targetPath: 'patient.idNo' },
  { id: 'm5', sourcePath: 'patientInfo.visitNo', targetPath: 'patient.visitNo' },
  { id: 'm6', sourcePath: 'orderInfo.reportNo', targetPath: 'order.reportNo' },
  { id: 'm7', sourcePath: 'orderInfo.orderNo', targetPath: 'order.orderNo' },
  { id: 'm8', sourcePath: 'orderInfo.sampleTime', targetPath: 'order.sampleTime' },
  { id: 'm9', sourcePath: 'orderInfo.reportTime', targetPath: 'order.reportTime' },
  { id: 'm10', sourcePath: 'orderInfo.department', targetPath: 'order.department' },
  { id: 'm11', sourcePath: 'sourceInfo.labName', targetPath: 'source.labName' },
  { id: 'm12', sourcePath: 'sourceInfo.system', targetPath: 'source.system' },
  { id: 'm13', sourcePath: 'doctorInfo.name', targetPath: 'doctor.name' },
  { id: 'm14', sourcePath: 'doctorInfo.auditor', targetPath: 'doctor.auditor' }
]

const defaultResultMappings: ResultItemMapping[] = [
  { key: 'itemName', sourceKey: 'item' },
  { key: 'value', sourceKey: 'value' },
  { key: 'unit', sourceKey: 'unit' },
  { key: 'refRange', sourceKey: 'ref' },
  { key: 'flag', sourceKey: 'flag' }
]

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function normalizeTemplate(template: any): TemplateItem {
  if (!template || typeof template !== 'object') {
    return deepClone(defaultTemplate)
  }
  const blocks = Array.isArray(template.blocks) && template.blocks.length > 0
    ? template.blocks.map((block: any) => normalizeBlock(block))
    : deepClone(defaultTemplate.blocks)
  return {
    id: template.id || `tpl-${Date.now()}`,
    name: template.name || '未命名模板',
    version: template.version || 'v1.0',
    description: template.description || '',
    updatedAt: template.updatedAt || new Date().toISOString().slice(0, 16).replace('T', ' '),
    mode: template.mode === 'html' ? 'html' : 'structured',
    html: template.html || defaultTemplate.html,
    blocks
  }
}

function normalizeReport(report: any, fallbackTemplateId: string, fallbackTemplateName: string): ReportItem {
  if (!report || typeof report !== 'object') {
    return {
      id: `rpt-${Date.now()}`,
      reportNo: 'RPT-UNKNOWN',
      patientName: '未命名',
      reportTime: '',
      templateId: fallbackTemplateId,
      templateName: fallbackTemplateName,
      auditStatus: 'pending',
      sendStatus: 'pending',
      data: deepClone(defaultStandardData)
    }
  }
  return {
    id: report.id || `rpt-${Date.now()}`,
    reportNo: report.reportNo || report.data?.order?.reportNo || 'RPT-UNKNOWN',
    patientName: report.patientName || report.data?.patient?.name || '未命名',
    reportTime: report.reportTime || report.data?.order?.reportTime || '',
    templateId: report.templateId || fallbackTemplateId,
    templateName: report.templateName || fallbackTemplateName,
    auditStatus: report.auditStatus || 'pending',
    sendStatus: report.sendStatus || 'pending',
    data: report.data ? report.data : deepClone(defaultStandardData)
  }
}

function normalizeBlock(block: any): TemplateBlock {
  if (!block || typeof block !== 'object' || !block.type) {
    return createBlock('text')
  }
  const normalized = { ...block }
  if (!normalized.style) normalized.style = {}
  if (!normalized.condition) normalized.condition = { type: 'always' }

  if (normalized.type === 'info') {
    normalized.columns = Number(normalized.columns || 3)
    normalized.fields = Array.isArray(normalized.fields) ? normalized.fields : []
  }
  if (normalized.type === 'results') {
    normalized.columns = Array.isArray(normalized.columns) ? normalized.columns : []
  }
  return normalized as TemplateBlock
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function createBlock(type: TemplateBlock['type']): TemplateBlock {
  switch (type) {
    case 'header':
      return {
        id: uid('blk'),
        type: 'header',
        title: '检验报告',
        showBarcode: true,
        showQr: true,
        style: {},
        condition: { type: 'always' }
      }
    case 'info':
      return {
        id: uid('blk'),
        type: 'info',
        title: '信息块',
        columns: 3,
        style: {},
        condition: { type: 'always' },
        fields: [
          { id: uid('field'), label: '字段标题', path: 'patient.name' },
          { id: uid('field'), label: '字段标题', path: 'order.reportNo' }
        ]
      }
    case 'results':
      return {
        id: uid('blk'),
        type: 'results',
        title: '检验结果',
        style: {},
        condition: { type: 'always' },
        columns: [
          { id: uid('col'), label: '项目', key: 'itemName' },
          { id: uid('col'), label: '结果', key: 'value' },
          { id: uid('col'), label: '单位', key: 'unit' },
          { id: uid('col'), label: '参考范围', key: 'refRange' },
          { id: uid('col'), label: '提示', key: 'flagLabel' }
        ]
      }
    case 'text':
      return {
        id: uid('blk'),
        type: 'text',
        title: '文本说明',
        text: '请输入说明文字',
        style: {},
        condition: { type: 'always' }
      }
    case 'code':
      return {
        id: uid('blk'),
        type: 'code',
        title: '条码/二维码',
        label: '条码信息',
        showBarcode: true,
        showQr: true,
        style: {},
        condition: { type: 'always' }
      }
    case 'footer':
    default:
      return {
        id: uid('blk'),
        type: 'footer',
        title: '页脚',
        note: '报告仅供临床参考，请结合患者情况综合判断。',
        showGeneratedAt: true,
        style: {},
        condition: { type: 'always' }
      }
  }
}

function mapRawToStandard(
  rawData: any,
  fieldMappings: FieldMapping[],
  resultArrayPath: string,
  resultMappings: ResultItemMapping[],
  orgInfo: StandardReportData['org']
): StandardReportData {
  const base = deepClone(defaultStandardData)
  base.org = { ...base.org, ...orgInfo }

  fieldMappings.forEach((mapping) => {
    if (!mapping.sourcePath || !mapping.targetPath) return
    const value = getValueByPath(rawData, mapping.sourcePath)
    if (value !== undefined) {
      setValueByPath(base, mapping.targetPath, value)
    }
  })

  const rawResults = getValueByPath(rawData, resultArrayPath)
  if (Array.isArray(rawResults)) {
    base.results = rawResults.map((item) => {
      const mapped: Record<string, any> = {}
      resultMappings.forEach((mapping) => {
        if (!mapping.sourceKey) return
        const value = getValueByPath(item, mapping.sourceKey)
        if (value !== undefined) {
          mapped[mapping.key] = value
        }
      })
      return {
        itemName: '',
        value: '',
        unit: '',
        refRange: '',
        flag: '',
        ...mapped
      }
    })
  }

  return base
}

export const useAppStore = defineStore('app', {
  state: () => ({
    rawInput: JSON.stringify(sampleRawData, null, 2),
    rawData: sampleRawData as any,
    fieldMappings: deepClone(defaultFieldMappings),
    resultArrayPath: 'results',
    resultMappings: deepClone(defaultResultMappings),
    standardData: deepClone(defaultStandardData),
    reportData: deepClone(defaultStandardData),
    reports: [] as ReportItem[],
    activeReportId: '',
    templates: TEMPLATE_PRESETS.map((item) => deepClone(item)) as TemplateItem[],
    activeTemplateId: defaultTemplate.id,
    orgInfo: {
      name: '示例医院',
      address: '示例市示例区示例路 88 号',
      phone: '010-88888888'
    },
    dictionary: {
      items: [
        { code: 'WBC', name: '白细胞计数', unit: '10^9/L' },
        { code: 'HGB', name: '血红蛋白', unit: 'g/L' },
        { code: 'PLT', name: '血小板', unit: '10^9/L' }
      ] as DictionaryItem[],
      flags: [
        { code: 'H', label: '偏高', level: 'warning' },
        { code: 'L', label: '偏低', level: 'warning' },
        { code: 'C', label: '危急', level: 'critical' }
      ] as DictionaryFlag[]
    }
  }),
  getters: {
    activeTemplate(state) {
      return state.templates.find((item) => item.id === state.activeTemplateId) || state.templates[0]
    }
  },
  actions: {
    initReports() {
      if (this.reports.length) return
      const base = deepClone(defaultStandardData)
      const reportA = deepClone(base)
      reportA.patient.name = '张三'
      reportA.patient.gender = '男'
      reportA.patient.age = '32'
      reportA.order.reportNo = 'RPT-20260206-001'
      reportA.order.reportTime = '2026-02-06 10:12'
      reportA.results = [
        { itemName: '白细胞计数', value: '12.2', unit: '10^9/L', refRange: '4.0-10.0', flag: 'H' },
        { itemName: '血红蛋白', value: '106', unit: 'g/L', refRange: '120-160', flag: 'L' }
      ]

      const reportB = deepClone(base)
      reportB.patient.name = '李四'
      reportB.patient.gender = '女'
      reportB.patient.age = '45'
      reportB.order.reportNo = 'RPT-20260206-002'
      reportB.order.reportTime = '2026-02-06 11:08'
      reportB.results = [
        { itemName: '血小板', value: '236', unit: '10^9/L', refRange: '100-300', flag: '' },
        { itemName: '血红蛋白', value: '128', unit: 'g/L', refRange: '120-160', flag: '' }
      ]

      const reportC = deepClone(base)
      reportC.patient.name = '王五'
      reportC.patient.gender = '男'
      reportC.patient.age = '57'
      reportC.order.reportNo = 'RPT-20260206-003'
      reportC.order.reportTime = '2026-02-06 12:30'
      reportC.results = [
        { itemName: '白细胞计数', value: '7.2', unit: '10^9/L', refRange: '4.0-10.0', flag: '' },
        { itemName: '血小板', value: '190', unit: '10^9/L', refRange: '100-300', flag: '' }
      ]

      this.reports = [
        {
          id: 'rpt-001',
          reportNo: reportA.order.reportNo,
          patientName: reportA.patient.name,
          reportTime: reportA.order.reportTime,
          templateId: this.templates[0]?.id || defaultTemplate.id,
          templateName: this.templates[0]?.name || '标准检验报告',
          auditStatus: 'approved',
          sendStatus: 'sent',
          data: reportA
        },
        {
          id: 'rpt-002',
          reportNo: reportB.order.reportNo,
          patientName: reportB.patient.name,
          reportTime: reportB.order.reportTime,
          templateId: this.templates[1]?.id || defaultTemplate.id,
          templateName: this.templates[1]?.name || '紧凑版报告',
          auditStatus: 'pending',
          sendStatus: 'pending',
          data: reportB
        },
        {
          id: 'rpt-003',
          reportNo: reportC.order.reportNo,
          patientName: reportC.patient.name,
          reportTime: reportC.order.reportTime,
          templateId: this.templates[2]?.id || defaultTemplate.id,
          templateName: this.templates[2]?.name || '清爽版报告',
          auditStatus: 'rejected',
          sendStatus: 'failed',
          data: reportC
        }
      ]
      this.activeReportId = this.reports[0]?.id || ''
      this.reportData = deepClone(this.reports[0]?.data || defaultStandardData)
    },
    setActiveReport(id: string) {
      const report = this.reports.find((item) => item.id === id)
      if (!report) return
      report.auditStatus = report.auditStatus || 'pending'
      report.sendStatus = report.sendStatus || 'pending'
      this.activeReportId = report.id
      this.reportData = deepClone(report.data)
      this.activeTemplateId = report.templateId || this.activeTemplateId
    },
    loadFromStorage() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        this.initReports()
        this.parseRawInput()
        this.applyMapping()
        return
      }
      try {
        const data = JSON.parse(raw)
        this.rawInput = data.rawInput ?? this.rawInput
        this.fieldMappings = data.fieldMappings ?? this.fieldMappings
        this.resultArrayPath = data.resultArrayPath ?? this.resultArrayPath
        this.resultMappings = data.resultMappings ?? this.resultMappings
        this.templates = Array.isArray(data.templates)
          ? data.templates.map((item: any) => normalizeTemplate(item))
          : this.templates
        this.reports = Array.isArray(data.reports)
          ? data.reports.map((item: any) =>
              normalizeReport(
                item,
                this.templates[0]?.id || defaultTemplate.id,
                this.templates[0]?.name || '标准检验报告'
              )
            )
          : this.reports
        this.activeReportId = data.activeReportId ?? this.activeReportId
        if (this.reports.length === 0) this.initReports()
        this.activeTemplateId = data.activeTemplateId ?? this.activeTemplateId
        this.orgInfo = data.orgInfo ?? this.orgInfo
        this.dictionary = data.dictionary ?? this.dictionary
        this.parseRawInput()
        this.applyMapping()
      } catch {
        this.initReports()
        this.parseRawInput()
        this.applyMapping()
      }
    },
    persistToStorage() {
      const payload = {
        rawInput: this.rawInput,
        fieldMappings: this.fieldMappings,
        resultArrayPath: this.resultArrayPath,
        resultMappings: this.resultMappings,
        templates: this.templates,
        reports: this.reports,
        activeReportId: this.activeReportId,
        activeTemplateId: this.activeTemplateId,
        orgInfo: this.orgInfo,
        dictionary: this.dictionary
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    },
    parseRawInput() {
      try {
        this.rawData = JSON.parse(this.rawInput)
        return { ok: true, error: '' }
      } catch (error) {
        this.rawData = null
        return { ok: false, error: (error as Error).message }
      }
    },
    applyMapping() {
      if (!this.rawData) return
      this.standardData = mapRawToStandard(
        this.rawData,
        this.fieldMappings,
        this.resultArrayPath,
        this.resultMappings,
        this.orgInfo
      )
    },
    setActiveTemplate(id: string) {
      this.activeTemplateId = id
    },
    updateTemplateHtml(id: string, html: string) {
      const target = this.templates.find((item) => item.id === id)
      if (target) {
        target.html = html
        target.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
      }
    },
    updateTemplateMeta(id: string, payload: Partial<TemplateItem>) {
      const target = this.templates.find((item) => item.id === id)
      if (!target) return
      if (payload.name !== undefined) target.name = payload.name
      if (payload.version !== undefined) target.version = payload.version
      if (payload.description !== undefined) target.description = payload.description
      target.updatedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
    },
    setTemplateMode(id: string, mode: TemplateMode) {
      const target = this.templates.find((item) => item.id === id)
      if (target) {
        target.mode = mode
      }
    },
    addTemplate() {
      const id = `tpl-${Date.now()}`
      const baseVersion = this.templates.length ? `v${this.templates.length + 1}.0` : 'v1.0'
      this.templates.unshift({
        id,
        name: '自定义模板',
        version: baseVersion,
        description: '新建模板',
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        mode: 'structured',
        html: defaultTemplate.html,
        blocks: deepClone(defaultTemplate.blocks)
      })
      this.activeTemplateId = id
    },
    duplicateTemplate(id: string) {
      const target = this.templates.find((item) => item.id === id)
      if (!target) return
      const idNew = `tpl-${Date.now()}`
      const versionNumber = this.templates.length + 1
      const newVersion = `v${versionNumber}.0`
      this.templates.unshift({
        ...deepClone(target),
        id: idNew,
        name: `${target.name}-复制`,
        version: newVersion,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
      })
      this.activeTemplateId = idNew
    },
    removeTemplate(id: string) {
      if (this.templates.length <= 1) return
      this.templates = this.templates.filter((item) => item.id !== id)
      if (this.activeTemplateId === id) {
        this.activeTemplateId = this.templates[0].id
      }
    },
    updateOrgInfo(payload: Partial<StandardReportData['org']>) {
      this.orgInfo = { ...this.orgInfo, ...payload }
      this.standardData.org = { ...this.standardData.org, ...this.orgInfo }
    },
    resetMappings() {
      this.fieldMappings = deepClone(defaultFieldMappings)
      this.resultMappings = deepClone(defaultResultMappings)
      this.resultArrayPath = 'results'
    },
    addBlock(templateId: string, type: TemplateBlock['type'], index?: number) {
      const target = this.templates.find((item) => item.id === templateId)
      if (!target) return ''
      const block = createBlock(type)
      if (typeof index === 'number') {
        target.blocks.splice(index, 0, block)
      } else {
        target.blocks.push(block)
      }
      return block.id
    },
    updateBlock(templateId: string, blockId: string, payload: Partial<TemplateBlock>) {
      const target = this.templates.find((item) => item.id === templateId)
      if (!target) return
      const block = target.blocks.find((item) => item.id === blockId)
      if (!block) return
      Object.assign(block, payload)
    },
    removeBlock(templateId: string, blockId: string) {
      const target = this.templates.find((item) => item.id === templateId)
      if (!target) return
      target.blocks = target.blocks.filter((item) => item.id !== blockId)
    },
    duplicateBlock(templateId: string, blockId: string) {
      const target = this.templates.find((item) => item.id === templateId)
      if (!target) return
      const block = target.blocks.find((item) => item.id === blockId)
      if (!block) return
      const cloned = deepClone(block)
      cloned.id = uid('blk')
      target.blocks.push(cloned)
    },
    moveBlock(templateId: string, sourceId: string, targetId: string) {
      const target = this.templates.find((item) => item.id === templateId)
      if (!target) return
      const sourceIndex = target.blocks.findIndex((item) => item.id === sourceId)
      const targetIndex = target.blocks.findIndex((item) => item.id === targetId)
      if (sourceIndex === -1 || targetIndex === -1) return
      const [moved] = target.blocks.splice(sourceIndex, 1)
      target.blocks.splice(targetIndex, 0, moved)
    },
    moveBlockToEnd(templateId: string, sourceId: string) {
      const target = this.templates.find((item) => item.id === templateId)
      if (!target) return
      const sourceIndex = target.blocks.findIndex((item) => item.id === sourceId)
      if (sourceIndex === -1) return
      const [moved] = target.blocks.splice(sourceIndex, 1)
      target.blocks.push(moved)
    }
  }
})
