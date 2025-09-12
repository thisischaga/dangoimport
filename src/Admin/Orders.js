import Footer from '../components/Footer';
import styles from './orders.module.css';
import logo from '../images/logo.jpeg';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';


const Orders = () => {

    const [adminData, setAdminData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [achats, setAchats] = useState([]);
    const [showImag, setShowImg] = useState(false);
    const [tokenIs, setTokenIs] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
            setIsLoading(true);
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
                    setIsLoading(true);
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
                }finally {
                    setIsLoading(false);
                };
                try {
                    setIsLoading(true);
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
                }finally {
                    setIsLoading(false);
                };
                try {
                    setIsLoading(true);
                    await axios.get('https://dangoimport-server.onrender.com/achats', {
                        headers: {Authorization: `Bearer${token}`}
                    })
                    .then(response => 
                        setAchats(response.data)
                    )
                    .catch(error => console.error(error)
                    )
                } catch (error) {
                    console.log('Erreur', error);
                }finally {
                    setIsLoading(false);
                }
            } else {
                setTokenIs(false);
            }
      };
      fetchData();
      
    }, [location.pathname]);
    const updateStatus = async (orderId, currentStatus) => {
        let nextStatus = currentStatus;

        if (currentStatus === "En attente") nextStatus = "Validée";
        else if (currentStatus === "Validée") nextStatus = "Achevée";
        else if (currentStatus === "Achevée") nextStatus = "En attente"; 

        try {
            const res = await axios.put("https://dangoimport-server.onrender.com/devis/status", {
            orderId,
            status: nextStatus,
            });

            const updatedOrder = res.data;

            setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order._id === orderId ? { ...order, status: updatedOrder.status } : order
            )
            );
        } catch (err) {
            console.error("Erreur update commande:", err);
        }
    };

    const updateStatusA = async (achatId, currentStatus) => {
        let nextStatus = currentStatus;

        if (currentStatus === "En attente") nextStatus = "Validée";
        else if (currentStatus === "Validée") nextStatus = "Achevée";
        else if (currentStatus === "Achevée") nextStatus = "En attente";

        try {
            const res = await axios.put("https://dangoimport-server.onrender.com/achat/status", {
            orderId: achatId,
            status: nextStatus,
            });

            const updatedAchat = res.data;

            setAchats((prevAchats) =>
            prevAchats.map((achat) =>
                achat._id === achatId ? { ...achat, status: updatedAchat.status } : achat
            )
            );
        } catch (err) {
            console.error("Erreur update achat:", err);
        }
    };

    
    const enAttente = orders.filter(o => o.status === 'En attente');
    const validated = orders.filter(o => o.status === 'Validée');
    const acheved = orders.filter(o => o.status === 'Achevée');
    const benin = orders.filter(o => o.selectedCountry === 'Bénin');
    const togo = orders.filter(o => o.selectedCountry === 'Togo');

    const enAttenteA = achats.filter(o => o.status === 'En attente');
    const validateda = achats.filter(o => o.status === 'Validée');
    const achevedA = achats.filter(o => o.status === 'Achevée');
    const beninA = achats.filter(o => o.selectedCountry === 'Bénin');
    const togoA = achats.filter(o => o.selectedCountry === 'Togo');

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
                                    {isLoading? <h1>Loading...</h1>:<div>
                                        <div className={styles.flex}>
                                            <h1>Dashboard</h1>
                                            <h4 className={styles.ordersCount}>Vous avez reçu <span>{orders.length}</span> {orders.length<1? 'commande': 'commandes'}</h4>
                                        </div>
                                        
                                        <div className={styles.items}>
                                            <h4 >En attente : <br/> <span className={styles.orange}>{enAttente.length + enAttenteA.length}</span></h4>
                                            <h4 >Validé : <br/> <span className={styles.green}>{validated.length + validateda.length} </span></h4>
                                            <h4 >Achevé : <br/> <span className={styles.neutre}>{acheved.length + achevedA.length}</span></h4>
                                        </div>
                                        <div className={styles.items}>
                                            <h4>Bénin : <br/><span className={styles.countryLength}>{benin.length + beninA.length}</span></h4>
                                            <h4>Togo : <br/><span className={styles.countryLength}>{togo.length + togoA.length}</span></h4>
                                        </div>
                                    </div>}
                                </div>
                                <div className={styles.imgCmd}>
                                    <p onClick={handleImgIsshown} >{showImag? 'Masquer les images': 'Afficher les images des produits'}</p>
                                </div>
                                <div className={styles.ordersMain}>
                                    {isLoading === true ? <h1>Loading...</h1>:<div>
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
                                            
                                        )): <h1>Aucune demande de devis</h1>}
                                    </div>}
                                    {isLoading === true ? <h1>Loading...</h1>:<div>
                                        {achats.length !== 0 ?achats.map((item) => (
                                            <div>
                                                <div key={item._id} className={styles.commande}>
                                                    <div className={styles.flex}>
                                                        <h1>Achat</h1>
                                                        <p>{item.date}</p>
                                                    </div>
                                                    <div className={styles.items}>
                                                        <p><span>Nom :</span> {item.userName} </p>
                                                        <p><span>Email :</span> {item.userEmail}</p>
                                                        <p><span>Téléphone :</span> {item.userNumber}</p>
                                                    </div>
                                                    <div className={styles.items}>
                                                        <p><span>Préférences de l'utilisateur :</span> {item.userPref}</p>
                                                    </div>
                                                    <div className={styles.items}>
                                                        <p><span>Quantité :</span> {item.productQuantity}</p>
                                                        <img src={item.picture} alt='product_picture' className={!showImag?'hidden':''}/>
                                                    </div>
                                                    <div className={styles.items}>
                                                        <p><span>Pays :</span> {item.selectedCountry}</p>
                                                        <p>Statut : 
                                                            {item.status === 'En attente' && <strong className={styles.statusWaiting } onClick={()=>updateStatusA(item._id, item.status)}> {item.status}</strong>}
                                                            {item.status === 'Validée' && <strong className={styles.statusSucess } onClick={()=>updateStatusA(item._id, item.status)}> {item.status}</strong>}
                                                            {item.status === 'Achevée' && <strong className={styles.statusNeutre } onClick={()=>updateStatusA(item._id, item.status)}> {item.status}</strong>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                        )): <h1>Aucun achat</h1>}
                                    </div>}
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