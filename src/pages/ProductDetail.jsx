import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, ShoppingCart, Minus, Plus, Package, Star, BadgeCheck,
  Truck, RefreshCw, ShieldCheck, Share2, Heart, X, Check, Factory, Anchor, Ship, MapPin,
} from 'lucide-react';
import { useProduct, useProductReviews, useSimilarProducts } from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import { getVendorDeliveryZonesByVendor } from '../api';
import { resolveImageUrl } from '../utils/imageUrl';
import { formatCFA, calcDiscountPercent } from '../utils/formatPrice';
import { getDisplayVendorName, extractAlibabaDisplayInfo, sanitizeProductForDisplay } from '../utils/publicProduct';
import { getCardDisplayPrice, snapQuantity } from '../utils/importMoq';
import { useCart } from '../context/CartContext';
import { toast } from '../utils/toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductRating from '../components/product/ProductRating';
import ProductVariants from '../components/product/detail/ProductVariants';
import ProductReviewsSection from '../components/product/detail/ProductReviewsSection';
import { resolveVariantSelection, getVariantAttributeValue } from '../utils/variantSelection';
import { buildProductDetailData } from '../utils/buildProductDetailData';
import './ProductDetail.css';

/* ════════════════════════════════════════════════════════════════════
   Extraction des données fournisseur (keyAttributes Alibaba)
   Règle : aucune donnée inventée. Si l'info n'existe pas, on ne l'affiche pas.
   L'identité du fournisseur (nom d'usine, marque usine) reste masquée.
   ════════════════════════════════════════════════════════════════════ */
const GROUP_FR = {
  'Industry-specific attributes': 'Produit',
  'Other attributes': 'Fabrication et format',
  'Packaging and delivery': 'Colis et expédition',
};
const ATTR_FR = {
  'Herb & Spice Tools Type': 'Type de produit',
  Material: 'Matériau',
  Feature: 'Particularités',
  'Place of Origin': 'Lieu de fabrication',
  'Model Number': 'Référence modèle',
  Size: 'Dimensions du produit',
  Capacity: 'Capacité',
  Packing: 'Emballage individuel',
  Style: 'Style',
  Port: "Port d'embarquement",
  'Selling Units:': 'Unité de vente',
  'Single package size:': 'Dimensions du colis unitaire',
  'Single gross weight:': 'Poids brut unitaire',
};
const ATTR_HIDE = new Set(['Brand Name', 'OEM', 'Logo', 'Product name', 'Measurement']);
const VALUE_FR = {
  'Salad Dresing Shaker': 'Shaker à vinaigrette',
  'Eco-Friendly': 'Écologique',
  Handle: 'Avec poignée',
  'White Box': 'Boîte blanche',
  'Single item': 'Article unique',
  'Zhejiang, China': 'Zhejiang, Chine',
};
const frValue = (v) => {
  const s = String(v).trim();
  if (VALUE_FR[s]) return VALUE_FR[s];
  return s.replace(/Borosilicate Gal?ss/i, 'verre borosilicaté').replace(/(\d)\s*(cm|mm)\b/gi, '$1 $2').replace(/\s*x\s*/gi, ' × ');
};
const fmtNum = (n, d = 1) => Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d });
const fmtWeight = (raw) => {
  const m = /([\d.,]+)\s*(kg|g)\b/i.exec(raw || '');
  if (!m) return raw || '';
  const n = parseFloat(m[1].replace(',', '.'));
  const kg = m[2].toLowerCase() === 'kg' ? n : n / 1000;
  return kg < 1 ? `${Math.round(kg * 1000)} g` : `${fmtNum(kg, 2)} kg`;
};
const titleCase = (s) => String(s || '').toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

