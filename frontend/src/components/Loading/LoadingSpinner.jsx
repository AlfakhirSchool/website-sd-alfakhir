import React from 'react';
import { motion } from 'framer-motion';
import "./Loading.css";

const LoadingSpinner = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner-wrapper">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="loading-glow"
        />
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="logo-container"
        >
          <img 
            src="/logo_new.webp" 
            alt="SD Islam Modern Al-Fakhir Animated Logo" 
            className="loading-logo"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
