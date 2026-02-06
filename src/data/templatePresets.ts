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
      style: { fontSize: 12, marginBottom: '12px' }
    }
  }
  if (block.type === 'results') {
    return {
      ...block,
      style: { fontSize: 12, marginBottom: '12px' }
    }
  }
  if (block.type === 'header') {
    return {
      ...block,
      style: { marginBottom: '12px' }
    }
  }
  return block
})

const cleanStyle: TemplateBlock[] = baseBlocks.map((block) => {
  if (block.type === 'header') {
    return {
      ...block,
      style: { border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px' }
    }
  }
  if (block.type === 'info') {
    return {
      ...block,
      style: { background: '#f8fafc', padding: '10px 12px', borderRadius: '10px' }
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

export const TEMPLATE_PRESETS: TemplateItem[] = [
  buildTemplate('tpl-standard-001', '标准检验报告', '标准化检验报告模板，覆盖患者信息、检验信息与结果表格。', baseBlocks),
  buildTemplate('tpl-compact-001', '紧凑版报告', '信息密度更高，适合结果项较多的报告。', compactStyle),
  buildTemplate('tpl-clean-001', '清爽版报告', '分区更明显，便于阅读。', cleanStyle)
]
