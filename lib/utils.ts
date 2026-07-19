export function getConditionColor(condition: string): string {
  const map: Record<string, string> = {
    '全新': '#2D6A4F',
    '九成新': '#5B8C5A',
    '八成新': '#D4A017',
    '七成新': '#999999',
    '七成新及以下': '#999999',
  };
  return map[condition] || '#999999';
}

export function getConditionBgColor(condition: string): string {
  const map: Record<string, string> = {
    '全新': 'rgba(45, 106, 79, 0.1)',
    '九成新': 'rgba(91, 140, 90, 0.1)',
    '八成新': 'rgba(212, 160, 23, 0.1)',
    '七成新': 'rgba(153, 153, 153, 0.1)',
    '七成新及以下': 'rgba(153, 153, 153, 0.1)',
  };
  return map[condition] || 'rgba(153, 153, 153, 0.1)';
}

export function getCategoryTag(category: string): string {
  const map: Record<string, string> = {
    '教材': 'tag-primary',
    '备考资料': 'tag-info',
    '考研': 'tag-info',
    '四六级': 'tag-warning',
    '计算机': 'tag-success',
    '文学': 'tag-secondary',
    '工具书': 'tag-secondary',
  };
  return map[category] || 'tag-secondary';
}

export function formatPrice(price: number): string {
  if (price === Math.floor(price)) {
    return `¥${price}`;
  }
  return `¥${price.toFixed(2)}`;
}

export function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) {
    return '刚刚';
  }
  if (diffMin < 60) {
    return `${diffMin}分钟前`;
  }
  if (diffHour < 24) {
    return `${diffHour}小时前`;
  }
  if (diffDay < 7) {
    return `${diffDay}天前`;
  }
  if (diffWeek < 4) {
    return `${diffWeek}周前`;
  }
  if (diffMonth < 12) {
    return `${diffMonth}个月前`;
  }
  return date.toLocaleDateString('zh-CN');
}
