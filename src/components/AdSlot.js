import React, { useEffect } from 'react';

const AdSlot = () => {
  useEffect(() => {
    try {
      // Active l’annonce après le rendu
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Erreur AdSense :', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-2759671915983740"
      data-ad-slot="6729041985"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdSlot;
