import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaChartBar, FaBoxOpen, FaSignOutAlt, FaRocket, FaProjectDiagram, FaEnvelope, FaCalendarAlt, FaUserShield, FaBars, FaTimes } from "react-icons/fa";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const menuItems = [
    { label: "Overview", path: "/admin/dashboard", icon: <FaChartBar /> },
    { label: "Products", path: "/admin/products", icon: <FaBoxOpen /> },
    { label: "Categories", path: "/admin/categories", icon: <FaBoxOpen /> },
    { label: "Projects", path: "/admin/projects", icon: <FaProjectDiagram /> },
    { label: "Orders", path: "/admin/orders", icon: <FaBoxOpen /> },
    { label: "Manage Users", path: "/admin/users", icon: <FaUserShield /> },
    { label: "Workshop Enquiries", path: "/admin/enquiries", icon: <FaEnvelope /> },
    { label: "Manage Workshops", path: "/admin/workshops", icon: <FaCalendarAlt /> },
    { label: "Project Requests", path: "/admin/project-orders", icon: <FaRocket /> },
    { label: "Priority Orders", path: "/admin/priority-orders", icon: <FaRocket /> },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileOpen(false); // Close menu on mobile after click
  };

  return (
    <div className="admin-container">
      {/* MOBILE HEADER */}
      <div className="mobile-header">
        <div className="brand">
          <FaRocket className="brand-icon" />
          <span className="brand-text">MEKARO Admin</span>
        </div>
        <button className="hamburger-btn" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${isMobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand brand">
          <FaRocket className="brand-icon" />
          <span className="brand-text">MEKARO Admin</span>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt style={{ marginRight: 8 }} />
          Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main className={`admin-main ${isMobileOpen ? "blurred" : ""}`}>
        <Outlet />
      </main>

      <style>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          background: var(--bg-darker);
          color: var(--text-main);
          overflow-x: hidden;
        }

        .mobile-header {
          display: none;
          background: rgba(15, 23, 42, 0.95);
          padding: 15px 20px;
          border-bottom: 1px solid var(--glass-border);
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 99;
          align-items: center;
          justify-content: space-between;
          backdrop-filter: blur(10px);
        }

        .hamburger-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .admin-sidebar {
          width: 260px;
          background: rgba(15, 23, 42, 0.95);
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-right: 1px solid var(--glass-border);
          position: fixed;
          height: 100vh;
          left: 0;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
          transition: transform 0.3s ease-in-out;
        }

        .brand {
          display: flex;
          align-items: center;
          font-size: 1.4rem;
          font-weight: 800;
          color: white;
          letter-spacing: 1px;
        }
        .sidebar-brand { margin-bottom: 30px; padding-left: 8px; }

        .brand-icon {
          margin-right: 10px;
          color: var(--primary);
          font-size: 1.8rem;
        }
        .brand-text {
          background: linear-gradient(to right, #fff, var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;
          margin-bottom: 10px;
          scrollbar-width: thin;
          scrollbar-color: var(--primary-glow) transparent;
        }

        .nav-link {
          padding: 12px 16px;
          background: transparent;
          color: var(--text-muted);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .nav-link:hover:not(.active) {
          background: rgba(255,255,255,0.05);
          transform: translateX(5px);
        }
        .nav-link.active {
          background: rgba(6, 182, 212, 0.1);
          color: var(--primary);
          font-weight: 700;
          border: 1px solid var(--primary-glow);
        }

        .nav-icon {
          margin-right: 12px;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
        }

        .logout-btn {
          padding: 12px 16px;
          background: rgba(255, 68, 68, 0.1);
          color: #ff4444;
          border: 1px solid rgba(255, 68, 68, 0.2);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          margin-top: auto;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .admin-main {
          flex: 1;
          padding: 30px 40px;
          margin-left: 260px;
          background: var(--bg-darker);
          color: var(--text-main);
          transition: filter 0.3s;
          width: calc(100% - 260px);
          min-height: 100vh;
        }

        /* MOBILE STYLES */
        @media (max-width: 768px) {
          .mobile-header { display: flex; }
          .admin-sidebar {
            transform: translateX(-100%);
            width: 280px;
          }
          .admin-sidebar.open {
            transform: translateX(0);
            box-shadow: 10px 0 30px rgba(0,0,0,0.5);
          }
          .sidebar-brand { display: none; } /* Hide in sidebar since it's in header */
          
          .admin-main {
            margin-left: 0;
            margin-top: 60px; /* Space for mobile header */
            padding: 20px 15px;
            width: 100%;
          }
          .admin-main.blurred {
            filter: blur(5px) brightness(0.7);
            pointer-events: none;
          }
        }
      `}</style>
    </div>
  );
}
