import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ShoppingCart,
  Zap,
  Shield,
  Truck,
  RotateCcw,
  Package,
  Minus,
  Plus,
  Heart,
  Share2,
  Star,
  BadgeCheck,
} from 'lucide-react';
import { useProduct, useSimilarProducts } from '../hooks/useProducts';
import { getProductImage, resolveImageUrl } from '../utils/imageUrl';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/product/ProductCard';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80';

function formatCFA(v) {
  return `${Number(v || 0).toLocaleString('fr-FR')} FCFA`;
}

/* ── Image Gallery Component ── */
function ImageGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [liked, setLiked] = useState(false);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const validImages = useMemo(() =>
    images.length > 0 ? images : [FALLBACK_IMG],
    [images]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image View */}
      <div
        className="relative bg-slate-50 overflow-hidden border border-slate-100 rounded-[10px] aspect-square w-full"
        style={{ cursor: zoom ? 'zoom-out' : 'zoom-in' }}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={validImages[active]}
          alt={name}
          className="w-full h-full object-contain display-block"
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: zoom ? 'scale(2)' : 'scale(1)',
            transition: zoom ? 'none' : 'transform 0.3s ease',
          }}
        />
        {/* Favorite overlay button */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-[2px] border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow hover:scale-105 transition"
        >
          <Heart size={18} fill={liked ? '#F43F5E' : 'none'} className={liked ? 'text-rose-500' : 'text-slate-500'} />
        </button>
      </div>

      {/* Thumbnails grid */}
      {validImages.length > 1 && (
        <div className="flex gap-2 flex-wrap pb-1">
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                i === active ? 'border-[#FF6B00] bg-white' : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Quantity Selector Component ── */
function QuantitySelector({ value, onChange, max }) {
  return (
    <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl overflow-hidden h-9 w-32">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition cursor-pointer"
      >
        <Minus size={13} />
      </button>
      <span className="flex-1 text-center text-xs font-extrabold text-slate-800">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-10 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition cursor-pointer"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

/* ── Shimmer Skeleton Component ── */
function DetailSkeleton() {
  const Shimmer = ({ className }) => (
    <div className={`bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`} />
  );
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Shimmer className="aspect-square w-full" />
        <div className="space-y-4">
          <Shimmer className="h-4 w-1/3" />
          <Shimmer className="h-8 w-3/4" />
          <Shimmer className="h-5 w-1/2" />
          <Shimmer className="h-10 w-2/5" />
          <Shimmer className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Info Row Component ── */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100">
      <div className="text-[#FF6B00] shrink-0 mt-0.5">
        <Icon size={15} />
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-800 leading-none">{label}</h4>
        <p className="text-[11px] text-slate-500 mt-1 leading-normal font-medium">{value}</p>
      </div>
    </div>
  );
}

/* ── Main Product Detail Page ── */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: similar = [] } = useSimilarProducts(id);

  useEffect(() => {
    if (product?.name) {
      document.title = product.name;
    } else if (!isLoading && !product) {
      document.title = 'Produit introuvable';
    }
  }, [product?.name, isLoading, product]);

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Price calculations
  const price = Number(product?.price || 0);
  const promoPrice = Number(product?.salePrice || product?.promoPrice || 0);
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const displayPrice = hasPromo ? promoPrice : price;
  const discount = hasPromo ? Math.round((1 - promoPrice / price) * 100) : 0;
  const stock = Number(product?.stock ?? 0);
  const inStock = stock > 0;
  const isLowStock = inStock && stock <= 10;
  const productId = product?._id || product?.id;
  const isInCart = cart.some((item) => (item._id || item.id) === productId);

  const rating = product?.rating ? Number(product.rating) : null;
  const reviewCount = product?.totalReviews || product?.reviews?.length ? Number(product.totalReviews || product?.reviews?.length) : null;
  const soldCount = product?.totalSales || product?.soldCount ? Number(product.totalSales || product.soldCount) : null;
  const deliveryZones = Array.isArray(product?.deliveryZones) ? product.deliveryZones : [];
  const deliverySummary = useMemo(() => {
    if (!deliveryZones.length) return 'Livraison disponible sur Cotonou, Lomé et environs';
    return deliveryZones
      .map((zone) => {
        const locality = zone?.locality || zone?.area || zone?.country || 'Votre localité';
        const time = zone?.deliveryTime || 'Délai à confirmer';
        return `${locality} • ${time}`;
      })
      .join(' · ');
  }, [deliveryZones]);

  // Gallery images resolver
  const images = useMemo(() => {
    if (!product) return [];
    const raw = product.images || [];
    const resolved = raw
      .map((img) => (typeof img === 'string' ? resolveImageUrl(img) : resolveImageUrl(img?.url)))
      .filter(Boolean);
    if (resolved.length === 0) {
      const single = getProductImage(product);
      if (single) return [single];
    }
    return resolved;
  }, [product]);

  const normalizedProduct = useMemo(() => {
    if (!product) return null;
    return {
      ...product,
      id: productId,
      _id: productId,
      price,
      promoPrice: hasPromo ? promoPrice : null,
      image: images[0] || FALLBACK_IMG,
      stock,
    };
  }, [product, productId, price, promoPrice, hasPromo, images, stock]);

  const handleAddToCart = useCallback(() => {
    if (!normalizedProduct) return;
    addToCart(normalizedProduct, qty);
  }, [normalizedProduct, qty, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!normalizedProduct) return;
    if (!isInCart) addToCart(normalizedProduct, qty);
    navigate('/cart');
  }, [normalizedProduct, qty, isInCart, addToCart, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f6f7]">
        <Header />
        <DetailSkeleton />
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-[#f6f6f7] flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm">
            <Package size={52} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-black text-slate-800">Produit introuvable</h2>
            <p className="text-xs text-slate-400 mt-2">Le produit recherché est indisponible ou a expiré.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 rounded-full bg-[#FF6B00] px-6 py-2.5 text-xs font-bold text-white shadow cursor-pointer hover:bg-[#e75b00]"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex flex-col justify-between overflow-x-hidden">
      <div>
        <Header />

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="text-xs text-slate-400 font-semibold mb-4 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-[#FF6B00] transition">Accueil</Link>
            <ChevronRight size={11} />
            {product.category && (
              <>
                <Link to={`/category/${encodeURIComponent(product.category)}`} className="hover:text-[#FF6B00] transition">
                  {product.category}
                </Link>
                <ChevronRight size={11} />
              </>
            )}
            <span className="text-slate-600 truncate max-w-[200px]">{product.name}</span>
          </nav>

          {/* Details Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
            {/* Gallery (Col 1 - md:6, lg:5) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/60 rounded-[10px] p-5 shadow-sm">
              <ImageGallery images={images} name={product.name} />
            </div>

            {/* Product details (Col 2 - md:6, lg:7) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-[10px] p-6 shadow-sm space-y-6">
              <div className="space-y-3">
                {/* Badges row */}
                <div className="flex gap-2 flex-wrap">
                  {discount > 0 && (
                    <span className="bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-rose-100">
                      -{discount}% Off
                    </span>
                  )}
                  {product.isBestSeller && (
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-100">
                      Best Seller
                    </span>
                  )}
                  {product.isNew && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-100">
                      Nouveau
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Stars and sales row */}
                {(rating || reviewCount || soldCount) && (
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold flex-wrap">
                    {rating && (
                      <div className="flex items-center text-amber-500 gap-0.5">
                        <Star size={13} fill="currentColor" />
                        <span className="text-slate-800 font-extrabold">{rating.toFixed(1)}</span>
                      </div>
                    )}
                    {reviewCount && <span>({reviewCount} avis)</span>}
                    {((rating || reviewCount) && soldCount) && <span className="text-slate-300">|</span>}
                    {soldCount && <span>{soldCount}+ vendus</span>}
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-slate-100 pt-5 space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-black text-[#FF6B00] tracking-tight">
                    {formatCFA(displayPrice)}
                  </span>
                  {hasPromo && (
                    <span className="text-sm text-slate-400 line-through font-normal">
                      {formatCFA(price)}
                    </span>
                  )}
                </div>
                {hasPromo && (
                  <p className="text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full w-fit">
                    Économisez {formatCFA(price - promoPrice)} sur cet achat !
                  </p>
                )}
              </div>

              {/* Variation Selectors */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Options disponibles</h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.variants.map((v, i) => {
                      const label = typeof v === 'string' ? v : v?.name || v?.label || v?.sku;
                      return (
                        <button
                          key={i}
                          className="rounded-xl border border-slate-200 hover:border-[#FF6B00] bg-white px-4 py-2 text-xs font-bold text-slate-700 transition cursor-pointer"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock and Quantity */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className={`text-xs font-bold ${inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {inStock ? (isLowStock ? `Plus que ${stock} restants !` : `En stock (${stock} disponibles)`) : 'Rupture de stock'}
                  </span>
                </div>

                {inStock && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantité:</span>
                    <QuantitySelector value={qty} onChange={setQty} max={stock} />
                    {qty > 1 && (
                      <span className="text-xs text-slate-400 font-semibold">
                        Total estimé: <strong className="text-slate-800">{formatCFA(displayPrice * qty)}</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Main Checkout Buttons */}
              <div className="flex gap-3 pt-3 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-bold shadow-sm transition cursor-pointer ${
                    inStock
                      ? 'bg-white border-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FFFDFB]'
                      : 'bg-slate-100 border-none text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={16} />
                  {isInCart ? 'Déjà au panier' : 'Ajouter au panier'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 px-6 text-sm font-bold shadow-sm border-none text-white cursor-pointer ${
                    inStock
                      ? 'bg-[#FF6B00] hover:bg-[#e75b00]'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Zap size={15} />
                  Acheter maintenant
                </button>
              </div>

              {/* Vendor block info */}
              {(product.vendorName || product.sellerName) && (
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Vendu par</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm font-black text-slate-800">{product.vendorName || product.sellerName}</span>
                      {product.sellerVerified && <BadgeCheck size={14} className="text-[#FF6B00]" />}
                    </div>
                  </div>
                  <Link
                    to={`/shop/${product.vendorSlug || product.sellerSlug || encodeURIComponent(product.vendorName || product.sellerName)}`}
                    className="text-xs font-bold text-[#FF6B00] hover:underline"
                  >
                    Visiter la boutique
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Warranties section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
            {/* Left Specs & description tabs (Col 1 - lg:8) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-[10px] overflow-hidden shadow-sm">
              <div className="flex border-b border-slate-100 bg-slate-50">
                {['description', 'specs'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3.5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition ${
                      activeTab === tab
                        ? 'border-[#FF6B00] text-[#FF6B00] bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab === 'description' ? 'Description' : 'Fiche technique'}
                  </button>
                ))}
              </div>

              <div className="p-6 text-sm text-slate-700 leading-relaxed font-medium">
                {activeTab === 'description' ? (
                  <p className="whitespace-pre-line">
                    {product.description || product.shortDescription || 'Aucune description fournie.'}
                  </p>
                ) : (
                  <div>
                    {product.features?.length > 0 ? (
                      <table className="w-full border-collapse">
                        <tbody>
                          {product.features.map((f, i) => {
                            const featureStr = typeof f === 'string' ? f : f?.label || f?.name || f?.value;
                            return (
                              <tr key={i} className="border-b border-slate-100 last:border-none">
                                <td className="py-2.5 text-xs font-bold text-slate-400 w-1/3">
                                  Option {i + 1}
                                </td>
                                <td className="py-2.5 text-xs font-bold text-slate-800">
                                  {featureStr}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-slate-400 text-xs">Aucune caractéristique disponible.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side Delivery cards (Col 2 - lg:4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-[10px] p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-850 pb-2 border-b border-slate-100">
                Garanties & Livraison
              </h3>
              <div className="space-y-1">
                <InfoRow icon={Truck} label="Localités de livraison" value={deliverySummary} />
                <InfoRow icon={Shield} label="Paiement 100% sécurisé" value="Vos fonds sont bloqués jusqu'à livraison finale." />
                <InfoRow icon={RotateCcw} label="Retours simplifiés" value="Retour gratuit sous 7 jours si produit défectueux." />
              </div>

              <div className="bg-[#FFF3EA] border border-[#FFD9BE] p-4 rounded-2xl">
                <p className="text-[11px] font-bold text-[#FF6B00] leading-relaxed">
                  Bénéficiez du programme Dango Choice : des expéditions express et un support réactif.
                </p>
              </div>
            </div>
          </div>

          {/* ── Similar Products grid ── */}
          {similar.length > 0 && (
            <section className="mt-12 space-y-4">
              <div className="border-b border-slate-150 pb-2 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Produits similaires</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {similar.slice(0, 5).map((p) => {
                  const pId = p._id || p.id;
                  const pPrice = Number(p.price || 0);
                  const pPromo = Number(p.salePrice || p.promoPrice || 0);
                  return (
                    <ProductCard
                      key={pId}
                      product={{
                        ...p,
                        id: pId,
                        price: pPrice,
                        promoPrice: pPromo > 0 && pPromo < pPrice ? pPromo : null,
                        image: getProductImage(p) || FALLBACK_IMG,
                        sellerName: p.vendorName || p.sellerName || 'Vendeur',
                      }}
                      onAddToCart={addToCart}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Mobile action bar sticky at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-[6px] border-t border-slate-200 p-3 shadow-lg flex gap-2">
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`flex-1 rounded-xl h-11 text-xs font-bold cursor-pointer transition ${
            inStock
              ? 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isInCart ? 'Déjà au panier' : 'Ajouter'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!inStock}
          className="flex-1 rounded-xl h-11 bg-[#FF6B00] text-white text-xs font-black cursor-pointer shadow hover:bg-[#e75b00]"
        >
          Acheter maintenant
        </button>
      </div>

      <Footer />
    </div>
  );
}
