import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  ShoppingCart,
  Minus,
  Plus,
  Package,
  Star,
  BadgeCheck,
  Truck,
  RefreshCw,
  ShieldCheck,
  Share2,
  Heart,
  X,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { useProduct, useProductReviews, useSimilarProducts } from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import { getVendorDeliveryZonesByVendor } from '../api';
import { getProductImages, resolveImageUrl } from '../utils/imageUrl';
import { formatCFA, calcDiscountPercent } from '../utils/formatPrice';
import { isDropshippingProduct, getDisplayVendorName, getProductOriginLabel } from '../utils/publicProduct';
import { getCardDisplayPrice, getMoqRules, getUnitPrice, snapQuantity } from '../utils/importMoq';
import { useCart } from '../context/CartContext';
import { toast } from '../utils/toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductRating from '../components/product/ProductRating';
import ProductVariants from '../components/product/detail/ProductVariants';
import ProductReviewsSection from '../components/product/detail/ProductReviewsSection';
import './ProductDetail.css';

function QtyControl({ value, onChange, min = 1, step = 1, max }) {
  const cap = Math.max(min, max || min);
  return (
    <div className="pd-qty" role="group" aria-label="Quantité">
      <button
        type="button"
        className="pd-qty__btn"
        onClick={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        aria-label="Diminuer"
      >
        <Minus size={14} />
      </button>
      <span className="pd-qty__val">{value}</span>
      <button
        type="button"
        className="pd-qty__btn"
        onClick={() => onChange(Math.min(cap, value + step))}
        disabled={value >= cap}
        aria-label="Augmenter"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function ProductGallery({ images = [], name }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [broken, setBroken] = useState(() => new Set());
  const slides = useMemo(
    () => images.filter(Boolean).filter((src) => !broken.has(src)).slice(0, 8),
    [images, broken],
  );
  const current = slides[index] || null;

  useEffect(() => {
    setBroken(new Set());
    setIndex(0);
  }, [images.join('|')]);

  useEffect(() => {
    setIndex((i) => (slides.length ? Math.min(i, slides.length - 1) : 0));
  }, [slides.length]);

  const markBroken = useCallback((src) => {
    if (!src) return;
    setBroken((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);

  const go = useCallback((dir) => {
    setIndex((i) => {
      if (dir < 0) return i <= 0 ? slides.length - 1 : i - 1;
      return i >= slides.length - 1 ? 0 : i + 1;
    });
  }, [slides.length]);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, go]);

  return (
    <>
      <div className="pd-gallery">
        <div className="pd-gallery__stage">
          {current ? (
            <button type="button" className="pd-gallery__zoom-hit" onClick={() => setLightbox(true)} aria-label="Voir en grand">
              <img
                src={current}
                alt={name || 'Produit'}
                className="pd-gallery__img"
                decoding="async"
                onError={() => markBroken(current)}
              />
            </button>
          ) : (
            <div className="pd-gallery__empty"><Package size={40} strokeWidth={1.25} /></div>
          )}
          {slides.length > 1 && (
            <>
              <button type="button" className="pd-gallery__arrow pd-gallery__arrow--prev" onClick={() => go(-1)} aria-label="Image précédente">
                <ChevronLeft size={20} />
              </button>
              <button type="button" className="pd-gallery__arrow pd-gallery__arrow--next" onClick={() => go(1)} aria-label="Image suivante">
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        {slides.length > 1 && (
          <div className="pd-gallery__strip" role="tablist" aria-label="Miniatures">
            {slides.map((src, i) => (
              <button
                key={`${i}-${src}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={`pd-gallery__thumb ${i === index ? 'is-on' : ''}`}
                onClick={() => setIndex(i)}
              >
                <img src={src} alt="" loading="lazy" onError={() => markBroken(src)} />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && current && (
        <div className="pd-lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(false)}>
          <button type="button" className="pd-lightbox__close" onClick={() => setLightbox(false)} aria-label="Fermer">
            <X size={22} />
          </button>
          <div className="pd-lightbox__frame" onClick={(e) => e.stopPropagation()}>
            {slides.length > 1 && (
              <button type="button" className="pd-lightbox__nav" onClick={() => go(-1)} aria-label="Précédent">
                <ChevronLeft size={28} />
              </button>
            )}
            <img src={current} alt={name} className="pd-lightbox__img" onError={() => markBroken(current)} />
            {slides.length > 1 && (
              <button type="button" className="pd-lightbox__nav pd-lightbox__nav--next" onClick={() => go(1)} aria-label="Suivant">
                <ChevronRight size={28} />
              </button>
            )}
          </div>
          {slides.length > 1 && (
            <p className="pd-lightbox__count">{index + 1} / {slides.length}</p>
          )}
        </div>
      )}
    </>
  );
}

function ReadMore({ text }) {
  const [open, setOpen] = useState(false);
  if (!text?.trim()) return null;
  const long = text.length > 420 || text.split('\n').length > 6;
  return (
    <div className="pd-prose">
      <p className={!open && long ? 'pd-prose--fold' : undefined}>{text}</p>
      {long && (
        <button type="button" className="pd-link" onClick={() => setOpen((v) => !v)}>
          {open ? 'Réduire' : 'Lire la suite'}
        </button>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const descRef = useRef(null);
  const specsRef = useRef(null);
  const reviewsRef = useRef(null);
  const deliveryRef = useRef(null);

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(id, { page: 1, limit: 20 });
  const { data: similarProducts = [] } = useSimilarProducts(id);

  const [qty, setQty] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [wished, setWished] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [sellerZones, setSellerZones] = useState([]);

  useEffect(() => {
    if (product?.name) document.title = `${product.name} | Dango Import`;
    else if (!isLoading && !product) document.title = 'Produit introuvable | Dango Import';
  }, [product?.name, isLoading, product]);

  useEffect(() => {
    setSelectedVariantIndex(null);
    setSelectedColor(null);
    setSelectedSize(null);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    setQty(snapQuantity(product, product.minimumOrderQuantity || 1));
  }, [product?._id]);

  const variants = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product?.variants]);
  useEffect(() => {
    if (variants.length === 0) return;
    const idx = variants.findIndex((v) => v.isDefault);
    setSelectedVariantIndex(idx >= 0 ? idx : 0);
  }, [variants]);

  const selectedVariant = selectedVariantIndex != null ? variants[selectedVariantIndex] : null;
  const unitPrice = getUnitPrice(product);
  const basePrice = Number(product?.price || unitPrice || 0);
  const basePromo = Number(product?.salePrice || product?.promoPrice || 0);
  const variantPrice = selectedVariant?.price != null ? Number(selectedVariant.price) : null;
  const price = variantPrice ?? basePrice;
  const isDropship = isDropshippingProduct(product);
  const moqRules = getMoqRules(product);
  const promoPrice = !isDropship && variantPrice == null && basePromo > 0 && basePromo < basePrice ? basePromo : 0;
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const displayPrice = isDropship ? getCardDisplayPrice(product) : (hasPromo ? promoPrice : price);
  const discount = hasPromo ? calcDiscountPercent(price, promoPrice) : 0;

  const productStock = Number(product?.stock ?? 0);
  const variantStock = selectedVariant?.stock != null ? Number(selectedVariant.stock) : null;
  const stock = Math.max(
    productStock,
    Number.isFinite(variantStock) ? variantStock : 0,
  );
  const minStock = Number(product?.minStock ?? 10) || 10;
  const inStock = stock > 0;
  const isLowStock = inStock && stock <= minStock;

  const productId = product?._id || product?.id;
  const sellerId = product?.vendorId || product?.sellerId || product?.vendor_id || null;
  const isInCart = cart.some((item) => (item._id || item.id) === productId);

  const rating = product?.rating != null ? Number(product.rating) : null;
  const reviewCount = product?.totalReviews != null
    ? Number(product.totalReviews)
    : reviewsData?.pagination?.totalItems || 0;
  const soldCount = Number(product?.totalSales ?? 0) || 0;

  const images = useMemo(() => {
    const base = getProductImages(product, 8);
    if (selectedVariant?.image) {
      const vImg = resolveImageUrl(selectedVariant.image);
      if (vImg && !base.includes(vImg)) return [vImg, ...base].slice(0, 8);
    }
    return base;
  }, [product, selectedVariant]);

  const productDeliveryZones = useMemo(
    () => (Array.isArray(product?.deliveryZones) ? product.deliveryZones : []),
    [product?.deliveryZones],
  );
  const deliveryZones = useMemo(() => {
    const zoneList = [...productDeliveryZones, ...sellerZones];
    return zoneList.filter((zone, index, arr) => {
      const key = [zone?.country, zone?.area, zone?.locality, zone?.zoneName, zone?.city].join('|');
      return key && arr.findIndex((item) => [item?.country, item?.area, item?.locality, item?.zoneName, item?.city].join('|') === key) === index;
    });
  }, [productDeliveryZones, sellerZones]);

  const freeShippingZone = useMemo(
    () => deliveryZones.find((z) => z?.freeShipping || Number(z?.price || 0) === 0),
    [deliveryZones],
  );
  const importDays = product?.estimatedImportDays || {};
  const estimatedDeliveryDays = Number(importDays.max || product?.estimatedDeliveryDays || 0) || 0;
  const importDaysLabel = importDays.min && importDays.max
    ? `${importDays.min}–${importDays.max} jours`
    : (estimatedDeliveryDays > 0 ? `${estimatedDeliveryDays} j.` : '20–30 jours');
  const hasShippingInfo = Boolean(product?.shippingInfo?.trim());
  const hasWarranty = Boolean(product?.warranty?.trim());
  const hasDelivery = deliveryZones.length > 0 || hasShippingInfo || estimatedDeliveryDays > 0 || isDropship;

  useEffect(() => {
    if (!sellerId) {
      setSellerZones([]);
      return undefined;
    }
    let cancelled = false;
    getVendorDeliveryZonesByVendor(sellerId)
      .then((res) => { if (!cancelled) setSellerZones(Array.isArray(res?.data) ? res.data : []); })
      .catch(() => { if (!cancelled) setSellerZones([]); });
    return () => { cancelled = true; };
  }, [sellerId]);

  const specifications = useMemo(() => {
    const specs = Array.isArray(product?.specifications) ? product.specifications : [];
    const rows = specs.filter((s) => s?.key && s?.value).map((s) => ({ key: s.key, value: s.value }));
    if (product?.brand && !rows.some((r) => r.key.toLowerCase() === 'marque')) rows.unshift({ key: 'Marque', value: product.brand });
    if (product?.category && !rows.some((r) => r.key.toLowerCase() === 'catégorie')) rows.push({ key: 'Catégorie', value: product.category });
    if (product?.subCategory && !rows.some((r) => r.key.toLowerCase() === 'sous-catégorie')) {
      rows.push({ key: 'Sous-catégorie', value: product.subCategory });
    }
    if (estimatedDeliveryDays > 0 && !rows.some((r) => r.key.toLowerCase().includes('délai'))) {
      rows.push({ key: 'Délai d’importation', value: importDaysLabel });
    }
    if (isDropshippingProduct(product) && stock > 0 && !rows.some((r) => r.key.toLowerCase() === 'stock')) {
      rows.push({ key: 'Stock disponible', value: `${stock} unité(s)` });
    }
    if (product?.condition) rows.push({ key: 'État', value: product.condition });
    return rows;
  }, [product, estimatedDeliveryDays, importDaysLabel, stock]);

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
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  }, [normalizedProduct, inStock, addToCart, qty, product?.name]);

  const handleBuyNow = useCallback(() => {
    if (!normalizedProduct || !inStock) return;
    if (!isInCart) addToCart(normalizedProduct, qty);
    navigate('/cart');
  }, [normalizedProduct, inStock, isInCart, addToCart, qty, navigate]);

  const scrollToSection = useCallback((ref, tab) => {
    setActiveTab(tab);
    const el = ref.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const sellerName = getDisplayVendorName(product) || product?.vendorName || product?.sellerName || '';
  const originLabel = getProductOriginLabel(product);
  const categoryLabel = product?.category;
  const titleText = String(product?.name || '').trim();
  const titleIsLong = titleText.length > 72;
  const tagLabel = product?.isFeatured ? 'Sélection' : product?.isBestSeller ? 'Populaire' : hasPromo ? 'Promo' : null;

  const stockLabel = !inStock
    ? 'Rupture de stock'
    : isDropship
      ? `${stock} en stock`
      : isLowStock
        ? `Stock limité · ${stock} restants`
        : `${stock} en stock`;

  if (isLoading) {
    return (
      <div className="pd-page">
        <Header />
        <div className="pd-wrap">
          <div className="pd-skeleton">
            <div className="pd-skeleton__media" />
            <div className="pd-skeleton__info">
              <div className="pd-skeleton__line pd-skeleton__line--sm" />
              <div className="pd-skeleton__line pd-skeleton__line--lg" />
              <div className="pd-skeleton__line" />
              <div className="pd-skeleton__line pd-skeleton__line--btn" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="pd-page">
        <Header />
        <div className="pd-empty">
          <Package size={48} strokeWidth={1.25} />
          <h1>Produit introuvable</h1>
          <p>Ce produit n&apos;est plus disponible ou le lien n&apos;est pas valide.</p>
          <div className="pd-empty__actions">
            <Link to="/shopping" className="pd-btn pd-btn--primary">Retour à la boutique</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { key: 'description', label: 'Description', ref: descRef },
    { key: 'specs', label: 'Détails', ref: specsRef },
    { key: 'reviews', label: `Avis${reviewCount ? ` · ${reviewCount}` : ''}`, ref: reviewsRef },
    { key: 'delivery', label: 'Livraison', ref: deliveryRef },
  ];

  return (
    <div className="pd-page">
      <Header />

      <main className="pd-wrap">
        <nav className="pd-crumb" aria-label="Fil d'Ariane">
          <Link to="/">Accueil</Link>
          <ChevronRight size={14} aria-hidden />
          {categoryLabel && (
            <>
              <Link to={`/category/${encodeURIComponent(String(categoryLabel).toLowerCase())}`}>{categoryLabel}</Link>
              <ChevronRight size={14} aria-hidden />
            </>
          )}
          <span className="pd-crumb__current">{product.name}</span>
        </nav>

        <div className="pd-layout">
          <div className="pd-layout__media">
            <ProductGallery images={images} name={product.name} />
          </div>

          <div className="pd-layout__info">
          <aside className="pd-buy">
            <div className="pd-buy__head">
              {tagLabel && <span className="pd-tag">{tagLabel}</span>}
              {hasPromo && <span className="pd-tag pd-tag--sale">−{discount}%</span>}
              {product.brand && !/cj\s*drop/i.test(String(product.brand)) && (
                <span className="pd-meta">{product.brand}</span>
              )}
            </div>

            <h1 className={`pd-title${titleIsLong ? ' pd-title--long' : ''}`}>
              {originLabel ? <span className="pd-origin-tag">{originLabel}</span> : null}
              <span className="pd-title__text">{product.name}</span>
            </h1>

            <div className="pd-rating-row">
              <ProductRating rating={rating} reviewCount={reviewCount} size="md" />
              {soldCount > 0 && (
                <span className="pd-meta">
                  <Star size={12} fill="currentColor" /> {soldCount} vendus
                </span>
              )}
            </div>

            <div className="pd-price">
              <span className="pd-price__now">{formatCFA(displayPrice)}</span>
              {hasPromo && <span className="pd-price__was">{formatCFA(price)}</span>}
            </div>
            {isDropship && moqRules.soldAsLot && (
              <p className="pd-muted" style={{ marginTop: 6 }}>
                Lot de {moqRules.packSize} · soit {formatCFA(price)} / unité
              </p>
            )}
            {isDropship && !moqRules.soldAsLot && moqRules.moq > 1 && (
              <p className="pd-muted" style={{ marginTop: 6 }}>
                Minimum {moqRules.moq} unités
              </p>
            )}
            {isDropship && (
              <p className="pd-muted" style={{ marginTop: 6 }}>
                Frais d&apos;importation calculés au checkout
              </p>
            )}

            <p className={`pd-stock ${!inStock ? 'pd-stock--out' : isLowStock ? 'pd-stock--low' : ''}`}>
              {stockLabel}
            </p>

            {isDropship && (
              <ul className="pd-facts">
                <li>
                  <Truck size={15} />
                  Délai d&apos;importation estimé · <strong>{importDaysLabel}</strong>
                </li>
                <li><ShieldCheck size={15} /> Vente et SAV · <strong>Dango Import</strong></li>
              </ul>
            )}

            <div className="pd-divider" />

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
              <div className="pd-qty-row">
                <span className="pd-label">Quantité</span>
                <QtyControl
                  value={qty}
                  onChange={(next) => setQty(snapQuantity(product, next))}
                  min={moqRules.moq}
                  step={moqRules.increment}
                  max={stock}
                />
              </div>
            )}

            <div className="pd-actions">
              <button
                type="button"
                className={`pd-btn pd-btn--primary ${addedAnim ? 'is-done' : ''}`}
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                {addedAnim ? <><Check size={18} /> Ajouté</> : <><ShoppingCart size={18} /> {isInCart ? 'Encore au panier' : 'Ajouter au panier'}</>}
              </button>
              <button type="button" className="pd-btn pd-btn--ghost" onClick={handleBuyNow} disabled={!inStock}>
                Acheter
              </button>
              <button
                type="button"
                className={`pd-icon-btn ${wished ? 'is-on' : ''}`}
                onClick={() => setWished((w) => !w)}
                aria-label="Favoris"
              >
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>

            <ul className="pd-assurance">
              <li><Truck size={14} /> {freeShippingZone ? 'Livraison gratuite sur certaines zones' : 'Livraison partout au pays'}</li>
              <li><ShieldCheck size={14} /> Paiement sécurisé</li>
              <li><RefreshCw size={14} /> Retours sous conditions</li>
            </ul>

            {sellerName && (
              <div className="pd-seller">
                <span className="pd-label">Vendeur</span>
                <span className="pd-seller__name">
                  {sellerName}
                  {(product?.isVendorCertified || product?.sellerVerified) && (
                    <BadgeCheck size={14} className="pd-seller__badge" aria-label="Certifié" />
                  )}
                </span>
              </div>
            )}

            <button
              type="button"
              className="pd-share"
              onClick={() => (
                navigator.share
                  ? navigator.share({ title: product.name, url: window.location.href })
                  : navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Lien copié'))
              )}
            >
              <Share2 size={14} /> Partager
            </button>
          </aside>
          </div>
        </div>

        <nav className="pd-tabs" aria-label="Sections">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`pd-tabs__item ${activeTab === tab.key ? 'is-active' : ''}`}
              onClick={() => scrollToSection(tab.ref, tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section ref={descRef} className="pd-section" id="description">
          <h2>Description</h2>
          <ReadMore text={product.description || product.shortDescription || ''} />
          {!product.description && !product.shortDescription && (
            <p className="pd-muted">Aucune description pour ce produit.</p>
          )}
        </section>

        <section ref={specsRef} className="pd-section" id="specs">
          <h2>Caractéristiques</h2>
          {specifications.length > 0 ? (
            <dl className="pd-specs">
              {specifications.map((row) => (
                <div key={row.key} className="pd-specs__row">
                  <dt>{row.key}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="pd-muted">Aucune caractéristique renseignée.</p>
          )}
        </section>

        <section ref={reviewsRef} className="pd-section pd-section--flush" id="reviews">
          <ProductReviewsSection
            productId={productId}
            reviews={reviewsData?.reviews || []}
            productRating={rating}
            totalReviews={reviewCount}
            loading={reviewsLoading}
          />
        </section>

        <section ref={deliveryRef} className="pd-section" id="delivery">
          <h2>Livraison & retours</h2>
          {hasDelivery ? (
            <div className="pd-delivery">
              {hasShippingInfo && <p>{product.shippingInfo}</p>}
              {estimatedDeliveryDays > 0 && !hasShippingInfo && (
                <p>Délai estimé : <strong>{estimatedDeliveryDays} jour(s) ouvrés</strong>.</p>
              )}
              {isDropship && (
                <p>
                  Frais d&apos;importation calculés au checkout. Délai estimé : <strong>{importDaysLabel}</strong>.
                </p>
              )}
              {deliveryZones.length > 0 && (
                <ul className="pd-zones">
                  {deliveryZones.map((zone, i) => {
                    const name = zone.locality || zone.area || zone.country || 'Zone';
                    const isFree = zone.freeShipping || Number(zone.price) === 0;
                    return (
                      <li key={i}>
                        <span>{name}</span>
                        <span>{isFree ? 'Gratuite' : zone.price != null ? formatCFA(zone.price) : zone.deliveryTime || '—'}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <p className="pd-muted">Informations de livraison bientôt disponibles.</p>
          )}
          {hasWarranty && <p className="pd-warranty"><ShieldCheck size={15} /> Garantie : {product.warranty}</p>}
        </section>

        {similarProducts.length > 0 && (
          <section className="pd-related">
            <div className="pd-related__head">
              <h2>Produits similaires</h2>
              {categoryLabel && (
                <Link to={`/category/${encodeURIComponent(String(categoryLabel).toLowerCase())}`}>Voir la catégorie</Link>
              )}
            </div>
            <div className="pd-related__grid">
              {similarProducts.slice(0, 8).map((item) => (
                <ProductCard key={item._id || item.id} product={item} onAddToCart={addToCart} />
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="pd-bar">
        <div className="pd-bar__price">
          <strong>{formatCFA(displayPrice)}</strong>
          {hasPromo && <s>{formatCFA(price)}</s>}
        </div>
        <button type="button" className="pd-bar__btn" onClick={handleAddToCart} disabled={!inStock}>
          Panier
        </button>
        <button type="button" className="pd-bar__btn pd-bar__btn--accent" onClick={handleBuyNow} disabled={!inStock}>
          Acheter
        </button>
      </div>

      <Footer />
    </div>
  );
}
