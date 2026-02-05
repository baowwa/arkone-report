export type TemplateBlockType =
  | 'header'
  | 'info'
  | 'results'
  | 'text'
  | 'code'
  | 'footer'

export type BlockStyle = {
  fontSize?: number
  textAlign?: 'left' | 'center' | 'right'
  padding?: string
  marginBottom?: string
  background?: string
  border?: string
}

export type BlockCondition =
  | { type: 'always' }
  | { type: 'fieldHasValue'; path: string }
  | { type: 'resultsHasFlag'; flag: string }

export type TemplateBlockBase = {
  id: string
  type: TemplateBlockType
  title?: string
  hidden?: boolean
  style?: BlockStyle
  condition?: BlockCondition
}

export type InfoField = {
  id: string
  label: string
  path: string
}

export type TemplateBlockInfo = TemplateBlockBase & {
  type: 'info'
  columns: number
  fields: InfoField[]
}

export type ResultColumn = {
  id: string
  label: string
  key: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

export type TemplateBlockResults = TemplateBlockBase & {
  type: 'results'
  columns: ResultColumn[]
}

export type TemplateBlockText = TemplateBlockBase & {
  type: 'text'
  text: string
}

export type TemplateBlockHeader = TemplateBlockBase & {
  type: 'header'
  title: string
  showBarcode: boolean
  showQr: boolean
}

export type TemplateBlockCode = TemplateBlockBase & {
  type: 'code'
  label?: string
  showBarcode: boolean
  showQr: boolean
}

export type TemplateBlockFooter = TemplateBlockBase & {
  type: 'footer'
  note: string
  showGeneratedAt: boolean
}

export type TemplateBlock =
  | TemplateBlockInfo
  | TemplateBlockResults
  | TemplateBlockText
  | TemplateBlockHeader
  | TemplateBlockCode
  | TemplateBlockFooter

export type TemplateMode = 'structured' | 'html'

export type TemplateItem = {
  id: string
  name: string
  version: string
  description: string
  updatedAt: string
  mode: TemplateMode
  html: string
  blocks: TemplateBlock[]
}
