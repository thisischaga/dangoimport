import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import VendorLayout from '../../components/vendor/VendorLayout';
import VendorRoute from '../../components/vendor/VendorRoute';
import API_BASE_URL from '../../apiConfig';
import { resolveImageUrl } from '../../utils/imageUrl';
import { vendorAuthHeaders } from '../../utils/vendorAuth';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';

const PLACEHOLDER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f1f5f9%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';

const VendorProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/products`, {
        headers: vendorAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Chargement impossible');
      setProducts(data.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer « ${name} » ?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/products/${id}`, {
        method: 'DELETE',
        headers: vendorAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Suppression impossible');
      toast.success('Produit supprimé');
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <VendorRoute>
      <VendorLayout title="Mes produits" subtitle="Gérez votre catalogue sur la marketplace">
        <div className="mb-4 flex justify-end">
          <Link
            to="/vendeur/produits/nouveau"
            className="rounded-xl bg-[#F68B1E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e07b12]"
          >
            + Ajouter un produit
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chargement…</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Aucun produit publié</td></tr>
                ) : (
                  products.map((p) => {
                    const img = resolveImageUrl(p.image || p.images?.[0]?.url) || PLACEHOLDER;
                    return (
                      <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={img} alt="" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" onError={(e) => { e.target.src = PLACEHOLDER; }} />
                            <span className="font-semibold text-[#0F172A]">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{p.category}</td>
                        <td className="px-4 py-3 font-semibold">{Number(p.price).toLocaleString('fr-FR')} F</td>
                        <td className="px-4 py-3">{p.stock}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {p.isPublished ? 'En ligne' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => navigate(`/product/${p._id}`)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-[#F68B1E] hover:text-[#F68B1E]" title="Voir">
                              <ExternalLink size={14} />
                            </button>
                            <button type="button" onClick={() => navigate(`/vendeur/produits/nouveau?edit=${p._id}`)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-[#F68B1E] hover:text-[#F68B1E]" title="Modifier">
                              <Pencil size={14} />
                            </button>
                            <button type="button" onClick={() => handleDelete(p._id, p.name)} className="rounded-lg border border-slate-200 p-2 text-red-500 hover:bg-red-50" title="Supprimer">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </VendorLayout>
    </VendorRoute>
  );
};

export default VendorProducts;
