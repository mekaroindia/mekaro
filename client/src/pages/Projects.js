import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { CartContext } from "../context/CartContext";
import { FaRobot, FaMicrochip, FaCogs, FaProjectDiagram, FaCheckCircle, FaShoppingCart } from "react-icons/fa";
import API from "../api/axios";
import { toast } from "react-toastify";

export default function Projects() {
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const [innovativeProjects, setInnovativeProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);

    useEffect(() => {
        API.get("/api/products/?is_innovative_project=true")
            .then(res => {
                if (res.data.results) {
                    setInnovativeProjects(res.data.results);
                } else {
                    setInnovativeProjects(res.data);
                }
                setProjectsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch projects", err);
                setProjectsLoading(false);
            });
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "", // Added phone
        project_title: "",
        project_type: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone || !formData.project_title || !formData.project_type || !formData.description) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await API.post("/api/projects/create/", formData);
            toast.success("Project Request Submitted! We will contact you soon.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                project_title: "",
                project_type: "",
                description: "",
            });
        } catch (err) {
            console.error("Submission Error:", err);
            toast.error("Failed to submit project request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const services = [
        {
            icon: <FaRobot />,
            title: "Custom Robotics",
            desc: "From autonomous rovers to industrial arms, we build custom robotic solutions tailored to your specifications."
        },
        {
            icon: <FaCogs />,
            title: "IoT Solutions",
            desc: "Smart connectivity solutions for home automation, industrial monitoring, and remote sensing."
        },
        {
            icon: <FaProjectDiagram />,
            title: "End-to-End Development",
            desc: "We handle the entire lifecycle: concept, design, coding, assembly, and testing."
        }
    ];

    return (
        <div className="projects-page">
            <Navbar />

            {/* HERO */}
            <div className="hero-section">
                <Container>
                    <h1 className="hero-title">We Build Your Ideas</h1>
                    <p className="hero-subtitle">
                        Got a groundbreaking idea? Let us bring it to life. Mekaro Projects offers expert engineering services
                        to turn concepts into reality.
                    </p>
                    <button
                        className="cta-button"
                        onClick={() => document.getElementById("request-form").scrollIntoView({ behavior: "smooth" })}
                    >
                        Start Your Project
                    </button>
                </Container>
            </div>

            <Container>
                {/* SERVICES */}
                <h2 className="section-title">Our Capabilities</h2>
                <div className="services-grid">
                    {services.map((s, i) => (
                        <div key={i} className="service-card">
                            <div className="icon-box">{s.icon}</div>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                        </div>
                    ))}
                </div>

                {/* PROCESS */}
                <div className="process-section">
                    <h2 className="section-title">How It Works</h2>
                    <div className="steps-container">
                        {["Submit Requirements", "Get a Quote", "Development Phase", "Testing & Delivery"].map((step, i) => (
                            <div key={i} className="step-item">
                                <div className="step-number">0{i + 1}</div>
                                <h3 className="step-title">{step}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* INNOVATIVE PROJECTS SECTION */}
                <div className="innovative-projects">
                    <h2 className="section-title">Innovative Projects</h2>
                    {projectsLoading ? (
                        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Loading projects...</div>
                    ) : (
                        <div className="projects-scroll-wrapper">
                            {innovativeProjects.length > 0 ? (
                                <>
                                    {innovativeProjects.slice(0, 5).map((project) => (
                                        <div
                                            key={project.id}
                                            className="project-product-card"
                                            onClick={() => navigate(`/product/${project.id}`)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="project-img-wrap">
                                                <img
                                                    src={project.product_images?.length > 0 ? project.product_images[0].image : (project.images?.[0] || "https://via.placeholder.com/300x200?text=Project")}
                                                    alt={project.title}
                                                />
                                            </div>
                                            <div className="project-info">
                                                <h3>{project.title}</h3>
                                                <p className="project-desc">{project.description}</p>
                                                <div className="project-footer">
                                                    <span className="price">₹{project.price.toLocaleString()}</span>
                                                    {project.stock > 0 ? (
                                                        <button
                                                            className="add-cart-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToCart(project);
                                                                toast.success("Added to Cart!");
                                                            }}
                                                        >
                                                            <FaShoppingCart />
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>Out of Stock</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="see-more-card" onClick={() => navigate('/?q=projects')}>
                                        <div className="see-more-content">
                                            <span style={{ fontSize: "40px", color: "var(--primary)" }}>➜</span>
                                            <h3>See More Projects</h3>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p style={{ textAlign: "center", width: "100%", color: "var(--text-muted)" }}>
                                    No pre-built projects available at the moment. Check back soon!
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* REQUEST FORM */}
                <div id="request-form" className="form-section">
                    <h2 className="section-title">Request a Quote</h2>
                    <form className="project-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <input type="text" placeholder="Your Name" className="form-input" name="name" value={formData.name} onChange={handleChange} required />
                            <input type="email" placeholder="Your Email" className="form-input" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <input type="tel" placeholder="Phone Number" className="form-input" name="phone" value={formData.phone} onChange={handleChange} required />
                        <input type="text" placeholder="Project Title" className="form-input" name="project_title" value={formData.project_title} onChange={handleChange} required />
                        <select className="form-input" name="project_type" value={formData.project_type} onChange={handleChange} required>
                            <option value="">Project Type</option>
                            <option value="robotics">Robotics</option>
                            <option value="iot">IoT / Home Automation</option>
                            <option value="pcb">PCB Design</option>
                            <option value="drone">Drone / UAV</option>
                            <option value="other">Other</option>
                        </select>
                        <textarea
                            placeholder="Describe your project requirements in detail..."
                            className="form-input textarea"
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Project Request"}
                        </button>
                    </form>
                </div>

            </Container>
            <Footer />

            <style>{`
                .projects-page { background: var(--bg-darker); min-height: 100vh; color: var(--text-main); }
                
                .hero-section {
                    text-align: center;
                    padding: 80px 20px;
                    background: linear-gradient(180deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%);
                    margin-bottom: 40px;
                    border-radius: 0 0 40px 40px;
                    border-bottom: 1px solid var(--glass-border);
                }
                .hero-title {
                    font-size: clamp(2.5rem, 5vw, 3.5rem);
                    font-weight: 800; margin-bottom: 20px;
                    background: linear-gradient(to right, #fff, var(--primary));
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.3));
                }
                .hero-subtitle {
                    font-size: 1.2rem; color: var(--text-muted);
                    max-width: 700px; margin: 0 auto 40px; line-height: 1.6;
                }
                .cta-button {
                    background: var(--primary); color: #000;
                    padding: 16px 40px; border-radius: 12px;
                    font-size: 16px; font-weight: 700;
                    border: none; cursor: pointer;
                    box-shadow: 0 0 30px var(--primary-glow);
                    transition: transform 0.2s;
                }
                .cta-button:hover { transform: scale(1.05); }

                .section-title {
                    font-size: 2rem; font-weight: 700; color: #fff;
                    margin-bottom: 40px; text-align: center;
                }

                .services-grid {
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 30px; margin-bottom: 80px;
                }
                .service-card {
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    padding: 30px; border-radius: 20px;
                    transition: all 0.3s ease;
                    display: flex; flex-direction: column; align-items: center;
                    text-align: center; position: relative; overflow: hidden;
                }
                .service-card:hover { transform: translateY(-10px); border-color: var(--primary); }
                .service-card h3 { font-size: 1.5rem; margin-bottom: 12px; color: #fff; }
                .service-card p { color: var(--text-muted); }

                .icon-box {
                    width: 70px; height: 70px; border-radius: 50%;
                    background: rgba(6, 182, 212, 0.1);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 30px; color: var(--primary);
                    margin-bottom: 20px;
                    box-shadow: 0 0 20px rgba(6, 182, 212, 0.2);
                }

                .process-section { margin-bottom: 100px; }
                .steps-container {
                    display: flex; flex-wrap: wrap; gap: 20px;
                    justify-content: space-between; text-align: center;
                }
                .step-item { flex: 1 1 200px; }
                .step-number {
                    font-size: 40px; font-weight: 900;
                    color: rgba(255,255,255,0.05); margin-bottom: -20px;
                    position: relative; z-index: 0;
                }
                .step-title {
                    font-size: 1.2rem; color: var(--primary);
                    position: relative; z-index: 1;
                }

                .form-section { margin-bottom: 80px; }
                .project-form {
                    background: var(--bg-card);
                    border: 1px solid var(--glass-border);
                    padding: 40px; border-radius: 24px;
                    max-width: 800px; margin: 0 auto;
                }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-input {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid var(--glass-border);
                    padding: 16px; border-radius: 12px;
                    color: #fff; font-size: 16px; margin-bottom: 20px;
                    outline: none; transition: border-color 0.2s;
                }
                .form-input:focus { border-color: var(--primary); }
                .textarea { min-height: 150px; resize: vertical; }

                .submit-button {
                    background: var(--primary); color: #000;
                    padding: 16px 32px; border-radius: 12px;
                    font-size: 16px; font-weight: 700; width: 100%;
                    border: none; cursor: pointer; transition: transform 0.2s;
                    margin-top: 10px;
                }
                .submit-button:hover:not(:disabled) { transform: scale(1.02); }
                .submit-button:disabled { opacity: 0.7; cursor: not-allowed; }

                /* INNOVATIVE PROJECTS */
                .innovative-projects { margin-bottom: 100px; }
                
                /* HORIZONTAL SCROLL LAYOUT */
                .projects-scroll-wrapper {
                    display: flex;
                    overflow-x: auto;
                    gap: 20px;
                    padding-bottom: 30px;
                    padding-left: 5px;
                    padding-right: 5px;
                    scroll-behavior: smooth;
                    scrollbar-width: thin;
                    -webkit-overflow-scrolling: touch;
                }
                .projects-scroll-wrapper::-webkit-scrollbar { height: 6px; }
                .projects-scroll-wrapper::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
                .projects-scroll-wrapper::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }

                .project-product-card {
                    flex: 0 0 280px; /* Fixed width */
                    max-width: 280px;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid var(--glass-border);
                    border-radius: 20px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    display: flex; 
                    flex-direction: column;
                    height: 420px; /* Fixed height for consistency */
                }
                
                .project-product-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--primary);
                    box-shadow: 0 10px 30px -5px rgba(6, 182, 212, 0.2);
                }

                .project-img-wrap {
                    height: 180px; 
                    width: 100%;
                    background: #000;
                    position: relative;
                    overflow: hidden;
                }
                
                .project-img-wrap img {
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                
                .project-product-card:hover .project-img-wrap img {
                    transform: scale(1.1);
                }

                .project-info { 
                    padding: 20px; 
                    flex: 1; 
                    display: flex; 
                    flex-direction: column; 
                }

                .project-info h3 { 
                    font-size: 1.1rem; 
                    margin-bottom: 10px; 
                    color: #fff; 
                    font-weight: 700;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .project-desc {
                    color: var(--text-muted); 
                    font-size: 0.9rem; 
                    line-height: 1.5;
                    margin-bottom: 15px; 
                    flex: 1;
                    display: -webkit-box; 
                    -webkit-line-clamp: 3; 
                    -webkit-box-orient: vertical; 
                    overflow: hidden;
                }

                .project-footer {
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    padding-top: 15px;
                    margin-top: auto;
                }

                .price { 
                    font-size: 1.2rem; 
                    font-weight: 700; 
                    color: var(--primary); 
                    text-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
                }

                .add-cart-btn {
                    background: linear-gradient(135deg, var(--primary), #06b6d4); 
                    color: #000;
                    border: none;
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 10px rgba(6, 182, 212, 0.3);
                    font-size: 1rem;
                }
                
                .add-cart-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(6, 182, 212, 0.5);
                }

                .see-more-card {
                    flex: 0 0 200px;
                    height: 420px;
                    background: rgba(255,255,255,0.03);
                    border: 2px dashed var(--glass-border);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .see-more-card:hover {
                    background: rgba(6, 182, 212, 0.05);
                    border-color: var(--primary);
                }
                .see-more-content {
                    text-align: center;
                    color: var(--text-muted);
                }
                .see-more-card:hover .see-more-content h3,
                .see-more-card:hover .see-more-content span { color: var(--primary); }
                .see-more-content h3 { font-size: 1.2rem; margin-top: 10px; transition: color 0.3s; }

                /* MOBILE OVERRIDES */
                @media (max-width: 900px) {
                    /* Removed card direction override as it's now consistent */
                }

                @media (max-width: 768px) {
                    .hero-section { padding: 40px 16px; margin-bottom: 30px; border-radius: 0 0 24px 24px; }
                    /* ... existing mobile styles ... */
                    .hero-title { font-size: 2rem; margin-bottom: 15px; }
                    .hero-subtitle { font-size: 1rem; margin-bottom: 30px; }
                    .cta-button { padding: 14px 30px; font-size: 14px; width: 100%; }

                    .section-title { font-size: 1.6rem; margin-bottom: 25px; }

                    .services-grid { grid-template-columns: 1fr; gap: 15px; margin-bottom: 50px; }
                    .service-card { 
                        display: grid; 
                        grid-template-columns: 60px 90px 1fr; 
                        align-items: center; 
                        gap: 15px; 
                        padding: 20px; 
                        text-align: left;
                        background: linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
                    }
                    .icon-box { 
                        width: 50px; height: 50px; 
                        font-size: 20px; margin-bottom: 0; 
                        background: rgba(6, 182, 212, 0.15);
                        box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
                    }
                    .service-card h3 { 
                        font-size: 1rem; 
                        margin-bottom: 0; 
                        line-height: 1.2;
                        font-weight: 800;
                        color: white;
                    }
                    .service-card p { 
                        font-size: 0.85rem; 
                        margin: 0; 
                        color: var(--text-muted); 
                        line-height: 1.4;
                    }

                    .steps-container { flex-direction: column; gap: 15px; }
                    .step-item { 
                        flex: 0 0 auto; /* Stop taking up 200px height */
                        width: 100%; 
                        display: flex; 
                        align-items: center; 
                        gap: 15px; 
                        text-align: left; 
                        background: rgba(255,255,255,0.03); 
                        padding: 12px 20px; 
                        border-radius: 12px;
                        border: 1px solid rgba(255,255,255,0.05); /* Subtle border */
                    }
                    .step-number { margin-bottom: 0; font-size: 20px; width: 30px; color: var(--primary); font-weight: 700; opacity: 1; }
                    .step-title { font-size: 0.95rem; margin: 0; color: white; }

                    .form-section { margin-bottom: 40px; }
                    .project-form { padding: 20px; border-radius: 16px; }
                    .form-grid { grid-template-columns: 1fr; gap: 0; }
                    .form-input { padding: 12px; font-size: 14px; margin-bottom: 15px; }
                    .submit-button { padding: 14px; font-size: 14px; }
                }
            `}</style>
        </div>
    );
}
