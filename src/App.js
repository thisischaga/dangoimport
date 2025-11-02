import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import About from "./pages/About";
import Home from "./pages/Home";
import Services from "./pages/Services";
import AdminLogin from './Admin/AdminLogin';
import Orders from './Admin/Orders';
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
//import ArticleFive from './blog/ArticleFive';

function App() {
  const launchDate = new Date("2025-10-01T00:00:00").getTime();
  const now = new Date().getTime();
  const isLaunched = now >= launchDate;

  return (
    <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path='/services' element={<Services/>}/>
          <Route path='/admin' element={<AdminLogin/>}/>
          <Route path='/commandes' element={<Orders/>}/>
          <Route path='/cgu' element={<Cgu/>}/>
          <Route path='/politique-de-confidentialité' element={<Politique/>}/>
          <Route path='/shopping' element={<Ecom/>}/>
          <Route path='/blog/articles' element={<Blog/>}/>
          <Route path='/blog/finance-personnelle' element={<PerFinance/>}/>
          <Route path='/blog/epargne' element={<Epargne/>}/>
          <Route path='/blog/entreprendre' element={<ArticleThree/>}/>
          {/*<Route path='/blog/histoire-de-mamadou' element={<ArticleFour/>}/>*/}
          <Route path='/blog/la prise de risque en entreprenneuriat' element={<ArticleFour/>}/>
        </Routes>
    </Router>
  );
}

export default App;
