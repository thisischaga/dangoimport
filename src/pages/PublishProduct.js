import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaUpload, FaBox, FaTag, FaMoneyBillWave, FaAlignLeft } from 'react-icons/fa';

const PublishProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Électronique',
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('dangoUser');
    if (!userData) {
      toast.error('Vous devez être connecté pour publier un produit.');
      navigate('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop volumineuse (max 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        vendorName: user ? `${user.firstname} ${user.surname || ''}`.trim() : 'Vendeur Inconnu'
      };
      // Pointing to centralized backend
      await axios.post(`${API_BASE_URL}/api/products`, productData);
      toast.success('Produit publié avec succès sur la marketplace !');
      navigate('/shopping'); // Redirect to shop to see the product
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la publication du produit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section Clean */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Vendre un Article</h1>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            Remplissez les détails ci-dessous pour publier votre produit sur la boutique Dango Import.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
              
              {/* Informations Générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Nom du produit *</label>
                  <div className="relative">
                    <FaBox className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required
                      type="text"
                      placeholder="Ex: Montre de luxe..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Prix (CFA) *</label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      required
                      type="number"
                      min="1"
                      placeholder="Ex: 15000"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Catégorie *</label>
                  <div className="relative">
                    <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Électronique">Électronique</option>
                      <option value="Mode & Beauté">Mode & Beauté</option>
                      <option value="Maison & Bureau">Maison & Bureau</option>
                      <option value="Montres">Montres</option>
                      <option value="Chaussures">Chaussures</option>
                      <option value="Autres">Autres</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Description détaillée *</label>
                <div className="relative">
                  <FaAlignLeft className="absolute left-4 top-5 text-gray-400" />
                  <textarea 
                    required
                    rows="4"
                    placeholder="Décrivez les caractéristiques de votre produit..."
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
              </div>

              {/* Upload Image */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Image du produit *</label>
                
                <div className="mt-2 flex justify-center rounded-xl border border-dashed border-gray-300 px-6 py-10 hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    {imagePreview ? (
                      <div className="mb-4 relative inline-block">
                        <img src={imagePreview} alt="Aperçu" className="max-h-48 rounded-lg shadow-sm" />
                        <button 
                          type="button" 
                          onClick={() => { setImagePreview(null); setFormData({...formData, image: ''}) }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-red-600 shadow-md"
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <FaUpload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                    )}
                    
                    {!imagePreview && (
                      <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                        <label className="relative cursor-pointer rounded-md bg-white font-semibold text-yellow-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-600 focus-within:ring-offset-2 hover:text-yellow-500">
                          <span>Télécharger un fichier</span>
                          <input required type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                    )}
                    <p className="text-xs leading-5 text-gray-500 mt-2">PNG, JPG, GIF jusqu'à 5MB</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-4 rounded-xl text-lg font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(247,201,72,0.3)] transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? 'PUBLICATION EN COURS...' : 'PUBLIER SUR LA VITRINE'}
                </button>
              </div>

            </form>
          </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublishProduct;
