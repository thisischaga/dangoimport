import API_BASE_URL from '../apiConfig';

/**
 * =========================================================
 * FedaPay Checkout
 * =========================================================
 *
 * Initialise un paiement FedaPay avec redirection.
 *
 * La route backend utilisée ici doit :
 * 1. créer la commande locale ;
 * 2. créer la transaction locale ;
 * 3. initialiser FedaPay ;
 * 4. retourner l'URL de paiement.
 */

/**
 * Initialise un paiement FedaPay et retourne l'URL de redirection.
 */
export async function initiateFedapayCheckout(payload, token) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/fedapay/checkout`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    console.error(
      'Réponse JSON invalide lors du checkout FedaPay :',
      error
    );

    throw new Error(
      'Réponse invalide du serveur lors de l’initialisation du paiement FedaPay.'
    );
  }

  if (!response.ok) {
    const detail = data?.error
      ? ` (${data.error})`
      : '';

    throw new Error(
      (
        data?.message ||
        'Erreur lors de l’initialisation du paiement FedaPay.'
      ) + detail
    );
  }

  const paymentUrl =
    data?.url ||
    data?.paymentUrl ||
    data?.payment_url;

  if (!paymentUrl) {
    throw new Error(
      data?.message ||
      'URL de paiement FedaPay indisponible.'
    );
  }

  return {
    ...data,
    url: paymentUrl,
  };
}

/**
 * =========================================================
 * FedaPay Direct Pay
 * =========================================================
 *
 * Initialise un paiement FedaPay API Direct / Push USSD
 * sans redirection vers une page externe.
 */

/**
 * Initialise un paiement FedaPay Direct Pay.
 */
export async function initiateFedapayDirectPay(
  payload,
  token
) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/api/fedapay/direct-pay`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    console.error(
      'Réponse JSON invalide pour FedaPay Direct Pay :',
      error
    );

    throw new Error(
      'Réponse invalide du serveur lors du déclenchement du paiement FedaPay.'
    );
  }

  if (!response.ok) {
    const detail = data?.error
      ? ` (${data.error})`
      : '';

    throw new Error(
      (
        data?.message ||
        'Erreur lors du déclenchement du paiement FedaPay.'
      ) + detail
    );
  }

  if (!data?.transactionId) {
    throw new Error(
      data?.message ||
      'ID de transaction FedaPay indisponible.'
    );
  }

  return data;
}

/**
 * =========================================================
 * Vérification transaction FedaPay
 * =========================================================
 */

/**
 * Vérifie le statut d'une transaction FedaPay.
 */
