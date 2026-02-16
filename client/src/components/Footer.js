import React, { useState } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaChevronDown, FaChevronUp } from "react-icons/fa";
import API from "../api/axios";
import { toast } from "react-toastify";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});

  const toggleSection = (section) => {
    if (window.innerWidth <= 768) {
      setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    }
  };

  const handleSubscribe = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await API.post("/api/subscribe/", { email });
      toast.success("Subscribed successfully! Check your email. 🚀");
      setEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = () => {
    if (trackingId) {
      window.location.href = `/track-order/${trackingId}`;
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* COL 1: BRAND */}
        <div className="footer-col brand-col">
          <a href="/" className="footer-logo">
            <div className="logo-icon">M</div>
            <span className="logo-text">MEKARO</span>
          </a>
          <p className="footer-desc">
            The ultimate destination for premium electronics.
            Experience innovation with our curated selection.
          </p>
          <div className="social-icons">
            <FaFacebook className="social-icon" />
            <FaTwitter className="social-icon" />
            <FaInstagram className="social-icon" />
            <FaLinkedin className="social-icon" />
          </div>
        </div>

        {/* COL 2: SHOP */}
        <div className="footer-col links-col">
          <div className="footer-title-row" onClick={() => toggleSection('shop')}>
            <span className="footer-title">Shop</span>
            <span className="mobile-toggle">
              {expanded['shop'] ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          <div className={`footer-link-list ${expanded['shop'] ? 'expanded' : ''}`}>
            <a href="/" className="footer-link">All Products</a>
            <a href="/?category=Development%20Boards" className="footer-link">Development Boards</a>
            <a href="/?category=Sensors" className="footer-link">Sensors</a>
            <a href="/?category=Drone%20Parts" className="footer-link">Drone Parts</a>
            <a href="/?category=3D%20Printers%20and%20Parts" className="footer-link">3D Printers</a>
          </div>
        </div>

        {/* COL 3: SUPPORT */}
        <div className="footer-col links-col">
          <div className="footer-title-row" onClick={() => toggleSection('support')}>
            <span className="footer-title">Support</span>
            <span className="mobile-toggle">
              {expanded['support'] ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          <div className={`footer-link-list ${expanded['support'] ? 'expanded' : ''}`}>
            <a href="/about" className="footer-link">About Us</a>
            <a href="/contact" className="footer-link">Contact Support</a>
            <a href="/terms" className="footer-link">Terms of Service</a>
            <a href="/privacy" className="footer-link">Privacy Policy</a>
            <a href="/shipping-policy" className="footer-link">Shipping & Returns</a>
            <a href="/track-order" className="footer-link">Track Your Order</a>
          </div>
        </div>

        {/* COL 4: NEWSLETTER & TRACKING */}
        <div className="footer-col newsletter-col">
          <span className="footer-title">Stay Updated</span>
          <p className="footer-text">Subscribe for the latest tech news.</p>
          <div className="newsletter-form">
            <input
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
            />
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="newsletter-btn"
            >
              {loading ? "..." : "Go"}
            </button>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-contact-mobile">
          📧 mekaro.india@gmail.com
        </div>
        © {new Date().getFullYear()} MEKARO Electronics. All rights reserved.
      </div>

      <style>{`
        /* --- GLOBAL --- */
        .footer {
          background: var(--bg-darker);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 40px 0 24px; /* Reduced from 80px */
          font-family: 'Outfit', sans-serif;
          color: var(--text-muted);
          margin-top: auto;
        }

        .footer-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
          gap: 60px;
        }

        /* --- COLUMNS --- */
        .footer-col {
          display: flex;
          flex-direction: column;
        }

        /* --- BRAND --- */
        .footer-logo {
          display: flex; alignItems: center; gap: 12px;
          color: #ffffff; font-size: 24px; font-weight: 700;
          margin-bottom: 20px; letter-spacing: -0.02em;
          font-family: 'Outfit', sans-serif;
          text-decoration: none; /* Ensure it looks like a logo */
        }
        .logo-icon {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 6px;
          display: flex; alignItems: center; justifyContent: center;
          color: #ffffff; font-weight: 800; font-size: 16px;
          padding: 6.5px; margin: 0;
          line-height: 1;
        }
        .logo-text {
             font-weight: 800; font-size: 18px; 
             background: linear-gradient(to right, #fff, #dadada);
             -webkit-background-clip: text; 
             -webkit-text-fill-color: transparent;
        }
        .footer-desc {
          font-size: 14px; line-height: 1.6;
          margin-bottom: 24px; color: var(--text-muted);
          max-width: 280px;
        }

        /* --- LINKS --- */
        .footer-title {
          color: #ffffff; font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 20px; display: block;
        }
        .footer-title-row { display: flex; justify-content: space-between; align-items: center; }
        
        .footer-link-list { display: flex; flex-direction: column; gap: 12px; }
        .footer-link {
          color: var(--text-muted); text-decoration: none; font-size: 14px;
          transition: all 0.2s ease;
          display: inline-block; width: fit-content;
        }
        .footer-link:hover { 
          color: var(--primary); 
          transform: translateX(4px); 
          text-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }

        /* --- SOCIALS --- */
        .social-icons { display: flex; gap: 16px; }
        .social-icon { 
          font-size: 18px; color: var(--text-muted); transition: all 0.2s ease; cursor: pointer; 
        }
        .social-icon:hover { color: #ffffff; transform: translateY(-2px); }

        /* --- NEWSLETTER --- */
        .newsletter-form { 
          display: flex;
          border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 6px;
          overflow: hidden; 
          margin-top: 12px;
          transition: all 0.2s;
          background: rgba(255,255,255,0.02);
        }
        .newsletter-form:focus-within { 
          border-color: var(--primary); 
          box-shadow: 0 0 0 1px var(--primary-glow);
        }
        
        .newsletter-input {
          background: transparent; border: none; padding: 12px 16px;
          color: #ffffff; flex: 1; font-size: 14px; outline: none;
        }
        .newsletter-btn {
          background: #ffffff; color: #000; border: none;
          padding: 0 20px; font-weight: 700; font-size: 13px;
          cursor: pointer; transition: background 0.2s;
        }
        .newsletter-btn:hover { background: var(--primary); color: #fff; }

        /* --- BOTTOM BAR --- */
        .footer-bottom {
          margin-top: 60px; padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center; font-size: 13px; color: #555;
        }
        .footer-contact-mobile { display: none; }
        .mobile-toggle { display: none; color: #fff; }

        /* --- RESPONSIVE --- */
        @media (max-width: 1024px) {
          .footer-container { 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
          }
        }

        @media (max-width: 768px) {
          .footer { padding: 40px 0 24px; }
          .footer-container { display: flex; flex-direction: column; gap: 0; padding: 0 24px; }
          
          .footer-col { margin-bottom: 0; }
          .brand-col { margin-bottom: 32px; }
          .newsletter-col { margin-top: 32px; }

          .footer-title-row { 
            padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer;
          }
          .footer-title { margin-bottom: 0; }
          .mobile-toggle { display: block; opacity: 0.8; }

          .footer-link-list {
            max-height: 0; overflow: hidden;
            transition: max-height 0.3s ease, margin 0.3s ease;
          }
          .footer-link-list.expanded {
            max-height: 300px; margin: 12px 0;
          }

          .footer-bottom { 
            margin-top: 32px; text-align: left; padding: 24px; 
            color: var(--text-muted);
          }
          .footer-contact-mobile { display: block; margin-bottom: 8px; color: #fff; }
        }
      `}</style>
    </footer>
  );
}
