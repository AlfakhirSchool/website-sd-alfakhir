import React from 'react';
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import "./PPDBVideoDocumentation.css";

const PPDBVideoDocumentation = ({ selectedYear, videoUrl }) => {
    // Helper to convert YouTube link to embed format
    const getEmbedUrl = (url) => {
        if (!url) return null;
        try {
            if (url.includes('youtube.com/embed/')) return url;
            let videoId = '';
            if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
            } else if (url.includes('youtube.com/watch')) {
                videoId = new URLSearchParams(new URL(url).search).get('v');
            } else if (url.includes('youtube.com/v/')) {
                videoId = url.split('youtube.com/v/')[1].split(/[?#]/)[0];
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        } catch {
            console.error("Invalid YouTube URL:", url);
            return null;
        }
    };

    const embedUrl = getEmbedUrl(videoUrl);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="video-doc-card"
        >
            <h2 className="video-doc-title">Observation Documentation {selectedYear}</h2>
            <p className="video-doc-subtitle">Below is a video documenting the progress of the new student admission observation.</p>
            
            {!embedUrl ? (
                <div className="video-placeholder">
                    <div className="video-placeholder-icon">
                        <Video size={30} />
                    </div>
                    <p style={{ fontWeight: 800, color: '#475569' }}>Belum ada video dokumentasi untuk tahun {selectedYear}.</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>Administrator akan segera memperbarui konten ini.</p>
                </div>
            ) : (
                <div className="video-iframe-wrapper">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={embedUrl} 
                        title="Al-Fakhir Admissions Documentation"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
            
            <div className="video-doc-footer">
                <a 
                    href="https://youtube.com/@SDIslamModernAlFakhir" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="youtube-btn"
                >
                    <Video size={20} /> VIEW ON OUR YOUTUBE
                </a>
            </div>
        </motion.div>
    );
};

export default PPDBVideoDocumentation;
