
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  ShoppingCart,
  Package,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import client from '../apiClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

import {
  getProductSellableStock,
  sanitizeProductForDisplay
} from '../utils/publicProduct';

import {
  getProductImage,
  getProductImages
} from '../utils/imageUrl';

import { getMoqRules } from '../utils/importMoq';
import { useToast } from '../components/ui/ToastProvider';
import './HomeNew.css';

import buynow from '../images/buy-removebg-preview.png';
import mobilemoney from '../images/mobilemoney-removebg-preview.png';
import livraison from '../images/livraison-removebg-preview.png';

const BANNER_IMAGES = {
  shopping: buynow,
  mobileMoney: mobilemoney,
  delivery: livraison
};

/* =========================================================
   STYLES
========================================================= */

const CSS = `
:root {
  --hn-orange: #ff6a00;
  --hn-dark: #171717;
  --hn-muted: #777;
}

.hn-page {
  min-height: 100vh;
  background: #fff;
  color: var(--hn-dark);
  -webkit-tap-highlight-color: transparent;
}

.hn-page button {
  font-family: inherit;
}

.hn-wrap {
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 28px;
}

/* =========================================================
   SLIDER DES BANNIÈRES
========================================================= */

.hn-banner-section {
  padding: 22px 0 12px;
  background: #fff;
}

.hn-slider {
  position: relative;
  width: 100%;
  height: 285px;
  overflow: hidden;
  border-radius: 16px;
  isolation: isolate;
}

.hn-slide {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  align-items: center;
  padding: 30px 55px;
  opacity: 0;
  visibility: hidden;
  transform: translateX(18px);
  transition:
    opacity .7s ease,
    transform .7s ease,
    visibility .7s ease;
}

.hn-slide.is-active {
  z-index: 2;
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

/* Couleurs des trois slides */

.hn-slide--orange {
  background: #fff0e5;
}

.hn-slide--blue {
  background: #e8f2ff;
}

.hn-slide--green {
  background: #e9f5ed;
}

/* Décoration */

.hn-slide::before {
  content: '';
  position: absolute;
  width: 390px;
  height: 390px;
  right: 17%;
  top: -245px;
  border-radius: 50%;
  background: rgba(255,255,255,.48);
  pointer-events: none;
}

.hn-slide::after {
  content: '';
  position: absolute;
  width: 240px;
  height: 240px;
  right: -80px;
  bottom: -155px;
  border-radius: 50%;
  background: rgba(255,255,255,.42);
  pointer-events: none;
}

.hn-slide__content {
  position: relative;
  z-index: 2;
  max-width: 590px;
}

.hn-slide__eyebrow {
  display: block;
  margin-bottom: 13px;
  color: var(--hn-orange);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.hn-slide--blue .hn-slide__eyebrow {
  color: #2465bd;
}

.hn-slide--green .hn-slide__eyebrow {
  color: #25804b;
}

.hn-slide__title {
  max-width: 570px;
  margin: 0;
  color: #171717;
  font-size: clamp(34px, 4vw, 53px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -.045em;
}

.hn-slide__title span {
  color: var(--hn-orange);
}

.hn-slide--blue .hn-slide__title span {
  color: #2465bd;
}

.hn-slide--green .hn-slide__title span {
  color: #25804b;
}

.hn-slide__description {
  max-width: 420px;
  margin: 15px 0 0;
  color: #555;
  font-size: 14px;
  line-height: 1.65;
}

.hn-slide__visual {
  position: relative;
  z-index: 1;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.hn-slide__image {
  display: block;
  width: 100%;
  max-width: 430px;
  height: 240px;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 14px 20px rgba(0,0,0,.08));
}

/* =========================================================
   POINTS DE NAVIGATION SOUS LE SLIDER
========================================================= */

.hn-slider__navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 13px;
}

.hn-slider__dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.hn-slider__dot {
  display: block;
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 20px;
  background: rgba(23, 23, 23, .20);
  cursor: pointer;
  transition:
    width .3s ease,
    background .3s ease,
    opacity .3s ease;
}

.hn-slider__dot:hover {
  background: rgba(23, 23, 23, .45);
}

.hn-slider__dot.is-active {
  width: 23px;
  background: rgba(23, 23, 23, .65);
}

/* =========================================================
   TITRES DES SECTIONS
========================================================= */

.hn-section {
  padding: 30px 0;
  scroll-margin-top: 110px;
}

.hn-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.hn-section__title {
  margin: 0;
  padding: 0;
  border: 0;
  color: #171717;
  font-size: clamp(22px, 2.5vw, 28px);
  font-weight: 850;
  line-height: 1.2;
  letter-spacing: -.035em;
}

.hn-section__count {
  color: #858585;
  font-size: 13px;
}

/* =========================================================
   GRILLE PRODUITS
========================================================= */

.hn-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 14px;
}

@media (min-width: 640px) {
  .hn-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px 18px;
  }
}

@media (min-width: 1024px) {
  .hn-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 26px 20px;
  }
}

/* =========================================================
   CARTE PRODUIT
========================================================= */

.hn-product {
  display: flex;
  min-width: 0;
  flex-direction: column;
  background: #fff;
  color: #171717;
  cursor: pointer;
}

.hn-product__visual {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background: #f6f6f6;
}

.hn-product__gallery {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}

.hn-product__gallery::-webkit-scrollbar {
  display: none;
}

.hn-product__image-wrap {
  display: flex;
  flex: 0 0 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 12px;
  scroll-snap-align: center;
}

.hn-product__image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform .3s ease;
}

@media (hover: hover) {
  .hn-product:hover .hn-product__image {
    transform: scale(1.045);
  }
}

.hn-product__placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #c7c7c7;
}

.hn-product__add {
  position: absolute;
  z-index: 4;
  right: 9px;
  bottom: 9px;
  display: flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 9px;
  background: var(--hn-orange);
  color: #fff;
  cursor: pointer;
  transition: .2s ease;
}

.hn-product__add:hover {
  background: #e85f00;
}

.hn-product__add:active {
  transform: scale(.94);
}

.hn-product__add.is-done {
  background: #171717;
}

.hn-product__arrow {
  position: absolute;
  z-index: 3;
  top: 50%;
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-top: -15px;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #171717;
  box-shadow: 0 2px 9px rgba(0,0,0,.12);
  cursor: pointer;
  opacity: 0;
  transition: opacity .2s ease;
}

.hn-product:hover .hn-product__arrow {
  opacity: 1;
}

.hn-product__arrow--left {
  left: 8px;
}

.hn-product__arrow--right {
  right: 8px;
}

.hn-product__dots {
  display: flex;
  min-height: 6px;
  justify-content: center;
  gap: 5px;
  margin-top: 8px;
}

.hn-product__dot {
  width: 6px;
  height: 6px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: #d8d8d8;
  cursor: pointer;
}

.hn-product__dot.is-active {
  width: 16px;
  background: var(--hn-orange);
}

.hn-product__name {
  display: -webkit-box;
  min-height: 39px;
  overflow: hidden;
  margin: 10px 2px 0;
  color: #171717;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.hn-product__price {
  margin: 5px 2px 0;
  color: #e85f00;
  font-size: 16px;
  font-weight: 900;
}

.hn-product__moq {
  margin: 3px 2px 0;
  color: #858585;
  font-size: 11px;
}

/* =========================================================
   CHARGEMENT
========================================================= */

@keyframes hnShimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.hn-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 9px;
  background: #eee;
}

.hn-skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255,255,255,.8),
    transparent
  );
  animation: hnShimmer 1.3s infinite;
}

.hn-progress {
  position: relative;
  height: 3px;
  overflow: hidden;
  margin-bottom: 18px;
  border-radius: 4px;
  background: #ffe6d5;
}

.hn-progress span {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 28%;
  border-radius: 4px;
  background: var(--hn-orange);
  animation: hnProgress 1.2s ease-in-out infinite;
}

@keyframes hnProgress {
  from { transform: translateX(-100%); }
  to { transform: translateX(380%); }
}

.hn-empty {
  padding: 65px 16px;
  color: #777;
  text-align: center;
}

.hn-empty strong {
  display: block;
  margin: 12px 0 6px;
  color: #171717;
  font-size: 18px;
}

.hn-reset {
  margin-top: 16px;
  padding: 11px 20px;
  border: 0;
  border-radius: 7px;
  background: var(--hn-orange);
  color: #fff;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
}

/* =========================================================
   TABLETTE ET RESPONSIVE INTERMÉDIAIRE
   Bannière de même hauteur, titre et image agrandis
========================================================= */

@media (min-width: 768px) and (max-width: 1023px) {
  .hn-slide {
    padding: 26px 34px;
    grid-template-columns: 1.05fr .95fr;
  }

  .hn-slide__title {
    font-size: clamp(39px, 5.5vw, 55px);
    line-height: 1.06;
  }

  .hn-slide__image {
    width: 115%;
    max-width: 410px;
    height: 235px;
  }
}

/* =========================================================
   TABLETTE LARGE
========================================================= */

@media (min-width: 1024px) and (max-width: 1199px) {
  .hn-slide__title {
    font-size: clamp(43px, 4.5vw, 56px);
  }

  .hn-slide__image {
    width: 110%;
    max-width: 460px;
    height: 255px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 767px) {
  .hn-page {
    padding-bottom: calc(64px + env(safe-area-inset-bottom));
  }

  .hn-wrap {
    padding: 0 15px;
  }

  .hn-banner-section {
    padding: 12px 0 0;
  }

  .hn-slider {
    height: 170px;
    border-radius: 12px;
  }

  .hn-slide {
    grid-template-columns: 1.08fr .92fr;
    gap: 2px;
    padding: 15px 13px 15px 17px;
  }

  .hn-slide::before {
    width: 220px;
    height: 220px;
    right: 5%;
    top: -140px;
  }

  .hn-slide::after {
    width: 130px;
    height: 130px;
    right: -45px;
    bottom: -85px;
  }

  .hn-slide__content {
    min-width: 0;
  }

  .hn-slide__eyebrow {
    margin-bottom: 8px;
    font-size: 8px;
    letter-spacing: .09em;
  }

  .hn-slide__title {
    max-width: 230px;
    font-size: clamp(21px, 6vw, 29px);
    line-height: 1.12;
    letter-spacing: -.035em;
  }

  .hn-slide__description {
    display: none;
  }

  .hn-slide__visual {
    min-width: 0;
  }

  .hn-slide__image {
    width: 100%;
    max-width: 190px;
    height: 135px;
  }

  .hn-slider__navigation {
    padding-top: 11px;
  }

  .hn-slider__dots {
    gap: 7px;
  }

  .hn-slider__dot {
    width: 7px;
    height: 7px;
  }

  .hn-slider__dot.is-active {
    width: 20px;
  }

  .hn-section {
    padding: 24px 0;
  }

  .hn-section__header {
    margin-bottom: 15px;
  }

  .hn-section__title {
    font-size: 21px;
  }

  .hn-section__count {
    font-size: 11px;
  }

  .hn-grid {
    gap: 18px 10px;
  }

  .hn-product__name {
    min-height: 36px;
    font-size: 12px;
  }

  .hn-product__price {
    font-size: 14px;
  }

  .hn-product__add {
    width: 33px;
    height: 33px;
    right: 7px;
    bottom: 7px;
  }

  .hn-product__arrow {
    display: none;
  }
}

@media (max-width: 370px) {
  .hn-slider {
    height: 155px;
  }

  .hn-slide {
    padding-left: 13px;
    padding-right: 9px;
  }

  .hn-slide__title {
    font-size: 20px;
  }

  .hn-slide__image {
    height: 120px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hn-slide {
    transition: none;
  }

  .hn-skeleton::after,
  .hn-progress span {
    animation: none;
  }
}
`;

