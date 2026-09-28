import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import SmartImage from '../SmartImage';
import './PromoPopup.css';

const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after a short delay (2 seconds)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="promo-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="promo-modal"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <button className="promo-close-btn" onClick={handleClose}>
              &times;
            </button>
            <div className="promo-image-container">
              <SmartImage srcBase="/popup-banner" alt="Special Promo" className="promo-image" />
            </div>
            <div className="promo-content">
              <Link href="/pendaftaran" onClick={handleClose}>
                <button className="promo-action-btn">Registrasi Now</button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromoPopup;
