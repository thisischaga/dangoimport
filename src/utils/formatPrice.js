export function formatXOF(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n < 0) return '0 XOF';
  return `${Math.round(n).toLocaleString('fr-FR').replace(/\s/g, ' ')} XOF`;
}

export function formatCFA(value) {
  return formatXOF(value);
}

export function calcDiscountPercent(original, current) {
  const orig = Number(original);
  const curr = Number(current);
  if (!orig || !curr || curr >= orig) return 0;
  return Math.round((1 - curr / orig) * 100);
}

export default formatXOF;
export function formatSoftS(value) {
  return formatXOF(value);
}
