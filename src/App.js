import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import About from "./pages/About";
import Home from "./pages/Home";
import Services from "./pages/Services";
import './App.css';
import Cgu from './pages/Cgu';
import Politique from './pages/Politique';
import Ecom from './components/Ecom';
import PerFinance from './blog/PerFinance';
import Epargne from './blog/Epargne';
import Blog from './blog/Blog';
import Countdown from './components/Countdown'; // créer un composant Countdown
import ArticleThree from './blog/ArticleThree';
import ArticleFour from './blog/ArticleFour';
import PublishProduct from './pages/PublishProduct';
import Login from './pages/Login';
import Register from './pages/Register';
import VendorProfile from './pages/VendorProfile';
import CartPage from './pages/CartPage';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { useState, useEffect } from 'react';

function App() {
  const launchDate = new Date("2025-10-01T00:00:00").getTime();
  const now = new Date().getTime();
  const isLaunched = now >= launchDate;

  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem('dangoUser');
      if (userData) setUser(JSON.parse(userData));
      else setUser(null);
    };
    checkUser();
    window.addEventListener('authChange', checkUser);
    return () => window.removeEventListener('authChange', checkUser);
  }, []);

  return (
    <CartProvider>
      <NotificationProvider recipientType="user" userId={user?.email}>
        <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path='/services' element={<Services/>}/>
              <Route path='/cgu' element={<Cgu/>}/>
              <Route path='/politique-de-confidentialité' element={<Politique/>}/>
              <Route path='/shopping' element={<Ecom/>}/>
              {/* La route /publish a été retirée (gestion via panel admin uniquement) */}

              <Route path='/vendor/:vendorName' element={<VendorProfile/>}/>
              <Route path='/login' element={<Login/>}/>
              <Route path='/register' element={<Register/>}/>
              <Route path='/cart' element={<CartPage/>}/>
              <Route path='/blog/articles' element={<Blog/>}/>
              <Route path='/blog/finance-personnelle' element={<PerFinance/>}/>
              <Route path='/blog/epargne' element={<Epargne/>}/>
              <Route path='/blog/entreprendre' element={<ArticleThree/>}/>
              {/*<Route path='/blog/histoire-de-mamadou' element={<ArticleFour/>}/>*/}
              <Route path='/blog/la prise de risque en entreprenneuriat' element={<ArticleFour/>}/>
            </Routes>
        </Router>
      </NotificationProvider>
    </CartProvider>
  );
}

export default App;
