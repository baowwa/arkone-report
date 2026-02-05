import dayjs from 'dayjs'

export function formatDate(value?: string) {
  if (!value) return ''
  const parsed = dayjs(value)
  if (!parsed.isValid()) return value
  return parsed.format('YYYY-MM-DD HH:mm')
}

export function nowText() {
  return dayjs().format('YYYY-MM-DD HH:mm')
}
