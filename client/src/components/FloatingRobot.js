import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function FloatingRobot() {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [dynamicScale, setDynamicScale] = useState(0.15);
    const navigate = useNavigate();

    useEffect(() => {
        const updateScale = () => {
            // Smoothly scale the robot down based on screen width
            // This prevents sudden jumps from media queries and ensures it scales proportionally
            const calculatedScale = Math.max(0.5, Math.min(0.4, window.innerWidth / 4000));
            setDynamicScale(calculatedScale);
        };

        updateScale(); // Set initial scale
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const handleClick = () => {
        setIsClicked(true);
        setTimeout(() => {
            setIsClicked(false);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login first to use the AI Assistant!");
                navigate('/login');
            } else {
                navigate('/chat');
            }
        }, 300);
    };

    const location = useLocation();
    if (location.pathname === '/chat') {
        return null;
    }

    return (
        <div
            className="robot-scaler-wrapper"
            style={{ transform: `scale(${dynamicScale})` }}
        >
            <div
                className={`advanced-robot-container ${isClicked ? 'bot-clicked' : ''}`}
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Chat Tag */}
                <div className={`chat-tag ${isHovered ? 'tag-hovered' : ''}`}>
                    Chat with Assistant
                </div>

                <div className={`robot-core ${isHovered ? 'hover-engaged' : ''}`}>
                    {/* Holographic Aura */}
                    <div className="holo-aura"></div>

                    {/* Antenna */}
                    <div className="bot-antenna">
                        <div className="antenna-stem"></div>
                        <div className="antenna-bulb"></div>
                        <div className="signal-ring"></div>
                    </div>

                    {/* Main Head / Body */}
                    <div className="bot-head">
                        <div className="forehead-plate"></div>

                        {/* Eyes Screen */}
                        <div className="visor">
                            <div className="scan-line"></div>
                            <div className="eye left-eye">
                                <div className="pupil"></div>
                            </div>
                            <div className="eye right-eye">
                                <div className="pupil"></div>
                            </div>
                        </div>

                        {/* Mouth/Voicebox */}
                        <div className="voice-box">
                            <span></span><span></span><span></span><span></span>
                        </div>
                    </div>

                    {/* Rotating Ear Nodes */}
                    <div className="ear-node left-ear">
                        <div className="inner-gear"></div>
                    </div>
                    <div className="ear-node right-ear">
                        <div className="inner-gear"></div>
                    </div>

                    {/* Bottom Thruster */}
                    <div className="bot-thruster">
                        <div className="flame main-flame"></div>
                        <div className="flame core-flame"></div>
                    </div>
                </div>

                <style>{`
                .robot-scaler-wrapper {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                    transform-origin: bottom right;
                    transition: transform 0.1s ease-out;
                }

                @media (min-width: 768px) {
                    .robot-scaler-wrapper {
                        bottom: 30px;
                        right: 30px;
                    }
                }

                .advanced-robot-container {
                    cursor: pointer;
                    animation: floatOrbit 4s ease-in-out infinite;
                    filter: drop-shadow(0 15px 10px rgba(0,0,0,0.4));
                    display: flex;
                    flex-direction: column; /* Stack chat tag ABOVE the robot */
                    align-items: center;
                    gap: 15px;
                }

                .chat-tag {
                    background: rgba(15, 23, 42, 0.85);
                    border: 1px solid rgba(6, 182, 212, 0.5);
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 20px; /* Fully rounded top and bottom corners */
                    font-size: 16px; /* Slightly larger text to compensate for container scale */
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3), 0 0 10px rgba(6, 182, 212, 0.2);
                    backdrop-filter: blur(4px);
                    opacity: 0.8;
                    transform: translateY(10px);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                    animation: floatBobVertical 3s infinite ease-in-out alternate;
                    white-space: nowrap;
                }

                /* Downward pointing arrow securely attached to the bottom */
                .chat-tag::after {
                    content: '';
                    position: absolute;
                    bottom: -8px; /* Stick out the bottom */
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 8px solid rgba(15, 23, 42, 0.85); /* Pointing down */
                }

                .chat-tag.tag-hovered {
                    opacity: 1;
                    transform: translateY(0) scale(1.05); /* Pop up */
                    border-color: rgba(34, 197, 94, 0.8);
                    box-shadow: 0 5px 20px rgba(0,0,0,0.5), 0 0 15px rgba(34, 197, 94, 0.4);
                    color: #22c55e;
                }
                
                .chat-tag.tag-hovered::after {
                    border-top-color: rgba(15, 23, 42, 0.95);
                }

                @keyframes floatBobVertical {
                    from { transform: translateY(10px); }
                    to { transform: translateY(5px); }
                }

                .chat-tag.tag-hovered {
                    animation: none;
                }

                /* Mobile specific styles removed in favor of dynamic viewport scaling */

                .bot-clicked {
                    animation: clickBounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
                }

                .robot-core {
                    position: relative;
                    width: 70px;
                    height: 70px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .robot-core.hover-engaged {
                    transform: scale(1.15) translateY(-10px);
                }

                /* ---- HOLOGRAPHIC AURA ---- */
                .holo-aura {
                    position: absolute;
                    inset: -20px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
                    z-index: -1;
                    animation: pulseAura 2s ease-in-out infinite alternate;
                }
                .hover-engaged .holo-aura {
                    background: radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, transparent 70%);
                    animation: fastPulseAura 0.5s ease-in-out infinite alternate;
                }

                /* ---- ANTENNA ---- */
                .bot-antenna {
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 5;
                }
                .antenna-bulb {
                    width: 12px;
                    height: 12px;
                    background: #facc15;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #facc15, inset -2px -2px 0px rgba(0,0,0,0.2);
                    position: relative;
                    z-index: 2;
                }
                .hover-engaged .antenna-bulb {
                    background: #22c55e;
                    box-shadow: 0 0 15px #22c55e, 0 0 30px #22c55e;
                }
                .antenna-stem {
                    width: 4px;
                    height: 18px;
                    background: linear-gradient(to bottom, #94a3b8, #475569);
                    margin-top: -2px;
                }
                .signal-ring {
                    position: absolute;
                    top: -5px;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #22c55e;
                    border-radius: 50%;
                    opacity: 0;
                }
                .hover-engaged .signal-ring {
                    animation: emitSignal 1s infinite;
                }

                /* ---- HEAD / BODY ---- */
                .bot-head {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(145deg, #e2e8f0, #94a3b8);
                    border-radius: 25px 25px 20px 20px;
                    box-shadow: inset -5px -5px 15px rgba(0,0,0,0.3), inset 5px 5px 15px rgba(255,255,255,0.7), 0 10px 20px rgba(0,0,0,0.5);
                    z-index: 3;
                    overflow: hidden;
                    border: 2px solid #cbd5e1;
                }
                
                .forehead-plate {
                    position: absolute;
                    top: 5px; left: 50%;
                    transform: translateX(-50%);
                    width: 30px;
                    height: 4px;
                    background: rgba(0,0,0,0.1);
                    border-radius: 4px;
                }

                /* ---- VISOR & EYES ---- */
                .visor {
                    position: absolute;
                    top: 18px; left: 8px; right: 8px; height: 30px;
                    background: #020617;
                    border-radius: 12px;
                    box-shadow: inset 0 5px 10px rgba(0,0,0,0.8), 0 2px 0 rgba(255,255,255,0.3);
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    overflow: hidden;
                }
                .scan-line {
                    position: absolute;
                    top: 0; left: 0; right: 0; height: 2px;
                    background: rgba(6, 182, 212, 0.8);
                    box-shadow: 0 0 8px var(--primary);
                    opacity: 0.5;
                    animation: scanning 3s linear infinite;
                    z-index: 2;
                }
                .eye {
                    width: 14px;
                    height: 14px;
                    background: var(--primary);
                    border-radius: 5px; /* Squarish cute eyes */
                    box-shadow: 0 0 10px var(--primary), 0 0 20px var(--primary);
                    position: relative;
                    animation: blink 4s infinite;
                }
                .hover-engaged .eye {
                    height: 18px; /* Eyes widen slightly */
                    border-radius: 50%; /* Become completely round when excited */
                    background: #22c55e;
                    box-shadow: 0 0 15px #22c55e, 0 0 30px #22c55e;
                }
                .pupil {
                    position: absolute;
                    top: 2px; right: 2px;
                    width: 4px; height: 4px;
                    background: white;
                    border-radius: 50%;
                }

                /* ---- VOICE BOX ---- */
                .voice-box {
                    position: absolute;
                    bottom: 8px; left: 50%;
                    transform: translateX(-50%);
                    display: flex; gap: 3px;
                }
                .voice-box span {
                    width: 4px; height: 4px;
                    background: #64748b;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                .hover-engaged .voice-box span {
                    background: var(--primary);
                    box-shadow: 0 0 5px var(--primary);
                    animation: speakBox 0.5s infinite alternate;
                }
                .hover-engaged .voice-box span:nth-child(2) { animation-delay: 0.1s; }
                .hover-engaged .voice-box span:nth-child(3) { animation-delay: 0.2s; }
                .hover-engaged .voice-box span:nth-child(4) { animation-delay: 0.3s; }

                /* ---- EARS / GEARS ---- */
                .ear-node {
                    position: absolute;
                    top: 25px;
                    width: 14px; height: 24px;
                    background: #cbd5e1;
                    border-radius: 4px;
                    z-index: 2;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
                }
                .left-ear { left: -8px; border-radius: 8px 0 0 8px; border-left: 2px solid #94a3b8; }
                .right-ear { right: -8px; border-radius: 0 8px 8px 0; border-right: 2px solid #94a3b8; }
                
                .inner-gear {
                    width: 6px; height: 14px;
                    background: #475569;
                    border-radius: 2px;
                }
                .hover-engaged .inner-gear {
                    animation: spinGear 0.5s linear infinite;
                }

                /* ---- THRUSTER ---- */
                .bot-thruster {
                    position: absolute;
                    bottom: -15px; left: 50%;
                    transform: translateX(-50%);
                    width: 24px; height: 20px;
                    background: #334155;
                    border-radius: 0 0 12px 12px;
                    z-index: 1;
                    display: flex; justify-content: center;
                    box-shadow: inset 0 5px 5px rgba(0,0,0,0.6);
                }
                .flame {
                    position: absolute;
                    bottom: -18px;
                    border-radius: 50% 50% 20% 20%;
                    filter: blur(2px);
                    transform-origin: top;
                }
                .main-flame {
                    width: 18px; height: 25px;
                    background: var(--primary);
                    animation: burn 0.1s infinite alternate;
                }
                .core-flame {
                    width: 10px; height: 15px;
                    background: white;
                    animation: burn 0.05s infinite alternate;
                }
                .hover-engaged .main-flame {
                    height: 40px;
                    background: #facc15;
                    box-shadow: 0 10px 20px #facc15;
                }
                .hover-engaged .core-flame {
                    height: 25px;
                }

                /* ---- KEYFRAMES ---- */
                @keyframes floatOrbit {
                    0% { transform: translateY(0) rotate(-2deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                    100% { transform: translateY(0) rotate(-2deg); }
                }
                @keyframes clickBounce {
                    0% { transform: scale(1.15) translateY(-10px); }
                    50% { transform: scale(0.9) translateY(0); }
                    100% { transform: scale(1.15) translateY(-10px); }
                }
                @keyframes pulseAura {
                    from { opacity: 0.5; transform: scale(0.9); }
                    to { opacity: 0.8; transform: scale(1.1); }
                }
                @keyframes fastPulseAura {
                    from { opacity: 0.8; transform: scale(1.1); }
                    to { opacity: 1; transform: scale(1.3); }
                }
                @keyframes emitSignal {
                    0% { opacity: 1; transform: scale(0.5); }
                    100% { opacity: 0; transform: scale(2.5); border-width: 0px; }
                }
                @keyframes scanning {
                    0% { top: 0; }
                    50% { top: 28px; }
                    100% { top: 0; }
                }
                @keyframes blink {
                    0%, 96%, 98% { transform: scaleY(1); }
                    97% { transform: scaleY(0.1); }
                }
                @keyframes spinGear {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(180deg); }
                }
                @keyframes burn {
                    from { transform: scaleY(0.9); opacity: 0.8; }
                    to { transform: scaleY(1.1); opacity: 1; }
                }
                @keyframes speakBox {
                    from { transform: scaleY(1); }
                    to { transform: scaleY(2); }
                }
            `}</style>
            </div>
        </div>
    );
}
