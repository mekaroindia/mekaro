import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import ModernLoader from "../../components/ModernLoader";
import { FaTrash, FaPlus, FaYoutube } from "react-icons/fa";

export default function AdminVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        youtube_url: "",
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await API.get("/api/videos/");
            setVideos(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load videos");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("/api/videos/", formData);
            toast.success("Video added successfully");
            setShowModal(false);
            setFormData({ title: "", youtube_url: "" });
            fetchVideos();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add video");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this video?")) {
            try {
                await API.delete(`/api/videos/${id}/`);
                toast.success("Video deleted");
                fetchVideos();
            } catch (err) {
                console.error(err);
                toast.error("Delete failed");
            }
        }
    };

    const openAdd = () => {
        setFormData({ title: "", youtube_url: "" });
        setShowModal(true);
    };

    if (loading) return <ModernLoader />;

    return (
        <div style={{ color: "var(--text-main)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Manage YouTube Videos</h2>
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
                    <FaPlus /> Add Video
                </button>
            </div>

            <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--glass-border)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--glass-border)" }}>
                            <th style={{ padding: "12px", width: "120px", textAlign: "center" }}>Thumbnail</th>
                            <th style={{ padding: "12px" }}>Title</th>
                            <th style={{ padding: "12px" }}>YouTube URL</th>
                            <th style={{ padding: "12px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map(v => (
                            <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <td style={{ padding: "12px", textAlign: "center" }}>
                                    {v.thumbnail_url ? (
                                        <img src={v.thumbnail_url} alt={v.title} style={{ width: "100px", height: "auto", borderRadius: "8px" }} />
                                    ) : (
                                        <div style={{
                                            width: "100px",
                                            height: "56px",
                                            background: "rgba(6, 182, 212, 0.1)",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "var(--primary)",
                                            fontSize: "20px",
                                            margin: "0 auto"
                                        }}>
                                            <FaYoutube />
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: "12px" }}>
                                    <span style={{ fontWeight: "600", fontSize: "15px" }}>{v.title || "Untitled Video"}</span>
                                </td>
                                <td style={{ padding: "12px" }}>
                                    <a href={v.youtube_url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontSize: "14px" }}>
                                        {v.youtube_url}
                                    </a>
                                </td>
                                <td style={{ padding: "12px" }}>
                                    <button onClick={() => handleDelete(v.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "5px" }}>
                                        <FaTrash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {videos.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                                    No videos found. Add a YouTube URL to get started.
                                </td>
                            </tr>
                        )}
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
                            <h3>Add YouTube Video</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "white", fontSize: "24px", cursor: "pointer", padding: "0" }}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <input
                                placeholder="Video Title (Optional)"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                style={inputStyle}
                            />
                            <input
                                placeholder="YouTube URL (e.g. https://youtu.be/...)"
                                value={formData.youtube_url}
                                onChange={e => setFormData({ ...formData, youtube_url: e.target.value })}
                                required
                                type="url"
                                style={inputStyle}
                            />

                            <button type="submit" style={submitBtnStyle}>
                                Add Video
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
