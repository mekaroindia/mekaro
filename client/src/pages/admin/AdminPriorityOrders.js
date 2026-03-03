import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import ModernLoader from "../../components/ModernLoader";
import { FaBoxOpen, FaClipboardList, FaSearch, FaBolt } from "react-icons/fa";

export default function AdminPriorityOrders() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        let result = orders;

        if (search) {
            const lower = search.toLowerCase();
            result = result.filter(
                (o) =>
                    o.id.toString().includes(lower) ||
                    o.user?.email?.toLowerCase().includes(lower) ||
                    o.shipping_address?.full_name?.toLowerCase().includes(lower)
            );
        }

        if (statusFilter !== "all") {
            result = result.filter((o) => o.status === statusFilter);
        }

        setFilteredOrders(result);
    }, [search, statusFilter, orders]);

    const fetchOrders = () => {
        setLoading(true);
        API.get("/api/admin/orders/")
            .then((res) => {
                // Filter for ONLY priority orders
                const priority = res.data.filter(o => o.is_priority);
                setOrders(priority);
                setFilteredOrders(priority);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to load priority orders");
                setLoading(false);
            });
    };

    const handleStatusUpdate = (id, newStatus) => {
        API.put(`/api/admin/orders/${id}/status/`, { status: newStatus })
            .then((res) => {
                toast.success(`Order #${id} updated to ${newStatus}`);
                fetchOrders();
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to update status");
            });
    };

    const containerStyle = {
        padding: "20px",
        color: "var(--text-main)",
        animation: "fadeIn 0.5s ease"
    };

    const headerStyle = {
        marginBottom: "30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
    };

    const cardStyle = {
        background: "var(--bg-card)",
        borderRadius: "16px",
        border: "1px solid var(--primary)", // Highlight for priority
        boxShadow: "0 0 15px rgba(6, 182, 212, 0.15)",
        marginBottom: "20px",
        overflow: "hidden",
        position: "relative"
    };

    const statusColors = {
        pending: "#facc15",
        paid: "#60a5fa",
        shipped: "#a78bfa",
        delivered: "#4ade80",
        cancelled: "#ef4444",
    };

    if (loading) return <ModernLoader />;

    return (
        <div style={containerStyle}>
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

            <div style={headerStyle}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "2rem", display: "flex", alignItems: "center", gap: "12px", color: "var(--primary)" }}>
                        <FaBolt /> Priority Orders ({orders.length})
                    </h1>
                    <p style={{ color: "var(--text-muted)", marginTop: "5px" }}>
                        High priority deliveries within Chennai region
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                        <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input
                            placeholder="Search ID, Email, Name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                padding: "10px 10px 10px 36px",
                                borderRadius: "8px",
                                border: "1px solid var(--glass-border)",
                                background: "var(--bg-darker)",
                                color: "white",
                                outline: "none"
                            }}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid var(--glass-border)",
                            background: "var(--bg-darker)",
                            color: "white",
                            outline: "none",
                            cursor: "pointer"
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", background: "var(--bg-card)", borderRadius: "16px", border: "1px dashed var(--glass-border)" }}>
                    <FaClipboardList size={40} color="var(--text-muted)" />
                    <h3 style={{ marginTop: "20px", color: "var(--text-muted)" }}>No priority orders found</h3>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                    {filteredOrders.map(order => (
                        <div key={order.id} style={cardStyle}>
                            {/* Header Bar */}
                            <div style={{
                                padding: "16px 24px",
                                background: "rgba(6,182,212,0.1)",
                                borderBottom: "1px solid var(--glass-border)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                    <span style={{ fontWeight: "800", color: "var(--primary)", fontSize: "1.1rem" }}>#{order.id}</span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        {new Date(order.created_at).toLocaleString()}
                                    </span>
                                    {/* PRIORITY BADGE */}
                                    <span style={{
                                        background: "var(--primary)",
                                        color: "#000",
                                        padding: "4px 10px",
                                        borderRadius: "20px",
                                        fontSize: "0.8rem",
                                        fontWeight: "bold",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}>
                                        <FaBolt size={12} />
                                        {order.priority_hours ? `within ${order.priority_hours} hrs` : "PRIORITY"}
                                    </span>
                                </div>

                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <span style={{
                                        padding: "6px 12px",
                                        borderRadius: "8px",
                                        background: `${statusColors[order.status]}20`,
                                        color: statusColors[order.status],
                                        border: `1px solid ${statusColors[order.status]}40`,
                                        fontWeight: "600",
                                        textTransform: "capitalize"
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
                                {/* Customer Info */}
                                <div>
                                    <h4 style={{ color: "var(--text-muted)", marginBottom: "12px", fontSize: "0.9rem" }}>CUSTOMER</h4>
                                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                                        {order.shipping_address?.full_name || order.user?.username || "Unknown"}
                                    </div>
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        {order.user?.email}
                                    </div>
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
                                        {order.shipping_address?.phone}
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div>
                                    <h4 style={{ color: "var(--text-muted)", marginBottom: "12px", fontSize: "0.9rem" }}>SHIPPING TO</h4>
                                    <div style={{ fontSize: "0.9rem", lineHeight: "1.5", color: "var(--text-muted)" }}>
                                        {order.shipping_address?.address_line1}<br />
                                        {order.shipping_address?.city}, {order.shipping_address?.state}<br />
                                        <strong>{order.shipping_address?.pincode}</strong>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h4 style={{ color: "var(--text-muted)", marginBottom: "12px", fontSize: "0.9rem" }}>
                                        ITEMS ({order.items?.length})
                                    </h4>
                                    <div style={{ maxHeight: "100px", overflowY: "auto", paddingRight: "5px" }}>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                                                <span>{item.qty} x {item.product?.title}</span>
                                                <span style={{ color: "var(--text-main)" }}>₹{item.price_at_purchase}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: "10px", borderTop: "1px dashed var(--glass-border)", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                                        <span>TOTAL</span>
                                        <span style={{ color: "var(--primary)" }}>₹{order.total_amount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{
                                padding: "16px 24px",
                                background: "rgba(0,0,0,0.2)",
                                borderTop: "1px solid var(--glass-border)",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px"
                            }}>
                                {["pending", "paid", "shipped", "delivered"].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusUpdate(order.id, s)}
                                        disabled={order.status === s}
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: "8px",
                                            border: order.status === s ? `1px solid ${statusColors[s]}` : "1px solid var(--glass-border)",
                                            background: order.status === s ? `${statusColors[s]}20` : "transparent",
                                            color: order.status === s ? statusColors[s] : "var(--text-muted)",
                                            cursor: order.status === s ? "default" : "pointer",
                                            opacity: order.status === s ? 1 : 0.7,
                                            fontSize: "0.85rem",
                                            fontWeight: "600",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
