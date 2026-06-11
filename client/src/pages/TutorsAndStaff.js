import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { coreTeam } from "../data/team";
import API from "../api/axios";
import { FaLinkedin, FaEnvelope, FaSearch, FaChalkboardTeacher, FaUserTie, FaGraduationCap, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ModernLoader from "../components/ModernLoader";

export default function TutorsAndStaff() {
  const navigate = useNavigate();

  // Mouse Move Effect for Hero Glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Dynamic Staff States
  const [dynamicStaff, setDynamicStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "tutor", "staff"
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleCardClick = (e, member, isCore) => {
    if (e.target.closest("a") || e.target.closest("button")) {
      return;
    }
    navigate(isCore ? `/staff/core-${member.id}` : `/staff/${member.id}`);
  };

  // Mouse Move Effect for Hero Glow
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch Dynamic Staff from API
  const fetchDynamicStaff = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        page_size: 10,
      };
      if (filter !== "all") {
        params.type = filter;
      }
      if (searchQuery.trim() !== "") {
        params.search = searchQuery;
      }

      const res = await API.get("/api/staff/", { params });
      
      if (res.data.results) {
        setDynamicStaff(res.data.results);
        setTotalCount(res.data.count);
        // Calculate total pages (page size is 10)
        setTotalPages(Math.ceil(res.data.count / 10) || 1);
      } else {
        // Fallback for non-paginated or list
        setDynamicStaff(res.data);
        setTotalPages(1);
        setTotalCount(res.data.length);
      }
    } catch (err) {
      console.error("Failed to fetch dynamic staff:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when dependencies change
  useEffect(() => {
    fetchDynamicStaff();
  }, [filter, currentPage]);

  // Handle Search Input Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchDynamicStaff();
  };

  // Reset search when input cleared
  useEffect(() => {
    if (searchQuery === "") {
      setCurrentPage(1);
      fetchDynamicStaff();
    }
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to staff section
      const section = document.getElementById("dynamic-staff-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="team-page">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="hero-section" ref={heroRef}>
        <div
          className="hero-glow"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
        />
        <div className="hero-grid-bg"></div>

        <Container>
          <div className="hero-content">
            <div className="badge-box">
              <span className="badge-text">MEKARO TEAM</span>
            </div>
            <h1 className="hero-title">
              Meet Our <span className="gradient-text">Experts & Guides</span>
            </h1>
            <p className="hero-subtitle">
              The builders, creators, and teachers guiding you on your path to robotics mastery.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="main-content">
          
          {/* --- SECTION 1: CORE TEAM (STATIC) --- */}
          <div className="team-section-header">
            <h2 className="section-title">Core Leadership</h2>
            <div className="section-divider"></div>
          </div>

          <div className="team-grid core-grid">
            {coreTeam.map((member) => (
              <div 
                key={member.id} 
                className="member-card core-card"
                onClick={(e) => handleCardClick(e, member, true)}
                style={{ cursor: "pointer" }}
              >
                {/* Tech background elements */}
                <div className="card-tech-grid"></div>
                <div className="card-glow-overlay"></div>
                <div className="card-corner corner-tl"></div>
                <div className="card-corner corner-tr"></div>
                <div className="card-corner corner-bl"></div>
                <div className="card-corner corner-br"></div>
                
                {member.type && (
                  <div className="card-badge-row">
                    <div className="core-badge-container">
                      <span className="core-badge-glow-text">{member.type}</span>
                    </div>
                  </div>
                )}
                
                {/* Card Header (Avatar & Scanner Rings) */}
                <div className="avatar-section-rectangular">
                  <div className="avatar-scanner-container-rectangular">
                    <div className="image-frame-rectangular">
                      <div className="frame-corner frame-corner-tl"></div>
                      <div className="frame-corner frame-corner-tr"></div>
                      <div className="frame-corner frame-corner-bl"></div>
                      <div className="frame-corner frame-corner-br"></div>
                      {member.image ? (
                        <img 
                          src={member.image}
                          alt={member.name} 
                          className="core-profile-img-rectangular"
                        />
                      ) : (
                        <div className="avatar-fallback-rectangular">
                          <FaChalkboardTeacher />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Member Details */}
                <div className="member-info">
                  <h3 className="member-name-premium">{member.name}</h3>
                  <p className="member-role-premium">{member.role}</p>
                  <p className="member-bio-premium">{member.bio}</p>
                </div>

                {/* Expertise/Skills */}
                {member.expertise && member.expertise.length > 0 && (
                  <div className="skills-section">
                    {member.expertise.map((skill, index) => (
                      <span key={index} className="skill-tag core-tag-premium">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social/Contact Links */}
                <div className="socials-row-premium">
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-wrapper" aria-label="LinkedIn">
                      <FaLinkedin className="social-icon-premium" />
                    </a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="social-icon-wrapper" aria-label="Email">
                      <FaEnvelope className="social-icon-premium" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* --- SECTION 2: DYNAMIC STAFF & TUTORS --- */}
          <div id="dynamic-staff-section" className="team-section-header" style={{ marginTop: "40px" }}>
            <h2 className="section-title">Instructors & Support Staff</h2>
            <div className="section-divider"></div>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="controls-row">
            <div className="controls-corner-bracket controls-corner-tl"></div>
            <div className="controls-corner-bracket controls-corner-tr"></div>
            <div className="controls-corner-bracket controls-corner-bl"></div>
            <div className="controls-corner-bracket controls-corner-br"></div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button
                className={`tab-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => { setFilter("all"); setCurrentPage(1); }}
              >
                All
              </button>
              <button
                className={`tab-btn ${filter === "tutor" ? "active" : ""}`}
                onClick={() => { setFilter("tutor"); setCurrentPage(1); }}
              >
                Tutors
              </button>
              <button
                className={`tab-btn ${filter === "staff" ? "active" : ""}`}
                onClick={() => { setFilter("staff"); setCurrentPage(1); }}
              >
                Support Staff
              </button>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="search-box">
              <input
                type="text"
                placeholder="Search by name, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <FaSearch className="search-icon" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="search-clear-btn"
                  aria-label="Clear search"
                >
                  &times;
                </button>
              )}
            </form>
          </div>

          {/* DYNAMIC STAFF GRID */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <ModernLoader />
            </div>
          ) : dynamicStaff.length > 0 ? (
            <>
              <div className="team-grid staff-grid-compact">
                {dynamicStaff.map((member) => (
                  <div 
                    key={member.id} 
                    className={`member-card staff-card-compact ${member.type === "tutor" ? "tutor-card" : "staff-card"}`}
                    onClick={(e) => handleCardClick(e, member, false)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Tech background elements */}
                    <div className="card-tech-grid"></div>
                    <div className="card-glow-overlay"></div>
                    <div className="card-corner corner-tl"></div>
                    <div className="card-corner corner-tr"></div>
                    <div className="card-corner corner-bl"></div>
                    <div className="card-corner corner-br"></div>

                    <div className={`card-bg-glow ${member.type === "tutor" ? "glow-blue" : "glow-purple"}`}></div>
                    
                    {/* Staff Type Badge (Premium Non-Overlapping Row) */}
                    <div className="card-badge-row">
                      <div className="staff-badge-container">
                        <span className={`staff-badge-glow-text ${member.type === "tutor" ? "text-tutor" : "text-staff"}`}>
                          {member.type === "tutor" ? "Tutor" : "Staff"}
                        </span>
                      </div>
                    </div>

                    {/* Card Header (Avatar & Scanner Rings) */}
                    <div className="avatar-section-rectangular">
                      <div className="avatar-scanner-container-rectangular">
                        <div className={`image-frame-rectangular ${member.type === "tutor" ? "frame-tutor" : "frame-staff"}`}>
                          <div className="frame-corner frame-corner-tl"></div>
                          <div className="frame-corner frame-corner-tr"></div>
                          <div className="frame-corner frame-corner-bl"></div>
                          <div className="frame-corner frame-corner-br"></div>
                          {member.image ? (
                            <img 
                              src={member.image.startsWith("http") ? member.image : `${process.env.REACT_APP_API_URL || "http://localhost:8000"}${member.image}`} 
                              alt={member.name} 
                              className="core-profile-img-rectangular"
                            />
                          ) : member.type === "tutor" ? (
                            <div className="avatar-fallback-rectangular fallback-tutor">
                              <FaChalkboardTeacher />
                            </div>
                          ) : (
                            <div className="avatar-fallback-rectangular fallback-staff">
                              <FaUserTie />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="member-info">
                      <h3 className="member-name">{member.name}</h3>
                      <p className="member-role">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <FaChevronLeft /> Prev
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <FaGraduationCap className="empty-icon" />
              <h3>No team members found</h3>
              <p>We are updating our list of working instructors and staff. Check back soon!</p>
            </div>
          )}

          {/* --- CTA / JOIN US --- */}
          <div className="join-cta">
            <div className="cta-content">
              <h2>Want to join our Team?</h2>
              <p>We are always on the lookout for talented makers, educators, and operators.</p>
              <a href="/contact" className="cta-btn">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </Container>

      <Footer />

      <style>{`
        :root {
          --neon-blue: #06b6d4;
          --neon-purple: #a855f7;
          --neon-gold: #f59e0b;
          --dark-bg: #020617;
          --card-bg: rgba(30, 41, 59, 0.4);
          --primary-glow: rgba(6, 182, 212, 0.15);
          --purple-glow: rgba(168, 85, 247, 0.15);
        }

        .team-page {
          background-color: var(--dark-bg);
          min-height: 100vh;
          color: white;
          overflow-x: hidden;
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* --- HERO --- */
        .hero-section {
          position: relative;
          min-height: 25vh;
          display: flex; 
          align-items: center; 
          justify-content: center;
          overflow: hidden;
          text-align: center;
          padding: 40px 0;
        }
        .hero-grid-bg {
          position: absolute; inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 30px 30px;
          mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
          z-index: 1;
        }
        .hero-glow {
          position: absolute;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.12), transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
          mix-blend-mode: screen;
        }
        .hero-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
        }
        .badge-box {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          padding: 6px 12px; border-radius: 50px;
          margin-bottom: 12px;
          backdrop-filter: blur(5px);
        }
        .badge-text {
          font-size: 0.75rem; letter-spacing: 2px;
          color: var(--neon-blue); font-weight: 600;
        }
        .hero-title {
          font-size: 2.8rem; line-height: 1.1; font-weight: 800;
          margin-bottom: 10px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #fff, var(--neon-blue));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.2));
        }
        .hero-subtitle {
          font-size: 1.1rem; color: #94a3b8; max-width: 500px; line-height: 1.5;
        }

        /* --- CONTENT CONTAINER --- */
        .main-content {
          padding-bottom: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* --- SECTION HEADERS --- */
        .team-section-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 6px;
        }
        .section-title {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }
        .section-divider {
          width: 60px;
          height: 3px;
          background: var(--neon-blue);
          border-radius: 1.5px;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }

        /* --- CONTROLS ROW --- */
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.15);
          padding: 12px 16px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          position: relative;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        
        /* Dashboard HUD Corner Ticks */
        .controls-corner-bracket {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: rgba(6, 182, 212, 0.4);
          border-style: solid;
          pointer-events: none;
          z-index: 1;
        }
        .controls-corner-tl { top: 6px; left: 6px; border-width: 1.5px 0 0 1.5px; }
        .controls-corner-tr { top: 6px; right: 6px; border-width: 1.5px 1.5px 0 0; }
        .controls-corner-bl { bottom: 6px; left: 6px; border-width: 0 0 1.5px 1.5px; }
        .controls-corner-br { bottom: 6px; right: 6px; border-width: 0 1.5px 1.5px 0; }
        
        .filter-tabs {
          display: flex;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 3px;
          border-radius: 10px;
          gap: 2px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .tab-btn:hover {
          color: white;
          background: rgba(255, 255, 255, 0.03);
        }
        .tab-btn.active {
          background: linear-gradient(135deg, var(--neon-blue), #0891b2);
          color: white;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 320px;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 0.9rem;
          transition: color 0.3s;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 8px 36px 8px 36px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: white;
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .search-input:focus {
          border-color: var(--neon-blue);
          background: rgba(15, 23, 42, 0.8);
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.2);
        }
        .search-input:focus + .search-icon {
          color: var(--neon-blue);
        }
        .search-input::placeholder {
          color: #64748b;
        }
        .search-clear-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 1.15rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .search-clear-btn:hover {
          color: white;
        }

        /* --- TEAM GRID --- */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 20px;
          margin-bottom: 12px;
        }
        .staff-grid-compact {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
          gap: 16px !important;
        }

        .member-card {
          position: relative;
          background: var(--card-bg);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 20px 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(10px);
        }
        .staff-card-compact {
          position: relative;
          background: rgba(30, 41, 59, 0.25) !important;
          border: 1px solid rgba(255, 255, 255, 0.04) !important;
          box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.01) !important;
          padding: 20px 14px !important;
          border-radius: 12px !important;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          overflow: hidden;
        }

        /* Hover effects */
        .staff-card-compact:hover {
          transform: translateY(-5px) scale(1.02) !important;
          background: rgba(30, 41, 59, 0.45) !important;
        }
        
        /* Tutors (Cyan glow) */
        .staff-card-compact.tutor-card:hover {
          border-color: rgba(6, 182, 212, 0.4) !important;
          box-shadow: 
            0 10px 25px -10px rgba(6, 182, 212, 0.2),
            inset 0 0 12px rgba(6, 182, 212, 0.05) !important;
        }
        
        /* Staff (Purple glow) */
        .staff-card-compact.staff-card:hover {
          border-color: rgba(168, 85, 247, 0.4) !important;
          box-shadow: 
            0 10px 25px -10px rgba(168, 85, 247, 0.2),
            inset 0 0 12px rgba(168, 85, 247, 0.05) !important;
        }

        /* HUD Corner brackets for cards */
        .staff-card-compact .card-corner {
          position: absolute;
          width: 6px;
          height: 6px;
          opacity: 0;
          transition: all 0.3s ease;
        }
        .staff-card-compact:hover .card-corner {
          opacity: 0.8;
        }
        
        /* Tutor card corners (Cyan) */
        .staff-card-compact.tutor-card .card-corner { border-color: var(--neon-blue); }
        /* Staff card corners (Purple) */
        .staff-card-compact.staff-card .card-corner { border-color: var(--neon-purple); }

        .staff-card-compact .corner-tl { top: 8px; left: 8px; border-width: 1.5px 0 0 1.5px; }
        .staff-card-compact .corner-tr { top: 8px; right: 8px; border-width: 1.5px 1.5px 0 0; }
        .staff-card-compact .corner-bl { bottom: 8px; left: 8px; border-width: 0 0 1.5px 1.5px; }
        .staff-card-compact .corner-br { bottom: 8px; right: 8px; border-width: 0 1.5px 1.5px 0; }

        /* Tech grid overlay inside card */
        .staff-card-compact .card-tech-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.008) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.008) 1px, transparent 1px);
          background-size: 10px 10px;
          opacity: 0.5;
          z-index: 0;
          pointer-events: none;
        }
        .staff-card-compact:hover .card-tech-grid {
          opacity: 0.8;
        }

        /* Card background radial glow */
        .staff-card-compact .card-glow-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4));
          z-index: 0;
          opacity: 0.8;
        }
        
        /* Dynamic Name Styling */
        .staff-card-compact .member-name {
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          color: white !important;
          transition: all 0.3s ease;
          margin-top: 8px !important;
          margin-bottom: 2px !important;
        }
        .staff-card-compact.tutor-card:hover .member-name {
          color: var(--neon-blue) !important;
          text-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
        }
        .staff-card-compact.staff-card:hover .member-name {
          color: var(--neon-purple) !important;
          text-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
        }

        /* Designation Styling */
        .staff-card-compact .member-role {
          font-size: 0.72rem !important;
          color: #94a3b8 !important;
          text-transform: uppercase !important;
          letter-spacing: 1.2px !important;
          font-weight: 600 !important;
        }

        /* Avatar styling scaling */
        .staff-card-compact .avatar-section-rectangular {
          margin-bottom: 6px !important;
        }
        .staff-card-compact .avatar-scanner-container-rectangular {
          max-width: 120px !important;
        }
        .member-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.5);
        }

        .core-card {
          border: 1px solid rgba(6, 182, 212, 0.15);
          background: rgba(30, 41, 59, 0.5);
          padding: 24px 20px;
        }
        .core-card:hover {
          border-color: rgba(6, 182, 212, 0.4) !important;
          box-shadow: 0 12px 24px -10px rgba(6, 182, 212, 0.15) !important;
        }

        .card-bg-glow {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 100px;
          height: 100px;
          filter: blur(50px);
          opacity: 0.1;
          transition: all 0.4s ease;
          pointer-events: none;
        }
        .member-card:hover .card-bg-glow {
          opacity: 0.2;
          transform: scale(1.1);
        }
        .glow-blue { background: var(--neon-blue); }
        .glow-purple { background: var(--neon-purple); }
        .glow-cyan { background: var(--neon-gold); }

        .core-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: var(--neon-gold);
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 4px 10px;
          border-radius: 8px;
        }

        /* Rectangular Avatar Section */
        .avatar-section-rectangular {
          width: 100%;
          margin-bottom: 12px;
          display: flex;
          justify-content: center;
          z-index: 1;
        }
        .avatar-scanner-container-rectangular {
          position: relative;
          width: 100%;
          max-width: 170px;
          aspect-ratio: 4 / 5;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
        }
        .image-frame-rectangular {
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Frame Borders & Types */
        .image-frame-rectangular.frame-tutor {
          border-color: rgba(6, 182, 212, 0.25);
        }
        .image-frame-rectangular.frame-staff {
          border-color: rgba(168, 85, 247, 0.25);
        }
        
        .member-card:hover .image-frame-rectangular {
          border-color: var(--neon-blue);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
        }
        .member-card:hover .image-frame-rectangular.frame-tutor {
          border-color: var(--neon-blue);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
        }
        .member-card:hover .image-frame-rectangular.frame-staff {
          border-color: var(--neon-purple);
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
        }
        .core-card:hover .image-frame-rectangular {
          border-color: var(--neon-blue);
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.4);
        }
        
        .core-profile-img-rectangular {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .member-card:hover .core-profile-img-rectangular {
          transform: scale(1.05);
        }
        
        .avatar-fallback-rectangular {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.8rem;
          color: rgba(6, 182, 212, 0.4);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.4));
        }
        .avatar-fallback-rectangular.fallback-tutor {
          color: rgba(6, 182, 212, 0.4);
        }
        .avatar-fallback-rectangular.fallback-staff {
          color: rgba(168, 85, 247, 0.4);
        }
        
        
        /* Frame Corner HUD Elements */
        .frame-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: rgba(6, 182, 212, 0.4);
          border-style: solid;
          z-index: 2;
          pointer-events: none;
          transition: all 0.3s ease;
        }
        .image-frame-rectangular.frame-staff .frame-corner {
          border-color: rgba(168, 85, 247, 0.4);
        }
        .frame-corner-tl { top: 8px; left: 8px; border-width: 1.5px 0 0 1.5px; }
        .frame-corner-tr { top: 8px; right: 8px; border-width: 1.5px 1.5px 0 0; }
        .frame-corner-bl { bottom: 8px; left: 8px; border-width: 0 0 1.5px 1.5px; }
        .frame-corner-br { bottom: 8px; right: 8px; border-width: 0 1.5px 1.5px 0; }
        
        .member-card:hover .frame-corner {
          border-color: var(--neon-blue);
          filter: drop-shadow(0 0 2px var(--neon-blue));
        }
        .member-card:hover .image-frame-rectangular.frame-staff .frame-corner {
          border-color: var(--neon-purple);
          filter: drop-shadow(0 0 2px var(--neon-purple));
        }
        .core-card:hover .frame-corner {
          border-color: var(--neon-blue);
          filter: drop-shadow(0 0 2px var(--neon-blue));
        }
        
        /* Card Badge Row */
        .card-badge-row {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 4px;
          z-index: 2;
        }

        /* Staff absolute overlay badge */
        .staff-badge-container {
          padding: 3px 10px;
          border-radius: 4px;
          z-index: 2;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          transition: all 0.3s;
        }
        .member-card:hover .staff-badge-container {
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(30, 41, 59, 0.85);
        }
        .staff-badge-glow-text {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .staff-badge-glow-text.text-tutor {
          color: var(--neon-blue);
          text-shadow: 0 0 4px rgba(6, 182, 212, 0.5);
        }
        .staff-badge-glow-text.text-staff {
          color: var(--neon-purple);
          text-shadow: 0 0 4px rgba(168, 85, 247, 0.5);
        }

        /* Member Info */
        .member-info {
          margin-bottom: 12px;
        }
        .member-name {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: white;
        }
        .member-role {
          font-size: 0.8rem;
          color: #cbd5e1;
          font-weight: 500;
          margin: 0 0 8px 0;
        }
        .member-bio {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.45;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .member-card:hover .member-bio {
          -webkit-line-clamp: unset;
        }

        /* Skills/Expertise */
        .skills-section {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          justify-content: center;
          margin-bottom: 12px;
          margin-top: auto;
        }
        .skill-tag {
          font-size: 0.7rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .core-tag {
          border-color: rgba(6, 182, 212, 0.15);
          background: rgba(6, 182, 212, 0.05);
        }
        .member-card:hover .skill-tag {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
        }
        .member-card:hover .core-tag {
          border-color: rgba(6, 182, 212, 0.3);
          background: rgba(6, 182, 212, 0.1);
        }

        /* Socials */
        .socials-row {
          display: flex;
          gap: 12px;
          justify-content: center;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          width: 100%;
          padding-top: 12px;
        }
        .social-link {
          font-size: 1rem;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .social-link:hover {
          color: white;
          transform: translateY(-2px);
        }
        .member-card:hover .social-link:hover {
          color: var(--neon-blue);
        }
        .member-card:hover .core-link:hover {
          color: var(--neon-blue);
        }

        /* --- PAGINATION --- */
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
        }
        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .pagination-btn:hover:not(:disabled) {
          border-color: var(--neon-blue);
          background: rgba(6, 182, 212, 0.1);
          color: var(--neon-blue);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.15);
        }
        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pagination-info {
          color: #cbd5e1;
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* --- EMPTY STATE --- */
        .empty-state {
          text-align: center;
          padding: 30px 16px;
          background: var(--card-bg);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }
        .empty-icon {
          font-size: 2.5rem;
          color: #475569;
          margin-bottom: 12px;
        }
        .empty-state h3 {
          font-size: 1.25rem;
          margin: 0 0 6px 0;
        }
        .empty-state p {
          color: #64748b;
          margin: 0;
        }

        /* --- CTA SECTION --- */
        .join-cta {
          margin-top: 12px;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(2, 6, 23, 0.8));
          border: 1px solid rgba(6, 182, 212, 0.2);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.05);
          border-radius: 20px;
          padding: 30px 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .join-cta h2 {
          font-size: 1.6rem;
          font-weight: 800;
          margin: 0 0 8px 0;
        }
        .join-cta p {
          color: #cbd5e1;
          font-size: 0.95rem;
          max-width: 500px;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }
        .cta-btn {
          padding: 8px 24px;
          background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: 10px;
          border: none;
          box-shadow: 0 3px 12px rgba(6, 182, 212, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 16px rgba(6, 182, 212, 0.4);
        }

        /* --- PREMIUM CORE CARD REDESIGN --- */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scanEffect {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }

        .core-card {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%) !important;
          border: 1px solid rgba(6, 182, 212, 0.2) !important;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.05) !important;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
          border-radius: 16px;
          padding: 24px 20px;
        }
        .core-card:hover {
          transform: translateY(-4px) scale(1.005) !important;
          border-color: rgba(6, 182, 212, 0.5) !important;
          box-shadow: 0 10px 30px -10px rgba(6, 182, 212, 0.2) !important;
        }

        .card-tech-grid {
          position: absolute;
          inset: 0;
          background-size: 14px 14px;
          background-image: 
            linear-gradient(to right, rgba(6, 182, 212, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.02) 1px, transparent 1px);
          opacity: 0.8;
          z-index: 0;
          pointer-events: none;
        }
        .card-glow-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 20%, rgba(6, 182, 212, 0.12) 0%, transparent 60%);
          opacity: 0.5;
          transition: opacity 0.5s;
          z-index: 0;
          pointer-events: none;
        }
        .core-card:hover .card-glow-overlay {
          opacity: 1;
        }

        /* Bracket Corners */
        .card-corner {
          position: absolute;
          width: 10px;
          height: 10px;
          border-color: rgba(6, 182, 212, 0.3);
          border-style: solid;
          z-index: 2;
          transition: all 0.4s;
          pointer-events: none;
        }
        .core-card:hover .card-corner {
          border-color: rgba(6, 182, 212, 0.8);
          filter: drop-shadow(0 0 3px var(--neon-blue));
        }
        .corner-tl { top: 12px; left: 12px; border-width: 1.5px 0 0 1.5px; }
        .corner-tr { top: 12px; right: 12px; border-width: 1.5px 1.5px 0 0; }
        .corner-bl { bottom: 12px; left: 12px; border-width: 0 0 1.5px 1.5px; }
        .corner-br { bottom: 12px; right: 12px; border-width: 0 1.5px 1.5px 0; }

        /* Badge */
        .core-badge-container {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.25);
          padding: 3px 10px;
          border-radius: 4px;
          z-index: 2;
          transition: all 0.3s;
        }
        .core-card:hover .core-badge-container {
          border-color: rgba(6, 182, 212, 0.5);
          background: rgba(6, 182, 212, 0.18);
        }
        .core-badge-glow-text {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--neon-blue);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-shadow: 0 0 4px rgba(6, 182, 212, 0.5);
        }


        /* Card Content */
        .member-name-premium {
          font-size: 1.25rem;
          font-weight: 800;
          color: white;
          letter-spacing: 0.5px;
          margin: 0 0 4px 0;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          z-index: 2;
          position: relative;
        }
        .member-role-premium {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--neon-blue);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 8px 0;
          z-index: 2;
          position: relative;
        }
        .member-bio-premium {
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.45;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          z-index: 2;
          position: relative;
        }
        .core-card:hover .member-bio-premium {
          -webkit-line-clamp: unset;
        }

        .core-tag-premium {
          font-size: 0.7rem;
          background: rgba(6, 182, 212, 0.05) !important;
          border: 1px solid rgba(6, 182, 212, 0.2) !important;
          color: #e2e8f0;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s;
        }
        .core-card:hover .core-tag-premium {
          background: rgba(6, 182, 212, 0.15) !important;
          border-color: rgba(6, 182, 212, 0.5) !important;
          color: white;
          box-shadow: 0 0 8px rgba(6, 182, 212, 0.2);
        }

        /* Socials */
        .socials-row-premium {
          display: flex;
          gap: 10px;
          justify-content: center;
          border-top: 1px solid rgba(6, 182, 212, 0.15);
          width: 100%;
          padding-top: 12px;
          z-index: 2;
          position: relative;
        }
        .social-icon-wrapper {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.05);
          border: 1px solid rgba(6, 182, 212, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          color: #94a3b8;
        }
        .social-icon-wrapper:hover {
          background: var(--neon-blue) !important;
          border-color: var(--neon-blue) !important;
          color: black !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.4);
        }
        .social-icon-premium {
          font-size: 0.95rem;
          transition: color 0.3s;
        }
        .social-icon-wrapper:hover .social-icon-premium {
          color: black !important;
        }

        /* --- RESPONSIVE ADJUSTMENTS --- */
        @media (max-width: 768px) {
          .hero-section {
            padding: 30px 0 20px 0;
            min-height: auto;
          }
          .hero-title { font-size: 2rem; }
          .hero-subtitle { font-size: 0.9rem; }
          .section-title { font-size: 1.4rem; }
          .controls-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 12px;
          }
          .search-box { max-width: none; }
          .filter-tabs { justify-content: space-between; }
          .tab-btn {
            flex: 1;
            padding: 8px 10px;
            font-size: 0.8rem;
            text-align: center;
          }
          .team-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .member-card { padding: 16px 12px; }
          .join-cta { padding: 20px 12px; }
          .join-cta h2 { font-size: 1.4rem; }

          /* Mobile Snap Scroll Slider for Core Grid */
          .core-grid {
            display: flex !important;
            overflow-x: auto !important;
            scroll-snap-type: x mandatory;
            gap: 12px !important;
            padding: 12px 8px !important;
            width: 100vw;
            margin-left: calc(-50vw + 50%);
            scrollbar-width: none;
            box-sizing: border-box;
          }
          .core-grid::-webkit-scrollbar {
            display: none;
          }
          .core-card {
            flex: 0 0 220px !important;
            scroll-snap-align: center;
            padding: 16px 12px;
            box-sizing: border-box;
          }

          /* Compact Staff Cards in Mobile: 2 per row */
          .staff-grid-compact {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .staff-card-compact {
            padding: 12px 6px !important;
          }
          .staff-card-compact .avatar-scanner-container-rectangular {
            max-width: 85px !important;
          }
          .staff-card-compact .member-name {
            font-size: 0.95rem !important;
            margin-bottom: 2px !important;
          }
          .staff-card-compact .member-role {
            font-size: 0.72rem !important;
          }

        }
      `}</style>
    </div>
  );
}
