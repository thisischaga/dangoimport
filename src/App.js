import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import About from "./pages/About";
import Home from "./pages/Home";
import Services from "./pages/Services";
import AdminLogin from './Admin/AdminLogin';
import Orders from './Admin/Orders';
import './App.css';
import Cgu from './pages/Cgu';
import Politique from './pages/Politique';


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
      </Routes>
    </Router>
  );
}

export default App;
