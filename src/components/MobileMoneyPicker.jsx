import React, { useEffect } from 'react';
import { FEDAPAY_COUNTRIES, NetworkLogo } from '../utils/fedapayConfig';
import { detectOperator } from '../utils/phoneDetection';

function toIsoCountry(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (['tg', 'togo'].includes(raw) || raw.includes('togo')) return 'TG';
  if (['bj', 'benin', 'bénin'].includes(raw) || raw.includes('benin') || raw.includes('bénin')) {
    return 'BJ';
  }
  if (raw.length === 2) return raw.toUpperCase();
  return 'TG';
}

export default function MobileMoneyPicker({
  countryCode,
  phone,
  network,
  onNetworkChange,
  paymentMode,
  onPaymentModeChange,
}) {
  const iso = toIsoCountry(countryCode);
  const country = FEDAPAY_COUNTRIES.find((item) => item.code === iso) || FEDAPAY_COUNTRIES[1];
  const detected = detectOperator(country.code, phone);

  useEffect(() => {
    if (paymentMode !== 'mobile_money') return;
    if (!network && detected) onNetworkChange(detected);
  }, [detected, network, paymentMode, onNetworkChange]);

  return (
    <div className="ds-mm">
      <p className="ds-mm__label">Mode de paiement</p>
      <div className="ds-mm__modes">
        <label className={`ds-mm__mode ${paymentMode === 'mobile_money' ? 'is-active' : ''}`}>
          <input
            type="radio"
            name="ds-pay-mode"
            checked={paymentMode === 'mobile_money'}
            onChange={() => onPaymentModeChange('mobile_money')}
          />
          Mobile Money (notification sur le téléphone)
        </label>
        <label className={`ds-mm__mode ${paymentMode === 'redirect' ? 'is-active' : ''}`}>
          <input
            type="radio"
            name="ds-pay-mode"
            checked={paymentMode === 'redirect'}
            onChange={() => onPaymentModeChange('redirect')}
          />
          Page FedaPay (carte / autre)
        </label>
      </div>

      {paymentMode === 'mobile_money' && (
        <>
          <p className="ds-mm__label">Opérateur</p>
          <div className="ds-mm__grid">
            {country.networks.map((item) => {
              const selected = network === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  className={`ds-mm__op ${selected ? 'is-active' : ''}`}
                  onClick={() => onNetworkChange(item.value)}
                >
                  <span className="ds-mm__logo">
                    <NetworkLogo value={item.value} label={item.label} />
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          {detected && network === detected && (
            <p className="ds-mm__hint">Opérateur détecté d’après votre numéro.</p>
          )}
        </>
      )}
    </div>
  );
}

export { toIsoCountry };
