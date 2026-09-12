import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  ShoppingCart,
  Truck,
  Package,
  Minus,
  Plus,
  ShieldCheck,
  RotateCcw,
  Star,
  CreditCard,
  BadgeCheck,
} from 'lucide-react';
import { useProduct, useProductReviews, useSimilarProducts } from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import { getVendorDeliveryZonesByVendor } from '../api';
import { getProductImages, resolveImageUrl } from '../utils/imageUrl';
import { formatCFA, calcDiscountPercent } from '../utils/formatPrice';
import { useCart } from '../context/CartContext';
import { toast } from '../utils/toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductRating from '../components/product/ProductRating';
import ProductGallery from '../components/product/detail/ProductGallery';
import ProductVariants from '../components/product/detail/ProductVariants';
import ProductReviewsSection from '../components/product/detail/ProductReviewsSection';
import '../pages/ProductDetail.css';

const TABS = [
  { id: 'section-description', label: 'Description' },
  { id: 'section-specs', label: 'Détails' },
  { id: 'section-reviews', label: 'Avis' },
  { id: 'section-delivery', label: 'Livraison' },
];

function QuantitySelector({ value, onChange, max }) {
  const safeMax = Math.max(1, max || 1);
  return (
    <div className="pdp-qty">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="Diminuer">
        <Minus size={16} />
      </button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(safeMax, value + 1))} disabled={value >= safeMax} aria-label="Augmenter">
        <Plus size={16} />
      </button>
    </div>
  );
}

