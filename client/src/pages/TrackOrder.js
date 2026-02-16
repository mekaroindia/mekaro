import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { FaBox, FaCheckCircle, FaTruck, FaClock, FaExclamationTriangle } from "react-icons/fa";

export default function TrackOrder() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (orderId) {
            setLoading(true);
            API.get(`/api/orders/track/${orderId}/`)
                .then((res) => {
                    setOrder(res.data);
                    setError(null);
                })
                .catch((err) => {
                    console.error(err);
                    setError("Order not found. Please check your Order ID.");
                    setOrder(null);
                })
                .finally(() => setLoading(false));
        }
    }, [orderId]);

    const getStatusStep = (status) => {
        switch (status) {
            case "pending": return 1;
            case "paid": return 2;
            case "shipped": return 3;
            case "delivered": return 4;
            default: return 0;
        }
    };

    const currentStep = order ? getStatusStep(order.status) : 0;

    return (
        <div style={{ background: "var(--bg-darker)", minHeight: "100vh", color: "var(--text-main)", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <Container>
                <div style={{ maxWidth: "800px", margin: "60px auto", padding: "0 20px" }}>

                    <h1 style={{
                        textAlign: "center",
                        marginBottom: "40px",
                        fontSize: "2.5rem",
                        background: "linear-gradient(to right, #fff, var(--primary))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        Track Your Order
                    </h1>

                    {/* SEARCH BOX IF NO ID OR ERROR */}
                    {(!orderId || error) && (
                        <div style={{
                            background: "var(--bg-card)",
                            padding: "40px",
                            borderRadius: "20px",
                            border: "1px solid var(--glass-border)",
                            textAlign: "center",
                            marginBottom: "40px"
                        }}>
                            {error && <div style={{ color: "#ef4444", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                <FaExclamationTriangle /> {error}
                            </div>}

                            <h3 style={{ marginBottom: "20px" }}>Enter Order ID</h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const id = e.target.elements.trackingId.value;
                                if (id) navigate(`/track-order/${id}`);
                            }}>
                                <div style={{ display: "flex", gap: "10px", maxWidth: "400px", margin: "0 auto" }}>
                                    <input
                                        name="trackingId"
                                        placeholder="e.g. MEKARO-2024-XXXX"
                                        style={{
                                            flex: 1,
                                            padding: "12px 20px",
                                            borderRadius: "10px",
                                            border: "1px solid var(--glass-border)",
                                            background: "rgba(255,255,255,0.05)",
                                            color: "white",
                                            outline: "none"
                                        }}
                                    />
                                    <button type="submit" style={{
                                        background: "var(--primary)",
                                        color: "black",
                                        border: "none",
                                        padding: "0 25px",
                                        borderRadius: "10px",
                                        fontWeight: "bold",
                                        cursor: "pointer"
                                    }}>
                                        Track
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading && orderId && (
                        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
                            <div className="loader"></div>
                            <style>{`.loader { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    )}

                    {order && (
                        <div style={{
                            background: "var(--bg-card)",
                            borderRadius: "20px",
                            border: "1px solid var(--glass-border)",
                            overflow: "hidden"
                        }}>

                            {/* HEADER */}
                            <div style={{ padding: "30px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.01)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                                    <div>
                                        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "5px" }}>ORDER ID</div>
                                        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--primary)" }}>{order.order_id}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "5px" }}>TOTAL AMOUNT</div>
                                        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>₹{order.total_amount}</div>
                                    </div>
                                </div>
                            </div>

                            {/* PROGRESS BAR */}
                            <div style={{ padding: "40px 20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", position: "relative", maxWidth: "600px", margin: "0 auto" }}>

                                    {/* Line */}
                                    <div style={{
                                        position: "absolute", top: "20px", left: "0", right: "0", height: "4px",
                                        background: "rgba(255,255,255,0.1)", zIndex: 0
                                    }}>
                                        <div style={{
                                            height: "100%", background: "#10b981",
                                            width: `${((currentStep - 1) / 3) * 100}%`,
                                            transition: "width 0.5s ease"
                                        }}></div>
                                    </div>

                                    {/* Steps */}
                                    {['Pending', 'Paid', 'Shipped', 'Delivered'].map((step, index) => {
                                        const stepNum = index + 1;
                                        const isActive = stepNum <= currentStep;
                                        const isCompleted = stepNum < currentStep;

                                        return (
                                            <div key={step} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "40px", height: "40px", borderRadius: "50%",
                                                    background: isActive ? "#10b981" : "var(--bg-card)",
                                                    border: `2px solid ${isActive ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    color: "white", fontWeight: "bold",
                                                    transition: "all 0.3s"
                                                }}>
                                                    {isCompleted ? <FaCheckCircle /> : (stepNum === 1 ? <FaClock /> : (stepNum === 3 ? <FaTruck /> : (stepNum === 4 ? <FaBox /> : stepNum)))}
                                                </div>
                                                <span style={{ fontSize: "0.85rem", color: isActive ? "white" : "var(--text-muted)", fontWeight: isActive ? "600" : "400" }}>{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ITEMS & INFO */}
                            <div style={{ padding: "30px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>

                                {/* Items */}
                                <div>
                                    <h4 style={{ marginBottom: "20px", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>Order Items</h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                        {order.items.map((item, i) => (
                                            <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                <span>
                                                    <span style={{ color: "var(--primary)", fontWeight: "bold", marginRight: "10px" }}>{item.qty}x</span>
                                                    {item.product_title}
                                                </span>
                                                <span>₹{item.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping */}
                                <div>
                                    <h4 style={{ marginBottom: "20px", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px" }}>Shipping Details</h4>
                                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "10px" }}>
                                        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{order.shipping_address.full_name}</div>
                                        <div style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                                            {order.shipping_address.address_line1}, <br />
                                            {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}<br />
                                            Phone: {order.shipping_address.phone}
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                    )}

                </div>
            </Container>
            <Footer />
        </div>
    );
}
