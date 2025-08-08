import Footer from '../components/Footer';
import styles from './orders.module.css';
import logo from '../images/logo.jpeg';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';


const Orders = () => {

    const [adminData, setAdminData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [showImag, setShowImg] = useState(false);
    const [tokenIs, setTokenIs] = useState(false);
    //const [backendMessage, setBackendMessage] = useState('');

    const [adminFirstname, setAdminFirstname] = useState('');
    const [adminSurname, setAdminSurname] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [role, setRole] = useState('');

    const location = useLocation();

    const handleImgIsshown = ()=> {
        setShowImg(!showImag);
    };

    const handleFirsnameChange = (e)=>{
        setAdminFirstname(e.target.value);
    };
    const handleSurnameChange = (e)=>{
        setAdminSurname(e.target.value);
    }
    const handleNameChange = (e)=>{
        setAdminName(e.target.value);
    }
    const handlePasswordChange = (e)=>{
        setAdminPassword(e.target.value);
    }
    const handleroleChange = (e)=>{
        setRole(e.target.value);
    }
    const add_admin = async(e)=>{
        e.preventDefault();
        try {
            const response = await axios.post('https://dangoimport-server.onrender.com/add_admin', {
                adminFirstname, adminSurname, adminName, adminPassword, role
            })
            alert(response.data.message);
            window.location.reload();
            } catch (error) {
                alert(error.response.data.message)
                console.log('Erreur', error);
            };
    }
    
    useEffect(()=>{
        const token =  localStorage.getItem('token');
        const fetchData = async()=>{
            if (token) {
                setTokenIs(true)
                try {
                    await axios.get('https://dangoimport-server.onrender.com/admin_data', {
                        headers: {Authorization: `Bearer${token}`}
                    })
                    .then(response => 
                        setAdminData(response.data)
                    )
                    .catch(error => console.error(error)
                    )
                } catch (error) {
                    console.log('Erreur', error);
                };
                try {
                    await axios.get('https://dangoimport-server.onrender.com/commandes', {
                        headers: {Authorization: `Bearer${token}`}
                    })
                    .then(response => 
                        setOrders(response.data)
                    )
                    .catch(error => console.error(error)
                    )
                } catch (error) {
                    console.log('Erreur', error);
                };
            } else {
                setTokenIs(false);
            }
      };
      fetchData();
      
    }, [location.pathname]);
    const updateStatus = async(orderId, status)=>{
        await axios.put('https://dangoimport-server.onrender.com/status', {
        orderId, status,
        })
        window.location.reload();
    };
    const enAttente = orders.filter(o => o.status === 'En attente');
    const validated = orders.filter(o => o.status === 'Validée');
    const acheved = orders.filter(o => o.status === 'Achevée');
    const benin = orders.filter(o => o.selectedCountry === 'Bénin');
    const ghana = orders.filter(o => o.selectedCountry === 'Ghana');
    const togo = orders.filter(o => o.selectedCountry === 'Togo');

    return(
        <div className={styles.ordersPage} >
            {
                tokenIs &&
                <div>
                    <main>
                        
                        <div className={styles.mainContainer}>
                            <div className={styles.header}>
                                <div>
                                    <div className={styles.logo}>
                                        <img src={logo} alt="logo"/>
                                        <h3 >Dango Import</h3>
                                    </div>
                                </div>
                                <nav> 
                                    <h4>{adminData?.username}</h4>
                                    <h4>Rôle: <span>{adminData?.role}</span></h4>
                                    
                                </nav>
                            </div>
                            {adminData?.role === 'dev' && <div >
                                <h4>Ajouter une membre</h4>
                                <div className={styles.adminAddForm}>
                                    
                                    <form onSubmit={add_admin}>
                                        
                                        <input type='text' name='firstname' placeholder='Admin firsname' required value={adminFirstname} onChange={handleFirsnameChange} require/><br/>
                                        <input type='text' name='surname' placeholder='Admin surname' required value={adminSurname} onChange={handleSurnameChange} require/><br/>
                                        <input type='text' name='adminname' placeholder='Adminname' required value={adminName} onChange={handleNameChange} require/><br/>
                                        <input type='password' name='password' placeholder='Admin password' required value={adminPassword} onChange={handlePasswordChange} require/><br/>
                                        <input type='text' name='role' placeholder='Admin role' required value={role} onChange={handleroleChange} require/><br/>
                                        <button type='submit' className={styles.btnSubmit}>Ajouter</button>
                                    </form>
                                </div>
                            </div>}
                            
                            <div className={styles.container}>
                                <div className={styles.dashboard}>
                                    <div className={styles.flex}>
                                        <h1>Dashboard</h1>
                                        <h4 className={styles.ordersCount}>Vous avez reçu <span>{orders.length}</span> {orders.length<1? 'commande': 'commandes'}</h4>
                                    </div>
                                    
                                    <div className={styles.items}>
                                        <h4 >En attente : <br/> <span className={styles.orange}>{enAttente.length}</span></h4>
                                        <h4 >Validé : <br/> <span className={styles.green}>{validated.length} </span></h4>
                                        <h4 >Achevé : <br/> <span className={styles.neutre}>{acheved.length}</span></h4>
                                    </div>
                                    <div className={styles.items}>
                                        <h4>Bénin : <br/><span className={styles.countryLength}>{benin.length}</span></h4>
                                        <h4>Ghana : <br/><span className={styles.countryLength}>{ghana.length}</span></h4>
                                        <h4>Togo : <br/><span className={styles.countryLength}>{togo.length}</span></h4>
                                    </div>
                                </div>
                                <div className={styles.imgCmd}>
                                    <p onClick={handleImgIsshown} >{showImag? 'Masquer les images': 'Afficher les images des produits'}</p>
                                </div>
                                <div className={styles.ordersMain}>
                                    {orders.length !== 0 ?orders.map((item) => (
                                        <div>
                                            <div key={item._id} className={styles.commande}>
                                                <div className={styles.flex}>
                                                    <h1>Commande</h1>
                                                    <p>{item.date}</p>
                                                </div>
                                                <div className={styles.items}>
                                                    <p><span>Nom :</span> {item.userName} </p>
                                                    <p><span>Email :</span> {item.userEmail}</p>
                                                    
                                                </div>
                                                <div className={styles.items}>
                                                    <p><span>Description du produit :</span> {item.productDescription}</p>
                                                </div>
                                                <div className={styles.items}>
                                                    <p><span>Quantité :</span> {item.productQuantity}</p>
                                                    <img src={item.picture} alt='product_picture' className={!showImag?'hidden':''}/>
                                                </div>
                                                <div className={styles.items}>
                                                    <p><span>Pays :</span> {item.selectedCountry}</p>
                                                    <p>Statut : 
                                                        {item.status === 'En attente' && <strong className={styles.statusWaiting } onClick={()=>updateStatus(item._id, item.status)}> {item.status}</strong>}
                                                        {item.status === 'Validée' && <strong className={styles.statusSucess } onClick={()=>updateStatus(item._id, item.status)}> {item.status}</strong>}
                                                        {item.status === 'Achevée' && <strong className={styles.statusNeutre } onClick={()=>updateStatus(item._id, item.status)}> {item.status}</strong>}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )): <h1>Aucune commande</h1>}
                                </div>
                                
                            </div>
                        </div>
                    </main>
                    <Footer/>
                </div>
            }
        </div>
    )
}
//<strong className={item.status === 'En attente'? styles.statusWaiting : styles.statusSucess} onClick={()=>updateStatus(item._id, item.status)} >{item.status}</strong>
export default Orders;