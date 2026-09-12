import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import toast from '../utils/toast';
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
    category: '',
    description: '',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      toast.error("Certaines images dépassent 5MB et ont été ignorées.");
    }

    const readers = validFiles.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers)
      .then((results) => {
        const nextPreviews = [...imagePreviews, ...results];
        setImagePreviews(nextPreviews);
        setFormData((prev) => ({ ...prev, images: nextPreviews }));
      })
      .catch((error) => {
        console.error('Erreur de lecture des images :', error);
        toast.error('Impossible de charger certaines images.');
      });
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/categories`);
        const fetched = Array.isArray(response?.data?.data) ? response.data.data : [];
        setCategories(fetched);
        setFormData((prev) => ({
          ...prev,
          category: prev.category || (fetched.length > 0 ? fetched[0].name : prev.category),
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des catégories :', error);
        setCategoriesError('Impossible de charger les catégories.');
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

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
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffdc2b] focus:bg-white transition-all"
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
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffdc2b] focus:bg-white transition-all"
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
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffdc2b] focus:bg-white transition-all appearance-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">-- Sélectionner une catégorie --</option>
                      {categories.map((category) => (
                        <option key={category._id || category.slug} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categoriesLoading && <div className="text-xs text-gray-500 mt-1">Chargement des catégories...</div>}
                    {!categoriesLoading && categoriesError && <div className="text-xs text-red-600 mt-1">{categoriesError}</div>}
                    {!categoriesLoading && !categoriesError && categories.length === 0 && (
                      <div className="text-xs text-gray-500 mt-1">Aucune catégorie disponible pour le moment.</div>
                    )}
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
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffdc2b] focus:bg-white transition-all resize-none"
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
                    {imagePreviews.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                            <img src={preview} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const next = imagePreviews.filter((_, idx) => idx !== index);
                                setImagePreviews(next);
                                setFormData((prev) => ({ ...prev, images: next }));
                              }}
                              className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <FaUpload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                    )}
                    
                    <div className="mt-4 flex flex-col items-center gap-2 text-sm leading-6 text-gray-600">
                      <label className="relative cursor-pointer rounded-md bg-white font-semibold text-[#e6c600] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#e6c600] focus-within:ring-offset-2 hover:text-[#e6c600] px-4 py-2 border border-gray-200 shadow-sm">
                        <span>{imagePreviews.length > 0 ? 'Ajouter d’autres images' : 'Télécharger des images'}</span>
                        <input required={imagePreviews.length === 0} multiple type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                      <p className="text-xs text-gray-500">Vous pouvez télécharger plusieurs images sans limite stricte.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full btn-brand py-4 rounded-xl text-lg font-black uppercase tracking-widest transition-all hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-3"
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
