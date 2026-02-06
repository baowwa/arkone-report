import type { BlockCondition, BlockStyle, TemplateBlock, TemplateItem, TemplateMode } from '@/types/template'
import { getValueByPath } from '@/utils/path'

const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (match) => escapeMap[match])
}

function styleToString(style?: BlockStyle) {
  if (!style) return ''
  const rules: string[] = []
  if (style.fontSize) rules.push(`font-size:${style.fontSize}px`)
  if (style.textAlign) rules.push(`text-align:${style.textAlign}`)
  if (style.padding) rules.push(`padding:${escapeHtml(style.padding)}`)
  if (style.marginBottom) rules.push(`margin-bottom:${escapeHtml(style.marginBottom)}`)
  if (style.background) rules.push(`background:${escapeHtml(style.background)}`)
  if (style.border) rules.push(`border:${escapeHtml(style.border)}`)
  if (style.borderBottom) rules.push(`border-bottom:${escapeHtml(style.borderBottom)}`)
  if (style.borderRadius) rules.push(`border-radius:${escapeHtml(style.borderRadius)}`)
  return rules.length ? ` style="${rules.join(';')}"` : ''
}

export function isBlockVisible(block: TemplateBlock, data?: any) {
  if (block.hidden) return false
  const condition: BlockCondition = block.condition || { type: 'always' }
  if (!data) return true
  if (condition.type === 'always') return true
  if (condition.type === 'fieldHasValue') {
    const value = getValueByPath(data, condition.path)
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    return true
  }
  if (condition.type === 'resultsHasFlag') {
    const flag = condition.flag
    const rows = Array.isArray(data?.results) ? data.results : []
    return rows.some((row: any) => row.flag === flag || row.flagLabel === flag)
  }
  return true
}

function renderHeader(block: TemplateBlock) {
  if (block.type !== 'header') return ''
  const title = escapeHtml(block.title || '检验报告')
  const codes = block.showBarcode || block.showQr
  const style = styleToString(block.style)
  return `
  <header class="report-header"${style}>
    <div class="report-brand">
      <div class="report-org">{{org.name}}</div>
      <div class="report-org-sub">{{org.address}} · {{org.phone}}</div>
    </div>
    <div class="report-title">${title}</div>
    ${
      codes
        ? `<div class="report-codes">
      ${block.showBarcode ? `<svg data-barcode></svg>` : ''}
      ${block.showQr ? `<img data-qr alt="二维码" />` : ''}
    </div>`
        : ''
    }
  </header>
  `
}

function renderInfoBlock(block: TemplateBlock) {
  if (block.type !== 'info') return ''
  const title = escapeHtml(block.title || '信息')
  const columns = Math.max(1, Math.min(block.columns || 3, 4))
  const style = styleToString(block.style)
  const fieldHtml = block.fields
    .map((field) => {
      const label = escapeHtml(field.label)
      return `<div><span>${label}</span>{{${field.path}}}</div>`
    })
    .join('')

  return `
  <section class="report-section"${style}>
    <div class="section-title">${title}</div>
    <div class="info-grid" style="grid-template-columns: repeat(${columns}, minmax(0, 1fr));">
      ${fieldHtml}
    </div>
  </section>
  `
}

function renderResultsBlock(block: TemplateBlock) {
  if (block.type !== 'results') return ''
  const title = escapeHtml(block.title || '检验结果')
  const style = styleToString(block.style)
  const dataPath = block.dataPath || 'results'
  const headers = block.columns
    .map((column) => {
      const inline: string[] = []
      if (column.align) inline.push(`text-align:${column.align}`)
      if (column.width) inline.push(`width:${escapeHtml(column.width)}`)
      const attr = inline.length ? ` style="${inline.join(';')}"` : ''
      return `<th${attr}>${escapeHtml(column.label)}</th>`
    })
    .join('')
  const body = block.columns
    .map((column) => {
      const inline: string[] = []
      if (column.align) inline.push(`text-align:${column.align}`)
      if (column.width) inline.push(`width:${escapeHtml(column.width)}`)
      const attr = inline.length ? ` style="${inline.join(';')}"` : ''
      return `<td${attr}>{{${column.key}}}</td>`
    })
    .join('')

  return `
  <section class="report-section"${style}>
    <div class="section-title">${title}</div>
    <table class="result-table">
      <thead>
        <tr>${headers}</tr>
      </thead>
      <tbody>
        {{#${dataPath}}}
        <tr class="{{flagClass}}">
          ${body}
        </tr>
        {{/${dataPath}}}
      </tbody>
    </table>
  </section>
  `
}

