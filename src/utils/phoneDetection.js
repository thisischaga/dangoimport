/**
 * Règles de préfixes pour la détection automatique de l'opérateur
 * Basé sur l'ARCEP Bénin et l'ARCEP Togo
 */

const PREFIXES = {
    BJ: {
        mtn: ['42', '46', '51', '52', '53', '54', '56', '57', '59', '61', '62', '66', '67', '69', '90', '91', '96', '97'],
        moov: ['40', '41', '44', '45', '55', '58', '60', '63', '64', '65', '68', '94', '95', '98', '99'],
        celtiis: ['43', '50']
    },
    TG: {
        togocel: ['90', '91', '92', '93', '70', '71'],
        moov_tg: ['99', '98', '97', '96', '79']
    }
};

/**
 * Détecte l'opérateur Mobile Money selon le pays et le numéro
 * @param {string} countryCode Code pays (ex: 'BJ', 'TG')
 * @param {string} phoneNumber Le numéro tapé par l'utilisateur
 * @returns {string|null} La valeur FedaPay du réseau (ex: 'mtn', 'moov_tg') ou null si non détecté
 */
export function detectOperator(countryCode, phoneNumber) {
    if (!phoneNumber || !countryCode || !PREFIXES[countryCode]) {
        return null;
    }

    // Nettoyer le numéro (enlever les espaces, +, et l'indicatif si présent)
    let cleanNumber = phoneNumber.replace(/\s+/g, '');
    
    // Si l'utilisateur tape l'indicatif (+229 ou 00229 pour BJ, +228 ou 00228 pour TG)
    if (countryCode === 'BJ' && (cleanNumber.startsWith('+229') || cleanNumber.startsWith('00229'))) {
        cleanNumber = cleanNumber.replace(/^(\+229|00229)/, '');
    }
    if (countryCode === 'TG' && (cleanNumber.startsWith('+228') || cleanNumber.startsWith('00228'))) {
        cleanNumber = cleanNumber.replace(/^(\+228|00228)/, '');
    }

    // Au Bénin et au Togo, les numéros ont 8 chiffres et le préfixe correspond aux 2 premiers
    if (cleanNumber.length >= 2) {
        const prefix = cleanNumber.substring(0, 2);
        const networks = PREFIXES[countryCode];
        
        for (const [network, prefixes] of Object.entries(networks)) {
            if (prefixes.includes(prefix)) {
                return network;
            }
        }
    }

    return null;
}
