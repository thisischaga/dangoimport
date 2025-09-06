import Footer from '../components/Footer';
import styles from './Admin.module.css';
import logo from '../images/logo.jpeg'
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const AdminLogin = () => {

    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleAdminNameChange = (e)=>{
        setAdminName(e.target.value);
    };
    const handleUserPasswordChange = (e)=>{
        setAdminPassword(e.target.value);
    }
    const hanndleSubmit = async(e)=>{
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('https://dangoimport-server.onrender.com/login', {
                adminName, adminPassword
            });
            alert(response.data.message);
            localStorage.setItem('token', response.data.token);
            navigate('/commandes');

        } catch (error) {
            alert(error.response.data.message);
            console.log('Erreur :', error);
        }
  }
  return(
    <div className={styles.adminsPage} >
        <main>
            <div className={styles.mainContainer} >
                <div>
                    <div className={styles.form}>
                        <div className={styles.formHeader}>
                            <div className={styles.logo}>
                                <img src={logo} alt="logo"/>
                            </div>
                            <h2>Dango Import</h2>
                        </div>
                        <form>
                            <p><input type='text' name='adminName' placeholder='Admin name' onChange={handleAdminNameChange} value={adminName}/></p>
                            <p><input type='password' name='password' placeholder='Mot de passe' onChange={handleUserPasswordChange} value={adminPassword}/></p>
                            <p><button className={styles.btnSubmit} onClick={hanndleSubmit}>{isLoading? 'CONNEXION...': 'SE CONNECTER'}</button></p>
                        </form>
                    </div>
                </div>
            </div>
            
        </main>
        <Footer/>
    </div>
)
}

export default AdminLogin;