import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import Footer from "../components/Footer";
import { calculateFakeOriginalPrice } from "../utils/priceHelper";

export default function Cart() {
  const { cart, updateQty, removeItem } = useContext(CartContext);
  const navigate = useNavigate();

  const totalMRP = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const platformFee = 7;
  const discount = 0;
  const deliveryFee = totalMRP >= 499 ? 0 : 100;
  const finalAmount = totalMRP - discount + platformFee + deliveryFee;

  // Styles moved to CSS at bottom

  return (
    <div className="cart-page">
      <Navbar />
      <Container>
        <h1 className="page-title">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <h2>Cart is empty</h2>
            <Link to="/" className="browse-btn">Browse Products</Link>
          </div>
        ) : (
          <div className="cart-container">
            {/* ITEMS LIST */}
            <div className="cart-list-card">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-img-wrapper">
                    <img
                      src={
                        item.product_images?.length > 0
                          ? item.product_images[0].image
                          : (item.images?.[0] || "https://via.placeholder.com/150?text=No+Image")
                      }
                      alt={item.title}
                    />
                  </div>
                  <div className="item-details">
                    <h3>{item.title}</h3>
                    <p className="item-price" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        textDecoration: 'line-through'
                      }}>
                        ₹{calculateFakeOriginalPrice(item.price, item.id).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                        ₹{item.price.toLocaleString()}
                      </span>
                    </p>

                    <div className="item-actions">
                      <div className="qty-selector-cart">
                        <button className="qty-btn-cart" onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}>−</button>
                        <input
                          type="number"
                          min="1"
                          className="qty-val-cart qty-input-cart"
                          defaultValue={item.qty}
                          key={`qty-${item.id}-${item.qty}`}
                          onBlur={(e) => {
                            let v = parseInt(e.target.value);
                            if (isNaN(v) || v < 1) v = 1;
                            if (v !== item.qty) updateQty(item.id, v);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              let v = parseInt(e.target.value);
                              if (isNaN(v) || v < 1) v = 1;
                              if (v !== item.qty) updateQty(item.id, v);
                              e.target.blur();
                            }
                          }}
                        />
                        <button className="qty-btn-cart" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PRICE DETAILS */}
            <div className="summary-section">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>

                <div className="summary-row">
                  <span>Price ({cart.length} items)</span>
                  <span>₹{totalMRP.toLocaleString()}</span>
                </div>

                <div className="summary-row">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: "var(--primary)" }}>Free</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </div>

                <div className="summary-total">
                  <span>Total Amount</span>
                  <span className="highlight">₹{finalAmount.toLocaleString()}</span>
                </div>

                <button className="checkout-btn" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
      <div style={{ marginTop: "auto" }}>
        <Footer hideOnMobile={true} />
      </div>

      <style>{`
        .cart-page {
          background: var(--bg-darker);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          color: var(--text-main);
        }
        .page-title {
          font-size: 32px;
          font-weight: 800;
          margin-top: 20px;
          margin-bottom: 20px;
        }
        .empty-cart {
          text-align: center;
          padding: 60px 0;
        }
        .empty-cart h2 {
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        .browse-btn {
          padding: 12px 24px;
          background: var(--primary);
          color: #000;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
        }

        .cart-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        /* Cart List Card */
        .cart-list-card, .summary-card {
          background: var(--bg-card);
          border-radius: 24px;
          padding: 24px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
        }

        .cart-item {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 24px;
        }
        .cart-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .item-img-wrapper {
          width: 120px;
          height: 120px;
          border-radius: 12px;
          background: #fff;
          padding: 10px;
          flex-shrink: 0;
        }
        .item-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .item-details { flex: 1; display: flex; flex-direction: column; }
        .item-details h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
          line-height: 1.4;
          color: white;
        }
        .item-price {
          color: var(--primary);
          font-weight: 700;
          font-size: 20px;
          margin: 0 0 16px 0;
        }
        .item-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: auto;
        }

        .qty-selector-cart {
           display: flex; 
           align-items: center;
           background: rgba(255,255,255,0.03);
           border-radius: 10px;
           padding: 2px; 
           border: 1px solid var(--glass-border);
           height: 38px;
        }

        .qty-btn-cart {
           width: 32px; 
           height: 100%; 
           border-radius: 8px;
           background: transparent; 
           color: white;
           border: none; 
           cursor: pointer; 
           font-size: 1.2rem; 
           font-weight: bold;
           display: flex; 
           align-items: center; 
           justify-content: center;
           transition: background 0.2s;
           padding: 0;
           padding-top: 1px; /* Optical vertical centering adjustment */
           outline: none;
           line-height: 0;
        }
        .qty-btn-cart:hover { background: rgba(255,255,255,0.1); }
        
        .qty-val-cart {
           font-weight: 600;
           width: 36px;
           height: 100%;
           display: flex;
           align-items: center;
           justify-content: center;
           color: white;
           font-size: 1rem;
        }
        
        input.qty-input-cart {
           background: transparent;
           border: none;
           outline: none;
           text-align: center;
           -moz-appearance: textfield;
           padding: 0;
           margin: 0;
        }
        input.qty-input-cart::-webkit-outer-spin-button,
        input.qty-input-cart::-webkit-inner-spin-button {
           -webkit-appearance: none;
           margin: 0;
        }

        .remove-btn {
          background: rgba(244, 114, 182, 0.1);
          border: 1px solid rgba(244, 114, 182, 0.2);
          color: var(--accent); /* Pink/Accent color */
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          height: 40px;
          padding: 0 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          outline: none;
        }
        
        .remove-btn:hover {
          background: rgba(244, 114, 182, 0.2);
        }

        /* Summary Section */
        .summary-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 24px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          color: var(--text-muted);
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--glass-border);
          font-size: 20px;
          font-weight: 700;
          color: white;
        }
        .summary-total .highlight {
          color: var(--primary);
        }
        .checkout-btn {
          width: 100%;
          padding: 16px;
          background: var(--primary);
          color: #000;
          border-radius: 12px;
          border: none;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 20px;
          transition: transform 0.2s;
        }
        .checkout-btn:active {
          transform: scale(0.98);
        }

        /* MOBILE OVERRIDES */
        @media (max-width: 768px) {
           .page-title {
             font-size: 24px;
             margin-top: 10px;
             margin-bottom: 16px;
           }

           .cart-container {
             grid-template-columns: 1fr;
             gap: 20px;
             margin-top: 10px;
           }
           
           .cart-list-card, .summary-card {
             padding: 16px;
             border-radius: 16px;
           }

           .cart-item {
             gap: 12px;
             padding-bottom: 16px;
             margin-bottom: 16px;
           }

           .item-img-wrapper {
             width: 80px;
             height: 80px;
             padding: 5px;
             border-radius: 8px;
           }
           
           .item-details h3 {
             font-size: 14px;
             margin-bottom: 4px;
           }
           .item-price {
             font-size: 16px;
             margin-bottom: 10px;
           }
           
           .qty-btn-cart {
             font-size: 1.1rem;
           }
           .qty-val-cart {
             width: 32px;
             font-size: 0.9rem;
           }
           .remove-btn {
             font-size: 0.85rem;
             padding: 0 12px;
             height: 36px;
           }
           
           .qty-selector-cart {
             height: 36px;
           }

           .summary-title { font-size: 18px; margin-bottom: 16px; }
           .summary-row { font-size: 14px; margin-bottom: 10px; }
           .summary-total { font-size: 18px; margin-top: 16px; padding-top: 16px; }
           
           .checkout-btn {
             padding: 14px;
             font-size: 14px;
           }
        }
      `}</style>
    </div>
  );
}