function ExpandableText({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > 320 || text.split('\n').length > 8;

  return (
    <div className="pdp__desc">
      <p className={expanded ? '' : 'pdp__desc-clamped'}>{text}</p>
      {isLong && (
        <button type="button" className="pdp__desc-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Afficher moins' : 'Lire la suite'}
        </button>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const tabsRef = useRef(null);

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(id, { page: 1, limit: 20 });
  const { data: similarProducts = [] } = useSimilarProducts(id);

  const [qty, setQty] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState('section-description');
  const [sellerZones, setSellerZones] = useState([]);

  useEffect(() => {
    if (product?.name) document.title = `${product.name} | Dango Import`;
    else if (!isLoading && !product) document.title = 'Produit introuvable';
  }, [product?.name, isLoading, product]);

  useEffect(() => {
    setQty(1);
    setSelectedVariantIndex(null);
    setSelectedColor(null);
    setSelectedSize(null);
  }, [id]);

  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product?.variants]
  );

  useEffect(() => {
    if (variants.length === 0) return;
    const defaultIdx = variants.findIndex((v) => v.isDefault);
    setSelectedVariantIndex(defaultIdx >= 0 ? defaultIdx : 0);
  }, [variants]);

  const selectedVariant = selectedVariantIndex != null ? variants[selectedVariantIndex] : null;

  const basePrice = Number(product?.price || 0);
  const basePromo = Number(product?.salePrice || product?.promoPrice || 0);
  const variantPrice = selectedVariant?.price != null ? Number(selectedVariant.price) : null;

  const price = variantPrice ?? basePrice;
  const promoPrice = variantPrice == null && basePromo > 0 && basePromo < basePrice ? basePromo : 0;
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const displayPrice = hasPromo ? promoPrice : price;
  const discount = hasPromo ? calcDiscountPercent(price, promoPrice) : 0;
  const savings = hasPromo ? price - promoPrice : 0;

  const stock =
    selectedVariant?.stock != null ? Number(selectedVariant.stock) : Number(product?.stock ?? 0);
  const minStock = Number(product?.minStock ?? 10) || 10;
  const inStock = stock > 0;
  const isLowStock = inStock && stock <= minStock;

  const productId = product?._id || product?.id;
  const sellerId = product?.vendorId || product?.sellerId || product?.vendor_id || null;
  const isInCart = cart.some((item) => (item._id || item.id) === productId);

  const rating = product?.rating != null ? Number(product.rating) : null;
  const reviewCount =
    product?.totalReviews != null ? Number(product.totalReviews) : reviewsData?.pagination?.totalItems || 0;
  const soldCount = Number(product?.totalSales ?? 0) || 0;

  const badgeLabel = product?.isFeatured
    ? 'Sélection'
    : product?.isBestSeller
      ? 'Best-seller'
      : product?.isPromo || hasPromo
        ? 'Promo'
        : null;

  const images = useMemo(() => {
    const base = getProductImages(product, 6);
    if (selectedVariant?.image) {
      const vImg = resolveImageUrl(selectedVariant.image);
      if (vImg && !base.includes(vImg)) return [vImg, ...base].slice(0, 6);
    }
    return base;
  }, [product, selectedVariant]);

  const productDeliveryZones = useMemo(
    () => (Array.isArray(product?.deliveryZones) ? product.deliveryZones : []),
    [product?.deliveryZones]
  );

  const deliveryZones = useMemo(() => {
    const zoneList = [...productDeliveryZones, ...sellerZones];
    return zoneList.filter((zone, index, arr) => {
      const key = [zone?.country, zone?.area, zone?.locality, zone?.zoneName, zone?.city].join('|');
      return key && arr.findIndex((item) => [item?.country, item?.area, item?.locality, item?.zoneName, item?.city].join('|') === key) === index;
    });
  }, [productDeliveryZones, sellerZones]);

  const hasShippingInfo = Boolean(product?.shippingInfo?.trim());
  const hasWarranty = Boolean(product?.warranty?.trim());
  const hasDelivery = deliveryZones.length > 0 || hasShippingInfo;
  const freeShippingZone = useMemo(
    () => deliveryZones.find((z) => z?.freeShipping || Number(z?.price || 0) === 0),
    [deliveryZones]
  );

  useEffect(() => {
    if (!sellerId) {
      setSellerZones([]);
      return undefined;
    }
    let cancelled = false;
    getVendorDeliveryZonesByVendor(sellerId)
      .then((response) => {
        if (!cancelled) setSellerZones(Array.isArray(response?.data) ? response.data : []);
      })
      .catch(() => {
        if (!cancelled) setSellerZones([]);
      });
    return () => { cancelled = true; };
  }, [sellerId]);

  const specifications = useMemo(() => {
    const specs = Array.isArray(product?.specifications) ? product.specifications : [];
    const rows = specs.filter((s) => s?.key && s?.value).map((s) => ({ key: s.key, value: s.value }));
    if (product?.brand && !rows.some((r) => r.key.toLowerCase() === 'marque')) {
      rows.unshift({ key: 'Marque', value: product.brand });
    }
    if (product?.category && !rows.some((r) => r.key.toLowerCase() === 'catégorie')) {
      rows.push({ key: 'Catégorie', value: product.category });
    }
    if (product?.condition) rows.push({ key: 'État', value: product.condition });
    return rows;
  }, [product]);

  const normalizedProduct = useMemo(() => {
    if (!product) return null;
    return {
      ...product,
      id: productId,
      _id: productId,
      price,
      promoPrice: hasPromo ? promoPrice : null,
      salePrice: hasPromo ? promoPrice : null,
      image: images[0] || '',
      stock,
      selectedVariant: selectedVariant || undefined,
      selectedColor,
      selectedSize,
    };
  }, [product, productId, price, promoPrice, hasPromo, images, stock, selectedVariant, selectedColor, selectedSize]);

  const handleAddToCart = useCallback(() => {
    if (!normalizedProduct || !inStock) return;
    addToCart(normalizedProduct, qty);
    toast.success(`${product?.name || 'Produit'} ajouté au panier`);
  }, [normalizedProduct, inStock, addToCart, qty, product?.name]);

  const handleBuyNow = useCallback(() => {
    if (!normalizedProduct || !inStock) return;
    if (!isInCart) addToCart(normalizedProduct, qty);
    navigate('/cart');
  }, [normalizedProduct, inStock, isInCart, addToCart, qty, navigate]);

  const scrollToSection = useCallback((sectionId) => {
    setActiveTab(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
      const tabsH = tabsRef.current?.offsetHeight || 0;
      const top = el.getBoundingClientRect().top + window.scrollY - headerH - tabsH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const sellerName = product?.vendorName || product?.sellerName || '';
  const eyebrow = [product?.category, product?.brand].filter(Boolean).join(' · ');

  if (isLoading) {
    return (
      <div className="pdp">
        <Header />
        <div className="pdp__inner">
          <div className="pdp__hero">
            <div className="pdp__skeleton pdp__skeleton--gallery" />
            <div className="pdp__skeleton pdp__skeleton--panel" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="pdp">
        <Header />
        <div className="pdp__not-found">
          <Package size={48} strokeWidth={1.5} />
          <h2>Produit introuvable</h2>
          <p>Ce produit n&apos;est plus disponible.</p>
          <button type="button" onClick={() => navigate('/shopping')}>Retour à la boutique</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pdp">
      <Header />

      <div className="pdp__inner">
        <nav className="pdp__crumbs" aria-label="Fil d'Ariane">
          <Link to="/">Accueil</Link>
          <ChevronRight size={12} />
          {product.category && (
            <>
              <Link to={`/category/${encodeURIComponent(String(product.category).toLowerCase())}`}>
                {product.category}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span>{product.name}</span>
        </nav>

        <div className="pdp__hero">
          <ProductGallery images={images} name={product.name} />

          <aside className="pdp__panel">
            {badgeLabel && <span className="pdp__badge">{badgeLabel}</span>}
            {eyebrow && <p className="pdp__eyebrow">{eyebrow}</p>}

            <h1 className="pdp__title">{product.name}</h1>

            <div className="pdp__meta">
              <ProductRating rating={rating} reviewCount={reviewCount} size="md" />
              {soldCount > 0 && (
                <span className="pdp__sold">
                  <Star size={12} fill="#FF6B00" color="#FF6B00" />
                  {soldCount > 999 ? `${Math.floor(soldCount / 1000)}k+` : soldCount} vendus
                </span>
              )}
            </div>

            <div className="pdp__price-block">
              <div className="pdp__price">
                <span className="pdp__price-current">{formatCFA(displayPrice)}</span>
                {hasPromo && (
                  <>
                    <span className="pdp__price-old">{formatCFA(price)}</span>
                    {discount > 0 && <span className="pdp__price-off">-{discount}%</span>}
                  </>
                )}
              </div>
              {hasPromo && savings > 0 && (
                <p className="pdp__savings">Économisez {formatCFA(savings)}</p>
              )}
              <p className={`pdp__stock ${!inStock ? 'is-out' : isLowStock ? 'is-low' : 'is-in'}`}>
                {!inStock
                  ? 'Rupture de stock'
                  : isLowStock
                    ? `Plus que ${stock} en stock`
                    : 'En stock'}
              </p>
            </div>

            <div className="pdp__divider" />

            <ProductVariants
              product={product}
              selectedVariantIndex={selectedVariantIndex}
              onSelectVariant={setSelectedVariantIndex}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
            />

            {inStock && (
              <div className="pdp__qty-row">
                <span className="pdp__qty-label">Quantité</span>
                <QuantitySelector value={qty} onChange={setQty} max={stock} />
                <p className="pdp__qty-total">Sous-total : {formatCFA(displayPrice * qty)}</p>
              </div>
            )}

            <div className="pdp__actions">
              <button
                type="button"
                className="pdp__btn pdp__btn--primary"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart size={18} />
                {isInCart ? 'Déjà au panier' : 'Ajouter au panier'}
              </button>
              <button
                type="button"
                className="pdp__btn pdp__btn--secondary"
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                Acheter maintenant
              </button>
            </div>

            <ul className="pdp__perks">
              <li>
                <Truck size={16} />
                {freeShippingZone ? 'Livraison gratuite disponible' : hasDelivery ? 'Livraison disponible' : 'Livraison selon zone'}
              </li>
              <li><ShieldCheck size={16} /> Paiement sécurisé</li>
              <li><RotateCcw size={16} /> Retours selon conditions</li>
              <li><CreditCard size={16} /> Mobile Money accepté</li>
            </ul>

            {sellerName && (
              <div className="pdp__seller">
                <div className="pdp__seller-avatar">{(sellerName.charAt(0) || 'V').toUpperCase()}</div>
                <div>
                  <p className="pdp__seller-label">Vendu par</p>
                  <p className="pdp__seller-name">
                    {sellerName}
                    {(product?.sellerVerified || product?.isVendorCertified || product?.isCertified) && (
                      <span className="pdp__seller-badge"><BadgeCheck size={12} /> Certifié</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>

        <nav ref={tabsRef} className="pdp__tabs" aria-label="Sections produit">
          <div className="pdp__tabs-inner">
            {TABS.map(({ id: tabId, label }) => (
              <button
                key={tabId}
                type="button"
                className={`pdp__tab ${activeTab === tabId ? 'is-active' : ''}`}
                onClick={() => scrollToSection(tabId)}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        <section id="section-description" className="pdp__section">
          <h2 className="pdp__section-title">Description</h2>
          <ExpandableText text={product.description || product.shortDescription || ''} />
          {!product.description && !product.shortDescription && (
            <p className="pdp__empty">Aucune description disponible.</p>
          )}
        </section>

        <section id="section-specs" className="pdp__section">
          <h2 className="pdp__section-title">Détails du produit</h2>
          {specifications.length > 0 ? (
            <table className="pdp__specs">
              <tbody>
                {specifications.map((row) => (
                  <tr key={row.key}>
                    <th>{row.key}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="pdp__empty">Aucune caractéristique renseignée.</p>
          )}
        </section>

        <ProductReviewsSection
          productId={productId}
          reviews={reviewsData?.reviews || []}
          productRating={rating}
          totalReviews={reviewCount}
          loading={reviewsLoading}
        />

        <section id="section-delivery" className="pdp__section">
          <h2 className="pdp__section-title">Livraison</h2>
          {hasDelivery ? (
            <div className="pdp__delivery">
              {hasShippingInfo && <p>{product.shippingInfo}</p>}
              {deliveryZones.length > 0 && (
                <ul>
                  {deliveryZones.map((zone, i) => {
                    const locality = zone.locality || zone.area || zone.country || 'Zone';
                    const time = zone.deliveryTime;
                    const priceLabel =
                      zone.freeShipping || Number(zone.price) === 0
                        ? 'Gratuite'
                        : zone.price != null
                          ? formatCFA(zone.price)
                          : null;
                    return (
                      <li key={i}>
                        <strong>{locality}</strong>
                        {time && ` · ${time}`}
                        {priceLabel && ` · ${priceLabel}`}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <p className="pdp__empty">Informations de livraison non disponibles.</p>
          )}
          {hasWarranty && (
            <p className="pdp__empty" style={{ marginTop: 12 }}>
              <strong>Garantie :</strong> {product.warranty}
            </p>
          )}
        </section>

        {similarProducts.length > 0 && (
          <section className="pdp__similar">
            <div className="pdp__similar-head">
              <h2 className="pdp__similar-title">Vous aimerez aussi</h2>
              {product.category && (
                <Link
                  to={`/category/${encodeURIComponent(String(product.category).toLowerCase())}`}
                  className="pdp__similar-link"
                >
                  Voir tout
                </Link>
              )}
            </div>
            <div className="pdp__similar-grid">
              {similarProducts.slice(0, 8).map((item) => (
                <ProductCard key={item._id || item.id} product={item} onAddToCart={addToCart} />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="pdp__mobile-bar">
        <div className="pdp__mobile-price">
          <strong>{formatCFA(displayPrice)}</strong>
          {hasPromo && <span className="pdp__mobile-price-old">{formatCFA(price)}</span>}
        </div>
        <button type="button" className="pdp__mobile-btn pdp__mobile-btn--cart" onClick={handleAddToCart} disabled={!inStock}>
          Panier
        </button>
        <button type="button" className="pdp__mobile-btn pdp__mobile-btn--buy" onClick={handleBuyNow} disabled={!inStock}>
          Acheter
        </button>
      </div>

      <Footer />
    </div>
  );
}
