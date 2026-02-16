import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaEnvelope, FaPhone, FaUserTie } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import { useTranslation } from 'react-i18next';
import API from "../api/axios";

export default function Workshops() {
    // const { t } = useTranslation();
    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        phone: "",
        organization: "",
        message: ""
    });

    const handleChange = (e) => {
        setContactForm({ ...contactForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("/api/enquiries/", contactForm);
            alert("Thank you for your interest! We will contact you shortly.");
            setContactForm({ name: "", email: "", phone: "", organization: "", message: "" });
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            alert("Failed to send enquiry. Please try again.");
        }
    };

    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const res = await API.get("/api/workshops/");
                setWorkshops(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch workshops", err);
                setLoading(false);
            }
        };
        fetchWorkshops();
    }, []);

    const today = new Date();
    const upcomingWorkshops = workshops.filter(w => new Date(w.date) >= today);
    const pastWorkshops = workshops.filter(w => new Date(w.date) < today);

    return (
        <div className="workshops-page" style={{ minHeight: "100vh", background: "#0f172a", color: "white" }}>
            <Navbar />

            {/* Hero Section */}
            <section style={{
                position: "relative",
                height: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=2070')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                marginBottom: "40px"
            }}>
                <div style={{ textAlign: "center", padding: "20px" }}>
                    <h1 style={{
                        fontSize: "3.5rem",
                        fontWeight: "800",
                        marginBottom: "16px",
                        background: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        Workshops by Mekaro
                    </h1>
                    <p style={{ fontSize: "1.2rem", color: "#94a3b8", maxWidth: "600px", margin: "0 auto" }}>
                        Empowering the next generation of innovators through hands-on technical workshops.
                    </p>
                </div>
            </section>

            <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", paddingBottom: "60px" }}>

                {/* Upcoming Workshops */}
                <section style={{ marginBottom: "60px" }}>
                    <h2 style={{ fontSize: "2rem", marginBottom: "30px", borderLeft: "4px solid var(--primary)", paddingLeft: "16px" }}>Upcoming Workshops</h2>
                    {upcomingWorkshops.length > 0 ? (
                        <div className="workshops-grid">
                            {upcomingWorkshops.map(workshop => (
                                <div key={workshop.id} className="workshop-card">
                                    <div className="workshop-img-wrapper" style={{ height: "200px", overflow: "hidden" }}>
                                        {workshop.images && workshop.images.length > 0 ? (
                                            <img src={workshop.images[0].image} alt={workshop.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>No Image</div>
                                        )}
                                    </div>
                                    <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }} className="card-content">
                                        <h3 style={{ fontSize: "1.25rem", marginBottom: "10px", color: "white" }}>{workshop.title}</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", marginBottom: "5px", fontSize: "0.9rem" }}>
                                            <FaCalendarAlt /> {workshop.date}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#94a3b8", marginBottom: "15px", fontSize: "0.9rem" }}>
                                            <FaMapMarkerAlt /> {workshop.location}
                                        </div>
                                        <p style={{ color: "#cbd5e1", marginBottom: "20px", lineHeight: "1.5", flex: 1 }} className="workshop-desc">{workshop.description}</p>

                                        {/* Additional Images Grid */}
                                        {workshop.images && workshop.images.length > 1 && (
                                            <div className="additional-images-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px", marginBottom: "15px" }}>
                                                {workshop.images.slice(1, 5).map((img) => (
                                                    <img key={img.id} src={img.image} alt="workshop thumb" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: "4px", cursor: "pointer" }}
                                                        onClick={() => window.open(img.image, '_blank')} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "40px", background: "rgba(30, 41, 59, 0.3)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                            <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>No upcoming workshops scheduled at the moment.</p>
                            <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "8px" }}>Stay tuned for new announcements!</p>
                        </div>
                    )}
                </section>

                {/* Past Workshops */}
                <section style={{ marginBottom: "60px" }}>
                    <h2 style={{ fontSize: "2rem", marginBottom: "30px", borderLeft: "4px solid var(--secondary)", paddingLeft: "16px" }}>Past Workshops</h2>
                    {pastWorkshops.length > 0 ? (
                        <div className="workshops-grid">
                            {pastWorkshops.map(workshop => (
                                <div key={workshop.id} className="workshop-card" style={{
                                    opacity: 0.8 /* Distinction for past workshops */
                                }}>
                                    <div className="workshop-img-wrapper" style={{ height: "180px", overflow: "hidden" }}>
                                        {workshop.images && workshop.images.length > 0 ? (
                                            <img src={workshop.images[0].image} alt={workshop.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: "0.8" }} />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>No Image</div>
                                        )}
                                    </div>
                                    <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }} className="card-content">
                                        <h3 style={{ fontSize: "1.1rem", marginBottom: "10px", color: "#e2e8f0" }}>{workshop.title}</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", marginBottom: "5px", fontSize: "0.85rem" }}>
                                            <FaCalendarAlt /> {workshop.date}
                                        </div>
                                        <p style={{ color: "#94a3b8", fontSize: "0.9rem", flex: 1 }} className="workshop-desc">{workshop.description}</p>

                                        {/* Additional Images Grid */}
                                        {workshop.images && workshop.images.length > 1 && (
                                            <div className="additional-images-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "5px", marginTop: "10px" }}>
                                                {workshop.images.slice(1, 5).map((img) => (
                                                    <img key={img.id} src={img.image} alt="workshop thumb" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: "4px", opacity: "0.7" }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "40px", background: "rgba(30, 41, 59, 0.3)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.1)" }}>
                            <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>No past workshops to display.</p>
                        </div>
                    )}
                </section>

                {/* Contact/Request Section */}
                <section style={{
                    background: "linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
                    borderRadius: "24px",
                    padding: "40px",
                    border: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>

                        {/* Contact Info */}
                        <div className="contact-info-col">
                            <h2 style={{ fontSize: "2rem", marginBottom: "20px", color: "white" }}>Host a Workshop</h2>
                            <p style={{ color: "#cbd5e1", marginBottom: "30px", lineHeight: "1.6", fontSize: "1.1rem" }}>
                                Interested in organizing a workshop at your school, college, or organization?
                                Partner with Mekaro to bring hands-on technical learning to your community.
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(56, 189, 248, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                                        <FaUserTie />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, color: "white" }}>Contact Admin</h4>
                                        <p style={{ margin: 0, color: "#94a3b8" }}>mekaro.india@gmail.com</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(56, 189, 248, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                                        <FaPhone />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, color: "white" }}>Phone</h4>
                                        <p style={{ margin: 0, color: "#94a3b8" }}>+91 63850 49549</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-form-col">
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    value={contactForm.name}
                                    onChange={handleChange}
                                    required
                                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    value={contactForm.email}
                                    onChange={handleChange}
                                    required
                                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Your Phone Number"
                                    value={contactForm.phone}
                                    onChange={handleChange}
                                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
                                />
                                <input
                                    type="text"
                                    name="organization"
                                    placeholder="Organization/Institution Name"
                                    value={contactForm.organization}
                                    onChange={handleChange}
                                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white" }}
                                />
                                <textarea
                                    name="message"
                                    placeholder="Tell us about your requirements..."
                                    rows="4"
                                    value={contactForm.message}
                                    onChange={handleChange}
                                    required
                                    style={{ padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)", color: "white", resize: "none" }}
                                ></textarea>
                                <button type="submit" style={{
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: "var(--primary)",
                                    color: "black",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    transition: "background 0.2s"
                                }}>Send Inquiry</button>
                            </form>
                        </div>

                    </div>
                </section>

            </div>

            <Footer />

            <style>{`
        /* Updated Layout for Swipeable Cards */
        .workshops-grid {
            display: flex;
            overflow-x: auto;
            gap: 24px;
            padding-bottom: 20px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; /* Hide scrollbar Firefox */
            padding-left: 4px; /* Visual balance */
            padding-right: 4px;
        }
        .workshops-grid::-webkit-scrollbar {
            display: none; /* Hide scrollbar Chrome/Safari */
        }
        
        .workshop-card {
            flex: 0 0 320px; /* Desktop: Fixed width cards */
            scroll-snap-align: start;
            /* Keep existing card styles */
             background: rgba(30, 41, 59, 0.5);
             border-radius: 16px;
             overflow: hidden;
             border: 1px solid rgba(255,255,255,0.1);
             transition: transform 0.3s ease;
             display: flex; flex-direction: column;
        }
        
        .workshop-card:hover {
            transform: translateY(-5px);
        }

        /* Mobile Overrides - Compact Premium Redesign */
        @media (max-width: 768px) {
          .workshops-page .container {
              padding: 0;
          }
          
          .workshops-page h2 {
              margin-left: 16px;
              margin-right: 16px;
              font-size: 1.6rem !important;
              background: linear-gradient(to right, #fff, #94a3b8);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              border-left: none !important;
              padding-left: 0 !important;
              text-align: left;
              margin-bottom: 16px !important;
          }

          .workshops-grid {
            gap: 14px;
            padding-left: 16px; 
            padding-right: 16px;
            padding-bottom: 24px;
          }

          .workshop-card {
            /* Slightly smaller width: 70% */
            flex: 0 0 70%; 
            min-width: 70%;
            background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            box-shadow: 0 8px 20px -5px rgba(0,0,0,0.4);
            display: flex; flex-direction: column;
            /* Removed fixed height dependency */
          }

          /* Override inline height */
          .workshop-img-wrapper {
            height: auto !important;
            max-height: 150px;
          }

          .workshop-card img {
            height: 150px !important; /* Reduced height */
            width: 100%;
            border-radius: 16px 16px 0 0;
            background: transparent;
            padding: 0;
            object-fit: cover;
          }

          .card-content {
            padding: 14px !important; /* Reduced padding */
            display: flex; flex-direction: column;
            gap: 6px; /* Tighter gap */
            flex: unset !important; /* Remove flex: 1 inline style override */
          }

          .card-content h3 {
            font-size: 1.15rem !important;
            font-weight: 700;
            color: white;
            line-height: 1.25;
            margin-bottom: 4px !important;
            white-space: normal;
          }

          .card-content p.workshop-desc {
            display: -webkit-box !important;
            font-size: 0.85rem !important;
            color: #94a3b8;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            margin-bottom: 10px !important;
            line-height: 1.4;
          }
          
          .card-content div {
             font-size: 0.8rem !important;
             color: #cbd5e1;
             display: flex; alignItems: center; gap: 6px;
             margin-bottom: 2px;
          }

          .additional-images-grid {
             display: none !important;
          }

          .workshop-card button {
             margin-top: 8px; /* Reduced top margin */
             padding: 10px !important;
             font-size: 0.95rem !important;
             background: linear-gradient(90deg, var(--primary), #3b82f6) !important;
             border-radius: 10px !important;
             border: none;
             color: white;
             width: 100%;
          }
          
          .contact-info-col, .contact-form-col {
            grid-column: 1 / -1;
          }
        }
      `}</style>
        </div>
    );
}
