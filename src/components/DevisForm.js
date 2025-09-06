import { useState } from 'react';
import styles from './devisForm.module.css';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const DevisForm = ({ showForm }) => {
  const [stepOne, setStepOne] = useState(true);
  const [stepTwo, setStepTwo] = useState(false);
  const [stepThree, setStepThree] = useState(false);
  const [finalStep, setFinalStep] = useState(false);
  const [otpSystem, setOtpSystem] = useState(false);
  const [messageBoxIs, setMessageBoxIs] = useState(false);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [categorie, setCategorie] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [picture, setPicture] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [otp, setOtp] = useState('');
  const [checked, setChecked] = useState(true);

  const [backendMessage, setBackendMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hideBtn, setHideBtn] = useState(false);

  const status = 'En attente';
  const benin = 'Bénin';
  const togo = 'Togo';

  const handleUserNameChange = (e) => setUserName(e.target.value);
  const handleUserEmailChange = (e) => setUserEmail(e.target.value);
  const handleCatChange = (e) => setCategorie(e.target.value);
  const handlePqChange = (e) => setProductQuantity(e.target.value);
  const handleCountryChange = (e) => setSelectedCountry(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);
  const toggleCheck = () => setChecked(!checked);

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPicture(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const hiddeForm = () => {
    showForm(false);
    window.location.reload();
  };

  const showStepTwo = (e) => {
    e.preventDefault();
    const emailValidate = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userName || !userEmail) {
      alert('Veuillez remplir tous les champs !');
    } else if (!emailValidate.test(userEmail)) {
      alert('Entrez un email valide');
    } else {
      setStepOne(false);
      setStepTwo(true);
    }
  };

  const showStepThree = (e) => {
    e.preventDefault();
    if (!categorie || !productQuantity) {
      alert('Veuillez remplir tous les champs !');
    } else {
      setStepTwo(false);
      setStepThree(true);
    }
  };

  const showFinalStep = (e) => {
    e.preventDefault();
    setStepThree(false);
    setFinalStep(true);
  };

  const toOtpSystem = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setHideBtn(true);
    try {
      const res = await axios.post('https://dangoimport-server.onrender.com/api/send-otp', { userEmail });
      if (res.data.message === 'otp envoyé') {
        setFinalStep(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const otpResponse = await axios.post('https://dangoimport-server.onrender.com/api/verify-otp', {
        userEmail,
        otp,
      });

      if (otpResponse.data.message !== 'OTP vérifié avec succès !') {
        setBackendMessage('OTP invalide ou expiré.');
        setIsError(true);
        setMessageBoxIs(true);
        return;
      }

      const commandeResponse = await axios.post('https://dangoimport-server.onrender.com/commander', {
        userName,
        userEmail,
        categorie,
        productQuantity,
        picture,
        selectedCountry,
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

  const goBackStep = (step) => (e) => {
    e.preventDefault();
    setStepOne(false);
    setStepTwo(false);
    setStepThree(false);
    setFinalStep(false);
    setOtpSystem(false);
    step();
  };

  const categories = ['Électronique', 'Vêtements', 'Alimentation', 'Maison', 'Sport'];

  return (
    <main>
      <div className={styles.container}>
        <h5 className={styles.hiddenBtn} onClick={hiddeForm}>Fermer</h5>

        {/* Intro */}
        {!finalStep && !backendMessage && !otpSystem && (
          <div className={styles.intro}>
            <h3>Vous souhaitez commander un article depuis la Chine ?</h3>
            <p>Remplissez le formulaire ci-dessous avec les détails de votre commande.</p>
          </div>
        )}

        <div className={styles.formGroup}>
          {/* Étape 1 */}
          {stepOne && (
            <form>
              <label>Nom <span>*</span></label>
              <input type='text' placeholder='Entrez votre nom...' onChange={handleUserNameChange} value={userName} />
              <label>Email <span>*</span></label>
              <input type='email' placeholder='Email' onChange={handleUserEmailChange} value={userEmail} />
              <div > 
                <div className={styles.radios}> 
                    <div className={styles.radiosContainer}> 
                        <input type='radio' className={styles.radioInput} value={benin} checked={selectedCountry === benin} onChange={handleCountryChange}/> 
                        <label>Bénin </label><br/> 
                    </div> <div className={styles.radiosContainer}> 
                        <input type='radio' className={styles.radioInput} value={togo} checked={selectedCountry === togo} onChange={handleCountryChange} /> 
                        <label>Togo</label><br/> 
                    </div> 
                </div> 
              </div>

              <button className={styles.btnSubmit} onClick={showStepTwo}>SUIVANT</button>
            </form>
          )}

          {/* Étape 2 */}
          {stepTwo && (
            <form>
              <button className={styles.backBtn} onClick={goBackStep(() => setStepOne(true))}>Précédent</button>
              <label>Catégorie de produit :</label>
              <select value={categorie} onChange={handleCatChange}>
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>

              <label>Quantité <span>*</span></label>
              <input type='number' placeholder='Quantité' onChange={handlePqChange} value={productQuantity} />

              <button className={styles.btnSubmit} onClick={showStepThree}>SUIVANT</button>
            </form>
          )}

          {/* Étape 3 */}
          {stepThree && (
            <form>
              <button className={styles.backBtn} onClick={goBackStep(() => setStepTwo(true))}>Précédent</button>
              <label>Ajouter une image :</label>
              <input type='file' accept='image/*' onChange={handlePictureChange} />
              {picture && <img src={picture} alt="Produit" width={200} />}

              <button className={styles.btnSubmit} onClick={showFinalStep}>SUIVANT</button>
            </form>
          )}

          {/* Étape 4 : Récap + bouton envoi */}
          {finalStep && (
            <div className={styles.finalStep}>
              <button className={styles.backBtn} onClick={goBackStep(() => setStepThree(true))}>Précédent</button>
              <h3>Confirmer la commande</h3>
              <p><strong>Nom :</strong> {userName}</p>
              <p><strong>Email :</strong> {userEmail}</p>
              <p><strong>Catégorie :</strong> {categorie}</p>
              <p><strong>Quantité :</strong> {productQuantity}</p>
              <p><strong>Pays :</strong> {selectedCountry}</p>
              {picture && <img src={picture} alt="Produit" width={200} />}
              <button disabled={hideBtn} className={styles.btnSubmit} onClick={toOtpSystem}>
                {isLoading ? 'Patientez...' : 'ENVOYER'}
              </button>
            </div>
          )}

          {/* OTP */}
          {otpSystem && (
            <div className={styles.finalStep}>
              <p>Un code a été envoyé à {userEmail}</p>
              <p style={{textAlign: 'center'}}><input type='text' maxLength={6} placeholder='code à 6 chiffres' style={{padding: '10px', width: '160px', 
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

          {/* Message final */}
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
  );
};

export default DevisForm;
