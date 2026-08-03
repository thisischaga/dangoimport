import React from 'react';
import { motion } from 'framer-motion';
import { PackageOpen } from 'lucide-react';

function ShopEmptyState({ filtered = false, onReset }) {
  return (
    <motion.div
      className="shop-empty"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="shop-empty__art" aria-hidden>
        <PackageOpen size={56} strokeWidth={1.25} />
        <div className="shop-empty__rings" />
      </div>
      {filtered ? (
        <>
          <h3>Aucun produit ne correspond à votre recherche</h3>
          <p>Essayez d&apos;autres mots-clés ou réinitialisez les filtres.</p>
          {onReset ? (
            <button type="button" className="shop-btn shop-btn--primary" onClick={onReset}>
              Réinitialiser les filtres
            </button>
          ) : null}
        </>
      ) : (
        <>
          <h3>Cette boutique ne possède encore aucun produit publié.</h3>
          <p>Revenez bientôt — le vendeur prépare son catalogue.</p>
        </>
      )}
    </motion.div>
  );
}

export default React.memo(ShopEmptyState);
