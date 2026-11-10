import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, ShoppingCart, Minus, Plus, Package,
  Truck, RefreshCw, ShieldCheck, Heart, X, Check, CheckCircle2,
  Factory, Anchor, Ship, MapPin, Maximize2, CreditCard, Zap,
} from 'lucide-react';
import { useProduct, useProductReviews, useSimilarProducts } from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import { getVendorDeliveryZonesByVendor } from '../api';
import { resolveImageUrl } from '../utils/imageUrl';
import { formatCFA, calcDiscountPercent } from '../utils/formatPrice';
import { extractAlibabaDisplayInfo, sanitizeProductForDisplay } from '../utils/publicProduct';
import { getCardDisplayPrice, snapQuantity } from '../utils/importMoq';
import { useCart } from '../context/CartContext';
import { toast } from '../utils/toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductRating from '../components/product/ProductRating';
import ProductVariants from '../components/product/detail/ProductVariants';
import ProductReviewsSection from '../components/product/detail/ProductReviewsSection';
import {
  extractAllVariantAttributes,
  findBestMatchingVariant,
} from '../utils/variantSelection';
import { buildProductDetailData } from '../utils/buildProductDetailData';
import './ProductDetail.css';

/* ════════════════════════════════════════════════════════════════════
   Données fournisseur (keyAttributes Alibaba)
   Règle : aucune donnée inventée. Identité du fournisseur masquée.
   ════════════════════════════════════════════════════════════════════ */
const GROUP_FR = {
  'Industry-specific attributes': 'Spécifications',
  'Other attributes': 'Fabrication & Matériaux',
  'Packaging and delivery': 'Colis & Expédition',
};
const ATTR_FR_MAP = {
  'herb & spice tools type': 'Type de produit',
  material: 'Matériau',
  feature: 'Points forts',
  'place of origin': 'Origine',
  'model number': 'Référence modèle',
  size: 'Dimensions',
  capacity: 'Capacité',
  packing: 'Emballage',
  style: 'Style',
  port: "Port d'embarquement",
  'selling units:': 'Unité de vente',
  'single package size:': 'Dimensions colis',
  'single gross weight:': 'Poids brut unitaire',
  connectors: 'Connecteurs',
  function: 'Fonctionnalités',
  type: 'Type de produit',
  'usb type': 'Connectique USB',
  use: 'Appareils compatibles',
  application: 'Usage / Compatibilité',
  conductor: 'Conducteur interne',
  jacket: 'Gaine extérieure',
  'private mold': "Moule d'usine exclusif",
  shielding: 'Blindage',
  moq: "Quantité minimale (MOQ)",
  warranty: 'Garantie',
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

/** Coerce une valeur d'attribut qui peut être string | {value:...} | {attr_value:...} */
function coerceAttrVal(raw) {
  if (raw == null) return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'object') {
    const v = raw.value ?? raw.attr_value ?? raw.attrValue ?? raw.name ?? raw.label ?? '';
    return String(v).trim();
  }
  return String(raw).trim();
}

const frValue = (v) => {
  const s = coerceAttrVal(v);
  const lower = s.toLowerCase();
  if (VALUE_FR_MAP[lower]) return VALUE_FR_MAP[lower];
  return s
    .replace(/Borosilicate Gal?ss/i, 'verre borosilicaté')
    .replace(/(\d)\s*(cm|mm)\b/gi, '$1 $2')
    .replace(/\s*x\s*/gi, ' × ');
};

const fmtNum = (n, d = 1) => Number(n).toLocaleString('fr-FR', { maximumFractionDigits: d });
const fmtWeight = (raw) => {
  const s = coerceAttrVal(raw);
  const m = /([\d.,]+)\s*(kg|g)\b/i.exec(s);
  if (!m) return s;
  const n = parseFloat(m[1].replace(',', '.'));
  const kg = m[2].toLowerCase() === 'kg' ? n : n / 1000;
  return kg < 1 ? `${Math.round(kg * 1000)} g` : `${fmtNum(kg, 2)} kg`;
};
const titleCase = (s) => String(s || '').toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

