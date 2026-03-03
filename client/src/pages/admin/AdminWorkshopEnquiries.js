import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { FaEnvelope, FaSearch, FaCheck, FaTrash, FaUserTie } from "react-icons/fa";

export default function AdminWorkshopEnquiries() {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchEnquiries();
    }, []);

    const fetchEnquiries = async () => {
        try {
            const response = await API.get("/api/enquiries/");
            setEnquiries(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching enquiries:", error);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const filteredEnquiries = enquiries.filter(enquiry =>
        enquiry.name.toLowerCase().includes(searchTerm) ||
        enquiry.email.toLowerCase().includes(searchTerm) ||
        (enquiry.organization && enquiry.organization.toLowerCase().includes(searchTerm))
    );

    const markAsRead = async (id) => {
        // Optimistic update or call API if you implement a specific endpoint for this
        // For now, we assume the backend handles it or we can update local state
        // If you added an update endpoint:
        // await API.patch(\`/api/enquiries/\${id}/\`, { is_read: true });
        // fetchEnquiries();
    };


    return (
        <div className="admin-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "10px" }}>
                    <FaEnvelope style={{ color: "var(--primary)" }} /> Workshop Enquiries
                </h2>
                <div style={{ position: "relative" }}>
                    <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                        type="text"
                        placeholder="Search enquiries..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{
                            padding: "10px 10px 10px 36px",
                            borderRadius: "8px",
                            border: "1px solid var(--glass-border)",
                            background: "var(--bg-card)",
                            color: "white",
                            width: "300px"
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div style={{ overflowX: "auto", background: "var(--bg-card)", borderRadius: "16px", border: "1px solid var(--glass-border)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "rgba(255,255,255,0.05)", textAlign: "left" }}>
                                <th style={{ padding: "16px", color: "var(--text-muted)" }}>Date</th>
                                <th style={{ padding: "16px", color: "var(--text-muted)" }}>Name</th>
                                <th style={{ padding: "16px", color: "var(--text-muted)" }}>Organization</th>
                                <th style={{ padding: "16px", color: "var(--text-muted)" }}>Email</th>
                                <th style={{ padding: "16px", color: "var(--text-muted)" }}>Message</th>
                                {/* <th style={{ padding: "16px", color: "var(--text-muted)" }}>Actions</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEnquiries.length > 0 ? (
                                filteredEnquiries.map((enquiry) => (
                                    <tr key={enquiry.id} style={{ borderBottom: "1px solid var(--glass-border)" }}>
                                        <td style={{ padding: "16px" }}>{new Date(enquiry.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: "16px", fontWeight: "600", color: "white" }}>{enquiry.name}</td>
                                        <td style={{ padding: "16px" }}>{enquiry.organization || "-"}</td>
                                        <td style={{ padding: "16px" }}>
                                            <a href={`mailto:${enquiry.email}`} style={{ color: "var(--primary)", textDecoration: "none" }}>{enquiry.email}</a>
                                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{enquiry.phone}</div>
                                        </td>
                                        <td style={{ padding: "16px", maxWidth: "300px" }}>{enquiry.message}</td>
                                        {/* <td style={{ padding: "16px" }}>
                                            <button onClick={() => markAsRead(enquiry.id)} title="Mark as Read" style={{ background: "transparent", border: "none", color: "var(--success)", cursor: "pointer", fontSize: "1.1rem" }}>
                                                <FaCheck />
                                            </button>
                                        </td> */}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>No enquiries found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
