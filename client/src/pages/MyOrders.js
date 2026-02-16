import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { Link } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/orders/my-orders/")
      .then((res) => setOrders(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--bg-darker)", minHeight: "100vh", color: "var(--text-main)" }}>
      <Navbar />
      <Container>
        <div style={{ maxWidth: "800px", margin: "40px auto" }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "30px",
            background: "linear-gradient(to right, #fff, var(--primary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            My Orders
          </h1>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  border: "3px solid var(--text-muted)",
                  borderTop: "3px solid var(--primary)",
                  animation: "spin 900ms linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
              No orders found.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {orders.map((order) => (
                <div key={order.id} style={{
                  background: "var(--bg-card)",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "1px solid var(--glass-border)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", color: "var(--primary)" }}>{order.order_id || `Order #${order.id}`}</h3>
                    <span style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color:
                        order.status === 'delivered' ? '#4ade80' :
                          order.status === 'shipped' ? '#a78bfa' :
                            order.status === 'paid' ? '#38bdf8' :
                              '#facc15',
                      textTransform: "capitalize",
                      background: "rgba(255,255,255,0.05)",
                      padding: "4px 12px",
                      borderRadius: "20px"
                    }}>
                      {order.status || 'Pending'}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                    <span style={{ color: "var(--text-main)", fontWeight: "700", fontSize: "16px" }}>₹{order.total_amount}</span>
                  </div>

                  <Link
                    to={`/order/${order.id}`}
                    style={{
                      display: "inline-block",
                      textDecoration: "none",
                      color: "var(--bg-darker)",
                      background: "var(--primary)",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "opacity 0.2s"
                    }}
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
      <Footer />
    </div>
  );
}
