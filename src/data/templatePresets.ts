import type { TemplateItem, TemplateBlock } from '@/types/template'
import { buildTemplateHtml } from '@/utils/templateRenderer'

const baseBlocks: TemplateBlock[] = [
  {
    id: 'blk-header',
    type: 'header',
    title: '检验报告',
    showBarcode: true,
    showQr: true,
    condition: { type: 'always' }
  },
  {
    id: 'blk-patient',
    type: 'info',
    title: '患者信息',
    columns: 3,
    condition: { type: 'always' },
    fields: [
      { id: 'f1', label: '姓名', path: 'patient.name' },
      { id: 'f2', label: '性别', path: 'patient.gender' },
      { id: 'f3', label: '年龄', path: 'patient.age' },
      { id: 'f4', label: '就诊号', path: 'patient.visitNo' },
      { id: 'f5', label: '证件号', path: 'patient.idNo' },
      { id: 'f6', label: '检验科室', path: 'order.department' }
    ]
  },
  {
    id: 'blk-order',
    type: 'info',
    title: '检验信息',
    columns: 3,
    condition: { type: 'always' },
    fields: [
      { id: 'f7', label: '报告号', path: 'order.reportNo' },
      { id: 'f8', label: '申请单号', path: 'order.orderNo' },
      { id: 'f9', label: '采样时间', path: 'order.sampleTime' },
      { id: 'f10', label: '报告时间', path: 'order.reportTime' },
      { id: 'f11', label: '申请医生', path: 'doctor.name' },
      { id: 'f12', label: '审核医生', path: 'doctor.auditor' }
    ]
  },
  {
    id: 'blk-results',
    type: 'results',
    title: '检验结果',
    condition: { type: 'always' },
    columns: [
      { id: 'c1', label: '项目', key: 'itemName' },
      { id: 'c2', label: '结果', key: 'value', align: 'center' },
      { id: 'c3', label: '单位', key: 'unit', align: 'center' },
      { id: 'c4', label: '参考范围', key: 'refRange' },
      { id: 'c5', label: '提示', key: 'flagLabel', align: 'center' }
    ]
  },
  {
    id: 'blk-source',
    type: 'info',
    title: '来源信息',
    columns: 2,
    condition: { type: 'always' },
    fields: [
      { id: 'f13', label: '来源实验室', path: 'source.labName' },
      { id: 'f14', label: '来源系统', path: 'source.system' }
    ]
  },
  {
    id: 'blk-footer',
    type: 'footer',
    note: '报告仅供临床参考，请结合患者情况综合判断。',
    showGeneratedAt: true,
    condition: { type: 'always' }
  }
]

const compactStyle: TemplateBlock[] = baseBlocks.map((block) => {
  if (block.type === 'info') {
    return {
      ...block,
      columns: 4,
      style: { fontSize: 12, marginBottom: '10px', padding: '8px 0' }
    }
  }
  if (block.type === 'results') {
    return {
      ...block,
      style: { fontSize: 12, marginBottom: '10px' }
    }
  }
  if (block.type === 'header') {
    return {
      ...block,
      style: { marginBottom: '8px' }
    }
  }
  return block
})

