import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * SmartImage automatically tries different extensions (.webp, .png, .jpg, .jpeg) 
 * if the first one fails to load. Prioritizes .webp for performance.
 * Also includes a shimmer loading state and support for Sanity image objects.
 */
const SmartImage = ({ 
    srcBase, 
    src, 
    alt, 
    lqip,
    fallback, 
    isMotion = false, 
    motionProps = {}, 
    className = "", 
    style, 
    loading = "lazy",
    ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Directly use .jpg for srcBase, or the provided src
  const initialSrc = src || (srcBase ? `${srcBase}.jpg` : fallback);
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  useEffect(() => {
    setIsLoaded(false);
    setCurrentSrc(src || (srcBase ? `${srcBase}.jpg` : fallback));
  }, [srcBase, src, fallback]);

  const handleError = () => {
    // If it fails, only use fallback image
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Improved loading state with blur-up support
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-block',
    width: '100%',
    height: '100%',
    ...style
  };

  const lqipStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    filter: 'blur(20px)',
    transform: 'scale(1.1)',
    transition: 'opacity 0.2s ease-out',
    opacity: isLoaded ? 0 : 1,
    zIndex: 1,
    objectFit: props.objectFit || 'cover'
  };

  const mainImgStyle = {
    transition: 'opacity 0.2s ease-out',
    opacity: isLoaded ? 1 : 0,
    filter: 'none',
    width: '100%',
    height: '100%',
    objectFit: props.objectFit || 'cover',
    position: 'relative',
    zIndex: 2,
    ...style
  };

  const content = (
    <>
      {lqip && (
        <img 
          src={lqip} 
          alt="" 
          aria-hidden="true"
          style={lqipStyle}
        />
      )}
      {isMotion ? (
        <motion.img
          src={currentSrc}
          alt={alt}
          className={className}
          style={mainImgStyle}
          onError={handleError}
          onLoad={handleLoad}
          loading={loading}
          decoding="async"
          {...motionProps}
          {...props}
        />
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          className={className}
          style={mainImgStyle}
          onError={handleError}
          onLoad={handleLoad}
          loading={loading}
          decoding="async"
          {...props}
        />
      )}
    </>
  );

  return (
    <div className={`smart-image-container ${!isLoaded ? 'shimmer' : ''}`} style={containerStyle}>
      {content}
    </div>
  );
};

export default SmartImage;
