import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaChevronRight } from 'react-icons/fa';

const CATEGORIES = [
  { name: 'Électronique', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80', desc: 'Smartphones, laptops, accessoires high-tech' },
  { name: 'Beauté & Parfums', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80', desc: 'Cosmétiques, parfums, soins de luxe' },
  { name: 'Maison & Déco', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80', desc: 'Meubles, décoration, art de vivre' },
  { name: 'Mode & Textile', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80', desc: 'Vêtements, chaussures, accessoires' },
  { name: 'Sport & Loisirs', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80', desc: 'Équipements sportifs, fitness, plein air' },
  { name: 'Livres & Culture', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80', desc: 'Livres, musique, éducation' },
  { name: 'Alimentation', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', desc: 'Produits alimentaires, épices, boissons' },
  { name: 'Enfants & Jouets', image: 'https://images.unsplash.com/photo-1555505019-8c3f1c4aba5f?w=400&q=80', desc: 'Jouets, vêtements bébé, puériculture' },
  { name: 'Sacs & Maroquinerie', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80', desc: 'Sacs à main, valises, porte-monnaie' },
  { name: 'Agriculture', image: 'https://images.unsplash.com/photo-1586771107445-d3afbf0a6ddb?w=400&q=80', desc: 'Intrants agricoles, outillage, semences' },
  { name: 'Jeux Vidéo', image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=400&q=80', desc: 'Consoles, jeux, accessoires gaming' },
  { name: 'Auto & Moto', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80', desc: 'Pièces détachées, accessoires véhicules' },
  { name: 'Bijoux & Montres', image: 'https://images.unsplash.com/photo-1515562141207-7a8f73b5cb11?w=400&q=80', desc: 'Bijoux, montres, accessoires précieux' },
  { name: 'TV & Électroménager', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', desc: 'Téléviseurs, réfrigérateurs, machines à laver' },
  { name: 'Logistique & Transport', image: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c663c0?w=400&q=80', desc: 'Services de transport, logistique B2B' },
  { name: 'Événements', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80', desc: 'Articles de fête, mariages, sonorisation' },
];

export default function AllCategories() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-layer-background-dim)] dark:bg-[#0f1115]">
      <Header />

      <main className="max-w-[var(--floorWrapperWidth)] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header section */}
        <div className="mb-8">
          <p className="text-xs text-[var(--color-on-layer-on-layer-tertiary)] mb-1">
            <button onClick={() => navigate('/')} className="hover:text-[var(--color-accent-primary)]">Accueil</button>
            {' > '}
            <span className="font-semibold text-[var(--color-on-layer-on-layer-primary)] dark:text-white">Toutes les catégories</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-on-layer-on-layer-primary)] dark:text-white mt-2">
            Toutes les catégories
          </h1>
          <p className="text-[var(--color-on-layer-on-layer-tertiary)] mt-1">
            Explorez notre catalogue complet — des produits authentiques prêts à être expédiés.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => navigate(`/shopping?category=${encodeURIComponent(cat.name)}`)}
              className="group flex items-center gap-4 bg-white dark:bg-[#1e2130] rounded-xl border border-[var(--color-outline)] dark:border-gray-800 p-3 text-left transition-all duration-200 hover:border-[var(--color-accent-primary)] hover:shadow-md"
            >
              {/* Utilisation d'une image au lieu d'une icône */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 shadow-sm bg-gray-100">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-black text-[var(--color-on-layer-on-layer-primary)] dark:text-white text-[15px] sm:text-[16px] leading-tight group-hover:text-[var(--color-accent-primary)] transition-colors">
                  {cat.name}
                </p>
                <p className="text-[var(--pc-caption-font-size)] text-[var(--color-on-layer-on-layer-tertiary)] mt-1 line-clamp-2">
                  {cat.desc}
                </p>
              </div>
              <FaChevronRight size={12} className="text-[var(--color-on-layer-on-layer-tertiary)] group-hover:text-[var(--color-accent-primary)] shrink-0 transition-colors mr-2" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-black mb-2">Vous ne trouvez pas votre produit ?</h2>
          <p className="text-white/80 mb-5 text-sm">Notre service de sourcing Chine vous permet de commander n'importe quel produit.</p>
          <button
            onClick={() => navigate('/services')}
            className="bg-white text-[var(--color-accent-primary)] font-black px-8 py-3 rounded-full hover:bg-gray-100 transition-colors text-sm"
          >
            Demander un devis gratuit
          </button>
        </div>
      </main>
    </div>
  );
}
