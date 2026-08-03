import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Truck, RotateCcw } from 'lucide-react';

function formatJoinedDate(date) {
  if (!date) return null;
  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

function ShopAbout({ store, seller }) {
  if (!store) return null;

  const name = store.name || seller?.name || 'cette boutique';
  const description = (store.description || '').trim();
  const address = (store.address || '').trim();
  const city = (store.city || '').trim();
  const country = (store.country || '').trim();
  const delivery = (store.deliveryPolicy || '').trim();
  const returns = (store.returnPolicy || '').trim();
  const joined =
    formatJoinedDate(store.createdAt) || formatJoinedDate(seller?.createdAt);

  const hasContent =
    description || address || city || country || joined || delivery || returns;

  if (!hasContent) return null;

  return (
    <motion.section
      className="shop-about"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2>À propos de {name}</h2>

      {description ? <p className="shop-about__desc">{description}</p> : null}

      <dl className="shop-about__list">
        {address ? (
          <div>
            <dt>
              <MapPin size={14} /> Adresse
            </dt>
            <dd>{address}</dd>
          </div>
        ) : null}
        {city ? (
          <div>
            <dt>Ville</dt>
            <dd>{city}</dd>
          </div>
        ) : null}
        {country ? (
          <div>
            <dt>Pays</dt>
            <dd>{country}</dd>
          </div>
        ) : null}
        {joined ? (
          <div>
            <dt>
              <Calendar size={14} /> Date d&apos;inscription
            </dt>
            <dd>{joined}</dd>
          </div>
        ) : null}
      </dl>

      {delivery ? (
        <div className="shop-about__policy">
          <h3>
            <Truck size={16} /> Politique de livraison
          </h3>
          <p>{delivery}</p>
        </div>
      ) : null}

      {returns ? (
        <div className="shop-about__policy">
          <h3>
            <RotateCcw size={16} /> Politique de retour
          </h3>
          <p>{returns}</p>
        </div>
      ) : null}
    </motion.section>
  );
}

export default React.memo(ShopAbout);
