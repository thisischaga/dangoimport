import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── Ticker items ───────────────────────────────────────── */
const TICKER_ITEMS = [
  'Livraison GRATUITE sur tous les vêtements',
  'Robes, t-shirts, pantalons — zéro frais de port',
  'Commandez maintenant et économisez sur la livraison',
  'Mode homme & femme — livraison offerte sans minimum',
  'Profitez-en : livraison gratuite sur toute la mode',
];

/* ── Countdown to midnight ──────────────────────────────── */
function useCountdown() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = Math.max(0, midnight - now);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTime({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/* ── Main component ─────────────────────────────────────── */
export default function PromoBanner() {
  const navigate = useNavigate();
  const { h, m, s } = useCountdown();
  const tickerRef = useRef(null);

  return (
    <>
      <style>{`
        /* =====================================================
           PROMO BANNER
        ===================================================== */

        @keyframes pb-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes pb-pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }

        @keyframes pb-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        @keyframes pb-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-4px); }
        }

        /* ── Wrapper ── */
        .pb-wrapper {
          position: relative;
          overflow: hidden;
          background: #0a0a0a;
          color: #fff;
        }

        /* ── Top ticker ── */
        .pb-ticker {
          background: #FF6B00;
          padding: 7px 0;
          overflow: hidden;
          white-space: nowrap;
        }

        .pb-ticker__track {
          display: inline-flex;
          gap: 0;
          animation: pb-ticker 28s linear infinite;
          will-change: transform;
        }

        .pb-ticker__item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 40px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #fff;
          white-space: nowrap;
        }

        .pb-ticker__sep {
          color: rgba(255,255,255,0.4);
          font-size: 16px;
        }

        /* ── Hero body ── */
        .pb-body {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0;
          min-height: 220px;
          position: relative;
        }

        @media (min-width: 768px) {
          .pb-body {
            grid-template-columns: 1fr 1fr;
            min-height: 260px;
          }
        }

        /* ── Left side ── */
        .pb-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 28px 24px 28px 28px;
          position: relative;
          z-index: 2;
        }

        @media (min-width: 768px) {
          .pb-left {
            padding: 40px 32px 40px 48px;
          }
        }

        /* Background noise texture */
        .pb-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          z-index: -1;
        }

        .pb-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #FF6B00;
          margin-bottom: 10px;
        }

        .pb-eyebrow__dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #FF6B00;
          animation: pb-pulse-dot 1.6s ease-in-out infinite;
        }

        .pb-headline {
          font-size: clamp(22px, 4vw, 38px);
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin: 0 0 6px;
          color: #fff;
        }

        .pb-headline__accent {
          background: linear-gradient(90deg, #FF6B00, #FFB347, #FF6B00);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: pb-shimmer 3s linear infinite;
        }

        .pb-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin: 0 0 20px;
          line-height: 1.55;
          max-width: 340px;
        }

        /* ── CTA ── */
        .pb-cta-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pb-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FF6B00;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          padding: 11px 22px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        .pb-cta-btn:hover {
          background: #e05a00;
          transform: translateY(-1px);
        }

        .pb-cta-btn svg {
          transition: transform 0.2s;
        }

        .pb-cta-btn:hover svg {
          transform: translateX(3px);
        }

        .pb-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.75);
          font-size: 11px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 999px;
          white-space: nowrap;
        }

        /* ── Right side (visual) ── */
        .pb-right {
          display: none;
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .pb-right {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        /* gradient blob */
        .pb-right::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,107,0,0.2) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .pb-visual {
          position: relative;
          z-index: 1;
          text-align: center;
          animation: pb-float 3.5s ease-in-out infinite;
        }

        .pb-visual__emoji {
          font-size: 80px;
          display: block;
          line-height: 1;
          margin-bottom: 12px;
          filter: drop-shadow(0 8px 24px rgba(255,107,0,0.35));
        }

        .pb-visual__tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,107,0,0.15);
          border: 1px solid rgba(255,107,0,0.3);
          color: #FF6B00;
          font-size: 12px;
          font-weight: 800;
          padding: 6px 16px;
          border-radius: 999px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* ── Countdown bar ── */
        .pb-countdown-bar {
          background: rgba(255,255,255,0.05);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 10px 28px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        @media (min-width: 768px) {
          .pb-countdown-bar {
            padding: 10px 48px;
          }
        }

        .pb-countdown-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }

        .pb-countdown-units {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pb-countdown-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pb-countdown-num {
          font-size: 20px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1;
          font-variant-numeric: tabular-nums;
          min-width: 32px;
          text-align: center;
        }

        .pb-countdown-unit-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-top: 2px;
        }

        .pb-countdown-colon {
          font-size: 18px;
          font-weight: 900;
          color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
        }

        .pb-countdown-pill {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,107,0,0.12);
          border: 1px solid rgba(255,107,0,0.2);
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          color: #FF6B00;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
      `}</style>

      <section className="pb-wrapper">

        {/* ── Top ticker ─────────────────────────────── */}
        <div className="pb-ticker" aria-hidden="true">
          <div className="pb-ticker__track" ref={tickerRef}>
            {/* Duplicate for seamless loop */}
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="pb-ticker__item">
                {item}
                <span className="pb-ticker__sep">·</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Hero ───────────────────────────────────── */}
        <div className="pb-body">

          {/* Left */}
          <div className="pb-left">
            <p className="pb-eyebrow">
              <span className="pb-eyebrow__dot" />
              Offre limitée aujourd'hui
            </p>

            <h2 className="pb-headline">
              Livraison{' '}
              <span className="pb-headline__accent">100% gratuite</span>
              <br />
              sur tous les vêtements
            </h2>

            <p className="pb-sub">
              T-shirts, robes, pantalons, accessoires de mode —
              commandez maintenant et recevez chez vous sans frais de port.
            </p>

            <div className="pb-cta-row">
              <button
                className="pb-cta-btn"
                onClick={() => navigate('/category/mode')}
                type="button"
              >
                Découvrir la mode
              </button>

              <span className="pb-badge">
                Sans code promo requis
              </span>
            </div>
          </div>

          {/* Right — visual */}
          <div className="pb-right">
            <div className="pb-visual">
              <span className="pb-visual__text" style={{ fontSize: '56px', fontWeight: 900, color: '#FF6B00', display: 'block', lineHeight: 1, marginBottom: '12px' }}>0 FCFA</span>
              <span className="pb-visual__tag">
                Livraison offerte
              </span>
            </div>
          </div>
        </div>

        {/* ── Countdown bar ──────────────────────────── */}
        <div className="pb-countdown-bar">
          <span className="pb-countdown-label">Offre expire dans</span>

          <div className="pb-countdown-units">
            <div className="pb-countdown-unit">
              <span className="pb-countdown-num">{pad(h)}</span>
              <span className="pb-countdown-unit-label">h</span>
            </div>
            <span className="pb-countdown-colon">:</span>
            <div className="pb-countdown-unit">
              <span className="pb-countdown-num">{pad(m)}</span>
              <span className="pb-countdown-unit-label">min</span>
            </div>
            <span className="pb-countdown-colon">:</span>
            <div className="pb-countdown-unit">
              <span className="pb-countdown-num">{pad(s)}</span>
              <span className="pb-countdown-unit-label">sec</span>
            </div>
          </div>

          <span className="pb-countdown-pill">
            Bénin &amp; Togo
          </span>
        </div>

      </section>
    </>
  );
}
