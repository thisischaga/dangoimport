import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
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


function App() {
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
        <Route path='/blog/finance personnelle' element={<PerFinance/>}/>
        <Route path='/blog/epargne' element={<Epargne/>}/>
      </Routes>
    </Router>
  );
}

export default App;
