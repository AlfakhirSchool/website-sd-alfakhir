"use client";
import { motion } from 'framer-motion';

// Decorative background blur blobs used on every simple content page
// (staff, sejarah, sambutan, galeri, kontak, struktur).
const AmbientBlobs = () => (
    <>
        <motion.div
            animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', top: '20%', right: '-5%', width: '300px', height: '300px', background: 'rgba(249, 140, 29, 0.02)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }}
        />
        <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(15, 23, 42, 0.01)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }}
        />
    </>
);

export default AmbientBlobs;
