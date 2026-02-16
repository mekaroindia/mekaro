import React, { useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import { toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({
    username: "", email: "", password: "", first_name: "", last_name: "",
    phone: "", address_line1: "", address_line2: "", city: "", state: "", pincode: ""
  });
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = () => {
    // basic checks
    if (!form.username || !form.email || !form.password) {
      setMsg("Please fill username, email and password");
      return;
    }
    API.post("/api/register/", form)
      .then(() => {
        setMsg("Registered successfully. Please login.");
        setTimeout(() => navigate("/login"), 1200);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          const obj = err.response.data;
          let message = "";

          if (typeof obj === "string") {
            message = obj;
          } else {
            message = Object.entries(obj)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n");
          }

          setMsg("Error: \n" + message);
        } else {
          setMsg("Error: " + err.message);
        }

      });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await API.post("/api/google-login/", { token: tokenResponse.access_token });
        if (res.data.is_new_user) {
          toast.info("Please set a password to complete registration.");
          navigate("/complete-profile", { state: res.data });
          return;
        }

        localStorage.setItem("token", res.data.access);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));

        toast.success("Account created successfully!", { position: "top-center", autoClose: 1500 });
        setTimeout(() => {
          navigate(res.data.user.isAdmin ? "/admin" : "/");
        }, 1500);

      } catch (err) {
        toast.error("Google Sign-Up Failed");
      }
    },
    onError: () => toast.error("Google Sign-Up Failed"),
  });



  const pageStyle = {
    background: "var(--bg-darker)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "600px",
    background: "var(--bg-card)",
    padding: "40px",
    borderRadius: "24px",
    boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)",
    border: "1px solid var(--glass-border)",
    margin: "40px auto",
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
          }}>Create Account</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Username*</label>
              <input name="username" value={form.username} onChange={handle} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email*</label>
              <input name="email" value={form.email} onChange={handle} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Password*</label>
            <input type="password" name="password" value={form.password} onChange={handle} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Full name</label>
              <input name="first_name" value={form.first_name} onChange={handle} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input name="phone" value={form.phone} onChange={handle} style={inputStyle} />
            </div>
          </div>

          <label style={labelStyle}>Address line 1</label>
          <input name="address_line1" value={form.address_line1} onChange={handle} style={inputStyle} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" value={form.city} onChange={handle} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>State</label>
              <input name="state" value={form.state} onChange={handle} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Pincode</label>
              <input name="pincode" value={form.pincode} onChange={handle} style={inputStyle} />
            </div>
          </div>

          <button
            onClick={submit}
            style={buttonStyle}
            onMouseDown={(e) => e.target.style.transform = "scale(0.95)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          >Register</button>

          {msg && <p style={{ marginTop: "20px", color: "var(--accent)", textAlign: "center" }}>{msg}</p>}

          <div style={{ marginTop: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
            <span>Already have an account? </span>
            <Link
              to="/login"
              style={{
                color: "var(--primary)",
                fontWeight: "600",
                textDecoration: "none",
                marginLeft: "5px"
              }}
            >
              Login
            </Link>
          </div>





          <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "12px" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--glass-border)" }}></div>
              <span>OR SIGN UP WITH</span>
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
              Sign up with Google
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
  marginBottom: "10px",
  background: "var(--bg-darker)",
  border: "1px solid var(--glass-border)",
  borderRadius: "10px",
  color: "white",
  fontSize: "14px",
  outline: "none",
};

const buttonStyle = {
  marginTop: "20px",
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
