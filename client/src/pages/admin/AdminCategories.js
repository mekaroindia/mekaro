import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import ModernLoader from "../../components/ModernLoader";
import {
    FaEdit, FaTrash, FaPlus, FaTimes,
    FaMicrochip, FaPlane, FaBatteryFull, FaCube,
    FaWifi, FaMemory, FaCogs, FaDigitalTachograph, FaNetworkWired,
    FaTools, FaRobot, FaChargingStation, FaLayerGroup
} from "react-icons/fa";

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
    });
    const [selectedId, setSelectedId] = useState(null);

    // Mapping for icons (Same as Home.js)
    const categoryIcons = {
        "Development Boards": <FaMicrochip />,
        "Drone Parts": <FaPlane />,
        "Batteries, Power Supply": <FaBatteryFull />,
        "Batteries, Power Supply and Accessories": <FaBatteryFull />,
        "3D Printers": <FaLayerGroup />,
        "3D Printers and Parts": <FaLayerGroup />,
        "Sensors": <FaWifi />,
        "Electronic Components": <FaMemory />,
        "Motors | Drivers | Pumps": <FaCogs />,
        "Motors | Drivers | Pumps | Actuators": <FaCogs />,
        "Electronic Modules": <FaDigitalTachograph />,
        "Electronic Modules and Displays": <FaDigitalTachograph />,
        "IoT and Wireless": <FaNetworkWired />,
        "IoT and Wireless Modules": <FaNetworkWired />,
        "Mechanical Parts": <FaTools />,
        "Mechanical Parts, Measurement & Workbench Tools": <FaTools />,
        "DIY & Maker Kits": <FaRobot />,
        "Electric Vehicle Parts": <FaChargingStation />,
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await API.get("/api/categories/");
            setCategories(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load categories");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append("name", formData.name);
            // Generate slug automatically in backend or simple logic here
            if (!editMode) {
                data.append("slug", formData.name.toLowerCase().replace(/ /g, '-'));
            }

            // Image upload removed as per icon-view request

            const config = { headers: { "Content-Type": "multipart/form-data" } };

            if (editMode) {
                await API.patch(`/api/categories/${selectedId}/`, data, config);
                toast.success("Category updated");
            } else {
                await API.post("/api/categories/", data, config);
                toast.success("Category created");
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            console.error(err);
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This might delete products in this category.")) {
            try {
                await API.delete(`/api/categories/${id}/`);
                toast.success("Category deleted");
                fetchCategories();
            } catch (err) {
                console.error(err);
                toast.error("Delete failed");
            }
        }
    };

    const openEdit = (cat) => {
        setEditMode(true);
        setSelectedId(cat.id);
        setFormData({
            name: cat.name,
        });
        setShowModal(true);
    };

    const openAdd = () => {
        setEditMode(false);
        setFormData({ name: "" });
        setShowModal(true);
    };

    if (loading) return <ModernLoader />;

    return (
        <div style={{ color: "var(--text-main)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Manage Categories</h2>
                <button
                    onClick={openAdd}
                    style={{
                        background: "var(--primary)",
                        color: "black",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    <FaPlus /> Add Category
                </button>
            </div>

            <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--glass-border)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--glass-border)" }}>
                            <th style={{ padding: "12px", width: "80px", textAlign: "center" }}>Icon</th>
                            <th style={{ padding: "12px" }}>Name</th>
                            <th style={{ padding: "12px" }}>Slug</th>
                            <th style={{ padding: "12px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(c => (
                            <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <td style={{ padding: "12px", textAlign: "center" }}>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "rgba(6, 182, 212, 0.1)",
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "var(--primary)",
                                        fontSize: "20px",
                                        margin: "0 auto"
                                    }}>
                                        {categoryIcons[c.name] || <FaCube />}
                                    </div>
                                </td>
                                <td style={{ padding: "12px" }}>
                                    <span style={{ fontWeight: "600", fontSize: "15px" }}>{c.name}</span>
                                </td>
                                <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "14px" }}>{c.slug}</td>
                                <td style={{ padding: "12px", display: "flex", gap: "10px" }}>
                                    <button onClick={() => openEdit(c)} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", padding: "5px" }}>
                                        <FaEdit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(c.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "5px" }}>
                                        <FaTrash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div style={{
                        background: "var(--bg-card)", padding: "30px", borderRadius: "16px",
                        width: "400px", maxWidth: "90%", border: "1px solid var(--glass-border)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3>{editMode ? "Edit Category" : "Add Category"}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "white", fontSize: "24px", cursor: "pointer", padding: "0" }}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <input
                                placeholder="Category Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={inputStyle}
                            />

                            {/* Image input removed */}

                            <button type="submit" style={submitBtnStyle}>
                                {editMode ? "Update Category" : "Create Category"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--glass-border)",
    padding: "12px",
    borderRadius: "8px",
    color: "white",
    width: "100%",
    fontFamily: "inherit"
};

const submitBtnStyle = {
    marginTop: "10px",
    padding: "12px",
    background: "var(--primary)",
    color: "black",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer"
};
