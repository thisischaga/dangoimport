import { Shirt, Smartphone, Home, Gift, Car, Sparkles } from 'lucide-react';

export const categories = [
  { name: 'Vêtements', description: 'Tenues modernes', icon: Shirt },
  { name: 'Électronique', description: 'Appareils connectés', icon: Smartphone },
  { name: 'Maison', description: 'Déco & utilitaire', icon: Home },
  { name: 'Cadeaux', description: 'Idées cadeaux', icon: Gift },
  { name: 'Auto', description: 'Accessoires véhicule', icon: Car },
  { name: 'Nouveautés', description: 'Produits du moment', icon: Sparkles },
];

export const mockProducts = [
  {
    id: 1,
    name: 'iPhone 14 Pro Max',
    price: 1200000,
    promoPrice: 1080000,
    category: 'Électronique',
    sellerName: 'TechTogo',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    stock: 12,
    isBoosted: true,
  },
  {
    id: 2,
    name: 'Casque audio premium',
    price: 180000,
    promoPrice: 144000,
    category: 'Électronique',
    sellerName: 'AudioHub',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    stock: 7,
    isBoosted: false,
  },
  {
    id: 3,
    name: 'T-shirt premium',
    price: 40000,
    promoPrice: 32000,
    category: 'Vêtements',
    sellerName: 'StyleTogo',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    stock: 25,
    isBoosted: true,
  },
  {
    id: 4,
    name: 'Lampe design',
    price: 90000,
    category: 'Maison',
    sellerName: 'MaisonPlus',
    sellerVerified: false,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    stock: 14,
    isBoosted: false,
  },
  {
    id: 5,
    name: 'Sac en cuir',
    price: 150000,
    promoPrice: 125000,
    category: 'Cadeaux',
    sellerName: 'LuxeTogo',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    stock: 9,
    isBoosted: false,
  },
  {
    id: 6,
    name: 'Chargeur rapide',
    price: 65000,
    category: 'Électronique',
    sellerName: 'PowerTogo',
    sellerVerified: true,
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    stock: 18,
    isBoosted: true,
  },
];

export function sortProducts(products) {
  return [...products].sort((a, b) => Number(b.isBoosted) - Number(a.isBoosted));
}

export function isPromoActive(product) {
  return Boolean(product?.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price);
}

export function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}
