import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Submit to placeholder endpoint if available; otherwise simulate
      if (typeof axios !== 'undefined') {
        await axios.post(`${API_BASE_URL}/api/contact`, { name, email, message });
      }
      toast.success('Votre message a été envoyé. Nous vous répondrons bientôt.');
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Votre nom" required className="w-full px-3 py-2 border rounded" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Votre e-mail" type="email" required className="w-full px-3 py-2 border rounded" />
      </div>
      <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Votre message" rows={5} className="w-full px-3 py-2 border rounded" required />
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="bg-[#F68B1E] text-white px-4 py-2 rounded">{loading ? '...' : 'Envoyer'}</button>
      </div>
    </form>
  );
}
