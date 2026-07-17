export function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

export function getConditionColor(condition: string): string {
  switch (condition) {
    case '全新': return 'bg-blue-500'
    case '九成新': return 'bg-black/60'
    case '八成新': return 'bg-green-500'
    case '七成新': return 'bg-yellow-500'
    default: return 'bg-gray-500'
  }
}

export function getCategoryTag(category: string): string {
  switch (category) {
    case '教材': return 'tag-primary'
    case '考研': return 'tag-warning'
    case '考公': return 'tag-info'
    case '技能证书': return 'tag-success'
    default: return 'tag-primary'
  }
}
