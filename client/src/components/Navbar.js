import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const cartRaw = localStorage.getItem("cart");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  let cartCount = 0;
  try {
    const c = cartRaw ? JSON.parse(cartRaw) : [];
    cartCount = Array.isArray(c) ? c.reduce((s, it) => s + (it.qty || 1), 0) : 0;
  } catch {
    cartCount = 0;
  }

  const [search, setSearch] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
    setMobileMenuOpen(false);
  };

  /* Styles... (kept inline for simplicity based on existing pattern) */
  const logoStyle = {
    display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "#fff",
    fontSize: "24px", fontWeight: "800", letterSpacing: "1px", position: "relative",
  };
  const linkStyle = {
    color: "var(--text-muted)", fontWeight: "500", fontSize: "15px", transition: "color 0.2s",
    cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
    "&:hover": { color: "var(--primary)" },
  };
  const buttonStyle = {
    padding: "8px 20px", borderRadius: "8px", border: "1px solid var(--primary)",
    background: "transparent", color: "var(--primary)", fontWeight: "600", fontSize: "14px",
    cursor: "pointer", transition: "all 0.2s ease",
  };

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 1000, background: "rgba(30, 41, 59, 0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>

          {/* LEFT: HAMBURGER (Mobile) + LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ fontSize: "20px", color: "white", cursor: "pointer", display: "none" }}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </div>

            <Link to="/" style={logoStyle}>
              <div style={{
                width: "28px", height: "28px",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px", fontWeight: "bold", color: "#fff"
              }}>M</div>
              <span style={{ fontWeight: "800", fontSize: "18px", background: "linear-gradient(to right, #fff, #dadada)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MEKARO</span>
            </Link>
          </div>

          {/* CENTER: SEARCH (Desktop Only) */}
          <form onSubmit={onSubmit} className="desktop-search" style={{
            flex: 1, maxWidth: "500px", margin: "0 20px"
          }}>
            <div style={{ position: "relative" }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                style={{
                  width: "100%", padding: "10px 16px 10px 40px",
                  borderRadius: "8px", border: "none",
                  background: "rgba(255, 255, 255, 0.1)", color: "white",
                  fontSize: "14px"
                }}
              />
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            </div>
          </form>

          {/* RIGHT: ICONS & LINKS */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

            {/* Desktop Links */}
            <div className="desktop-links" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <Link to="/" style={linkStyle}>Home</Link>
              <Link to="/about" style={linkStyle}>About</Link>
              <Link to="/projects" style={linkStyle}>Projects</Link>
              <Link to="/workshops" style={linkStyle}>Workshops</Link>
            </div>

            {/* Icons (Visible on Mobile too) */}
            {token ? (
              <Link to="/profile" style={{ color: "white", fontSize: "18px" }}>
                <FaUser />
              </Link>
            ) : (
              <Link to="/login" style={linkStyle}>
                Login
              </Link>
            )}

            <Link to="/cart" style={{ color: "white", fontSize: "18px", position: "relative" }}>
              <FaShoppingCart />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: "-6px", right: "-8px",
                  background: "var(--accent)", color: "white",
                  fontSize: "9px", fontWeight: "bold",
                  height: "14px", width: "14px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{cartCount}</span>
              )}
            </Link>

            {/* Desktop Logout Button */}
            {token && (
              <button
                className="desktop-logout"
                onClick={() => {
                  localStorage.removeItem("token");
                  toast.info("Logged out successfully");
                  window.location.href = "/login";
                }}
                style={{ ...buttonStyle, marginLeft: "10px", padding: "6px 12px" }}
              >
                Logout
              </button>
            )}
          </div>
        </nav>

        {/* MOBILE SEARCH BAR (Row 2) */}
        <div className="mobile-search-bar" style={{ padding: "0 16px 12px", display: "none" }}>
          <form onSubmit={onSubmit} style={{ position: "relative" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="mobile-search-input"
            />
            <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)" }} />
          </form>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN (Now mostly for navigation links) */}
      {mobileMenuOpen && (
        <div style={{
          position: "fixed", top: "115px", left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.98)", backdropFilter: "blur(10px)",
          zIndex: 998, padding: "20px",
          display: "flex", flexDirection: "column", gap: "20px",
          animation: "fadeIn 0.2s ease",
          overflowY: 'auto'
        }}>

          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Home</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>About</Link>
          <Link to="/projects" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Projects</Link>
          <Link to="/workshops" onClick={() => setMobileMenuOpen(false)} style={linkStyle}>Workshops</Link>

          {!token && (
            <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
              <Link to="/login"><button style={{ width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid var(--primary)", background: "transparent", color: "var(--primary)" }}>Login</button></Link>
            </div>
          )}
          {token && (
            <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }} style={{ ...buttonStyle, width: "100%", marginTop: "20px" }}>Logout</button>
          )}
        </div>
      )}

      <style>{`
        /* Desktop Defaults */
        .mobile-toggle { display: none !important; }
        .desktop-search { display: block; }
        .desktop-links { display: flex; }
        .desktop-lang { display: block; }
        .desktop-logout { display: block; }
        .mobile-search-bar { display: none !important; }

        /* Mobile Overrides */
        @media (max-width: 768px) {
          .mobile-toggle { display: block !important; }
          .desktop-search { display: none !important; }
          .desktop-links { display: none !important; }
          .desktop-lang { display: none !important; }
          .desktop-logout { display: none !important; }
          .mobile-search-bar { display: block !important; }
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .mobile-search-input {
          width: 100%;
          padding: 10px 16px 10px 40px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(0, 0, 0, 0.4);
          color: white;
          fontSize: 14px;
          transition: all 0.3s ease;
        }
        .mobile-search-input:focus {
          border-color: var(--primary);
          background: rgba(0, 0, 0, 0.6);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
          outline: none;
        }
        .mobile-search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
}
