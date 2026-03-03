import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

export default function OTPVerification() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract email from navigation state or fallback
    const initialEmail = location.state?.email || "";

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Resend cooldown timer
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Edit Email Mode
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState(initialEmail);

    useEffect(() => {
        if (!initialEmail) {
            toast.error("No email provided. Redirecting to register.");
            navigate("/register");
        }
    }, [initialEmail, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleVerify = async () => {
        setErrorMsg("");
        if (!otp || otp.length !== 6) {
            setErrorMsg("Please enter a valid 6-digit OTP.");
            return;
        }

        try {
            const res = await API.post("/api/verify-otp/", { email, otp });
            toast.success(res.data.detail || "Email verified successfully!");

            // Auto-login
            if (res.data.access && res.data.user) {
                localStorage.setItem("token", res.data.access);
                sessionStorage.setItem("user", JSON.stringify(res.data.user));
                setTimeout(() => navigate(res.data.user.isAdmin ? "/admin" : "/"), 1500);
            } else {
                setTimeout(() => navigate("/login"), 1500);
            }
        } catch (err) {
            setErrorMsg(err.response?.data?.error || "Verification failed.");
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setErrorMsg("");

        try {
            const res = await API.post("/api/resend-otp/", { email });
            toast.success(res.data.detail || "New OTP sent to your email.");
            setTimeLeft(60);
            setCanResend(false);
        } catch (err) {
            setErrorMsg(err.response?.data?.error || "Failed to resend OTP.");
            if (err.response?.status === 429) {
                // Keep button disabled if rate limited
            }
        }
    };

    const handleUpdateEmail = async () => {
        setErrorMsg("");
        if (!newEmail || !newEmail.includes("@")) {
            setErrorMsg("Please enter a valid email address.");
            return;
        }

        try {
            const res = await API.post("/api/edit-email-otp/", {
                old_email: email,
                new_email: newEmail
            });
            toast.success(res.data.detail || "Email updated successfully!");
            setEmail(newEmail);
            setIsEditingEmail(false);
            setTimeLeft(60);
            setCanResend(false);
        } catch (err) {
            setErrorMsg(err.response?.data?.error || "Failed to update email.");
        }
    };

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
        margin: "80px auto 40px",
        textAlign: "center"
    };

    return (
        <div style={pageStyle}>
            <Navbar />
            <div style={{ padding: "0 20px" }}>
                <div style={cardStyle}>
                    <h2 style={{
                        marginBottom: "20px",
                        fontSize: "28px",
                        fontWeight: "800",
                        color: "white",
                        textShadow: "0 0 20px var(--primary-glow)"
                    }}>Verify Your Email</h2>

                    {!isEditingEmail ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "30px" }}>
                            We've sent a 6-digit code to <br />
                            <strong style={{ color: "white" }}>{email}</strong>
                            <button
                                onClick={() => setIsEditingEmail(true)}
                                style={{
                                    background: "none", border: "none", color: "var(--primary)",
                                    marginLeft: "10px", cursor: "pointer", textDecoration: "underline",
                                    fontSize: "14px"
                                }}
                            >
                                Edit
                            </button>
                        </p>
                    ) : (
                        <div style={{ marginBottom: "30px", textAlign: "left" }}>
                            <label style={labelStyle}>Update Email Address</label>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    style={inputStyle}
                                />
                                <button
                                    onClick={handleUpdateEmail}
                                    style={{ ...buttonStyle, marginTop: "0", width: "auto", padding: "0 20px" }}
                                >
                                    Save
                                </button>
                            </div>
                            <button
                                onClick={() => { setIsEditingEmail(false); setNewEmail(email); }}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", marginTop: "10px", cursor: "pointer", fontSize: "13px" }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    <div style={{ marginBottom: "24px", textAlign: "left" }}>
                        <label style={labelStyle}>One-Time Password (OTP)</label>
                        <input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            style={{
                                ...inputStyle,
                                fontSize: "24px",
                                letterSpacing: "8px",
                                textAlign: "center",
                                fontWeight: "bold"
                            }}
                            placeholder="••••••"
                        />
                    </div>

                    <button
                        onClick={handleVerify}
                        style={buttonStyle}
                        onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
                        onMouseUp={(e) => e.target.style.transform = "scale(1)"}
                        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    >
                        Verify Email
                    </button>

                    {errorMsg && <p style={{ marginTop: "20px", color: "var(--accent)", textAlign: "center", fontSize: "14px" }}>{errorMsg}</p>}

                    <div style={{ marginTop: "30px", color: "var(--text-muted)", fontSize: "14px" }}>
                        Didn't receive the code? {" "}
                        <button
                            onClick={handleResend}
                            disabled={!canResend}
                            style={{
                                background: "none", border: "none",
                                color: canResend ? "var(--primary)" : "var(--text-muted)",
                                cursor: canResend ? "pointer" : "not-allowed",
                                fontWeight: canResend ? "600" : "normal",
                                textDecoration: canResend ? "underline" : "none"
                            }}
                        >
                            {canResend ? "Resend OTP" : `Resend in ${timeLeft}s`}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    color: "var(--text-muted)",
    fontSize: "14px",
    marginBottom: "8px",
    display: "block"
};

const inputStyle = {
    width: "100%",
    padding: "12px",
    background: "var(--bg-darker)",
    border: "1px solid var(--glass-border)",
    borderRadius: "10px",
    color: "white",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box"
};

const buttonStyle = {
    marginTop: "10px",
    padding: "14px",
    width: "100%",
    background: "var(--primary)",
    color: "#000",
    borderRadius: "12px",
    border: "none",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s"
};
