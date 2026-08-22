import API_BASE_URL from '../apiConfig';

/**
 * Initialise un paiement FedaPay et retourne l'URL de redirection.
 */
export async function initiateFedapayCheckout(payload, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/payment/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        const detail = data.error ? ` (${data.error})` : '';
        throw new Error((data.message || "Erreur lors de l'initialisation du paiement FedaPay.") + detail);
    }

    const paymentUrl = data.url || data.paymentUrl || data.payment_url;
    if (!paymentUrl) {
        throw new Error(data.message || 'URL de paiement FedaPay indisponible.');
    }

    return { ...data, url: paymentUrl };
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

const normalizeCountryName = (value) => {
    // Normalize and strip accents for robust matching
    const raw = String(value || '').trim();
    const normalized = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (['togo', 'tg'].includes(normalized)) return 'Togo';
    // Match 'Bénin', 'Benin', 'bénin', 'BJ', etc.
    if (['benin', 'bj', 'bénin'].includes(normalized) || normalized.startsWith('benin')) return 'Bénin';
    // fallback: return the raw value if it looks like a known country, else Togo
    return raw || 'Togo';
};

const countryToCode = (value) => {
    const raw = String(value || '').trim();
    const normalized = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (['togo', 'tg'].includes(normalized)) return 'TG';
    // Match 'Bénin', 'Benin', 'bénin', 'BJ', etc.
    if (['benin', 'bj', 'bénin'].includes(normalized) || normalized.startsWith('benin')) return 'BJ';
    return 'TG'; // Default to Togo (FedaPay sandbox default)
};

function buildCartBasePayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel, description, type }) {
    const productNames = cartItems.map((i) => i.name).join(', ');
    const vendorName = [...new Set(cartItems.map((i) => i.vendorName).filter(Boolean))].join(', ') || 'Dangoimport';
    const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const phoneDigits = String(form.phone || '').replace(/\D/g, '');
    const phoneAsNumber = parseInt(phoneDigits.slice(-8), 10) || 97000000;
    const selectedCountry = normalizeCountryName(form.country);

    return {
        userName: `${form.firstName} ${form.lastName}`.trim(),
        userEmail: form.email,
        userNumber: phoneAsNumber,
        productQuantity: totalQty,
        picture: cartItems.find((i) => i.image)?.image || 'https://www.dangoimport.com/logo.png',
        userPref: form.instructions || form.address,
        selectedCountry,
        lat: form.lat || 6.37,
        lng: form.lng || 2.43,
        deliveryFee: shippingFee,
        address: [form.fullAddress, form.neighborhood].filter(Boolean).join(', ') || form.fullAddress || '',
        fullAddress: form.fullAddress || '',
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

export function buildCartFedapayPayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel, network, fedapayPhone, countryCode, description, type, promoCode }) {
    const base = buildCartBasePayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel, description, type, promoCode });
    // Ensure items are included so backend can validate and build order
    const mappedItems = Array.isArray(cartItems) ? cartItems.map((i) => ({
        productId: i._id || i.id,
        quantity: Number(i.quantity || 1),
        price: Number(i.price || i.salePrice || i.promoPrice || 0),
        selectedOptions: i.selectedOptions || {},
        vendorName: i.vendorName || i.vendor || null,
        subtotal: (Number(i.price || i.salePrice || i.promoPrice || 0) * Number(i.quantity || 1)),
    })) : [];

    const normalizedCountry = normalizeCountryName(form.country);
    const resolvedCountryCode = countryToCode(form.country);

    return {
        ...base,
        customer: {
          firstname: (form.firstName || 'Client').trim(),
          lastname: (form.lastName || 'Dango').trim(),
          email: form.email,
          phone: fedapayPhone || form.phone,
        },
        shippingAddress: {
          country: normalizedCountry,
          city: form.city || '',
          neighborhood: form.neighborhood || '',
          fullAddress: form.fullAddress || '',
          postalCode: form.postalCode || '',
          instructions: form.instructions || '',
        },
        // Explicit country code so server sets correct phone_number.country for FedaPay
        countryCode: resolvedCountryCode,
        selectedCountry: normalizedCountry,
        deliveryCountry: normalizedCountry, // Ajout de la clé attendue par le backend
        callback_url: window.location.origin + '/checkout',
        amount: total,
        currency: 'XOF',
        description: description || `Commande Dangoimport - ${base.productSummary}`,
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
