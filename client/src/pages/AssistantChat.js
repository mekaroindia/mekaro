import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FaPaperPlane, FaRobot, FaUser, FaTimes, FaCircle, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import API from '../api/axios';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const AssistantChat = () => {
    const [messages, setMessages] = useState([
        {
            text: "Hello! I am your AI assistant. How can I help you with your projects, mechanical robotics, or any other inquiries today?",
            isBot: true
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [systemContext, setSystemContext] = useState('');
    const [isContextLoading, setIsContextLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Fetch user and order context, and check for API key
    useEffect(() => {
        if (!process.env.REACT_APP_GEMINI_API_KEY) {
            setError("API Key Missing! Please add REACT_APP_GEMINI_API_KEY to your client/.env file.");
            setIsContextLoading(false);
            return;
        }

        const fetchContext = async () => {
            try {
                // We're protected, so we should have a token
                const [userRes, ordersRes] = await Promise.all([
                    API.get('/api/user/').catch(() => ({ data: {} })),
                    API.get('/api/orders/my-orders/').catch(() => ({ data: [] }))
                ]);

                const user = userRes.data;
                const orders = ordersRes.data;

                let orderContext = "User has no previous orders.";
                if (orders && orders.length > 0) {
                    orderContext = "User's Recent Orders:\\n" + orders.slice(0, 5).map(o =>
                        `- Order ID: ${o.order_id || o.id}, Status: ${o.status}, Total: ₹${o.total_amount}, Date: ${new Date(o.created_at).toLocaleDateString()}`
                    ).join('\\n');
                }

                const instructions = `
You are the Mekaro AI Assistant, an expert in electrical/electronic gadgets, mechanical robotics, and innovative engineering projects. You are highly friendly, professional, and app-centric.
You belong to the e-commerce platform "Mekaro".

Current User Context:
- Name: ${user.first_name || 'User'} ${user.last_name || ''}
- Email: ${user.email || 'Unknown'}

${orderContext}

Guidelines:
1. Greet the user by their name if appropriate.
2. If they ask about their orders, use the exact Order ID and Status provided in your context.
3. If they want to track an order (or ask "where is my order"), advise them to go to the "Track Order" page or visit their Profile -> My Orders section where they can click the Track icon. Give them their Order ID so they can copy it.
4. If they ask about products, explain that Mekaro offers top-tier drones, 3D printers, microcontrollers, development boards, and sensors for robotics.
5. Keep recommendations practical and tailored to robotics and electronics.
6. **NAVIGATION CAPABILITY**: You have the power to navigate the user directly to pages in the app. If the user explicitly asks to "go to", "take me to", or "navigate to" a specific page, you MUST include a special routing tag at the very end of your response: \`[ROUTE:path]\`. 
   Here are the allowed paths you can use:
   - Home: \`[ROUTE:/]\`
   - About: \`[ROUTE:/about]\`
   - Contact: \`[ROUTE:/contact]\`
   - Profile: \`[ROUTE:/Profile]\`
   - Track Order: \`[ROUTE:/track-order]\`
   - Cart: \`[ROUTE:/cart]\`
   - My Orders: \`[ROUTE:/my_orders]\`
   - Projects: \`[ROUTE:/projects]\`
   - Workshops: \`[ROUTE:/workshops]\`
   Example response: "I'd be happy to take you to your profile![ROUTE:/Profile]"
                `;
                setSystemContext(instructions);
            } catch (err) {
                console.error("Failed to load context", err);
            } finally {
                setIsContextLoading(false);
            }
        };

        fetchContext();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleDownloadPDF = async () => {
        const chatContainer = document.getElementById('chat-messages-container');
        if (!chatContainer) return;

        setIsDownloading(true);
        toast.info("Generating PDF, please wait...", { autoClose: 2000 });

        // Save original styles
        const originalOverflow = chatContainer.style.overflow;
        const originalHeight = chatContainer.style.height;
        const originalMaxHeight = chatContainer.style.maxHeight;

        // Temporarily expand strictly for capturing full scroll content
        chatContainer.style.overflow = 'visible';
        chatContainer.style.height = 'auto';
        chatContainer.style.maxHeight = 'none';

        try {
            const canvas = await html2canvas(chatContainer, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0f172a'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            // Calculate height of the image based on A4 width aspect ratio
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('mekaro-chat-history.pdf');
            toast.success("Chat downloaded successfully!");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Failed to generate PDF");
        } finally {
            // Restore styles
            chatContainer.style.overflow = originalOverflow;
            chatContainer.style.height = originalHeight;
            chatContainer.style.maxHeight = originalMaxHeight;
            setIsDownloading(false);
        }
    };

    const handleSend = async (e) => {
        e?.preventDefault();

        if (!input.trim() || !process.env.REACT_APP_GEMINI_API_KEY) return;

        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { text: userText, isBot: false }]);
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
            // Using the stable 2.0 flash model
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: systemContext || "You are the Mekaro AI Assistant, an expert in electrical gadgets and robotics."
            });

            // Structure previous messages for context
            // Google Gemini API STRICTLY requires history to start with a 'user' role
            // Since our very first message is from the 'model' (Hello!), we must exclude it.
            // It also strictly requires alternating roles, but excluding the first is enough since the rest naturally alternate User -> Model.
            const history = messages.slice(1).map(msg => ({
                role: msg.isBot ? "model" : "user",
                parts: [{ text: msg.text }],
            }));

            // Let the API decide the maximum output tokens naturally for full, unrestrained answers
            const chat = model.startChat({
                history: history,
            });

            const result = await chat.sendMessage(userText);
            let responseText = result.response.text();

            // Intercept routing commands
            const routeRegex = /\[ROUTE:(.*?)\]/;
            const match = responseText.match(routeRegex);

            if (match && match[1]) {
                const targetRoute = match[1];
                // Remove the tag so the user doesn't see it
                responseText = responseText.replace(routeRegex, '').trim();

                // Navigate after a brief delay so the user can read the confirmation message
                setTimeout(() => {
                    navigate(targetRoute);
                }, 1500);
            }

            setMessages(prev => [...prev, { text: responseText, isBot: true }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                text: "I'm having trouble connecting to my neural network right now. Please try again later.",
                isBot: true,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="chat-page-container">
                <div className="chat-modal">
                    <div className="chat-header">
                        <div className="header-info">
                            <div className="robot-avatar">
                                <FaRobot />
                            </div>
                            <div>
                                <h2>AI Assistant</h2>
                                <p className="status"><FaCircle className="online-icon" /> Online</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <button
                                onClick={handleDownloadPDF}
                                disabled={isDownloading || messages.length <= 1}
                                className="download-btn"
                            >
                                <FaDownload /> <span className="hide-on-mobile">{isDownloading ? "Saving..." : "Save PDF"}</span>
                            </button>
                            <button className="close-btn" onClick={() => navigate(-1)}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    <div className="chat-messages" id="chat-messages-container">
                        {error && (
                            <div className="api-error-banner">
                                {error}
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-wrapper ${msg.isBot ? 'bot-wrapper' : 'user-wrapper'}`}>
                                <div className="message-icon">
                                    {msg.isBot ? <FaRobot /> : <FaUser />}
                                </div>
                                <div className={`message-bubble ${msg.isBot ? 'bot-bubble' : 'user-bubble'} ${msg.isError ? 'error-bubble' : ''}`}>
                                    {msg.isBot && !msg.isError ? (
                                        <div className="markdown-content">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.text.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {line}
                                                {i !== msg.text.split('\n').length - 1 && <br />}
                                            </React.Fragment>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-wrapper bot-wrapper">
                                <div className="message-icon"><FaRobot /></div>
                                <div className="message-bubble bot-bubble typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-form" onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isContextLoading ? "Connecting to Mekaro networks..." : "Type your message here..."}
                            disabled={isLoading || isContextLoading || !process.env.REACT_APP_GEMINI_API_KEY}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || isContextLoading || !input.trim() || !process.env.REACT_APP_GEMINI_API_KEY}
                            className="send-btn"
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>

                <style>{`
                .chat-page-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
                    padding: 10px;
                }

                .chat-modal {
                    width: 100%;
                    max-width: 800px;
                    height: 80vh;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(6, 182, 212, 0.3);
                    border-radius: 20px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chat-header {
                    padding: 20px;
                    background: rgba(30, 41, 59, 0.8);
                    border-bottom: 1px solid rgba(6, 182, 212, 0.3);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .robot-avatar {
                    width: 45px;
                    height: 45px;
                    background: #020617;
                    border: 2px solid var(--primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    font-size: 20px;
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
                }

                .chat-header h2 {
                    margin: 0;
                    color: #fff;
                    font-size: 1.5rem;
                    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
                }

                .status {
                    margin: 0;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .online-icon {
                    color: #22c55e;
                    font-size: 10px;
                    animation: pulseOnline 2s infinite;
                }

                @keyframes pulseOnline {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 24px;
                    cursor: pointer;
                    transition: color 0.3s;
                }
                
                .close-btn:hover {
                    color: #ef4444;
                }

                .download-btn {
                    background: transparent;
                    border: 1px solid var(--primary);
                    color: var(--primary);
                    padding: 6px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .download-btn:hover:not(:disabled) {
                    background: rgba(6, 182, 212, 0.1);
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
                }

                .download-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    border-color: #475569;
                    color: #94a3b8;
                }
                
                .hide-on-mobile { display: inline; }

                .api-error-banner {
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid #ef4444;
                    color: #fca5a5;
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                /* Custom Scrollbar for messages */
                .chat-messages::-webkit-scrollbar {
                    width: 8px;
                }
                .chat-messages::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.5);
                }
                .chat-messages::-webkit-scrollbar-thumb {
                    background: var(--primary);
                    border-radius: 4px;
                }

                .message-wrapper {
                    display: flex;
                    align-items: flex-end;
                    gap: 10px;
                    max-width: 80%;
                }

                .user-wrapper {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }

                .bot-wrapper {
                    align-self: flex-start;
                }

                .message-icon {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .user-wrapper .message-icon {
                    background: #334155;
                    color: #cbd5e1;
                }

                .bot-wrapper .message-icon {
                    background: #020617;
                    color: var(--primary);
                    border: 1px solid var(--primary);
                }

                .message-bubble {
                    padding: 15px 20px;
                    border-radius: 20px;
                    font-size: 15px;
                    line-height: 1.5;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    position: relative;
                    word-wrap: break-word; /* ensure long code strings wrap nicely */
                }

                .user-bubble {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border-bottom-right-radius: 5px;
                    white-space: pre-wrap; /* preserve newlines for user input */
                }

                .bot-bubble {
                    background: rgba(30, 41, 59, 0.8);
                    color: #e2e8f0;
                    border: 1px solid rgba(6, 182, 212, 0.2);
                    border-bottom-left-radius: 5px;
                }
                
                .error-bubble {
                    border-color: #ef4444;
                    color: #fca5a5;
                }

                /* Markdown Styling */
                .markdown-content {
                    white-space: normal; /* Override any pre-wrap */
                }
                .markdown-content p {
                    margin-bottom: 10px;
                    line-height: 1.5;
                    margin-top: 0;
                }
                .markdown-content p:last-child {
                    margin-bottom: 0;
                }
                .markdown-content ul, .markdown-content ol {
                    margin-top: 0;
                    margin-bottom: 10px;
                    padding-left: 20px;
                }
                .markdown-content li {
                    margin-bottom: 4px;
                }
                .markdown-content li > p {
                    margin-bottom: 0;
                }
                .markdown-content strong {
                    font-weight: 700;
                    color: #fff;
                }
                .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 {
                    color: #fff;
                    margin-top: 15px;
                    margin-bottom: 8px;
                    font-weight: 700;
                }
                .markdown-content h1 { font-size: 1.4rem; }
                .markdown-content h2 { font-size: 1.2rem; }
                .markdown-content h3 { font-size: 1.1rem; }
                .markdown-content a {
                    color: var(--primary);
                    text-decoration: underline;
                }
                .markdown-content code {
                    background: rgba(0,0,0,0.4);
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-family: 'Fira Code', monospace;
                    font-size: 0.9em;
                }
                .markdown-content pre {
                    background: rgba(0,0,0,0.5);
                    padding: 12px;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin-bottom: 15px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .markdown-content pre code {
                    background: transparent;
                    padding: 0;
                    border-radius: 0;
                }
                .markdown-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                .markdown-content th, .markdown-content td {
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 8px 12px;
                    text-align: left;
                }
                .markdown-content th {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                .markdown-content blockquote {
                    border-left: 4px solid var(--primary);
                    margin: 0 0 15px 0;
                    padding-left: 15px;
                    color: #94a3b8;
                    font-style: italic;
                }

                .chat-input-form {
                    padding: 20px;
                    background: rgba(30, 41, 59, 0.8);
                    border-top: 1px solid rgba(6, 182, 212, 0.3);
                    display: flex;
                    gap: 15px;
                }

                .chat-input-form input {
                    flex: 1;
                    background: rgba(15, 23, 42, 0.8);
                    border: 1px solid rgba(148, 163, 184, 0.3);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 30px;
                    font-size: 16px;
                    outline: none;
                    transition: border-color 0.3s, box-shadow 0.3s;
                }

                .chat-input-form input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
                }
                
                .chat-input-form input:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .send-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: #020617;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    cursor: pointer;
                    transition: transform 0.2s, background-color 0.2s;
                    flex-shrink: 0;
                }

                .send-btn:hover:not(:disabled) {
                    transform: scale(1.1);
                    background: #22d3ee;
                    box-shadow: 0 0 15px var(--primary);
                }

                .send-btn:disabled {
                    background: #475569;
                    cursor: not-allowed;
                }

                /* Typing Indicator */
                .typing-indicator {
                    display: flex;
                    gap: 5px;
                    padding: 15px 20px;
                    align-items: center;
                }
                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    background: var(--primary);
                    border-radius: 50%;
                    animation: typeBounce 1.4s infinite ease-in-out both;
                }
                .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
                .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
                @keyframes typeBounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }

                @media (max-width: 768px) {
                    .hide-on-mobile { display: none; }
                    .download-btn { padding: 6px; font-size: 1.1rem; border: none; background: rgba(6, 182, 212, 0.1); }
                    
                    .chat-page-container {
                        position: absolute;
                        top: 115px; /* Precise clearance for tall mobile Navbar */
                        left: 0;
                        right: 0;
                        bottom: 0;
                        min-height: calc(100vh - 115px);
                        height: calc(100vh - 115px);
                        padding: 0;
                        margin: 0;
                        display: flex;
                        flex-direction: column;
                        background: #020617; /* Solid dark background */
                        z-index: 999;
                        overflow: hidden;
                    }
                    .chat-modal {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        width: 100%;
                        height: 100%;
                        max-width: none;
                        max-height: none;
                        border-radius: 0;
                        border: none;
                        margin: 0;
                        padding: 0;
                        padding-bottom: env(safe-area-inset-bottom, 10px);
                        box-shadow: none;
                        background: transparent;
                        overflow: hidden;
                    }
                    .chat-header {
                        padding: 12px 15px;
                        border-radius: 0;
                        background: rgba(30, 41, 59, 1);
                        border-bottom: 1px solid rgba(6, 182, 212, 0.2);
                    }
                    .robot-avatar {
                        width: 32px;
                        height: 32px;
                        font-size: 14px;
                    }
                    .chat-header h2 {
                        font-size: 1.1rem;
                    }
                    .status {
                        font-size: 0.75rem;
                    }
                    .close-btn {
                        font-size: 18px;
                    }
                    .chat-messages {
                        flex: 1;
                        min-height: 0; /* CRITICAL for Flexbox scrolling */
                        padding: 15px 12px;
                        gap: 15px;
                        overflow-y: auto;
                    }
                    .message-wrapper {
                        max-width: 90%;
                        gap: 8px;
                    }
                    .message-icon {
                        width: 24px;
                        height: 24px;
                        font-size: 11px;
                    }
                    .message-bubble {
                        padding: 10px 14px;
                        font-size: 14px;
                        line-height: 1.4;
                        border-radius: 12px;
                    }
                    .chat-input-form {
                        flex-shrink: 0; /* CRITICAL to prevent squishing or hiding */
                        padding: 10px;
                        gap: 8px;
                        background: rgba(30, 41, 59, 1);
                        border-top: 1px solid rgba(6, 182, 212, 0.2);
                    }
                    .chat-input-form input {
                        padding: 12px 16px;
                        font-size: 14px;
                    }
                    .send-btn {
                        width: 42px;
                        height: 42px;
                        font-size: 16px;
                    }
                }
            `}</style>
            </div>
        </>
    );
};

export default AssistantChat;
