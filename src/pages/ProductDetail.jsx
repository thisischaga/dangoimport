import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ShoppingCart, Zap, Shield, Truck, RotateCcw,
  Package, Minus, Plus, Heart, Share2, Star, BadgeCheck,
} from 'lucide-react';
import { useProduct, useSimilarProducts } from '../hooks/useProducts';
import { getProductImage, resolveImageUrl } from '../utils/imageUrl';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/product/ProductCard';
import ProductRating from '../components/product/ProductRating';
import { DiscountBadge, LabelBadge } from '../components/product/ProductBadge';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80';

function formatCFA(v) {
  return `${Number(v || 0).toLocaleString('fr-FR')} FCFA`;
}

/* ── Image Gallery ─────────────────────────────────────── */
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
    <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
      {/* Main image */}
      <div
        style={{
          position: 'relative',
          background: '#f8f8f8',
          overflow: 'hidden',
          cursor: zoom ? 'zoom-out' : 'zoom-in',
          aspectRatio: '1/1',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          minHeight: 0,
        }}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={validImages[active]}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: zoom ? 'scale(2)' : 'scale(1)',
            transition: zoom ? 'none' : 'transform 0.3s ease',
            display: 'block',
          }}
        />
        {/* Wishlist */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => setLiked(v => !v)}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: '#fff', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <Heart size={16} fill={liked ? '#FF4747' : 'none'} style={{ color: liked ? '#FF4747' : '#666' }} />
        </motion.button>
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', overflowX: 'hidden', paddingBottom: '4px', minWidth: 0 }}>
          {validImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                minWidth: 68,
                minHeight: 68,
                width: 68,
                height: 68,
                border: i === active ? '2px solid #FF6B00' : '2px solid #e5e5e5',
                background: '#f8f8f8',
                cursor: 'pointer',
                padding: 0,
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              <img src={img} alt={`${name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Quantity Selector ──────────────────────────────────── */
function QuantitySelector({ value, onChange, max }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        style={{
          width: 36, height: 36, border: '1.5px solid #e0e0e0',
          background: value <= 1 ? '#f5f5f5' : '#fff',
          cursor: value <= 1 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#555', fontSize: '18px', fontWeight: 300,
        }}
      >
        <Minus size={14} />
      </button>
      <div style={{
        width: 48, height: 36, border: '1.5px solid #e0e0e0', borderLeft: 'none', borderRight: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: 700, color: '#1a1a1a',
      }}>
        {value}
      </div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: 36, height: 36, border: '1.5px solid #e0e0e0',
          background: value >= max ? '#f5f5f5' : '#fff',
          cursor: value >= max ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#555',
        }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────── */
function DetailSkeleton() {
  const S = ({ style }) => (
    <div style={{
      background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite linear',
      borderRadius: 6, ...style,
    }} />
  );
  return (
    <div style={{ padding: '32px 0' }}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gap: 32, gridTemplateColumns: '1fr 1fr' }}>
        <S style={{ aspectRatio: '1/1' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <S style={{ height: 18, width: '40%' }} />
          <S style={{ height: 28, width: '85%' }} />
          <S style={{ height: 18, width: '55%' }} />
          <S style={{ height: 36, width: '45%' }} />
          <S style={{ height: 14, width: '60%' }} />
          <S style={{ height: 48, width: '100%', marginTop: 16 }} />
          <S style={{ height: 48, width: '100%' }} />
        </div>
      </div>
    </div>
  );
}

/* ── Info Row ───────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ color: accent || '#FF6B00', flexShrink: 0, marginTop: 2 }}>
        <Icon size={16} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 12, color: '#7a7a7a', margin: '2px 0 0', lineHeight: 1.5 }}>{value}</p>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: similar = [] } = useSimilarProducts(id);

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Derived values
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

  const rating = Number(product?.rating ?? 4.3);
  const reviewCount = Number(product?.totalReviews ?? product?.reviews?.length ?? 128);
  const soldCount = Number(product?.soldCount ?? 1240);
  const deliveryZones = Array.isArray(product?.deliveryZones) ? product.deliveryZones : [];
  const deliverySummary = useMemo(() => {
    if (!deliveryZones.length) return 'Livraison disponible selon votre localité';
    return deliveryZones
      .map((zone) => {
        const locality = zone?.locality || zone?.area || zone?.country || 'Votre localité';
        const time = zone?.deliveryTime || 'Délai à confirmer';
        return `${locality} • ${time}`;
      })
      .join(' · ');
  }, [deliveryZones]);

  // Build images array
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

  // ── Loading ─────────────────────────────────────────────
  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <DetailSkeleton />
      <Footer />
    </div>
  );

  // ── Error ────────────────────────────────────────────────
  if (isError || !product) return (
    <div style={{ minHeight: '100vh', background: '#f6f6f7', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center' }}>
          
          <p style={{textAlign: "center"}}><Package size={52} style={{ color: '#d5d5d5', marginBottom: 16 }} /></p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Produit introuvable</p>
          <p style={{ fontSize: 14, color: '#9a9a9a', marginBottom: 24 }}>Ce produit n'existe pas ou a été retiré.</p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#FF6B00', color: '#fff', border: 'none',
              padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );

  // ── Page ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f6f6f7', fontFamily: 'inherit', overflowX: 'hidden' }}>
      <Header />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9a9a9a', marginBottom: 16, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#9a9a9a', textDecoration: 'none' }}>Accueil</Link>
          <ChevronRight size={12} />
          {product.category && typeof product.category === 'string' && (
            <>
              <Link to={`/category/${encodeURIComponent(product.category)}`} style={{ color: '#9a9a9a', textDecoration: 'none' }}>{product.category}</Link>
              <ChevronRight size={12} />
            </>
          )}
          <span style={{ color: '#1a1a1a', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</span>
        </nav>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="lg:grid-cols-detail">
          <style>{`
            @media(min-width:1024px){
              .lg\\:grid-cols-detail { grid-template-columns: 480px 1fr 300px !important; }
            }
            @media(min-width:768px){
              .lg\\:grid-cols-detail { grid-template-columns: 1fr 1fr; }
            }
          `}</style>

          {/* ── Gallery ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            style={{ background: '#fff' }}
          >
            <ImageGallery images={images} name={product.name} />
          </motion.div>

          {/* ── Info Column ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            style={{ background: '#fff', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Badges */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {discount > 0 && <DiscountBadge discount={discount} />}
              {product.isBestSeller && <LabelBadge type="bestSeller" label="Best Seller" />}
              {product.isNew && <LabelBadge type="nouveau" label="Nouveau" />}
              {!inStock && <LabelBadge type="rupture" label="Rupture de stock" />}
            </div>

            {/* Title */}
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: 0, lineHeight: 1.35 }}>
              {product.name}
            </h1>

            {product.category && (
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9a9a9a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                {product.category}
              </p>
            )}

            {/* Seller */}
            {(product.vendorName || product.sellerName) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#7a7a7a', flexWrap: 'wrap' }}>
                Vendu par
                <span style={{ fontWeight: 700, color: '#1a1a1a' }}>{product.vendorName || product.sellerName || 'Vendeur indépendant'}</span>
                {product.sellerVerified && <BadgeCheck size={13} style={{ color: '#FF6B00' }} />}
              </div>
            )}

            {/* Rating
            <ProductRating rating={rating} reviewCount={reviewCount}  />

            {/* Price */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: '#FF6B00', letterSpacing: '-0.03em' }}>
                  {formatCFA(displayPrice)}
                </span>
                {hasPromo && (
                  <span style={{ fontSize: 15, color: '#b0b0b0', textDecoration: 'line-through' }}>
                    {formatCFA(price)}
                  </span>
                )}
                {hasPromo && (
                  <span style={{ background: '#fff1f1', color: '#FF4747', fontWeight: 700, fontSize: 12, padding: '2px 8px' }}>
                    Économisez {formatCFA(price - promoPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Variantes</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {product.variants.map((v, i) => {
                    // v peut être un string ou un objet {name, sku, price, ...}
                    const label = typeof v === 'string' ? v
                      : v?.name || v?.label || v?.sku || `Variante ${i + 1}`;
                    const extra = typeof v === 'object' && v?.price ? ` — ${Number(v.price).toLocaleString('fr-FR')} FCFA` : '';
                    return (
                      <button key={i} style={{
                        padding: '6px 14px', border: '1.5px solid #e0e0e0',
                        background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}>{label}{extra}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              <span style={{ fontSize: 13, fontWeight: 600, color: inStock ? '#166534' : '#b91c1c' }}>
                {inStock ? (isLowStock ? `Plus que ${stock} en stock — commandez vite !` : `En stock (${stock} disponibles)`) : 'Rupture de stock'}
              </span>
            </div>

            {/* Qty + Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quantité</span>
                <QuantitySelector value={qty} onChange={setQty} max={stock || 99} />
                {qty > 1 && (
                  <span style={{ fontSize: 12, color: '#9a9a9a' }}>
                    Total : <strong style={{ color: '#FF6B00' }}>{formatCFA(displayPrice * qty)}</strong>
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: inStock ? '#fff' : '#f0f0f0',
                    color: inStock ? '#FF6B00' : '#aaa',
                    border: `2px solid ${inStock ? '#FF6B00' : '#e0e0e0'}`,
                    padding: '13px 20px', fontSize: 14, fontWeight: 700, cursor: inStock ? 'pointer' : 'not-allowed',
                    transition: 'all 0.18s',
                  }}
                >
                  <ShoppingCart size={16} />
                  {isInCart ? 'Déjà au panier' : 'Ajouter au panier'}
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: inStock ? '#FF6B00' : '#e0e0e0',
                    color: '#fff', border: 'none',
                    padding: '13px 20px', fontSize: 14, fontWeight: 700, cursor: inStock ? 'pointer' : 'not-allowed',
                  }}
                >
                  Acheter maintenant
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Mobile fixed action bar: Add to cart / Buy now */}
          <div className="md:hidden">
            <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '12px', background: 'linear-gradient(180deg, rgba(246,246,246,0.6), rgba(255,255,255,0.9))', borderTop: '1px solid #eee', backdropFilter: 'saturate(180%) blur(6px)' }}>
              <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: 8, padding: '6px' }}>
                <button onClick={handleAddToCart} disabled={!inStock} style={{ flex: 1, minHeight: 44, background: '#fff', border: '1px solid #e6e6e6', borderRadius: 10, fontWeight: 800, color: inStock ? '#111' : '#999' }}>
                  {isInCart ? 'Déjà au panier' : 'Ajouter au panier'}
                </button>
                <button onClick={handleBuyNow} disabled={!inStock} style={{ flex: 1, minHeight: 44, background: '#FF6B00', borderRadius: 10, color: '#fff', fontWeight: 900 }}>
                  Acheter maintenant
                </button>
              </div>
            </div>
            <div style={{ height: 78 }} />
          </div>

          {/* ── Delivery Sidebar ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            style={{ background: '#fff', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 0, alignSelf: 'start' }}
          >
            <p style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Livraison & Garanties
            </p>
            <InfoRow icon={Zap} label="Localités de livraison" value={deliverySummary} />
            <InfoRow icon={Package} label="Disponibilité" value={inStock ? `${stock} en stock` : 'Rupture de stock'} />
            <InfoRow icon={Shield} label="Paiement sécurisé" value="Mobile Money sécurisé" />
            <InfoRow icon={RotateCcw} label="Retours faciles" value="Retour gratuit sous 7 jours si produit non conforme" />

            <div style={{ marginTop: 16, padding: '12px', background: '#FFF3EA', border: '1px solid #FFD9BE' }}>
              <p style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, margin: 0, lineHeight: 1.5 }}>
                Achetez en toute confiance | Satisfait ou remboursé
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Tabs : Description / Caractéristiques ── */}
        <div style={{ background: '#fff', marginTop: 16, padding: '0' }}>
          {/* Tab nav */}
          <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0' }}>
            {['description', 'specs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '14px 24px', border: 'none', background: 'transparent',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  color: activeTab === tab ? '#FF6B00' : '#7a7a7a',
                  borderBottom: activeTab === tab ? '2px solid #FF6B00' : '2px solid transparent',
                  marginBottom: -2,
                }}
              >
                {tab === 'description' ? 'Description' : 'Caractéristiques'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '24px 24px', maxWidth: 860, lineHeight: 1.8, fontSize: 14, color: '#444' }}
            >
              {activeTab === 'description' ? (
                <p style={{ whiteSpace: 'pre-line', margin: 0 }}>
                  {product.description || product.shortDescription || 'Aucune description disponible pour ce produit.'}
                </p>
              ) : (
                <div>
                  {product.features?.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {product.features.map((f, i) => {
                          const featureStr = typeof f === 'string' ? f
                            : typeof f === 'object' && f !== null
                              ? (f.label || f.name || f.value || JSON.stringify(f))
                              : String(f ?? '');
                          return (
                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '10px 0', fontSize: 13, color: '#9a9a9a', width: '35%', fontWeight: 500 }}>
                                Caractéristique {i + 1}
                              </td>
                              <td style={{ padding: '10px 0', fontSize: 13, color: '#1a1a1a', fontWeight: 600 }}>{featureStr}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ color: '#9a9a9a', fontSize: 13, margin: 0 }}>Caractéristiques techniques non disponibles.</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Produits similaires ── */}
        {similar.length > 0 && (
          <div style={{ marginTop: 32, marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>
              Vous aimerez aussi
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 20, marginTop: 0 }}>
              Produits similaires
            </h2>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', minWidth: 0 }} className="sm:grid-cols-similar">
              <style>{`
                @media(min-width:640px){.sm\\:grid-cols-similar{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}}
                @media(min-width:1024px){.sm\\:grid-cols-similar{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}}
                @media(min-width:1280px){.sm\\:grid-cols-similar{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}}
              `}</style>
              {similar.slice(0, 6).map((p) => {
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
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