function renderCardsBlock(block: TemplateBlock) {
  if (block.type !== 'cards') return ''
  const title = escapeHtml(block.title || '结果综述')
  const style = styleToString(block.style)
  const columns = Math.max(1, Math.min(block.columns || 3, 4))
  const dataPath = block.dataPath || 'summaryCards'
  return `
  <section class="report-section"${style}>
    <div class="section-title">${title}</div>
    <div class="report-cards" style="grid-template-columns: repeat(${columns}, minmax(0, 1fr));">
      {{#${dataPath}}}
      <div class="report-card" style="background: {{bgColor}}; border-color: {{borderColor}};">
        <div class="report-card-icon">
          {{#iconUrl}}
            <img src="{{iconUrl}}" alt="{{iconAlt}}" />
          {{/iconUrl}}
          {{^iconUrl}}
            {{{iconSvg}}}
          {{/iconUrl}}
        </div>
        <div class="report-card-label">{{title}}</div>
        <div class="report-card-value">{{value}}</div>
      </div>
      {{/${dataPath}}}
    </div>
  </section>
  `
}

function isLikelyUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^data:/i.test(value) || value.startsWith('/')
}

function renderImageBlock(block: TemplateBlock) {
  if (block.type !== 'image') return ''
  const title = escapeHtml(block.title || '')
  const style = styleToString(block.style)
  const srcPath = block.srcPath?.trim() || ''
  const srcValue = srcPath
    ? isLikelyUrl(srcPath)
      ? escapeHtml(srcPath)
      : `{{${srcPath}}}`
    : ''
  const alt = escapeHtml(block.alt || '图片')
  const width = block.width ? `width:${escapeHtml(block.width)}` : ''
  const height = block.height ? `height:${escapeHtml(block.height)}` : ''
  const radius = block.radius ? `border-radius:${escapeHtml(block.radius)}` : ''
  const imgStyle = [width, height, radius].filter(Boolean).join(';')
  const caption = block.caption ? `<div class="report-image-caption">${escapeHtml(block.caption)}</div>` : ''
  return `
  <section class="report-section"${style}>
    ${title ? `<div class="section-title">${title}</div>` : ''}
    <div class="report-image">
      ${
        srcValue
          ? `<img src="${srcValue}" alt="${alt}"${imgStyle ? ` style="${imgStyle}"` : ''} />`
          : `<div class="report-image-placeholder">暂无图片</div>`
      }
      ${caption}
    </div>
  </section>
  `
}

function renderTextBlock(block: TemplateBlock) {
  if (block.type !== 'text') return ''
  const text = escapeHtml(block.text || '')
  const style = styleToString(block.style)
  return `
  <section class="report-section"${style}>
    <div class="report-text">${text}</div>
  </section>
  `
}

function renderCodeBlock(block: TemplateBlock) {
  if (block.type !== 'code') return ''
  const label = escapeHtml(block.label || '')
  const style = styleToString(block.style)
  return `
  <section class="report-section"${style}>
    <div class="section-title">${label || '条码信息'}</div>
    <div class="report-codes horizontal">
      ${block.showBarcode ? `<svg data-barcode></svg>` : ''}
      ${block.showQr ? `<img data-qr alt="二维码" />` : ''}
    </div>
  </section>
  `
}

function renderFooter(block: TemplateBlock) {
  if (block.type !== 'footer') return ''
  const note = escapeHtml(block.note || '报告仅供临床参考，请结合患者情况综合判断。')
  const style = styleToString(block.style)
  const generated = block.showGeneratedAt
    ? '<div>报告生成时间: {{meta.generatedAt}}</div>'
    : ''
  return `
  <footer class="report-footer"${style}>
    ${generated}
    <div class="report-note">${note}</div>
  </footer>
  `
}

export function buildTemplateHtml(blocks: TemplateBlock[], data?: any) {
  const body = blocks
    .filter((block) => isBlockVisible(block, data))
    .map((block) => {
      switch (block.type) {
        case 'header':
          return renderHeader(block)
        case 'info':
          return renderInfoBlock(block)
        case 'results':
          return renderResultsBlock(block)
        case 'cards':
          return renderCardsBlock(block)
        case 'image':
          return renderImageBlock(block)
        case 'text':
          return renderTextBlock(block)
        case 'code':
          return renderCodeBlock(block)
        case 'footer':
          return renderFooter(block)
        default:
          return ''
      }
    })
    .join('')

  return `<div class="report-sheet">${body}</div>`
}

export function resolveTemplateHtml(template: TemplateItem, data?: any, modeOverride?: TemplateMode) {
  const mode = modeOverride || template.mode
  if (mode === 'html' && template.html) {
    return template.html
  }
  return buildTemplateHtml(template.blocks, data)
}
