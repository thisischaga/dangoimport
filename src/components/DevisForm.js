import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../apiConfig';
import { FaSpinner, FaUpload } from 'react-icons/fa';

const DevisForm = ({ showForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    productLink: '',
    quantity: 1,
    description: '',
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.productLink || formData.quantity < 1) {
      toast.error('Veuillez remplir les champs obligatoires.');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('productLink', formData.productLink);
    data.append('quantity', formData.quantity);
    data.append('description', formData.description);
    if (photo) {
      data.append('photo', photo);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/devis/create-invoice`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      } else {
        toast.success(res.data.message || 'Demande envoyée avec succès.');
        showForm(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création du devis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900">Demande de Sourcing</h2>
        <p className="text-sm text-gray-500 mt-2">
          Frais d'étude de dossier : <span className="font-bold text-[#ffdc2b]">5 000 FCFA</span>. Remplissez les détails ci-dessous pour que nos agents sourcent votre produit en Chine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 px-1 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nom complet *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-dango" placeholder="Ex: Jean Dupont" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone *</label>
            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="input-dango" placeholder="Numéro WhatsApp idéalement" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Lien du produit (Alibaba, 1688, etc.) *</label>
          <input type="url" name="productLink" required value={formData.productLink} onChange={handleChange} className="input-dango" placeholder="https://..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Quantité souhaitée *</label>
            <input type="number" name="quantity" min="1" required value={formData.quantity} onChange={handleChange} className="input-dango" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Photo d'illustration (Optionnel)</label>
            <label className="flex items-center gap-2 px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors truncate">
              <FaUpload className="text-gray-400 shrink-0" />
              <span className="truncate text-gray-600">{photo ? photo.name : 'Choisir une image'}</span>
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Description et spécificités (Couleurs, tailles...)</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="input-dango resize-none" rows="3" placeholder="Détails supplémentaires..."></textarea>
        </div>
      </form>

      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
        <button type="button" onClick={() => showForm(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
          Annuler
        </button>
        <button disabled={loading} onClick={handleSubmit} type="submit" className="bg-[#ffdc2b] hover:bg-[#e6c600] text-[#0f172a] px-6 py-2.5 rounded-xl text-sm font-black disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm">
          {loading ? <FaSpinner className="animate-spin" /> : null}
          Payer 5000 FCFA et Soumettre
        </button>
      </div>
    </div>
  );
};

export default DevisForm;