function extractSupplierData(product) {
  const src = product?.alibabaKeyAttributes
    ?? product?.keyAttributes
    ?? product?.alibaba?.keyAttributes
    ?? product?.rawPayload?.result_data?.keyAttributes
    ?? product?.normalized?.rawAlibabaData?.result_data?.keyAttributes
    ?? product?.rawAlibabaData?.result_data?.keyAttributes
    ?? product?.rawAlibabaData?.keyAttributes
    ?? product?.pricing?.raw?.keyAttributes
    ?? product?.rawSections?.keyAttributes;
  let raw = Array.isArray(src?.attributes) ? src.attributes : (Array.isArray(src) ? src : []);

  if (raw.length === 0 && Array.isArray(product?.specifications) && product.specifications.length > 0) {
    raw = [{
      type: 'Spécifications techniques',
      attributes: product.specifications.map((s) => ({
        name: s.key,
        value: coerceAttrVal(s.value),
        values: [{ value: coerceAttrVal(s.value) }],
      })),
    }];
  } else if (raw.length === 0 && Array.isArray(product?.attributes) && product.attributes.length > 0) {
    raw = [{
      type: 'Caractéristiques',
      attributes: product.attributes.map((a) => {
        const name = a.attribute_name || a.attr_name_desc || a.name || a.key || '';
        const value = coerceAttrVal(a.attribute_value ?? a.attr_value_desc ?? a.value ?? a);
        return { name, value, values: [{ value }] };
      }).filter((x) => x.name && x.value),
    }];
  }

  const flat = {};
  raw.forEach((g) => (g.attributes || []).forEach((a) => {
    const vals = (a.values || []).map((v) => coerceAttrVal(v)).filter(Boolean);
    if (!vals.length && a?.value) vals.push(coerceAttrVal(a.value));
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
        const valStr = (a.values || [])
          .map((v) => coerceAttrVal(v))
          .filter((v) => v && v !== 'Stocked')
          .map(frValue)
          .join(', ') || (a.value ? frValue(a.value) : '');
        return { key: label, value: valStr };
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
  const cartonRaw = coerceAttrVal(flat.Measurement?.[0] || flat.measurement?.[0] || product?.packaging?.packageSize || '');
  const cm = /([\d.]+)\s*x\s*([\d.]+)\s*x\s*([\d.]+)\s*cm\s*\/\s*(\d+)\s*pcs/i.exec(cartonRaw);
  const unitWeightRaw = coerceAttrVal(
    flat['Single gross weight:']?.[0]
    || flat['single gross weight:']?.[0]
    || flat['single gross weight']?.[0]
    || (product?.weight ? `${product.weight} kg` : '')
    || (product?.packaging?.weight ? `${product.packaging.weight} kg` : '')
    || ''
  );
  const unitWeightKg = (() => {
    const m = /([\d.,]+)\s*(kg|g)\b/i.exec(unitWeightRaw);
    if (!m) return product?.weight ? Number(product.weight) : null;
    const n = parseFloat(m[1].replace(',', '.'));
    return m[2].toLowerCase() === 'kg' ? n : n / 1000;
  })();
  const carton = cm ? {
    dims: `${cm[1]} × ${cm[2]} × ${cm[3]} cm`,
    pcs: Number(cm[4]),
    volumeM3: (cm[1] * cm[2] * cm[3]) / 1e6,
    grossKg: unitWeightKg ? unitWeightKg * Number(cm[4]) : null,
  } : null;

  const portRaw = coerceAttrVal(flat.Port?.[0] || flat.port?.[0] || '');

  return {
    groups,
    carton,
    capacity: one('Capacity'),
    material: one('Material') || product?.material || '',
    size: one('Size') || product?.packaging?.dimensions || '',
    model: one('Model Number') || product?.modelNumber || product?.rawPayload?.result_data?.mode_id || '',
    packing: one('Packing') || product?.packaging?.unit || 'Pièce',
    origin: one('Place of Origin') || product?.shippingOrigin?.countryName || product?.supplier?.shipFromCountryName || 'Chine',
    port: portRaw ? titleCase(portRaw.replace(/^FOB\s*/i, '')) : '',
    unitWeight: unitWeightRaw ? fmtWeight(unitWeightRaw) : (product?.weight ? `${product.weight} kg` : ''),
    unitPackage: one('Single package size:') || one('single package size') || product?.packaging?.packageSize || '',
  };
}

const num = (v) => (v == null || v === '' ? null : (Number.isFinite(Number(v)) ? Number(v) : null));
const tierMin = (t) => num(t?.minQty ?? t?.minQuantity ?? t?.min) ?? num((String(t?.label || '').match(/\d+/) || [])[0]);

/* ── Composants utilitaires ─────────────────────────────────── */
function SectionHead({ eyebrow, title, lead }) {
  return (
    <header className="pd-section-head">
      {eyebrow && <p className="pd-section-head__eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {lead && <p className="pd-section-head__lead">{lead}</p>}
    </header>
  );
}

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

function ImportRoute({ steps = [] }) {
  return (
    <ol className="pd-route" aria-label="Parcours de la commande">
      {steps.map((st) => (
        <li key={st.title} className="pd-route__step">
          <span className="pd-route__node"><st.icon size={16} /></span>
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
      const val = coerceAttrVal(attr.value ?? attr.attr_value ?? attr);
      if (val && !map[attr.name].find((v) => v.value === val)) {
        map[attr.name].push({ value: val, image: attr.image });
      }
    }));
    return Object.entries(map);
  }, [skus]);
  if (!groups.length) return null;
  return (
    <div className="pd-sku-attrs">
      {groups.map(([name, values]) => (
        <div key={name} className="pd-sku-attr-group">
          <span className="pd-sku-attr-group__label">{name}</span>
          <div className="pd-sku-attr-values">
            {values.map((v, i) => (
              <span key={i} className="pd-sku-attr-chip">
                {v.image && <img src={v.image} alt={v.value} loading="lazy" referrerPolicy="no-referrer" />}
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

/* ── Galerie ──────────────────────────────────────────────────── */
function ProductGallery({ images = [], name, videoUrl, wished = false, onToggleWish }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [activeMedia, setActiveMedia] = useState('image');
  const [broken, setBroken] = useState(() => new Set());

  const slides = useMemo(() => images.filter(Boolean).filter((src) => !broken.has(src)), [images, broken]);
  const current = slides[index] || null;
  const stripRef = useRef(null);
  const galleryKey = images.join('|');

  useEffect(() => { setBroken(new Set()); setIndex(0); setActiveMedia('image'); }, [galleryKey]);
  useEffect(() => {
    const strip = stripRef.current;
    const el = strip?.querySelector('.is-on');
    if (!strip || !el) return;
    strip.scrollTo({ left: el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2, top: el.offsetTop - (strip.clientHeight - el.offsetHeight) / 2, behavior: 'smooth' });
  }, [index, activeMedia, slides.length]);
  useEffect(() => { setIndex((i) => (slides.length ? Math.min(i, slides.length - 1) : 0)); }, [slides.length]);

  const markBroken = useCallback((src) => {
    if (!src) return;
    setBroken((prev) => { if (prev.has(src)) return prev; const next = new Set(prev); next.add(src); return next; });
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
            <div className="pd-gallery__video-stage">
              <video src={videoUrl} controls autoPlay className="pd-gallery__video-player" />
            </div>
          ) : current ? (
            <button type="button" className="pd-gallery__zoom-hit" onClick={() => setLightbox(true)} aria-label="Voir en grand">
              <img src={current} alt={name || 'Produit'} className="pd-gallery__img" decoding="async" referrerPolicy="no-referrer" onError={() => markBroken(current)} />
            </button>
          ) : (
            <div className="pd-gallery__empty"><Package size={40} strokeWidth={1.25} /></div>
          )}

          <div className="pd-gallery__fabs">
            {onToggleWish && (
              <button type="button" className={`pd-gallery__fab ${wished ? 'is-on' : ''}`} onClick={onToggleWish} aria-label="Favoris" aria-pressed={wished}>
                <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
              </button>
            )}
            {current && activeMedia === 'image' && (
              <button type="button" className="pd-gallery__fab" onClick={() => setLightbox(true)} aria-label="Agrandir">
                <Maximize2 size={16} />
              </button>
            )}
          </div>

          {activeMedia === 'image' && slides.length > 1 && (
            <>
              <span className="pd-gallery__count">{index + 1} / {slides.length}</span>
              <button type="button" className="pd-gallery__arrow pd-gallery__arrow--prev" onClick={() => go(-1)} aria-label="Précédent"><ChevronLeft size={18} /></button>
              <button type="button" className="pd-gallery__arrow pd-gallery__arrow--next" onClick={() => go(1)} aria-label="Suivant"><ChevronRight size={18} /></button>
            </>
          )}
        </div>

        {(slides.length > 1 || videoUrl) && (
          <div ref={stripRef} className="pd-gallery__strip" role="tablist" aria-label="Miniatures">
            {videoUrl && (
              <button
                type="button" role="tab" aria-selected={activeMedia === 'video'}
                className={`pd-gallery__thumb pd-gallery__thumb--video ${activeMedia === 'video' ? 'is-on' : ''}`}
                onClick={() => setActiveMedia('video')} title="Vidéo produit"
              >▶</button>
            )}
            {slides.map((src, i) => (
              <button
                key={`${i}-${src}`} type="button" role="tab"
                aria-selected={activeMedia === 'image' && i === index}
                className={`pd-gallery__thumb ${activeMedia === 'image' && i === index ? 'is-on' : ''}`}
                onClick={() => { setActiveMedia('image'); setIndex(i); }}
              >
                <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => markBroken(src)} />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && current && (
        <div className="pd-lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(false)}>
          <button type="button" className="pd-lightbox__close" onClick={() => setLightbox(false)} aria-label="Fermer"><X size={20} /></button>
          <div className="pd-lightbox__frame" onClick={(e) => e.stopPropagation()}>
            {slides.length > 1 && <button type="button" className="pd-lightbox__nav" onClick={() => go(-1)} aria-label="Précédent"><ChevronLeft size={26} /></button>}
            <img src={current} alt={name} className="pd-lightbox__img" referrerPolicy="no-referrer" onError={() => markBroken(current)} />
            {slides.length > 1 && <button type="button" className="pd-lightbox__nav" onClick={() => go(1)} aria-label="Suivant"><ChevronRight size={26} /></button>}
          </div>
          {slides.length > 1 && <p className="pd-lightbox__count">{index + 1} / {slides.length}</p>}
        </div>
      )}
    </>
  );
}

/* ── ReadMore / Description ──────────────────────────────────── */
function ReadMore({ text, safeHtml }) {
  const [open, setOpen] = useState(false);
  if (!text && !safeHtml) return null;
  const long = (text?.length > 400) || (safeHtml?.length > 500);
  return (
    <div className="pd-prose">
      {safeHtml ? (
        <div className={`pd-prose__html ${!open && long ? 'pd-prose--fold' : ''}`} dangerouslySetInnerHTML={{ __html: safeHtml }} />
      ) : (
        <p className={!open && long ? 'pd-prose--fold' : undefined} style={{ whiteSpace: 'pre-line' }}>{text}</p>
      )}
      {long && (
        <button type="button" className="pd-read-more" onClick={() => setOpen((v) => !v)}>
          {open ? '← Réduire' : 'Lire la suite →'}
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

  const cleanHtml = useMemo(() =>
    faqs.length > 0 ? (safeHtml || '').replace(/<h[23][^>]*>\s*FAQs?\s*<\/h[23]>[\s\S]*$/i, '') : (safeHtml || ''),
    [safeHtml, faqs.length]
  );
  const cleanText = useMemo(() =>
    faqs.length > 0 ? String(text || '').split(/\s+FAQ\s+Q\s*:/i)[0].trim() : text,
    [text, faqs.length]
  );

  const hasContent = cleanText || cleanHtml;
  if (!hasContent) return <p style={{ color: 'var(--ink-mute)', fontStyle: 'italic' }}>Description non disponible.</p>;

  return (
    <div>
      <ReadMore text={cleanText} safeHtml={cleanHtml || safeHtml} />
      {faqs.length > 0 && (
        <div className="pd-faq">
          <h3 className="pd-faq__title">Questions fréquentes</h3>
          {faqs.map((f, i) => (
            <details key={i} className="pd-faq__item" open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
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

/* ════════════════════════════════════════════════════════════════════
   PAGE PRINCIPALE
   ════════════════════════════════════════════════════════════════════ */
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
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [wished, setWished] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [sellerZones, setSellerZones] = useState([]);

  const displayProduct = useMemo(() => sanitizeProductForDisplay(product), [product]);
  const detailData = useMemo(() => buildProductDetailData(displayProduct || product), [displayProduct, product]);
  const extras = useMemo(() => extractSupplierData(product), [product]);

  useEffect(() => {
    if (detailData?.name) document.title = `${detailData.name} | Dango Import`;
    else if (!isLoading && !product) document.title = 'Produit introuvable | Dango Import';
  }, [detailData?.name, isLoading, product]);

  useEffect(() => {
    setSelectedVariantIndex(0);
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedAttributes({});
  }, [id]);

  const productQtyTarget = useMemo(() => {
    if (!product) return 1;
    return snapQuantity(product, product.minimumOrderQuantity || 1);
  }, [product, product?._id, product?.minimumOrderQuantity, product?.variants?.length]);

  useEffect(() => { if (product) setQty(productQtyTarget); }, [productQtyTarget, product]);

  const variants = useMemo(
    () => (Array.isArray(detailData?.variants) && detailData.variants.length ? detailData.variants : (Array.isArray(product?.variants) ? product.variants : [])),
    [detailData?.variants, product?.variants],
  );

  // Initialisation synchronisée des attributs et du variant sélectionné
  useEffect(() => {
    if (!variants || variants.length === 0) return;
    const defaultIndex = variants.findIndex((v) => v.isDefault);
    const initialIndex = defaultIndex >= 0 ? defaultIndex : 0;
    setSelectedVariantIndex(initialIndex);
    const initialVariant = variants[initialIndex];
    if (initialVariant) {
      const attrs = extractAllVariantAttributes(initialVariant);
      setSelectedAttributes(attrs);
      if (attrs.color) setSelectedColor(attrs.color);
      if (attrs.size) setSelectedSize(attrs.size);
    }
  }, [id, variants.length]);

  // Sélection d'un attribut (couleur, taille, etc.)
  const handleSelectAttribute = useCallback((key, value) => {
    setSelectedAttributes((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'color') setSelectedColor(value);
      if (key === 'size') setSelectedSize(value);

      const matchIdx = findBestMatchingVariant(variants, next);
      if (matchIdx >= 0) {
        setSelectedVariantIndex(matchIdx);
        const matched = variants[matchIdx];
        const allAttrs = extractAllVariantAttributes(matched);
        return { ...next, ...allAttrs };
      }
      return next;
    });
  }, [variants]);

  // Sélection directe d'un variant par index
  const handleSelectVariant = useCallback((index) => {
    if (index >= 0 && index < variants.length) {
      setSelectedVariantIndex(index);
      const v = variants[index];
      if (v) {
        const allAttrs = extractAllVariantAttributes(v);
        setSelectedAttributes(allAttrs);
        if (allAttrs.color) setSelectedColor(allAttrs.color);
        if (allAttrs.size) setSelectedSize(allAttrs.size);
      }
    }
  }, [variants]);

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
  const importDaysLabel = detailData?.importDaysLabel || (estDays?.min && estDays?.max ? `${estDays.min} à ${estDays.max} jours` : '');
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

  /* Specs : top 6 en colonne + reste dans la fiche technique */
  const { topSpecs, restGroups } = useMemo(() => {
    const norm = (k) => String(k).toLowerCase().replace(/[^a-zà-ÿ0-9]/g, '');
    const seenKeys = new Set();
    const seenVals = [];
    const groups = [];
    const push = (title, rows) => {
      const kept = rows.filter((r) => {
        const k = norm(r.key);
        const v = norm(r.value);
        if (!k || !v || seenKeys.has(k)) return false;
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
  }, [detailData?.specifications, extras.groups]);

  const restCount = restGroups.reduce((n, g) => n + g.rows.length, 0);
  const hasSkuOptions = Boolean(isAlibaba && alibabaInfo?.hasSkus);
  const specCardCount = restGroups.length + (hasSkuOptions ? 1 : 0);
  const showSpecsBand = restCount > 0 || hasSkuOptions;

  /* Conditionnement */
  const wh = detailData?.wholesale;
  const pk = detailData?.packaging;
  const packRows = [
    (wh?.minOrderQuantity > 1 || moqRules.moq > 1) && { key: 'Quantité minimum', value: `${wh?.minOrderQuantity || moqRules.moq} ${wh?.unitType || 'unités'}` },
    moqRules.increment > 1 && { key: 'Incrément', value: `par ${moqRules.increment}` },
    (moqRules.soldAsLot || moqRules.packSize > 1) && { key: 'Vendu par lot', value: `${moqRules.packSize} unités` },
    extras.unitPackage && { key: 'Colis unitaire', value: extras.unitPackage },
    (extras.unitWeight || pk?.weightKg) && { key: 'Poids brut unitaire', value: extras.unitWeight || `${pk.weightKg} kg` },
    pk?.packageSize && !extras.unitPackage && { key: 'Dimensions colis', value: pk.packageSize },
    extras.carton && { key: 'Pièces / carton', value: `${extras.carton.pcs}` },
    extras.carton && { key: 'Dimensions carton', value: extras.carton.dims },
    extras.carton && { key: 'Volume carton', value: `${fmtNum(extras.carton.volumeM3, 3)} m³` },
    extras.carton?.grossKg && { key: 'Poids carton complet', value: `≈ ${fmtNum(extras.carton.grossKg, 1)} kg` },
    pk?.supplyCapacity && { key: 'Capacité fournisseur', value: pk.supplyCapacity },
    wh?.handlingTimeDays && { key: 'Préparation usine', value: `${wh.handlingTimeDays} jour(s)` },
  ].filter(Boolean);

  const tiers = useMemo(() => detailData?.publicPriceTiers || [], [detailData?.publicPriceTiers]);
  const hasPeriods = wh?.deliverPeriods?.length > 0;
  const hasWholesaleTab = packRows.length > 0 || hasPeriods;
  const isImport = isDropship || isAlibaba;
  const importInfo = isImport && Boolean(originLabel || importDaysLabel || extras.port);
  const shippingText = !isImport && hasShippingInfo ? detailData.shippingInfo : '';
  const hasDelivery = importInfo || Boolean(shippingText) || deliveryZones.length > 0 || hasWarranty;
  const routeSteps = [
    { icon: Factory, title: 'Fabrication', text: wh?.handlingTimeDays ? `${originLabel || 'Chine'} · ${wh.handlingTimeDays}j de préparation` : (originLabel || 'Chine') },
    extras.port && { icon: Anchor, title: 'Embarquement', text: extras.port },
    { icon: Ship, title: 'Transit international', text: importDaysLabel || 'Selon destination' },
    { icon: MapPin, title: 'Livraison', text: 'Lomé et Cotonou · Domicile ou agence' },
  ].filter(Boolean);

  const activeTier = useMemo(() => {
    let found = null;
    tiers.forEach((t) => { const m = tierMin(t); if (m != null && qty >= m) found = t; });
    return found;
  }, [tiers, qty]);
  const unitNow = tiers.length ? num(activeTier?.unitPrice) : num(displayPrice);
  const subtotal = unitNow != null ? unitNow * qty : null;

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

  const scrollTo = useCallback((ref) => {
    const el = ref.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' });
  }, []);

  const stockLabel = detailData?.stockStatusLabel || (
    !inStock ? 'Rupture de stock'
      : isAlibaba ? 'Sur commande · Fabrication directe usine'
        : isDropship ? (stock > 0 && stock <= 5 ? `Stock limité, ${stock} restants` : 'En stock')
          : isLowStock ? `Stock limité, ${stock} restants` : `${stock} en stock`
  );

  /* ── Skeleton ── */
  if (isLoading) {
    return (
      <div className="pd-page">
        <Header />
        <div className="pd-wrap pd-wrap--top">
          <div className="pd-skeleton">
            <div className="pd-skeleton__media" />
            <div className="pd-skeleton__info">
              <div className="pd-skeleton__line pd-skeleton__line--sm" />
              <div className="pd-skeleton__line pd-skeleton__line--lg" />
              <div className="pd-skeleton__line pd-skeleton__line--xl" />
              <div className="pd-skeleton__line" />
              <div className="pd-skeleton__line" style={{ width: '70%' }} />
              <div className="pd-skeleton__line pd-skeleton__line--btn" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Erreur ── */
  if (isError || !product) {
    return (
      <div className="pd-page">
        <Header />
        <div className="pd-empty">
          <div className="pd-empty__icon"><Package size={32} strokeWidth={1.25} /></div>
          <h1>Produit introuvable</h1>
          <p>Ce produit n&apos;est plus disponible ou le lien n&apos;est pas valide. Vérifiez que le serveur est bien démarré.</p>
          <div className="pd-empty__actions">
            <Link to="/shopping" className="pd-btn pd-btn--primary"><ShoppingCart size={16} /> Retour à la boutique</Link>
            <button type="button" className="pd-btn pd-btn--ghost" onClick={() => window.location.reload()}>Réessayer</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryHref = detailData?.category ? `/category/${encodeURIComponent(String(detailData.category).toLowerCase())}` : null;

  return (
    <div className="pd-page">
      <Header />

      <main className="pd-main">

        {/* ════ HAUT : galerie | info | buycard ════ */}
        <div className="pd-wrap pd-wrap--top">

          {/* Fil d'Ariane */}
          <nav className="pd-crumb" aria-label="Fil d'Ariane">
            <Link to="/">Accueil</Link>
            <span className="pd-crumb__sep">/</span>
            {categoryHref && (
              <>
                <Link to={categoryHref}>{detailData.category}</Link>
                <span className="pd-crumb__sep">/</span>
              </>
            )}
            <span className="pd-crumb__current">{detailData?.name}</span>
          </nav>

          <div className="pd-layout">

            {/* ── Galerie ── */}
            <div className="pd-layout__media">
              <ProductGallery
                images={images}
                name={detailData?.name}
                videoUrl={detailData?.videoUrl}
                wished={wished}
                onToggleWish={() => setWished((w) => !w)}
              />
            </div>

            {/* ── Colonne info ── */}
            <div className="pd-layout__info pd-info">

              {/* Badges */}
              <div className="pd-badges">
                {originCountry && isAlibaba && (
                  <span className="pd-badge pd-badge--import"><Ship size={11} /> Importé de {originCountry}</span>
                )}
                {detailData?.hasFactorySupplier && isAlibaba && (
                  <span className="pd-badge pd-badge--factory"><Factory size={11} /> Direct usine</span>
                )}
                {hasPromo && <span className="pd-badge pd-badge--promo"><Zap size={11} /> −{discount}%</span>}
                {detailData?.tagLabel && !hasPromo && <span className="pd-badge">{detailData.tagLabel}</span>}
                {isFragile && <span className="pd-badge">Fragile</span>}
              </div>

              {/* Titre */}
              <h1 className={`pd-title${(detailData?.name?.length || 0) > 72 ? ' pd-title--long' : ''}`}>
                {detailData?.name}
              </h1>

              {/* Meta : marque, réf, vendus, avis */}
              <div className="pd-meta-row">
                {detailData?.brand && (
                  <span className="pd-meta-chip">
                    <strong>{detailData.brand}</strong>
                  </span>
                )}
                {extras.model && (
                  <span className="pd-meta-chip pd-meta-chip--sep">Réf. {extras.model}</span>
                )}
                {soldCount > 0 && (
                  <span className="pd-meta-chip pd-meta-chip--sep">{soldCount} vendus</span>
                )}
                {reviewCount > 0
                  ? <span className="pd-meta-chip pd-meta-chip--sep"><ProductRating rating={rating} reviewCount={reviewCount} size="sm" /></span>
                  : <span className="pd-meta-chip pd-meta-chip--sep" style={{ color: 'var(--ink-mute)' }}>Pas encore d&apos;avis</span>
                }
              </div>

              {/* Zone prix */}
              <div className="pd-pricezone">
                {tiers.length > 0 ? (
                  <VolumePricingTable tiers={tiers} qty={qty} onPick={(m) => setQty(snapQuantity(product, m))} />
                ) : (
                  <div className="pd-price">
                    <span className="pd-price__now">{formatCFA(displayPrice)}</span>
                    {hasPromo && <span className="pd-price__was">{formatCFA(price)}</span>}
                    <span className="pd-price__unit">/ unité · TTC</span>
                  </div>
                )}
                <p className={`pd-stock ${!inStock ? 'pd-stock--out' : isLowStock ? 'pd-stock--low' : ''}`}>
                  {stockLabel}
                </p>
              </div>

              {/* Variantes */}
              <ProductVariants
                product={product ? { ...product, variants, isAlibaba } : product}
                selectedVariantIndex={selectedVariantIndex}
                onSelectVariant={handleSelectVariant}
                selectedAttributes={selectedAttributes}
                onSelectAttribute={handleSelectAttribute}
                selectedColor={selectedColor}
                onSelectColor={(c) => handleSelectAttribute('color', c)}
                selectedSize={selectedSize}
                onSelectSize={(s) => handleSelectAttribute('size', s)}
              />

              {/* Quantité */}
              {inStock && (
                <div className="pd-block">
                  <div className="pd-qty-row">
                    <div>
                      <p className="pd-qty-label">Quantité</p>
                      {moqRules.moq > 1 && (
                        <p className="pd-qty-hint">
                          Minimum {moqRules.moq} unités{moqRules.packSize > 1 ? ` · Par lot de ${moqRules.packSize}` : ''}
                        </p>
                      )}
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

              {/* Top 6 caractéristiques clés */}
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
                    <button type="button" className="pd-keyspecs__more" onClick={() => scrollTo(specsRef)}>
                      Voir la fiche technique complète →
                    </button>
                  )}
                </section>
              )}
            </div>

            {/* ── Buy card ── */}
            <aside className="pd-buycard" aria-label="Résumé de la commande">
              <div className="pd-buycard__head">
                <p className="pd-buycard__title">Votre commande</p>
                <span className="pd-buycard__price-big">{subtotal != null ? formatCFA(subtotal) : (unitNow != null ? formatCFA(unitNow) : '—')}</span>
                {hasPromo && <s className="pd-buycard__price-was">{formatCFA(price * qty)}</s>}
              </div>

              <div className="pd-buycard__body">
                {importDaysLabel && isImport && (
                  <div className="pd-buycard__eta">
                    <Ship size={13} />
                    Livraison estimée : {importDaysLabel}
                  </div>
                )}

                <dl className="pd-sum">
                  <div className="pd-sum__row">
                    <dt>Sous-total article</dt>
                    <dd>{subtotal != null ? formatCFA(subtotal) : '—'}</dd>
                  </div>
                  <div className="pd-sum__row">
                    <dt>Frais d&apos;importation</dt>
                    <dd className="pd-sum__muted">Au checkout</dd>
                  </div>
                  <div className="pd-sum__row pd-sum__sep">
                    <dt>Total estimé</dt>
                    <dd>{subtotal != null ? formatCFA(subtotal) : '—'}</dd>
                  </div>
                </dl>

                <div className="pd-buycard__actions">
                  <button
                    type="button"
                    className={`pd-btn pd-btn--primary ${addedAnim ? 'is-done' : ''}`}
                    onClick={handleAddToCart}
                    disabled={!inStock}
                  >
                    {addedAnim
                      ? <><Check size={16} /> Ajouté !</>
                      : <><ShoppingCart size={16} /> {isInCart ? 'Encore au panier' : 'Ajouter au panier'}</>
                    }
                  </button>
                  <button type="button" className="pd-btn pd-btn--ghost" onClick={handleBuyNow} disabled={!inStock}>
                    Acheter maintenant
                  </button>
                </div>

                <ul className="pd-trust">
                  <li><CreditCard size={14} />Paiement mobile sécurisé (T-Money, Moov, Flooz, carte)</li>
                  <li><ShieldCheck size={14} />Contrôle qualité Dango Import avant expédition</li>
                  <li><RefreshCw size={14} />Retours et conformité garantis</li>
                  <li><Truck size={14} />{freeShippingZone ? 'Livraison gratuite sur certaines zones' : 'Livraison au Togo et au Bénin'}</li>
                </ul>
              </div>
            </aside>

          </div>{/* /pd-layout */}
        </div>{/* /pd-wrap--top */}

        {/* ════════════ BAS DE PAGE ════════════ */}
        <div className="pd-landing">

          {/* Navigation tabs */}
          <nav className="pd-tabs" aria-label="Sections du produit">
            <div className="pd-tabs__inner">
              <button type="button" className="pd-tabs__item" onClick={() => scrollTo(descRef)}>Description</button>
              {hasDelivery && <button type="button" className="pd-tabs__item" onClick={() => scrollTo(deliveryRef)}>Livraison</button>}
              {showSpecsBand && <button type="button" className="pd-tabs__item" onClick={() => scrollTo(specsRef)}>Fiche technique</button>}
              {hasWholesaleTab && <button type="button" className="pd-tabs__item" onClick={() => scrollTo(wholesaleRef)}>Conditionnement</button>}
              <button type="button" className="pd-tabs__item" onClick={() => scrollTo(reviewsRef)}>Avis</button>
            </div>
          </nav>

          {/* 1 · Description */}
          <section ref={descRef} className="pd-band" id="description">
            <div className="pd-inner pd-inner--narrow">
              <SectionHead title="Description du produit" />
              <ProductDescription
                text={detailData?.description}
                safeHtml={detailData?.safeHtml}
                fallbackTitle={detailData?.name}
              />
              {detailData?.hasVideo && detailData?.videoUrl && (
                <div className="pd-video-wrap">
                  <video src={detailData.videoUrl} controls preload="metadata" className="pd-video" aria-label="Vidéo de présentation" />
                </div>
              )}
            </div>
          </section>

          {/* 2 · Livraison */}
          {hasDelivery && (
            <section ref={deliveryRef} className="pd-band pd-band--warm" id="delivery">
              <div className="pd-inner">
                <SectionHead
                  eyebrow="Expédition & Import"
                  title={importInfo ? "Du fabricant jusqu'à vous" : 'Livraison'}
                />
                {importInfo && (
                  <>
                    <ImportRoute steps={routeSteps} />
                    <p className="pd-band__foot">
                      Frais d&apos;importation et taxes calculés au checkout.
                      {isFragile ? " Produit classé fragile — manutention spéciale." : ''}
                    </p>
                  </>
                )}
                {shippingText && (
                  <div className="pd-inner--narrow"><p className="pd-prose">{shippingText}</p></div>
                )}
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
                {hasWarranty && (
                  <p className="pd-warranty"><ShieldCheck size={14} /> Garantie : {detailData.warranty}</p>
                )}
              </div>
            </section>
          )}

          {/* 3 · Fiche technique */}
          {showSpecsBand && (
            <section ref={specsRef} className="pd-band pd-band--alt" id="specs">
              <div className="pd-inner">
                <SectionHead eyebrow="Données techniques" title="Fiche technique" lead="Informations détaillées fournies par le fabricant." />
                <div className={`pd-specgrid${specCardCount === 1 ? ' pd-specgrid--single' : ''}`}>
                  {restGroups.map((g) => (
                    <div key={g.title} className="pd-card">
                      <h3 className="pd-card__title">{g.title}</h3>
                      <Rows rows={g.rows} />
                    </div>
                  ))}
                  {hasSkuOptions && (
                    <div className="pd-card">
                      <h3 className="pd-card__title">Options disponibles</h3>
                      <AlibabaSkuAttributes skus={alibabaInfo.skus} />
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 4 · OEM / ODM */}
          {detailData?.customization?.available && (
            <section className="pd-band" id="customization">
              <div className="pd-inner pd-inner--mid">
                <SectionHead
                  eyebrow="Direct usine"
                  title="Personnalisation OEM & ODM"
                  lead="Commandez avec votre logo, vos couleurs ou un emballage sur-mesure."
                />
                <ul className="pd-custom">
                  {detailData.customization.options.map((opt, i) => (
                    <li key={i}><CheckCircle2 size={16} /><span>{opt}</span></li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* 5 · Conditionnement */}
          {hasWholesaleTab && (
            <section ref={wholesaleRef} className="pd-band pd-band--alt" id="packaging">
              <div className="pd-inner pd-inner--mid">
                <SectionHead
                  eyebrow="Professionnels & revendeurs"
                  title="Conditionnement & colisage"
                  lead="Données d'emballage et d'expédition fournies par le fabricant."
                />
                <div className="pd-specgrid pd-specgrid--single">
                  <div className="pd-card">
                    <Rows rows={packRows} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 6 · Présentation photos usine */}
          {detailData?.presentationImages?.length > 0 && (
            <section className="pd-band" id="presentation">
              <div className="pd-inner pd-inner--mid">
                <SectionHead eyebrow="En images" title="Présentation du produit" />
                <div className="pd-presentation">
                  {detailData.presentationImages.map((src, i) => (
                    <img key={i} src={src} alt={`${detailData.name} — visuel ${i + 1}`} loading="lazy" referrerPolicy="no-referrer" />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 7 · Avis clients */}
          <section ref={reviewsRef} className="pd-band pd-band--alt" id="reviews">
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

          {/* 8 · Produits similaires */}
          {similarProducts.length > 0 && (
            <section className="pd-band" id="similar">
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

        </div>{/* /pd-landing */}
      </main>

      {/* Barre mobile */}
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
