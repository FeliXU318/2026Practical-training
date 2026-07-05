export function getPageList(data) {
  if (Array.isArray(data)) return data
  return Array.isArray(data?.list) ? data.list : []
}

export function getPageTotal(data) {
  if (typeof data?.total === 'number') return data.total
  return getPageList(data).length
}
