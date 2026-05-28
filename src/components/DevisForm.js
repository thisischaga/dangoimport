import React, { useState, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { toast } from 'react-toastify';
import { FaUser, FaPhone, FaLink, FaCamera, FaShoppingBag } from 'react-icons/fa';

const DevisForm = ({ showForm }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    productLink: '',
    quantity: '',
    description: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setPhoto(selectedFile);
      setPhotoName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('phone', formData.phone);
      formPayload.append('productLink', formData.productLink);
      formPayload.append('quantity', formData.quantity);
      formPayload.append('description', formData.description);
      formPayload.append('studyFee', 5000);
      if (photo) {
        formPayload.append('photo', photo);
      }

      const response = await axios.post(`${API_BASE_URL}/api/devis/create-invoice`, formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Votre demande de devis a été enregistrée avec succès.');
        if (showForm) showForm(false);
      } else if (response.data && response.data.url) {
        toast.success('Redirection vers FedaPay pour le paiement du devis...');
        window.location.href = response.data.url;
      } else {
        toast.error('Erreur lors de la création du paiement.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la création du paiement du devis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white font-outfit">
      <div className="mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-playfair font-black mb-4">Demander un <span className="text-primary italic">Devis</span></h2>
        <p className="text-gray-400">Réponse garantie sous 72h par nos agents de sourcing.</p>
        <p className="text-sm text-yellow-500 font-bold mt-4">Frais d'étude de devis : <span className="text-yellow-300">5 000 FCFA</span>.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Nom */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Votre Nom complet</label>
            <div className="relative group">
              <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input 
                required
                type="text" 
                placeholder="Ex: John Doe"
                className="w-full bg-white/5 text-gray-900 placeholder:text-gray-500 border border-white/10 rounded-2xl py-5 px-14 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Numéro WhatsApp</label>
            <div className="relative group">
              <FaPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input 
                required
                type="tel" 
                placeholder="+229 0159387180"
                className="w-full bg-white/5 text-gray-900 placeholder:text-gray-500 border border-white/10 rounded-2xl py-5 px-14 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Lien Produit */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Lien 1688 / Alibaba ou Photo</label>
          <div className="relative group">
            <FaLink className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
            <input 
              required
              type="url" 
              placeholder="Collez le lien du produit ici..."
              className="w-full bg-white/5 text-gray-900 placeholder:text-gray-500 border border-white/10 rounded-2xl py-5 px-14 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
              value={formData.productLink}
              onChange={(e) => setFormData({...formData, productLink: e.target.value})}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Quantité */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Quantité souhaitée</label>
            <div className="relative group">
              <FaShoppingBag className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
              <input 
                required
                type="number" 
                placeholder="Quantité (ex: 50)"
                className="w-full bg-white/5 text-gray-900 placeholder:text-gray-500 border border-white/10 rounded-2xl py-5 px-14 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
          </div>

          {/* Upload Photo (Visual only for now) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Ou télécharger une image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              onClick={handlePhotoSelect}
              className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl py-5 px-6 flex items-center justify-between gap-4 hover:bg-white/10 transition-all"
            >
              <span className="flex items-center gap-3">
                <FaCamera className="text-primary" />
                <span className="text-sm text-gray-400">{photoName || 'Choisir un fichier'}</span>
              </span>
              {photoName && <span className="text-xs text-gray-400">{photoName}</span>}
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-1">Détails (Taille, Couleur, etc.)</label>
          <textarea 
            rows="4"
            placeholder="Décrivez précisément ce que vous recherchez..."
            className="w-full bg-white/5 text-gray-900 placeholder:text-gray-500 border border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          ></textarea>
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-primary text-secondary py-6 rounded-2xl text-xl font-black uppercase tracking-widest hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50"
        >
          {loading ? 'REDIRECTION EN COURS...' : 'PAYER 5000 FCFA & ENVOYER'}
        </button>
      </form>
    </div>
  );
};

export default DevisForm;