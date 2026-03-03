import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaImage } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AdminWorkshops() {
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        files: [] // For new uploads
    });

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const fetchWorkshops = async () => {
        try {
            const res = await API.get("/api/workshops/");
            setWorkshops(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch workshops", err);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, files: Array.from(e.target.files) });
    };

    const handleDeleteImage = async (workshopId, imageId) => {
        if (!window.confirm("Delete this image?")) return;
        try {
            await API.post(`/api/workshops/${workshopId}/delete_image/`, { image_id: imageId });
            toast.success("Image deleted");
            // Refresh workshop data to update UI
            fetchWorkshops();
            // If editing, also update the editingWorkshop state if needed, but fetchWorkshops updates the list. 
            // Better to re-fetch or specific update.
            const updatedRes = await API.get(`/api/workshops/${workshopId}/`);
            setEditingWorkshop(updatedRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete image");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("date", formData.date);
        data.append("location", formData.location);

        if (formData.files) {
            formData.files.forEach((file) => {
                data.append("uploaded_images", file);
            });
        }

        try {
            if (editingWorkshop) {
                await API.patch(`/api/workshops/${editingWorkshop.id}/`, data);
                toast.success("Workshop updated!");
            } else {
                await API.post("/api/workshops/", data);
                toast.success("Workshop created!");
            }
            setShowModal(false);
            setEditingWorkshop(null);
            setFormData({ title: "", description: "", date: "", location: "", files: [] });
            fetchWorkshops();
        } catch (err) {
            console.error(err);
            toast.error("Operation failed. Check inputs or max 5 images limit.");
        }
    };

    const handleEdit = (workshop) => {
        setEditingWorkshop(workshop);
        setFormData({
            title: workshop.title,
            description: workshop.description,
            date: workshop.date,
            location: workshop.location,
            files: []
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this workshop?")) return;
        try {
            await API.delete(`/api/workshops/${id}/`);
            toast.success("Workshop deleted");
            fetchWorkshops();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete workshop");
        }
    };

    const modalStyle = {
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    };

    const modalContentStyle = {
        background: "var(--bg-card)", padding: "30px", borderRadius: "16px",
        width: "90%", maxWidth: "600px", border: "1px solid var(--glass-border)",
        maxHeight: "90vh", overflowY: "auto"
    };

    const inputStyle = {
        width: "100%", padding: "12px", marginBottom: "15px",
        background: "var(--bg-darker)", border: "1px solid var(--glass-border)",
        borderRadius: "8px", color: "white"
    };

    return (
        <div className="admin-page">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "700" }}>Manage Workshops</h2>
                <button onClick={() => { setEditingWorkshop(null); setFormData({ title: "", description: "", date: "", location: "", files: [] }); setShowModal(true); }}
                    style={{ background: "var(--primary)", color: "black", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaPlus /> Add Workshop
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                    {workshops.map(workshop => (
                        <div key={workshop.id} style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "20px", border: "1px solid var(--glass-border)" }}>
                            <h3 style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{workshop.title}</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}><FaCalendarAlt /> {workshop.date}</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}><FaMapMarkerAlt /> {workshop.location}</p>

                            <div style={{ display: "flex", gap: "5px", marginBottom: "15px", overflowX: "auto" }}>
                                {workshop.images && workshop.images.map(img => (
                                    <img key={img.id} src={img.image} alt="workshop" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }} />
                                ))}
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button onClick={() => handleEdit(workshop)} style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "6px", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}><FaEdit /> Edit</button>
                                <button onClick={() => handleDelete(workshop.id)} style={{ flex: 1, padding: "8px", background: "rgba(220, 38, 38, 0.2)", border: "none", borderRadius: "6px", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}><FaTrash /> Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "1.5rem" }}>{editingWorkshop ? "Edit Workshop" : "Add Workshop"}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.5rem", cursor: "pointer" }}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <input style={inputStyle} name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required />
                            <input style={inputStyle} name="date" type="date" value={formData.date} onChange={handleInputChange} required />
                            <input style={inputStyle} name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
                            <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} required />

                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "8px", color: "var(--text-muted)" }}>Images (Max 5 total)</label>
                                <input style={{ ...inputStyle, padding: "8px" }} type="file" multiple accept="image/*" onChange={handleFileChange} />
                                {editingWorkshop && (
                                    <div style={{ marginTop: "10px" }}>
                                        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "5px" }}>Current Images (Click trash to delete):</p>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                                            {editingWorkshop.images && editingWorkshop.images.map(img => (
                                                <div key={img.id} style={{ position: "relative" }}>
                                                    <img src={img.image} alt="workshop" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
                                                    <button type="button" onClick={() => handleDeleteImage(editingWorkshop.id, img.id)}
                                                        style={{ position: "absolute", top: "-5px", right: "-5px", background: "red", color: "white", borderRadius: "50%", width: "20px", height: "20px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button type="submit" style={{ width: "100%", padding: "12px", background: "var(--primary)", color: "black", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" }}>
                                {editingWorkshop ? "Update Workshop" : "Create Workshop"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
