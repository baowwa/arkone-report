import { nowText, formatDate } from '@/utils/format'
import type { StandardReportData } from '@/data/defaultStandardData'

function flagMeta(flag?: string) {
  if (!flag) return { label: '', className: '' }
  if (flag === 'H') return { label: '偏高', className: 'flag-high' }
  if (flag === 'L') return { label: '偏低', className: 'flag-low' }
  if (flag === 'C') return { label: '危急', className: 'flag-critical' }
  return { label: flag, className: 'flag-custom' }
}

export function prepareTemplateData(data: StandardReportData) {
  const clone = JSON.parse(JSON.stringify(data)) as any
  clone.order.sampleTime = formatDate(clone.order.sampleTime)
  clone.order.reportTime = formatDate(clone.order.reportTime)

  clone.results = clone.results.map((result: any) => {
    const meta = flagMeta(result.flag)
    return {
      ...result,
      flagLabel: meta.label,
      flagClass: meta.className
    }
  })

  return {
    ...clone,
    meta: {
      generatedAt: nowText()
    }
  }
}
