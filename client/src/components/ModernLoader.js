import React from 'react';

const ModernLoader = () => {
    return (
        <div className="modern-loader-container">
            <div className="tech-loader">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="core"></div>
            </div>
            <div className="loading-text">
                <span>L</span><span>O</span><span>A</span><span>D</span><span>I</span><span>N</span><span>G</span>
            </div>

            <style>{`
        .modern-loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 50vh;
            width: 100%;
            background: transparent;
        }

        .tech-loader {
            position: relative;
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
        }

        .ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid transparent;
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }

        .ring-1 {
            border-top: 3px solid var(--primary);
            border-left: 3px solid transparent;
            animation: spin 2s linear infinite;
        }

        .ring-2 {
            top: 10px; left: 10px; right: 10px; bottom: 10px;
            width: auto; height: auto;
            border-bottom: 3px solid #f472b6; /* Pink accent */
            border-right: 3px solid transparent;
            animation: spin-reverse 1.5s linear infinite;
        }

        .core {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 10px; height: 10px;
            background: var(--primary);
            border-radius: 50%;
            box-shadow: 0 0 20px var(--primary);
            animation: pulse 1s ease-in-out infinite alternate;
        }

        .loading-text {
            font-family: 'Space Mono', monospace;
            color: var(--primary);
            font-size: 0.9rem;
            letter-spacing: 4px;
            display: flex;
            gap: 2px;
        }

        .loading-text span {
            animation: fade 1.5s infinite;
            opacity: 0;
        }
        
        .loading-text span:nth-child(1) { animation-delay: 0.1s; }
        .loading-text span:nth-child(2) { animation-delay: 0.2s; }
        .loading-text span:nth-child(3) { animation-delay: 0.3s; }
        .loading-text span:nth-child(4) { animation-delay: 0.4s; }
        .loading-text span:nth-child(5) { animation-delay: 0.5s; }
        .loading-text span:nth-child(6) { animation-delay: 0.6s; }
        .loading-text span:nth-child(7) { animation-delay: 0.7s; }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
        }

        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }

        @keyframes fade {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default ModernLoader;
