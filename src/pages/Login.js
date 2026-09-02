import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import toast from '../utils/toast';

import {
    FaEnvelope,
    FaLock,
    FaSignInAlt,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

import logo from '../images/logo.png';

// =========================================================
// GOOGLE CONFIG
// =========================================================

const GOOGLE_CLIENT_ID =
    process.env.REACT_APP_GOOGLE_CLIENT_ID;

const GOOGLE_SCRIPT =
    'https://accounts.google.com/gsi/client';

// =========================================================
// LOGIN
// =========================================================

const Login = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        userEmail: '',
        userPassword: ''
    });

    // =========================================================
    // REDIRECTION
    // =========================================================

    const redirectUser = useCallback(() => {

        const destination =
            location.state?.from || '/';

        navigate(destination, {
            replace: true
        });

    }, [location.state, navigate]);

    // =========================================================
    // SAUVEGARDER AUTHENTIFICATION
    // =========================================================

    const saveAuthentication = useCallback((data) => {

        if (!data?.token) {
            throw new Error(
                "Token d'authentification manquant."
            );
        }

        localStorage.setItem(
            'dangoToken',
            data.token
        );

        localStorage.setItem(
            'dangoUser',
            JSON.stringify(data.user || {})
        );

        window.dispatchEvent(
            new Event('authChange')
        );

    }, []);

    // =========================================================
    // CONNEXION GOOGLE
    // =========================================================

    const handleGoogleLogin = useCallback(
        async (response) => {

            console.log(
                '🔵 Réponse Google :',
                response
            );

            // Vérification du credential Google
            if (!response?.credential) {

                console.error(
                    '❌ Aucun credential Google reçu.'
                );

                toast.error(
                    "Google n'a pas fourni de jeton."
                );

                return;
            }

            setLoading(true);

            try {

                console.log(
                    '📤 Envoi du token Google au backend...'
                );

                const { data } = await axios.post(
                    `${API_BASE_URL}/api/auth/google`,
                    {
                        token: response.credential
                    },
                    {
                        headers: {
                            'Content-Type':
                                'application/json'
                        }
                    }
                );

                console.log(
                    '🟢 Réponse backend :',
                    data
                );

                saveAuthentication(data);

                toast.success(
                    'Connexion Google réussie !'
                );

                redirectUser();

            } catch (error) {

                console.error(
                    '❌ Google authentication error:',
                    error
                );

                console.error(
                    '❌ Réponse serveur:',
                    error.response?.data
                );

                toast.error(
                    error.response?.data?.message ||
                    'Impossible de se connecter avec Google.'
                );

            } finally {

                setLoading(false);

            }

        },
        [redirectUser, saveAuthentication]
    );

    // =========================================================
    // INITIALISER GOOGLE
    // =========================================================

    const initializeGoogle = useCallback(() => {

        console.log(
            '🔵 Initialisation Google...'
        );

        // Vérifier Google
        if (!window.google?.accounts?.id) {

            console.error(
                '❌ Google Identity Services indisponible.'
            );

            return false;
        }

        // Vérifier Client ID
        if (!GOOGLE_CLIENT_ID) {

            console.error(
                '❌ REACT_APP_GOOGLE_CLIENT_ID est manquant.'
            );

            toast.error(
                'Configuration Google manquante.'
            );

            return false;
        }

        // Récupérer le conteneur
        const container =
            document.getElementById(
                'google-login-button'
            );

        if (!container) {

            console.error(
                '❌ Conteneur #google-login-button introuvable.'
            );

            return false;
        }

        // Nettoyer le conteneur
        container.innerHTML = '';

        // Initialiser Google
        window.google.accounts.id.initialize({

            client_id:
                GOOGLE_CLIENT_ID,

            callback:
                handleGoogleLogin,

            auto_select:
                false,

            cancel_on_tap_outside:
                true

        });

        // Afficher le bouton
        window.google.accounts.id.renderButton(
            container,
            {
                theme: 'outline',
                size: 'large',
                width: 380,
                text: 'continue_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                locale: 'fr'
            }
        );

        console.log(
            '✅ Bouton Google affiché.'
        );

        return true;

    }, [handleGoogleLogin]);

    // =========================================================
    // CHARGEMENT GOOGLE IDENTITY SERVICES
    // =========================================================

    useEffect(() => {

        console.log(
            '🔵 Vérification configuration Google...'
        );

        // Vérifier Client ID
        if (!GOOGLE_CLIENT_ID) {

            console.error(
                '❌ REACT_APP_GOOGLE_CLIENT_ID est absent du .env'
            );

            return;
        }

        console.log(
            '✅ Google Client ID détecté.'
        );

        // -----------------------------------------------------
        // GOOGLE DÉJÀ CHARGÉ
        // -----------------------------------------------------

        if (
            window.google?.accounts?.id
        ) {

            initializeGoogle();

            return;
        }

        // -----------------------------------------------------
        // CHERCHER LE SCRIPT
        // -----------------------------------------------------

        let script =
            document.querySelector(
                `script[src="${GOOGLE_SCRIPT}"]`
            );

        // -----------------------------------------------------
        // SCRIPT EXISTANT
        // -----------------------------------------------------

        if (script) {

            console.log(
                '🟡 Script Google déjà présent.'
            );

            script.addEventListener(
                'load',
                initializeGoogle
            );

            return () => {

                script.removeEventListener(
                    'load',
                    initializeGoogle
                );

            };
        }

        // -----------------------------------------------------
        // CRÉER SCRIPT
        // -----------------------------------------------------

        console.log(
            '🔵 Chargement du script Google...'
        );

        script =
            document.createElement('script');

        script.src =
            GOOGLE_SCRIPT;

        script.async = true;
        script.defer = true;

        script.onload = () => {

            console.log(
                '✅ Google Identity Services chargé.'
            );

            initializeGoogle();

        };

        script.onerror = () => {

            console.error(
                '❌ Impossible de charger Google Identity Services.'
            );

            toast.error(
                'Impossible de charger Google.'
            );

        };

        document.head.appendChild(script);

    }, [initializeGoogle]);

    // =========================================================
    // CONNEXION CLASSIQUE
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) {
            return;
        }

        setLoading(true);

        try {

            const { data } = await axios.post(
                `${API_BASE_URL}/api/auth/login`,
                formData
            );

            saveAuthentication(data);

            toast.success(
                'Connexion réussie !'
            );

            redirectUser();

        } catch (error) {

            console.error(
                'Login error:',
                error
            );

            toast.error(
                error.response?.data?.message ||
                'Erreur de connexion.'
            );

        } finally {

            setLoading(false);

        }

    };

    // =========================================================
    // JSX
    // =========================================================

    return (

        <div
            className="min-h-screen flex flex-col bg-[#F1F1F1]"
            style={{
                fontFamily:
                    'Roboto, system-ui, Arial'
            }}
        >

            {/* HEADER */}

            <div className="w-full bg-white py-4 px-6 sm:px-10 shadow-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => navigate('/')}
                >

                    <div>

                        <p className="text-[18px] font-black text-gray-900 leading-none">
                            Dangoimport
                        </p>

                    </div>

                </div>

                <div className="text-[11px] sm:text-sm text-gray-500 leading-tight text-left sm:text-right">

                    Nouveau ?{' '}

                    <Link
                        to="/register"
                        className="font-bold text-gray-900 hover:text-[#F68B1E] break-words"
                    >
                        S'inscrire
                    </Link>

                </div>

            </div>

            {/* CONTENU */}

            <div className="flex-1 flex items-center justify-center p-4">

                <div className="w-full max-w-[420px]">

                    <div className="bg-white rounded-b-2xl shadow-xl border border-gray-100 overflow-hidden">

                        <div className="p-8 sm:p-10">

                            {/* TITRE */}

                            <h1 className="text-2xl font-black text-gray-900 text-center mb-1">
                                Connexion
                            </h1>

                            <p className="text-sm text-gray-500 text-center mb-8">
                                Accédez à votre espace Dangoimport
                            </p>

                            {/* GOOGLE */}

                            <div
                                id="google-login-button"
                                className="w-full flex justify-center min-h-[44px]"
                            />

                            {/* SÉPARATEUR */}

                            <div className="flex items-center gap-4 my-6">

                                <div className="flex-1 h-px bg-gray-200" />

                                <span className="text-xs text-gray-400 font-medium">
                                    OU
                                </span>

                                <div className="flex-1 h-px bg-gray-200" />

                            </div>

                            {/* FORMULAIRE */}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                {/* EMAIL */}

                                <div>

                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                        Adresse Email
                                    </label>

                                    <div className="relative">

                                        <FaEnvelope
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            required
                                            type="email"
                                            placeholder="votre@email.com"
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 pl-11 focus:outline-none"
                                            value={
                                                formData.userEmail
                                            }
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    userEmail:
                                                        e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                </div>

                                {/* MOT DE PASSE */}

                                <div>

                                    <div className="flex items-center justify-between mb-1.5">

                                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                            Mot de passe
                                        </label>

                                        <button
                                            type="button"
                                            className="text-xs font-bold text-gray-500"
                                        >
                                            Oublié ?
                                        </button>

                                    </div>

                                    <div className="relative">

                                        <FaLock
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        />

                                        <input
                                            required
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 pl-11 pr-11 focus:outline-none"
                                            value={
                                                formData.userPassword
                                            }
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    userPassword:
                                                        e.target.value
                                                })
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        >

                                            {showPassword ? (
                                                <FaEyeSlash size={15} />
                                            ) : (
                                                <FaEye size={15} />
                                            )}

                                        </button>

                                    </div>

                                </div>

                                {/* CONNEXION */}

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full bg-[#F68B1E] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 mt-2"
                                >

                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-[#111]/30 border-t-[#111] rounded-full animate-spin" />

                                            Connexion...
                                        </>
                                    ) : (
                                        <>
                                            <FaSignInAlt size={14} />

                                            Se connecter
                                        </>
                                    )}

                                </button>

                            </form>

                        </div>

                        {/* FOOTER */}

                        <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">

                            <p className="text-[12px] text-gray-500">

                                En vous connectant, vous acceptez nos{' '}

                                <Link
                                    to="/cgu"
                                    className="underline"
                                >
                                    CGU
                                </Link>{' '}

                                et notre{' '}

                                <Link
                                    to="/politique-de-confidentialité"
                                    className="underline"
                                >
                                    Politique de confidentialité
                                </Link>.

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
};

export default Login;