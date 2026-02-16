import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
    return (
        <div className="contact-page">
            <Navbar />
            <Container>
                <div className="contact-container">
                    <h1 className="contact-title">Contact Support</h1>
                    <p className="contact-subtitle">
                        We are here to help. Reach out to us for any queries.
                    </p>

                    <div className="contact-grid">
                        <div className="contact-card">
                            <FaEnvelope className="contact-icon" />
                            <h3 className="card-heading">Email Us</h3>
                            <p className="card-desc">For general inquiries & support</p>
                            <a
                                href="mailto:mekaro.india@gmail.com"
                                className="contact-link"
                            >
                                mekaro.india@gmail.com
                            </a>
                        </div>

                        <div className="contact-card">
                            <FaPhone className="contact-icon" />
                            <h3 className="card-heading">Call Us</h3>
                            <p className="card-desc">Mon-Fri, 9am - 6pm</p>
                            <span className="contact-info">+91 62850 49549</span>
                        </div>

                        <div className="contact-card">
                            <FaMapMarkerAlt className="contact-icon" />
                            <h3 className="card-heading">Visit Us</h3>
                            <p className="address-text">
                                244, TNHB colony, Ayapakkam, Ambattur, Chennai<br />Tamil Nadu, India - 600053
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
            <div className="footer-spacer">
                <Footer />
            </div>

            <style>{`
                .contact-page {
                    background: var(--bg-darker);
                    min-height: 100vh;
                    color: var(--text-main);
                    display: flex; flex-direction: column;
                }
                .contact-container { padding: 60px 0; text-align: center; }
                
                .contact-title { font-size: 40px; fontWeight: 800; margin-bottom: 20px; color: white; }
                .contact-subtitle { color: var(--text-muted); margin-bottom: 60px; font-size: 18px; }

                .contact-grid {
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;
                }
                
                .contact-card {
                    background: var(--bg-card); padding: 40px; border-radius: 24px;
                    border: 1px solid var(--glass-border); text-align: center;
                    transition: transform 0.3s ease;
                }
                .contact-card:hover { transform: translateY(-5px); }

                .contact-icon { font-size: 40px; color: var(--primary); margin-bottom: 20px; }
                .card-heading { fontSize: 20px; fontWeight: 700; margin-bottom: 10px; color: white; }
                .card-desc { color: var(--text-muted); margin-bottom: 10px; }
                
                .contact-link { color: var(--primary); font-size: 18px; font-weight: 600; text-decoration: none; }
                .contact-info { color: white; font-size: 18px; font-weight: 600; }
                .address-text { color: var(--text-muted); }

                .footer-spacer { margin-top: auto; }

                /* MOBILE OVERRIDES */
                @media (max-width: 768px) {
                    .contact-container { padding: 40px 0; }
                    .contact-title { font-size: 32px; margin-bottom: 10px; }
                    .contact-subtitle { font-size: 16px; margin-bottom: 40px; padding: 0 20px; }
                    
                    .contact-grid { grid-template-columns: 1fr; gap: 20px; }
                    .contact-card { padding: 30px; border-radius: 20px; }
                    
                    .contact-icon { font-size: 32px; margin-bottom: 15px; }
                    .card-heading { font-size: 18px; }
                    .contact-link, .contact-info { font-size: 16px; }
                }
            `}</style>
        </div>
    );
};

export default Contact;