/* =========================================================
   INJECTION DU CSS
========================================================= */

if (typeof document !== 'undefined') {
  let style = document.getElementById('hn-home-styles');

  if (!style) {
    style = document.createElement('style');
    style.id = 'hn-home-styles';
    document.head.appendChild(style);
  }

  if (style.textContent !== CSS) {
    style.textContent = CSS;
  }
}

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number.toLocaleString('fr-FR', {
    maximumFractionDigits: 0
  });
};

const imageOf = (product) =>
  getProductImage(product) ||
  product?.mainImage ||
  product?.image ||
  product?.images?.[0]?.url ||
  product?.images?.[0] ||
  '';

/* =========================================================
   CONTENU DES TROIS BANNIÈRES
========================================================= */

const BANNER_CONTENT = [
  {
    id: 'orange',
    theme: 'orange',
    eyebrow: 'BIENVENUE SUR DANGO IMPORT',
    title: (
      <>
        Achetez malin,
        <br />
        <span>livrez vite.</span>
      </>
    ),
    description:
      'Découvrez des produits sélectionnés pour vous, à des prix accessibles.',
    image: BANNER_IMAGES.shopping,
    alt: 'Shopping et achats en ligne'
  },
  {
    id: 'blue',
    theme: 'blue',
    eyebrow: 'PAIEMENT FACILE ET SÉCURISÉ',
    title: (
      <>
        Payez simplement
        <br />
        avec le
        <br />
        <span>Mobile Money.</span>
      </>
    ),
    description:
      'Réglez vos commandes directement depuis votre téléphone, sans avoir besoin d’une carte bancaire.',
    image: BANNER_IMAGES.mobileMoney,
    alt: 'Paiement mobile depuis un smartphone'
  },
  {
    id: 'green',
    theme: 'green',
    eyebrow: 'TOGO ET BÉNIN',
    title: (
      <>
        Vos achats,
        <br />
        livrés en toute
        <br />
        <span>simplicité.</span>
      </>
    ),
    description:
      'Commandez facilement et recevez vos produits au Togo et au Bénin.',
    image: BANNER_IMAGES.delivery,
    alt: 'Livraison de colis'
  }
];

