import React from 'react';



export const FEDAPAY_COUNTRIES = [
    {
        code: 'BJ', name: 'Bénin', flag: '🇧🇯',
        networks: [
            { label: 'MTN', value: 'mtn' },
            { label: 'Moov', value: 'moov' },
            { label: 'Celtiis', value: 'celtiis' },
            { label: 'BestCash', value: 'bestcash' },
        ],
    },
    {
        code: 'TG', name: 'Togo', flag: '🇹🇬',
        networks: [
            { label: 'T-Money', value: 'togocel' },
            { label: 'Moov', value: 'moov_tg' },
            { label: 'Coris', value: 'coris' },
        ],
    },
];

export function NetworkLogo({ value, label }) {
    let fileName = '';
    if (value.includes('mtn')) fileName = 'mtn.jfif';
    else if (value.includes('moov')) fileName = 'moov.jfif';
    else if (value.includes('orange')) fileName = 'orange.jfif';
    else if (value.includes('airtel')) fileName = 'airtel.jfif';
    else if (value.includes('free')) fileName = 'free.jfif';
    else if (value.includes('togocel')) fileName = 'togocel.jfif';
    else if (value.includes('wave')) fileName = 'wave.png'; // Vous pouvez ajouter wave.png
    else if (value === 'celtiis') fileName = 'celtiis.webp';
    else if (value === 'bestcash') fileName = 'bestcash.webp';
    else if (value === 'coris') fileName = 'coris.webp';


    const [imgError, setImgError] = React.useState(false);

    if (fileName && !imgError) {
        return (
            <div className="w-full h-full flex items-center justify-center overflow-hidden p-1">
                <img 
                    src={`/operator_logo/${fileName}`} 
                    alt={label}
                    className="w-full h-full object-contain"
                    onError={() => setImgError(true)}
                />
            </div>
        );
    }


    // Fallback générique si le logo n'est pas défini
    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-[10px] font-bold text-gray-600 text-center leading-tight px-1">{label}</span>
        </div>
    );
}
