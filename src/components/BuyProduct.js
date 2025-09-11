import { useState } from 'react';
import styles from './buyProduct.module.css';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';



    

const BuyProduct = ({image, name, price, description, isVisibled})=>{

    const [userName, setUserName] = useState('');
    const [userNumber, setUserNumber] = useState('');
    const [productQuantity, setProductQuantity] = useState(1);
    const [userPref, setUserPref] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const [otp, setOtp] = useState('');
    const [checked, setChecked] = useState(true);
    const [otpSystem, setOtpSystem] = useState(false);
    const [messageBoxIs, setMessageBoxIs] = useState(false);

    const [backendMessage, setBackendMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(null);
    const [isError, setIsError] = useState(null);

    const status = 'En attente';
    const benin = 'Bénin';
    const togo = 'Togo';

    const [isLoading, setIsLoading] = useState(false);

    const handleUserNameChange = (e) => setUserName(e.target.value);
    const handleUserNumberChange = (e) => setUserNumber(e.target.value);
    const handlePrefChange= (e) => setUserPref(e.target.value);
    const handlePqChange = (e) => setProductQuantity(e.target.value);
    const handleCountryChange = (e) => setSelectedCountry(e.target.value);
    const handleUserEmailChange = (e) => setUserEmail(e.target.value);

    const handleOtpChange = (e) => setOtp(e.target.value);
    const toggleCheck = () => setChecked(!checked);

    const hiddeForm = () => {
        isVisibled(false);
        window.location.reload();
    };
    
    const toTheOtp = async ()=>{
        const emailValidate = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!userName || !userNumber || !productQuantity || !userPref || !selectedCountry) {
            alert('Veuillez remplir tous les champs !');
        } else if(productQuantity <1){
            alert('Veillez entrer un nombre suppérieur ou égale à 1 !')
        } else if (userNumber.length < 8) {
            alert('Veillez entrer un numéro de téléphone valide !')
        }else if (!emailValidate.test(userEmail)) {
            alert('Entrez un email valide');
        }
        else{
            try {
                setIsLoading(true)
                const res = await axios.post('https://dangoimport-server.onrender.com/api/send-otp', { userEmail });
                if (res.data.message === 'OTP envoyé avec succès') {
                    setOtpSystem(true);
                }
                setBackendMessage(res.data.message);
            } catch (err) {
                setBackendMessage('Erreur lors de l’envoi de l’OTP');
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setIsLoading(true);
        try {
            const otpResponse = await axios.post('https://dangoimport-server.onrender.com/api/verify-otp', {
            userEmail,
            otp,
        });

        if (otpResponse.data.message !== 'OTP vérifié avec succès') {
            setBackendMessage('OTP invalide ou expiré.');
            setIsError(true);
            setMessageBoxIs(true);
            return;
        }

        const commandeResponse = await axios.post('https://dangoimport-server.onrender.com/acheter', {
            userName,
            userNumber,
            productQuantity,
            picture: image,
            userPref,
            selectedCountry,
            userEmail,
            status,
        });

        setBackendMessage(commandeResponse.data.message);
        setIsSuccess(true);
        setOtpSystem(false);
        } catch (error) {
        const message = error.response?.data?.message || 'Une erreur s’est produite. Veuillez réessayer.';
        setBackendMessage(message);
        setIsError(true);
        } finally {
        setIsLoading(false);
        setMessageBoxIs(true);
        }
    };

    
    return(
        <div>
            
            <main>
                <div className={styles.buyingForm}>
                    <button className={styles.hiddenBtn} onClick={hiddeForm}>Annuler</button>
                    <div className={styles.title}>
                        <h1>Acheter</h1>
                    </div>
                    <div className={otpSystem === true || messageBoxIs? 'hidden':''}>
                        <div className={styles.metaData}>
                            <h2>{name} </h2>
                            <h2>Prix : <span>{price} fcfa</span></h2>
                        </div>
                        <div className={styles.form}>
                            
                            <div className={styles.productDes}>
                                <img src={image} alt='productImg'/>
                                <p>
                                    {description}
                                </p>
                            </div>
                            <div>
                                <label>Nom <span>*</span></label><br/>
                                <input type='text' placeholder='Entrez votre nom...'  onChange={handleUserNameChange} value={userName} required/><br/>
                                
                                <label>Préférence <span>*</span></label><br/>
                                <textArea type='text' placeholder='Ajouter des préférences pour ce produit...'  onChange={handlePrefChange} requiredvalue={userPref}/><br/>
                                
                                <label>Téléphone <span>*</span></label><br/>
                                <input type='text' placeholder='EX: +22899152036'  onChange={handleUserNumberChange} value={userNumber} required/><br/>
                                <label>Quantité <span>*</span></label><br/>
                                <input type='number' placeholder='Quantité...'  onChange={handlePqChange} value={productQuantity} required/><br/>
                                <label>Email <span>*</span></label>
                                <input type='email' placeholder='example@gmail.com' onChange={handleUserEmailChange} value={userEmail} required/>
                                <div > 
                                    <div className={styles.radios}> 
                                        <div className={styles.radiosContainer}> 
                                            <input type='radio' className={styles.radioInput} value={benin} checked={selectedCountry === benin} required onChange={handleCountryChange}/> 
                                            <label>Bénin </label><br/> 
                                        </div> 
                                        <div className={styles.radiosContainer}> 
                                            <input type='radio' className={styles.radioInput} value={togo} checked={selectedCountry === togo} required onChange={handleCountryChange} /> 
                                            <label>Togo</label><br/> 
                                        </div> 
                                        
                                    </div> 

                                </div>
                                <button className={styles.btnSubmit} onClick={toTheOtp}>
                                    {isLoading ? 'Patientez...' : 'CONFIRMER'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                         {otpSystem && (
                            <div className={styles.finalStep}>
                                <p>Un code a été envoyé à {userEmail}</p>
                                <p style={{textAlign: 'center'}}><input type='number' maxLength={6} placeholder='* * * * * *' style={{padding: '10px', width: '160px', 
                                    backgroundColor: 'transparent', outline:'none', border: 'none', borderBottom: '3px solid rgb(36, 123, 181)', 
                                    color: 'white', fontWeight:'bold', letterSpacing: '10px', fontSize: '20px', textAlign: 'center'}} value={otp} onChange={handleOtpChange} required/></p>
                                <p>
                                <input type='checkbox' checked={checked} onChange={toggleCheck} />
                                    J'ai lu et j’accepte les <a href='/cgu'>conditions générales d'utilisation</a>
                                </p>
                                {checked && (
                                    <button className={styles.btnSubmit} onClick={handleSubmit}>
                                      {isLoading ? 'Patientez...' : 'CONFIRMER'}
                                    </button>
                                )}
                            </div>
                        )}
                        {messageBoxIs && (
                        <div className={styles.messageBox}>
                            {isSuccess && <FaCheckCircle size={40} color='green' />}
                            {isError && <FaTimesCircle size={40} color='red' />}
                            <h3>{backendMessage}</h3>
                        </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default BuyProduct;

