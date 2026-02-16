import React, { useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Container from "../components/Container";
import { toast } from "react-toastify";

import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const submit = () => {
    API.post("/api/login/", form)
      .then(async (res) => {
        localStorage.setItem("token", res.data.access);

        // Fetch user details immediately to store role
        let isStaff = false;
        try {
          const userRes = await API.get("/api/user/");
          sessionStorage.setItem("user", JSON.stringify(userRes.data));
          isStaff = userRes.data.is_staff;
        } catch (err) {
          console.error("Failed to fetch user details", err);
        }

        toast.success("Welcome back!", {
          position: "top-center",
          autoClose: 1500,
        });

        setTimeout(() => {
          navigate(isStaff ? "/admin/dashboard" : "/");
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Invalid credentials", {
          position: "top-center",
          autoClose: 1800,
        });
      });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await API.post("/api/google-login/", { token: tokenResponse.access_token });

        if (res.data.is_new_user) {
          // Redirect to complete profile
          toast.info("Please complete your profile to finish specific sign up.");
          toast.info("Please set a password to complete registration.");
          navigate("/complete-profile", { state: res.data });
          return;
        }

        localStorage.setItem("token", res.data.access);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));

        toast.success("Welcome back!", { position: "top-center", autoClose: 1500 });
        setTimeout(() => {
          navigate(res.data.user.isAdmin ? "/admin" : "/");
        }, 1500);

      } catch (err) {
        console.error("Google Login Error:", err);
        toast.error("Google Login Failed");
      }
    },
    onError: () => toast.error("Google Login Failed"),
  });



  const pageStyle = {
    background: "var(--bg-darker)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "400px",
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
    transition: "transform 0.2s, box-shadow 0.2s",
    marginTop: "10px",
  };

  return (
    <div style={pageStyle}>
      <Navbar />
      <div style={{ padding: "0 20px" }}>
        <div style={cardStyle}>
          <h2 style={{
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "32px",
            fontWeight: "800",
            color: "white",
            textShadow: "0 0 20px var(--primary-glow)"
          }}>Login</h2>

          <input
            style={inputStyle}
            placeholder="Username"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
          />

          <input
            style={inputStyle}
            placeholder="Password"
            type="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
            onBlur={(e) => e.target.style.borderColor = "var(--glass-border)"}
          />

          <button
            onClick={submit}
            style={btnStyle}
            onMouseEnter={(e) => e.target.style.boxShadow = "0 0 15px var(--primary-glow)"}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = "none";
              e.target.style.transform = "scale(1)";
            }}
            onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            Login
          </button>

          <div style={{ marginTop: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
            <span>Don't have an account? </span>
            <Link
              to="/register"
              style={{
                color: "var(--primary)",
                fontWeight: "600",
                textDecoration: "none",
                marginLeft: "5px"
              }}
            >
              Register here
            </Link>
          </div>
        </div>





        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
            <span>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
          </div>

          <button
            onClick={() => googleLogin()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "12px",
              background: "transparent",
              border: "1px solid var(--glass-border)",
              color: "white",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(6, 182, 212, 0.2)";
              e.currentTarget.style.background = "rgba(6, 182, 212, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--glass-border)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <FaGoogle style={{ fontSize: "18px", color: "#fff" }} />
            Sign in with Google
          </button>
        </div>

      </div>
    </div>

  );
}

export default Login;
