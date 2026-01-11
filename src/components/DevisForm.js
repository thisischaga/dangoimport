import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTimes, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import styles from './devisForm.module.css';

const DevisForm = ({ showForm }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [otpStep, setOtpStep] = useState(false);
  const [messageBoxIs, setMessageBoxIs] = useState(false);

  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    categorie: '',
    productQuantity: 1,
    picture: null,
    productDescription: '',
    selectedCountry: '',
    otp: '',
    checked: true,
  });

  const [state, setState] = useState({
    backendMessage: '',
    isSuccess: null,
    isError: null,
    isLoading: false,
    hideBtn: false,
  });

  const categories = [
    'Électronique',
    'Vêtements',
    'Alimentation',
    'Maison',
    'Sport',
    'Beauté',
    'Autres (précisez dans la description)',
  ];

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormData({ ...formData, picture: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const hideForm = () => {
    showForm(false);
    window.location.reload();
  };

  const validateStep = (step) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    switch (step) {
      case 1:
        if (!formData.userName || !formData.userEmail || !formData.selectedCountry) {
          alert('Veuillez remplir tous les champs obligatoires !');
          return false;
        }
        if (!emailRegex.test(formData.userEmail)) {
          alert('Veuillez entrer un email valide');
          return false;
        }
        return true;
      case 2:
        if (!formData.categorie || !formData.productQuantity) {
          alert('Veuillez remplir tous les champs obligatoires !');
          return false;
        }
        return true;
      case 3:
        if (!formData.productDescription) {
          alert('Veuillez ajouter une description du produit !');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e) => {
    e.preventDefault();
    setCurrentStep(currentStep - 1);
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setState({ ...state, isLoading: true, hideBtn: true });
    
    try {
      const res = await axios.post(
        'https://dangoimport-server.onrender.com/api/send-otp',
        { userEmail: formData.userEmail }
      );
      
      if (res.data.message === 'OTP envoyé avec succès') {
        setOtpStep(true);
        setCurrentStep(0);
      }
      setState({ ...state, backendMessage: res.data.message, isLoading: false });
    } catch (err) {
      setState({
        ...state,
        backendMessage: 'Erreur lors de l\'envoi de l\'OTP',
        isError: true,
        isLoading: false,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({ ...state, isLoading: true });

    try {
      const otpResponse = await axios.post(
        'https://dangoimport-server.onrender.com/api/verify-otp',
        { userEmail: formData.userEmail, otp: formData.otp }
      );

      if (otpResponse.data.message !== 'OTP vérifié avec succès') {
        setState({
          ...state,
          backendMessage: 'OTP invalide ou expiré.',
          isError: true,
          isLoading: false,
        });
        setMessageBoxIs(true);
        return;
      }

      const commandeResponse = await axios.post(
        'https://dangoimport-server.onrender.com/commander',
        {
          ...formData,
          status: 'En attente',
        }
      );

      setState({
        ...state,
        backendMessage: commandeResponse.data.message,
        isSuccess: true,
        isLoading: false,
      });
      setOtpStep(false);
      setMessageBoxIs(true);
    } catch (error) {
      const message = error.response?.data?.message || 'Une erreur s\'est produite.';
      setState({
        ...state,
        backendMessage: message,
        isError: true,
        isLoading: false,
      });
      setMessageBoxIs(true);
    }
  };

  const renderProgressBar = () => (
    <div className={styles.progressBar}>
      {[1, 2, 3, 4].map((step) => (
        <div
          key={step}
          className={`${styles.progressStep} ${
            currentStep >= step ? styles.progressStepActive : ''
          }`}
        >
          <div className={styles.progressCircle}>{step}</div>
          {step < 4 && <div className={styles.progressLine} />}
        </div>
      ))}
    </div>
  );

  return (
    <main className={styles.main}>
      <div className={styles.overlay} onClick={hideForm} />
      <div className={styles.container}>
        <button className={styles.closeBtn} onClick={hideForm}>
          <FaTimes size={24} />
        </button>

        {!otpStep && !messageBoxIs && (
          <>
            <div className={styles.header}>
              <h2>Demande de devis</h2>
              <p>Commandez vos produits depuis la Chine en toute simplicité</p>
            </div>

            {renderProgressBar()}
          </>
        )}

        <div className={styles.formContent}>
          {currentStep === 1 && (
            <form className={styles.form}>
              <h3 className={styles.stepTitle}>Informations personnelles</h3>
              
              <div className={styles.inputGroup}>
                <label>Nom complet <span>*</span></label>
                <input
                  type="text"
                  placeholder="Entrez votre nom..."
                  onChange={handleInputChange('userName')}
                  value={formData.userName}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email <span>*</span></label>
                <input
                  type="email"
                  placeholder="exemple@email.com"
                  onChange={handleInputChange('userEmail')}
                  value={formData.userEmail}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Pays de livraison <span>*</span></label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      value="Bénin"
                      checked={formData.selectedCountry === 'Bénin'}
                      onChange={handleInputChange('selectedCountry')}
                    />
                    <span>🇧🇯 Bénin</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      value="Togo"
                      checked={formData.selectedCountry === 'Togo'}
                      onChange={handleInputChange('selectedCountry')}
                    />
                    <span>🇹🇬 Togo</span>
                  </label>
                </div>
              </div>

              <button className={styles.btnNext} onClick={nextStep}>
                Suivant
              </button>
            </form>
          )}

          {currentStep === 2 && (
            <form className={styles.form}>
              <button className={styles.btnBack} onClick={prevStep}>
                <FaArrowLeft /> Précédent
              </button>

              <h3 className={styles.stepTitle}>Détails du produit</h3>

              <div className={styles.inputGroup}>
                <label>Catégorie <span>*</span></label>
                <select
                  value={formData.categorie}
                  onChange={handleInputChange('categorie')}
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Quantité <span>*</span></label>
                <input
                  type="number"
                  min="1"
                  placeholder="Quantité"
                  onChange={handleInputChange('productQuantity')}
                  value={formData.productQuantity}
                />
              </div>

              <button className={styles.btnNext} onClick={nextStep}>
                Suivant
              </button>
            </form>
          )}

          {currentStep === 3 && (
            <form className={styles.form}>
              <button className={styles.btnBack} onClick={prevStep}>
                <FaArrowLeft /> Précédent
              </button>

              <h3 className={styles.stepTitle}>Description & Image</h3>

              <div className={styles.inputGroup}>
                <label>Image du produit</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePictureChange}
                  className={styles.fileInput}
                />
                {formData.picture && (
                  <div className={styles.imagePreview}>
                    <img src={formData.picture} alt="Produit" />
                  </div>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Description du produit <span>*</span></label>
                <textarea
                  placeholder="Décrivez votre produit en détail..."
                  onChange={handleInputChange('productDescription')}
                  value={formData.productDescription}
                  rows={5}
                />
              </div>

              <button className={styles.btnNext} onClick={nextStep}>
                Suivant
              </button>
            </form>
          )}

          {currentStep === 4 && (
            <div className={styles.summary}>
              <button className={styles.btnBack} onClick={prevStep}>
                <FaArrowLeft /> Précédent
              </button>

              <h3 className={styles.stepTitle}>Récapitulatif</h3>

              <div className={styles.summaryCard}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Nom :</span>
                  <span className={styles.summaryValue}>{formData.userName}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Email :</span>
                  <span className={styles.summaryValue}>{formData.userEmail}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Pays :</span>
                  <span className={styles.summaryValue}>{formData.selectedCountry}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Catégorie :</span>
                  <span className={styles.summaryValue}>{formData.categorie}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Quantité :</span>
                  <span className={styles.summaryValue}>{formData.productQuantity}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Description :</span>
                  <span className={styles.summaryValue}>{formData.productDescription}</span>
                </div>
                {formData.picture && (
                  <div className={styles.imagePreview}>
                    <img src={formData.picture} alt="Produit" />
                  </div>
                )}
              </div>

              <button
                disabled={state.hideBtn}
                className={styles.btnSubmit}
                onClick={sendOtp}
              >
                {state.isLoading ? 'Envoi en cours...' : 'Envoyer la demande'}
              </button>
            </div>
          )}

          {otpStep && (
            <div className={styles.otpStep}>
              <h3 className={styles.stepTitle}>Vérification</h3>
              <p className={styles.otpText}>
                Un code a été envoyé à <strong>{formData.userEmail}</strong>
              </p>

              <div className={styles.inputGroup}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  className={styles.otpInput}
                  value={formData.otp}
                  onChange={handleInputChange('otp')}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.checked}
                    onChange={(e) =>
                      setFormData({ ...formData, checked: e.target.checked })
                    }
                  />
                  <span>
                    J'accepte les{' '}
                    <a href="/cgu" target="_blank">
                      conditions générales d'utilisation
                    </a>
                  </span>
                </label>
              </div>

              {formData.checked && (
                <button className={styles.btnSubmit} onClick={handleSubmit}>
                  {state.isLoading ? 'Vérification...' : 'Confirmer'}
                </button>
              )}
            </div>
          )}

          {messageBoxIs && (
            <div className={styles.messageBox}>
              {state.isSuccess && <FaCheckCircle size={50} color="#10b981" />}
              {state.isError && <FaTimesCircle size={50} color="#ef4444" />}
              <h3>{state.backendMessage}</h3>
              <button className={styles.btnClose} onClick={hideForm}>
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default DevisForm;