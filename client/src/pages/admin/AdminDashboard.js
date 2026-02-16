import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { FaUserFriends, FaBolt, FaShoppingBag, FaDollarSign, FaClock, FaRocket } from "react-icons/fa";
import ModernLoader from "../../components/ModernLoader";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/admin/stats/")
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <ModernLoader />;

  // Default stats if failed or null (for preview purposes if API fails)
  const safeStats = stats || {
    total_users: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0
  };

  return (
    <div className="dashboard-container" style={{ animation: "fadeIn 0.8s ease-out" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(2deg); } 100% { transform: translateY(0px) rotate(0deg); } }
        @keyframes pulse { 0% { opacity: 0.6; box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); } 70% { opacity: 1; box-shadow: 0 0 20px 10px rgba(6, 182, 212, 0); } 100% { opacity: 0.6; box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glowBar { 0% { width: 0%; } 100% { width: var(--target-width); } }
        
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-section {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9));
          border-radius: 24px;
          padding: 40px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          backdrop-filter: blur(10px);
        }

        .hero-bg-glow {
          position: absolute;
          top: -50%;
          left: -10%;
          width: 60%;
          height: 200%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
          animation: pulse 4s infinite;
          z-index: 0;
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(to right, #fff, var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }

        .hero-subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
          max-width: 600px;
          line-height: 1.6;
        }

        .hero-visual {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 200px;
          height: 200px;
        }

        .rocket-icon {
          font-size: 8rem;
          color: var(--primary);
          filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.6));
          animation: float 6s ease-in-out infinite;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }



      `}</style>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-bg-glow"></div>
        <div className="hero-content">
          <h1 className="hero-title">Mission Control Center</h1>
          <p className="hero-subtitle">
            Welcome back, Admin. Systems are operating at peak efficiency.
            Ready to scale Mekaro to new frontiers?
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.1)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Systems Online</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.1)', padding: '8px 16px', borderRadius: '20px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
              <FaBolt style={{ color: '#a855f7', fontSize: '0.8rem' }} />
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>High Performance</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <FaRocket className="rocket-icon" />
          {/* Decorative elements behind rocket */}
          <div style={{ position: 'absolute', width: '100%', height: '100%', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '50%', animation: 'spinSlow 20s linear infinite' }}></div>
          <div style={{ position: 'absolute', width: '70%', height: '70%', border: '1px solid rgba(6, 182, 212, 0.1)', borderRadius: '50%', animation: 'spinSlow 10s linear infinite reverse' }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={safeStats.total_users}
          icon={<FaUserFriends />}
          color="var(--primary)"
          glow="rgba(6, 182, 212, 0.4)"
          delay="0s"
        />
        <StatCard
          title="Total Orders"
          value={safeStats.total_orders}
          icon={<FaShoppingBag />}
          color="#a78bfa" // Purple
          glow="rgba(167, 139, 250, 0.4)"
          delay="0.1s"
        />
        <StatCard
          title="Total Revenue"
          value={"₹" + safeStats.total_revenue.toLocaleString()}
          icon={<FaDollarSign />}
          color="#4ade80" // Green
          glow="rgba(74, 222, 128, 0.4)"
          delay="0.2s"
        />
        <StatCard
          title="Pending Orders"
          value={safeStats.pending_orders}
          icon={<FaClock />}
          color="#facc15" // Yellow
          glow="rgba(250, 204, 21, 0.4)"
          delay="0.3s"
        />
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, color, glow, delay }) {
  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.5)",
        padding: "24px",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        animation: `slideUp 0.5s ease-out ${delay || '0s'} backwards`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = "0 10px 30px -10px " + glow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        width: "50px",
        height: "50px",
        borderRadius: "14px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "1.3rem",
        background: color + "20",
        color: color,
        boxShadow: "0 0 15px " + glow
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>{title}</h3>
        <h2 style={{ fontSize: "1.8rem", fontWeight: "700", margin: 0, color: "white" }}>{value}</h2>
      </div>
    </div>
  );
}
