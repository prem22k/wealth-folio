'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send } from 'lucide-react';

export default function CFO() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'I am auditing your ledger. Ask me anything.' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput('');

        // Mock response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Analyzing... (This is a demo)' }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Trigger */}
            <motion.button
                layoutId="cfo-trigger"
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                className={`fixed bottom-28 left-6 md:bottom-10 md:left-10 z-[60] size-14 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-900 border border-white/20 shadow-2xl flex items-center justify-center text-white
                    ${isOpen ? 'hidden' : 'flex'}
                `}
            >
                <Sparkles className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border border-black" />
            </motion.button>

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        layoutId="cfo-trigger"
                        className="fixed bottom-28 left-6 md:bottom-10 md:left-10 z-[60] w-[350px] h-[500px] bg-[#050505] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">CFO Agent</h3>
                                    <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-wider">Online • Auditing</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium leading-relaxed
                                            ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                : 'bg-white/10 text-slate-200 rounded-tl-sm border border-white/5'
                                            }
                                        `}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a command..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 rounded-lg text-white hover:bg-indigo-400 transition-colors"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-600 mt-2">AI can make mistakes. Verify important info.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
