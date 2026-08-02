import React, { useEffect, useState } from 'react';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorRoute from '../../components/vendor/VendorRoute';
import API_BASE_URL from '../../apiConfig';
import { getVendorUser, vendorAuthHeaders } from '../../utils/vendorAuth';
import { Package, ShoppingBag, Wallet } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3EA] text-[#F68B1E]">
      <Icon size={18} />
    </div>
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-black text-[#0F172A]">{value}</p>
  </div>
);

const VendorDashboard = () => {
  const user = getVendorUser();
  const [stats, setStats] = useState({ nb_produits: 0, ventes_mois: 0, ca_total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/vendor/dashboard/stats`, {
          headers: vendorAuthHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.data) setStats(data.data);
      } catch {
        /* stats optionnelles */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const name = user.userFirstname || user.firstname || 'Vendeur';

  return (
    <VendorRoute>
      <VendorLayout
        title="Bienvenue sur votre espace vendeur"
        subtitle={`Bonjour ${name}, gérez vos produits et suivez vos ventes.`}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Package} label="Produits en ligne" value={loading ? '…' : stats.nb_produits} />
          <StatCard icon={ShoppingBag} label="Ventes ce mois" value={loading ? '…' : stats.ventes_mois} />
          <StatCard
            icon={Wallet}
            label="Chiffre d'affaires"
            value={loading ? '…' : `${Number(stats.ca_total || 0).toLocaleString('fr-FR')} F`}
          />
        </div>

        <div id="commandes" className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Commandes</h2>
          <p className="mt-2 text-sm text-slate-600">Aucune commande pour le moment. Vos ventes apparaîtront ici.</p>
        </div>

        <div id="profil" className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Profil vendeur</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Boutique</dt><dd className="font-semibold">{user.vendorName || '—'}</dd></div>
            <div><dt className="text-slate-500">Email</dt><dd className="font-semibold">{user.userEmail || user.email || '—'}</dd></div>
            <div><dt className="text-slate-500">Téléphone</dt><dd className="font-semibold">{user.userPhone || user.phone || '—'}</dd></div>
            <div><dt className="text-slate-500">Rôle</dt><dd className="font-semibold capitalize">{user.role || 'vendor'}</dd></div>
          </dl>
        </div>
      </VendorLayout>
    </VendorRoute>
  );
};

export default VendorDashboard;
