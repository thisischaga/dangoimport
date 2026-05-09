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
const BASE_FEE = 0;
const FEE_PER_KM = 100;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Composant interne pour recentrer la carte
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { animate: true });
  }, [center, map]);
  return null;
}

const BuyProduct = ({ image, name, price, isVisibled }) => {
  const { clearCart } = useCart();
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
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

  // Gestion du calcul des frais
  const updateLocationAndFee = useCallback((lat, lng) => {
    setLocation({ lat, lng });
    const distance = calculateDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, lat, lng);
    const fee = BASE_FEE + Math.ceil(distance) * FEE_PER_KM;
    setDeliveryFee(fee);
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

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length < 8) return toast.warning("Numéro de téléphone invalide.");
    if (!location) return toast.warning("Veuillez indiquer votre position sur la carte.");

    setLoading(true);
    const totalProduct = price * formData.quantity;
    const grandTotal = totalProduct + deliveryFee;

    try {
      const orderData = {
        userName: formData.name,
        userNumber: formData.phone,
        productQuantity: formData.quantity,
        userPref: formData.deliveryNotes || formData.address,
        selectedCountry: 'Benin',
        picture: image,
        userEmail: formData.email,
        status: 'En attente',
        paymentMethod: formData.paymentMethod === 'online' ? 'PayDunya' : 'Paiement à la livraison',
        address: formData.address,
        city: formData.city || 'Non précisé',
        lat: location.lat,
        lng: location.lng,
        deliveryFee: deliveryFee,
        totalPrice: grandTotal,
        productPrice: price
      };

      await axios.post(`${API_BASE_URL}/acheter`, orderData);

      if (formData.paymentMethod === 'online') {
        console.log('🚀 [BuyProduct] Appel PayDunya URL:', `${API_BASE_URL}/api/paydunya/create-invoice`);
        const paydunyaRes = await axios.post(`${API_BASE_URL}/api/paydunya/create-invoice`, {
          amount: grandTotal,
          description: `Commande Dango Import - ${name}`,
          items: [
            {
              name: name,
              quantity: formData.quantity,
              price: price,
              total: totalProduct
            },
            {
              name: 'Frais de livraison',
              quantity: 1,
              price: deliveryFee,
              total: deliveryFee
            }
          ],
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        });

        if (paydunyaRes.data?.url) {
          toast.success('Redirection vers PayDunya...');
          clearCart();
          window.location.href = paydunyaRes.data.url;
          return;
        } else {
          toast.error('Erreur lors de la création du lien de paiement.');
        }
      } else {
        // marque la commande comme confirmée et ferme le modal après un bref délai
        setOrderConfirmed(true);
        toast.success('Commande enregistrée !');
        clearCart();
        setTimeout(() => {
          isVisibled(false);
          setOrderConfirmed(false);
        }, 2200);
      }
    } catch (error) {
      toast.error('Erreur lors de la commande.');
    } finally {
      setLoading(false);
    }
  };

  const totalProduct = price * formData.quantity;
  const grandTotal = totalProduct + deliveryFee;

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
      <div className="bg-gray-50 flex flex-col lg:w-2/5 lg:border-r border-gray-100 border-b lg:border-b-0">
          <div className="p-6 flex items-center gap-4 border-b border-gray-100 bg-white/50">
          <img src={image} alt={name} className="w-16 h-16 rounded-lg object-contain bg-white shadow" />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{name}</h3>
            <p className="text-yellow-600 font-semibold text-lg">{price.toLocaleString()} F <span className="text-[10px] text-gray-400">CFA</span></p>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[220px] lg:min-h-0">
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
              <span className="text-gray-500 font-medium">Articles</span>
              <span className="font-black text-gray-900">{totalProduct.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Livraison</span>
              <span className={`font-black ${deliveryFee > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {deliveryFee > 0 ? `+ ${deliveryFee.toLocaleString()} F` : 'À définir'}
              </span>
            </div>
            <div className="pt-3 mt-1 border-t border-gray-100 flex justify-between items-center">
              <span className="font-black text-gray-900 uppercase text-xs tracking-tighter">Total à payer</span>
              <span className="text-xl font-black text-gray-900">{grandTotal.toLocaleString()} F</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Droite : Formulaire ────────────────────── */}
      <div className="p-6 sm:p-8 lg:w-3/5 overflow-y-auto max-h-[85vh]">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
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

        <form onSubmit={handleOrder} className="space-y-6">
          <div className="grid gap-5">
            {/* Nom & Email */}
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
                <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 px-4 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 transition-all font-medium text-sm appearance-none">
                  <option value="cash">Paiement à la livraison</option>
                  <option value="online">Paiement en ligne</option>
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
              <button
                disabled={loading || !location || orderConfirmed}
                type="submit"
                className="w-full max-w-md bg-gray-900 text-white py-3 sm:py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 hover:text-gray-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
              >
                {loading ? <FaSpinner className="animate-spin" /> : orderConfirmed ? 'Commande confirmée' : (formData.paymentMethod === 'online' ? `Procéder au paiement (${grandTotal.toLocaleString()} F)` : `Confirmer la commande (${grandTotal.toLocaleString()} F)`) }
                {!loading && !orderConfirmed && <FaShoppingCart />}
              </button>

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
