import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaRobot, FaEnvelope, FaUser, FaPhone, FaTrash, FaCheckCircle, FaSpinner } from "react-icons/fa";
import ModernLoader from "../../components/ModernLoader";

export default function AdminProjectOrders() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await API.get("/api/projects/");
            setRequests(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching project requests:", err);
            toast.error("Failed to load project requests");
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const res = await API.patch(`/api/projects/${id}/status/`, { status: newStatus });
            setRequests(requests.map(req => req.id === id ? res.data : req));
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
        } catch (err) {
            console.error("Update failed", err);
            toast.error("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await API.delete(`/api/projects/${id}/delete/`);
            setRequests(requests.filter(req => req.id !== id));
            toast.success("Request deleted");
        } catch (err) {
            console.error("Delete failed", err);
            toast.error("Failed to delete request");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "new": return "#3b82f6"; // blue
            case "in_progress": return "#f59e0b"; // amber
            case "completed": return "#10b981"; // green
            case "rejected": return "#ef4444"; // red
            default: return "#64748b"; // gray
        }
    };

    if (loading) return <ModernLoader />;

    return (
        <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "30px", color: "#fff" }}>Custom Project Requests</h2>

            <div style={{ display: "grid", gap: "20px" }}>
                {requests.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>No project requests found.</p>
                ) : (
                    requests.map((req) => (
                        <div
                            key={req.id}
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "16px",
                                padding: "24px",
                                transition: "all 0.2s"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>
                                        {req.project_title}
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <FaUser size={14} className="text-primary" style={{ color: 'var(--primary)' }} /> {req.name}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <FaEnvelope size={14} style={{ color: 'var(--primary)' }} /> {req.email}
                                        </span>
                                        {req.phone && (
                                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <FaPhone size={14} style={{ color: 'var(--primary)' }} /> {req.phone}
                                            </span>
                                        )}
                                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <FaCalendarAlt size={14} style={{ color: 'var(--primary)' }} /> {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>

                                    <span style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        background: "rgba(6, 182, 212, 0.1)",
                                        color: "var(--primary)",
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        border: "1px solid rgba(6, 182, 212, 0.2)",
                                        marginBottom: "10px"
                                    }}>
                                        Type: {req.project_type.toUpperCase()}
                                    </span>

                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        {updatingId === req.id && <FaSpinner className="spin" />}
                                        <select
                                            value={req.status}
                                            onChange={(e) => handleStatusUpdate(req.id, e.target.value)}
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: "8px",
                                                background: "#1e293b",
                                                color: "white",
                                                border: `1px solid ${getStatusColor(req.status)}`,
                                                outline: "none",
                                                cursor: "pointer",
                                                fontWeight: 600
                                            }}
                                            disabled={updatingId === req.id}
                                        >
                                            <option value="new">New</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="rejected">Rejected</option>
                                        </select>

                                        <button
                                            onClick={() => handleDelete(req.id)}
                                            style={{
                                                background: "rgba(239, 68, 68, 0.2)",
                                                border: "1px solid rgba(239, 68, 68, 0.5)",
                                                color: "#ef4444",
                                                padding: "8px",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}
                                            title="Delete Request"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: "rgba(0,0,0,0.2)",
                                padding: "20px",
                                borderRadius: "12px",
                                color: "var(--text-main)",
                                lineHeight: "1.6",
                                fontSize: "1rem",
                                borderLeft: "4px solid var(--primary)"
                            }}>
                                <strong style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>Project Description</strong>
                                {req.description}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
