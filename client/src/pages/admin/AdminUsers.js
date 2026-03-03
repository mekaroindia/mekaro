import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { FaSearch, FaUserShield, FaUser, FaSort, FaCheck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortAdmin, setSortAdmin] = useState(false); // false = default, true = admin first

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Using centralized API instance (auto adds token)
            const { data } = await API.get("/api/admin/users/");
            setUsers(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch users");
            setLoading(false);
        }
    };

    const toggleAdmin = async (user) => {
        if (user.is_superuser) {
            toast.error("Cannot change Super Admin status");
            return;
        }

        // Optimistic update
        const previousUsers = [...users];
        const newStatus = !user.is_staff;

        setUsers(users.map(u => u.id === user.id ? { ...u, is_staff: newStatus } : u));

        try {
            await API.put(`/api/admin/users/${user.id}/status/`, {});
            toast.success(`User ${user.username} is now ${newStatus ? "an Admin" : "a User"}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
            setUsers(previousUsers); // Revert
        }
    };

    const handleSort = () => {
        setSortAdmin(!sortAdmin);
    };

    // Filter and Sort
    let filtered = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.first_name + " " + u.last_name).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortAdmin) {
        filtered.sort((a, b) => (b.is_staff === a.is_staff) ? 0 : b.is_staff ? 1 : -1);
    }

    if (loading) return <div style={{ color: "white", padding: 20 }}>Loading users...</div>;

    return (
        <div className="fade-in">
            <div style={styles.header}>
                <h1 style={styles.title}>Manage Users</h1>
                <div style={styles.controls}>
                    <div style={styles.searchBox}>
                        <FaSearch style={{ color: "var(--text-muted)" }} />
                        <input
                            style={styles.input}
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={handleSort} style={sortAdmin ? styles.activeSortBtn : styles.sortBtn}>
                        <FaSort /> Sort by Admin
                    </button>
                </div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>User</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Joined</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Admin Access</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(user => (
                            <tr key={user.id} style={styles.tr}>
                                <td style={styles.td}>
                                    <div style={styles.userInfo}>
                                        <div style={styles.avatar}>
                                            {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={styles.name}>{user.first_name} {user.last_name}</div>
                                            <div style={styles.username}>@{user.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ ...styles.td, color: "var(--text-muted)" }}>{user.email}</td>
                                <td style={{ ...styles.td, color: "var(--text-muted)" }}>
                                    {new Date(user.date_joined).toLocaleDateString()}
                                </td>
                                <td style={styles.td}>
                                    {user.is_superuser ? (
                                        <span style={styles.badgeSuper}>Super Admin</span>
                                    ) : user.is_staff ? (
                                        <span style={styles.badgeAdmin}>Admin</span>
                                    ) : (
                                        <span style={styles.badgeUser}>User</span>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    {user.is_superuser ? (
                                        <div style={{ ...styles.toggle, opacity: 0.5, cursor: "not-allowed" }}>
                                            Always On
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => toggleAdmin(user)}
                                            style={{
                                                ...styles.toggle,
                                                background: user.is_staff ? "rgba(6, 182, 212, 0.2)" : "rgba(255,255,255,0.1)",
                                                border: user.is_staff ? "1px solid var(--primary)" : "1px solid var(--glass-border)"
                                            }}
                                        >
                                            <div style={{
                                                ...styles.toggleKnob,
                                                transform: user.is_staff ? "translateX(20px)" : "translateX(0)",
                                                background: user.is_staff ? "var(--primary)" : "var(--text-muted)"
                                            }} />
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
        flexWrap: "wrap",
        gap: 20
    },
    title: {
        fontSize: "2rem",
        fontWeight: 700,
        background: "linear-gradient(to right, #fff, var(--primary))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    },
    controls: {
        display: "flex",
        gap: 15
    },
    searchBox: {
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid var(--glass-border)",
        padding: "10px 15px",
        borderRadius: "12px",
        width: "300px",
        gap: 10
    },
    input: {
        background: "transparent",
        border: "none",
        color: "white",
        outline: "none",
        width: "100%"
    },
    sortBtn: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid var(--glass-border)",
        color: "var(--text-muted)",
        padding: "10px 20px",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.3s"
    },
    activeSortBtn: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(6, 182, 212, 0.1)",
        border: "1px solid var(--primary)",
        color: "var(--primary)",
        padding: "10px 20px",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "all 0.3s"
    },
    tableContainer: {
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid var(--glass-border)",
        borderRadius: "16px",
        overflow: "hidden"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left"
    },
    th: {
        padding: "20px",
        color: "var(--text-muted)",
        fontWeight: 600,
        borderBottom: "1px solid var(--glass-border)",
        fontSize: "0.9rem",
        textTransform: "uppercase",
        letterSpacing: "1px"
    },
    tr: {
        borderBottom: "1px solid rgba(255,255,255,0.03)",
        transition: "background 0.2s"
    },
    td: {
        padding: "20px",
        color: "white",
        verticalAlign: "middle"
    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: 15
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: "white",
        fontSize: "1.2rem"
    },
    name: {
        fontWeight: 600,
        color: "white"
    },
    username: {
        fontSize: "0.85rem",
        color: "var(--text-muted)"
    },
    badgeSuper: {
        padding: "5px 10px",
        borderRadius: "20px",
        background: "rgba(255, 215, 0, 0.2)",
        color: "#ffd700",
        border: "1px solid rgba(255, 215, 0, 0.3)",
        fontSize: "0.8rem",
        fontWeight: 600
    },
    badgeAdmin: {
        padding: "5px 10px",
        borderRadius: "20px",
        background: "rgba(6, 182, 212, 0.2)",
        color: "var(--primary)",
        border: "1px solid var(--primary-glow)",
        fontSize: "0.8rem",
        fontWeight: 600
    },
    badgeUser: {
        padding: "5px 10px",
        borderRadius: "20px",
        background: "rgba(255, 255, 255, 0.1)",
        color: "var(--text-muted)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        fontSize: "0.8rem",
        fontWeight: 600
    },
    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        position: "relative",
        cursor: "pointer",
        transition: "all 0.3s"
    },
    toggleKnob: {
        width: 18,
        height: 18,
        borderRadius: "50%",
        position: "absolute",
        top: 2,
        left: 2,
        transition: "all 0.3s",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
    }
};
