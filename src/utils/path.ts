export function getValueByPath(obj: unknown, path: string) {
  if (!obj || !path) return undefined
  const segments = path.split('.').filter(Boolean)
  let current: any = obj
  for (const segment of segments) {
    if (current == null) return undefined
    current = current[segment]
  }
  return current
}

export function setValueByPath(target: any, path: string, value: unknown) {
  if (!path) return
  const segments = path.split('.').filter(Boolean)
  let current = target
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value
      return
    }
    if (!current[segment] || typeof current[segment] !== 'object') {
      current[segment] = {}
    }
    current = current[segment]
  })
}
