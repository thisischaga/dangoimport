import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVendorProducts } from '../hooks/useProducts';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BuyProduct from '../components/BuyProduct';
import { useCart } from '../context/CartContext';
import { FaStore, FaMapMarkerAlt, FaStar, FaTimes, FaSpinner } from 'react-icons/fa';

const VendorProfile = () => {
  const { vendorName } = useParams();
  const { addToCart } = useCart();
  const { data: products = [], isLoading: loading } = useVendorProducts(vendorName);
  const [showForm, setShowForm] = useState(false);
  const [productDetail, setProductDetail] = useState(null);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />

      {/* Bannière de la boutique */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#fffbeb] text-[#e6c600] rounded-full flex items-center justify-center text-4xl shadow-sm border border-[#ffdc2b]/25">
              <FaStore />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">
                {vendorName}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-gray-400" /> Bénin</span>
                <span className="flex items-center gap-1"><FaStar className="text-[#ffdc2b]" /> Vendeur Vérifié</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Tous les produits de la boutique</h2>
          <span className="text-sm text-gray-500">{products.length} résultat(s)</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FaSpinner className="animate-spin text-4xl mb-4 text-[#e6c600]" />
            <p>Chargement de la boutique...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">Cette boutique n'a publié aucun produit pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p) => (
              <div key={p._id} className="border border-gray-200 rounded-xl p-4 flex flex-col hover:shadow-lg hover:border-transparent transition-all bg-white relative group">
                
                {/* Image Container */}
                <div 
                  className="aspect-[4/3] mb-4 cursor-pointer overflow-hidden flex items-center justify-center bg-gray-50 rounded-lg p-4"
                  onClick={() => { setProductDetail(p); setShowForm(true); }}
                >
                  <img src={p.image} alt={p.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" />
                </div>
                
                {/* Title */}
                <h3 
                  className="text-[14px] leading-tight font-medium mb-1 cursor-pointer text-[#2563EB] hover:text-[#1D4ED8] line-clamp-2"
                  onClick={() => { setProductDetail(p); setShowForm(true); }}
                >
                  {p.name}
                </h3>
                
                {/* Rating removed temporarily */}
                <div className="h-4 mb-2"></div>

                {/* Price */}
                <div className="flex items-start gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-900 leading-none">{p.price}</span>
                  <span className="text-xs font-medium text-gray-900 mt-0.5">FCFA</span>
                </div>

                {/* Prime / Delivery */}
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[#00A8E1] font-black italic text-[10px] tracking-tighter">✓ prime</span>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  Livraison <span className="font-bold">GRATUITE</span>
                </p>

                {/* Button */}
                <button 
                  onClick={() => addToCart(p)}
                  className="mt-auto bg-[#ffdc2b] hover:bg-[#ffdc2b] transition-colors py-1.5 rounded-full text-xs font-medium border border-[#ffdc2b] text-gray-900 w-full"
                >
                  Ajouter au panier
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal d'achat */}
      {showForm && productDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-1 shadow-2xl">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black z-50"><FaTimes size={24} /></button>
            <BuyProduct image={productDetail.image} name={productDetail.name} price={productDetail.price} vendorName={productDetail.vendorName} parameters={productDetail.parameters || []} isVisibled={setShowForm} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VendorProfile;