const cleanStyle: TemplateBlock[] = baseBlocks.map((block) => {
  if (block.type === 'header') {
    return {
      ...block,
      style: {
        border: '1px solid #e2e8f0',
        padding: '12px',
        borderRadius: '10px',
        background: 'linear-gradient(90deg, #f8fafc, #ffffff)'
      }
    }
  }
  if (block.type === 'info') {
    return {
      ...block,
      style: { background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' }
    }
  }
  if (block.type === 'results') {
    return {
      ...block,
      style: { background: '#ffffff', border: '1px solid #eef2f7', padding: '8px', borderRadius: '10px' }
    }
  }
  return block
})

const classicStyle: TemplateBlock[] = baseBlocks.map((block) => {
  if (block.type === 'header') {
    return {
      ...block,
      style: { borderBottom: '2px solid #0f766e', padding: '0 0 10px 0' }
    }
  }
  if (block.type === 'info') {
    return {
      ...block,
      style: { marginBottom: '14px' }
    }
  }
  if (block.type === 'results') {
    return {
      ...block,
      style: { marginBottom: '14px' }
    }
  }
  if (block.type === 'footer') {
    return {
      ...block,
      style: { borderTop: '1px solid #e5e7eb', padding: '10px 0 0 0' }
    }
  }
  return block
})

function buildTemplate(id: string, name: string, description: string, blocks: TemplateBlock[]): TemplateItem {
  return {
    id,
    name,
    version: 'v1.0',
    description,
    updatedAt: '2026-02-06 10:00',
    mode: 'structured',
    blocks,
    html: buildTemplateHtml(blocks)
  }
}

const tbBlocks: TemplateBlock[] = [
  {
    id: 'blk-header',
    type: 'header',
    title: '结核检验报告',
    showBarcode: true,
    showQr: true,
    condition: { type: 'always' },
    style: { borderBottom: '2px solid #0f766e', padding: '0 0 10px 0' }
  },
  {
    id: 'blk-section-patient',
    type: 'info',
    title: '送检信息',
    columns: 3,
    condition: { type: 'always' },
    style: { background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' },
    fields: [
      { id: 'f1', label: '受检者姓名', path: 'patient.name' },
      { id: 'f2', label: '性别', path: 'patient.gender' },
      { id: 'f3', label: '年龄', path: 'patient.age' },
      { id: 'f4', label: '就诊号', path: 'patient.visitNo' },
      { id: 'f5', label: '送检科室', path: 'order.department' },
      { id: 'f6', label: '送检医生', path: 'doctor.name' }
    ]
  },
  {
    id: 'blk-section-specimen',
    type: 'info',
    title: '样本信息',
    columns: 3,
    condition: { type: 'always' },
    style: { background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' },
    fields: [
      { id: 'f7', label: '样本编号', path: 'order.orderNo' },
      { id: 'f8', label: '样本类型', path: 'order.specimenType' },
      { id: 'f9', label: '采样时间', path: 'order.sampleTime' },
      { id: 'f10', label: '报告时间', path: 'order.reportTime' },
      { id: 'f11', label: '检测方法', path: 'order.method' },
      { id: 'f12', label: '复检状态', path: 'order.recheck' }
    ]
  },
  {
    id: 'blk-section-results',
    type: 'results',
    title: '结核检测结果',
    condition: { type: 'always' },
    style: { background: '#ffffff', border: '1px solid #eef2f7', padding: '8px', borderRadius: '10px' },
    columns: [
      { id: 'c1', label: '项目', key: 'itemName' },
      { id: 'c2', label: '结果', key: 'value', align: 'center' },
      { id: 'c3', label: '单位', key: 'unit', align: 'center' },
      { id: 'c4', label: '参考范围', key: 'refRange' },
      { id: 'c5', label: '提示', key: 'flagLabel', align: 'center' }
    ]
  },
  {
    id: 'blk-section-summary',
    type: 'cards',
    title: '本次检测结果综述',
    dataPath: 'summaryCards',
    columns: 3,
    condition: { type: 'always' },
    style: { marginBottom: '16px' }
  },
  {
    id: 'blk-section-resistance',
    type: 'results',
    title: '耐药结果',
    dataPath: 'resistanceResults',
    condition: { type: 'always' },
    style: { background: '#ffffff', border: '1px solid #eef2f7', padding: '8px', borderRadius: '10px' },
    columns: [
      { id: 'c1', label: '分类', key: 'category' },
      { id: 'c2', label: '中文名', key: 'name' },
      { id: 'c3', label: '拉丁文名', key: 'latinName' },
      { id: 'c4', label: '疑似耐药药物', key: 'resistantDrug' }
    ]
  },
  {
    id: 'blk-text',
    type: 'text',
    text: '结核相关检测结果仅供临床参考，请结合患者情况综合判断。',
    condition: { type: 'always' }
  },
  {
    id: 'blk-footer',
    type: 'footer',
    note: '检测机构：示例医院检验科',
    showGeneratedAt: true,
    condition: { type: 'always' }
  }
]

const hivBlocks: TemplateBlock[] = [
  {
    id: 'blk-header',
    type: 'header',
    title: 'HIV-1耐药及亚型检测报告',
    showBarcode: true,
    showQr: true,
    condition: { type: 'always' },
    style: {
      borderBottom: '2px solid #0f766e',
      padding: '0 0 10px 0'
    }
  },
  {
    id: 'blk-logo',
    type: 'image',
    title: '机构标识',
    srcPath: 'org.logo',
    alt: '机构标识',
    width: '96px',
    height: '96px',
    radius: '18px',
    caption: '示例医院',
    condition: { type: 'always' },
    style: { marginBottom: '12px' }
  },
  {
    id: 'blk-section-sample',
    type: 'info',
    title: '样本信息',
    columns: 4,
    condition: { type: 'always' },
    style: { background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' },
    fields: [
      { id: 'f1', label: '样本编号', path: 'order.orderNo' },
      { id: 'f2', label: '检测日期', path: 'order.testDate' },
      { id: 'f3', label: '样本亚型', path: 'order.subtype' },
      { id: 'f4', label: '覆盖区域', path: 'order.coverage' },
      { id: 'f5', label: '检测方法', path: 'order.method' },
      { id: 'f6', label: '耐药解析系统', path: 'order.analysisSystem' },
      { id: 'f7', label: '检测频率阈值', path: 'order.threshold' },
      { id: 'f8', label: '耐药突变数', path: 'order.mutationCount' }
    ]
  },
  {
    id: 'blk-section-hiv',
    type: 'results',
    title: '耐药及相关突变结果',
    dataPath: 'hivResistanceResults',
    condition: { type: 'always' },
    style: { background: '#ffffff', border: '1px solid #eef2f7', padding: '8px', borderRadius: '10px' },
    columns: [
      { id: 'c1', label: '基因区', key: 'geneRegion' },
      { id: 'c2', label: '耐药相关突变', key: 'mutation' },
      { id: 'c3', label: '抗病毒药物', key: 'drug' },
      { id: 'c4', label: '耐药程度', key: 'level' }
    ]
  },
  {
    id: 'blk-text',
    type: 'text',
    text: 'HIV-1耐药及亚型检测结果需结合临床综合判断。',
    condition: { type: 'always' }
  },
  {
    id: 'blk-footer',
    type: 'footer',
    note: '检测机构：示例医院检验科',
    showGeneratedAt: true,
    condition: { type: 'always' }
  }
]

const routineBlocks: TemplateBlock[] = [
  {
    id: 'blk-header',
    type: 'header',
    title: '常规检验报告',
    showBarcode: true,
    showQr: true,
    condition: { type: 'always' },
    style: { marginBottom: '8px' }
  },
  {
    id: 'blk-section-patient',
    type: 'info',
    title: '患者信息',
    columns: 3,
    condition: { type: 'always' },
    style: { background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' },
    fields: [
      { id: 'f1', label: '姓名', path: 'patient.name' },
      { id: 'f2', label: '性别', path: 'patient.gender' },
      { id: 'f3', label: '年龄', path: 'patient.age' },
      { id: 'f4', label: '就诊号', path: 'patient.visitNo' },
      { id: 'f5', label: '证件号', path: 'patient.idNo' },
      { id: 'f6', label: '检验科室', path: 'order.department' }
    ]
  },
  {
    id: 'blk-section-order',
    type: 'info',
    title: '检验信息',
    columns: 3,
    condition: { type: 'always' },
    style: { background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' },
    fields: [
      { id: 'f7', label: '报告号', path: 'order.reportNo' },
      { id: 'f8', label: '申请单号', path: 'order.orderNo' },
      { id: 'f9', label: '采样时间', path: 'order.sampleTime' },
      { id: 'f10', label: '报告时间', path: 'order.reportTime' },
      { id: 'f11', label: '申请医生', path: 'doctor.name' },
      { id: 'f12', label: '审核医生', path: 'doctor.auditor' }
    ]
  },
  {
    id: 'blk-section-results',
    type: 'results',
    title: '常规检验结果',
    condition: { type: 'always' },
    style: { background: '#ffffff', border: '1px solid #eef2f7', padding: '8px', borderRadius: '10px' },
    columns: [
      { id: 'c1', label: '项目', key: 'itemName' },
      { id: 'c2', label: '结果', key: 'value', align: 'center' },
      { id: 'c3', label: '单位', key: 'unit', align: 'center' },
      { id: 'c4', label: '参考范围', key: 'refRange' },
      { id: 'c5', label: '提示', key: 'flagLabel', align: 'center' }
    ]
  },
  {
    id: 'blk-text',
    type: 'text',
    text: '常规检验结果仅供临床参考。',
    condition: { type: 'always' }
  },
  {
    id: 'blk-footer',
    type: 'footer',
    note: '检测机构：示例医院检验科',
    showGeneratedAt: true,
    condition: { type: 'always' }
  }
]

export const TEMPLATE_PRESETS: TemplateItem[] = [
  buildTemplate('tpl-tb-001', '结核报告模板', '适用于结核相关检验的标准化模板。', tbBlocks),
  buildTemplate('tpl-hiv-001', 'HIV 报告模板', '适用于 HIV 检测报告的标准化模板。', hivBlocks),
  buildTemplate('tpl-routine-001', '常规检验报告模板', '适用于常规检验项目的标准化模板。', routineBlocks)
]