function extractSupplierData(product) {
  const src = product?.rawAlibabaData?.keyAttributes
    ?? product?.rawAlibabaData?.result_data?.keyAttributes
    ?? product?.keyAttributes
    ?? product?.rawSections?.keyAttributes;
  const raw = Array.isArray(src?.attributes) ? src.attributes : [];
  const flat = {};
  raw.forEach((g) => (g.attributes || []).forEach((a) => {
    const vals = (a.values || []).map((v) => v?.value).filter(Boolean);
    if (a?.name && vals.length && !flat[a.name]) flat[a.name] = vals;
  }));

  const seen = new Set();
  const groups = raw.map((g) => ({
    title: GROUP_FR[g.type] || g.type,
    rows: (g.attributes || [])
      .filter((a) => a?.name && !ATTR_HIDE.has(a.name))
      .map((a) => ({
        key: ATTR_FR[a.name] || String(a.name).replace(/:$/, ''),
        value: (a.values || []).map((v) => v?.value).filter((v) => v && v !== 'Stocked').map(frValue).join(', '),
      }))
      .filter((r) => {
        if (!r.value || seen.has(r.key)) return false;
        seen.add(r.key);
        return true;
      }),
  })).filter((g) => g.rows.length);

  const one = (name) => (flat[name] ? frValue(flat[name][0]) : '');
  const cartonRaw = flat.Measurement?.[0] || '';
  const cm = /([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*cm\s*\/\s*(\d+)\s*pcs/i.exec(cartonRaw);
  const unitWeightKg = (() => {
    const m = /([\d.,]+)\s*(kg|g)\b/i.exec(flat['Single gross weight:']?.[0] || '');
    if (!m) return null;
    const n = parseFloat(m[1].replace(',', '.'));
    return m[2].toLowerCase() === 'kg' ? n : n / 1000;
  })();
  const carton = cm ? {
    dims: `${cm[1]} × ${cm[2]} × ${cm[3]} cm`,
    pcs: Number(cm[4]),
    volumeM3: (cm[1] * cm[2] * cm[3]) / 1e6,
    grossKg: unitWeightKg ? unitWeightKg * Number(cm[4]) : null,
  } : null;

  const portRaw = flat.Port?.[0] || '';
  return {
    groups,
    carton,
    capacity: one('Capacity'),
    material: one('Material'),
    size: one('Size'),
    model: one('Model Number'),
    packing: one('Packing'),
    origin: one('Place of Origin'),
    port: portRaw ? titleCase(portRaw.replace(/^FOB\s*/i, '')) : '',
    unitWeight: flat['Single gross weight:'] ? fmtWeight(flat['Single gross weight:'][0]) : '',
    unitPackage: flat['Single package size:'] ? frValue(flat['Single package size:'][0]) : '',
  };
}

const num = (v) => (v == null || v === '' ? null : (Number.isFinite(Number(v)) ? Number(v) : null));
const tierMin = (t) => num(t?.minQty ?? t?.minQuantity ?? t?.min) ?? num((String(t?.label || '').match(/\d+/) || [])[0]);

/* ── En-tête de section (style landing) ─────────────────────────────── */
function SectionHead({ eyebrow, title, lead }) {
  return (
    <header className="pd-head">
      {eyebrow && <p className="pd-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {lead && <p className="pd-head__lead">{lead}</p>}
    </header>
  );
}

/* ── Paliers de prix cliquables (liste ou cartes) ───────────────────── */
function VolumePricingTable({ tiers = [], qty, onPick, variant = 'list' }) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const mins = tiers.map(tierMin);
  let activeIdx = -1;
  mins.forEach((m, i) => { if (m != null && qty >= m) activeIdx = i; });
  const isCards = variant === 'cards';

  return (
    <div className={`pd-tiers${isCards ? ' pd-tiers--cards' : ''}`}>
      <p className="pd-tiers__title">Prix par quantité</p>
      <ul className="pd-tiers__list">
        {tiers.map((t, i) => (
          <li key={i}>
            <button
              type="button"
              className={`pd-tier ${i === activeIdx ? 'is-on' : ''}`}
              disabled={mins[i] == null}
              onClick={() => mins[i] != null && onPick?.(mins[i])}
            >
              <span className="pd-tier__qty">{t.label}</span>
              <span className="pd-tier__price">{t.unitPriceFormatted}</span>
              {t.savingsPercent > 0
                ? <span className="pd-tier__save">−{t.savingsPercent}%</span>
                : (isCards ? null : <span />)}
            </button>
          </li>
        ))}
      </ul>
      <p className="pd-tiers__note">Prix publics en FCFA. Frais d&apos;importation calculés à la commande.</p>
    </div>
  );
}

/* ── Parcours d'importation ─────────────────────────────────────────── */
function ImportRoute({ origin, port, days }) {
  const steps = [
    { icon: Factory, title: 'Usine', text: origin || 'Chine' },
    port && { icon: Anchor, title: 'Embarquement', text: port },
    { icon: Ship, title: 'Transit', text: days || 'Selon destination' },
    { icon: MapPin, title: 'Livraison', text: 'Lomé et Cotonou' },
  ].filter(Boolean);
  return (
    <ol className="pd-route" aria-label="Parcours de la commande">
      {steps.map((s) => (
        <li key={s.title} className="pd-route__step">
          <span className="pd-route__node"><s.icon size={15} /></span>
          <span className="pd-route__title">{s.title}</span>
          <span className="pd-route__text">{s.text}</span>
        </li>
      ))}
    </ol>
  );
}

function AlibabaSkuAttributes({ skus = [] }) {
  const groups = useMemo(() => {
    if (!Array.isArray(skus) || !skus.length) return [];
    const map = {};
    skus.forEach((sku) => (sku.attrs || []).forEach((attr) => {
      if (!map[attr.name]) map[attr.name] = [];
      if (!map[attr.name].find((v) => v.value === attr.value)) map[attr.name].push({ value: attr.value, image: attr.image });
    }));
    return Object.entries(map);
  }, [skus]);
  if (!groups.length) return null;
  return (
    <div className="pd-sku-attrs">
      {groups.map(([name, values]) => (
        <div key={name} className="pd-sku-attr-group">
          <span className="pd-label">{name}</span>
          <div className="pd-sku-attr-values">
            {values.map((v, i) => (
              <span key={i} className="pd-sku-attr-chip">
                {v.image && <img src={v.image} alt={v.value} className="pd-sku-attr-chip__img" loading="lazy" />}
                {v.value}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function QtyControl({ value, onChange, min = 1, step = 1, max }) {
  const hasCap = max != null && Number.isFinite(max);
  const cap = hasCap ? Math.max(min, max) : Infinity;
  return (
    <div className="pd-qty" role="group" aria-label="Quantité">
      <button type="button" className="pd-qty__btn" onClick={() => onChange(Math.max(min, value - step))} disabled={value <= min} aria-label="Diminuer">
        <Minus size={14} />
      </button>
      <span className="pd-qty__val">{value}</span>
      <button type="button" className="pd-qty__btn" onClick={() => onChange(hasCap ? Math.min(cap, value + step) : value + step)} disabled={hasCap && value >= cap} aria-label="Augmenter">
        <Plus size={14} />
      </button>
    </div>
  );
}

function ProductGallery({ images = [], name, videoUrl }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [activeMedia, setActiveMedia] = useState('image');
  const [broken, setBroken] = useState(() => new Set());

  const slides = useMemo(() => images.filter(Boolean).filter((src) => !broken.has(src)), [images, broken]);
  const current = slides[index] || null;

  useEffect(() => { setBroken(new Set()); setIndex(0); setActiveMedia('image'); }, [images.join('|')]);
  useEffect(() => { setIndex((i) => (slides.length ? Math.min(i, slides.length - 1) : 0)); }, [slides.length]);

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
    setActiveMedia('image');
    setIndex((i) => (dir < 0 ? (i <= 0 ? slides.length - 1 : i - 1) : (i >= slides.length - 1 ? 0 : i + 1)));
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
          {activeMedia === 'video' && videoUrl ? (
            <div className="pd-gallery__video-stage"><video src={videoUrl} controls autoPlay className="pd-gallery__video-player" /></div>
          ) : current ? (
            <button type="button" className="pd-gallery__zoom-hit" onClick={() => setLightbox(true)} aria-label="Voir en grand">
              <img src={current} alt={name || 'Produit'} className="pd-gallery__img" decoding="async" onError={() => markBroken(current)} />
            </button>
          ) : (
            <div className="pd-gallery__empty"><Package size={40} strokeWidth={1.25} /></div>
          )}

          {activeMedia === 'image' && slides.length > 1 && (
            <>
              <span className="pd-gallery__count">{index + 1} / {slides.length}</span>
              <button type="button" className="pd-gallery__arrow pd-gallery__arrow--prev" onClick={() => go(-1)} aria-label="Image précédente"><ChevronLeft size={20} /></button>
              <button type="button" className="pd-gallery__arrow pd-gallery__arrow--next" onClick={() => go(1)} aria-label="Image suivante"><ChevronRight size={20} /></button>
            </>
          )}
        </div>

        {(slides.length > 1 || videoUrl) && (
          <div className="pd-gallery__strip" role="tablist" aria-label="Miniatures">
            {videoUrl && (
              <button
                type="button" role="tab" aria-selected={activeMedia === 'video'}
                className={`pd-gallery__thumb pd-gallery__thumb--video ${activeMedia === 'video' ? 'is-on' : ''}`}
                onClick={() => setActiveMedia('video')} title="Vidéo"
              >
                <span className="pd-gallery__video-icon">▶</span>
              </button>
            )}
            {slides.map((src, i) => (
              <button
                key={`${i}-${src}`} type="button" role="tab"
                aria-selected={activeMedia === 'image' && i === index}
                className={`pd-gallery__thumb ${activeMedia === 'image' && i === index ? 'is-on' : ''}`}
                onClick={() => { setActiveMedia('image'); setIndex(i); }}
              >
                <img src={src} alt="" loading="lazy" onError={() => markBroken(src)} />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && current && (
        <div className="pd-lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(false)}>
          <button type="button" className="pd-lightbox__close" onClick={() => setLightbox(false)} aria-label="Fermer"><X size={22} /></button>
          <div className="pd-lightbox__frame" onClick={(e) => e.stopPropagation()}>
            {slides.length > 1 && <button type="button" className="pd-lightbox__nav" onClick={() => go(-1)} aria-label="Précédent"><ChevronLeft size={28} /></button>}
            <img src={current} alt={name} className="pd-lightbox__img" onError={() => markBroken(current)} />
            {slides.length > 1 && <button type="button" className="pd-lightbox__nav" onClick={() => go(1)} aria-label="Suivant"><ChevronRight size={28} /></button>}
          </div>
          {slides.length > 1 && <p className="pd-lightbox__count">{index + 1} / {slides.length}</p>}
        </div>
      )}
    </>
  );
}

function ReadMore({ text, safeHtml, fallbackTitle = '' }) {
  const [open, setOpen] = useState(false);
  const displayText = text || (fallbackTitle ? `${fallbackTitle}.` : '');
  if (!displayText && !safeHtml) return null;
  const long = displayText.length > 400 || displayText.split('\n').length > 5 || (safeHtml && safeHtml.length > 500);
  return (
    <div className="pd-prose">
      {safeHtml ? (
        <div className={`pd-prose__html ${!open && long ? 'pd-prose--fold' : ''}`} dangerouslySetInnerHTML={{ __html: safeHtml }} />
      ) : (
        <p className={!open && long ? 'pd-prose--fold' : undefined} style={{ whiteSpace: 'pre-line' }}>{displayText}</p>
      )}
      {long && (
        <button type="button" className="pd-link" onClick={() => setOpen((v) => !v)}>
          {open ? 'Réduire la description' : 'Lire la suite de la description'}
        </button>
      )}
    </div>
  );
}

function Rows({ rows }) {
  return (
    <dl className="pd-rows">
      {rows.map((r) => (
        <div key={r.key} className="pd-rows__row">
          <dt>{r.key}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const descRef = useRef(null);
  const specsRef = useRef(null);
  const wholesaleRef = useRef(null);
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

  const displayProduct = useMemo(() => sanitizeProductForDisplay(product), [product]);
  const detailData = useMemo(() => buildProductDetailData(displayProduct || product), [displayProduct, product]);
  const extras = useMemo(() => extractSupplierData(product), [product]);

  useEffect(() => {
    if (detailData?.name) document.title = `${detailData.name} | Dango Import`;
    else if (!isLoading && !product) document.title = 'Produit introuvable | Dango Import';
  }, [detailData?.name, isLoading, product]);

  useEffect(() => { setSelectedVariantIndex(null); setSelectedColor(null); setSelectedSize(null); }, [id]);

  const productQtyTarget = useMemo(() => {
    if (!product) return 1;
    return snapQuantity(product, product.minimumOrderQuantity || 1);
  }, [product?._id, product?.minimumOrderQuantity, product?.variants?.length]);

  useEffect(() => { if (product) setQty(productQtyTarget); }, [productQtyTarget, product]);

  const variants = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product?.variants]);
  const variantSelection = useMemo(() => resolveVariantSelection(variants, selectedColor, selectedSize), [variants, selectedColor, selectedSize]);

  useEffect(() => {
    if (variants.length === 0) return;
    const defaultIndex = variants.findIndex((v) => v.isDefault);
    const initialSelection = defaultIndex >= 0 ? defaultIndex : 0;
    const initialVariant = variants[initialSelection];
    const initialColor = getVariantAttributeValue(initialVariant, 'color');
    const initialSize = getVariantAttributeValue(initialVariant, 'size');
    setSelectedVariantIndex((current) => (current == null ? initialSelection : current));
    if (initialColor && !selectedColor) setSelectedColor(initialColor);
    if (initialSize && !selectedSize) setSelectedSize(initialSize);
  }, [variants, selectedColor, selectedSize]);

  useEffect(() => {
    if (variants.length === 0) return;
    const { index, color, size, variant } = variantSelection;
    if (index >= 0 && selectedVariantIndex !== index) setSelectedVariantIndex(index);
    if (variant) {
      const nextColor = getVariantAttributeValue(variant, 'color');
      const nextSize = getVariantAttributeValue(variant, 'size');
      if (nextColor && nextColor !== selectedColor) setSelectedColor(nextColor);
      if (nextSize && nextSize !== selectedSize) setSelectedSize(nextSize);
    }
    if (color && color !== selectedColor) setSelectedColor(color);
    if (size && size !== selectedSize) setSelectedSize(size);
  }, [variantSelection, selectedVariantIndex, selectedColor, selectedSize, variants.length]);

  const selectedVariant = selectedVariantIndex != null ? variants[selectedVariantIndex] : null;
  const basePrice = detailData?.price || 0;
  const variantPrice = selectedVariant?.price != null ? Number(selectedVariant.price) : null;
  const price = variantPrice ?? basePrice;
  const isDropship = detailData?.isDropship || false;
  const isAlibaba = detailData?.isAlibaba || false;
  const moqRules = detailData?.moqRules || { moq: 1, increment: 1, soldAsLot: false, packSize: 1 };
  const hasPromo = detailData?.hasPromo && variantPrice == null;
  const promoPrice = detailData?.salePrice || 0;
  const displayPrice = isDropship ? getCardDisplayPrice(product) : (hasPromo ? promoPrice : price);
  const discount = hasPromo ? calcDiscountPercent(price, promoPrice) : 0;

  const inStock = detailData?.inStock || false;
  const isLowStock = detailData?.isLowStock || false;
  const stock = detailData?.stock || 0;

  const productId = detailData?.id;
  const sellerId = product?.vendorId || product?.sellerId || product?.vendor_id || null;
  const isInCart = cart.some((item) => (item._id || item.id) === productId);

  const rating = product?.rating != null ? Number(product.rating) : null;
  const reviewCount = product?.totalReviews != null ? Number(product.totalReviews) : reviewsData?.pagination?.totalItems || 0;
  const soldCount = Number(product?.totalSales ?? 0) || 0;

  const images = useMemo(() => {
    const list = detailData?.images || [];
    if (selectedVariant?.image) {
      const vImg = resolveImageUrl(selectedVariant.image);
      if (vImg && !list.includes(vImg)) return [vImg, ...list];
    }
    return list;
  }, [detailData?.images, selectedVariant]);

  const productDeliveryZones = useMemo(() => (Array.isArray(product?.deliveryZones) ? product.deliveryZones : []), [product?.deliveryZones]);
  const deliveryZones = useMemo(() => {
    const keyOf = (z) => [z?.country, z?.area, z?.locality, z?.zoneName, z?.city].join('|');
    return [...productDeliveryZones, ...sellerZones].filter((zone, i, arr) => keyOf(zone) && arr.findIndex((z) => keyOf(z) === keyOf(zone)) === i);
  }, [productDeliveryZones, sellerZones]);
  const freeShippingZone = useMemo(() => deliveryZones.find((z) => z?.freeShipping || Number(z?.price || 0) === 0), [deliveryZones]);

  const estDays = product?.estimatedImportDays;
  const importDaysLabel = detailData?.importDaysLabel
    || (estDays?.min && estDays?.max ? `${estDays.min} à ${estDays.max} jours` : '');
  const hasShippingInfo = Boolean(detailData?.shippingInfo?.trim());
  const hasWarranty = Boolean(detailData?.warranty?.trim());
  const originLabel = extras.origin || product?.shippingOrigin?.countryName || product?.supplier?.shipFromCountryName || '';
  const originCountry = product?.shippingOrigin?.countryName || product?.supplier?.shipFromCountryName || '';
  const isFragile = String(product?.shippingCategory || '').toLowerCase() === 'fragile';

  useEffect(() => {
    if (!sellerId) { setSellerZones([]); return undefined; }
    let cancelled = false;
    getVendorDeliveryZonesByVendor(sellerId)
      .then((res) => { if (!cancelled) setSellerZones(Array.isArray(res?.data) ? res.data : []); })
      .catch(() => { if (!cancelled) setSellerZones([]); });
    return () => { cancelled = true; };
  }, [sellerId]);

  const alibabaInfo = useMemo(() => (isAlibaba ? extractAlibabaDisplayInfo(product) : {}), [product, isAlibaba]);

  /* Caractéristiques fusionnées : fiche générique + attributs fournisseur (sans doublons) */
  const specGroups = useMemo(() => {
    const norm = (k) => String(k).toLowerCase().replace(/[^a-zà-ÿ0-9]/g, '');
    const seen = new Set();
    const base = (detailData?.specifications || [])
      .filter((s) => s?.key && s?.value && !/^marque$/i.test(s.key))
      .map((s) => ({ key: String(s.key), value: String(s.value) }));
    base.forEach((r) => seen.add(norm(r.key)));
    const groups = base.length ? [{ title: 'Général', rows: base }] : [];
    extras.groups.forEach((g) => {
      const rows = g.rows.filter((r) => {
        const k = norm(r.key);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      if (rows.length) groups.push({ title: g.title, rows });
    });
    return groups;
  }, [detailData?.specifications, extras.groups]);
  const specCount = specGroups.reduce((n, g) => n + g.rows.length, 0);
  const hasSkuOptions = Boolean(isAlibaba && alibabaInfo?.hasSkus);
  const specCardCount = specGroups.length + (hasSkuOptions ? 1 : 0);

  /* Points forts (fiche rapide) */
  const glance = [
    extras.capacity && { label: 'Capacité', value: extras.capacity },
    extras.material && { label: 'Matériau', value: extras.material },
    extras.size && { label: 'Dimensions', value: extras.size },
    extras.unitWeight && { label: 'Poids brut', value: extras.unitWeight },
    extras.model && { label: 'Référence', value: extras.model },
    extras.packing && { label: 'Emballage', value: extras.packing },
  ].filter(Boolean);

  /* Conditionnement & vente en gros */
  const wh = detailData?.wholesale;
  const pk = detailData?.packaging;
  const packRows = [
    (wh?.minOrderQuantity > 1 || moqRules.moq > 1) && { key: 'Quantité minimum', value: `${wh?.minOrderQuantity || moqRules.moq} ${wh?.unitType || 'unités'}` },
    moqRules.increment > 1 && { key: 'Incrément de commande', value: `par ${moqRules.increment}` },
    (moqRules.soldAsLot || moqRules.packSize > 1) && { key: 'Vendu par lot de', value: `${moqRules.packSize} unités` },
    wh?.batchNumber && { key: 'Nombre par lot', value: `${wh.batchNumber} unités` },
    extras.unitPackage && { key: 'Colis unitaire', value: extras.unitPackage },
    (extras.unitWeight || pk?.weightKg) && { key: 'Poids brut unitaire', value: extras.unitWeight || `${pk.weightKg} kg` },
    pk?.packageSize && !extras.unitPackage && { key: 'Dimensions colis', value: pk.packageSize },
    extras.carton && { key: 'Pièces par carton', value: `${extras.carton.pcs}` },
    extras.carton && { key: 'Dimensions du carton', value: extras.carton.dims },
    extras.carton && { key: 'Volume du carton', value: `${fmtNum(extras.carton.volumeM3, 3)} m³` },
    extras.carton?.grossKg && { key: 'Poids du carton complet', value: `≈ ${fmtNum(extras.carton.grossKg, 1)} kg` },
    pk?.supplyCapacity && { key: 'Capacité fournisseur', value: pk.supplyCapacity },
    wh?.handlingTimeDays && { key: 'Préparation usine', value: `${wh.handlingTimeDays} jour(s) ouvrés` },
  ].filter(Boolean);

  const stats = [
    (wh?.minOrderQuantity > 1 || moqRules.moq > 1) && { label: 'Commande minimum', value: `${wh?.minOrderQuantity || moqRules.moq} ${wh?.unitType || 'unités'}` },
    extras.carton && { label: 'Pièces par carton', value: `${extras.carton.pcs}` },
    extras.carton && { label: 'Volume du carton', value: `${fmtNum(extras.carton.volumeM3, 3)} m³` },
    extras.carton?.grossKg && { label: 'Poids du carton', value: `≈ ${fmtNum(extras.carton.grossKg, 1)} kg` },
  ].filter(Boolean);

  const tiers = detailData?.publicPriceTiers || [];
  const hasPeriods = wh?.deliverPeriods?.length > 0;
  const hasWholesaleTab = packRows.length > 0 || tiers.length > 0 || hasPeriods;
  const hasDelivery = isDropship || hasShippingInfo || deliveryZones.length > 0 || hasWarranty;

  /* Sous-total uniquement quand le prix unitaire est connu */
  const activeTier = useMemo(() => {
    let found = null;
    tiers.forEach((t) => { const m = tierMin(t); if (m != null && qty >= m) found = t; });
    return found;
  }, [tiers, qty]);
  const unitNow = tiers.length ? num(activeTier?.unitPrice) : num(displayPrice);
  const subtotal = unitNow != null ? unitNow * qty : null;

  /* Onglet actif selon la section visible */
  useEffect(() => {
    if (!product || typeof IntersectionObserver === 'undefined') return undefined;
    const pairs = [
      [descRef, 'description'], [deliveryRef, 'delivery'], [specsRef, 'specs'],
      [wholesaleRef, 'wholesale'], [reviewsRef, 'reviews'],
    ];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const hit = pairs.find(([r]) => r.current === e.target);
        if (hit) setActiveTab(hit[1]);
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    pairs.forEach(([r]) => { if (r.current) io.observe(r.current); });
    return () => io.disconnect();
  }, [product, hasWholesaleTab, hasDelivery]);

  const normalizedProduct = useMemo(() => {
    if (!product) return null;
    return {
      ...product, id: productId, _id: productId, price,
      promoPrice: hasPromo ? promoPrice : null, salePrice: hasPromo ? promoPrice : null,
      image: images[0] || '', stock, selectedVariant: selectedVariant || undefined, selectedColor, selectedSize,
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
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 56, behavior: 'smooth' });
  }, []);

  const sellerName = detailData?.sellerName || product?.sellerName || product?.vendorName || getDisplayVendorName(product) || '';
  const stockLabel = detailData?.stockStatusLabel || (
    !inStock ? 'Rupture de stock'
      : isAlibaba ? 'Sur commande, fabrication directe usine'
        : isDropship ? (stock > 0 && stock <= 5 ? `Stock limité, ${stock} restants` : 'En stock')
          : isLowStock ? `Stock limité, ${stock} restants` : `${stock} en stock`
  );

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
          <div className="pd-empty__actions"><Link to="/shopping" className="pd-btn pd-btn--primary">Retour à la boutique</Link></div>
        </div>
        <Footer />
      </div>
    );
  }

  /* Ordre = ordre d'affichage des bandes */
  const tabs = [
    { key: 'description', label: 'Description', ref: descRef },
    ...(hasDelivery ? [{ key: 'delivery', label: 'Livraison', ref: deliveryRef }] : []),
    { key: 'specs', label: `Caractéristiques${specCount ? ` (${specCount})` : ''}`, ref: specsRef },
    ...(hasWholesaleTab ? [{ key: 'wholesale', label: 'Gros et conditionnement', ref: wholesaleRef }] : []),
    { key: 'reviews', label: `Avis${reviewCount ? ` (${reviewCount})` : ''}`, ref: reviewsRef },
  ];

  const categoryHref = detailData?.category ? `/category/${encodeURIComponent(String(detailData.category).toLowerCase())}` : null;

  return (
    <div className="pd-page">
      <Header />

      <main className="pd-main">
        {/* ═════════ Haut de page : galerie + achat ═════════ */}
        <div className="pd-wrap pd-wrap--top">
          <nav className="pd-crumb" aria-label="Fil d'Ariane">
            <Link to="/">Accueil</Link>
            <ChevronRight size={14} aria-hidden />
            {categoryHref && (
              <>
                <Link to={categoryHref}>{detailData.category}</Link>
                <ChevronRight size={14} aria-hidden />
              </>
            )}
            <span className="pd-crumb__current">{detailData?.name}</span>
          </nav>

          <div className="pd-layout">
            <div className="pd-layout__media">
              <ProductGallery images={images} name={detailData?.name} videoUrl={detailData?.videoUrl} />
            </div>

            <div className="pd-layout__info">
              <aside className="pd-buy">
                <div className="pd-buy__head">
                  {originCountry && isAlibaba && <span className="pd-tag pd-tag--origin"><Ship size={12} /> Importé de {originCountry}</span>}
                  {detailData?.tagLabel && <span className="pd-tag">{detailData.tagLabel}</span>}
                  {isFragile && <span className="pd-tag">Colis fragile</span>}
                  {hasPromo && <span className="pd-tag pd-tag--sale">−{discount}%</span>}
                  {detailData?.brand && <span className="pd-meta">{detailData.brand}</span>}
                </div>

                <h1 className={`pd-title${(detailData?.name?.length || 0) > 72 ? ' pd-title--long' : ''}`}>{detailData?.name}</h1>

                <div className="pd-rating-row">
                  <ProductRating rating={rating} reviewCount={reviewCount} size="md" />
                  {soldCount > 0 && <span className="pd-meta"><Star size={12} fill="currentColor" /> {soldCount} vendus</span>}
                  {extras.model && <span className="pd-meta">Réf. {extras.model}</span>}
                </div>

                <div className="pd-price">
                  <span className="pd-price__now">{formatCFA(displayPrice)}</span>
                  {hasPromo && <span className="pd-price__was">{formatCFA(price)}</span>}
                  <span className="pd-price__unit">l&apos;unité, TTC</span>
                </div>

                <p className={`pd-stock ${!inStock ? 'pd-stock--out' : isLowStock ? 'pd-stock--low' : ''}`}>{stockLabel}</p>

                <VolumePricingTable tiers={tiers} qty={qty} onPick={(m) => setQty(snapQuantity(product, m))} />

                {isDropship && !moqRules.soldAsLot && moqRules.moq > 1 && (
                  <p className="pd-note">Quantité minimum : <strong>{moqRules.moq} unités</strong></p>
                )}
                {isDropship && (moqRules.soldAsLot || moqRules.packSize > 1) && (
                  <p className="pd-note">Vendu par lot de <strong>{moqRules.packSize} unités</strong></p>
                )}

                <ProductVariants
                  product={product ? { ...product, isAlibaba } : product}
                  selectedVariantIndex={selectedVariantIndex}
                  onSelectVariant={setSelectedVariantIndex}
                  selectedColor={selectedColor}
                  onSelectColor={setSelectedColor}
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                />

                {inStock && (
                  <div className="pd-qty-row">
                    <div>
                      <span className="pd-label">Quantité</span>
                      {subtotal != null && <p className="pd-subtotal">Sous-total {formatCFA(subtotal)}</p>}
                    </div>
                    <QtyControl
                      value={qty}
                      onChange={(next) => setQty(snapQuantity(product, next))}
                      min={moqRules.moq}
                      step={moqRules.increment}
                      max={isAlibaba ? undefined : stock}
                    />
                  </div>
                )}

                <div className="pd-actions">
                  <button type="button" className={`pd-btn pd-btn--primary ${addedAnim ? 'is-done' : ''}`} onClick={handleAddToCart} disabled={!inStock}>
                    {addedAnim ? <><Check size={18} /> Ajouté</> : <><ShoppingCart size={18} /> {isInCart ? 'Encore au panier' : 'Ajouter au panier'}</>}
                  </button>
                  <button type="button" className="pd-btn pd-btn--ghost" onClick={handleBuyNow} disabled={!inStock}>Acheter</button>
                  <button type="button" className={`pd-icon-btn ${wished ? 'is-on' : ''}`} onClick={() => setWished((w) => !w)} aria-label="Favoris">
                    <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <ul className="pd-assurance">
                  <li><Truck size={14} /> {freeShippingZone ? 'Livraison gratuite sur certaines zones' : 'Livraison partout au Togo et au Bénin'}</li>
                  <li><ShieldCheck size={14} /> Paiement mobile sécurisé (T-Money, Moov, Flooz, Carte)</li>
                  <li><RefreshCw size={14} /> Retours et conformité garantis par Dango Import</li>
                </ul>

                {sellerName && (
                  <div className="pd-seller">
                    <span className="pd-label">Vendeur</span>
                    <span className="pd-seller__name">
                      {sellerName}
                      {detailData?.isVendorCertified && <BadgeCheck size={14} className="pd-seller__badge" aria-label="Certifié" />}
                    </span>
                  </div>
                )}

                <button
                  type="button" className="pd-share"
                  onClick={() => (navigator.share
                    ? navigator.share({ title: detailData?.name, url: window.location.href })
                    : navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Lien copié')))}
                >
                  <Share2 size={14} /> Partager
                </button>
              </aside>
            </div>
          </div>
        </div>

        {/* ═════════ Bas de page : landing ═════════ */}
        <div className="pd-landing">
          <div className="pd-tabs">
            <nav className="pd-tabs__inner" aria-label="Sections">
              {tabs.map((tab) => (
                <button key={tab.key} type="button" className={`pd-tabs__item ${activeTab === tab.key ? 'is-active' : ''}`} onClick={() => scrollToSection(tab.ref, tab.key)}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 1 · Description + points forts */}
          <section ref={descRef} className="pd-band" id="description">
            <div className="pd-inner">
              <SectionHead eyebrow="Le produit" title="À propos de ce produit" />
              <div className="pd-narrow">
                <ReadMore text={detailData?.description} safeHtml={detailData?.safeHtml} fallbackTitle={detailData?.name} />
              </div>

              {glance.length > 0 && (
                <dl className="pd-feats" aria-label="Points forts">
                  {glance.map((g) => (
                    <div key={g.label} className="pd-feat">
                      <dt>{g.label}</dt>
                      <dd>{g.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {detailData?.hasVideo && detailData?.videoUrl && (
                <div className="pd-video-wrap">
                  <video src={detailData.videoUrl} controls preload="metadata" className="pd-video" aria-label="Vidéo de présentation produit" />
                </div>
              )}
            </div>
          </section>

          {/* 2 · Livraison et importation */}
          {hasDelivery && (
            <section ref={deliveryRef} className="pd-band pd-band--ink" id="delivery">
              <div className="pd-inner">
                <SectionHead
                  eyebrow="Livraison et importation"
                  title={isDropship ? "De l'usine jusqu'à chez vous" : 'Livraison'}
                  lead={isDropship && importDaysLabel ? `Délai d'importation estimé : ${importDaysLabel}` : undefined}
                />

                {isDropship ? (
                  <>
                    <ImportRoute origin={originLabel} port={extras.port} days={importDaysLabel} />
                    <ol className="pd-steps">
                      <li>
                        <strong>Préparation chez le fournisseur</strong>
                        <p>{wh?.handlingTimeDays ? `${wh.handlingTimeDays} jours ouvrés de fabrication et de préparation.` : 'Vérification et préparation de la commande par le fournisseur.'}</p>
                      </li>
                      <li>
                        <strong>Transit international et dédouanement</strong>
                        <p>Expédié depuis {originCountry || 'la Chine'} vers le hub Dango Import{importDaysLabel ? <> en <strong>{importDaysLabel}</strong></> : null}.</p>
                      </li>
                      <li>
                        <strong>Distribution au Togo et au Bénin</strong>
                        <p>Livraison à votre adresse ou retrait sécurisé en agence partenaire.</p>
                      </li>
                    </ol>
                    <p className="pd-band__foot">
                      Frais d&apos;importation et taxes calculés au checkout. Vente et SAV par Dango Import.
                      {isFragile ? ' Catégorie d\'expédition : fragile.' : ''}
                    </p>
                  </>
                ) : hasShippingInfo ? (
                  <div className="pd-narrow"><p className="pd-prose">{detailData.shippingInfo}</p></div>
                ) : null}

                {deliveryZones.length > 0 && (
                  <div className="pd-zonecard">
                    <h3>Tarifs de livraison locale</h3>
                    <ul className="pd-zones">
                      {deliveryZones.map((zone, i) => {
                        const zname = zone.locality || zone.area || zone.country || 'Zone locale';
                        const isFree = zone.freeShipping || Number(zone.price) === 0;
                        return (
                          <li key={i}>
                            <span>{zname}</span>
                            <span>{isFree ? 'Gratuite' : zone.price != null ? formatCFA(zone.price) : zone.deliveryTime || '—'}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {hasWarranty && <p className="pd-warranty"><ShieldCheck size={15} /> Garantie : {detailData.warranty}</p>}
              </div>
            </section>
          )}

          {/* 3 · Caractéristiques */}
          <section ref={specsRef} className="pd-band pd-band--surface" id="specs">
            <div className="pd-inner">
              <SectionHead
                eyebrow="Fiche technique"
                title="Caractéristiques"
                lead={specCount > 0 ? `${specCount} informations détaillées sur le produit.` : undefined}
              />

              {specCardCount > 0 ? (
                <div className={`pd-specgrid${specCardCount === 1 ? ' pd-specgrid--single' : ''}`}>
                  {specGroups.map((g) => (
                    <div key={g.title} className="pd-card">
                      <h3>{g.title}</h3>
                      <Rows rows={g.rows} />
                    </div>
                  ))}
                  {hasSkuOptions && (
                    <div className="pd-card">
                      <h3>Options proposées</h3>
                      <AlibabaSkuAttributes skus={alibabaInfo.skus} />
                    </div>
                  )}
                </div>
              ) : (
                <p className="pd-muted pd-center">Aucune caractéristique renseignée.</p>
              )}

              {isAlibaba && (
                <div className="pd-supplier">
                  <div>
                    <p className="pd-supplier__title">Approvisionnement direct usine</p>
                    <p className="pd-muted">Expédition depuis : <strong>{originLabel || 'Chine'}</strong>{extras.port ? <>, port de {extras.port}</> : null}</p>
                  </div>
                  <p className="pd-supplier__guarantee"><ShieldCheck size={16} /> Les commandes Alibaba passent par le contrôle qualité Dango Import avant expédition vers Lomé et Cotonou.</p>
                </div>
              )}
            </div>
          </section>

          {/* 4 · Gros et conditionnement */}
          {hasWholesaleTab && (
            <section ref={wholesaleRef} className="pd-band" id="wholesale">
              <div className="pd-inner">
                <SectionHead
                  eyebrow="Achat en volume"
                  title="Gros et conditionnement"
                  lead="Conditions de commande, dimensions des colis et prix dégressifs."
                />

                {stats.length > 0 && (
                  <div className="pd-stats">
                    {stats.map((s) => (
                      <div key={s.label} className="pd-stat">
                        <strong>{s.value}</strong>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tiers.length > 0 && (
                  <VolumePricingTable variant="cards" tiers={tiers} qty={qty} onPick={(m) => setQty(snapQuantity(product, m))} />
                )}

                {(packRows.length > 0 || hasPeriods) && (
                  <div className={`pd-twocol${packRows.length > 0 && hasPeriods ? '' : ' pd-twocol--single'}`}>
                    {packRows.length > 0 && (
                      <div className="pd-card">
                        <h3>Conditionnement</h3>
                        <Rows rows={packRows} />
                        {extras.carton?.grossKg && <p className="pd-footnote">Le poids du carton complet est estimé : poids unitaire multiplié par le nombre de pièces.</p>}
                      </div>
                    )}
                    {hasPeriods && (
                      <div className="pd-card">
                        <h3>Délais de fabrication selon le volume</h3>
                        <Rows rows={wh.deliverPeriods.map((p) => ({
                          key: `${p.quantity} unités`,
                          value: `${p.processPeriodDays || p.processPeriod} jours ouvrés`,
                        }))}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 5 · Avis */}
          <section ref={reviewsRef} className={`pd-band${hasWholesaleTab ? ' pd-band--surface' : ''}`} id="reviews">
            <div className="pd-inner pd-inner--mid">
              <ProductReviewsSection
                productId={productId}
                reviews={reviewsData?.reviews || []}
                productRating={rating}
                totalReviews={reviewCount}
                loading={reviewsLoading}
              />
            </div>
          </section>

          {/* 6 · Produits similaires */}
          {similarProducts.length > 0 && (
            <section className={`pd-band${hasWholesaleTab ? '' : ' pd-band--surface'}`}>
              <div className="pd-inner">
                <SectionHead eyebrow="À découvrir aussi" title="Produits similaires" />
                <div className="pd-related__grid">
                  {similarProducts.slice(0, 8).map((item) => (
                    <ProductCard key={item._id || item.id} product={item} onAddToCart={addToCart} />
                  ))}
                </div>
                {categoryHref && (
                  <div className="pd-related__more">
                    <Link to={categoryHref} className="pd-btn pd-btn--ghost">Voir la catégorie</Link>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 7 · Appel final */}
          {inStock && (
            <section className="pd-band pd-band--ink pd-cta" aria-label="Commander">
              <div className="pd-inner pd-cta__inner">
                <p className="pd-eyebrow">Prêt à commander ?</p>
                <h2 className="pd-cta__title">{detailData?.name}</h2>
                <div className="pd-cta__price">
                  <strong>{formatCFA(displayPrice)}</strong>
                  {hasPromo && <s>{formatCFA(price)}</s>}
                  <span>l&apos;unité, TTC</span>
                </div>
                <div className="pd-cta__actions">
                  <button type="button" className={`pd-btn pd-btn--primary ${addedAnim ? 'is-done' : ''}`} onClick={handleAddToCart}>
                    {addedAnim ? <><Check size={18} /> Ajouté</> : <><ShoppingCart size={18} /> Ajouter au panier</>}
                  </button>
                  <button type="button" className="pd-btn pd-btn--light" onClick={handleBuyNow}>Acheter maintenant</button>
                </div>
                <ul className="pd-cta__trust">
                  <li><Truck size={14} /> Togo et Bénin</li>
                  <li><ShieldCheck size={14} /> Paiement mobile sécurisé</li>
                  <li><RefreshCw size={14} /> Retours garantis</li>
                </ul>
              </div>
            </section>
          )}
        </div>
      </main>

      <div className="pd-bar">
        <div className="pd-bar__price">
          <strong>{formatCFA(displayPrice)}</strong>
          {hasPromo && <s>{formatCFA(price)}</s>}
        </div>
        <button type="button" className="pd-bar__btn" onClick={handleAddToCart} disabled={!inStock}>Panier</button>
        <button type="button" className="pd-bar__btn pd-bar__btn--accent" onClick={handleBuyNow} disabled={!inStock}>Acheter</button>
      </div>

      <Footer />
    </div>
  );
}