import React from 'react';

const DevisForm = ({ showForm }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Demande de Devis</h2>
      <p className="mb-4">Veuillez remplir ce formulaire pour demander un devis de sourcing depuis la Chine.</p>
      <form>
        <input type="text" placeholder="Votre Nom" className="w-full mb-3 p-2 border rounded" />
        <input type="email" placeholder="Votre Email" className="w-full mb-3 p-2 border rounded" />
        <textarea placeholder="Description de votre besoin" className="w-full mb-3 p-2 border rounded" rows="4"></textarea>
        <button type="button" onClick={() => showForm(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2">Annuler</button>
        <button type="submit" className="bg-[#ffdc2b] text-[#2d3748] px-4 py-2 rounded font-bold">Envoyer</button>
      </form>
    </div>
  );
};

export default DevisForm;
