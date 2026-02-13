'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

// Random float utility
const random = (min: number, max: number) => Math.random() * (max - min) + min;

export default function VampireViz() {
    // Generate random subscription nodes
    const [nodes, setNodes] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([]);

    useEffect(() => {
        const newNodes = Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            x: random(-100, 100),
            y: random(-100, 100),
            size: random(30, 60),
            delay: random(0, 2),
        }));
        setNodes(newNodes);
    }, []);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Center Wealth Node */}
            <div className="relative z-10 size-24 bg-white/10 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                <div className="size-16 bg-gradient-to-br from-indigo-500 to-primary rounded-full flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-white text-3xl">account_balance_wallet</span>
                </div>
                {/* Pulse ring */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border border-primary/50"
                />
            </div>

            {/* Orbiting Vampire Nodes */}
            {nodes.map((node) => (
                <VampireNode key={node.id} data={node} />
            ))}
        </div>
    );
}

function VampireNode({ data }: { data: { x: number; y: number; size: number; delay: number } }) {
    return (
        <motion.div
            className="absolute rounded-full flex items-center justify-center"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
                x: data.x * 2.5, // Spread out
                y: data.y * 2.5,
                opacity: 1,
            }}
            transition={{ duration: 1, delay: data.delay, type: "spring" }}
            style={{ width: data.size, height: data.size }}
        >
            {/* Connection Line */}
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible w-[200px] h-[200px] pointer-events-none opacity-20" style={{ transformOrigin: "center" }}>
                <motion.line
                    x1="50%"
                    y1="50%"
                    x2={100 + data.x * 2.5} // Approximate coordinate mapping for SVG inside container? 
                // SVG mapping is tricky with relative parents. simpler approach:
                // Just use absolute positioned div with rotation or SVG covering whole area.
                // For now, simplify: Just the node.
                />
            </svg>

            {/* The Node */}
            <motion.div
                className="w-full h-full rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-sm flex items-center justify-center relative group"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: random(2, 4), repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="material-symbols-outlined text-red-400 text-opacity-80 text-sm">water_drop</span>

                {/* Drain Particle Effect */}
                <motion.div
                    className="absolute w-1 h-1 bg-red-500 rounded-full"
                    animate={{
                        top: ["50%", "150%"], // Move towards center? No, center is wealth.
                        // Let's assume drain goes FROM center TO node.
                        // But coordinates are hard to match perfectly without a centralized SVG.
                        opacity: [1, 0]
                    }}
                />
            </motion.div>
        </motion.div>
    );
}
