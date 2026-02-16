// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import Container from "../components/Container";
import ModernLoader from "../components/ModernLoader";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // NEW STATE → for popup modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const [form, setForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    loadUser();
    loadOrders();
  }, []);

  const loadUser = () => {
    API.get("/api/user/")
      .then((res) => {
        setUser(res.data);

        setForm({
          username: res.data.username,
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          email: res.data.email,

          phone: res.data.profile.phone,
          address_line1: res.data.profile.address_line1,
          address_line2: res.data.profile.address_line2,
          city: res.data.profile.city,
          state: res.data.profile.state,
          pincode: res.data.profile.pincode,
        });
      })
      .catch(() => toast.error("Failed to load user details"));
  };

  const loadOrders = () => {
    setOrdersLoading(true);
    API.get(`/api/orders/my-orders/?_t=${Date.now()}`)
      .then((res) => {
        console.log("Orders:", res.data);
        setOrders(res.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load orders");
      })
      .finally(() => setOrdersLoading(false));
  };

  const updateProfile = () => {
    API.put("/api/user/update/", form)
      .then(() => {
        toast.success("Profile updated!");
        setEditMode(false);
        loadUser();
      })
      .catch(() => toast.error("Update failed"));
  };

  const changePassword = () => {
    const { old_password, new_password, confirm_password } = passwordForm;

    if (new_password !== confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    API.put("/api/user/change-password/", {
      old_password,
      new_password,
    })
      .then(() => {
        toast.success("Password changed!");
        setPasswordMode(false);
      })
      .catch(() => toast.error("Failed to change password"));
  };

  if (!user)
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-darker)" }}>
        <ModernLoader />
      </div>
    );


  return (
    <div style={{ background: "var(--bg-darker)", minHeight: "100vh", color: "var(--text-main)" }}>
      <Navbar />

      <Container>
        <div className="profile-container">

          <h1 className="page-title">
            My Account
          </h1>

          {/* PROFILE CARD */}
          <div className="profile-card">
            <div className="profile-layout">
              <div className="profile-info">
                <h2 className="section-title">Profile Details</h2>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="label">Name:</span>
                    <span className="value">{user.first_name} {user.last_name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Email:</span>
                    <span className="value">{user.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phone:</span>
                    <span className="value">{user.profile.phone || "N/A"}</span>
                  </div>
                  <div className="info-row address-row">
                    <div className="label" style={{ marginBottom: "4px" }}>Address:</div>
                    <span className="value">
                      {user.profile.address_line1 || "No address added"}<br />
                      {user.profile.city && `${user.profile.city}, `}
                      {user.profile.state} {user.profile.pincode && `- ${user.profile.pincode}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-profile primary"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setPasswordMode(true)}
                  className="btn-profile secondary"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* ORDERS */}
          <h2 className="section-header">Order History</h2>

          {ordersLoading ? (
            <ModernLoader />
          ) : orders.length === 0 ? (
            <div className="no-orders">
              No orders found. start shopping!
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="order-card"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-header">
                    <div className="order-id">
                      <b>{order.order_id || `Order #${order.id}`}</b>
                      <small>{new Date(order.created_at).toLocaleString()}</small>
                    </div>
                    <div className="order-price">
                      ₹{order.total_amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="order-footer">
                    {order.items?.length} Items • Status: <span className={`status-badge ${order.status || 'pending'}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ▼ ORDER DETAILS POPUP (NEW) */}
          {selectedOrder && (
            <Modal
              title={selectedOrder.order_id || `Order #${selectedOrder.id}`}
              onClose={() => setSelectedOrder(null)}
            >
              <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
                Placed on {new Date(selectedOrder.created_at).toLocaleString()}
              </p>

              <h3 style={{ color: "var(--text-main)", borderBottom: "1px solid var(--glass-border)", paddingBottom: "10px", marginBottom: "15px" }}>Items</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {selectedOrder.items.map((item) => (
                  <li key={item.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{item.product?.title || "Product Removed"}</div>
                      <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Qty: {item.quantity} × ₹{item.price_at_purchase?.toLocaleString()}</div>
                    </div>
                    <div style={{ fontWeight: "600", color: "var(--text-main)" }}>
                      ₹{(item.quantity * item.price_at_purchase).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>Total Amount</span>
                <span style={{ fontSize: "24px", fontWeight: "700", color: "var(--primary)" }}>₹{selectedOrder.total_amount.toLocaleString()}</span>
              </div>
            </Modal>
          )}

          {/* EDIT PROFILE MODAL */}
          {editMode && (
            <Modal title="Edit Profile" onClose={() => setEditMode(false)}>
              {Object.keys(form).map((field) => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", marginBottom: "6px", display: "block", letterSpacing: "1px" }}>
                    {field.replace("_", " ").toUpperCase()}
                  </label>
                  <input
                    value={form[field] || ""}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="modal-input"
                  />
                </div>
              ))}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button onClick={updateProfile} className="btn-save">
                  Save Changes
                </button>
                <button onClick={() => setEditMode(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </Modal>
          )}

          {/* PASSWORD MODAL */}
          {passwordMode && (
            <Modal title="Change Password" onClose={() => setPasswordMode(false)}>
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="password"
                  placeholder="Old Password"
                  className="modal-input"
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, old_password: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <input
                  type="password"
                  placeholder="New Password"
                  className="modal-input"
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, new_password: e.target.value })
                  }
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="modal-input"
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                  }
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={changePassword} className="btn-save">
                  Update Password
                </button>
                <button onClick={() => setPasswordMode(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </Modal>
          )}
        </div>
      </Container>
      <Footer />
      <style>{`
          /* Layout */
          .profile-container { max-width: 900px; margin: 40px auto; padding-bottom: 60px; }
          .page-title {
            font-size: clamp(2rem, 4vw, 3rem);
            font-weight: 800;
            margin-bottom: 30px;
            background: linear-gradient(to right, #fff, var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.3));
          }

          /* Profile Card */
          .profile-card {
            background: var(--bg-card);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
            border: 1px solid var(--glass-border);
            margin-bottom: 40px;
          }
          .profile-layout {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 20px;
          }
          .profile-info { flex: 1; min-width: 300px; }
          .section-title { font-size: 24px; color: white; font-weight: 700; margin-bottom: 16px; }
          
          .info-row { display: flex; align-items: baseline; margin-bottom: 12px; font-size: 16px; color: var(--text-muted); }
          .info-row.address-row { flex-direction: column; }
          .info-row .label { color: var(--primary); font-weight: 600; min-width: 80px; }
          .info-row .value { color: var(--text-muted); word-break: break-all; }

          .profile-actions { display: flex; flexDirection: column; gap: 10px; width: 220px; }

          .btn-profile {
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
            width: 100%;
          }
          .btn-profile.primary {
             background: rgba(6, 182, 212, 0.1);
             color: var(--primary);
             border: 1px solid var(--primary);
          }
          .btn-profile.primary:hover {
             background: var(--primary);
             color: black;
             box-shadow: 0 0 15px var(--primary-glow);
          }
          .btn-profile.secondary {
             background: transparent;
             color: var(--text-muted);
             border: 1px solid var(--glass-border);
          }
          .btn-profile.secondary:hover {
             background: rgba(255, 255, 255, 0.05);
             color: white;
          }

          /* Orders */
          .section-header { margin: 0 0 20px; font-size: 24px; color: var(--text-main); }
          .no-orders { text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: 12px; border: 1px solid var(--glass-border); }
          .orders-grid { display: grid; gap: 16px; }

          .order-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: 16px;
            border: 1px solid var(--glass-border);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .order-card:hover { transform: translateY(-3px); border-color: var(--primary); box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
          
          .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
          .order-id b { color: var(--primary); font-size: 18px; }
          .order-id small { display: block; color: var(--text-muted); font-size: 13px; margin-top: 2px; }
          .order-price { font-weight: 700; font-size: 20px; color: var(--text-main); }
          .order-footer { font-size: 14px; color: var(--text-muted); }
          
          .status-badge { font-weight: 600; text-transform: capitalize; }
          .status-badge.delivered { color: #4ade80; }
          .status-badge.shipped { color: #a78bfa; }
          .status-badge.paid { color: #38bdf8; }
          .status-badge.pending { color: #facc15; }

          /* Modal Elements */
          .modal-input {
             width: 100%; padding: 12px 16px; border-radius: 12px; 
             border: 1px solid var(--glass-border); background: var(--bg-darker); 
             color: white; font-size: 14px; outline: none; transition: border-color 0.3s;
          }
          .modal-input:focus { border-color: var(--primary); }
          .btn-save {
             flex: 1; padding: 12px; background: var(--primary); color: black;
             font-weight: 700; border-radius: 12px; border: none; cursor: pointer;
          }
          .btn-cancel {
             padding: 12px 20px; background: transparent; color: var(--text-muted);
             font-weight: 600; border-radius: 12px; border: 1px solid var(--glass-border); cursor: pointer;
          }

          /* RESPONSIVE MOBILE STYLES */
          @media (max-width: 768px) {
             .profile-container {
                margin: 20px auto;
                padding-bottom: 40px;
             }
             .page-title {
                margin-bottom: 20px;
                font-size: 28px;
             }
             
             .profile-card {
                padding: 20px;
                border-radius: 16px;
                margin-bottom: 30px;
             }
             .profile-layout {
                flex-direction: column;
                gap: 24px;
             }
             .profile-info { min-width: 100%; }
             .section-title { font-size: 20px; margin-bottom: 12px; }

             .info-row { font-size: 14px; flex-direction: column; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; }
             .info-row:last-child { border-bottom: none; }
             .info-row .label { font-size: 12px; opacity: 0.8; }
             .info-row .value { font-size: 15px; color: white; }

             .profile-actions { width: 100%; flex-direction: row; }
             .btn-profile { flex: 1; padding: 10px; font-size: 13px; text-align: center; }

             /* Orders Mobile */
             .order-card {
                padding: 16px;
             }
             .order-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
             }
             .order-price {
                font-size: 18px;
                align-self: flex-end; /* Move price to right */
                margin-top: -30px; /* Overlap trick or utilize absolute? better flex */
             }
             /* Better re-layout for order header on mobile */
             .order-header {
                flex-direction: row;
                align-items: center;
             }
             .order-id b { font-size: 16px; }
             .order-price { font-size: 18px; }
             
             .order-footer { font-size: 13px; }
          }
        `}</style>
    </div>
  );
}

/* ---------- STYLES ---------- */

/* ---------- STYLES ---------- */
// Styles are now managed via CSS-in-JS above for better responsiveness
// Modal styles that are still JS objects (if needed for Modal component internals that weren't converted or for fallback)
// The Modal component itself is defined below.

/* ---------- MODAL COMPONENT ---------- */

function Modal({ title, children, onClose }) {
  return (
    <div style={modalBackdrop} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeader}>
          <h2 style={{ margin: 0, color: "white", fontSize: "20px" }}>{title}</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {children}
      </div>
    </div>
  );
}

const modalBackdrop = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.8)",
  backdropFilter: "blur(5px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2000,
};

const modalCard = {
  width: "500px",
  maxWidth: "90%",
  maxHeight: "85vh",
  overflowY: "auto",
  background: "#1e293b", // Hardcoded fallback or use var(--bg-card) if guaranteed
  backgroundColor: "var(--bg-card)",
  padding: "30px",
  borderRadius: "24px",
  border: "1px solid var(--glass-border)",
  boxShadow: "0 0 40px rgba(0,0,0,0.5)",
  color: "var(--text-main)",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
  paddingBottom: 16,
  borderBottom: "1px solid var(--glass-border)"
};

const closeBtn = {
  border: "none",
  background: "transparent",
  color: "var(--text-muted)",
  fontSize: 20,
  cursor: "pointer",
  transition: "color 0.2s"
};
