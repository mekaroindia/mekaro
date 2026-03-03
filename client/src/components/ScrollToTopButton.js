import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    // Show button when page is scrolled down given distance
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    if (!isVisible || location.pathname === '/checkout') {
        return null;
    }

    return (
        <>
            <button onClick={scrollToTop} className="mobile-scroll-to-top">
                &lt;&lt;&lt; Scroll to top &gt;&gt;&gt;
            </button>

            <style>{`
        .mobile-scroll-to-top {
            display: none;
        }

        @media (max-width: 768px) {
            .mobile-scroll-to-top {
                display: block;
                position: fixed;
                bottom: 20px; /* Near bottom */
                left: 50%;
                transform: translateX(-50%);
                background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(10px);
                color: var(--primary);
                padding: 10px 20px;
                border-radius: 20px;
                border: 1px solid rgba(6, 182, 212, 0.3);
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
                z-index: 1000;
                transition: opacity 0.3s;
                opacity: 0.9;
                white-space: nowrap;
            }
            .mobile-scroll-to-top:active {
                background: rgba(15, 23, 42, 1);
                border-color: var(--primary);
            }
        }
      `}</style>
        </>
    );
}
