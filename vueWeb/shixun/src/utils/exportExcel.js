import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'

const formatDate = () => {
  const date = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

export function exportExcel({ data, columns, fileName, sheetName = '数据' }) {
  if (!Array.isArray(data) || data.length === 0) {
    ElMessage.warning('暂无可导出的数据')
    return
  }

  const rows = data.map((item) => {
    return columns.reduce((row, column) => {
      row[column.label] = typeof column.value === 'function' ? column.value(item) : item[column.prop]
      return row
    }, {})
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${fileName}_${formatDate()}.xlsx`)
  ElMessage.success('Excel 文件已导出')
}
