export function formatCFA(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return '0 FCFA';
  return `${n.toLocaleString('fr-FR')} FCFA`;
}

export function calcDiscountPercent(original, current) {
  const orig = Number(original);
  const curr = Number(current);
  if (!orig || !curr || curr >= orig) return 0;
  return Math.round((1 - curr / orig) * 100);
}

export default formatCFA;
export function formatSoftS(value) {
  const amount = Number(value) || 0;

  return `XOF ${new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}