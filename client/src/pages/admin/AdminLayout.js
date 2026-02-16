import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { FaChartBar, FaBoxOpen, FaSignOutAlt, FaRocket, FaRobot, FaProjectDiagram, FaEnvelope, FaCalendarAlt, FaUserShield } from "react-icons/fa";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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
    { label: "Projects", path: "/admin/projects", icon: <FaProjectDiagram /> }, // Added
    { label: "Orders", path: "/admin/orders", icon: <FaBoxOpen /> },
    { label: "Manage Users", path: "/admin/users", icon: <FaUserShield /> }, // Added
    { label: "Workshop Enquiries", path: "/admin/enquiries", icon: <FaEnvelope /> }, // Added
    { label: "Manage Workshops", path: "/admin/workshops", icon: <FaCalendarAlt /> }, // Added
    { label: "Project Requests", path: "/admin/project-orders", icon: <FaRobot /> }, // Renamed from Project Requests
    { label: "Priority Orders", path: "/admin/priority-orders", icon: <FaRocket /> },
  ];

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <FaRocket style={{ marginRight: 10, color: "var(--primary)", fontSize: "1.8rem" }} />
          <span style={{
            background: "linear-gradient(to right, #fff, var(--primary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            MEKARO Admin
          </span>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                style={isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.transform = "translateX(5px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <button style={styles.logoutBtn} onClick={logout}>
          <FaSignOutAlt style={{ marginRight: 8 }} />
          Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Outfit', sans-serif",
    background: "var(--bg-darker)",
    color: "var(--text-main)",
  },
  sidebar: {
    width: 260,
    background: "rgba(15, 23, 42, 0.95)", // var(--bg-dark)
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    borderRight: "1px solid var(--glass-border)",
    position: "fixed",
    height: "100vh",
    left: 0,
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(10px)",
  },
  brand: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "white",
    marginBottom: 30, // Reduced from 50
    display: "flex",
    alignItems: "center",
    paddingLeft: 8,
    letterSpacing: "1px",
    flexShrink: 0,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 6, // Reduced from 12
    flex: 1,
    overflowY: "auto", // Scrollable if items exceed height
    paddingRight: 4, // Space for scrollbar
    marginBottom: 10,

    // Modern scrollbar styling for webkit browsers
    scrollbarWidth: "thin",
    scrollbarColor: "var(--primary-glow) transparent",
  },
  link: {
    padding: "12px 16px", // Reduced from 14px 20px
    background: "transparent",
    color: "var(--text-muted)",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    fontSize: "0.95rem", // Slightly smaller
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  activeLink: {
    background: "rgba(6, 182, 212, 0.1)",
    color: "var(--primary)",
    fontWeight: 700,
    border: "1px solid var(--primary-glow)",
  },
  icon: {
    marginRight: 12,
    fontSize: "1.1rem",
    display: "flex",
    alignItems: "center",
  },
  logoutBtn: {
    padding: "12px 16px",
    background: "rgba(255, 68, 68, 0.1)",
    color: "#ff4444",
    border: "1px solid rgba(255, 68, 68, 0.2)",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    fontSize: "0.95rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    marginTop: "auto", // Sticky at bottom of flex container (or start of it if nav scrolls)
    transition: "all 0.2s",
    flexShrink: 0,
  },
  main: {
    flex: 1,
    padding: "30px 40px",
    marginLeft: 260, // Matches new sidebar width
    background: "var(--bg-darker)",
    color: "var(--text-main)",
  },
};
