export const SITE_NAME = 'Dango Import';

export function pageTitle(page) {
  const label = String(page || '').trim();
  if (!label || label === SITE_NAME) return SITE_NAME;
  if (label.includes(SITE_NAME)) return label;
  return `${label} | ${SITE_NAME}`;
}
