import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  ShoppingCart,
  Truck,
  Package,
  Minus,
  Plus,
  BadgeCheck,
  RotateCcw,
  Star,
} from 'lucide-react';
import { useProduct, useProductReviews } from '../hooks/useProducts';
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

const SECTIONS = [
  { id: 'section-description', label: 'Description' },
  { id: 'section-specs', label: 'Caractéristiques' },
  { id: 'section-reviews', label: 'Avis' },
  { id: 'section-delivery', label: 'Livraison' },
];

/**
 * Mesure en continu la hauteur réelle du <header> fixe (elle change entre
 * mobile/desktop et quand la barre de recherche mobile s'ouvre) et l'expose
 * via la variable CSS --header-h, utilisée pour décaler tout le contenu.
 */
function useHeaderOffset() {
  useEffect(() => {
    const headerEl = document.querySelector('header');
    if (!headerEl) return undefined;

    const setVar = () => {
      document.documentElement.style.setProperty(
        '--header-h',
        `${headerEl.offsetHeight}px`
      );
    };

    setVar();

    const ro = new ResizeObserver(setVar);
    ro.observe(headerEl);
    window.addEventListener('resize', setVar);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, []);
}

function QuantitySelector({ value, onChange, max }) {
  const safeMax = Math.max(1, max || 1);
  return (
    <div className="product-qty">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Diminuer"
      >
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(safeMax, value + 1))}
        disabled={value >= safeMax}
        aria-label="Augmenter"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="product-detail-page">
      <div className="product-detail-skeleton product-detail-skeleton--gallery" />
      <div className="product-detail-skeleton product-detail-skeleton--info" />
    </div>
  );
}

