import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { FaRobot, FaTools, FaLightbulb, FaCheckCircle, FaHandsHelping, FaChalkboardTeacher, FaArrowRight } from "react-icons/fa";

const About = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  // Mouse Move Effect for Hero
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll Animation Logic
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => animatedElements.forEach(el => observer.unobserve(el));
  }, []);

  return (
    <div className="about-page">
      <Navbar />

      {/* --- IMMERSIVE HERO SECTION --- */}
      <div className="hero-section" ref={heroRef}>
        <div
          className="hero-glow"
          style={{
            left: mousePos.x,
            top: mousePos.y
          }}
        />
        <div className="hero-grid-bg"></div>

        <Container>
          <div className="hero-content">
            <div className="badge-box animate-on-scroll">
              <span className="badge-text">EST. 2024 • MEKARO ROBOTICS</span>
            </div>
            <h1 className="hero-title animate-on-scroll">
              Building the <br />
              <span className="gradient-text">Future of Making</span>
            </h1>
            <p className="hero-subtitle animate-on-scroll">
              Mekaro is a student-focused robotics platform built for
              <span className="highlight"> builders</span>,
              <span className="highlight"> learners</span>, and
              <span className="highlight"> innovators</span>.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <div className="main-content">

          {/* --- WHO WE ARE (Split Layout) --- */}
          <div className="section-split animate-on-scroll">
            <div className="split-text">
              <h2 className="section-heading">Who We Are</h2>
              <p className="body-text">
                We are engineers and makers who understand what it’s like to struggle with last-minute components, confusing product choices, and lack of practical guidance.
              </p>
              <p className="body-text">
                Mekaro was created to bridge the gap between <strong>robotics ideas</strong> and <strong>execution</strong>.
              </p>
              <div className="quote-box">
                "We believe robotics should be accessible, practical, and supported — not complicated or intimidating."
              </div>
            </div>
            <div className="split-visual">
              {/* Abstract Tech Visual */}
              <div className="tech-orb">
                <div className="orb-core"></div>
                <div className="orb-ring ring-1"></div>
                <div className="orb-ring ring-2"></div>
                <div className="orb-ring ring-3"></div>
              </div>
            </div>
          </div>

          {/* --- WHAT WE DO (Interactive Cards) --- */}
          <div className="section-block">
            <h2 className="section-heading center-text animate-on-scroll">What We Do</h2>
            <div className="verticals-grid">

              {/* Card 1 */}
              <div className="vertical-card animate-on-scroll">
                <div className="card-bg-glow"></div>
                <div className="card-icon-box box-blue">
                  <FaTools />
                </div>
                <h3 className="card-title">Robotics Supply & <br />Project Support</h3>
                <p className="card-desc">
                  High-quality components, kits, and tools tailored for students. We don't just sell parts; we fuel projects.
                </p>
                <ul className="feature-list">
                  <li><FaCheckCircle className="f-icon" /> Curated kits that work</li>
                  <li><FaCheckCircle className="f-icon" /> Pre-purchase guidance</li>
                  <li><FaCheckCircle className="f-icon" /> Project-on-demand</li>
                  <li><FaCheckCircle className="f-icon" /> Expert technical support</li>
                </ul>
              </div>

              {/* Card 2 */}
              <div className="vertical-card animate-on-scroll" style={{ transitionDelay: "200ms" }}>
                <div className="card-bg-glow glow-purple"></div>
                <div className="card-icon-box box-purple">
                  <FaChalkboardTeacher />
                </div>
                <h3 className="card-title">Robotics Workshops & <br />Training Programs</h3>
                <p className="card-desc">
                  Hands-on workshops for schools and colleges, designed to be practical and real-world focused.
                </p>
                <ul className="feature-list">
                  <li><FaCheckCircle className="f-icon" /> Beginner to Advanced</li>
                  <li><FaCheckCircle className="f-icon" /> Hands-on Learning</li>
                  <li><FaCheckCircle className="f-icon" /> Real-world Applications</li>
                  <li><FaCheckCircle className="f-icon" /> Custom Syllabus</li>
                </ul>
              </div>

            </div>
          </div>

          {/* --- PHILOSOPHY (Typography Art) --- */}
          <div className="philosophy-section animate-on-scroll">
            <div className="philosophy-container">
              <span className="big-word word-1">BUILD.</span>
              <span className="big-word word-2">BREAK.</span>
              <span className="big-word word-3">MAKE.</span>
            </div>
            <p className="philosophy-sub">
              Success isn't linear. It's iterative. <br />
              Robotics starts with <strong>hands-on creation.</strong>
            </p>
          </div>

        </div>
      </Container>

      <div className="footer-spacer">
        <Footer />
      </div>

      <style>{`
                :root {
                    --neon-blue: #06b6d4;
                    --neon-purple: #a855f7;
                    --dark-bg: #020617;
                    --card-bg: rgba(30, 41, 59, 0.4);
                }

                .about-page {
                    background-color: var(--dark-bg);
                    min-height: 100vh;
                    color: white;
                    overflow-x: hidden;
                    font-family: 'Inter', sans-serif;
                }

                /* ANIMATION UTILS */
                .animate-on-scroll {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .animate-on-scroll.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* HERO */
                .hero-section {
                    position: relative;
                    min-height: 80vh;
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden;
                    text-align: center;
                }
                .hero-grid-bg {
                    position: absolute; inset: 0;
                    background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
                    z-index: 1;
                }
                .hero-glow {
                    position: fixed; /* Parallax feel */
                    width: 600px; height: 600px;
                    background: radial-gradient(circle, rgba(6, 182, 212, 0.15), transparent 70%);
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
                    padding: 8px 16px; border-radius: 50px;
                    margin-bottom: 24px;
                    backdrop-filter: blur(5px);
                }
                .badge-text {
                    font-size: 0.85rem; letter-spacing: 2px;
                    color: var(--neon-blue); font-weight: 600;
                }

                .hero-title {
                    font-size: 5rem; line-height: 1.1; font-weight: 800;
                    margin-bottom: 24px;
                }
                .gradient-text {
                    background: linear-gradient(135deg, #fff, var(--neon-blue));
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 30px rgba(6, 182, 212, 0.3));
                }

                .hero-subtitle {
                    font-size: 1.5rem; color: #94a3b8; max-width: 700px; line-height: 1.6;
                }
                .highlight { color: #fff; font-weight: 600; position: relative; }
                .highlight::after {
                    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
                    background: var(--neon-blue); opacity: 0.5;
                }

                /* SECTION SPLIT */
                .main-content { padding: 80px 0; display: flex; flex-direction: column; gap: 120px; }
                
                .section-split {
                    display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; align-items: center;
                }
                .section-heading {
                    font-size: 3rem; font-weight: 800; margin-bottom: 30px;
                    background: linear-gradient(to right, #fff, #cbd5e1);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                .center-text { text-align: center; }
                
                .body-text { font-size: 1.15rem; color: #cbd5e1; line-height: 1.8; margin-bottom: 20px; }
                .quote-box {
                    border-left: 4px solid var(--neon-blue);
                    padding-left: 20px; margin-top: 30px;
                    font-size: 1.25rem; font-style: italic; color: white;
                    background: linear-gradient(90deg, rgba(6, 182, 212, 0.05), transparent);
                    padding: 20px; border-radius: 0 12px 12px 0;
                }

                /* TECH ORB ANIMATION */
                .tech-orb {
                    width: 300px; height: 300px; position: relative; margin: 0 auto;
                }
                .orb-core {
                    position: absolute; inset: 40px; border-radius: 50%;
                    background: radial-gradient(circle, var(--neon-blue), transparent);
                    opacity: 0.5; filter: blur(20px);
                    animation: pulse 4s infinite alternate;
                }
                .orb-ring {
                    position: absolute; inset: 0; border-radius: 50%;
                    border: 1px solid rgba(6, 182, 212, 0.3);
                }
                .ring-1 { animation: spin 10s linear infinite; border-top-color: var(--neon-blue); }
                .ring-2 { inset: 20px; animation: spin 15s linear infinite reverse; border-left-color: var(--neon-purple); }
                .ring-3 { inset: 50px; animation: spin 7s linear infinite; border-bottom-color: white; }

                /* VERTICALS GRID */
                .verticals-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
                }
                .vertical-card {
                    position: relative;
                    background: var(--card-bg);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 30px;
                    padding: 50px;
                    overflow: hidden;
                    transition: transform 0.4s ease, border-color 0.4s ease;
                }
                .vertical-card:hover {
                    transform: translateY(-10px);
                    border-color: rgba(255,255,255,0.3);
                }
                .card-bg-glow {
                    position: absolute; top: -50px; right: -50px;
                    width: 200px; height: 200px;
                    background: var(--neon-blue);
                    filter: blur(80px); opacity: 0.15;
                    transition: opacity 0.4s;
                }
                .vertical-card:hover .card-bg-glow { opacity: 0.25; }
                .glow-purple { background: var(--neon-purple); }

                .card-icon-box {
                    width: 80px; height: 80px; border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 32px; margin-bottom: 30px;
                }
                .box-blue { background: rgba(6, 182, 212, 0.1); color: var(--neon-blue); }
                .box-purple { background: rgba(168, 85, 247, 0.1); color: var(--neon-purple); }

                .card-title { font-size: 2rem; margin-bottom: 16px; line-height: 1.2; font-weight: 700; }
                .card-desc { font-size: 1.1rem; color: #94a3b8; margin-bottom: 30px; line-height: 1.6; }

                .feature-list { list-style: none; padding: 0; }
                .feature-list li {
                    display: flex; align-items: center; gap: 12px;
                    font-size: 1.05rem; color: #e2e8f0; margin-bottom: 14px;
                }
                .f-icon { color: var(--neon-blue); opacity: 0.8; }
                .vertical-card:nth-child(2) .f-icon { color: var(--neon-purple); }

                /* PHILOSOPHY */
                .philosophy-section {
                    text-align: center;
                    padding: 60px;
                    position: relative;
                }
                .philosophy-container {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 10px; margin-bottom: 30px;
                }
                .big-word {
                    font-size: 8rem; font-weight: 900; line-height: 0.8;
                    color: transparent; -webkit-text-stroke: 2px rgba(255,255,255,0.1);
                    transition: transform 0.5s ease, color 0.5s ease;
                    cursor: default;
                }
                .big-word:hover {
                    color: white;
                    -webkit-text-stroke: 0;
                    filter: drop-shadow(0 0 20px rgba(255,255,255,0.5));
                }
                .word-1:hover { color: var(--neon-blue); filter: drop-shadow(0 0 40px var(--neon-blue)); }
                .word-2:hover { color: #f43f5e; filter: drop-shadow(0 0 40px #f43f5e); }
                .word-3:hover { color: #10b981; filter: drop-shadow(0 0 40px #10b981); }

                .philosophy-sub { font-size: 1.5rem; color: #94a3b8; }
                .philosophy-sub strong { color: white; }

                .footer-spacer { margin-top: auto; }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { from { opacity: 0.3; transform: scale(0.9); } to { opacity: 0.6; transform: scale(1.1); } }

                /* MOBILE */
                @media (max-width: 768px) {
                    .hero-title { font-size: 3rem; }
                    .section-split { grid-template-columns: 1fr; gap: 40px; }
                    .verticals-grid { grid-template-columns: 1fr; }
                    .big-word { font-size: 4rem; }
                    .tech-orb { width: 200px; height: 200px; margin-top: 20px; }
                }
            `}</style>
    </div>
  );
};

export default About;
