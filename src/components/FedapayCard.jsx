import React from 'react';

const PAYMENT_METHODS = ['MTN Money', 'Moov Money', 'Carte bancaire'];

const FedapayCard = ({ selected = true, compact = false }) => (
    <div
        className={`flex items-center gap-4 rounded-xl border-2 transition-all ${
            selected ? 'border-gray-900 bg-[#ffdc2b]/10' : 'border-gray-200 bg-white'
        } ${compact ? 'p-4' : 'p-5'}`}
    >
        <div className="w-12 h-12 rounded-xl bg-[#ffdc2b] flex items-center justify-center shrink-0 overflow-hidden">
            <img
                src="https://fedapay.com/wp-content/uploads/2020/05/logo.png"
                alt="FedaPay"
                className="h-6 object-contain"
            />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">FedaPay</p>
            <p className="text-xs text-gray-500 mt-0.5">
                Paiement sécurisé · Mobile Money & carte
            </p>
            {!compact && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {PAYMENT_METHODS.map((m) => (
                        <span
                            key={m}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600"
                        >
                            {m}
                        </span>
                    ))}
                </div>
            )}
        </div>
        {selected && (
            <div className="w-4 h-4 rounded-full border-2 border-gray-900 flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-gray-900" />
            </div>
        )}
    </div>
);

export default FedapayCard;
