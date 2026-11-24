import apiClient from '../apiClient';

export async function fetchDropshippingTransportOptions({ items, countryCode }) {
  const { data } = await apiClient.post('/checkout/dropshipping/transport-options', {
    items,
    countryCode,
  });
  if (!data?.success) {
    throw new Error(data?.message || 'Impossible de charger les modes de transport.');
  }
  return data.data;
}

export async function fetchDropshippingShippingOptions({ items, destination, transportMode }) {
  const { data } = await apiClient.post('/checkout/dropshipping/shipping-options', {
    items,
    destination,
    transportMode,
  });
  if (!data?.success) {
    throw new Error(data?.message || 'Impossible de calculer la livraison.');
  }
  return data.data;
}

export async function validateDropshippingCheckout({ items, destination, shippingOptionId, shippingAddress, quoteId, shippingCost }) {
  const { data } = await apiClient.post('/checkout/dropshipping/validate', {
    items,
    destination,
    shippingOptionId,
    shippingAddress,
    quoteId,
    shippingCost,
  });
  if (!data?.success) {
    throw new Error(data?.message || 'Validation impossible.');
  }
  return data.data;
}

/** @deprecated Utiliser fetchDropshippingShippingOptions */
export async function fetchDropshippingShippingQuote({ items, destinationCountry, destinationCity }) {
  return fetchDropshippingShippingOptions({
    items,
    destination: {
      country: destinationCountry,
      city: destinationCity,
    },
  });
}

export function mapCartItemToCheckoutLine(item) {
  const productId = item._id || item.id;
  return {
    productId,
    quantity: Number(item.quantity || 1) || 1,
    selectedOptions: {
      selectedVariant: item.selectedVariant,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      externalVariantId: item.selectedVariant?.externalVariantId || item.externalVariantId,
    },
  };
}

export function getVariantLabel(item) {
  const parts = [
    item.selectedColor,
    item.selectedSize,
    item.selectedVariant?.name,
    item.selectedVariant?.label,
  ].filter(Boolean);
  return parts.join(' / ') || null;
}
