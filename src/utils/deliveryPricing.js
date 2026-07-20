export function calculateDeliveryFee({ country, city, neighborhood, shippingMethod }) {
  const normalizedCountry = String(country || '').trim().toLowerCase();
  const normalizedCity = String(city || '').trim().toLowerCase();
  const normalizedNeighborhood = String(neighborhood || '').trim().toLowerCase();

  if (shippingMethod === 'pickup') return 0;

  const isTogo = normalizedCountry.includes('togo') || normalizedCountry.includes('tg');
  const isMajorCity = isTogo
    ? ['lomé', 'lome', 'kara', 'sokodé', 'sokode', 'atakpamé', 'atakpame', 'kpalimé', 'kpalime', 'tsevie', 'dapaong'].includes(normalizedCity)
    : ['cotonou', 'porto-novo', 'abomey-calavi', 'parakou', 'okah', 'bohicon', 'calavi', 'godomey', 'cotonou'].includes(normalizedCity);

  const isRuralArea = normalizedNeighborhood.includes('rural') || normalizedNeighborhood.includes('village') || normalizedNeighborhood.includes('campagne');

  let baseFee = isTogo ? 1800 : 1500;
  if (!isMajorCity) baseFee += 800;
  if (isRuralArea) baseFee += 700;

  if (shippingMethod === 'express') return baseFee + 1200;
  return baseFee;
}
