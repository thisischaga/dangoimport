import apiClient from '../apiClient';

export async function fetchDropshippingShippingOptions({ items, destination }) {
  const { data } = await apiClient.post('/checkout/dropshipping/shipping-options', {
    items,
    destination,
  });
  if (!data?.success) {
    throw new Error(data?.message || 'Impossible de calculer la livraison.');
  }
  return data.data;
}

export async function validateDropshippingCheckout({ items, destination, shippingOptionId, shippingAddress }) {
  const { data } = await apiClient.post('/checkout/dropshipping/validate', {
    items,
    destination,
    shippingOptionId,
    shippingAddress,
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
