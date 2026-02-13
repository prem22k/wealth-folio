'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

// Mock Data
const INITIAL_TXS = [
    { id: '1', amount: 450, desc: 'Starbucks', category: 'Unclassified' },
    { id: '2', amount: 1200, desc: 'Uber Trip', category: 'Unclassified' },
    { id: '3', amount: 5000, desc: 'Trader Joes', category: 'Unclassified' },
    { id: '4', amount: 899, desc: 'Netflix', category: 'Unclassified' },
    { id: '5', amount: 12000, desc: 'Electricity Bill', category: 'Unclassified' },
];

const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Entropy'];

export default function VerificationBoard() {
    const [transactions, setTransactions] = useState(INITIAL_TXS);

    // We'll track where items are dropped purely by logic or simple coordinate check 
    // For robust dnd, libraries are better, but for "physics pill", specific simple logic works.

    const handleClassify = (id: string, newCategory: string) => {
        setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, category: newCategory } : tx));
    };

    return (
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
            {/* Unclassified Source */}
            <div className="lg:col-span-1 rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col gap-3 relative">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>Inbox</span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px]">{transactions.filter(t => t.category === 'Unclassified').length}</span>
                </h3>

                <div className="flex-1 flex flex-col gap-3">
                    <AnimatePresence>
                        {transactions.filter(t => t.category === 'Unclassified').map(tx => (
                            <DraggablePill key={tx.id} tx={tx} onClassify={handleClassify} />
                        ))}
                    </AnimatePresence>
                    {transactions.filter(t => t.category === 'Unclassified').length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm italic">
                            All clear!
                        </div>
                    )}
                </div>
            </div>

            {/* Target Buckets */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                {CATEGORIES.map(cat => (
                    <DropZone
                        key={cat}
                        category={cat}
                        items={transactions.filter(t => t.category === cat)}
                        onDrop={(id) => handleClassify(id, cat)}
                    />
                ))}
            </div>
        </div>
    );
}

function DraggablePill({ tx, onClassify }: { tx: any, onClassify: (id: string, cat: string) => void }) {
    // This is a simplified drag. Real robust drag needs global coordinate tracking.
    // For this demo/prototype level, we can use framer-motion's onDragEnd to check coordinates?
    // Actually, checking coordinates of other elements is hard without refs.
    // For simplicity: We will just allow dragging, but maybe simulating the "Verify" action by 
    // buttons revealed ON drag, or just keep it simple: Clicking category moves it. 
    // Wait, the prompt asked for "Dragging Interface". 
    // I can implement a simple drop target detection using `document.elementsFromPoint`.

    return (
        <motion.div
            layoutId={tx.id}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Elastic snap back if not dropped
            dragElastic={0.2}
            // We use dragSnapToOrigin usually, but we want to allow dropping.
            // If we set constraints to 0, it snaps back. We want that UNLESS dropped.
            // But we can't easily detect "drop on target" without complex state using just framer motion basic props.

            // ALTERNATIVE: Use a context to track hover states of drop zones? 
            // Or just make it "Click to Move" for reliability if drag is too complex for single-file without dnd-kit.
            // But I want to deliver "Category Pill Physics".
            // Let's try: Drag Free. On Drag End, check if over a zone.

            dragMomentum={false}
            onDragEnd={(e, info) => {
                const dropPoint = { x: info.point.x, y: info.point.y };
                // Creating a custom event or check logic
                // This is a bit hacky to find the drop zone element manually
                const elements = document.elementsFromPoint(dropPoint.x, dropPoint.y);
                const dropZone = elements.find(el => el.hasAttribute('data-category'));

                if (dropZone) {
                    const cat = dropZone.getAttribute('data-category');
                    if (cat) onClassify(tx.id, cat);
                }
            }}
            className="cursor-grab active:cursor-grabbing bg-[#0B0C10] border border-white/10 p-3 rounded-lg shadow-lg flex items-center justify-between group relative z-50 hover:border-primary/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400">
                    {tx.desc[0]}
                </div>
                <div>
                    <div className="text-white text-sm font-bold">{tx.desc}</div>
                    <div className="text-slate-500 text-[10px]">₹{tx.amount}</div>
                </div>
            </div>
            <span className="material-symbols-outlined text-slate-500 text-lg">drag_indicator</span>
        </motion.div>
    )
}

function DropZone({ category, items, onDrop }: { category: string, items: any[], onDrop: (id: string) => void }) {
    return (
        <div
            data-category={category}
            className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-3 min-h-[200px] transition-colors hover:bg-white/[0.05]"
        >
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>{category}</span>
                <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px]">{items.length}</span>
            </h3>

            <div className="flex-1 flex flex-col gap-2">
                <AnimatePresence>
                    {items.map(tx => (
                        <motion.div
                            key={tx.id}
                            layoutId={tx.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white/5 p-2 rounded text-xs text-slate-300 flex justify-between"
                        >
                            <span>{tx.desc}</span>
                            <span className="text-white">₹{tx.amount}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
