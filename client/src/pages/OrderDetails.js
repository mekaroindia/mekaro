import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ModernLoader from "../components/ModernLoader";
import API from "../api/axios";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    API.get(`/api/orders/${id}/`)
      .then(res => setOrder(res.data))
      .catch(() => console.log("Error"));
  }, [id]);

  if (!order) return <div style={{ minHeight: "100vh", background: "var(--bg-darker)" }}><ModernLoader /></div>;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      <Navbar />

      <div style={{ maxWidth: "800px", margin: "40px auto" }}>
        <div
          style={{
            padding: "25px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h2>{order.order_id || `Order #${order.id}`}</h2>

          <p><b>Status:</b> {order.status}</p>
          <p><b>Total:</b> ₹{order.total_price}</p>

          <h3 style={{ marginTop: "20px" }}>Items:</h3>

          {order.items.map(item => (
            <div
              key={item.id}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <b>{item.product.title}</b> × {item.quantity}
            </div>
          ))}

          <h3 style={{ marginTop: "20px" }}>Shipping Address</h3>
          <p>
            {order.shipping_address.full_name}<br />
            {order.shipping_address.address_line1}<br />
            {order.shipping_address.city}, {order.shipping_address.state}<br />
            {order.shipping_address.pincode}<br />
            Phone: {order.shipping_address.phone}
          </p>
        </div>
      </div>

    </div>
  );
}
