import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, X } from 'lucide-react';
import apiClient from '../apiClient';

export function hasValidPhone(user) {
  const phone = String(user?.userPhone || user?.phone || '').trim();
  return phone.replace(/\D/g, '').length >= 8;
}

export default function PhoneUpdateBanner({ user, onUpdated }) {
  const [phone, setPhone] = useState(user?.userPhone || user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  if (!user || hasValidPhone(user) || dismissed) return null;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await apiClient.patch('/auth/me', { userPhone: phone.trim() });
      const updatedUser = res.data?.user || { ...user, userPhone: phone.trim() };
      localStorage.setItem('dangoUser', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('authChange'));
      if (onUpdated) onUpdated(updatedUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de mettre à jour le numéro.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative border-b border-amber-200 bg-amber-50 px-3 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-sm text-amber-950">
          <Phone size={18} className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold">Ajoutez votre numéro de téléphone</p>
            <p className="text-amber-900/80">
              Il est requis pour la livraison et le suivi de vos commandes.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex. 90123456"
            className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#F68B1E]"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#F68B1E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <Link to="/checkout" className="text-center text-xs font-semibold text-amber-900 underline sm:ml-1">
            Mettre à jour au paiement
          </Link>
        </div>

        {error ? <p className="text-xs font-medium text-red-600 sm:col-span-2">{error}</p> : null}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 rounded p-1 text-amber-700 hover:bg-amber-100 sm:static"
          aria-label="Masquer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
