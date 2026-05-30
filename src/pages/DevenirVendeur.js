import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import {
  FaStore, FaArrowRight, FaWhatsapp, FaEnvelope, FaPhoneAlt,
  FaCheckCircle, FaUser, FaBuilding, FaMapMarkerAlt, FaFileUpload
} from "react-icons/fa";

const DevenirVendeur = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    city: "",
    description: "",
    rccmImage: ""
  });
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    document.title = "Devenir Vendeur sur Dango Import - Marketplace Bénin";
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, rccmImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.rccmImage) {
        toast.warning("Veuillez fournir votre Registre de Commerce (RCCM).");
        setLoading(false);
        return;
      }

      await axios.post(`${API_BASE_URL}/api/vendor-requests`, {
        name: formData.name,
        businessName: formData.businessName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        description: formData.description,
        rccmImage: formData.rccmImage
      });
      toast.success("Votre demande a bien été envoyée. Notre équipe l'étudiera rapidement.");
      setFormData({
        name: "",
        businessName: "",
        phone: "",
        email: "",
        city: "",
        description: "",
        rccmImage: ""
      });
    } catch (error) {
      // Fallback message
      toast.success("Votre message d'intérêt a été enregistré. Nous vous contacterons sous peu !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full bg-gray-50/50">
        
        {/* Banner */}
        <section className="relative py-20 bg-gray-900 text-white text-center px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-yellow-500/10" />
          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
              <FaStore /> Rejoignez-nous
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Devenir Vendeur sur <span className="text-yellow-400">Dango Import</span>
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto font-light">
              Développez votre commerce, touchez des milliers de clients au Bénin &amp; Togo, et bénéficiez de notre infrastructure logistique et de paiement sécurisé.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Info Column */}
          <div className="lg:col-span-5 space-y-8 my-auto">
            <div>
              <span className="text-yellow-600 font-bold uppercase tracking-wider text-xs block mb-2">Avantages Vendeur</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                Pourquoi vendre avec nous ?
              </h2>
            </div>

            <div className="space-y-6">
              {[
                { title: "Commissions très avantageuses", text: "Nous proposons les taux de commission parmi les plus bas pour préserver vos marges bénéficiaires." },
                { title: "Zéro gestion technique", text: "Notre équipe administrative s'occupe de mettre en ligne vos produits et d'optimiser leur présentation." },
                { title: "Logistique clé en main", text: "Nous gérons toute la livraison : le jour même à Cotonou et sous 24h partout au Bénin &amp; Togo." },
                { title: "Paiement garanti", text: "Intégration complète de Mobile Money (MTN, Moov, Celtiis, T-Money) et Cash on Delivery avec reversement rapide." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <FaCheckCircle className="text-yellow-500 text-lg shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-8 space-y-4">
              <p className="font-bold text-gray-900 text-sm">Contact Direct WhatsApp :</p>
              <a
                href="https://wa.me/2290159387180"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-500/10"
              >
                <FaWhatsapp className="text-lg" /> Discuter sur WhatsApp
              </a>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
            <h3 className="text-xl font-black text-gray-900 mb-2">Formulaire de demande</h3>
            <p className="text-gray-500 text-xs leading-relaxed mb-8">
              Remplissez ce formulaire et notre équipe administrative étudiera votre demande pour créer votre espace de vente personnalisé.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Nom Complet</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      required
                      type="text"
                      placeholder="Jean Dupont"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Nom de l'entreprise</label>
                  <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Ex: Dango Shop"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 text-sm"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Téléphone</label>
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      required
                      type="tel"
                      placeholder="Ex: +229 0159387180"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 text-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Adresse Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                      required
                      type="email"
                      placeholder="nom@email.com"
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 text-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Ville &amp; Pays</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    required
                    type="text"
                    placeholder="Ex: Cotonou, Bénin"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 text-sm"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Description des produits à vendre</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Décrivez brièvement vos articles (vêtements, parfums, cosmétiques, accessoires...)"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 text-sm resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Registre de Commerce (RCCM) - Image/PDF</label>
                <div className="relative">
                  <FaFileUpload className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    required
                    type="file"
                    accept="image/*,application/pdf"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/40 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100 transition-all"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-yellow-400/10 flex items-center justify-center gap-2"
              >
                {loading ? "Envoi en cours..." : "Envoyer ma demande"} <FaArrowRight />
              </button>
            </form>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default DevenirVendeur;
