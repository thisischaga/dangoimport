import API_BASE_URL from '../apiConfig';

/**
 * Initialise un paiement FedaPay et retourne l'URL de redirection.
 */
export async function initiateFedapayCheckout(payload, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/fedapay/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'initialisation du paiement FedaPay.");
    }

    if (!data.url) {
        throw new Error(data.message || 'URL de paiement FedaPay indisponible.');
    }

    return data;
}

export function buildCartFedapayPayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel }) {
    const productNames = cartItems.map((i) => i.name).join(', ');
    const vendorName = [...new Set(cartItems.map((i) => i.vendorName).filter(Boolean))].join(', ') || 'Dango Import';
    const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    return {
        userName: `${form.firstName} ${form.lastName}`.trim(),
        userEmail: form.email,
        userNumber: form.phone,
        productQuantity: totalQty,
        picture: cartItems.find((i) => i.image)?.image || 'https://www.dangoimport.com/logo.png',
        userPref: form.instructions || form.address,
        selectedCountry: form.country || 'Benin',
        lat: form.lat || 6.37,
        lng: form.lng || 2.43,
        deliveryFee: shippingFee,
        address: form.address,
        city: form.city,
        totalPrice: total,
        productPrice: subtotal,
        description: `Commande — ${productNames}`.slice(0, 200),
        type: 'cart',
        vendorName,
        paymentMethod: 'FedaPay',
        shippingMethod: shippingLabel,
    };
}
