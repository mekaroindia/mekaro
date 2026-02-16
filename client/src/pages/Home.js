// src/pages/Home.js
import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Container from "../components/Container";
import ModernLoader from "../components/ModernLoader";
import API from "../api/axios";
import { CartContext } from "../context/CartContext";
import Footer from "../components/Footer";
import {
  FaShoppingCart, FaStar, FaMicrochip, FaPlane, FaBatteryFull, FaCube,
  FaWifi, FaMemory, FaCogs, FaDigitalTachograph, FaNetworkWired,
  FaTools, FaRobot, FaChargingStation, FaChevronLeft, FaChevronRight,
  FaSortAmountDown, FaChevronDown, FaLayerGroup
} from "react-icons/fa";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [added, setAdded] = useState({});
  const { addToCart } = useContext(CartContext);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const scrollContainerRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 300;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
    API.get("/api/categories/")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => console.error("Category fetch error:", err));
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get("q") || "";
  const categoryParam = new URLSearchParams(location.search).get("category");

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setCurrentPage(1); // Reset to page 1 on category change
    }
  }, [categoryParam]);

  // Sorting State
  const [sortBy, setSortBy] = useState("default");
  const [showMobileSort, setShowMobileSort] = useState(false);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);

    setAdded((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAdded((prev) => ({ ...prev, [product.id]: false }));
    }, 1400);
  };



  // ... existing useEffects ...

  const handleSort = (type) => {
    setSortBy(type);
    setCurrentPage(1); // Reset to page 1 on sort change
    setShowMobileSort(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of product grid
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Client-side filtering for category (since we fetch all? No, we need to paginate category too)
  // PROBLEM: If we filter client-side, pagination breaks. 
  // We must filter server-side.
  // UPDATED: Added category to dependency array and URL in useEffect above.

  // Wait, the previous useEffect didn't include category in URL! 
  // I need to add that.

  // Reworking useEffect to include category
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    let url = `/api/products/?page=${currentPage}`;
    if (query) url += `&q=${encodeURIComponent(query)}`;

    // Add Category Param
    if (selectedCategory && selectedCategory !== "All") {
      // We need category ID or Name? Backend checks category_id or title?
      // Backend: queryset.filter(category_id=category)
      // But selectedCategory is Name. We need to find ID from categories list.
      const catObj = categories.find(c => c.name === selectedCategory);
      if (catObj) {
        url += `&category=${catObj.id}`;
      }
    }

    // Add Ordering
    let ordering = "";
    if (sortBy === "price-low") ordering = "price";
    else if (sortBy === "price-high") ordering = "-price";

    if (ordering) url += `&ordering=${ordering}`;

    API.get(url)
      .then((res) => {
        if (!mounted) return;
        if (res.data.results) {
          setProducts(res.data.results);
          setTotalPages(Math.ceil(res.data.count / 18));
        } else {
          setProducts(res.data || []);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        setProducts([]);
        setLoading(false);
      });

    return () => { mounted = false; };
  }, [query, currentPage, sortBy, selectedCategory, categories]);

  // filteredProducts and sortedProducts are now just 'products' because backend does it.
  const displayProducts = products;

  // --- STYLES ---

  const heroStyle = {
    width: "100%",
    minHeight: "400px",
    background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg-darker) 100%)",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0px",
    color: "white",
    padding: "40px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid var(--glass-border)",
  };

  const heroTitle = {
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    fontWeight: "800",
    marginBottom: "16px",
    background: "linear-gradient(to right, #fff, var(--primary))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    filter: "drop-shadow(0 0 20px rgba(6, 182, 212, 0.3))",
  };

  const heroSubtitle = {
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    color: "var(--text-muted)",
    maxWidth: "600px",
    marginBottom: "32px",
    lineHeight: "1.6",
  };

  const ctaButton = {
    padding: "14px 32px",
    borderRadius: "12px",
    background: "var(--primary)",
    color: "#000",
    fontSize: "16px",
    fontWeight: "700",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 0 20px var(--primary-glow)",
  };

  // Grid and Card styles moved to CSS at bottom of file
  const gridStyle = {};
  const cardStyle = {};

  // Styles moved to CSS classes (product-grid, product-card, product-img-wrap)

  const addBtnStyle = {
    width: "100%",
    padding: "12px",
    background: "var(--bg-darker)",
    color: "var(--primary)",
    border: "1px solid var(--glass-border)",
    borderRadius: "12px",
    marginTop: "16px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  };

  const sortOptions = [
    { label: "Default", value: "default" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
    { label: "Top Rated", value: "rating" },
  ];

  return (
    <div style={{ background: "var(--bg-darker)", minHeight: "100vh" }}>
      <Navbar />
      <Container>
        {/* HERO SECTION */}
        <div style={heroStyle} className="hero-container">
          <div style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              url('/assets/neon_robotics_banner_v2.png') center/cover no-repeat
            `,
            filter: "brightness(0.6) contrast(1.2)",
            zIndex: 0
          }} />

          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            zIndex: 1,
            pointerEvents: "none"
          }} />

          <div style={{ position: "relative", zIndex: 10, maxWidth: "800px" }}>
            <div style={{
              display: "inline-block",
              background: "rgba(6, 182, 212, 0.1)",
              border: "1px solid var(--primary)",
              padding: "8px 16px",
              borderRadius: "50px",
              color: "var(--primary)",
              fontWeight: "700",
              fontSize: "14px",
              letterSpacing: "1px",
              marginBottom: "24px",
              boxShadow: "0 0 15px rgba(6, 182, 212, 0.3)",
              backdropFilter: "blur(4px)"
            }} className="hero-badge">
              FUTURE READY • 2026
            </div>

            <h1 style={heroTitle} className="hero-title">
              EXPERIENCE THE <br />
              <span style={{
                background: "linear-gradient(to right, #22d3ee, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(34, 211, 238, 0.5))"
              }}>NEON REVOLUTION</span>
            </h1>

            <p style={heroSubtitle} className="hero-subtitle">
              Discover premium electronics engineered for the next generation.
              Immersive audio, crystal-clear visuals, and smart connectivity.
            </p>

            <button
              style={ctaButton}
              className="hero-btn"
              onClick={() => document.getElementById("shop").scrollIntoView({ behavior: "smooth" })}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05) translateY(-2px)";
                e.target.style.boxShadow = "0 0 30px var(--primary-glow)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1) translateY(0)";
                e.target.style.boxShadow = "0 0 20px var(--primary-glow)";
              }}
            >
              Explore Collection
            </button>
          </div>
        </div>

        <div id="shop" style={{ paddingTop: "20px" }}></div>

        {/* CATEGORIES GRID */}
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{ width: "4px", height: "20px", background: "var(--primary)", borderRadius: "2px" }}></span>
            Categories
          </h2>

          <div style={{ position: "relative", padding: "0 20px" }}>
            {/* LEFT SCROLL BTN */}
            <button
              className="scroll-btn left"
              onClick={() => scroll("left")}
            >
              <FaChevronLeft />
            </button>

            <div className="category-scroll-container" ref={scrollContainerRef}>
              {/* ALL CATEGORIES BUTTON */}
              {/* ALL CATEGORIES BUTTON - Styled to match new cards */}
              <div
                className={`category-card ${selectedCategory === "All" ? "active" : ""}`}
                onClick={() => setSelectedCategory("All")}
              >
                <div className="category-icon">
                  <FaCube />
                </div>
                <span className="category-text">
                  All
                </span>
              </div>

              {categories.map((cat, index) => {
                const isActive = selectedCategory === cat.name;
                return (
                  <div
                    key={index}
                    className={`category-card ${isActive ? "active" : ""}`}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setCurrentPage(1); // Reset page on category click
                    }}
                  >
                    <div className="category-icon">
                      {categoryIcons[cat.name] || <FaCube />}
                    </div>

                    <span className="category-text">
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* RIGHT SCROLL BTN */}
            <button
              className="scroll-btn right"
              onClick={() => scroll("right")}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* SORT BAR */}
        <div className="sort-bar-container">
          {/* Desktop/Tablet Pills */}
          <div className="sort-options-wrapper desktop-sort">
            <span className="sort-label">Sort By:</span>
            {sortOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleSort(opt.value)}
                className={`sort-pill ${sortBy === opt.value ? 'active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Mobile Premium Custom Dropdown */}
          <div className="mobile-sort-container">
            {/* Trigger Box */}
            <div
              className={`mobile-sort-box ${showMobileSort ? 'active' : ''}`}
              onClick={() => setShowMobileSort(!showMobileSort)}
            >
              <FaSortAmountDown className="sort-icon" />
              <span className="current-sort-label">
                Sort: <span className="highlight">{sortOptions.find(o => o.value === sortBy)?.label}</span>
              </span>
              <FaChevronDown className={`dropdown-arrow ${showMobileSort ? 'open' : ''}`} />
            </div>

            {/* Custom Dropdown Menu */}
            {showMobileSort && (
              <>
                <div className="mobile-sort-backdrop" onClick={() => setShowMobileSort(false)} />
                <div className="mobile-sort-dropdown">
                  {sortOptions.map(opt => (
                    <div
                      key={opt.value}
                      className={`sort-option-item ${sortBy === opt.value ? 'selected' : ''}`}
                      onClick={() => handleSort(opt.value)}
                    >
                      {opt.label}
                      {sortBy === opt.value && <FaStar size={10} color="var(--primary)" />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>


        {/* PRODUCTS */}
        {
          loading ? (
            <ModernLoader />
          ) : (
            <div className="product-grid">
              {displayProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => navigate(`/product/${product.id}`)}
                // ... mouse events
                >
                  <div className="product-img-wrap">
                    <img
                      src={product.product_images?.length > 0 ? product.product_images[0].image : (product.images?.[0] || "https://via.placeholder.com/300x300?text=No+Image")}
                      alt={product.title}
                      style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px" }}
                    />
                    {/* Badge example */}
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(4px)",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <FaStar color="gold" size={10} /> 4.5
                    </div>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      margin: "0 0 8px",
                      color: "var(--text-main)",
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      height: "44px" // Fixed height for alignment
                    }}>
                      {product.title}
                    </h3>
                    <div style={{ marginTop: "auto" }}>
                      <span style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "var(--primary)"
                      }}>
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    style={{
                      ...addBtnStyle,
                      background: added[product.id] ? "var(--primary)" : "var(--bg-darker)",
                      color: added[product.id] ? "#000" : "var(--primary)",
                      borderColor: added[product.id] ? "var(--primary)" : "var(--glass-border)",
                    }}
                    onMouseEnter={(e) => {
                      if (!added[product.id]) {
                        e.target.style.background = "var(--primary)";
                        e.target.style.color = "#000";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!added[product.id]) {
                        e.target.style.background = "var(--bg-darker)";
                        e.target.style.color = "var(--primary)";
                      }
                    }}
                  >
                    <FaShoppingCart />
                    {added[product.id] ? "Added" : "Add to Cart"}
                  </button>
                </div>
              ))}
            </div>
          )}

        {/* PAGINATION CONTROLS */}
        {!loading && totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="page-btn prev"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <FaChevronLeft /> Prev
            </button>

            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                // Show valid range: current-2 to current+2, plus first and last
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <button
                      key={pageNum}
                      className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum} className="pagination-dots">...</span>;
                }
                return null;
              })}
            </div>

            <button
              className="page-btn next"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next <FaChevronRight />
            </button>
          </div>
        )}
      </Container >

      <Footer />

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* SORT BAR STYLES */
        .sort-bar-container {
           margin-bottom: 30px;
           padding: 10px 20px;
           background: rgba(255, 255, 255, 0.03);
           border: 1px solid var(--glass-border);
           border-radius: 12px;
           width: max-content; /* Fit content on desktop */
           max-width: 100%; /* Prevent overflow */
        }
        .sort-options-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 5px;
        }
        
        /* Mobile Elements Hidden by Default */
        .mobile-sort-container {
            display: none;
        }

        .sort-label {
            color: var(--text-muted);
            font-size: 14px;
            white-space: nowrap;
        }
        .sort-pill {
           background: transparent;
           border: 1px solid var(--glass-border);
           color: var(--text-muted);
           padding: 6px 16px;
           border-radius: 20px;
           cursor: pointer;
           font-size: 13px;
           transition: all 0.3s ease;
           white-space: nowrap;
        }
        .sort-pill:hover {
           background: rgba(255,255,255,0.05);
           color: white;
           border-color: rgba(255,255,255,0.3);
        }
        .sort-pill.active {
           background: var(--primary);
           color: black;
           border-color: var(--primary);
           font-weight: 700;
           box-shadow: 0 0 10px var(--primary-glow);
        }

        @media (max-width: 768px) {
           .sort-bar-container {
               margin: 0 -10px 20px -10px; 
               background: transparent; /* Remove bg for cleaner look */
               border: none;
               padding: 0 16px;
               position: relative;
               z-index: 50; /* Ensure on top for dropdown */
               width: auto; /* Reset width for mobile */
               max-width: none;
           }

           /* HIDE DESKTOP ELEMENTS STRICTLY */
           .desktop-sort {
               display: none !important;
           }
           
           /* SHOW MOBILE ELEMENTS */
           .mobile-sort-container {
               display: block;
               width: 100%;
               position: relative;
           }
           
           .mobile-sort-box {
               position: relative;
               width: 100%;
               height: 50px;
               background: rgba(15, 23, 42, 0.95);
               border: 1px solid var(--glass-border);
               border-radius: 12px;
               display: flex;
               align-items: center;
               justify-content: space-between;
               padding: 0 16px;
               box-shadow: 0 4px 20px rgba(0,0,0,0.2);
               transition: all 0.2s ease;
               cursor: pointer;
           }
           .mobile-sort-box:active, .mobile-sort-box.active {
               border-color: var(--primary);
               background: rgba(15, 23, 42, 1);
           }
           
            .sort-icon {
               color: var(--text-muted);
               font-size: 14px;
               margin-right: 12px;
            }
           
            .current-sort-label {
               flex: 1;
               font-size: 14px;
               color: var(--text-muted);
               font-weight: 500;
            }
            .current-sort-label .highlight {
               color: white;
               font-weight: 700;
               margin-left: 6px;
               color: var(--primary);
            }
 
            .dropdown-arrow {
               color: var(--text-muted);
               font-size: 12px;
               transition: transform 0.3s ease;
            }
            .dropdown-arrow.open {
                transform: rotate(180deg);
                color: var(--primary);
            }
            
            /* CUSTOM DROPDOWN STYLES */
            .mobile-sort-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                margin-top: 8px;
                background: #0f172a;
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                z-index: 100;
                animation: slideDown 0.2s ease-out;
            }
            .sort-option-item {
                padding: 14px 16px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                color: var(--text-muted);
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: pointer;
                transition: background 0.2s;
            }
            .sort-option-item:last-child {
                border-bottom: none;
            }
            .sort-option-item:active {
                background: rgba(255,255,255,0.05);
            }
            .sort-option-item.selected {
                color: var(--primary);
                font-weight: 700;
                background: rgba(6, 182, 212, 0.1);
            }

            .mobile-sort-backdrop {
                position: fixed;
                inset: 0;
                z-index: 90;
                background: rgba(0,0,0,0.2);
            }
            
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
 
            .sort-label {
               display: none; 
            }
 
            .sort-pill {
               display: none !important; /* Hide pills completely on mobile */
            }
         }

        /* CATEGORY STYLES */
        /* Desktop (Default) */
        .category-scroll-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .category-card {
           background: rgba(255, 255, 255, 0.03);
           border: 1px solid var(--glass-border);
           border-radius: 16px;
           padding: 16px;
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           gap: 12px;
           cursor: pointer;
           transition: all 0.3s ease;
           min-height: 140px;
           height: auto;
           text-align: center;
        }
        .category-card.active {
           background: rgba(6, 182, 212, 0.15);
           border-color: var(--primary);
           box-shadow: 0 0 25px rgba(6, 182, 212, 0.25);
        }
        .category-card:hover:not(.active) {
           border-color: var(--primary);
           transform: translateY(-5px);
           background: rgba(255, 255, 255, 0.05);
           box-shadow: 0 8px 25px -5px rgba(6, 182, 212, 0.3);
        }
        .category-icon {
           font-size: 32px;
           color: var(--text-muted);
           transition: all 0.3s ease;
        }
        .category-card.active .category-icon {
           color: var(--primary);
           filter: drop-shadow(0 0 10px var(--primary));
        }
        .category-text {
           font-size: 12px;
           font-weight: 600;
           color: var(--text-muted);
           line-height: 1.4;
           word-break: break-word;
        }
        .category-card.active .category-text {
           color: #fff;
        }

        /* MOBILE OVERRIDES (Flipkart Style) */
        @media (max-width: 768px) {
           .category-scroll-container {
             display: flex;
             overflow-x: auto;
             padding-bottom: 10px;
             gap: 12px;
             margin-right: -20px; /* Offset container padding if needed, adjust based on container */
             grid-template-columns: none; /* Reset grid */
             scrollbar-width: none; /* Firefox */
             -ms-overflow-style: none;  /* IE 10+ */
           }
           .category-scroll-container::-webkit-scrollbar { 
             display: none; /* Chrome/Safari */
           }
           
           .category-card {
             min-width: 80px;
             width: 80px;
             min-height: auto;
             height: auto;
             padding: 10px;
             border-radius: 12px;
             background: transparent; /* Cleaner look on mobile */
             border: none;
             box-shadow: none !important;
           }
           .category-card.active {
             background: transparent;
             border: none;
             box-shadow: none;
           }
           .category-card .category-icon {
             font-size: 24px;
             margin-bottom: 4px;
             background: rgba(255,255,255,0.05); /* Circle bg for icon */
             width: 48px;
             height: 48px;
             display: flex;
             align-items: center;
             justify-content: center;
             border-radius: 50%; /* Circular icon container */
             color: var(--primary);
           }
           .category-card.active .category-icon {
             background: var(--primary);
             color: black;
           }
           .category-text {
             font-size: 11px;
             color: #ccc;
             white-space: nowrap; /* Keep text on one line if possible or wrap tightly? Screenshot has labels below. */
             word-break: normal;
             white-space: normal; /* Let it wrap if two words */
             line-height: 1.2;
           }
           .category-card.active .category-text {
             color: white;
             font-weight: 700;
           }
        }

        /* SCROLL BUTTONS */
        .scroll-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%); /* Center vertically */
          z-index: 10;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--glass-border);
          color: var(--primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .scroll-btn:hover {
          background: var(--primary);
          color: #000;
          box-shadow: 0 0 15px var(--primary-glow);
        }
        .scroll-btn.left { left: -10px; }
        .scroll-btn.right { right: -10px; }

        @media (max-width: 768px) {
           .scroll-btn {
              width: 32px; height: 32px; font-size: 14px;
           }
           .scroll-btn.left { left: 0; }
           .scroll-btn.right { right: 0; }
        }

        /* PRODUCT GRID */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); /* Reduced for 4-5 items per row */
          gap: 24px; /* Tighter gap */
          padding-bottom: 60px;
        }

        .product-card {
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          padding: 12px; /* Inner padding for "organized" look */
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
          height: 100%; 
          cursor: pointer;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
          border-color: var(--primary-glow);
        }

        .product-img-wrap {
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          height: 180px; /* Greatly reduced from 280px */
          width: 100%;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        /* MOBILE PRODUCT GRID UPDATES */
        @media (max-width: 768px) {
           .product-grid {
             grid-template-columns: repeat(2, 1fr); 
             gap: 12px;
             margin: 0 -10px;
           }
           
           .product-card {
             border-radius: 12px;
             padding: 8px; /* Even smaller padding on mobile */
           }

           .product-img-wrap {
             height: 140px; 
             margin-bottom: 8px;
             border-radius: 10px;
           }

           .product-card img {
             padding: 5px !important;
           }
           
           .product-card h3 {
             font-size: 13px !important;
             margin-bottom: 4px !important;
             line-height: 1.3 !important;
             display: -webkit-box;
             -webkit-line-clamp: 2;
             -webkit-box-orient: vertical;
             overflow: hidden;
             height: 34px; 
           }

           .product-card button {
             padding: 8px !important;
             font-size: 11px !important;
             width: 100%;
             margin-top: 8px; 
           }

           .product-card span {
              font-size: 14px !important;
           }
            .spec-grid { gap: 0; }
            
            /* HERO MOBILE OPTIMIZATION */
            .hero-container {
               min-height: 360px !important;
               padding: 16px !important;
               display: flex; flex-direction: column; justify-content: center;
            }
            .hero-badge {
               font-size: 11px !important;
               padding: 6px 12px !important;
               margin-bottom: 16px !important;
            }
            .hero-title {
               font-size: 1.4rem !important;
               line-height: 1.1 !important;
               margin-bottom: 12px !important;
            }
            .hero-subtitle {
               font-size: 0.8rem !important;
               margin-bottom: 20px !important;
               line-height: 1.5 !important;
            }
            .hero-btn {
               padding: 10px 24px !important;
               font-size: 14px !important;
            }
        }
      `}</style>
    </div >
  );
}
