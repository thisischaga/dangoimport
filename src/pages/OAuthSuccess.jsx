import React, { useEffect } from 'react';

import {
    useNavigate,
    useSearchParams
} from 'react-router-dom';

import axios from 'axios';

import API_BASE_URL from '../apiConfig';

import toast from '../utils/toast';


const OAuthSuccess = () => {

    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();


    useEffect(() => {

        const finishGoogleLogin =
            async () => {

                const token =
                    searchParams.get('token');


                if (!token) {

                    toast.error(
                        'Impossible de récupérer votre session'
                    );

                    navigate('/login');

                    return;
                }


                try {

                    // Stocker le token
                    localStorage.setItem(
                        'dangoToken',
                        token
                    );


                    // Récupérer les données utilisateur
                    const res =
                        await axios.get(

                            `${API_BASE_URL}/api/auth/me`,

                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }

                        );


                    localStorage.setItem(

                        'dangoUser',

                        JSON.stringify(
                            res.data.user
                        )

                    );


                    window.dispatchEvent(
                        new Event('authChange')
                    );


                    toast.success(
                        'Connexion avec Google réussie !'
                    );


                    navigate(
                        '/shopping',
                        {
                            replace: true
                        }
                    );


                } catch (error) {

                    console.error(
                        'Erreur OAuth:',
                        error
                    );


                    localStorage.removeItem(
                        'dangoToken'
                    );


                    toast.error(
                        'Erreur lors de la connexion Google'
                    );


                    navigate(
                        '/login'
                    );
                }

            };


        finishGoogleLogin();


    }, [
        navigate,
        searchParams
    ]);


    return (

        <div className="
            min-h-screen
            flex
            items-center
            justify-center
            bg-[#F1F1F1]
        ">

            <div className="
                bg-white
                p-8
                rounded-xl
                shadow-lg
                text-center
            ">

                <div className="
                    w-10
                    h-10
                    border-4
                    border-gray-200
                    border-t-[#F68B1E]
                    rounded-full
                    animate-spin
                    mx-auto
                    mb-4
                " />

                <h2 className="
                    font-black
                    text-xl
                ">
                    Connexion en cours
                </h2>

                <p className="
                    text-sm
                    text-gray-500
                    mt-2
                ">
                    Préparation de votre compte Dango Import...
                </p>

            </div>

        </div>
    );
};


export default OAuthSuccess;