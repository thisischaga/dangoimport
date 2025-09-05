import { useState } from 'react';
import styles from './devisForm.module.css'
//import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const DevisForm = ({showForm}) =>{

    //const navigate = useNavigate()

    const [setpOne, setStepOne] = useState(true);
    const [setpTwo, setStepTwo] = useState(false);
    const [setpThree, setStepThree] = useState(false);
    const [finalStep, setFianalStep] = useState(false);
    const [otpSystem, setOtpSystem] = useState(false);
    const [messageBoxIs, setMessageBoxIs] = useState(false);

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [categorie, setCategorie] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [picture, setPicture] = useState(null);
    let status = 'En attente';

   
    
    const [backendMessage, setBackendMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(null);
    const [isError, setIsError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [selectedCountry, setSelectedCountry] = useState('');
    const benin = 'Bénin'; 
    const togo = 'Togo';

    const [checked, setChecked] = useState(true);

    const toggleCheck = ()=>{
        setChecked(!checked);
        
    };
    const handleCountryChange = (e) => {
        setSelectedCountry(e.target.value);
    };
    const hiddeForm = ()=>{
        showForm(false);
        window.location.reload();
    }
    const handleUserNameChange = (e)=>{
        setUserName(e.target.value);
    };
    const handleUserEmailChange = (e)=>{
        setUserEmail(e.target.value);
    }
    const categories = [
        'Électronique',
        'Vêtements',
        'Alimentation',
        'Maison',
        'Sport',
    ];

    const handleCatChange = (e) => {
        setCategorie(e.target.value);
        console.log(categorie);
    };
    const handlePqChange = (e)=>{
        setProductQuantity(e.target.value);
    }
    const showStepTwo = (e)=>{
        const emailValidate = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        e.preventDefault();
        if (userName === '' || userEmail === '') {
            alert('Veillez remplir tous les champs !')
        }else if (!emailValidate.test(userEmail)) {
            alert('Entrez un email valide');
        }else{
            setStepOne(false);
            setStepTwo(true);
            setStepThree(false);
            setFianalStep(false);
            setOtpSystem(false);
        }
    };
    const showStepThree = (e)=>{
        e.preventDefault();
        if (categorie === '' || productQuantity === '') {
            alert('Veillez remplir tous les champs !')
        }else {
            setStepOne(false);
            setStepTwo(false);
            setStepThree(true);
            setFianalStep(false);
            setOtpSystem(false);
        }
    };
    const showFinalStep = (e)=>{
        e.preventDefault();
        setStepOne(false);
        setStepTwo(false);
        setStepThree(false);
        setFianalStep(true);
        setOtpSystem(false);
    }
    const toOtpSystem = async(e)=>{
        e.preventDefault();
        
        try {
            const res = await axios.post('https://dangoimport-server.onrender.com/api/send-otp', { userEmail });
            setIsLoading(true)
            if (res.data.message === 'otp envoyé') {
                setStepOne(false);
                setStepTwo(false);
                setStepThree(false);
                setFianalStep(false);
                setOtpSystem(true);
            }
            
            setBackendMessage(res.data.message);
        } catch (err) {
            setBackendMessage('Erreur lors de l’envoi de l’OTP');
        } finally{
            setIsLoading(false)
        }
    }
    const [otp, setOtp] = useState('');
    const handleOtpChange = (e)=>{
        setOtp(e.target.value);
    }

    const handlePictureChange = (e)=>{
        try{ 
        const file = e.target.files?.[0];
        if(file){
            const reader = new FileReader();
            reader.onload = ()=>{
            setPicture(reader.result);
            }
            reader.readAsDataURL(file);
        }
        }catch(error){
            console.log('Erreur', error)
        }
    }
    const handleSubmit = async (e)=>{
        e.preventDefault();
        try {
            setIsLoading(true);
            const res = await axios.post('https://dangoimport-server.onrender.com/api/verify-otp', { userEmail, otp });
            setBackendMessage(res.data.message);
            const response = await axios.post('https://dangoimport-server.onrender.com/commander', {
                userName, userEmail, categorie, productQuantity, picture, selectedCountry, status
            });
            setBackendMessage(response.data.message);
            if (backendMessage) {
                setStepOne(false);
                setStepTwo(false);
                setStepThree(false);
                setFianalStep(false);
                setOtpSystem(false);
            }
            setIsSuccess(true);
            setFianalStep(false);
        } catch (error) {
            setBackendMessage('OTP invalide ou expiré.');
            setIsError(true);
            setBackendMessage(error.response.data.message);
            setFianalStep(false);
            console.log('Erreur', error);
        }finally {
            setMessageBoxIs(true);
            setIsLoading(false);
        } 
        
        
    }
    
    const goBackStepOne = (e)=>{
        e.preventDefault();
        setStepOne(true);
        setStepTwo(false);
        setStepThree(false);
        setFianalStep(false);
    };
    const goBackStepTwo = (e)=>{
        e.preventDefault();
        setStepOne(false);
        setStepTwo(true);
        setStepThree(false);
        setFianalStep(false)
    }
    const goBackStepThree = (e)=>{
        e.preventDefault();
        setStepOne(false);
        setStepTwo(false);
        setStepThree(true);
        setFianalStep(false)
    }
    
    return(
        <main >
            
            <div className={styles.container}>
                <h5 className={styles.hiddenBtn} onClick={hiddeForm}>Fermer</h5>
                <div  className={!finalStep || backendMessage? styles.intro: 'hidden'}>
                    <div >
                        <h3 className={backendMessage || otpSystem? 'hidden': ''}>Vous souhaitez commander un article depuis la Chine?</h3>
                        <p className={backendMessage || otpSystem? 'hidden':''}>
                            Remplissez le formulaire ci-dessous avec les détails de votre commande.
                        </p>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <form className={setpOne?'': 'hidden'}> 
                        <label>Nom <span>*</span></label><br/>
                        <input type='text' name='user_name' placeholder='Entrez votre nom...' onChange={handleUserNameChange} value={userName} required/><br/>
                        <label>Addresse E-mail <span>*</span></label><br/>
                        <input type='email' name='Email' placeholder='Email' onChange={handleUserEmailChange} value={userEmail} required/><br/>
                        <div >
                            <div className={styles.radios}> 
                                <div className={styles.radiosContainer}>
                                    <input type='radio'  className={styles.radioInput} value={benin} checked={selectedCountry === benin} onChange={handleCountryChange}/>
                                    <label>Bénin </label><br/>
                                </div>
                                <div className={styles.radiosContainer}>                            
                                    <input type='radio' className={styles.radioInput}  value={togo} checked={selectedCountry === togo} onChange={handleCountryChange} />
                                    <label>Togo</label><br/>
                                </div>
                            </div>
                        </div>
                        <button className={styles.btnSubmit} onClick={showStepTwo}>SUIVANT</button>
                        <p>
                            Nous allons étudier votre dossier et vous enverrons un devis personnalisé dans les plus brefs delais.
                            Livraison possible au Bénin et au Togo Contact direct possible aussi sur whatsApp sur le +229 01 59 38 71 80 / 01 41 52 98 50 contact@dangoimport.com
                        </p>
                    </form>
                    <form className={setpTwo?'': 'hidden'}>
                        <button className={setpOne?'hidden': styles.backBtn} onClick={goBackStepOne}>Précédent</button>
                        <div>
                            <label htmlFor="categorie" style={{ fontWeight: 'bold' }}>
                                Choisissez une catégorie de produit :
                            </label>
                            <br />
                            <select
                                id="categorie"
                                value={categorie}
                                onChange={handleCatChange}
                            >
                                <option value="">Sélectionnez une catégorie</option>
                                {categories.map((cat, index) => (
                                <option key={index} value={cat}>
                                    {cat}
                                </option>
                                ))}
                            </select>
                        </div>
                        <label>Quantité du produit <span>*</span></label><br/>
                        <input type='number'  name='product_quantity' placeholder='Le nombre de produit...' onChange={handlePqChange} value={productQuantity} /><br/>
                        
                        <button className={styles.btnSubmit} onClick={showStepThree}>SUIVANT</button>
                        <p>
                            Nous allons étudier votre dossier et vous enverrons un devis personnalisé dans les plus brefs delais.
                            Livraison possible au Bénin et au Togo Contact direct possible aussi sur whatsApp sur le +229 01 59 38 71 80 / 01 41 52 98 50 contact@dangoimport.com
                        </p>
                    </form>
                    <form className={setpThree?'': 'hidden'}> 
                        <button className={setpOne?'hidden': styles.backBtn} onClick={goBackStepTwo}>Précédent</button>
                        <div className={styles.pictureManager}>
                            <div className={styles.flex}>
                                {!picture && <div>
                                    <input type='file' accept='image/*' id='file' onChange={handlePictureChange} required/>
                                    <label htmlFor='file'>{picture? 'Changer la photo':'Ajouter une photo'}</label>
                                </div>}
                                {picture && <div>
                                    <img src={picture} alt='product-picture'/>
                                </div>}
                            </div>   
                        </div>
                        <button className={styles.btnSubmit} onClick={showFinalStep}>SUIVANT</button>
                        <p>
                            Nous allons étudier votre dossier et vous enverrons un devis personnalisé dans les plus brefs delais.
                            Livraison possible au Bénin et au Togo Contact direct possible aussi sur whatsApp sur le +229 01 59 38 71 80 / 01 41 52 98 50 contact@dangoimport.com
                        </p>
                    </form>
                    <div className={finalStep?styles.finalStep: 'hidden'}>
                        <button className={setpOne?'hidden': styles.backBtn} onClick={goBackStepThree}>Précédent</button>
                        <h3>Confirmer la commande </h3>
                        <p>Nom : {userName} </p>
                        <p>Addresse E-mail : {userEmail} </p>
                        <p>Catégorie : {categorie} </p>
                        <p>Quantité du produit désiré : {productQuantity} </p>
                        <p>Pays de livraison : {selectedCountry} </p>
                        <p>Photo du produit : </p>
                        <img src={picture} alt='product-picture' width={200} height={220} />
                        {checked &&<button className={styles.btnSubmit} onClick={toOtpSystem}>{isLoading? 'Patientez...': 'ENVOYER'} </button>}
                        <p>
                            Nous allons étudier votre dossier et vous enverrons un devis personnalisé dans les plus brefs delais.
                            Livraison possible au Bénin et au Togo Contact direct possible aussi sur whatsApp sur le +229 01 59 38 71 80 / 01 41 52 98 50 contact@dangoimport.com
                        </p>
                    </div>
                    <div className={otpSystem?styles.finalStep: 'hidden'}>
                        <button className={setpOne?'hidden': styles.backBtn} onClick={goBackStepThree}>Précédent</button>
                        <p style={{textAlign: 'center'}}>Un code a été envoyé à {userEmail}</p>
                        <p style={{textAlign: 'center'}}><input type='text' maxLength={6} placeholder='code à 6 chiffres' 
                            style={{padding: '10px', width: '110px', 
                            backgroundColor: 'transparent', outline:'none', border: 'none', borderBottom: '3px solid rgb(36, 123, 181)', 
                            color: 'white', fontWeight:'bold', letterSpacing: '10px', fontSize: '20px', textAlign: 'center'}} 
                            value={otp} onChange={handleOtpChange} required/></p>
                        <p><input type='checkbox' value={checked} onChange={toggleCheck} checked={checked}/> lu et approuvé les <a href='/cgu'>conditions générales d'utilisation</a></p>
                        {checked &&<button className={styles.btnSubmit} onClick={handleSubmit}>{isLoading? 'Patientez...': 'CONFIRMER'} </button>}
                        <p>
                            Nous allons étudier votre dossier et vous enverrons un devis personnalisé dans les plus brefs delais.
                            Livraison possible au Bénin et au Togo Contact direct possible aussi sur whatsApp sur le +229 01 59 38 71 80 / 01 41 52 98 50 contact@dangoimport.com
                        </p>
                    </div>
                    <div className={messageBoxIs?styles.messageBox: 'hidden'}>
                        
                        {isSuccess && <p className={styles.success}><FaCheckCircle size={40} style={{ marginRight: 8 }} color='green' /></p>}
                        {isError && <p className={styles.error}><FaTimesCircle size={40} style={{ marginRight: 8 }} color='red'/></p>}
                        <h3>{backendMessage} </h3>
                    </div>
               </div>
            </div>
            
        </main>
    )
}
export default DevisForm;