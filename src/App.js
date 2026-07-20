import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import About from "./pages/About";
import Home from "./pages/Home";
import CguVendeur from "./pages/CguVendeur";
import Services from "./pages/Services";
import AllCategories from "./pages/AllCategories";
import FeaturedSelection from "./pages/FeaturedSelection";
import HelpCenter from "./pages/HelpCenter";
import './App.css';
import Cgu from './pages/Cgu';
import Politique from './pages/Politique';
import PolitiqueRetour from './pages/PolitiqueRetour';
import MentionsLegales from './pages/MentionsLegales';
import Ecom from './components/Ecom';
import PerFinance from './blog/PerFinance';
import Epargne from './blog/Epargne';
import Blog from './blog/Blog';
import Countdown from './components/Countdown'; // créer un composant Countdown
import ArticleThree from './blog/ArticleThree';
import ArticleFour from './blog/ArticleFour';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorProfile from './pages/VendorProfile';
import ClientActivity from './pages/ClientActivity';
import VendorDashboard from './pages/VendorDashboard';
import CartPage from './pages/CartPage';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import ScrollToTop from './components/ScrollToTop';
import BottomNav from './components/BottomNav';
import { ThemeProvider } from './context/ThemeContext';

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
          toast.error(message);
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
    <ThemeProvider>
    <CartProvider>
      <NotificationProvider recipientType="user" userId={user?.email || user?.userEmail}>
        <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path='/services' element={<Services/>}/>
              <Route path='/cgu' element={<Cgu/>}/>
              <Route path='/cgu-vendeur' element={<CguVendeur/>}/>
              <Route path='/politique-de-confidentialité' element={<Politique/>}/>
              <Route path='/politique-de-retour' element={<PolitiqueRetour/>}/>
              <Route path='/mentions-legales' element={<MentionsLegales />} />
              {/* Marketplace routes */}
              <Route path='/shopping' element={<Ecom/>}/>
              <Route path='/vendor/:vendorName' element={<VendorProfile/>}/>
              <Route path='/dashboard-vendeur' element={<VendorDashboard/>}/>
              <Route path='/mes-commandes' element={<ClientActivity/>}/>
              <Route path='/toutes-les-categories' element={<AllCategories/>}/>
              <Route path='/selection-vedette' element={<FeaturedSelection/>}/>
              <Route path='/centre-aide' element={<HelpCenter/>}/>
              
              {/* New E-commerce routes */}
              <Route path='/product/:id' element={<ProductDetail/>}/>
              <Route path='/cart' element={<Cart/>}/>
              <Route path='/checkout' element={<Checkout/>}/>

              <Route path='/login' element={<Login/>}/>
              <Route path='/register' element={<Register/>}/>
              <Route path='/blog/articles' element={<Blog/>}/>
              <Route path='/blog/finance-personnelle' element={<PerFinance/>}/>
              <Route path='/blog/epargne' element={<Epargne/>}/>
              <Route path='/blog/entreprendre' element={<ArticleThree/>}/>
              {/*<Route path='/blog/histoire-de-mamadou' element={<ArticleFour/>}/>*/}
              <Route path='/blog/la prise de risque en entreprenneuriat' element={<ArticleFour/>}/>
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3500}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="dark"
              toastClassName="dango-toast-item"
              className="dango-toast"
            />
            <BottomNav />
        </Router>
      </NotificationProvider>
    </CartProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
