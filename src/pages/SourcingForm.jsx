import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  country: 'Togo',
  productDescription: '',
  quantity: '',
  budget: '',
  exampleLink: '',
  acceptFee: false,
};

const getLoggedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('dangoUser') || '{}');
  } catch {
    return {};
  }
};

const SourcingForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lockedIdentity, setLockedIdentity] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  const isLoggedIn = useMemo(() => {
    const u = getLoggedUser();
    return Boolean(u.userEmail || u.email);
  }, []);

  useEffect(() => {
    const paid = searchParams.get('paid');
    if (paid === '1' || paid === 'success') {
      setPaidSuccess(true);
      toast.success('Paiement reçu. Votre demande de sourcing est enregistrée.');
    }
  }, [searchParams]);

  useEffect(() => {
    const user = getLoggedUser();
    const email = user.userEmail || user.email || '';
    if (!email) return;

    const first = user.userFirstname || user.firstname || '';
    const last = user.userSurname || user.surname || user.lastName || '';
    const fullName =
      user.userName ||
      [first, last].filter(Boolean).join(' ').trim() ||
      '';

    setForm((prev) => ({
      ...prev,
      fullName: fullName || prev.fullName,
      email,
      phone: user.userPhone || user.phone || user.userNumber || prev.phone,
    }));
    setLockedIdentity(true);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Lecture de la photo impossible.'));
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.productDescription.trim() ||
      !form.quantity ||
      !form.budget
    ) {
      toast.warning('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!imageFile) {
      toast.warning('Ajoutez une photo du produit (obligatoire).');
      return;
    }

    if (!form.exampleLink.trim()) {
      toast.warning('Ajoutez un lien exemple du produit (obligatoire).');
      return;
    }

    try {
      new URL(form.exampleLink.trim());
    } catch {
      toast.warning('Le lien exemple doit être une URL valide (https://...).');
      return;
    }

    if (imageFile.size > 4 * 1024 * 1024) {
      toast.warning('La photo doit faire moins de 4 Mo.');
      return;
    }

    if (!form.acceptFee) {
      toast.warning('Veuillez confirmer le paiement des frais d’étude de 5000F.');
      return;
    }

    setSubmitting(true);

    try {
      // Envoi en base64 dans le JSON — évite ERR_HTTP2 sur /api/upload multipart
      const imageBase64 = await fileToDataUrl(imageFile);

      const requestPayload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country,
        productDescription: form.productDescription.trim(),
        quantity: form.quantity,
        budget: Number(form.budget),
        exampleLink: form.exampleLink.trim(),
        imageBase64,
        studyFee: 5000,
      };

      const requestRes = await fetch(`${API_BASE_URL}/api/sourcing/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });
      const requestData = await requestRes.json().catch(() => ({}));
      if (!requestRes.ok) {
        throw new Error(requestData.message || 'Impossible d’enregistrer la demande.');
      }

      const requestId = requestData.requestId || requestData.data?._id;
      const nameParts = form.fullName.trim().split(/\s+/);
      const firstname = nameParts[0] || 'Client';
      const lastname = nameParts.slice(1).join(' ') || 'Dango';

      const callbackUrl = `${window.location.origin}/sourcing/form?paid=1&id=${requestId || ''}`;

      const paymentRes = await fetch(`${API_BASE_URL}/api/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000,
          currency: 'XOF',
          description: 'Etude Sourcing DangoImport',
          callback_url: callbackUrl,
          deliveryCountry: form.country,
          customer: {
            firstname,
            lastname,
            email: form.email.trim(),
            phone: form.phone.trim(),
          },
          custom_metadata: {
            type: 'sourcing',
            orderId: requestId,
          },
        }),
      });

      const paymentData = await paymentRes.json().catch(() => ({}));
      if (!paymentRes.ok) {
        throw new Error(paymentData.message || 'Impossible d’initialiser le paiement FedaPay.');
      }

      const paymentUrl = paymentData.payment_url || paymentData.paymentUrl;
      if (!paymentUrl) {
        throw new Error('URL de paiement FedaPay manquante.');
      }

      window.location.href = paymentUrl;
    } catch (err) {
      toast.error(err.message || 'Une erreur est survenue.');
      setSubmitting(false);
    }
  };

  if (paidSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
        <Header />
        <main className="mx-auto max-w-xl px-4 py-16">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-[#F68B1E]">
              ✓
            </div>
            <h1 className="text-2xl font-black">Demande reçue</h1>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Merci. Votre paiement de 5000F est confirmé. Notre équipe vous répond sous 48h avec le rapport de sourcing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/sourcing"
                className="rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-bold text-white"
              >
                Retour au service
              </Link>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Accueil
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <Header />

      <main className="mx-auto max-w-xl px-4 py-10 sm:py-14">
        <div className="mb-6">
          <Link to="/sourcing" className="text-sm font-medium text-slate-500 hover:text-[#F68B1E]">
            ← Retour
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Demande d&apos;étude de sourcing — 5000F
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Remplissez le formulaire puis payez les frais d&apos;étude via FedaPay.
          </p>

          {isLoggedIn && lockedIdentity && (
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Compte connecté : nom et email préremplis.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Nom complet *</span>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                readOnly={lockedIdentity && Boolean(form.fullName)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#F68B1E] read-only:bg-slate-100 read-only:text-slate-600"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Email *</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                readOnly={lockedIdentity && Boolean(form.email)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#F68B1E] read-only:bg-slate-100 read-only:text-slate-600"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Téléphone WhatsApp *</span>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="Ex: 90 00 00 00"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#F68B1E]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Pays *</span>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#F68B1E]"
              >
                <option value="Togo">Togo</option>
                <option value="Bénin">Bénin</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">
                Décrivez le produit que vous cherchez *
              </span>
              <textarea
                name="productDescription"
                value={form.productDescription}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Ex: 200 chaises plastique pour restaurant, couleur blanche…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#F68B1E]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Quantité estimée *</span>
                <input
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#F68B1E]"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Budget total en FCFA *</span>
                <input
                  type="number"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#F68B1E]"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Image du produit *</span>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#0F172A] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              <span className="mt-1 block text-xs text-slate-500">Obligatoire — max 4 Mo (JPG, PNG, WebP)</span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Lien exemple *</span>
              <input
                type="url"
                name="exampleLink"
                value={form.exampleLink}
                onChange={handleChange}
                required
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#F68B1E]"
              />
              <span className="mt-1 block text-xs text-slate-500">Obligatoire — lien AliExpress, 1688, site fournisseur…</span>
            </label>

            <label className="flex items-start gap-3 rounded-xl bg-orange-50 p-3 text-sm text-slate-700">
              <input
                type="checkbox"
                name="acceptFee"
                checked={form.acceptFee}
                onChange={handleChange}
                className="mt-1 h-4 w-4 accent-[#F68B1E]"
              />
              <span>
                Je comprends que les frais d&apos;étude de 5000F sont à payer maintenant
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#F68B1E] py-3.5 text-sm font-bold text-white transition hover:bg-[#e07b12] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Redirection vers le paiement…' : 'Payer 5000F et envoyer ma demande'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SourcingForm;
