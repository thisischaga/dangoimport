import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import About from "./pages/About";
import Home from "./pages/HomeNew";
import Services from "./pages/Services";
import SourcingLanding from "./pages/SourcingLanding";
import SourcingForm from "./pages/SourcingForm";
import AllCategories from "./pages/AllCategories";
import FeaturedSelection from "./pages/FeaturedSelection";
import HelpCenter from "./pages/HelpCenter";
import Promotions from './pages/Promotions';
import NewArrivals from './pages/NewArrivals';
import TopSellers from './pages/TopSellers';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Livraison from './pages/Livraison';
import Retours from './pages/Retours';
import Cookies from './pages/Policies/Cookies';
import './App.css';
import Cgu from './pages/Cgu';
import PolitiqueRetour from './pages/PolitiqueRetour';
import MentionsLegales from './pages/MentionsLegales';
import APropos from './pages/APropos';
import PerFinance from './blog/PerFinance';
import Epargne from './blog/Epargne';
import Blog from './blog/Blog';
import ArticleThree from './blog/ArticleThree';
import ArticleFour from './blog/ArticleFour';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientActivity from './pages/ClientActivity';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';
import Shop from './pages/Shop';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import PaymentResult from './pages/PaymentResult';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import ScrollToTop from './components/ScrollToTop';
import Politique from './pages/Politique';
import MobileTabBar from './components/mobiletabbar';

function getPageTitle(pathname) {
  const routeTitles = [
    { regex: /^\/$/, title: 'Marketplace' },
    { regex: /^\/shopping$/, title: 'Boutique' },
    { regex: /^\/mes-commandes$/, title: 'Mes commandes' },
    { regex: /^\/toutes-les-categories$/, title: 'Toutes les catégories' },
    { regex: /^\/selection-vedette$/, title: 'Sélection vedette' },
    { regex: /^\/centre-aide$/, title: 'Centre d’aide' },
    { regex: /^\/promotions$/, title: 'Promotions' },
    { regex: /^\/nouveautes$/, title: 'Nouveautés' },
    { regex: /^\/best-sellers$/, title: 'Meilleures ventes' },
    { regex: /^\/faq$/, title: 'FAQ' },
    { regex: /^\/contact$/, title: 'Contact' },
    { regex: /^\/livraison$/, title: 'Livraison' },
    { regex: /^\/retours$/, title: 'Retours' },
    { regex: /^\/cgu$/, title: 'Conditions générales' },
    { regex: /^\/politique-confidentialite$/, title: 'Politique de confidentialité' },
    { regex: /^\/politique-retour$/, title: 'Politique de retour' },
    { regex: /^\/mentions-legales$/, title: 'Mentions légales' },
    { regex: /^\/a-propos$/, title: 'À propos' },
    { regex: /^\/services$/, title: 'Services' },
    { regex: /^\/sourcing$/, title: 'Sourcing' },
    { regex: /^\/sourcing\/form$/, title: 'Formulaire de sourcing' },
    { regex: /^\/cart$/, title: 'Panier' },
    { regex: /^\/checkout$/, title: 'Paiement' },
    { regex: /^\/checkout\/result$/, title: 'Résultat de paiement' },
    { regex: /^\/checkout-sourcing$/, title: 'Checkout sourcing' },
    { regex: /^\/login$/, title: 'Connexion' },
    { regex: /^\/register$/, title: 'Inscription' },
    { regex: /^\/product\/[A-Za-z0-9_-]+$/, title: 'Produit' },
    { regex: /^\/category\/[A-Za-z0-9_-]+$/, title: 'Catégorie' },
    { regex: /^\/shop\/[A-Za-z0-9_-]+$/, title: 'Boutique vendeur' },
    { regex: /^\/store\/[A-Za-z0-9_-]+$/, title: 'Boutique vendeur' },
  ];

  const route = routeTitles.find((item) => item.regex.test(pathname));
  return route ? `${route.title} | Dangoimport` : 'Dangoimport | Marketplace locale';
}

function getPageDescription(pathname) {
  const defaultDesc = 'Dangoimport est la marketplace locale de référence au Bénin et au Togo. Découvrez des milliers de produits de vendeurs béninois et togolais. Achetez malin et vendez facilement.';
  const routeDescriptions = [
    { regex: /^\/$/, description: 'Dangoimport - Achetez des articles de qualité au Bénin et au Togo au meilleur prix.' },
    { regex: /^\/shopping$/, description: 'Parcourez la boutique en ligne Dangoimport. Produits diversifiés, commandes sécurisées.' },
    { regex: /^\/mes-commandes$/, description: 'Suivez vos commandes en temps réel et générez vos codes QR de retrait.' },
    { regex: /^\/toutes-les-categories$/, description: 'Découvrez toutes les catégories de produits disponibles sur Dangoimport.' },
    { regex: /^\/centre-aide$/, description: 'Trouvez des réponses à vos questions et contactez notre assistance clientèle.' },
    { regex: /^\/checkout$/, description: 'Finalisez votre achat en toute sécurité sur Dangoimport.' },
    { regex: /^\/cgu$/, description: 'Conditions Générales d’Utilisation de la plateforme Dangoimport.' },
    { regex: /^\/politique-retour$/, description: 'Consultez nos conditions de retour et de remboursement sous 72 heures.' },
    { regex: /^\/a-propos$/, description: 'Découvrez qui nous sommes, notre vision et nos services de sourcing Chine.' },
  ];

  const route = routeDescriptions.find((item) => item.regex.test(pathname));
  return route ? route.description : defaultDesc;
}

function PageTitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    // 1. Mise à jour du titre
    document.title = getPageTitle(location.pathname);

    // 2. Gestion de l'URL Canonique (Pour résoudre "Pages en double sans URL canonique")
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    // Nettoie l'URL en ne conservant que le domaine et le chemin d'accès (sans paramètres de requête)
    const cleanHref = `https://marketplace.dangoimport.com${location.pathname}`;
    canonicalLink.setAttribute('href', cleanHref);

    // 3. Gestion de la Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', getPageDescription(location.pathname));
  }, [location.pathname]);

  return null;
}

function StoreRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/shop/${slug}`} replace />;
}

function App() {
  const launchDate = new Date("2025-10-01T00:00:00").getTime();
  const now = new Date().getTime();
  const isLaunched = now >= launchDate;

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Intercepteur global pour les erreurs API
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || "Une erreur est survenue lors de la communication avec le serveur.";
        // On évite d'afficher le toast pour les erreurs 401 sur le login
        if (error.response?.status !== 401 || !window.location.pathname.includes('login')) {
          if (typeof window !== 'undefined' && window.dangoToast?.error) {
            window.dangoToast.error(message);
          } else {
            console.error(message);
          }
        }
        return Promise.reject(error);
      }
    );

    const checkUser = () => {
      const userData = localStorage.getItem('dangoUser');
      if (userData) setUser(JSON.parse(userData));
      else setUser(null);
    };

    checkUser();
    window.addEventListener('authChange', checkUser);
    return () => {
      window.removeEventListener('authChange', checkUser);
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
        <CartProvider>
            <NotificationProvider recipientType="user" userId={user?.email || user?.userEmail}>
              <Router>
                <PageTitleUpdater />
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Home />} />
                  {/*<Route path="/about" element={<About />} />*/}
                  <Route path='/services' element={<Services/>}/>
                  <Route path='/sourcing' element={<SourcingLanding/>}/>
                  <Route path='/sourcing/form' element={<SourcingForm/>}/>
                  <Route path='/cgu' element={<Cgu/>}/>
                  <Route path='/politique-confidentialite' element={<Politique />}/>
                  <Route path='/politique-retour' element={<PolitiqueRetour/>}/>
                  <Route path='/mentions-legales' element={<MentionsLegales />} />
                  <Route path='/a-propos' element={<APropos />} />
                  {/* Marketplace routes */}
                  <Route path='/shopping' element={<Home/>}/>
                  <Route path='/mes-commandes' element={<Orders/>}/>
                  <Route path='/toutes-les-categories' element={<AllCategories/>}/>
                  <Route path='/selection-vedette' element={<FeaturedSelection/>}/>
                  <Route path='/centre-aide' element={<HelpCenter/>}/>
                  <Route path='/promotions' element={<Promotions/>}/>
                  <Route path='/nouveautes' element={<NewArrivals/>}/>
                  <Route path='/best-sellers' element={<TopSellers/>}/> 
                  <Route path='/faq' element={<FAQ/>}/>
                  <Route path='/contact' element={<Contact/>}/>
                  <Route path='/livraison' element={<Livraison/>}/>
                  <Route path='/retours' element={<PolitiqueRetour/>}/>
                  <Route path='/retour' element={<PolitiqueRetour/>}/>
                  <Route path='/refund-policy' element={<PolitiqueRetour/>}/>
                  {/**<Route path='/cookies' element={<Cookies/>}/> */}
                  
                  {/* New E-commerce routes */}
                  <Route path='/product/:id' element={<ProductDetail/>}/>
                  <Route path='/category/:slug' element={<CategoryPage/>}/>
                  <Route path='/shop/:slug' element={<Shop/>}/>
                  {/* Backwards compatibility: redirect old /store/:slug links to /shop/:slug */}
                  <Route path='/store/:slug' element={<StoreRedirect />} />
                  <Route path='/cart' element={<CartPage/>}/>
                  <Route path='/checkout' element={<Checkout/>}/>
                  <Route path='/checkout/result' element={<PaymentResult/>}/>
                  <Route path='/checkout-sourcing' element={<SourcingForm/>}/>

                  <Route path='/login' element={<Login/>}/>
                  <Route path='/register' element={<Register/>}/>
                  {/**
                  <Route path='/blog/articles' element={<Blog/>}/>
                  <Route path='/blog/finance-personnelle' element={<PerFinance/>}/>
                  <Route path='/blog/epargne' element={<Epargne/>}/>
                  <Route path='/blog/entreprendre' element={<ArticleThree/>}/>
                  <Route path='/blog/la prise de risque en entreprenneuriat' element={<ArticleFour/>}/>
                  */}
                </Routes>
                <MobileTabBar />
              </Router>
              
            </NotificationProvider>
          </CartProvider>
        </ConfirmProvider>
        </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
