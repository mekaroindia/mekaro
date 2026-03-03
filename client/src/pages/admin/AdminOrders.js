import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import ModernLoader from "../../components/ModernLoader";
import { FaSearch, FaFilter, FaTimes, FaBox, FaMapMarkerAlt, FaUser } from "react-icons/fa";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    API.get("/api/admin/orders/")
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleStatusChange = (id, newStatus, e) => {
    if (e) e.stopPropagation(); // Prevent modal from opening
    API.put(`/api/admin/orders/${id}/status/`, { status: newStatus })
      .then(() => {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
        );
        // Also update selected order if it's open
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
        }
      })
      .catch((err) => alert("Failed to update status"));
  };

  const filteredOrders = orders.filter((order) => {
    const username = order.user?.username || "";
    const matchesSearch =
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <ModernLoader />;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Order Management</h1>
        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by ID or User..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterWrapper}>
            <FaFilter style={styles.filterIcon} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>City</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                style={{ ...styles.tr, cursor: 'pointer' }}
                onClick={() => setSelectedOrder(order)}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-darker)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={styles.td}>#{order.id}</td>
                <td style={styles.td}>
                  <div style={styles.userCell}>
                    <div style={styles.avatar}>
                      {(order.user?.username || "?").charAt(0).toUpperCase()}
                    </div>
                    {order.user?.username || "Unknown User"}
                  </div>
                </td>
                <td style={styles.td}>
                  {order.shipping_address?.city || "-"}
                </td>

                <td style={styles.td}>
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td style={{ ...styles.td, fontWeight: "700", color: "var(--primary)" }}>₹{order.total_amount}</td>
                <td style={styles.td}>
                  <span style={getStatusBadgeStyle(order.status)}>
                    {order.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value, e)}
                    onClick={(e) => e.stopPropagation()}
                    style={styles.actionSelect}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div style={styles.emptyState}>No orders found matching your criteria.</div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Order #{selectedOrder.id}</h2>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelectedOrder(null)}>
                <FaTimes />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}><FaUser style={{ marginRight: 8 }} /> Customer Details</h3>
                <p style={styles.infoText}><strong>Name:</strong> {selectedOrder.user?.username}</p>
                <p style={styles.infoText}><strong>Email:</strong> {selectedOrder.user?.email}</p>
              </div>

              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}><FaMapMarkerAlt style={{ marginRight: 8 }} /> Shipping Address</h3>
                <div style={styles.addressBox}>
                  <p>{selectedOrder.shipping_address?.address_line1}</p>
                  <p>{selectedOrder.shipping_address?.address_line2}</p>
                  <p>
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}
                  </p>
                  <p><strong>Phone:</strong> {selectedOrder.shipping_address?.phone}</p>
                </div>
              </div>

              <div style={styles.modalSection}>
                <h3 style={styles.sectionTitle}><FaBox style={{ marginRight: 8 }} /> Order Items</h3>
                <div style={styles.itemsList}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} style={styles.itemRow}>
                      <img
                        src={item.product?.images?.[0] || "https://via.placeholder.com/50"}
                        alt={item.product?.title}
                        style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", background: "#fff" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", color: "white" }}>{item.product?.title || "Unknown Product"}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Qty: {item.quantity} × ₹{item.price_at_purchase}</div>
                      </div>
                      <div style={{ fontWeight: "700", color: "var(--primary)" }}>
                        ₹{item.quantity * item.price_at_purchase}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.modalFooter}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--text-muted)" }}>Status:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      style={styles.actionSelect}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--primary)" }}>
                    Total: ₹{selectedOrder.total_amount}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const getStatusBadgeStyle = (status) => {
  const base = {
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: "0.85rem",
    fontWeight: 600,
    textTransform: "capitalize",
    display: "inline-block",
    border: "1px solid transparent"
  };
  switch (status) {
    case "pending":
      return { ...base, background: "rgba(250, 204, 21, 0.1)", color: "#facc15", borderColor: "rgba(250, 204, 21, 0.2)" };
    case "paid":
      return { ...base, background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.2)" };
    case "shipped":
      return { ...base, background: "rgba(167, 139, 250, 0.1)", color: "#a78bfa", borderColor: "rgba(167, 139, 250, 0.2)" };
    case "delivered":
      return { ...base, background: "rgba(74, 222, 128, 0.1)", color: "#4ade80", borderColor: "rgba(74, 222, 128, 0.2)" };
    default:
      return { ...base, background: "rgba(255, 255, 255, 0.1)", color: "#94a3b8" };
  }
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    flexWrap: "wrap",
    gap: 20,
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "white",
    letterSpacing: "1px",
  },
  controls: {
    display: "flex",
    gap: 15,
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    color: "var(--text-muted)",
  },
  searchInput: {
    padding: "10px 10px 10px 36px",
    borderRadius: 12,
    border: "1px solid var(--glass-border)",
    background: "var(--bg-card)",
    color: "white",
    outline: "none",
    width: 250,
    fontSize: "0.95rem",
  },
  filterWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  filterIcon: {
    position: "absolute",
    left: 10,
    color: "var(--text-muted)",
    zIndex: 1,
  },
  select: {
    padding: "10px 10px 10px 32px",
    borderRadius: 12,
    border: "1px solid var(--glass-border)",
    background: "var(--bg-card)",
    color: "white",
    outline: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  tableCard: {
    background: "var(--bg-card)",
    borderRadius: 20,
    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
    overflow: "hidden",
    border: "1px solid var(--glass-border)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  theadRow: {
    background: "rgba(6, 182, 212, 0.1)", // Light cyan tint
    textAlign: "left",
  },
  th: {
    padding: "18px 24px",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--primary)",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  tr: {
    borderBottom: "1px solid var(--glass-border)",
    transition: "background 0.2s",
  },
  td: {
    padding: "18px 24px",
    fontSize: "0.95rem",
    color: "var(--text-main)",
    verticalAlign: "middle",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontWeight: 500,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--primary), var(--secondary))",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1rem",
    fontWeight: 700,
    boxShadow: "0 0 10px var(--primary-glow)",
  },
  actionSelect: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid var(--glass-border)",
    fontSize: "0.9rem",
    cursor: "pointer",
    background: "var(--bg-darker)",
    color: "white",
    outline: "none",
  },
  emptyState: {
    padding: 60,
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "1.1rem",
  },

  // MODAL STYLES
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    background: "var(--bg-card)",
    width: "100%",
    maxWidth: "700px",
    borderRadius: "24px",
    border: "1px solid var(--glass-border)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
    maxHeight: "90vh",
    overflowY: "auto",
    animation: "slideUp 0.3s ease-out",
  },
  modalHeader: {
    padding: "24px",
    borderBottom: "1px solid var(--glass-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "white",
    marginBottom: "4px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    transition: "color 0.2s",
  },
  modalBody: {
    padding: "24px",
  },
  modalSection: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "var(--primary)",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
  },
  infoText: {
    color: "var(--text-main)",
    marginBottom: "8px",
    fontSize: "1rem",
  },
  addressBox: {
    background: "var(--bg-darker)",
    padding: "16px",
    borderRadius: "12px",
    color: "var(--text-muted)",
    lineHeight: "1.6",
    border: "1px solid var(--glass-border)",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  itemRow: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    padding: "12px",
    background: "var(--bg-darker)",
    borderRadius: "12px",
    border: "1px solid var(--glass-border)",
  },
  modalFooter: {
    padding: "24px",
    borderTop: "1px solid var(--glass-border)",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    justifyContent: "flex-end",
  },
};