/* =========================================================
   SLIDER
========================================================= */

function BannerSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToSlide = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (
        current + 1
      ) % BANNER_CONTENT.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="hn-banner-section">
      <div className="hn-wrap">
        <div
          className="hn-slider"
          aria-label="Bannières Dango import"
          aria-live="off"
        >
          {BANNER_CONTENT.map((banner, index) => (
            <article
              key={banner.id}
              className={
                `hn-slide hn-slide--${banner.theme}` +
                (activeIndex === index ? ' is-active' : '')
              }
              aria-hidden={activeIndex !== index}
            >
              <div className="hn-slide__content">
                <h1 className="hn-slide__title">
                  {banner.title}
                </h1>
              </div>

              <div className="hn-slide__visual">
                <img
                  className="hn-slide__image"
                  src={banner.image}
                  alt={banner.alt}
                  draggable="false"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                />
              </div>
            </article>
          ))}
        </div>

        <nav
          className="hn-slider__navigation"
          aria-label="Navigation des bannières"
        >
          <div className="hn-slider__dots">
            {BANNER_CONTENT.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                className={
                  'hn-slider__dot' +
                  (activeIndex === index ? ' is-active' : '')
                }
                onClick={() => goToSlide(index)}
                aria-label={`Afficher la bannière ${index + 1}`}
                aria-current={activeIndex === index ? 'true' : undefined}
              />
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}

