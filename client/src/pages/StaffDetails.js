import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { coreTeam } from "../data/team";
import API from "../api/axios";
import { FaLinkedin, FaEnvelope, FaChevronLeft, FaChalkboardTeacher, FaUserTie, FaTools } from "react-icons/fa";
import ModernLoader from "../components/ModernLoader";

export default function StaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMember = async () => {
      setLoading(true);
      setError(false);
      try {
        if (id.startsWith("core-")) {
          const coreId = parseInt(id.replace("core-", ""), 10);
          const found = coreTeam.find((m) => m.id === coreId);
          if (found) {
            setMember({ ...found, isCore: true });
          } else {
            setError(true);
          }
        } else {
          // Dynamic Staff from database
          const res = await API.get(`/api/staff/${id}/`);
          setMember({ ...res.data, isCore: false });
        }
      } catch (err) {
        console.error("Failed to load staff details:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading) return <ModernLoader />;

  if (error || !member) {
    return (
      <div className="details-error-page">
        <Navbar />
        <Container>
          <div className="error-container">
            <FaUserTie className="error-icon" />
            <h2>Staff Member Not Found</h2>
            <p>We couldn't find the profile you are looking for. It may have been updated or moved.</p>
            <Link to="/team" className="back-link-btn">
              <FaChevronLeft /> Back to Tutors & Staff
            </Link>
          </div>
        </Container>
        <Footer />
        <style>{`
          .details-error-page {
            background-color: #020617;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            color: white;
          }
          .error-container {
            text-align: center;
            padding: 80px 20px;
            max-width: 600px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          .error-icon {
            font-size: 4rem;
            color: #ef4444;
            filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.3));
          }
          .back-link-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2));
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            transition: all 0.3s ease;
          }
          .back-link-btn:hover {
            border-color: #06b6d4;
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    );
  }

  // Determine Neon Color Theme based on Role / Type
  let themeColor = "#06b6d4"; // Cyan default
  let themeGlow = "rgba(6, 182, 212, 0.15)";
  let themeName = "cyan";

  const upperRole = member.role.toUpperCase();
  if (member.isCore) {
    if (upperRole.includes("CEO") || upperRole.includes("FOUNDER")) {
      themeColor = "#f59e0b"; // Gold
      themeGlow = "rgba(245, 158, 11, 0.15)";
      themeName = "gold";
    } else if (upperRole.includes("CTO")) {
      themeColor = "#06b6d4"; // Cyan
      themeGlow = "rgba(6, 182, 212, 0.15)";
      themeName = "cyan";
    } else if (upperRole.includes("COO") || upperRole.includes("ADMIN")) {
      themeColor = "#a855f7"; // Purple
      themeGlow = "rgba(168, 85, 247, 0.15)";
      themeName = "purple";
    }
  } else {
    // Dynamic staff
    if (member.type === "staff") {
      themeColor = "#a855f7"; // Purple
      themeGlow = "rgba(168, 85, 247, 0.15)";
      themeName = "purple";
    }
  }

  // Format expertise tags
  const skills = member.isCore
    ? member.expertise || []
    : member.expertise
    ? member.expertise.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Get image URL
  const imageUrl = member.image
    ? member.image.startsWith("http") || member.image.startsWith("/media/")
      ? member.image.startsWith("http")
        ? member.image
        : `${process.env.REACT_APP_API_URL || "http://localhost:8000"}${member.image}`
      : member.image
    : null;

  return (
    <div className="staff-details-page">
      <Navbar />

      <Container>
        <div className="details-container">
          {/* Back Navigation */}
          <button onClick={() => navigate("/team")} className="back-btn">
            <FaChevronLeft /> Back to Tutors & Staff
          </button>

          {/* Profile Card & Details Columns */}
          <div className="details-layout">
            
            {/* Left Side: Portrait Card */}
            <div className="details-left">
              <div className={`premium-card glow-${themeName}`}>
                <div className="card-tech-grid"></div>
                <div className="card-corner corner-tl"></div>
                <div className="card-corner corner-tr"></div>
                <div className="card-corner corner-bl"></div>
                <div className="card-corner corner-br"></div>

                {/* Badge */}
                <div className="badge-row">
                  <span className={`type-badge badge-${themeName}`}>
                    {member.isCore ? "LEADERSHIP" : member.type === "tutor" ? "TUTOR" : "STAFF"}
                  </span>
                </div>

                {/* Image Frame */}
                <div className="details-avatar-section">
                  <div className="details-image-frame">
                    <div className="frame-corner frame-corner-tl"></div>
                    <div className="frame-corner frame-corner-tr"></div>
                    <div className="frame-corner frame-corner-bl"></div>
                    <div className="frame-corner frame-corner-br"></div>
                    {imageUrl ? (
                      <img src={imageUrl} alt={member.name} className="profile-image" />
                    ) : (
                      <div className="profile-fallback">
                        {member.type === "tutor" || member.isCore ? <FaChalkboardTeacher /> : <FaUserTie />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Links */}
                <div className="contact-links-row">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="contact-btn linkedin-btn" aria-label="LinkedIn">
                      <FaLinkedin /> Connect LinkedIn
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="contact-btn email-btn" aria-label="Email">
                      <FaEnvelope /> Send Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Professional Details */}
            <div className="details-right">
              <div className="details-header">
                <h1 className={`member-name text-${themeName}`}>{member.name}</h1>
                <h2 className="member-role">{member.role}</h2>
                <div className={`role-accent accent-${themeName}`}></div>
              </div>

              {/* Biography Section */}
              {member.bio && (
                <div className="info-section glass-box">
                  <h3 className="section-subtitle">
                    <FaUserTie className={`icon-${themeName}`} /> Professional Biography
                  </h3>
                  <p className="bio-text">{member.bio}</p>
                </div>
              )}

              {/* Expertise Tags */}
              {skills.length > 0 && (
                <div className="info-section glass-box">
                  <h3 className="section-subtitle">
                    <FaTools className={`icon-${themeName}`} /> Technical Expertise
                  </h3>
                  <div className="skills-grid">
                    {skills.map((skill, index) => (
                      <span key={index} className={`skill-tag tag-${themeName}`}>
                        <span className="dot"></span> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </Container>

      <Footer />

      <style>{`
        .staff-details-page {
          background-color: #020617;
          min-height: 100vh;
          color: white;
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
        }

        .details-container {
          padding: 40px 0 80px 0;
        }

        /* --- BACK NAVIGATION --- */
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 30px;
          transition: all 0.3s ease;
          padding: 0;
        }
        .back-btn:hover {
          color: ${themeColor};
          transform: translateX(-4px);
        }

        /* --- LAYOUT --- */
        .details-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 40px;
          align-items: start;
        }

        /* --- LEFT COLUMN: PORTRAIT CARD --- */
        .details-left {
          position: sticky;
          top: 90px;
        }

        .premium-card {
          position: relative;
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Neon Glow Accents */
        .premium-card.glow-gold {
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.05);
          border-color: rgba(245, 158, 11, 0.15);
        }
        .premium-card.glow-gold:hover {
          border-color: #f59e0b;
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.25);
        }

        .premium-card.glow-cyan {
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.05);
          border-color: rgba(6, 182, 212, 0.15);
        }
        .premium-card.glow-cyan:hover {
          border-color: #06b6d4;
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.25);
        }

        .premium-card.glow-purple {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.05);
          border-color: rgba(168, 85, 247, 0.15);
        }
        .premium-card.glow-purple:hover {
          border-color: #a855f7;
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.25);
        }

        /* Corner HUD Elements */
        .card-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: ${themeColor};
          border-style: solid;
          opacity: 0.8;
        }
        .corner-tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; }
        .corner-tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
        .corner-bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; }
        .corner-br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }

        .card-tech-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 15px 15px;
          z-index: 0;
          pointer-events: none;
        }

        /* Badge Row */
        .badge-row {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          z-index: 2;
          position: relative;
        }

        .type-badge {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 2px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid transparent;
        }
        .badge-gold {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border-color: rgba(245, 158, 11, 0.25);
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.1);
        }
        .badge-cyan {
          background: rgba(6, 182, 212, 0.1);
          color: #06b6d4;
          border-color: rgba(6, 182, 212, 0.25);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
        }
        .badge-purple {
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
          border-color: rgba(168, 85, 247, 0.25);
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.1);
        }

        /* Avatar Section */
        .details-avatar-section {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
          z-index: 2;
          position: relative;
        }

        .details-image-frame {
          position: relative;
          width: 200px;
          height: 250px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 6px;
          box-sizing: border-box;
          overflow: hidden;
        }

        .frame-corner {
          position: absolute;
          width: 6px;
          height: 6px;
          border-color: ${themeColor};
          border-style: solid;
          z-index: 2;
        }
        .frame-corner-tl { top: 4px; left: 4px; border-width: 1.5px 0 0 1.5px; }
        .frame-corner-tr { top: 4px; right: 4px; border-width: 1.5px 1.5px 0 0; }
        .frame-corner-bl { bottom: 4px; left: 4px; border-width: 0 0 1.5px 1.5px; }
        .frame-corner-br { bottom: 4px; right: 4px; border-width: 0 1.5px 1.5px 0; }

        .profile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .profile-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 4rem;
          color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }

        /* Contact buttons */
        .contact-links-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 2;
          position: relative;
        }

        .contact-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .linkedin-btn {
          background: rgba(10, 102, 194, 0.1);
          color: #0a66c2;
          border-color: rgba(10, 102, 194, 0.3);
        }
        .linkedin-btn:hover {
          background: #0a66c2;
          color: white;
          box-shadow: 0 0 15px rgba(10, 102, 194, 0.4);
        }

        .email-btn {
          background: rgba(255, 255, 255, 0.03);
          color: white;
        }
        .email-btn:hover {
          background: ${themeColor};
          color: black;
          border-color: ${themeColor};
          box-shadow: 0 0 15px ${themeGlow};
        }

        /* --- RIGHT COLUMN: DETAILS --- */
        .details-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .details-header {
          position: relative;
          padding-bottom: 15px;
        }

        .member-name {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 5px 0;
          letter-spacing: -1px;
        }
        .text-gold { color: #f59e0b; }
        .text-cyan { color: #06b6d4; }
        .text-purple { color: #a855f7; }

        .member-role {
          font-size: 1.25rem;
          font-weight: 600;
          color: #94a3b8;
          margin: 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .role-accent {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 80px;
          height: 3px;
          border-radius: 2px;
        }
        .accent-gold { background: #f59e0b; }
        .accent-cyan { background: #06b6d4; }
        .accent-purple { background: #a855f7; }

        /* Glass Boxes */
        .glass-box {
          background: rgba(30, 41, 59, 0.3);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
        }

        .section-subtitle {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: 0.5px;
        }

        .icon-gold { color: #f59e0b; }
        .icon-cyan { color: #06b6d4; }
        .icon-purple { color: #a855f7; }

        .bio-text {
          color: #cbd5e1;
          line-height: 1.7;
          font-size: 1rem;
          margin: 0;
        }

        /* Focus List */
        .focus-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .focus-list li {
          display: flex;
          align-items: start;
          gap: 12px;
          color: #cbd5e1;
          line-height: 1.5;
        }
        .focus-list li strong {
          color: white;
        }
        .focus-list li svg {
          margin-top: 4px;
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .bullet-gold { color: #f59e0b; }
        .bullet-cyan { color: #06b6d4; }
        .bullet-purple { color: #a855f7; }

        /* Skills/Expertise */
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .skill-tag {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .skill-tag .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .tag-gold { border-color: rgba(245, 158, 11, 0.15); }
        .tag-gold:hover {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.1);
        }
        .tag-gold .dot { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }

        .tag-cyan { border-color: rgba(6, 182, 212, 0.15); }
        .tag-cyan:hover {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.05);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.1);
        }
        .tag-cyan .dot { background: #06b6d4; box-shadow: 0 0 6px #06b6d4; }

        .tag-purple { border-color: rgba(168, 85, 247, 0.15); }
        .tag-purple:hover {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.05);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.1);
        }
        .tag-purple .dot { background: #a855f7; box-shadow: 0 0 6px #a855f7; }

        /* --- RESPONSIVE STYLE OVERRIDES --- */
        @media (max-width: 768px) {
          .details-layout {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .details-left {
            position: relative;
            top: 0;
          }
          .details-image-frame {
            width: 180px;
            height: 220px;
          }
          .member-name {
            font-size: 2rem;
          }
          .member-role {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
