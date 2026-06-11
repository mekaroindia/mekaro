import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { toast } from "react-toastify";
import ModernLoader from "../../components/ModernLoader";
import { FaEdit, FaTrash, FaPlus, FaTimes, FaUserTie, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function AdminStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    type: "tutor", // default
    bio: "",
    expertise: "",
    linkedin: "",
    email: "",
    imageFile: null
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/staff/?page=${currentPage}`);
      if (res.data.results) {
        setStaffList(res.data.results);
        setTotalPages(Math.ceil(res.data.count / 6) || 1);
      } else {
        setStaffList(res.data);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        imageFile: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("role", formData.role);
      data.append("type", formData.type);
      data.append("bio", formData.bio);
      data.append("expertise", formData.expertise);
      data.append("linkedin", formData.linkedin);
      data.append("email", formData.email);
      
      if (formData.imageFile) {
        data.append("image", formData.imageFile);
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (editMode) {
        // If image is not a new file, we don't send it to prevent overriding with null
        // DRF requires standard multipart PATCH. In some setups, PATCH with empty file field might clear it.
        // So we only append if it is an actual new File object.
        await API.patch(`/api/staff/${selectedId}/`, data, config);
        toast.success("Staff member updated successfully!");
      } else {
        await API.post("/api/staff/", data, config);
        toast.success("Staff member created successfully!");
      }
      
      setShowModal(false);
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed. Make sure all required fields are filled.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await API.delete(`/api/staff/${id}/`);
        toast.success("Staff member deleted successfully!");
        fetchStaff();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete staff member");
      }
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setFormData({
      name: "",
      role: "",
      type: "tutor",
      bio: "",
      expertise: "",
      linkedin: "",
      email: "",
      imageFile: null
    });
    setShowModal(true);
  };

  const openEdit = (staff) => {
    setEditMode(true);
    setSelectedId(staff.id);
    setFormData({
      name: staff.name,
      role: staff.role,
      type: staff.type,
      bio: staff.bio || "",
      expertise: staff.expertise || "",
      linkedin: staff.linkedin || "",
      email: staff.email || "",
      imageFile: null // reset image file to allow new upload only
    });
    setShowModal(true);
  };

  if (loading && staffList.length === 0) return <ModernLoader />;

  return (
    <div style={{ color: "var(--text-main)", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Manage Tutors & Staff</h2>
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
          <FaPlus /> Add Staff Member
        </button>
      </div>

      <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--glass-border)", overflow: "hidden", marginBottom: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid var(--glass-border)" }}>
              <th style={{ padding: "16px" }}>Avatar</th>
              <th style={{ padding: "16px" }}>Name</th>
              <th style={{ padding: "16px" }}>Role</th>
              <th style={{ padding: "16px" }}>Type</th>
              <th style={{ padding: "16px" }}>Skills</th>
              <th style={{ padding: "16px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length > 0 ? (
              staffList.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifycontent: "center",
                      overflow: "hidden"
                    }}>
                      {s.image ? (
                        <img src={s.image} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <FaUserTie style={{ color: s.type === "tutor" ? "var(--primary)" : "#a855f7", fontSize: "1.2rem", margin: "auto" }} />
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px", fontWeight: "600" }}>{s.name}</td>
                  <td style={{ padding: "16px", color: "#cbd5e1" }}>{s.role}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      background: s.type === "tutor" ? "rgba(6, 182, 212, 0.1)" : "rgba(168, 85, 247, 0.1)",
                      color: s.type === "tutor" ? "var(--primary)" : "#a855f7",
                      border: `1px solid ${s.type === "tutor" ? "rgba(6, 182, 212, 0.2)" : "rgba(168, 85, 247, 0.2)"}`
                    }}>
                      {s.type === "tutor" ? "Tutor" : "Staff"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {s.expertise ? s.expertise : "-"}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button onClick={() => openEdit(s)} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "1.1rem" }}><FaEdit /></button>
                      <button onClick={() => handleDelete(s.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "1.1rem" }}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)" }}>
                  No staff members added yet. Click "Add Staff Member" to populate this section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginBottom: "30px" }}>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={paginationBtnStyle}
          >
            <FaChevronLeft /> Prev
          </button>
          <span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={paginationBtnStyle}
          >
            Next <FaChevronRight />
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "var(--bg-card)", padding: "30px", borderRadius: "16px",
            width: "600px", maxWidth: "90%", border: "1px solid var(--glass-border)",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3>{editMode ? "Edit Staff Member" : "Add Staff Member"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "white", fontSize: "20px", cursor: "pointer" }}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    placeholder="Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Designation / Role *</label>
                  <input
                    placeholder="Role (e.g. Lead Tutor)"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Staff Category *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    <option value="tutor" style={{ background: "#0f172a" }}>Tutor</option>
                    <option value="staff" style={{ background: "#0f172a" }}>Working Staff</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Contact Email</label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Skills / Expertise (comma-separated)</label>
                <input
                  placeholder="e.g. Arduino, Raspberry Pi, ROS"
                  value={formData.expertise}
                  onChange={e => setFormData({ ...formData, expertise: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>LinkedIn Profile URL</label>
                <input
                  placeholder="https://linkedin.com/..."
                  value={formData.linkedin}
                  onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Short Biography</label>
                <textarea
                  placeholder="Biography details..."
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label style={labelStyle}>Profile Photo</label>
                <div style={{
                  border: "1px dashed var(--glass-border)",
                  padding: "16px",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.02)"
                }} onClick={() => document.getElementById('staffFileInput').click()}>
                  <span style={{ color: "var(--primary)", fontWeight: "bold" }}>+ Upload Image File</span>
                  <input
                    id="staffFileInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  {formData.imageFile && (
                    <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--primary)" }}>
                      {formData.imageFile.name} Selected
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" style={submitBtnStyle}>
                {editMode ? "Update Member" : "Create Member"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block",
  color: "var(--text-muted)",
  fontSize: "0.85rem",
  fontWeight: "600",
  marginBottom: "5px"
};

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--glass-border)",
  padding: "10px 12px",
  borderRadius: "8px",
  color: "white",
  width: "100%",
  fontFamily: "inherit",
  outline: "none"
};

const paginationBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 16px",
  background: "rgba(30, 41, 59, 0.6)",
  border: "1px solid var(--glass-border)",
  color: "white",
  fontWeight: "bold",
  borderRadius: "8px",
  cursor: "pointer"
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
