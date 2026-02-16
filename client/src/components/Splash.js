import React, { useEffect, useState } from "react";

export default function Splash({ onFinish, duration = 4000 }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out slightly before unmount
    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, duration - 800);

    const finishTimer = setTimeout(() => {
      onFinish?.();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish, duration]);

  return (
    <div style={{
      ...styles.container,
      opacity: fadingOut ? 0 : 1,
      pointerEvents: fadingOut ? "none" : "all"
    }}>
      <div style={styles.content}>
        <div style={styles.logoWrapper}>
          <h1 className="neon-text">MEKARO</h1>
        </div>
        <div style={styles.taglineWrapper}>
          <p className="neon-tagline">THE NEON REVOLUTION 2026</p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

        .neon-text {
          font-family: 'Outfit', sans-serif;
          font-size: 80px;
          font-weight: 900;
          color: #fff;
          text-transform: uppercase;
          margin: 0;
          letter-spacing: 4px;
          animation: flicker 1.5s infinite alternate;
          text-shadow:
            0 0 7px #fff,
            0 0 10px #fff,
            0 0 21px #fff,
            0 0 42px #0fa,
            0 0 82px #0fa,
            0 0 92px #0fa,
            0 0 102px #0fa,
            0 0 151px #0fa;
        }

        .neon-tagline {
          font-family: 'Outfit', sans-serif;
          color: #fff;
          font-size: 18px;
          letter-spacing: 8px;
          margin-top: 20px;
          text-transform: uppercase;
          opacity: 0;
          animation: fadeInUp 1s ease-out forwards;
          animation-delay: 0.5s;
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.8);
        }

        @keyframes flicker {
          0%, 18%, 22%, 25%, 53%, 57%, 100% {
            text-shadow:
              0 0 4px #fff,
              0 0 11px #fff,
              0 0 19px #fff,
              0 0 40px #0fa,
              0 0 80px #0fa,
              0 0 90px #0fa,
              0 0 100px #0fa,
              0 0 150px #0fa;
          }
          20%, 24%, 55% {
            text-shadow: none;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 768px) {
            .neon-text {
                font-size: 48px;
            }
            .neon-tagline {
                font-size: 14px;
                letter-spacing: 4px;
            }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(circle at center, #111827 0%, #000000 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    transition: "opacity 0.8s ease-out",
  },
  content: {
    textAlign: "center",
    position: "relative",
    zIndex: 2,
  },
  logoWrapper: {
    marginBottom: "10px",
  },
  taglineWrapper: {
    display: "inline-block",
    borderTop: "1px solid rgba(6, 182, 212, 0.3)",
    borderBottom: "1px solid rgba(6, 182, 212, 0.3)",
    padding: "10px 20px",
    background: "rgba(6, 182, 212, 0.05)",
  }
};