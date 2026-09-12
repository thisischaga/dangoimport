import { useEffect } from 'react';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * SEO + Open Graph for shop pages (no react-helmet dependency).
 */
export default function ShopSeo({ store, seller, productCount }) {
  useEffect(() => {
    if (!store) return undefined;

    const name = store.name || seller?.name || 'Boutique';
    const description =
      (store.description && store.description.trim()) ||
      `Découvrez les produits de ${name} sur Dango Import. ${productCount || 0} produit${(productCount || 0) > 1 ? 's' : ''} publié${(productCount || 0) > 1 ? 's' : ''}.`;

    const title = `${name} | Boutique Dango Import`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const image = store.banner || store.logo || seller?.profileImage || '';

    const prevTitle = document.title;
    document.title = title;

    upsertMeta('name', 'description', description.slice(0, 160));
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description.slice(0, 200));
    upsertMeta('property', 'og:type', 'website');
    if (url) upsertMeta('property', 'og:url', url);
    if (image) upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description.slice(0, 200));
    if (image) upsertMeta('name', 'twitter:image', image);

    return () => {
      document.title = prevTitle;
    };
  }, [store, seller, productCount]);

  return null;
}
