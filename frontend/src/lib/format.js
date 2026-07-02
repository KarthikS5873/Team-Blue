export function formatINR(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num < 0) return `-${formatINR(-num)}`;

  const str = Math.round(num).toString();
  const len = str.length;

  if (len <= 3) return `₹${str}`;

  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  return `₹${formatted}`;
}