function ExpandableText({ text, maxLines = 6 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > 280 || text.split('\n').length > maxLines;

  return (
    <div className="product-description">
      <p className={expanded ? '' : 'product-description--clamped'}>{text}</p>
      {isLong && (
        <button
          type="button"
          className="product-description__toggle"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Afficher moins' : 'Afficher plus'}
        </button>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const stickyNavRef = useRef(null);

  useHeaderOffset();

  const { data: product, isLoading, isError } = useProduct(id);
  const { data: reviewsData, isLoading: reviewsLoading } = useProductReviews(id, {
    page: 1,
    limit: 20,
  });

  const [qty, setQty] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeSection, setActiveSection] = useState('section-description');

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

  const selectedVariant =
    selectedVariantIndex != null ? variants[selectedVariantIndex] : null;

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
    selectedVariant?.stock != null
      ? Number(selectedVariant.stock)
      : Number(product?.stock ?? 0);
  const minStock = Number(product?.minStock ?? 10) || 10;
  const inStock = stock > 0;
  const isLowStock = inStock && stock <= minStock;

  const productId = product?._id || product?.id;
  const isInCart = cart.some((item) => (item._id || item.id) === productId);

  const rating = product?.rating != null ? Number(product.rating) : null;
  const reviewCount =
    product?.totalReviews != null ? Number(product.totalReviews) : reviewsData?.pagination?.totalItems || 0;

  const soldCount = Number(product?.totalSales ?? 0) || 0;

  const badgeLabel = product?.isFeatured
    ? 'Choix'
    : product?.isBestSeller
      ? 'Best-seller'
      : product?.isPromo || hasPromo
        ? 'Promo'
        : null;

  const images = useMemo(() => {
    const base = getProductImages(product, 5);
    if (selectedVariant?.image) {
      const vImg = resolveImageUrl(selectedVariant.image);
      if (vImg && !base.includes(vImg)) return [vImg, ...base].slice(0, 5);
    }
    return base;
  }, [product, selectedVariant]);

  const deliveryZones = Array.isArray(product?.deliveryZones) ? product.deliveryZones : [];
  const hasShippingInfo = Boolean(product?.shippingInfo?.trim());
  const hasWarranty = Boolean(product?.warranty?.trim());
  const hasDelivery = deliveryZones.length > 0 || hasShippingInfo;

  const freeShippingZone = useMemo(
    () => deliveryZones.find((z) => z?.freeShipping),
    [deliveryZones]
  );

  const specifications = useMemo(() => {
    const specs = Array.isArray(product?.specifications) ? product.specifications : [];
    const rows = specs
      .filter((s) => s?.key && s?.value)
      .map((s) => ({ key: s.key, value: s.value }));
    if (product?.brand && !rows.some((r) => r.key.toLowerCase() === 'marque')) {
      rows.unshift({ key: 'Marque', value: product.brand });
    }
    if (product?.category && !rows.some((r) => r.key.toLowerCase() === 'catégorie')) {
      rows.push({ key: 'Catégorie', value: product.category });
    }
    if (product?.condition) {
      rows.push({ key: 'État', value: product.condition });
    }
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
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      const headerH = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h')
      ) || 0;
      const navH = stickyNavRef.current?.offsetHeight || 0;
      const top = el.getBoundingClientRect().top + window.scrollY - headerH - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const sellerName = product?.vendorName || product?.sellerName || '';
  const sellerSlug =
    product?.vendorSlug ||
    product?.storeSlug ||
    product?.sellerSlug ||
    (sellerName ? encodeURIComponent(sellerName) : null);

  if (isLoading) {
    return (
      <div className="product-detail-layout">
        <Header />
        <div className="product-detail-container">
          <DetailSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="product-detail-layout">
        <Header />
        <div className="product-detail-not-found">
          <Package size={52} />
          <h2>Produit introuvable</h2>
          <p>Le produit recherché est indisponible ou a expiré.</p>
          <button type="button" onClick={() => navigate('/')}>
            Retour à l&apos;accueil
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="product-detail-layout">
      <Header />

      <div className="product-detail-container">
        <nav className="product-detail-breadcrumb">
          <Link to="/">Accueil</Link>
          <ChevronRight size={12} />
          {product.category && (
            <>
              <Link to={`/?category=${encodeURIComponent(product.category)}`}>
                {product.category}
              </Link>
              <ChevronRight size={12} />
            </>
          )}
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-page">
          <div className="product-detail-gallery-wrap">
            <ProductGallery images={images} name={product.name} />
          </div>

          <div className="product-detail-buybox">
            {badgeLabel && (
              <span className="product-detail-choice-badge">{badgeLabel}</span>
            )}

            <h1 className="product-detail-title">{product.name}</h1>

            {product.brand && (
              <p className="product-detail-brand">Marque : {product.brand}</p>
            )}

            <div className="product-detail-meta-row">
              <ProductRating rating={rating} reviewCount={reviewCount} size="lg" />
              {soldCount > 0 && (
                <span className="product-detail-sold">
                  <Star size={12} fill="#ff6b00" color="#ff6b00" />
                  {soldCount > 999 ? `${Math.floor(soldCount / 1000)}k+` : soldCount} vendus
                </span>
              )}
            </div>

            <div className="product-detail-price">
              <span className="product-detail-price__current">{formatCFA(displayPrice)}</span>
              {hasPromo && (
                <>
                  <span className="product-detail-price__old">{formatCFA(price)}</span>
                  {discount > 0 && (
                    <span className="product-detail-price__discount">-{discount}%</span>
                  )}
                </>
              )}
            </div>
            {hasPromo && savings > 0 && (
              <p className="product-detail-savings">
                Vous économisez {formatCFA(savings)}
              </p>
            )}

            <div className="product-detail-stock">
              {!inStock ? (
                <span className="is-out">Rupture de stock</span>
              ) : isLowStock ? (
                <span className="is-low">Plus que {stock} disponibles</span>
              ) : (
                <span className="is-in">En stock</span>
              )}
            </div>

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
              <div className="product-detail-qty-row">
                <span className="product-detail-qty-label">Quantité</span>
                <QuantitySelector value={qty} onChange={setQty} max={stock} />
              </div>
            )}

            <div className="product-detail-cta">
              <button
                type="button"
                className="product-detail-cta__cart"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart size={18} />
                {isInCart ? 'Déjà au panier' : 'Ajouter au panier'}
              </button>
              <button
                type="button"
                className="product-detail-cta__buy"
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                Acheter maintenant
              </button>
            </div>

            {hasDelivery && (
              <div
                className={`product-detail-delivery-preview ${
                  freeShippingZone ? 'is-free' : ''
                }`}
              >
                <Truck size={16} />
                <span>
                  {freeShippingZone ? 'Livraison gratuite disponible' : 'Livraison disponible'}
                </span>
              </div>
            )}

            {sellerName && (
              <div className="product-detail-seller">
                <p className="product-detail-seller__label">Vendu par</p>
                <div className="product-detail-seller__row">
                  <div className="product-detail-seller__avatar">
                    {(sellerName.charAt(0) || 'V').toUpperCase()}
                  </div>
                  <div>
                    <p className="product-detail-seller__name">
                      {sellerName}
                      {product?.sellerVerified && (
                        <BadgeCheck size={16} className="product-detail-seller__verified" />
                      )}
                    </p>
                    {rating != null && reviewCount > 0 && (
                      <ProductRating rating={rating} reviewCount={reviewCount} />
                    )}
                  </div>
                </div>
                {sellerSlug && (
                  <Link to={`/shop/${sellerSlug}`} className="product-detail-seller__link">
                    Visiter la boutique
                  </Link>
                )}
              </div>
            )}

            {(hasDelivery || hasWarranty) && (
              <div className="product-detail-trust">
                {hasDelivery && (
                  <span><Truck size={14} /> Livraison</span>
                )}
                {hasWarranty && (
                  <span><RotateCcw size={14} /> Garantie</span>
                )}
              </div>
            )}
          </div>
        </div>

        <nav ref={stickyNavRef} className="product-detail-sticky-nav">
          <div className="product-detail-sticky-nav__inner">
            {SECTIONS.map(({ id: sectionId, label }) => (
              <button
                key={sectionId}
                type="button"
                className={activeSection === sectionId ? 'is-active' : ''}
                onClick={() => scrollToSection(sectionId)}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>

        <section id="section-description" className="product-detail-section">
          <h2 className="product-detail-section__title">Description du produit</h2>
          <ExpandableText
            text={product.description || product.shortDescription || ''}
          />
          {!product.description && !product.shortDescription && (
            <p className="product-detail-section__empty">Aucune description disponible.</p>
          )}
        </section>

        <section id="section-specs" className="product-detail-section">
          <h2 className="product-detail-section__title">Caractéristiques</h2>
          {specifications.length > 0 ? (
            <table className="product-detail-specs">
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
            <p className="product-detail-section__empty">Aucune caractéristique disponible.</p>
          )}
        </section>

        <ProductReviewsSection
          reviews={reviewsData?.reviews || []}
          productRating={rating}
          totalReviews={reviewCount}
          loading={reviewsLoading}
        />

        <section id="section-delivery" className="product-detail-section">
          <h2 className="product-detail-section__title">Informations livraison</h2>
          {hasDelivery ? (
            <div className="product-detail-delivery">
              {hasShippingInfo && <p>{product.shippingInfo}</p>}
              {deliveryZones.length > 0 && (
                <ul>
                  {deliveryZones.map((zone, i) => {
                    const locality =
                      zone.locality || zone.area || zone.country || 'Zone';
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
                        {time && ` — Délai : ${time}`}
                        {priceLabel && ` — ${priceLabel}`}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <p className="product-detail-section__empty">
              Informations de livraison non disponibles pour ce produit.
            </p>
          )}
          {hasWarranty && (
            <p className="product-detail-warranty">
              <strong>Garantie :</strong> {product.warranty}
            </p>
          )}
        </section>
      </div>

      <div className="product-detail-mobile-bar">
        <button
          type="button"
          className="product-detail-mobile-bar__cart"
          onClick={handleAddToCart}
          disabled={!inStock}
        >
          {isInCart ? 'Au panier' : 'Ajouter au panier'}
        </button>
        <button
          type="button"
          className="product-detail-mobile-bar__buy"
          onClick={handleBuyNow}
          disabled={!inStock}
        >
          Acheter maintenant
        </button>
      </div>

      <Footer />
    </div>
  );
}