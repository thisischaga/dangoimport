import React from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  MapPin,
  Calendar,
  Package,
  MessageCircle,
  Share2,
} from 'lucide-react';
import { resolveImageUrl } from '../../utils/imageUrl';

function formatJoinedDate(date) {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    });
  } catch {
    return null;
  }
}

function ShopHeader({ store, seller, stats, onContact, onShare }) {
  const name = store?.name || seller?.name || 'Boutique';
  const logo =
    resolveImageUrl(store?.logo) ||
    resolveImageUrl(seller?.profileImage) ||
    null;
  const banner = resolveImageUrl(store?.banner) || null;
  const description = store?.description || '';
  const city = store?.city || '';
  const country = store?.country || '';
  const location = [city, country].filter(Boolean).join(', ');
  const joined =
    formatJoinedDate(store?.createdAt) || formatJoinedDate(seller?.createdAt);
  const productCount = stats?.productCount ?? 0;
  const isVerified = Boolean(seller?.isVerified);

  return (
    <motion.section
      className="shop-header"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className="shop-header__banner"
        style={
          banner
            ? { backgroundImage: `url(${banner})` }
            : undefined
        }
        role="img"
        aria-label={`Bannière de ${name}`}
      />

      <div className="shop-header__body">
        <div className="shop-header__identity">
          <div className="shop-header__logo-wrap">
            {logo ? (
              <img
                src={logo}
                alt={`Logo ${name}`}
                className="shop-header__logo"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="shop-header__logo shop-header__logo--placeholder" aria-hidden>
                {(name || 'B').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="shop-header__info">
            <div className="shop-header__title-row">
              <h1 className="shop-header__name">{name}</h1>
              {isVerified && (
                <span className="shop-header__verified" title="Vendeur vérifié">
                  <BadgeCheck size={16} />
                  Vendeur Vérifié
                </span>
              )}
            </div>

            {description ? (
              <p className="shop-header__desc">{description}</p>
            ) : null}

            <ul className="shop-header__meta">
              {location ? (
                <li>
                  <MapPin size={14} />
                  <span>{location}</span>
                </li>
              ) : null}
              {joined ? (
                <li>
                  <Calendar size={14} />
                  <span>Inscrit depuis {joined}</span>
                </li>
              ) : null}
              <li>
                <Package size={14} />
                <span>
                  {productCount} produit{productCount > 1 ? 's' : ''} publié
                  {productCount > 1 ? 's' : ''}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="shop-header__actions">
          <button type="button" className="shop-btn shop-btn--primary" onClick={onContact}>
            <MessageCircle size={16} />
            Contacter le vendeur
          </button>
          <button type="button" className="shop-btn shop-btn--ghost" onClick={onShare}>
            <Share2 size={16} />
            Partager la boutique
          </button>
        </div>
      </div>
    </motion.section>
  );
}

export default React.memo(ShopHeader);
