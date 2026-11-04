import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, ShoppingCart, Minus, Plus, Package, BadgeCheck,
  Truck, RefreshCw, ShieldCheck, Share2, Heart, X, Check, Factory, Anchor, Ship, MapPin, Maximize2, CreditCard,
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
   Règle : aucune donnée inventée. L'identité du fournisseur reste masquée.
   ════════════════════════════════════════════════════════════════════ */
const GROUP_FR = {
  'Industry-specific attributes': 'Spécifications industrielles',
  'Other attributes': 'Fabrication & Matériaux',
  'Packaging and delivery': 'Colis & Expédition',
};
const ATTR_FR_MAP = {
  'herb & spice tools type': 'Type de produit',
  material: 'Matériau',
  feature: 'Particularités / Points forts',
  'place of origin': 'Lieu de fabrication',
  'model number': 'Référence modèle',
  size: 'Dimensions du produit',
  capacity: 'Capacité',
  packing: 'Emballage individuel',
  style: 'Style',
  port: "Port d'embarquement",
  'selling units:': 'Unité de vente',
  'single package size:': 'Dimensions colis unitaire',
  'single gross weight:': 'Poids brut unitaire',
  connectors: 'Connecteurs',
  function: 'Fonctionnalités',
  type: 'Type de câble / produit',
  'usb type': 'Connectique USB',
  use: 'Appareils compatibles',
  application: 'Compatibilité / Usage',
  conductor: 'Conducteur interne',
  jacket: 'Gaine extérieure',
  'private mold': 'Moule d’usine exclusif',
  shielding: 'Blindage anti-interférence',
  moq: 'Quantité minimale d’usine (MOQ)',
  warranty: 'Garantie usine',
  keywords: 'Mots-clés',
};
const ATTR_HIDE = new Set(['brand name', 'oem', 'logo', 'product name', 'keywords', 'odm']);

const VALUE_FR_MAP = {
  'pure copper': 'Cuivre pur',
  'shielded': 'Blindé anti-interférences',
  'nylon': 'Nylon tressé',
  'tpe': 'TPE renforcé',
  'eco-friendly': 'Écologique',
  '3a fast charging': 'Charge rapide 3A',
  'guangdong, china': 'Guangdong, Chine',
  '24 moths': '24 mois',
  'mobile phone': 'Téléphones portables',
  'for phone, tablet, laptop': 'Smartphones, tablettes, PC portables',
  'single item': 'Article individuel',
  'type-c to type-c': 'USB-C vers USB-C',
  'fast charging cable': 'Câble charge rapide',
  'salad dresing shaker': 'Shaker à vinaigrette',
  'white box': 'Boîte blanche',
  'yes': 'Oui',
  'no': 'Non',
};

