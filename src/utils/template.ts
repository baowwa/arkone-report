import { nowText, formatDate } from '@/utils/format'
import type { StandardReportData } from '@/data/defaultStandardData'

const cardPalette = {
  rose: { bg: '#fecaca', border: '#fda4af', icon: '#fb7185' },
  teal: { bg: '#a7f3d0', border: '#5eead4', icon: '#14b8a6' },
  amber: { bg: '#fdba74', border: '#fb923c', icon: '#f97316' },
  slate: { bg: '#e2e8f0', border: '#cbd5f5', icon: '#64748b' }
} as const

type CardTone = keyof typeof cardPalette

const iconFactory = {
  microbe: (color: string) => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#ffffff" stroke="${color}" stroke-width="3" />
      <path d="M16 24c4-4 12-4 16 0" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <path d="M18 16c3 2 9 2 12 0" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <path d="M18 32c3-2 9-2 12 0" stroke="${color}" stroke-width="3" stroke-linecap="round" />
    </svg>
  `,
  bacteria: (color: string) => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="24" cy="24" r="20" fill="#ffffff" stroke="${color}" stroke-width="3" />
      <circle cx="18" cy="18" r="3" fill="${color}" />
      <circle cx="30" cy="20" r="2.5" fill="${color}" />
      <circle cx="22" cy="30" r="2.5" fill="${color}" />
      <path d="M24 12v8M24 28v8" stroke="${color}" stroke-width="3" stroke-linecap="round" />
    </svg>
  `,
  virus: (color: string) => `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="24" cy="24" r="14" fill="#ffffff" stroke="${color}" stroke-width="3" />
      <line x1="24" y1="4" x2="24" y2="12" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <line x1="24" y1="36" x2="24" y2="44" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <line x1="4" y1="24" x2="12" y2="24" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <line x1="36" y1="24" x2="44" y2="24" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <line x1="10" y1="10" x2="16" y2="16" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <line x1="32" y1="32" x2="38" y2="38" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <line x1="10" y1="38" x2="16" y2="32" stroke="${color}" stroke-width="3" stroke-linecap="round" />
      <line x1="32" y1="16" x2="38" y2="10" stroke="${color}" stroke-width="3" stroke-linecap="round" />
    </svg>
  `
}

const buildCardIcon = (key: string | undefined, tone: CardTone) => {
  const palette = cardPalette[tone] || cardPalette.teal
  const factory = key && key in iconFactory ? iconFactory[key as keyof typeof iconFactory] : iconFactory.microbe
  return factory(palette.icon)
}

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

  const summaryCards = Array.isArray(clone.summaryCards) ? clone.summaryCards : []
  clone.summaryCards = summaryCards.map((card: any) => {
    const tone = (card.tone as CardTone) || 'teal'
    const palette = cardPalette[tone] || cardPalette.teal
    return {
      ...card,
      tone,
      bgColor: palette.bg,
      borderColor: palette.border,
      iconSvg: buildCardIcon(card.iconKey, tone),
      iconUrl: card.iconUrl || '',
      iconAlt: card.iconAlt || card.title || '图标'
    }
  })

  if (!Array.isArray(clone.resistanceResults)) {
    clone.resistanceResults = []
  }

  if (!Array.isArray(clone.hivResistanceResults)) {
    clone.hivResistanceResults = []
  }

  return {
    ...clone,
    meta: {
      generatedAt: nowText()
    }
  }
}
