export function formatINR(amount) {
  if (amount === null || amount === undefined) return '\u20B90';
  const num = Number(amount);
  if (isNaN(num)) return '\u20B90';

  const isNegative = num < 0;
  const abs = Math.abs(num);
  const str = Math.floor(abs).toString();

  if (str.length <= 3) {
    return `\u20B9${isNegative ? '-' : ''}${str}`;
  }

  let result = str.slice(-3);
  let remaining = str.slice(0, -3);

  while (remaining.length > 2) {
    result = remaining.slice(-2) + ',' + result;
    remaining = remaining.slice(0, -2);
  }

  if (remaining.length > 0) {
    result = remaining + ',' + result;
  }

  return `\u20B9${isNegative ? '-' : ''}${result}`;
}

export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function getMonthStart(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

export function subDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

export function aggregateByCategory(activities) {
  const map = {};
  for (const act of activities) {
    const cat = act.category || 'Other';
    if (!map[cat]) {
      map[cat] = { category: cat, totalHours: 0, count: 0 };
    }
    map[cat].totalHours += Number(act.hours_spent);
    map[cat].count += 1;
  }
  return Object.values(map).map(item => ({
    ...item,
    totalHours: Math.round(item.totalHours * 100) / 100
  }));
}
