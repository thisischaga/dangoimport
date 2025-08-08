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
    const [messageBoxIs, setMessageBoxIs] = useState(false);

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productQuantity, setProductQuantity] = useState('');
    const [picture, setPicture] = useState(null);
    let status = 'En attente';

   
    
    const [backendMessage, setBackendMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(null);
    const [isError, setIsError] = useState(null);
    const [isLoading, setIsLoading] = useState(false)

    const [selectedCountry, setSelectedCountry] = useState('');
    const benin = 'Bénin';
    const ghana = 'Ghana';  
    const togo = 'Togo';

    const [checked, setChecked] = useState(true);

    const toggleCheck = ()=>{
        setChecked(!checked);
        
    };
    console.log(checked);
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
    const handlePdChange = (e)=>{
        setProductDescription(e.target.value);
    }
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
            setFianalStep(false)
        }
    };
    const showStepThree = (e)=>{
        e.preventDefault();
        setStepOne(false);
        setStepTwo(false);
        setStepThree(true);
        setFianalStep(false)
    };
    const showFinalStep = (e)=>{
        e.preventDefault();
        setStepOne(false);
        setStepTwo(false);
        setStepThree(false);
        setFianalStep(true)
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
        
        if (productDescription === '' || productQuantity === '') {
            alert('Veillez remplir tous les champs !')
        } else {
            try {
                setIsLoading(true);
                const response = await axios.post('http://localhost:8000/commander', {
                    userName, userEmail, productDescription, productQuantity, picture, selectedCountry, status
                });
                setBackendMessage(response.data.message);
                setIsSuccess(true);
                setFianalStep(false);
            } catch (error) {
                setIsError(true);
                setBackendMessage(error.response.data.message);
                setFianalStep(false);
                console.log('Erreur', error);
            } finally {
                setMessageBoxIs(true);
                setIsLoading(false);
            } 
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
        <div className={styles.container}>
            
            <div>
                <h5 className={styles.hiddenBtn} onClick={hiddeForm}>Fermer</h5>
                <div  className={!finalStep || backendMessage? styles.intro: 'hidden'}>
                    <div >
                        <h3 className={backendMessage? 'hidden': ''}>Vous souhaitez commander un article depuis la Chine?</h3>
                        <p className={backendMessage? 'hidden':''}>
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
                                    <input type='radio' className={styles.radioInput}  value={ghana} checked={selectedCountry === ghana} onChange={handleCountryChange} />
                                    <label>Ghana</label><br/>
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
                            Livraison possible au Bénin, au Togo et au Ghana. Contact direct possible aussi sur whatsApp sur le +229 01 59 38 71 80 / 01 41 52 98 50
                        </p>
                    </form>
                    <form className={setpTwo?'': 'hidden'}>
                        <button className={setpOne?'hidden': styles.backBtn} onClick={goBackStepOne}>Précédent</button>
                        <label>Description du produit (ajoutez le lien vers le produit si possible) <span>*</span></label><br/>
                        <textarea  name='product_description' placeholder='Décrivez votre...' onChange={handlePdChange} value={productDescription} /><br/>
                        <label>Quantité du produit <span>*</span></label><br/>
                        <input type='number'  name='product_quantity' placeholder='Le nombre de produit...' onChange={handlePqChange} value={productQuantity} /><br/>
                        
                        <button className={styles.btnSubmit} onClick={showStepThree}>SUIVANT</button>
                        <p>
                            Nous allons étudier votre dossier et vous enverrons un devis personnalisé dans les plus brefs delais.
                            Livraison possible au Bénin, au Togo et au Ghana. Contact direct possible aussi sur whatsApp sur le +229 01 59 38 71 80 / 01 41 52 98 50
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
                            Livraison possible au Bénin, au Togo et au Ghana. Contact direct possible aussi sur whatsApp sur le +229 01 59 38 71 80 / 01 41 52 98 50
                        </p>
                    </form>
                    <div className={finalStep?styles.finalStep: 'hidden'}>
                        <button className={setpOne?'hidden': styles.backBtn} onClick={goBackStepThree}>Précédent</button>
                        <h3>Confirmer la commande </h3>
                        <p>Nom : {userName} </p>
                        <p>Addresse E-mail : {userEmail} </p>
                        <p>Description de votre produit désiré : {productDescription} </p>
                        <p>Quantité du produit désiré : {productQuantity} </p>
                        <p>Pays de livraison : {selectedCountry} </p>
                        <p>Photo du produit : </p>
                        <img src={picture} alt='product-picture' width={200} height={220} />
                        <p><input type='checkbox' value={checked} onChange={toggleCheck} checked={checked}/> lu et approuvé les <a href='/cgu'>conditions générales d'utilisation</a></p>
                        {checked &&<button className={styles.btnSubmit} onClick={handleSubmit}>{isLoading? 'Envoie de la commande...': 'CONFIRMER'} </button>}
                        <p>
                            Nous allons étudier votre dossier et vous enverrons un devis personnalisé dans les plus brefs delais.
                            Livraison possible au Bénin, au Togo et au Ghana. Contact direct possible aussi sur whatsApp sur le +229 01 59 38 71 80 / 01 41 52 98 50
                        </p>
                    </div>
                    <div className={messageBoxIs?styles.messageBox: 'hidden'}>
                        
                        {isSuccess && <p className={styles.success}><FaCheckCircle size={40} style={{ marginRight: 8 }} color='green' /></p>}
                        {isError && <p className={styles.error}><FaTimesCircle size={40} style={{ marginRight: 8 }} color='red'/></p>}
                        <h3>{backendMessage} </h3>
                    </div>
               </div>
            </div>
            
        </div>
    )
}
export default DevisForm;