const frValue = (v) => {
  const s = String(v || '').trim();
  const lower = s.toLowerCase();
  if (VALUE_FR_MAP[lower]) return VALUE_FR_MAP[lower];
  return s
    .replace(/Borosilicate Gal?ss/i, 'verre borosilicaté')
    .replace(/(\d)\s*(cm|mm)\b/gi, '$1 $2')
    .replace(/\s*x\s*/gi, ' × ');
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
  const src = product?.rawPayload?.result_data?.keyAttributes
    ?? product?.normalized?.rawAlibabaData?.result_data?.keyAttributes
    ?? product?.rawAlibabaData?.result_data?.keyAttributes
    ?? product?.rawAlibabaData?.keyAttributes
    ?? product?.pricing?.raw?.keyAttributes
    ?? product?.keyAttributes
    ?? product?.rawSections?.keyAttributes;
  const raw = Array.isArray(src?.attributes) ? src.attributes : [];
  const flat = {};
  raw.forEach((g) => (g.attributes || []).forEach((a) => {
    const vals = (a.values || []).map((v) => v?.value).filter(Boolean);
    if (a?.name && vals.length && !flat[a.name]) flat[a.name] = vals;
    if (a?.name && vals.length && !flat[a.name.toLowerCase()]) flat[a.name.toLowerCase()] = vals;
  }));

  const seen = new Set();
  const groups = raw.map((g) => ({
    title: GROUP_FR[g.type] || g.type,
    rows: (g.attributes || [])
      .filter((a) => a?.name && !ATTR_HIDE.has(String(a.name).toLowerCase()))
      .map((a) => {
        const rawName = String(a.name).trim();
        const lowerName = rawName.toLowerCase();
        const label = ATTR_FR_MAP[lowerName] || rawName.replace(/:$/, '');
        return {
          key: label,
          value: (a.values || []).map((v) => v?.value).filter((v) => v && v !== 'Stocked').map(frValue).join(', '),
        };
      })
      .filter((r) => {
        if (!r.value || seen.has(r.key)) return false;
        seen.add(r.key);
        return true;
      }),
  })).filter((g) => g.rows.length);

  const one = (name) => {
    const hit = flat[name] || flat[name.toLowerCase()];
    return hit ? frValue(hit[0]) : '';
  };
  const cartonRaw = flat.Measurement?.[0] || flat.measurement?.[0] || '';
  const cm = /([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*cm\s*\/\s*(\d+)\s*pcs/i.exec(cartonRaw);
  const unitWeightRaw = flat['Single gross weight:']?.[0] || flat['single gross weight:']?.[0] || flat['single gross weight']?.[0] || '';
  const unitWeightKg = (() => {
    const m = /([\d.,]+)\s*(kg|g)\b/i.exec(unitWeightRaw);
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

  const portRaw = flat.Port?.[0] || flat.port?.[0] || '';
  const supplierName = product?.rawPayload?.result_data?.supplier
    || product?.normalized?.rawAlibabaData?.result_data?.supplier
    || product?.supplier?.name
    || '';

  return {
    groups,
    carton,
    supplierName,
    capacity: one('Capacity'),
    material: one('Material'),
    size: one('Size'),
    model: one('Model Number') || product?.rawPayload?.result_data?.mode_id || product?.modelNumber || '',
    packing: one('Packing'),
    origin: one('Place of Origin') || (product?.rawPayload?.result_data?.shipping_from === 'CN' ? 'Chine' : ''),
    port: portRaw ? titleCase(portRaw.replace(/^FOB\s*/i, '')) : '',
    unitWeight: unitWeightRaw ? fmtWeight(unitWeightRaw) : '',
    unitPackage: one('Single package size:') || one('single package size') || '',
  };
}

const num = (v) => (v == null || v === '' ? null : (Number.isFinite(Number(v)) ? Number(v) : null));
const tierMin = (t) => num(t?.minQty ?? t?.minQuantity ?? t?.min) ?? num((String(t?.label || '').match(/\d+/) || [])[0]);

/* ── En-tête de section ─────────────────────────────────────────────── */
function SectionHead({ eyebrow, title, lead }) {
  return (
    <header className="pd-head">
      {eyebrow && <p className="pd-eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {lead && <p className="pd-head__lead">{lead}</p>}
    </header>
  );
}

/* ── Paliers de prix (gros chiffres, cliquables) ────────────────────── */
function VolumePricingTable({ tiers = [], qty, onPick }) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const mins = tiers.map(tierMin);
  let activeIdx = -1;
  mins.forEach((m, i) => { if (m != null && qty >= m) activeIdx = i; });
  return (
    <ul className="pd-tiers__list">
      {tiers.map((t, i) => (
        <li key={i}>
          <button
            type="button"
            className={`pd-tierbtn ${i === activeIdx ? 'is-on' : ''}`}
            disabled={mins[i] == null}
            onClick={() => mins[i] != null && onPick?.(mins[i])}
          >
            <span className="pd-tierbtn__price">{t.unitPriceFormatted}</span>
            <span className="pd-tierbtn__qty">{t.label}</span>
            {t.savingsPercent > 0 && <span className="pd-tierbtn__save">−{t.savingsPercent}%</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ── Parcours d'importation (une seule frise, pas de cartes en double) ─ */
function ImportRoute({ steps = [] }) {
  return (
    <ol className="pd-route" aria-label="Parcours de la commande">
      {steps.map((st) => (
        <li key={st.title} className="pd-route__step">
          <span className="pd-route__node"><st.icon size={15} /></span>
          <span className="pd-route__title">{st.title}</span>
          <span className="pd-route__text">{st.text}</span>
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

function ProductGallery({ images = [], name, videoUrl, wished = false, onToggleWish }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [activeMedia, setActiveMedia] = useState('image');
  const [broken, setBroken] = useState(() => new Set());

  const slides = useMemo(() => images.filter(Boolean).filter((src) => !broken.has(src)), [images, broken]);
  const current = slides[index] || null;
  const stripRef = useRef(null);

  useEffect(() => { setBroken(new Set()); setIndex(0); setActiveMedia('image'); }, [images.join('|')]);

  useEffect(() => {
    const strip = stripRef.current;
    const el = strip?.querySelector('.is-on');
    if (!strip || !el) return;
    strip.scrollTo({
      left: el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2,
      top: el.offsetTop - (strip.clientHeight - el.offsetHeight) / 2,
      behavior: 'smooth',
    });
  }, [index, activeMedia, slides.length]);
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

          <div className="pd-gallery__fabs">
            {onToggleWish && (
              <button type="button" className={`pd-gallery__fab ${wished ? 'is-on' : ''}`} onClick={onToggleWish} aria-label="Favoris" aria-pressed={wished}>
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
              </button>
            )}
            {current && activeMedia === 'image' && (
              <button type="button" className="pd-gallery__fab" onClick={() => setLightbox(true)} aria-label="Agrandir l'image">
                <Maximize2 size={18} />
              </button>
            )}
          </div>

          {activeMedia === 'image' && slides.length > 1 && (
            <>
              <span className="pd-gallery__count">{index + 1} / {slides.length}</span>
              <button type="button" className="pd-gallery__arrow pd-gallery__arrow--prev" onClick={() => go(-1)} aria-label="Image précédente"><ChevronLeft size={20} /></button>
              <button type="button" className="pd-gallery__arrow pd-gallery__arrow--next" onClick={() => go(1)} aria-label="Image suivante"><ChevronRight size={20} /></button>
            </>
          )}
        </div>

        {(slides.length > 1 || videoUrl) && (
          <div ref={stripRef} className="pd-gallery__strip" role="tablist" aria-label="Miniatures">
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

function extractFaqs(raw = '') {
  if (!raw || typeof raw !== 'string') return [];
  const list = [];
  const htmlRegex = /<p>(?:<strong>)?Q\s*:\s*([\s\S]+?)(?:<\/strong>)?<\/p>\s*<p>(?:<strong>)?(?:A|R)\s*:\s*([\s\S]+?)(?:<\/strong>)?<\/p>/gi;
  let match = htmlRegex.exec(raw);
  while (match) {
    const q = match[1].replace(/<[^>]+>/g, '').trim();
    const a = match[2].replace(/<[^>]+>/g, '').trim();
    if (q && a) list.push({ q, a });
    match = htmlRegex.exec(raw);
  }
  if (list.length > 0) return list;

  const textRegex = /Q\s*:\s*([\s\S]+?)\s*(?:R|A)\s*:\s*([\s\S]+?)(?=\s*Q\s*:|$)/g;
  let tMatch = textRegex.exec(raw);
  while (tMatch) {
    const q = tMatch[1].replace(/<[^>]+>/g, '').trim();
    const a = tMatch[2].replace(/<[^>]+>/g, '').trim();
    if (q && a && q.length < 250) list.push({ q, a });
    tMatch = textRegex.exec(raw);
  }
  return list;
}

function ProductDescription({ text, safeHtml, fallbackTitle }) {
  const faqs = useMemo(() => {
    const fromHtml = extractFaqs(safeHtml);
    return fromHtml.length > 0 ? fromHtml : extractFaqs(text);
  }, [safeHtml, text]);

  const cleanSafeHtml = useMemo(() => {
    if (!safeHtml) return '';
    return faqs.length > 0
      ? safeHtml.replace(/<h[23][^>]*>\s*FAQs?\s*<\/h[23]>[\s\S]*$/i, '')
      : safeHtml;
  }, [safeHtml, faqs.length]);

  return (
    <div className="pd-desc">
      <ReadMore text={text} safeHtml={cleanSafeHtml || safeHtml} fallbackTitle={fallbackTitle} />
      {faqs.length > 0 && (
        <div className="pd-faq" style={{ marginTop: '32px' }}>
          <h3 className="pd-faq__title">Questions fréquentes (FAQ fournisseur usine)</h3>
          <div className="pd-faq__list">
            {faqs.map((f, i) => (
              <details key={i} className="pd-faq__item" open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
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

  /* Les sélecteurs Couleur / Taille du haut montrent déjà ces options : on ne les répète pas dans les caractéristiques */
  const hasVariantPicker = variants.length > 0;
  const hasSkuOptions = Boolean(isAlibaba && alibabaInfo?.hasSkus) && !hasVariantPicker;
  const isDuplicateSpec = (key) => (
    (hasVariantPicker && /^(couleur|color|taille|size|pointure)/i.test(key))
    || (isAlibaba && /approvisionnement/i.test(key))
    || (isAlibaba && Boolean(originCountry) && /^origine$/i.test(key))
  );

  /* Caractéristiques : fiche générique + attributs fournisseur, sans doublons.
     Les 6 plus utiles vont en haut ; le reste va uniquement dans la fiche technique du bas. */
  const { topSpecs, restGroups } = useMemo(() => {
    const norm = (k) => String(k).toLowerCase().replace(/[^a-zà-ÿ0-9]/g, '');
    const seenKeys = new Set();
    const seenVals = [];
    const groups = [];
    const push = (title, rows) => {
      const kept = rows.filter((r) => {
        const k = norm(r.key);
        const v = norm(r.value);
        if (isDuplicateSpec(r.key)) return false;
        if (!k || !v || seenKeys.has(k)) return false;
        /* « Poids » et « Poids brut » avec la même valeur : une seule ligne */
        if (seenVals.some((o) => o.v === v && (o.k.includes(k) || k.includes(o.k)))) return false;
        seenKeys.add(k);
        seenVals.push({ k, v });
        return true;
      });
      if (kept.length) groups.push({ title, rows: kept });
    };
    push('Général', (detailData?.specifications || [])
      .filter((x) => x?.key && x?.value && !/^marque$/i.test(x.key))
      .map((x) => ({ key: String(x.key), value: String(x.value) })));
    extras.groups.forEach((g) => push(g.title, g.rows));

    const priority = /capacit|mat[ée]riau|dimension|poids|r[ée]f|origine|fabrication|couleur|type/i;
    const flat = groups.flatMap((g) => g.rows.map((r) => ({ ...r, group: g.title })));
    const ranked = [...flat.filter((r) => priority.test(r.key)), ...flat.filter((r) => !priority.test(r.key))];
    const top = ranked.slice(0, 6);
    const topIds = new Set(top.map((r) => `${r.group}|${r.key}`));
    const rest = groups
      .map((g) => ({ title: g.title, rows: g.rows.filter((r) => !topIds.has(`${g.title}|${r.key}`)) }))
      .filter((g) => g.rows.length);
    return { topSpecs: top, restGroups: rest };
  }, [detailData?.specifications, extras.groups, hasVariantPicker, isAlibaba, originCountry]);
  const restCount = restGroups.reduce((n, g) => n + g.rows.length, 0);
  const specCardCount = restGroups.length + (hasSkuOptions ? 1 : 0);
  const showSpecsBand = restCount > 0 || hasSkuOptions;

  /* Gros et conditionnement (sans les paliers de prix, déjà en haut) */
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

  const tiers = detailData?.publicPriceTiers || [];
  const hasPeriods = wh?.deliverPeriods?.length > 0;
  const hasWholesaleTab = packRows.length > 0 || hasPeriods;
  /* Livraison : la section n'existe que si elle contient de vraies informations */
  const isImport = isDropship || isAlibaba;
  const importInfo = isImport && Boolean(originLabel || importDaysLabel || extras.port);
  const shippingText = !isImport && hasShippingInfo ? detailData.shippingInfo : '';
  const hasDelivery = importInfo || Boolean(shippingText) || deliveryZones.length > 0 || hasWarranty;
  const routeSteps = [
    { icon: Factory, title: 'Fabrication', text: wh?.handlingTimeDays ? `${originLabel || 'Chine'}, ${wh.handlingTimeDays} j de préparation` : (originLabel || 'Chine') },
    extras.port && { icon: Anchor, title: 'Embarquement', text: extras.port },
    { icon: Ship, title: 'Transit international', text: importDaysLabel || 'Selon destination' },
    { icon: MapPin, title: 'Livraison', text: 'Lomé et Cotonou, à domicile ou en agence' },
  ].filter(Boolean);

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

  const tabs = [
    { key: 'description', label: 'Description', ref: descRef },
    ...(hasDelivery ? [{ key: 'delivery', label: 'Livraison', ref: deliveryRef }] : []),
    ...(showSpecsBand ? [{ key: 'specs', label: `Fiche technique${restCount ? ` (${restCount})` : ''}`, ref: specsRef }] : []),
    ...(hasWholesaleTab ? [{ key: 'wholesale', label: 'Gros et conditionnement', ref: wholesaleRef }] : []),
    { key: 'reviews', label: `Avis${reviewCount ? ` (${reviewCount})` : ''}`, ref: reviewsRef },
  ];

  const categoryHref = detailData?.category ? `/category/${encodeURIComponent(String(detailData.category).toLowerCase())}` : null;

  return (
    <div className="pd-page">
      <Header />

      <main className="pd-main">
        {/* ═════════ Haut de page : galerie | détails | résumé de commande ═════════ */}
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
            {/* Colonne 1 : galerie */}
            <div className="pd-layout__media">
              <ProductGallery
                images={images}
                name={detailData?.name}
                videoUrl={detailData?.videoUrl}
                wished={wished}
                onToggleWish={() => setWished((w) => !w)}
              />
            </div>

            {/* Colonne 2 : détails */}
            <div className="pd-layout__info">
              <div className="pd-buy__head">
                {originCountry && isAlibaba && <span className="pd-tag pd-tag--origin"><Ship size={12} /> Importé de {originCountry}</span>}
                {extras.supplierName && isAlibaba && <span className="pd-tag pd-tag--factory" title={extras.supplierName}><Factory size={12} /> Direct usine certifiée</span>}
                {detailData?.tagLabel && <span className="pd-tag">{detailData.tagLabel}</span>}
                {isFragile && <span className="pd-tag">Colis fragile</span>}
                {hasPromo && <span className="pd-tag pd-tag--sale">−{discount}%</span>}
                {detailData?.brand && <span className="pd-meta">{detailData.brand}</span>}
              </div>

              <h1 className={`pd-title${(detailData?.name?.length || 0) > 72 ? ' pd-title--long' : ''}`}>{detailData?.name}</h1>

              <div className="pd-rating-row">
                {reviewCount > 0
                  ? <ProductRating rating={rating} reviewCount={reviewCount} size="md" />
                  : <span className="pd-meta pd-meta--lg">Aucun avis pour l&apos;instant</span>}
                {soldCount > 0 && <span className="pd-meta pd-meta--lg pd-meta--sep">{soldCount} vendus</span>}
                {extras.model && <span className="pd-meta pd-meta--sep">Réf. {extras.model}</span>}
              </div>

              <div className="pd-pricebox">
                {tiers.length > 0 ? (
                  <div className="pd-tiers pd-tiers--bar">
                    <VolumePricingTable tiers={tiers} qty={qty} onPick={(m) => setQty(snapQuantity(product, m))} />
                  </div>
                ) : (
                  <div className="pd-price">
                    <span className="pd-price__now">{formatCFA(displayPrice)}</span>
                    {hasPromo && <span className="pd-price__was">{formatCFA(price)}</span>}
                    <span className="pd-price__unit">l&apos;unité, TTC</span>
                  </div>
                )}
                <p className={`pd-stock ${!inStock ? 'pd-stock--out' : isLowStock ? 'pd-stock--low' : ''}`}>{stockLabel}</p>
              </div>

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
                <div className="pd-block">
                  <div className="pd-qty-row">
                    <div>
                      <span className="pd-label pd-label--lg">Quantité</span>
                      {moqRules.moq > 1 && <p className="pd-subtotal">Minimum {moqRules.moq} unités{moqRules.packSize > 1 ? `, par lot de ${moqRules.packSize}` : ''}</p>}
                    </div>
                    <QtyControl
                      value={qty}
                      onChange={(next) => setQty(snapQuantity(product, next))}
                      min={moqRules.moq}
                      step={moqRules.increment}
                      max={isAlibaba ? undefined : stock}
                    />
                  </div>
                </div>
              )}

              {topSpecs.length > 0 && (
                <section className="pd-keyspecs">
                  <h2 className="pd-keyspecs__title">Caractéristiques</h2>
                  <dl className="pd-keyspecs__list">
                    {topSpecs.map((g) => (
                      <div key={`${g.group}-${g.key}`} className="pd-keyspecs__row">
                        <dt>{g.key}</dt>
                        <dd>{g.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {showSpecsBand && (
                    <button type="button" className="pd-link" onClick={() => scrollToSection(specsRef, 'specs')}>Voir toute la fiche technique</button>
                  )}
                </section>
              )}
            </div>

            {/* Colonne 3 : résumé de commande */}
            <aside className="pd-buycard" aria-label="Résumé de la commande">
              {importDaysLabel && isImport && (
                <p className="pd-buycard__eta"><Ship size={14} /> Livraison estimée : {importDaysLabel}</p>
              )}

              <dl className="pd-sum">
                <div className="pd-sum__row"><dt>Sous-total de l&apos;article</dt><dd>{subtotal != null ? formatCFA(subtotal) : '—'}</dd></div>
                <div className="pd-sum__row"><dt>Frais d&apos;importation</dt><dd className="pd-sum__muted">Calculés au checkout</dd></div>
                <div className="pd-sum__row pd-sum__row--total"><dt>Sous-total</dt><dd>{subtotal != null ? formatCFA(subtotal) : '—'}</dd></div>
              </dl>

              <ul className="pd-protect">
                  <li><CreditCard size={16} /> Paiement mobile sécurisé (T-Money, Moov, Flooz, carte)</li>
                  <li><ShieldCheck size={16} /> Contrôle qualité Dango Import avant expédition</li>
                  <li><RefreshCw size={16} /> Retours et conformité garantis</li>
                  <li><Truck size={16} /> {freeShippingZone ? 'Livraison gratuite sur certaines zones' : 'Livraison au Togo et au Bénin'}</li>
                </ul>

              <div className="pd-buycard__actions">
                <button type="button" className={`pd-btn pd-btn--primary ${addedAnim ? 'is-done' : ''}`} onClick={handleAddToCart} disabled={!inStock}>
                  {addedAnim ? <><Check size={18} /> Ajouté</> : <><ShoppingCart size={18} /> {isInCart ? 'Encore au panier' : 'Ajouter au panier'}</>}
                </button>
                <button type="button" className="pd-btn pd-btn--ghost" onClick={handleBuyNow} disabled={!inStock}>Acheter maintenant</button>
              </div>
            </aside>
          </div>
        </div>

        {/* ═════════ Bas de page ═════════ */}
        <div className="pd-landing">
          <div className="pd-tabs">
            {/*<nav className="pd-tabs__inner" aria-label="Sections">
              {tabs.map((tab) => (
                <button key={tab.key} type="button" className={`pd-tabs__item ${activeTab === tab.key ? 'is-active' : ''}`} onClick={() => scrollToSection(tab.ref, tab.key)}>
                  {tab.label}
                </button>
              ))}*/}
            {/*</nav>*/}
          </div>

          {/* 1 · Description */}
          <section ref={descRef} className="pd-band" id="description">
            <div className="pd-inner">
              <SectionHead title="Description" />
              <ProductDescription text={detailData?.description} safeHtml={detailData?.safeHtml} fallbackTitle={detailData?.name} />
              {detailData?.hasVideo && detailData?.videoUrl && (
                <div className="pd-video-wrap">
                  <video src={detailData.videoUrl} controls preload="metadata" className="pd-video" aria-label="Vidéo de présentation produit" />
                </div>
              )}
            </div>
          </section>

          {/* 2 · Livraison (uniquement avec du contenu réel) */}
          {hasDelivery && (
            <section ref={deliveryRef} className="pd-band pd-band--tint" id="delivery">
              <div className="pd-inner">
                <SectionHead title={importInfo ? "Du fournisseur jusqu'à chez vous" : 'Livraison'} />

                {importInfo && (
                  <>
                    <ImportRoute steps={routeSteps} />
                    <p className="pd-band__foot">
                      Frais d&apos;importation et taxes calculés au checkout.{isFragile ? ' Catégorie d\'expédition : fragile.' : ''}
                    </p>
                  </>
                )}

                {shippingText && <div className="pd-narrow"><p className="pd-prose">{shippingText}</p></div>}

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

          {/* 3 · Fiche technique : seulement ce qui n'est pas déjà affiché en haut */}
          {showSpecsBand && (
            <section ref={specsRef} className="pd-band pd-band--surface" id="specs">
              <div className="pd-inner">
                <SectionHead title="Fiche technique" lead="Les autres informations détaillées du produit." />
                <div className={`pd-specgrid${specCardCount === 1 ? ' pd-specgrid--single' : ''}`}>
                  {restGroups.map((g) => (
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
              </div>
            </section>
          )}

          {/* 4 · Gros et conditionnement */}
          {hasWholesaleTab && (
            <section ref={wholesaleRef} className="pd-band" id="wholesale">
              <div className="pd-inner">
                <SectionHead
                  eyebrow="Achat en volume"
                  title="Gros et conditionnement"
                  lead="Conditions de commande et dimensions des colis."
                />
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
              </div>
            </section>
          )}

          {/* 5 · Avis (désactivé)
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
          */}

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
        </div>
      </main>

      {/* Barre mobile uniquement */}
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