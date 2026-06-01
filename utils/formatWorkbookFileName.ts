/** Display name for a workbook file URL or storage path (no query string). */
export function formatWorkbookFileName(fileUrl: string | null | undefined, fallback = 'File') {
  const path = (fileUrl ?? '').split('?')[0]
  const name = path.split('/').pop()
  return name || fallback
}
