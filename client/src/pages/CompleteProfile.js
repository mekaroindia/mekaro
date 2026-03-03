import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

export default function CompleteProfile() {
    const location = useLocation();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        password: "",
        confirmPassword: ""
    });
    const [googleData, setGoogleData] = useState(null);

    useEffect(() => {
        if (location.state && location.state.is_new_user) {
            setGoogleData(location.state);
            // Pre-fill username with email prefix if desired, or leave empty
            setForm(prev => ({
                ...prev,
                username: location.state.email.split('@')[0]
            }));
        } else {
            // Illegal access, redirect to login
            navigate("/login");
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (password.length < minLength) return "Password must be at least 8 characters long";
        if (!hasUpperCase) return "Password must contain at least one uppercase letter";
        if (!hasLowerCase) return "Password must contain at least one lowercase letter";
        if (!hasSpecialChar) return "Password must contain at least one special character";
        return null;
    };

    const handleSubmit = async () => {
        if (!form.username || !form.password || !form.confirmPassword) {
            toast.error("Please fill all fields");
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const passwordError = validatePassword(form.password);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        try {
            const payload = {
                token: googleData.google_token,
                username: form.username,
                password: form.password
            };

            const res = await API.post("/api/google-signup-complete/", payload);

            // Login Success
            localStorage.setItem("token", res.data.access);
            sessionStorage.setItem("user", JSON.stringify(res.data.user));

            toast.success("Profile completed! Logging in...");
            setTimeout(() => {
                window.location.href = "/";
            }, 1500);

        } catch (err) {
            console.error("Complete Profile Error:", err);
            const msg = err.response?.data?.error || "Registration failed";
            toast.error(msg);
        }
    };

    if (!googleData) return null;

    const pageStyle = {
        background: "var(--bg-darker)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
    };

    const cardStyle = {
        width: "100%",
        maxWidth: "500px",
        background: "var(--bg-card)",
        padding: "40px",
        borderRadius: "24px",
        boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)",
        border: "1px solid var(--glass-border)",
        margin: "80px auto",
    };

    const inputStyle = {
        width: "100%",
        padding: "14px",
        marginBottom: "20px",
        background: "var(--bg-darker)",
        border: "1px solid var(--glass-border)",
        borderRadius: "12px",
        color: "white",
        fontSize: "15px",
        outline: "none",
    };

    const labelStyle = {
        color: "var(--text-muted)",
        fontSize: "14px",
        marginBottom: "8px",
        display: "block"
    };

    return (
        <div style={pageStyle}>
            <Navbar />
            <div style={{ padding: "0 20px" }}>
                <div style={cardStyle}>
                    <h2 style={{
                        textAlign: "center",
                        marginBottom: "10px",
                        fontSize: "28px",
                        fontWeight: "800",
                        color: "white",
                    }}>Complete Your Profile</h2>
                    <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: "30px" }}>
                        Set a username and password to secure your account.
                        <br />
                        <small>Email: {googleData.email}</small>
                    </p>

                    <div>
                        <label style={labelStyle}>Username</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <input
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            style={inputStyle}
                            placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 special"
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>Confirm Password</label>
                        <input
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: "var(--primary)",
                            color: "#000",
                            borderRadius: "12px",
                            border: "none",
                            fontSize: "16px",
                            fontWeight: "700",
                            cursor: "pointer",
                            marginTop: "10px"
                        }}
                    >
                        Complete Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}
