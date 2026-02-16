
import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import { CartContext } from "../context/CartContext";
import { toast } from "react-toastify";
import Container from "../components/Container";
import { FaShoppingCart, FaArrowLeft, FaStar, FaBolt, FaBox, FaShieldAlt, FaCheck, FaTruck, FaUndo } from "react-icons/fa";
import ModernLoader from "../components/ModernLoader";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const { cart, addToCart, updateQty, removeItem, buyNow } = useContext(CartContext);

  const [isAdding, setIsAdding] = useState(false);
  const [qtyInCart, setQtyInCart] = useState(0);
  const [inputQty, setInputQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (product) {
      // Determine available images
      const images = product.product_images?.length > 0
        ? product.product_images.map(p => p.image)
        : (product.images?.length > 0 ? product.images : null);

      if (images && images.length > 0) {
        setActiveImage(images[0]);
      } else {
        setActiveImage("https://via.placeholder.com/600x400?text=No+Image");
      }
    }
  }, [product]);

  useEffect(() => {
    API.get(`/api/products/${id}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        console.error("Product fetch error:", err);
        toast.error("Failed to load product");
      });
  }, [id]);

  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (product && product.category) {
      // Fetch related products
      // Assuming category has an ID. If it's just name, we might need a different approach or backend support.
      // Based on previous steps, product.category is an object with id and name.
      const catId = product.category.id;
      if (catId) {
        API.get(`/api/products/?category=${catId}`)
          .then(res => {
            // Filter out current product and take top 5
            const relevant = (res.data.results || res.data || [])
              .filter(p => p.id !== product.id)
              .slice(0, 5);
            setRelatedProducts(relevant);
          })
          .catch(err => console.error("Related products fetch error:", err));
      }
    }
  }, [product]);

  // Sync Input when Cart Changes (only if we are not actively typing? simplified for now)
  useEffect(() => {
    if (product) {
      const item = cart.find((c) => c.id === Number(id) || c.id === id);
      const qty = item ? item.qty : 0;
      setQtyInCart(qty);
      if (qty > 0) {
        setInputQty(qty);
      }
    }
  }, [cart, id, product]);

  // Loading return removed to embed inside main layout




  const handleAddToCart = async () => {
    if (qtyInCart > 0) {
      if (inputQty !== qtyInCart) {
        updateQty(product.id, inputQty);
        toast.success("Cart updated!");
      }
      return;
    }

    setIsAdding(true);
    try {
      addToCart(product, inputQty);
      toast.success("Added to cart!", { position: "top-center", autoClose: 1200 });
    } catch (err) {
      console.error(err);
      toast.error("Could not add to cart");
    } finally {
      setTimeout(() => setIsAdding(false), 800);
    }
  };

  const handleBuyNow = () => {
    buyNow(product, inputQty);
    navigate("/checkout");
  };

  const handleIncrease = () => {
    const newQty = inputQty + 1;
    setInputQty(newQty);
    if (qtyInCart > 0) {
      updateQty(product.id, newQty);
    }
  };

  const handleDecrease = () => {
    if (inputQty <= 1) {
      return;
    }
    const newQty = inputQty - 1;
    setInputQty(newQty);
    if (qtyInCart > 0) {
      updateQty(product.id, newQty);
    }
  };

  const handleManualChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1) {
      setInputQty(val);
    } else if (e.target.value === "") {
      setInputQty("");
    }
  };

  const handleBlur = () => {
    if (inputQty === "" || inputQty < 1) {
      setInputQty(qtyInCart > 0 ? qtyInCart : 1);
      return;
    }
    if (qtyInCart > 0 && inputQty !== qtyInCart) {
      updateQty(product.id, inputQty);
    }
  };

  // Helper to get all images for rendering
  const getAllImages = () => {
    if (!product) return [];
    if (product.product_images?.length > 0) return product.product_images.map(p => p.image);
    if (product.images?.length > 0) return product.images;
    return ["https://via.placeholder.com/600x400?text=No+Image"];
  };

  const productImages = product ? getAllImages() : [];

  const handleScroll = () => {
    if (sliderRef.current) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const width = sliderRef.current.offsetWidth;
      const index = Math.round(scrollLeft / width);
      if (productImages[index] && productImages[index] !== activeImage) {
        setActiveImage(productImages[index]);
      }
    }
  };

  const scrollToImage = (index) => {
    if (sliderRef.current) {
      const width = sliderRef.current.offsetWidth;
      sliderRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="product-page">
      <Navbar />

      {!product ? (
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ModernLoader />
        </div>
      ) : (
        <Container>
          <div className="breadcrumb">
            <span className="back-link" onClick={() => navigate(-1)}>
              <FaArrowLeft /> Back
            </span>
            <span>/</span>
            <span className="current-crumb">{product.category?.name || "Product"}</span>
          </div>

          <div className="product-layout">
            {/* LEFT COLUMN: IMAGE */}
            <div className="image-section">
              <div className="main-image-card">
                <div
                  className="image-slider"
                  ref={sliderRef}
                  onScroll={handleScroll}
                >
                  {productImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${product.title} - view ${idx + 1}`}
                      className="slider-image"
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="thumbnails">
                  {productImages.map((img, i) => (
                    <div
                      key={i}
                      className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                      onClick={() => scrollToImage(i)}
                    >
                      <img src={img} alt={`view ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: DETAILS */}
            <div className="details-section">
              <div className="category-badge">
                {product.category?.name || "Electronics"}
              </div>

              <h1 className="product-title">
                {product.title}
              </h1>

              <div className="price-rating-row">
                <span className="price-tag">
                  ₹{product.price.toLocaleString()}
                </span>
                <div className="divider"></div>
                <div className="rating-box">
                  <div className="stars">
                    <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar className="star-faded" />
                  </div>
                  <span className="review-count">(128 Reviews)</span>
                </div>
              </div>

              {/* Short Description */}
              <p className="short-desc">
                {product.description.split('\n')[0]}...
                <span
                  className="read-more"
                  onClick={() => {
                    setActiveTab('description');
                    document.querySelector('.tabs-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                > Read more</span>
              </p>

              {/* Mock Features */}
              {/* Mock Features */}
              <div className="features-row">
                <div className="feature-item" style={{ color: product.stock > 0 ? '#e2e8f0' : '#ef4444' }}>
                  {product.stock > 0 ? (
                    <><FaCheck className="icon" style={{ color: '#10b981' }} /> In Stock</>
                  ) : (
                    <><FaBox className="icon" style={{ color: '#ef4444' }} /> Out of Stock</>
                  )}
                </div>
                <div className="feature-item"><FaTruck className="icon" /> 30 Days Return</div>
              </div>

              {/* ACTION AREA - UNIFIED */}
              <div className="action-card">
                {product.stock > 0 ? (
                  <>
                    <div className="qty-selector">
                      <button onClick={handleDecrease} className="qty-btn">-</button>
                      <input
                        type="number"
                        className="qty-input"
                        value={inputQty}
                        onChange={handleManualChange}
                        onBlur={handleBlur}
                        min="1"
                        max={product.stock}
                      />
                      <button onClick={handleIncrease} className="qty-btn" disabled={inputQty >= product.stock}>+</button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className={`add-cart-btn ${isAdding ? 'adding' : ''}`}
                      disabled={(qtyInCart > 0 && inputQty === qtyInCart) || isAdding}
                    >
                      <FaShoppingCart />
                      {qtyInCart > 0 ? (inputQty !== qtyInCart ? "Update" : "In Cart") : "Add to Cart"}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="buy-now-btn"
                    >
                      <FaBolt /> Buy Now
                    </button>
                  </>
                ) : (
                  <div style={{ color: '#ef4444', fontWeight: 'bold', padding: '10px' }}>
                    Currently, out of stock
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TABS SECTION */}
          <div className="tabs-container">
            <div className="tabs-header">
              {['description', 'specifications', 'reviews'].map(tab => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab}
                </div>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'description' && (
                <div className="desc-content">
                  <h3>Product Description</h3>
                  {product.description}
                  <br /><br />
                  <p>Experience the quality and performance of {product.title}. Designed for both enthusiasts and professionals, this product delivers reliability and precision.</p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <h3>Technical Specifications</h3>
                  <div className="specs-grid">
                    <div className="label">Brand</div><div>Mekaro Generic</div>
                    <div className="label">Model</div><div>TR-X 2024</div>
                    <div className="label">Material</div><div>Composite / PCB</div>
                    <div className="label">Warranty</div><div>1 Year Manufacturer</div>
                    <div className="label">Country of Origin</div><div>India</div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3>Customer Reviews</h3>
                  <div className="review-card">
                    <div className="review-header">
                      <strong>John Doe</strong>
                      <span className="stars">★★★★★</span>
                    </div>
                    <p>"Excellent product! Delivered very fast and works perfectly with my project."</p>
                  </div>
                  <div className="review-card">
                    <div className="review-header">
                      <strong>Sarah Smith</strong>
                      <span className="stars">★★★★☆</span>
                    </div>
                    <p>"Good value for money. The packaging was secure."</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RELATED PRODUCTS SECTION */}
          {relatedProducts.length > 0 && (
            <div className="related-section">
              <h3 className="section-title">Related Products</h3>
              <div className="related-scroll-container">
                {relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="related-card"
                    onClick={() => {
                      navigate(`/product/${p.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="related-img-box">
                      <img
                        src={p.product_images?.length > 0 ? p.product_images[0].image : (p.images?.[0] || "https://via.placeholder.com/300x300")}
                        alt={p.title}
                      />
                    </div>
                    <div className="related-info">
                      <div className="related-title">{p.title}</div>
                      <div className="related-price">₹{p.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}

                {/* SEE MORE CARD */}
                <div
                  className="related-card see-more-card"
                  onClick={() => navigate(`/?category=${encodeURIComponent(product.category?.name)}`)}
                >
                  <div className="see-more-content">
                    <span className="see-more-text">See More</span>
                    <span className="see-more-sub">in {product.category?.name}</span>
                    <div className="see-more-icon">→</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </Container>
      )}

      <style>{`
        .product-page {
          background: radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%);
          min-height: 100vh;
          color: white;
          overflow-x: hidden;
          padding-bottom: 80px;
        }

        .breadcrumb {
          margin: 20px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--text-muted);
          flex-wrap: wrap; /* Ensure wrapping on small screens */
        }
        .back-link { cursor: pointer; display: flex; align-items: center; gap: 5px; }
        .current-crumb { color: var(--primary); }

        .product-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 40px;
          align-items: start;
          margin-bottom: 60px;
        }

        /* Image Section */
        .image-section { position: relative; z-index: 1; }
         .main-image-card {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            display: flex; justifyContent: center; alignItems: center;
            min-height: 400px;
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
            overflow: hidden; /* Ensure images don't overflow corners */
         }
         
         .image-slider {
            display: flex;
            width: 100%;
            height: 100%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE */
         }
         .image-slider::-webkit-scrollbar { display: none; }

         .slider-image {
            flex: 0 0 100%;
            width: 100%;
            height: 100%;
            object-fit: contain;
            scroll-snap-align: center;
            max-height: 400px;
            filter: drop-shadow(0 15px 25px rgba(0,0,0,0.3));
         }

         .thumbnails { display: flex; gap: 10px; margin-top: 20px; justify-content: center; }
        .thumbnail {
           width: 60px; height: 60px;
           background: rgba(255,255,255,0.05);
           border-radius: 10px;
           border: 1px solid transparent;
           cursor: pointer;
        }
        .thumbnail.active { border-color: var(--primary); }

        /* Details Section */
        .details-section { }
        .category-badge {
           display: inline-block; padding: 4px 12px; border-radius: 50px;
           background: rgba(6, 182, 212, 0.1); color: var(--primary);
           font-weight: 600; font-size: 0.8rem; margin-bottom: 15px;
           border: 1px solid rgba(6, 182, 212, 0.2);
        }
        .product-title {
           font-size: clamp(1.8rem, 2.5vw, 2.8rem);
           font-weight: 800; line-height: 1.2;
           margin-bottom: 15px; color: #fff;
        }
        
        .price-rating-row { display: flex; alignItems: center; gap: 15px; margin-bottom: 25px; }
        .price-tag {
           font-size: 2.2rem; font-weight: 800; color: var(--primary);
           text-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
        }
        .divider { height: 30px; width: 1px; background: rgba(255,255,255,0.2); }
        .rating-box { display: flex; alignItems: center; gap: 5px; color: #fbbf24; }
        .review-count { color: var(--text-muted); margin-left: 5px; font-size: 0.9rem; }
        .star-faded { opacity: 0.5; }

        .short-desc {
           font-size: 1rem; line-height: 1.6; color: #94a3b8;
           margin-bottom: 30px; max-width: 90%;
        }
        .read-more { color: var(--primary); cursor: pointer; }

        .features-row { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
        .feature-item {
           display: flex; alignItems: center; gap: 8px;
           font-size: 0.9rem; color: #e2e8f0;
           background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 20px;
        }
        .feature-item .icon { color: var(--primary); }

        /* Action Card */
        /* ACTION AREA */
        .action-card {
           background: rgba(15, 23, 42, 0.6);
           border: 1px solid var(--glass-border); padding: 10px 14px; border-radius: 14px;
           display: flex; alignItems: center; gap: 12px;
           width: fit-content; margin: 20px auto 0 auto;
           box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .qty-selector {
           display: flex; alignItems: center;
           background: rgba(255,255,255,0.03);
           border-radius: 10px;
           padding: 2px; border: 1px solid var(--glass-border);
           height: 40px;
        }

        .qty-btn {
           width: 32px; height: 100%; border-radius: 8px;
           background: transparent; color: white;
           border: none; cursor: pointer; font-size: 1.1rem; font-weight: bold;
           display: flex; alignItems: center; justify-content: center;
           transition: background 0.2s;
           align-items: center;
        }
        .qty-btn:hover { background: rgba(255,255,255,0.1); }

        .qty-input {
          width: 36px; height: 100%;
          border: none; background: transparent;
          color: white; text-align: center;
          font-weight: 600; font-size: 0.95rem;
          
        }
        .qty-input:focus { outline: none; }
        /* Remove arrows */
        .qty-input::-webkit-outer-spin-button, .qty-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .qty-input { -moz-appearance: textfield; }

        .add-cart-btn, .buy-now-btn {
           height: 40px; padding: 0 20px;
           border-radius: 10px;
           font-size: 0.9rem; font-weight: 600; cursor: pointer;
           display: flex; justify-content: center; alignItems: center; gap: 8px;
           transition: all 0.2s; border: none;
           white-space: nowrap; letter-spacing: 0.3px;
        }

        .add-cart-btn {
           background: rgba(255,255,255,0.08); color: white;
           border: 1px solid var(--glass-border);
           align-items: center;
        }
        .add-cart-btn:hover { background: rgba(255,255,255,0.12); }
        .add-cart-btn.adding { background: #10b981; border-color: #10b981; }

        .buy-now-btn {
           background: var(--primary); color: #000;
           align-items: center;
           font-weight: 700;
           box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3);
        }
        .buy-now-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); }

        /* Tabs */
        .tabs-container { margin-top: 60px; max-width: 1000px; }
        .tabs-header { display: flex; gap: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 30px; }
        .tab-item {
           padding-bottom: 15px; cursor: pointer; text-transform: capitalize;
           font-weight: 500; color: var(--text-muted);
           border-bottom: 2px solid transparent; fontSize: 1.1rem;
           transition: all 0.3s;
        }
        .tab-item.active { font-weight: 700; color: var(--primary); border-bottom-color: var(--primary); }

        .tab-content { min-height: 200px; color: #cbd5e1; line-height: 1.8; }
        .tab-content h3 { color: white; margin-bottom: 15px; }
        .desc-content { white-space: pre-line; }
        
        .specs-grid { display: grid; grid-template-columns: 200px 1fr; gap: 10px; max-width: 600px; }
        .specs-grid .label { color: var(--text-muted); }
        
        .review-card { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; margin-bottom: 15px; }
        .review-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .review-header .stars { color: #fbbf24; }
        .review-card p { font-style: italic; color: var(--text-muted); margin: 0; }

         /* MOBILE OVERRIDES */
         @media (max-width: 768px) {
            .product-page { padding-bottom: 110px; }
            
            .breadcrumb { 
              margin: 15px 0; 
              font-size: 0.8rem; 
              padding: 0 20px; 
              justify-content: center;
              opacity: 0.9;
            }

            .product-layout {
              display: flex; flex-direction: column; gap: 25px;
              margin-bottom: 30px;
            }

            /* Image Section - Compact & Centered */
            .image-section { 
              margin: 0;
              padding: 0 20px;
              display: flex; flex-direction: column; align-items: center;
            }
            .main-image-card {
              background: #fff;
              border: none;
              border-radius: 16px;
              padding: 20px;
              width: 100%;
              box-sizing: border-box;
              min-height: auto;
              height: 320px;
              display: flex; align-items: center; justify-content: center;
              box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            }
            .slider-image { 
              max-height: 280px; 
              width: 100%;
              object-fit: contain; 
              filter: none;
            }

            /* Thumbnails Centered */
            .thumbnails { 
              gap: 12px; margin-top: 20px; 
              justify-content: center; 
              overflow-x: auto; 
              padding-bottom: 5px; 
              width: 100%;
            }
            .thumbnail {
              width: 55px; height: 55px;
              border-radius: 10px;
              border: 1px solid rgba(255,255,255,0.1);
              background: rgba(255,255,255,0.05);
              flex-shrink: 0;
            }
            .thumbnail.active { 
              border-color: var(--primary); 
              box-shadow: 0 0 10px var(--primary-glow);
            }

            /* Details Typography - Centered for Clean Look */
            .details-section { 
              padding: 0 24px; 
              display: flex; flex-direction: column; align-items: center; text-align: center;
            }
            
            .category-badge {
              font-size: 0.75rem; padding: 5px 14px;
              background: rgba(6, 182, 212, 0.1);
              margin-bottom: 12px;
              border-radius: 20px;
              color: var(--primary);
              border: 1px solid rgba(6, 182, 212, 0.2);
              align-self: center;
            }
            
            .product-title {
              font-size: 1.7rem;
              font-weight: 700;
              margin-bottom: 10px;
              line-height: 1.3;
              color: white;
            }
            
            .price-rating-row { 
              justify-content: center;
              gap: 15px;
              margin-bottom: 20px; 
              align-items: center;
              width: 100%;
            }
            .price-tag { 
              font-size: 1.8rem;
              font-weight: 800;
              color: var(--primary); 
              text-shadow: 0 0 15px rgba(6, 182, 212, 0.2); 
            }
            .divider { height: 20px; background: rgba(255,255,255,0.15); }
            .rating-box { font-size: 0.9rem; }
            
            .short-desc { 
              font-size: 0.9rem; 
              color: #94a3b8; 
              margin-bottom: 25px; 
              line-height: 1.6;
              max-width: 100%;
            }

            .features-row {
              justify-content: center;
              gap: 12px;
              margin-bottom: 30px;
            }
            .feature-item {
              font-size: 0.8rem;
              padding: 6px 12px;
              background: rgba(255,255,255,0.03);
            }

            /* STICKY ACTION BAR - Compact */
            .action-card {
              position: fixed;
              bottom: 16px; left: 16px; right: 16px;
              width: auto; max-width: none;
              background: rgba(15, 23, 42, 0.95);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 16px;
              padding: 12px 16px;
              z-index: 100;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              gap: 15px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }
            
            .qty-selector { 
              flex: 0 0 auto; 
              display: flex; gap: 8px;
              background: transparent;
              padding: 0;
              height: 44px;
              margin: 0;
            }
            
            .qty-btn { 
              width: 40px; height: 40px; 
              background: rgba(255,255,255,0.1); 
              color: white;
              border-radius: 10px;
              font-size: 1.2rem;
            }
            
            .qty-input { 
              width: 45px; height: 40px; 
              background: transparent;
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 10px;
              font-size: 1.1rem;
              color: white;
            }

            /* STICKY ACTION BAR - Compact Mobile */
            .action-card {
              position: fixed;
              bottom: 12px; left: 12px; right: 12px;
              width: auto; margin-top: 0;
              background: rgba(15, 23, 42, 0.95);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(255,255,255,0.1);
              padding: 10px;
              gap: 8px;
              justify-content: space-between;
              box-shadow: 0 -5px 20px rgba(0,0,0,0.4);
            }
            
            .qty-selector { 
              height: 36px; padding: 0;
              gap: 0;
              background: rgba(255,255,255,0.05);
            }
            .qty-btn { width: 30px; font-size: 1rem; }
            .qty-input { width: 30px; font-size: 0.9rem; }

            .add-cart-btn, .buy-now-btn {
              height: 36px;
              padding: 0 12px;
              font-size: 0.8rem; /* Smaller text for mobile */
              flex: 1;
              border-radius: 10px;
            }
            
            .add-cart-btn { background: rgba(255,255,255,0.1); }
            .buy-now-btn { box-shadow: none; }

            .tabs-container { margin-top: 20px; padding: 0 20px; }
            .tabs-header { gap: 15px; margin-bottom: 20px; justify-content: center; } 
            .tab-item { padding: 8px 16px; font-size: 0.9rem; }
            .spec-grid { gap: 0; }
         }

         /* RELATED PRODUCTS STYLES */
         .related-section { margin-top: 60px; padding-bottom: 20px; }
         .section-title { 
            font-size: 1.5rem; font-weight: 700; color: white; 
            margin-bottom: 20px; border-left: 4px solid var(--primary); 
            padding-left: 12px;
         }
         
         .related-scroll-container {
            display: flex; gap: 20px; overflow-x: auto; 
            padding-bottom: 20px; 
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
         }
         .related-scroll-container::-webkit-scrollbar { height: 6px; }
         .related-scroll-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 3px; }
         
         .related-card {
            min-width: 200px; max-width: 200px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            flex-shrink: 0;
         }
         .related-card:hover { 
            transform: translateY(-5px);
            background: rgba(255,255,255,0.05);
            border-color: var(--primary);
         }
         
         .related-img-box {
            width: 100%; height: 160px; 
            background: #fff; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 12px; overflow: hidden;
         }
         .related-img-box img { 
            width: 100%; height: 100%; object-fit: contain; 
            transition: transform 0.3s;
         }
         .related-card:hover .related-img-box img { transform: scale(1.05); }
         
         .related-info { text-align: left; }
         .related-title { 
            font-size: 0.95rem; color: #e2e8f0; font-weight: 600;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            margin-bottom: 6px;
         }
         .related-price { 
             font-size: 1.1rem; color: var(--primary); font-weight: 700; 
         }
         
         /* See More Card */
         .see-more-card {
            display: flex; align-items: center; justify-content: center;
            background: rgba(6, 182, 212, 0.1);
            border: 1px dashed var(--primary);
         }
         .see-more-content { text-align: center; color: var(--primary); }
         .see-more-text { font-size: 1.1rem; font-weight: 700; display: block; }
         .see-more-sub { font-size: 0.8rem; opacity: 0.8; display: block; }
         .see-more-icon { font-size: 2rem; margin-top: 5px; transition: transform 0.3s; }
         .see-more-card:hover .see-more-icon { transform: translateX(5px); }

         @media (max-width: 768px) {
            .related-card { min-width: 160px; max-width: 160px; }
            .related-img-box { height: 130px; }
            .section-title { font-size: 1.3rem; margin-bottom: 15px; }
         }
      `}</style>
    </div>
  );
}