export async function checkFedapayTransactionStatus(
  transactionId
) {
  if (!transactionId) {
    throw new Error(
      'ID de transaction FedaPay manquant.'
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/api/fedapay/transaction/${encodeURIComponent(
      transactionId
    )}`
  );

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    console.error(
      'Réponse JSON invalide lors de la vérification FedaPay :',
      error
    );

    throw new Error(
      'Réponse invalide du serveur lors de la vérification du statut.'
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      'Erreur lors de la vérification du statut.'
    );
  }

  return data;
}

/**
 * =========================================================
 * Pays
 * =========================================================
 */

/**
 * Normalise le nom d'un pays.
 *
 * Valeurs prises en charge :
 * - Togo
 * - TG
 * - Bénin
 * - Benin
 * - BJ
 */
const normalizeCountryName = (value) => {
  const raw = String(value || '').trim();

  const normalized = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    ['togo', 'tg'].includes(normalized)
  ) {
    return 'Togo';
  }

  if (
    ['benin', 'bj'].includes(normalized) ||
    normalized.startsWith('benin')
  ) {
    return 'Bénin';
  }

  return raw || 'Togo';
};

/**
 * Convertit un pays en code ISO utilisé pour FedaPay.
 */
const countryToCode = (value) => {
  const raw = String(value || '').trim();

  const normalized = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    ['togo', 'tg'].includes(normalized)
  ) {
    return 'TG';
  }

  if (
    ['benin', 'bj'].includes(normalized) ||
    normalized.startsWith('benin')
  ) {
    return 'BJ';
  }

  // Valeur par défaut
  return 'TG';
};

/**
 * =========================================================
 * BASE PAYLOAD
 * =========================================================
 */

/**
 * Construit le payload de base utilisé par les différents
 * types de commandes.
 */
function buildCartBasePayload({
  form,
  cartItems,
  subtotal,
  shippingFee,
  total,
  shippingLabel,
  description,
  type,
}) {
  const productNames = cartItems
    .map((item) => item.name)
    .filter(Boolean)
    .join(', ');

  const vendorName =
    [
      ...new Set(
        cartItems
          .map((item) => item.vendorName)
          .filter(Boolean)
      ),
    ].join(', ') || 'Dangoimport';

  const totalQty = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const phoneDigits = String(
    form.phone || ''
  ).replace(/\D/g, '');

  const phoneAsNumber =
    parseInt(
      phoneDigits.slice(-8),
      10
    ) || 97000000;

  const selectedCountry =
    normalizeCountryName(form.country);

  return {
    userName:
      `${form.firstName || ''} ${
        form.lastName || ''
      }`.trim(),

    userEmail: form.email || '',

    userNumber: phoneAsNumber,

    productQuantity: totalQty,

    picture:
      cartItems.find(
        (item) => item.image
      )?.image ||
      'https://www.dangoimport.com/logo.png',

    userPref:
      form.instructions ||
      form.address ||
      '',

    selectedCountry,

    lat:
      form.lat ??
      6.37,

    lng:
      form.lng ??
      2.43,

    deliveryFee:
      Number(shippingFee) || 0,

    address:
      [
        form.fullAddress,
        form.neighborhood,
      ]
        .filter(Boolean)
        .join(', ') ||
      form.fullAddress ||
      '',

    fullAddress:
      form.fullAddress || '',

    city:
      form.city ||
      'Non précisé',

    totalPrice:
      Number(total) || 0,

    productPrice:
      Number(subtotal) || 0,

    description:
      description
        ? description.slice(0, 200)
        : `Commande — ${productNames}`.slice(
            0,
            200
          ),

    type:
      type || 'cart',

    vendorName,

    shippingMethod:
      shippingLabel || 'standard',

    productSummary:
      cartItems
        .map(
          (item) =>
            `${item.name} x${item.quantity}`
        )
        .join(', '),
  };
}

/**
 * =========================================================
 * FedaPay CART PAYLOAD
 * =========================================================
 */

/**
 * Construit le payload complet envoyé au backend
 * /api/fedapay/checkout
 */
export function buildCartFedapayPayload({
  form,
  cartItems,
  subtotal,
  shippingFee,
  total,
  shippingLabel,
  network,
  fedapayPhone,
  countryCode,
  description,
  type,
  promoCode,
}) {
  const base =
    buildCartBasePayload({
      form,
      cartItems,
      subtotal,
      shippingFee,
      total,
      shippingLabel,
      description,
      type,
    });

  /**
   * Produits envoyés au backend.
   */
  const mappedItems = Array.isArray(cartItems)
    ? cartItems.map((item) => {
        const itemPrice =
          Number(
            item.price ??
              item.salePrice ??
              item.promoPrice ??
              0
          ) || 0;

        const quantity =
          Number(
            item.quantity || 1
          ) || 1;

        return {
          productId:
            item._id ||
            item.id,

          quantity,

          price: itemPrice,

          selectedOptions:
            item.selectedOptions ||
            {},

          vendorName:
            item.vendorName ||
            item.vendor ||
            null,

          subtotal:
            itemPrice * quantity,
        };
      })
    : [];

  /**
   * Pays et code pays.
   */
  const normalizedCountry =
    normalizeCountryName(
      form.country
    );

  const resolvedCountryCode =
    countryCode ||
    countryToCode(form.country);

  /**
   * Payload final.
   */
  return {
    ...base,

    /* -----------------------------------------------------
       CUSTOMER
    ----------------------------------------------------- */

    customer: {
      firstname:
        (
          form.firstName ||
          'Client'
        ).trim(),

      lastname:
        (
          form.lastName ||
          'Dango'
        ).trim(),

      email:
        form.email || '',

      phone:
        fedapayPhone ||
        form.phone ||
        '',
    },

    /* -----------------------------------------------------
       SHIPPING ADDRESS
    ----------------------------------------------------- */

    shippingAddress: {
      country:
        normalizedCountry,

      city:
        form.city || '',

      neighborhood:
        form.neighborhood || '',

      fullAddress:
        form.fullAddress || '',

      postalCode:
        form.postalCode || '',

      instructions:
        form.instructions || '',
    },

    /* -----------------------------------------------------
       COUNTRY
    ----------------------------------------------------- */

    countryCode:
      resolvedCountryCode,

    selectedCountry:
      normalizedCountry,

    deliveryCountry:
      normalizedCountry,

    /* -----------------------------------------------------
       CALLBACK
    ----------------------------------------------------- */

    callback_url:
      `${window.location.origin}/checkout`,

    /* -----------------------------------------------------
       AMOUNT
    ----------------------------------------------------- */

    amount:
      Number(total) || 0,

    total:
      Number(total) || 0,

    currency: 'XOF',

    /* -----------------------------------------------------
       DESCRIPTION
    ----------------------------------------------------- */

    description:
      description ||
      `Commande Dangoimport - ${
        base.productSummary
      }`.slice(0, 200),

    /* -----------------------------------------------------
       SHIPPING
    ----------------------------------------------------- */

    shippingMethod:
      shippingLabel ||
      'standard',

    shippingFee:
      Number(shippingFee) || 0,

    /* -----------------------------------------------------
       PROMO
    ----------------------------------------------------- */

    promoCode:
      promoCode || '',

    /* -----------------------------------------------------
       PAYMENT
    ----------------------------------------------------- */

    paymentMethod:
      'FedaPay',

    /* -----------------------------------------------------
       NETWORK
    ----------------------------------------------------- */

    network:
      network || '',

    /* -----------------------------------------------------
       ITEMS
    ----------------------------------------------------- */

    custom_metadata: {
      type:
        type || 'cart',

      cartSource:
        'frontend',

      items:
        mappedItems,
    },

    /*
     * Compatibilité avec les différentes attentes
     * du backend existant.
     */
    cartItems:
      mappedItems,

    items:
      mappedItems,
  };
}

/**
 * =========================================================
 * COMMANDE DIRECTE
 * =========================================================
 *
 * Utilisée pour le paiement à la livraison.
 */

/**
 * Construit le payload d'une commande directe.
 */
export function buildCartOrderPayload({
  form,
  cartItems,
  subtotal,
  shippingFee,
  total,
  shippingLabel,
  description,
  type,
}) {
  const base =
    buildCartBasePayload({
      form,
      cartItems,
      subtotal,
      shippingFee,
      total,
      shippingLabel,
      description,
      type,
    });

  return {
    userName:
      base.userName,

    userNumber:
      base.userNumber,

    userEmail:
      base.userEmail,

    productQuantity:
      base.productQuantity,

    picture:
      base.picture,

    userPref:
      `Panier: ${
        base.productSummary
      }. Livraison: ${
        shippingLabel || 'standard'
      }. ${
        form.instructions ||
        base.address
      }`.slice(0, 500),

    selectedCountry:
      base.selectedCountry,

    status:
      'En attente',

    lat:
      base.lat,

    lng:
      base.lng,

    deliveryFee:
      base.deliveryFee,

    paymentMethod:
      'Paiement à la livraison',

    address:
      base.address,

    city:
      base.city,

    totalPrice:
      base.totalPrice,

    productPrice:
      base.productPrice,

    vendorName:
      base.vendorName,
  };
}

/**
 * =========================================================
 * SUBMIT ORDER — PAIEMENT À LA LIVRAISON
 * =========================================================
 */

/**
 * Envoie une commande directe au backend.
 */
export async function submitDirectOrder(
  payload,
  token
) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}/acheter`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    console.error(
      'Réponse JSON invalide pour la commande :',
      error
    );

    throw new Error(
      'Réponse invalide du serveur lors de la création de la commande.'
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      'Erreur lors de la commande.'
    );
  }

  return data;
}