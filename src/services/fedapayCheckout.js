import API_BASE_URL from '../apiConfig';

/**
 * Initialise un paiement FedaPay et retourne l'URL de redirection.
 */
export async function initiateFedapayCheckout(payload, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const detail = data.error ? ` (${data.error})` : '';
        throw new Error((data.message || "Erreur lors de l'initialisation du paiement FedaPay.") + detail);
    }

    if (!data.url) {
        throw new Error(data.message || 'URL de paiement FedaPay indisponible.');
    }

    return data;
}

/**
 * Initialise un paiement FedaPay API Direct (Push USSD) sans redirection.
 */
export async function initiateFedapayDirectPay(payload, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/fedapay/direct-pay`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const detail = data.error ? ` (${data.error})` : '';
        throw new Error((data.message || "Erreur lors du déclenchement du paiement FedaPay.") + detail);
    }

    if (!data.transactionId) {
        throw new Error(data.message || 'ID de transaction FedaPay indisponible.');
    }

    return data;
}

/**
 * Vérifie le statut d'une transaction FedaPay.
 */
export async function checkFedapayTransactionStatus(transactionId) {
    const response = await fetch(`${API_BASE_URL}/api/fedapay/transaction/${transactionId}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la vérification du statut.');
    }
    return data;
}

function buildCartBasePayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel, description, type }) {
    const productNames = cartItems.map((i) => i.name).join(', ');
    const vendorName = [...new Set(cartItems.map((i) => i.vendorName).filter(Boolean))].join(', ') || 'Dango Import';
    const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const phoneDigits = String(form.phone || '').replace(/\D/g, '');
    const phoneAsNumber = parseInt(phoneDigits.slice(-8), 10) || 97000000;

    return {
        userName: `${form.firstName} ${form.lastName}`.trim(),
        userEmail: form.email,
        userNumber: phoneAsNumber,
        productQuantity: totalQty,
        picture: cartItems.find((i) => i.image)?.image || 'https://www.dangoimport.com/logo.png',
        userPref: form.instructions || form.address,
        selectedCountry: form.country || 'Benin',
        lat: form.lat || 6.37,
        lng: form.lng || 2.43,
        deliveryFee: shippingFee,
        address: [form.address, form.neighborhood].filter(Boolean).join(', ') || form.address,
        city: form.city || 'Non précisé',
        totalPrice: total,
        productPrice: subtotal,
        description: description ? description.slice(0, 200) : `Commande — ${productNames}`.slice(0, 200),
        type: type || 'cart',
        vendorName,
        shippingMethod: shippingLabel,
        productSummary: cartItems.map((i) => `${i.name} x${i.quantity}`).join(', '),
    };
}

export function buildCartFedapayPayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel, network, fedapayPhone, countryCode, description, type }) {
    const base = buildCartBasePayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel, description, type });
    // Ensure items are included so backend can validate and build order
    const mappedItems = Array.isArray(cartItems) ? cartItems.map((i) => ({
        productId: i._id || i.id,
        quantity: Number(i.quantity || 1),
        price: Number(i.price || i.salePrice || i.promoPrice || 0),
        selectedOptions: i.selectedOptions || {},
        vendorName: i.vendorName || i.vendor || null,
        subtotal: (Number(i.price || i.salePrice || i.promoPrice || 0) * Number(i.quantity || 1)),
    })) : [];

    return {
        ...base,
        customer: {
          firstname: form.firstName || 'Client',
          lastname: form.lastName || 'Dango',
          email: form.email,
          phone: fedapayPhone || form.phone,
        },
        shippingAddress: {
          country: form.country || 'Togo',
          city: form.city || '',
          neighborhood: form.neighborhood || '',
          fullAddress: form.fullAddress || '',
          postalCode: form.postalCode || '',
          instructions: form.instructions || '',
        },
        callback_url: window.location.origin + '/checkout',
        amount: total,
        currency: 'XOF',
        description: description || `Commande Dango Import - ${productNames}`,
        shippingMethod: shippingLabel || 'standard',
        promoCode: promoCode || '',
        total,
        paymentMethod: 'FedaPay',
        custom_metadata: {
          type: type || 'cart',
          cartSource: 'frontend',
          items: mappedItems,
        },
        // Backwards-compatible fields expected by server
        cartItems: mappedItems,
        items: mappedItems,
    };
}

/**
 * Commande directe sans redirection FedaPay (paiement à la livraison).
 */
export function buildCartOrderPayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel, description, type }) {
    const base = buildCartBasePayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel, description, type });
    return {
        userName: base.userName,
        userNumber: base.userNumber,
        userEmail: base.userEmail,
        productQuantity: base.productQuantity,
        picture: base.picture,
        userPref: `Panier: ${base.productSummary}. Livraison: ${shippingLabel}. ${form.instructions || base.address}`.slice(0, 500),
        selectedCountry: base.selectedCountry,
        status: 'En attente',
        lat: base.lat,
        lng: base.lng,
        deliveryFee: base.deliveryFee,
        paymentMethod: 'Paiement à la livraison',
        address: base.address,
        city: base.city,
        totalPrice: base.totalPrice,
        productPrice: base.productPrice,
        vendorName: base.vendorName,
    };
}

export async function submitDirectOrder(payload, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/acheter`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la commande.');
    }

    return data;
}
