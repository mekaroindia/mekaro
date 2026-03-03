import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import ModernLoader from "../../components/ModernLoader";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category_id: "",
        stock: 0,
        images: [] // Simplify: just text urls for now or handle later
    });
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await API.get("/api/products/");
            // Handle paginated response
            if (res.data.results) {
                setProducts(res.data.results);
            } else {
                setProducts(res.data);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load products");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await API.get("/api/categories/");
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("price", formData.price);
            formDataToSend.append("stock", formData.stock);
            formDataToSend.append("category_id", formData.category_id);

            // Append images
            if (formData.images && formData.images.length > 0) {
                // Check if images are files (new uploads) or urls (existing)
                // For create/add, they are typically files.
                // If we support mixed editing, we'd need more logic, 
                // but for "Add Product" user requested, we iterate selected files.
                Array.from(formData.images).forEach((file) => {
                    if (file instanceof File) {
                        formDataToSend.append("uploaded_images", file);
                    }
                });
            }

            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            if (editMode) {
                // PATCH usually doesn't work well with multipart/form-data partial updates in some DRF configs without hacks
                // Better to use PUT or custom logic, but let's try.
                // Note: Updating images via patch is complex (add/remove). 
                // For now, let's focus on CREATE as requested.
                await API.patch(`/api/products/${selectedId}/`, formDataToSend, config);
                toast.success("Product updated");
            } else {
                await API.post("/api/products/", formDataToSend, config);
                toast.success("Product created");
            }
            setShowModal(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            toast.error("Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure?")) {
            try {
                await API.delete(`/api/products/${id}/`);
                toast.success("Product deleted");
                fetchProducts();
            } catch (err) {
                console.error(err);
                toast.error("Delete failed");
            }
        }
    };

    const openEdit = (product) => {
        setEditMode(true);
        setSelectedId(product.id);
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            category_id: product.category?.id || "",
            stock: product.stock,
            category_id: product.category?.id || "",
            stock: product.stock,
            images: product.product_images?.length > 0 ? product.product_images : product.images
        });
        setShowModal(true);
    };

    const openAdd = () => {
        setEditMode(false);
        setFormData({ title: "", description: "", price: "", category_id: "", stock: 0, images: [] });
        setShowModal(true);
    };

    if (loading) return <ModernLoader />;

    return (
        <div style={{ color: "var(--text-main)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>Manage Products</h2>
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
                    <FaPlus /> Add Product
                </button>
            </div>

            <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--glass-border)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--glass-border)" }}>
                            <th style={{ padding: "12px" }}>Title</th>
                            <th style={{ padding: "12px" }}>Category</th>
                            <th style={{ padding: "12px" }}>Price</th>
                            <th style={{ padding: "12px" }}>Stock</th>
                            <th style={{ padding: "12px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <td style={{ padding: "12px" }}>{p.title}</td>
                                <td style={{ padding: "12px" }}>{p.category?.name || "-"}</td>
                                <td style={{ padding: "12px" }}>₹{p.price}</td>
                                <td style={{ padding: "12px" }}>{p.stock}</td>
                                <td style={{ padding: "12px", display: "flex", gap: "10px" }}>
                                    <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer" }}><FaEdit /></button>
                                    <button onClick={() => handleDelete(p.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><FaTrash /></button>
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
                        width: "500px", maxWidth: "90%", border: "1px solid var(--glass-border)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3>{editMode ? "Edit Product" : "Add Product"}</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "white", fontSize: "20px", cursor: "pointer" }}><FaTimes /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <input
                                placeholder="Product Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                                style={inputStyle}
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ ...inputStyle, minHeight: "100px" }}
                            />
                            <div style={{ display: "flex", gap: "10px" }}>
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <select
                                value={formData.category_id}
                                onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                required
                                style={{ ...inputStyle, cursor: "pointer" }}
                            >
                                <option value="" style={{ background: "#0f172a", color: "white" }}>Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id} style={{ background: "#0f172a", color: "white" }}>{c.name}</option>
                                ))}
                            </select>

                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                <label style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Product Images</label>
                                <div style={{
                                    border: "1px dashed var(--glass-border)",
                                    padding: "20px",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    background: "rgba(255,255,255,0.02)"
                                }} onClick={() => document.getElementById('fileInput').click()}>
                                    <span style={{ color: "var(--primary)", fontWeight: "bold" }}>+ Choose Images</span>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, images: e.target.files })}
                                        style={{ display: "none" }}
                                    />
                                    {formData.images && formData.images.length > 0 && (
                                        <div style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                            {formData.images.length} file(s) selected
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" style={submitBtnStyle}>
                                {editMode ? "Update Product" : "Create Product"}
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
