// src/pages/Checkout.js
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { CartContext } from "../context/CartContext";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { toast } from "react-toastify";

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD"); // 'COD' or 'ONLINE'

  const total = cart.reduce((a, b) => a + Number(b.price || 0) * Number(b.qty || 1), 0);

  useEffect(() => {
    let mounted = true;
    setUserLoading(true);

    API.get("/api/user/")
      .then((res) => {
        if (!mounted) return;
        setUser(res.data);
        setForm({
          full_name: `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim(),
          address_line1: res.data.profile?.address_line1 || "",
          city: res.data.profile?.city || "",
          state: res.data.profile?.state || "",
          pincode: res.data.profile?.pincode || "",
          phone: res.data.profile?.phone || "",
        });
      })
      .catch((err) => {
        console.error("Cannot load user info:", err);
        toast.error("Cannot load user info. Please login.");
      })
      .finally(() => {
        if (mounted) setUserLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOnlinePayment = async (payload) => {
    const res = await loadRazorpay();

    if (!res) {
      toast.error("Razorpay SDK failed to load. Are you online?");
      setPlacing(false);
      return;
    }

    try {
      // 1. Initiate Payment
      const result = await API.post("/api/orders/pay/initiate/", {
        amount: total,
        // You might want to pass other details if needed for logging
      });

      if (!result.data || !result.data.id) {
        toast.error("Server error. Are you online?");
        setPlacing(false);
        return;
      }

      const { amount, id: order_id, currency, keyId } = result.data;

      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency,
        name: "Mekaro E-Commerce",
        description: "Test Transaction",
        order_id: order_id,
        handler: async function (response) {
          const data = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items: payload.items,
            shipping_address: payload.shipping_address,
            total_amount: payload.total_amount,
            is_priority: payload.is_priority,
            priority_hours: payload.priority_hours
          };

          try {
            const verifyRes = await API.post("/api/orders/pay/verify/", data);
            if (verifyRes.data.success) {
              toast.success("Payment Successful! Order Placed. 🚀");
              finalizeOrder();
            } else {
              toast.error("Payment verification failed!");
              setPlacing(false);
            }
          } catch (error) {
            console.error(error);
            toast.error("Payment verification failed!");
            setPlacing(false);
          }
        },
        prefill: {
          name: form.full_name,
          email: user?.email,
          contact: form.phone,
        },
        notes: {
          address: `${form.address_line1}, ${form.city}`
        },
        theme: {
          color: "#06b6d4",
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
            toast.info("Payment cancelled.");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      toast.error("Could not initiate payment.");
      setPlacing(false);
    }
  };

  const finalizeOrder = () => {
    try {
      if (typeof clearCart === "function") clearCart();
      localStorage.removeItem("cart");
    } catch (err) {
      console.warn("Failed to clear cart cleanly:", err);
    }

    setTimeout(() => {
      navigate("/", { replace: true });
    }, 700);
  }

  const placeOrder = async () => {
    if (placing) return;

    const { full_name, address_line1, city, state, pincode, phone } = form;
    if (!full_name || !address_line1 || !city || !state || !pincode || !phone) {
      toast.error("Please fill all required fields");
      return;
    }

    setPlacing(true);

    const payload = {
      items: cart.map((item) => ({
        product_id: item.id,
        qty: item.qty,
        price: item.price,
      })),
      shipping_address: form,
      total_amount: total,
      payment_method: paymentMethod,
      is_priority: isPriority,
      priority_hours: isPriority ? priorityHours : null,
    };

    if (paymentMethod === 'ONLINE') {
      handleOnlinePayment(payload);
      return;
    }

    // Default COD flow
    try {
      await API.post("/api/orders/create/", payload);
      toast.success(isPriority ? "Priority Order Placed! 🚀" : "Order placed successfully!", {
        theme: "dark",
        icon: isPriority ? "⚡" : "🚀"
      });
      finalizeOrder();
    } catch (err) {
      const serverMsg = err?.response?.data?.detail || err?.response?.data?.error;
      console.error("ORDER ERROR:", err.response?.data ?? err);
      toast.error(serverMsg || "Error placing order");
      setPlacing(false);
    }
  };


  // Priority Logic
  const [isPriority, setIsPriority] = useState(false);
  const [priorityHours, setPriorityHours] = useState(24);
  const [canPrioritize, setCanPrioritize] = useState(false);

  // Import local validation
  const { isPincodeAllowed } = require("../data/pincodes");

  useEffect(() => {
    if (!form.pincode) {
      setCanPrioritize(false);
      setIsPriority(false);
      return;
    }

    const allowed = isPincodeAllowed(form.pincode);
    setCanPrioritize(allowed);
    if (!allowed) {
      setIsPriority(false);
    }
  }, [form.pincode]);

  const pageStyle = {
    background: "var(--bg-darker)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    color: "var(--text-main)",
  };

  const boxStyle = {
    background: "var(--bg-card)",
    padding: "30px",
    borderRadius: "24px",
    border: "1px solid var(--glass-border)",
    boxShadow: "0 20px 50px -10px rgba(0,0,0,0.5)",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid var(--glass-border)",
    background: "var(--bg-darker)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "var(--text-muted)",
    fontSize: "14px",
  };

  if (userLoading) {
    return (
      <div style={pageStyle}>
        <Navbar />
        <Container>
          <div style={{ textAlign: "center", marginTop: "100px", color: "var(--primary)" }}>
            <h2>Preparing Secure Checkout...</h2>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />

      <Container>
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-grid">
          {/* LEFT BOX - Shipping */}
          <div className="checkout-box shipping-box">
            <h2 className="box-title">
              Shipping Details
            </h2>

            <div className="form-grid">
              {[
                { key: "full_name", label: "Full name" },
                { key: "address_line1", label: "Address line 1" },
                { key: "city", label: "City" },
                { key: "state", label: "State" },
                { key: "pincode", label: "Pincode" },
                { key: "phone", label: "Phone" },
              ].map((f) => (
                <div key={f.key} className="form-group">
                  <label className="form-label">
                    {f.label.toUpperCase()}
                  </label>
                  <input
                    required
                    value={form[f.key] || ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="form-input"
                    onFocus={(e) => e.target.classList.add("focused")}
                    onBlur={(e) => e.target.classList.remove("focused")}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT BOX - Summary */}
          <div className="checkout-box summary-box">
            <h3 className="summary-title">Order Summary</h3>

            {cart.length === 0 ? (
              <p className="empty-cart-text">Your cart is empty.</p>
            ) : (
              <ul className="cart-list">
                {cart.map((item) => (
                  <li key={item.id} className="cart-item">
                    <span>{item.title} <span className="qty-badge">x{item.qty}</span></span>
                    <span>₹{(item.price * item.qty).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="total-row">
              <span>Total</span>
              <span className="total-amount">₹{total.toLocaleString()}</span>
            </div>

            {/* Payment Method Selection */}
            <div className="payment-method-section">
              <h4 className="payment-title">Payment Method</h4>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                  <div className="radio-outer">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="radio-inner"></div>
                  </div>
                  <span className="payment-text">Pay on Delivery (Cash/UPI)</span>
                </label>

                <label className={`payment-option ${paymentMethod === 'ONLINE' ? 'selected' : ''}`}>
                  <div className="radio-outer">
                    <input
                      type="radio"
                      name="payment"
                      value="ONLINE"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="radio-inner"></div>
                  </div>
                  <span className="payment-text">Pay Online (Secure Razorpay)</span>
                </label>
              </div>
            </div>


            {/* Priority Section */}
            <div style={{ marginTop: "20px" }}>

              {/* If allowed, show checkbox */}
              {canPrioritize && (
                <div className="priority-box">
                  <label className="priority-label">
                    <input
                      type="checkbox"
                      checked={isPriority}
                      onChange={(e) => setIsPriority(e.target.checked)}
                      className="priority-checkbox"
                    />
                    Prioritize Order (One Day Delivery) ⚡
                  </label>

                  {isPriority && (
                    <div className="priority-options">
                      <small className="priority-note" style={{ fontSize: "12px", color: "var(--primary)" }}>
                        Your location is eligible for express delivery!
                      </small>
                    </div>
                  )}
                </div>
              )}

              {/* If NOT allowed (and pincode is entered), show contact admin option */}
              {!canPrioritize && form.pincode && form.pincode.length >= 6 && (
                <div className="priority-box" style={{ borderColor: "var(--glass-border)", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Need timely delivery for this location?
                    </span>
                    <a
                      href="tel:+919876543210" // Replace with actual admin number if known, or generic
                      style={{
                        fontSize: "14px",
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: "bold",
                        display: "flex", alignItems: "center", gap: "6px"
                      }}
                    >
                      📞 Contact Admin for Custom Delivery
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="place-order-container">
              <button
                onClick={placeOrder}
                disabled={placing || cart.length === 0}
                className={`place-order-btn ${placing ? "placing" : ""}`}
              >
                {placing ? "Processing..." : `Place Order • ₹${total.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      </Container>
      <div className="footer-spacer">
        <Footer />
      </div>

      <style>{`
        .checkout-page {
            background: var(--bg-darker);
            min-height: 100vh;
            display: flex; flex-direction: column;
            color: var(--text-main);
        }
        .checkout-title {
            margin-bottom: 30px; font-weight: 800; font-size: 2.5rem;
            background: linear-gradient(to right, #fff, var(--primary));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .checkout-grid {
            display: grid; grid-template-columns: 2fr 1fr; gap: 30px; padding-bottom: 40px;
        }
        .checkout-box {
            background: var(--bg-card); padding: 30px; border-radius: 24px;
            border: 1px solid var(--glass-border);
            box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
            height: fit-content;
        }
        .box-title {
            margin-bottom: 24px; color: white;
            border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;
        }
        .summary-title { margin-top: 0; margin-bottom: 20px; font-size: 1.5rem; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; }
        .form-label {
            margin-bottom: 8px; font-weight: 600; color: var(--text-muted); font-size: 12px; letter-spacing: 0.5px;
        }
        .form-input {
            width: 100%; padding: 14px; border-radius: 12px;
            border: 1px solid var(--glass-border);
            background: rgba(15, 23, 42, 0.6); color: white;
            font-size: 14px; outline: none; transition: border-color 0.2s;
        }
        .form-input:focus, .form-input.focused { border-color: var(--primary); }

        .cart-list { padding: 0; list-style: none; margin-bottom: 20px; }
        .cart-item {
            display: flex; justify-content: space-between; margin-bottom: 12px;
            color: var(--text-muted); font-size: 14px;
        }
        .qty-badge { color: var(--primary); font-weight: 700; margin-left: 5px; }

        .total-row {
            margin-top: 20px; padding-top: 20px;
            border-top: 1px solid var(--glass-border);
            display: flex; justify-content: space-between;
            font-size: 18px; font-weight: 700; color: white;
        }
        .total-amount { color: var(--primary); font-size: 1.4rem; }

        /* Payment Method Styles */
        .payment-method-section { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--glass-border); }
        .payment-title { font-size: 16px; margin-bottom: 15px; color: white; }
        .payment-options { display: flex; flex-direction: column; gap: 12px; }
        .payment-option {
            display: flex; alignItems: center; gap: 12px;
            padding: 12px; border-radius: 12px;
            border: 1px solid var(--glass-border);
            background: rgba(255,255,255,0.02);
            cursor: pointer; transition: all 0.2s;
        }
        .payment-option:hover { background: rgba(255,255,255,0.05); }
        .payment-option.selected { border-color: var(--primary); background: rgba(6, 182, 212, 0.1); }
        
        .radio-outer {
            width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--text-muted);
            display: flex; align-items: center; justify-content: center;
        }
        .payment-option.selected .radio-outer { border-color: var(--primary); }
        .radio-inner {
            width: 10px; height: 10px; border-radius: 50%; background: var(--primary);
            opacity: 0; transform: scale(0.5); transition: all 0.2s;
        }
        .payment-option.selected .radio-inner { opacity: 1; transform: scale(1); }
        .payment-option input { display: none; }
        .payment-text { font-size: 14px; font-weight: 500; }

        .priority-box {
            margin-top: 20px; padding: 16px;
            border: 1px dashed var(--primary); border-radius: 12px;
            background: rgba(6, 182, 212, 0.05);
        }
        .priority-label {
            display: flex; alignItems: center; cursor: pointer; gap: 10px;
            color: var(--primary); fontWeight: 600;
        }
        .priority-checkbox { width: 18px; height: 18px; accent-color: var(--primary); }
        .priority-options { margin-top: 12px; }
        .priority-hours-label { font-size: 12px; color: var(--text-muted); margin-bottom: 4px; display: block; }
        .priority-note { display: block; margin-top: 4px; font-size: 10px; color: var(--text-muted); }

        .place-order-btn {
            margin-top: 24px; width: 100%; padding: 16px;
            background: var(--primary); color: #000;
            border: none; border-radius: 12px;
            font-size: 16px; font-weight: 800;
            cursor: pointer; box-shadow: 0 0 20px var(--primary-glow);
            transition: transform 0.2s;
        }
        .place-order-btn:disabled { background: var(--text-muted); cursor: not-allowed; box-shadow: none; }
        .place-order-btn:hover:not(:disabled) { transform: scale(1.02); }

        .footer-spacer { margin-top: auto; }

        /* MOBILE OVERRIDES */
        @media (max-width: 768px) {
            .checkout-page { padding-bottom: 80px; } /* Space for sticky button */
            .checkout-title { font-size: 2rem; margin-bottom: 20px; margin-top: 10px; }
            
            .checkout-grid { display: flex; flex-direction: column; gap: 20px; padding-bottom: 20px; }
            
            .checkout-box {
                padding: 20px; border-radius: 16px;
                background: transparent; border: none; box-shadow: none; /* Cleaner look */
                padding-left: 0; padding-right: 0; /* Full width feel */
            }
            .shipping-box { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--glass-border); }
            .summary-box { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 20px; border-radius: 12px; }

            .box-title { font-size: 1.2rem; margin-bottom: 20px; }
            .form-grid { grid-template-columns: 1fr; gap: 15px; } /* Single column form */
            
            .form-input { padding: 12px; font-size: 16px; /* Better for touch */ }
            
            .place-order-container {
                position: fixed; bottom: 0; left: 0; width: 100%;
                padding: 15px 20px;
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(10px);
                border-top: 1px solid var(--glass-border);
                z-index: 100;
            }
            .place-order-btn { margin-top: 0; border-radius: 50px; }
            
            .footer-spacer { display: none; }
            .footer-spacer { display: block; margin-bottom: 80px; }
        }

        .loader-dots {
            width: 8px; height: 8px; border-radius: 50%;
            background-color: var(--primary);
            box-shadow: 12px 0 var(--primary), -12px 0 var(--primary);
            animation: dots 1s infinite linear;
            margin-left: 10px; margin-right: 10px;
        }
        @keyframes dots {
            0% { box-shadow: 12px 0 var(--primary), -12px 0 rgba(6, 182, 212, 0.2); background: rgba(6, 182, 212, 0.2); }
            33% { box-shadow: 12px 0 var(--primary), -12px 0 rgba(6, 182, 212, 0.2); background: rgba(6, 182, 212, 0.2); }
            66% { box-shadow: 12px 0 rgba(6, 182, 212, 0.2), -12px 0 var(--primary); background: rgba(6, 182, 212, 0.2); }
            100% { box-shadow: 12px 0 rgba(6, 182, 212, 0.2), -12px 0 var(--primary); background: var(--primary); }
        }
      `}</style>
    </div>
  );
}

