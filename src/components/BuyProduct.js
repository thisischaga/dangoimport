import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { toast } from 'react-toastify';
import { 
  FaMapMarkerAlt, FaShoppingCart, FaShieldAlt, 
  FaCheckCircle, FaLocationArrow, FaSpinner,
  FaUser, FaEnvelope, FaInfoCircle
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useCart } from '../context/CartContext';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STORE_LOCATION = { lat: 6.3813, lng: 2.3831 }; // Cotonou, Stade

// Composant interne pour recentrer la carte
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { animate: true });
  }, [center, map]);
  return null;
}

const BuyProduct = ({ image, name, price, vendorName, parameters = [], isVisibled }) => {
  const { clearCart } = useCart();
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fedapayLoading, setFedapayLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // État pour les sélections de paramètres
  const [selectedOptions, setSelectedOptions] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'cash',
    address: '',
    city: '',
    deliveryNotes: '',
    quantity: 1
  });

  // Calculer le prix avec les surcoûts des options
  const calculateTotalPrice = () => {
    let totalPrice = price;
    parameters.forEach(param => {
      const selectedValue = selectedOptions[param.name];
      if (selectedValue) {
        const option = param.options?.find(opt => opt.value === selectedValue);
        if (option && option.priceAdjustment) {
          totalPrice += option.priceAdjustment;
        }
      }
    });
    return totalPrice;
  };

  const finalPrice = calculateTotalPrice();

  // ─── FedaPay Live Checkout ───────────────────────────────────────────
  const handleFedapayPayment = async () => {
    if (!formData.phone || formData.phone.length < 8) return toast.warning('Numéro de téléphone invalide.');
    if (!location) return toast.warning('Veuillez indiquer votre position sur la carte.');

    const grandTotal = finalPrice * formData.quantity;
    setFedapayLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/fedapay/checkout`, {
        userName: formData.name,
        userNumber: formData.phone,
        productQuantity: formData.quantity,
        userPref: formData.deliveryNotes || formData.address,
        selectedCountry: 'Benin',
        picture: image,
        userEmail: formData.email,
        lat: location.lat,
        lng: location.lng,
        deliveryFee: 0,
        address: formData.address,
        city: formData.city || 'Non précisé',
        totalPrice: grandTotal,
        productPrice: finalPrice,
        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : null,
        description: `Achat - ${name}`,
        type: 'achat',
        vendorName: vendorName || 'Vendeur Indépendant'
      });

      if (response.data && response.data.url) {
        clearCart();
        window.location.href = response.data.url; // Redirection Hosted Checkout
      } else {
        toast.error('Erreur lors de la création du paiement FedaPay.');
        setFedapayLoading(false);
      }
    } catch (error) {
      console.error('Erreur FedaPay Checkout :', error);
      toast.error('Impossible de démarrer le paiement FedaPay.');
      setFedapayLoading(false);
    }
  };

  // Auto-remplissage au montage
  useEffect(() => {
    const dangoUser = JSON.parse(localStorage.getItem('dangoUser') || '{}');
    if (dangoUser.email || dangoUser.userEmail) {
      setFormData(prev => ({
        ...prev,
        name: dangoUser.firstname ? `${dangoUser.firstname} ${dangoUser.surname || ''}`.trim() : (dangoUser.userName || ''),
        email: dangoUser.userEmail || dangoUser.email || '',
        phone: dangoUser.phone || dangoUser.userNumber || ''
      }));
    }
  }, []);

  // Gestion de la position
  const updateLocationAndFee = useCallback((lat, lng) => {
    setLocation({ lat, lng });
  }, []);

  // Debounce pour l'autocomplétion
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (formData.address.length > 3 && !location) {
        setIsSearching(true);
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&countrycodes=bj,tg&limit=5`);
          setSuggestions(res.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Nominatim error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [formData.address, location]);

  const handleSelectSuggestion = (s) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setFormData(prev => ({ ...prev, address: s.display_name }));
    updateLocationAndFee(lat, lng);
    setShowSuggestions(false);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return toast.error("Géolocalisation non supportée.");
    toast.info("Recherche de votre position...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocationAndFee(pos.coords.latitude, pos.coords.longitude);
        toast.success("Position détectée !");
      },
      () => toast.error("Veuillez autoriser la localisation.")
    );
  };

  // UI for selecting payment method
  const handlePaymentMethodChange = (e) => {
    setFormData({ ...formData, paymentMethod: e.target.value });
  };

  // Updated order handler to respect payment method
  const handleOrder = async (e) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length < 8) return toast.warning("Numéro de téléphone invalide.");
    if (!location) return toast.warning("Veuillez indiquer votre position sur la carte.");

    setLoading(true);
    const totalProduct = finalPrice * formData.quantity;
    const grandTotal = totalProduct;

    try {
      if (formData.paymentMethod === 'fedapay') {
        // Use existing FedaPay checkout flow
        await handleFedapayPayment();
        return;
      }

      const orderData = {
        userName: formData.name,
        userNumber: formData.phone,
        productQuantity: formData.quantity,
        userPref: formData.deliveryNotes || formData.address,
        selectedCountry: 'Benin',
        picture: image,
        userEmail: formData.email,
        status: 'En attente',
        paymentMethod: 'Paiement à la livraison',
        address: formData.address,
        city: formData.city || 'Non précisé',
        lat: location.lat,
        lng: location.lng,
        deliveryFee: 0,
        totalPrice: grandTotal,
        productPrice: finalPrice,
        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : null,
        vendorName: vendorName || 'Vendeur Indépendant'
      };

      await axios.post(`${API_BASE_URL}/acheter`, orderData);

      setOrderConfirmed(true);
      toast.success('Commande enregistrée ! Notre équipe vous contactera pour la livraison.');
      clearCart();
      setTimeout(() => {
        isVisibled(false);
        setOrderConfirmed(false);
      }, 2500);
    } catch (error) {
      toast.error('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const totalProduct = finalPrice * formData.quantity;
  const grandTotal = totalProduct;

  function MapEvents() {
    useMapEvents({
      click(e) {
        updateLocationAndFee(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div className="bg-white flex flex-col lg:flex-row w-full overflow-hidden">
      {/* ── Gauche : Produit & Map ────────────────── */}
      <div className="bg-gray-50 flex flex-col lg:w-2/5 lg:border-r border-gray-100 border-b lg:border-b-0 shrink-0">
          <div className="p-4 sm:p-6 flex items-center gap-4 border-b border-gray-100 bg-white/50">
          <img src={image} alt={name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-contain bg-white shadow" />
          <div>
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1">{name}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-yellow-600 font-semibold text-base sm:text-lg">{finalPrice.toLocaleString()} F <span className="text-[10px] text-gray-400">CFA</span></p>
              {finalPrice > price && <p className="text-[10px] text-gray-400 line-through">{price.toLocaleString()} F</p>}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-48 sm:h-64 lg:flex-1 lg:h-auto">
          <MapContainer 
            center={[STORE_LOCATION.lat, STORE_LOCATION.lng]} 
            zoom={13} 
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapEvents />
            <ChangeView center={location ? [location.lat, location.lng] : null} />
            
            {/* Store Marker */}
            <Marker position={[STORE_LOCATION.lat, STORE_LOCATION.lng]} icon={L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#111827; border:2px solid white; width:12px; height:12px; border-radius:50%; shadow: 0 0 10px rgba(0,0,0,0.5);'></div>",
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })} />

            {location && (
              <Marker position={[location.lat, location.lng]} />
            )}
          </MapContainer>
          
          <button 
            type="button"
            onClick={handleLocateMe}
            className="absolute bottom-4 right-4 z-[1000] bg-white text-gray-900 p-3 rounded-lg shadow hover:bg-yellow-400 transition-all active:scale-95"
            title="Me localiser"
          >
            <FaLocationArrow />
          </button>
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            <span>Résumé</span>
            <span>{formData.quantity} article(s)</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Prix unitaire</span>
              <span className="font-black text-gray-900">{price.toLocaleString()} F</span>
            </div>
            {finalPrice > price && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Surcoûts options</span>
                <span className="font-black text-green-600">+{(finalPrice - price).toLocaleString()} F</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Quantité</span>
              <span className="font-black text-gray-900">×{formData.quantity}</span>
            </div>
            <div className="pt-3 mt-1 border-t border-gray-100 flex justify-between items-center">
              <span className="font-black text-gray-900 uppercase text-xs tracking-tighter">Total à payer</span>
              <span className="text-xl font-black text-gray-900">{grandTotal.toLocaleString()} F</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Droite : Formulaire ────────────────────── */}
      <div className="p-4 sm:p-8 lg:w-3/5 overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
          Finaliser <span className="text-yellow-400 italic">l'Achat</span>
        </h2>
        {orderConfirmed && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-3">
            <FaCheckCircle className="text-emerald-500" />
            <div>
              <div className="font-semibold">Commande confirmée</div>
              <div className="text-sm text-emerald-600">Nous préparons votre commande et vous contacterons bientôt.</div>
            </div>
          </div>
        )}
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">Informations de livraison</p>

        {/* Paramètres du produit - Affichage détaillé */}
        {parameters && parameters.length > 0 && (
          <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⚙️</span>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Options disponibles</h3>
              <span className="ml-auto text-[10px] bg-purple-200 text-purple-900 px-2 py-1 rounded-full font-bold">{parameters.length} paramètre{parameters.length > 1 ? 's' : ''}</span>
            </div>

            {/* Grille des paramètres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parameters.map((param) => (
                <div key={param.name} className="bg-white rounded-xl p-4 border border-purple-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">{param.name}</p>
                  <div className="space-y-2">
                    {param.options?.map((option) => (
                      <div key={option.value} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{option.value}</span>
                        {option.priceAdjustment > 0 ? (
                          <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded">+{option.priceAdjustment.toLocaleString()} F</span>
                        ) : (
                          <span className="text-xs text-gray-400">Inclus</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire de sélection des options */}
        {parameters && parameters.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sélectionner vos options</h3>
            {parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">{param.name}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {param.options?.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedOptions({ ...selectedOptions, [param.name]: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium text-center ${
                        selectedOptions[param.name] === option.value
                          ? 'border-purple-500 bg-purple-100 text-purple-900'
                          : 'border-white bg-white text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div>{option.value}</div>
                      {option.priceAdjustment > 0 && (
                        <div className="text-[10px] mt-1 font-bold text-green-600">+{option.priceAdjustment.toLocaleString()} F</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {/* Afficher le prix avec surcoûts */}
            {Object.keys(selectedOptions).length > 0 && (
              <div className="mt-4 pt-4 border-t border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600 uppercase">Prix final:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-purple-600">{finalPrice.toLocaleString()} F</span>
                    {finalPrice > price && (
                      <span className="text-xs line-through text-gray-400">{price.toLocaleString()} F</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleOrder} className="space-y-6">
          <div className="grid gap-5">
            {/* Sélection du mode de paiement */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-gray-400 ml-1">Mode de paiement</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input type="radio" name="paymentMethod" value="cash" checked={formData.paymentMethod === 'cash'} onChange={handlePaymentMethodChange} className="form-radio" />
                  <span className="text-sm">Cash</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="paymentMethod" value="fedapay" checked={formData.paymentMethod === 'fedapay'} onChange={handlePaymentMethodChange} className="form-radio" />
                  <span className="text-sm">FedaPay</span>
                </label>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 ml-1">Nom complet</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 transition-all font-medium text-sm" placeholder="Ex: Jean Dupont" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 ml-1">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 transition-all font-medium text-sm" placeholder="votre@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-gray-400 ml-1">WhatsApp / Téléphone</label>
              <PhoneInput 
                country={'bj'} 
                value={formData.phone} 
                onChange={phone => setFormData({...formData, phone})}
                inputStyle={{ width: '100%', height: '52px', borderRadius: '1rem', border: '1px solid #f3f4f6', backgroundColor: '#f9fafb', fontSize: '14px', fontWeight: 'bold' }}
                buttonStyle={{ borderRadius: '1rem 0 0 1rem', border: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}
              />
            </div>

            {/* Adresse avec Autocomplete */}
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-medium text-gray-400 ml-1">Adresse ou Quartier</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-11 pr-11 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 transition-all font-medium text-sm" placeholder="Commencez à taper..." value={formData.address} onChange={e => { setLocation(null); setFormData({...formData, address: e.target.value}); }} />
                {isSearching && <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-yellow-500" />}
              </div>
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-[2000] w-full bg-white mt-1.5 rounded-lg shadow-md border border-gray-100 overflow-hidden max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {suggestions.map((s, idx) => (
                    <li key={idx} onClick={() => handleSelectSuggestion(s)} className="px-4 py-3 hover:bg-yellow-50 cursor-pointer border-b border-gray-50 last:border-0 text-[11px] font-medium text-gray-700 transition-colors">
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
              {!location && formData.address.length > 3 && !isSearching && !showSuggestions && (
                <p className="text-[10px] text-blue-500 font-medium mt-1 flex items-center gap-1"><FaInfoCircle /> Cliquez sur la carte ou une suggestion pour valider la position</p>
              )}
            </div>

            {/* Méthode de paiement & Quantité */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 ml-1">Paiement</label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 px-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 transition-all font-medium text-sm appearance-none cursor-pointer"
                >
                  <option value="cash">Paiement à la livraison</option>
                  <option value="fedapay">Paiement en ligne (FedaPay)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-gray-400 ml-1">Quantité</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-lg p-1">
                  <button type="button" onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})} className="w-10 h-10 rounded-md bg-white shadow-sm flex items-center justify-center font-medium hover:bg-gray-100 transition-colors">-</button>
                  <span className="flex-1 text-center font-medium text-sm">{formData.quantity}</span>
                  <button type="button" onClick={() => setFormData({...formData, quantity: formData.quantity + 1})} className="w-10 h-10 rounded-md bg-white shadow-sm flex items-center justify-center font-medium hover:bg-gray-100 transition-colors">+</button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-gray-400 ml-1">Instructions (Optionnel)</label>
              <textarea rows={2} className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 px-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 transition-all font-medium text-sm" placeholder="Appartement, étage, point de repère..." value={formData.deliveryNotes} onChange={e => setFormData({...formData, deliveryNotes: e.target.value})} />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <div className="flex flex-col items-center gap-4">

              {/* Bouton Cash à la livraison */}
              {formData.paymentMethod === 'cash' && (
                <button
                  disabled={loading || !location || orderConfirmed}
                  type="submit"
                  className="w-full max-w-md bg-gray-900 text-white py-3 sm:py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 hover:text-gray-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : orderConfirmed ? 'Commande confirmée' : `Confirmer la commande (${grandTotal.toLocaleString()} F)`}
                  {!loading && !orderConfirmed && <FaShoppingCart />}
                </button>
              )}

              {/* Bouton FedaPay */}
              {formData.paymentMethod === 'fedapay' && (
                <button
                  type="button"
                  onClick={handleFedapayPayment}
                  disabled={fedapayLoading || !location || orderConfirmed}
                  className="w-full max-w-md bg-[#0f3460] text-white py-3 sm:py-4 rounded-lg text-lg font-semibold hover:bg-[#16213e] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
                >
                  {fedapayLoading
                    ? <><FaSpinner className="animate-spin" /> Ouverture du paiement...</>
                    : orderConfirmed
                    ? 'Paiement confirmé ✓'
                    : (
                      <>
                        <img src="https://fedapay.com/wp-content/uploads/2020/05/logo.png" alt="FedaPay" className="h-5 object-contain brightness-0 invert" />
                        Payer {grandTotal.toLocaleString()} F via FedaPay
                      </>
                    )
                  }
                </button>
              )}

              <div className="flex items-center justify-center gap-6 text-[10px] font-medium text-gray-300">
                <div className="flex items-center gap-2"><FaShieldAlt className="text-emerald-400" /> Transactions sécurisées</div>
                <div className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400" /> Produit vérifié</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyProduct;
