import React, { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Container from "../components/Container";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function ForgotPasswordFlow() {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    // Step 1 State
    const [identity, setIdentity] = useState("");
    const [emailForOTP, setEmailForOTP] = useState("");

    // Step 2 State
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Step 3 State
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Timer logic for Step 2
    useEffect(() => {
        let timer;
        if (step === 2) {
            if (timeLeft > 0) {
                timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            } else {
                setCanResend(true);
            }
        }
        return () => clearTimeout(timer);
    }, [timeLeft, step]);

    // --- HANDLERS ---

    const handleRequestOTP = async (e) => {
        e?.preventDefault();
        if (!identity) {
            toast.error("Please enter your username or email");
            return;
        }

        try {
            const res = await API.post("/api/password-reset/request/", { username_or_email: identity });
            toast.success(res.data.detail);
            setEmailForOTP(res.data.email);
            setStep(2);
            setTimeLeft(60);
            setCanResend(false);
        } catch (err) {
            if (err.response && err.response.data.error) {
                toast.error(err.response.data.error);
            } else {
                toast.error("Failed to request OTP. Please try again.");
            }
        }
    };

    const handleVerifyOTP = async (e) => {
        e?.preventDefault();
        if (otp.length !== 6) {
            toast.error("OTP must be 6 digits");
            return;
        }

        try {
            const res = await API.post("/api/password-reset/verify/", {
                email: emailForOTP,
                otp: otp
            });

            // Store the token immediately so we can use it to reset the password or skip
            localStorage.setItem("token", res.data.access);
            sessionStorage.setItem("user", JSON.stringify(res.data.user));

            toast.success("OTP verified successfully!");
            setStep(3);
        } catch (err) {
            if (err.response && err.response.data.error) {
                toast.error(err.response.data.error);
            } else {
                toast.error("Invalid OTP");
            }
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;
        try {
            // Re-use the request endpoint
            const res = await API.post("/api/password-reset/request/", { username_or_email: emailForOTP });
            toast.success("A new OTP has been sent!");
            setTimeLeft(60);
            setCanResend(false);
            setOtp("");
        } catch (err) {
            if (err.response && err.response.status === 429) {
                toast.error(err.response.data.error);
            } else {
                toast.error("Failed to resend OTP");
            }
        }
    };

    const handleUpdatePassword = async (e) => {
        e?.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            // Token is already in localStorage from Step 2, so API will attach it automatically
            const res = await API.post("/api/password-reset/confirm/", { new_password: newPassword });
            toast.success("Password updated successfully! Welcome back.");

            const user = JSON.parse(sessionStorage.getItem("user"));
            setTimeout(() => {
                navigate(user.isAdmin ? "/admin/dashboard" : "/");
            }, 1500);

        } catch (err) {
            if (err.response && err.response.data.error) {
                toast.error(err.response.data.error);
            } else {
                toast.error("Failed to update password");
            }
        }
    };

    const handleSkip = () => {
        toast.success("Skipped password reset. Welcome back!");
        const user = JSON.parse(sessionStorage.getItem("user"));
        setTimeout(() => {
            navigate(user.isAdmin ? "/admin/dashboard" : "/");
        }, 1200);
    };


    // --- STYLES ---
    const pageStyle = {
        background: "var(--bg-darker)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "var(--text-main)"
    };

    const cardStyle = {
        width: "100%",
        maxWidth: "450px",
        background: "var(--bg-card)",
        padding: "40px",
        borderRadius: "24px",
        boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)",
        border: "1px solid var(--glass-border)",
        margin: "60px auto",
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
        transition: "border-color 0.2s",
    };

    const btnStyle = {
        width: "100%",
        padding: "14px",
        background: "var(--primary)",
        color: "#000",
        borderRadius: "12px",
        border: "none",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.3s ease",
    };

    const btnSecondaryStyle = {
        ...btnStyle,
        background: "transparent",
        color: "var(--text-muted)",
        border: "1px solid var(--glass-border)",
    };

    // --- RENDER STEPS ---

    return (
        <div style={pageStyle}>
            <Navbar />
            <Container>
                <div style={cardStyle}>

                    {step === 1 && (
                        <form onSubmit={handleRequestOTP}>
                            <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "28px", fontWeight: "800", color: "white" }}>
                                Forgot Password
                            </h2>
                            <p style={{ color: "var(--text-muted)", marginBottom: "20px", textAlign: "center", fontSize: "14px" }}>
                                Enter your username or email address and we'll send you an OTP to reset your password.
                            </p>

                            <input
                                style={inputStyle}
                                placeholder="Username or Email"
                                value={identity}
                                onChange={(e) => setIdentity(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                                onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
                                required
                            />

                            <button
                                type="submit"
                                style={btnStyle}
                                onMouseEnter={(e) => e.target.style.boxShadow = "0 0 15px var(--primary-glow)"}
                                onMouseLeave={(e) => e.target.style.boxShadow = "none"}
                            >
                                Send OTP
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP}>
                            <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "28px", fontWeight: "800", color: "white" }}>
                                Verify OTP
                            </h2>
                            <p style={{ color: "var(--text-muted)", marginBottom: "20px", textAlign: "center", fontSize: "14px" }}>
                                We've sent a 6-digit code to <b>{emailForOTP}</b>.
                            </p>

                            <input
                                style={{ ...inputStyle, textAlign: "center", letterSpacing: "8px", fontSize: "24px", fontWeight: "bold" }}
                                placeholder="......"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                                onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
                                required
                            />

                            <button
                                type="submit"
                                style={btnStyle}
                                disabled={otp.length !== 6}
                                onMouseEnter={(e) => e.target.style.boxShadow = "0 0 15px var(--primary-glow)"}
                                onMouseLeave={(e) => e.target.style.boxShadow = "none"}
                            >
                                Verify Code
                            </button>

                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "10px" }}>
                                    Didn't receive the code?
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={!canResend}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: canResend ? "var(--primary)" : "var(--text-muted)",
                                        fontWeight: "600",
                                        cursor: canResend ? "pointer" : "not-allowed",
                                        textDecoration: canResend ? "underline" : "none"
                                    }}
                                >
                                    {canResend ? "Resend OTP" : `Resend in ${timeLeft}s`}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleUpdatePassword}>
                            <h2 style={{ textAlign: "center", marginBottom: "30px", fontSize: "28px", fontWeight: "800", color: "white" }}>
                                Secure Your Account
                            </h2>
                            <p style={{ color: "var(--text-muted)", marginBottom: "20px", textAlign: "center", fontSize: "14px" }}>
                                Your identity has been verified. You can now set a new password, or skip this step to login immediately.
                            </p>

                            <input
                                style={inputStyle}
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                                onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
                                required
                            />

                            <input
                                style={inputStyle}
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
                                onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
                                required
                            />

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                                <button
                                    type="submit"
                                    style={btnStyle}
                                    onMouseEnter={(e) => e.target.style.boxShadow = "0 0 15px var(--primary-glow)"}
                                    onMouseLeave={(e) => e.target.style.boxShadow = "none"}
                                >
                                    Update Password & Login
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSkip}
                                    style={btnSecondaryStyle}
                                    onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.05)"}
                                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                                >
                                    Skip & Login
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </Container>
        </div>
    );
}

export default ForgotPasswordFlow;
