import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Instagram, Mail, X, Phone } from 'lucide-react';
import "./FloatingChat.css";

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);

    const contactLinks = [
        { 
            icon: Phone, 
            label: 'WhatsApp', 
            color: '#25D366', 
            link: 'https://wa.me/6285281752123',
            delay: 0.1
        },
        { 
            icon: Instagram, 
            label: 'Instagram', 
            color: '#E4405F', 
            link: 'https://instagram.com/smpi_alfakhir',
            delay: 0.2
        },
        { 
            icon: Mail, 
            label: 'Email', 
            color: '#c25d98', 
            link: 'mailto:smpialfakhir@gmail.com',
            delay: 0.3
        }
    ];

    return (
        <div className="floating-chat-container">
            
            {/* Expanded Menu */}
            <AnimatePresence>
                {isOpen && (
                    <div className="floating-menu">
                        {contactLinks.map((item, index) => (
                            <motion.a
                                key={index}
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.5 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: item.delay }}
                                whileHover={{ scale: 1.1, x: -5 }}
                                className="contact-link-card"
                            >
                                <span>{item.label}</span>
                                <div 
                                    className="contact-icon-frame"
                                    style={{ background: item.color }}
                                >
                                    <item.icon size={20} />
                                </div>
                            </motion.a>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1, rotate: isOpen ? -90 : 0 }}
                whileTap={{ scale: 0.9 }}
                className={`chat-toggle-btn ${isOpen ? 'open' : 'closed'}`}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                        >
                            <X size={32} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, rotate: 90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -90 }}
                        >
                            <MessageCircle size={32} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Subtle Pulse Effect When Closed */}
                {!isOpen && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="pulse-effect"
                    />
                )}
            </motion.button>
        </div>
    );
};

export default FloatingChat;
