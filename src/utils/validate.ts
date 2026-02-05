import type { StandardReportData } from '@/data/defaultStandardData'

export type ValidationItem = {
  id: string
  level: 'warning' | 'error'
  message: string
}

export function validateReport(data: StandardReportData): ValidationItem[] {
  const issues: ValidationItem[] = []
  if (!data.patient.name) {
    issues.push({ id: 'patient.name', level: 'error', message: '患者姓名缺失' })
  }
  if (!data.order.reportNo) {
    issues.push({ id: 'order.reportNo', level: 'warning', message: '报告号缺失' })
  }
  if (!data.order.sampleTime) {
    issues.push({ id: 'order.sampleTime', level: 'warning', message: '采样时间缺失' })
  }
  if (!data.results.length) {
    issues.push({ id: 'results', level: 'error', message: '检验结果为空' })
  }
  return issues
}