/* =========================================================
   CARTE PRODUIT
========================================================= */

function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState(() => new Set());

  const galleryRef = useRef(null);

  const item = useMemo(
    () => sanitizeProductForDisplay(product) || product,
    [product]
  );

  const name = item.name || item.title || 'Produit';
  const price = Number(item.price || item.unitPrice || 0);
  const productId = item._id || item.id;
  const moq = Number(getMoqRules(item).moq || 1);

  const images = useMemo(() => {
    let list = [];

    try {
      list = getProductImages(item, 6) || [];
    } catch {
      list = [];
    }

    if (!list.length && Array.isArray(item?.images)) {
      list = item.images
        .map((image) =>
          typeof image === 'string' ? image : image?.url
        )
        .filter(Boolean);
    }

    return Array.from(
      new Set([
        getProductImage(item),
        item?.image,
        ...list
      ].filter(Boolean))
    ).slice(0, 6);
  }, [item]);

  const visibleImages = images.filter(
    (src) => !failedImages.has(src)
  );

  const goToImage = (index) => {
    const element = galleryRef.current;

    if (!element || !visibleImages.length) return;

    const next =
      (index + visibleImages.length) % visibleImages.length;

    element.scrollTo({
      left: next * element.clientWidth,
      behavior: 'smooth'
    });

    setActiveImage(next);
  };

  const handleGalleryScroll = () => {
    const element = galleryRef.current;

    if (!element || !element.clientWidth) return;

    setActiveImage(
      Math.round(element.scrollLeft / element.clientWidth)
    );
  };

  const handleAdd = (event) => {
    event.stopPropagation();

    if (adding) return;

    setAdding(true);
    onAddToCart?.(item, 1);

    window.setTimeout(() => {
      setAdding(false);
    }, 900);
  };

  const stopNavigation = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <article
      className="hn-product"
      onClick={() => {
        if (productId) {
          navigate(`/product/${productId}`);
        }
      }}
    >
      <div className="hn-product__visual">
        <button
          type="button"
          className={
            `hn-product__add${adding ? ' is-done' : ''}`
          }
          onClick={handleAdd}
          aria-label="Ajouter au panier"
        >
          {adding
            ? <Check size={18} />
            : <ShoppingCart size={18} />
          }
        </button>

        {visibleImages.length ? (
          <div
            ref={galleryRef}
            className="hn-product__gallery"
            onScroll={handleGalleryScroll}
          >
            {visibleImages.map((src, index) => (
              <div
                className="hn-product__image-wrap"
                key={`${src}-${index}`}
              >
                <img
                  src={src}
                  alt={name}
                  className="hn-product__image"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  draggable="false"
                  onError={() => {
                    setFailedImages((previous) => {
                      const next = new Set(previous);
                      next.add(src);
                      return next;
                    });
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="hn-product__placeholder">
            <Package size={36} strokeWidth={1.4} />
          </div>
        )}

        {visibleImages.length > 1 && (
          <>
            <button
              type="button"
              className="hn-product__arrow hn-product__arrow--left"
              aria-label="Image précédente"
              onClick={(event) => {
                stopNavigation(event);
                goToImage(activeImage - 1);
              }}
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              className="hn-product__arrow hn-product__arrow--right"
              aria-label="Image suivante"
              onClick={(event) => {
                stopNavigation(event);
                goToImage(activeImage + 1);
              }}
            >
              <ChevronRight size={17} />
            </button>
          </>
        )}
      </div>

      {visibleImages.length > 1 && (
        <div className="hn-product__dots">
          {visibleImages.map((src, index) => (
            <button
              type="button"
              key={`${src}-${index}`}
              aria-label={`Afficher l'image ${index + 1}`}
              className={
                `hn-product__dot${activeImage === index ? ' is-active' : ''}`
              }
              onClick={(event) => {
                stopNavigation(event);
                goToImage(index);
              }}
            />
          ))}
        </div>
      )}

      <h3 className="hn-product__name" title={name}>
        {name}
      </h3>

      {formatPrice(price) && (
        <p className="hn-product__price">
          {formatPrice(price)} FCFA
        </p>
      )}

      {moq > 1 && (
        <p className="hn-product__moq">
          Minimum : {moq} pièces
        </p>
      )}
    </article>
  );
}

/* =========================================================
   SQUELETTES
========================================================= */

function ProductSkeleton({ count = 10 }) {
  return (
    <div className="hn-grid" aria-busy="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <div
            className="hn-skeleton"
            style={{ aspectRatio: '1 / 1' }}
          />

          <div
            className="hn-skeleton"
            style={{
              height: 14,
              width: '80%',
              marginTop: 12
            }}
          />

          <div
            className="hn-skeleton"
            style={{
              height: 12,
              width: '45%',
              marginTop: 8
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   FILTRES
========================================================= */

const DEFAULT_FILTERS = {
  minPrice: '',
  maxPrice: '',
  rating: '',
  inStock: false,
  newOnly: false,
  brand: '',
  sort: 'newest',
  categorySlug: ''
};

/* =========================================================
   PAGE HOME
========================================================= */

function HomeNew() {
  const location = useLocation();

  const { addToCart } = useCart();
  const toast = useToast();

  const gridRef = useRef(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const urlSearch = urlParams.get('q')?.trim() || '';
  const urlCategory = urlParams.get('category')?.trim() || '';

  const scrollToProducts = useCallback(() => {
    window.setTimeout(() => {
      gridRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 80);
  }, []);

  useEffect(() => {
    setFilters((previous) => ({
      ...previous,
      categorySlug: urlCategory
    }));
  }, [urlCategory]);

  /* Récupération des produits */

  const {
    data: productsRaw = [],
    isLoading: loading
  } = useQuery({
    queryKey: [
      'homeProducts',
      urlSearch,
      filters.categorySlug,
      filters.sort
    ],

    queryFn: async () => {
      const params = {
        page: 1,
        limit: 200,
        search: urlSearch || undefined,
        category: filters.categorySlug || undefined,
        sort: filters.sort !== 'newest'
          ? filters.sort
          : undefined
      };

      const response = await client.get('/products', { params });

      if (Array.isArray(response?.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response?.data?.products)) {
        return response.data.products;
      }

      if (Array.isArray(response?.data?.data?.products)) {
        return response.data.data.products;
      }

      if (Array.isArray(response?.data)) {
        return response.data;
      }

      return [];
    },

    staleTime: 60_000,
    retry: 1
  });

  /* Récupération des catégories */

  const { data: categoriesRaw = [] } = useQuery({
    queryKey: ['homeCategories'],

    queryFn: async () => {
      const response = await client.get('/categories');

      if (Array.isArray(response?.data?.data)) {
        return response.data.data;
      }

      if (Array.isArray(response?.data?.categories)) {
        return response.data.categories;
      }

      if (Array.isArray(response?.data)) {
        return response.data;
      }

      return [];
    },

    staleTime: 300_000
  });

  /* Normalisation */

  const products = useMemo(() => {
    return (productsRaw || []).map((product) => {
      const item =
        sanitizeProductForDisplay(product) || product;

      return {
        ...item,
        id: item._id || item.id,
        price: Number(item.price || item.unitPrice || 0),
        image: imageOf(item),
        stock: getProductSellableStock(item),
        isNew: Boolean(item.isNew || item.isNewArrival)
      };
    });
  }, [productsRaw]);

  /* Filtrage des produits */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (urlSearch) {
      const query = urlSearch.toLowerCase();

      result = result.filter((product) => {
        const name = (product.name || product.title || '')
          .toLowerCase();

        const description = (product.description || '')
          .toLowerCase();

        return (
          name.includes(query) ||
          description.includes(query)
        );
      });
    }

    if (filters.minPrice) {
      result = result.filter(
        (product) =>
          product.price >= Number(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      result = result.filter(
        (product) =>
          product.price <= Number(filters.maxPrice)
      );
    }

    if (filters.rating) {
      result = result.filter(
        (product) =>
          Number(product.rating || product.averageRating || 0) >=
          Number(filters.rating)
      );
    }

    if (filters.inStock) {
      result = result.filter(
        (product) => product.stock > 0
      );
    }

    if (filters.newOnly) {
      result = result.filter(
        (product) => product.isNew
      );
    }

    if (filters.brand) {
      result = result.filter((product) =>
        (product.brand || '')
          .toLowerCase()
          .includes(filters.brand.toLowerCase())
      );
    }

    if (filters.sort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'popular') {
      result.sort(
        (a, b) =>
          Number(b.isBoosted || b.isBestSeller || 0) -
          Number(a.isBoosted || a.isBestSeller || 0)
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );
    }

    return result;
  }, [products, filters, urlSearch]);

  /* Catégorie active */

  const activeCategory = categoriesRaw.find(
    (category) =>
      category.slug &&
      category.slug === filters.categorySlug
  );

  const pageTitle = urlSearch
    ? `Résultats pour « ${urlSearch} »`
    : filters.newOnly
      ? 'Nouveautés'
      : activeCategory
        ? activeCategory.name
        : 'Nos produits';

  /* Ajout au panier */

  const handleAddToCart = useCallback(
    (product, quantity = 1) => {
      addToCart(product, quantity);
      toast?.success?.('Produit ajouté au panier');
    },
    [addToCart, toast]
  );

  /* Réinitialisation */

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const isHome =
    !urlSearch &&
    !filters.categorySlug &&
    !filters.newOnly;

  return (
    <div className="hn-page">
      <Header />

      {isHome && <BannerSlider />}

      <section
        ref={gridRef}
        className="hn-section"
        id="produits"
      >
        <div className="hn-wrap">
          {loading && (
            <div
              className="hn-progress"
              role="progressbar"
              aria-label="Chargement des produits"
            >
              <span />
            </div>
          )}

          <div className="hn-section__header">
            <h2 className="hn-section__title">
              {pageTitle}
            </h2>

            {!loading && (
              <span className="hn-section__count">
                {filteredProducts.length} produit(s)
              </span>
            )}
          </div>

          {loading ? (
            <ProductSkeleton count={10} />
          ) : filteredProducts.length === 0 ? (
            <div className="hn-empty">
              <Package
                size={42}
                strokeWidth={1.4}
                style={{ color: '#ccc' }}
              />

              <strong>Aucun produit trouvé</strong>

              <p>
                Essayez une autre recherche ou réinitialisez vos filtres.
              </p>

              <button
                type="button"
                className="hn-reset"
                onClick={resetFilters}
              >
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className="hn-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomeNew;
