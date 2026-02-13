'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    Home as HomeIcon,
    Activity,
    AlertTriangle,
    Lock as LockIcon,
    Settings as SettingsIcon,
    LucideIcon
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';

export default function UnsealDock() {
    const { user } = useAuth();
    const pathname = usePathname();
    const mouseX = useMotionValue(Infinity);

    const navItems = [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Stream', path: '/stream', icon: Activity },
        { name: 'Audit', path: '/threats', icon: AlertTriangle },
        { name: 'Vault', path: '/vault', icon: LockIcon },
    ];

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex h-16 items-end gap-4 rounded-2xl bg-[#0B0C10]/80 backdrop-blur-xl border border-white/10 px-4 pb-3 shadow-2xl"
        >
            {navItems.map((item) => (
                <DockIcon
                    key={item.name}
                    mouseX={mouseX}
                    item={item}
                    isActive={pathname === item.path}
                />
            ))}

            {/* Divider */}
            <div className="h-10 w-[1px] bg-white/10 mx-1 self-center" />

            {/* Settings (Placeholder) - Treated as a Dock Icon too */}
            <DockIcon
                mouseX={mouseX}
                item={{ name: 'Settings', path: '/settings', icon: SettingsIcon }}
                isActive={pathname === '/settings'}
            />
        </motion.div>
    );
}

function DockIcon({
    mouseX,
    item,
    isActive
}: {
    mouseX: MotionValue<number>;
    item: { name: string; path: string; icon: LucideIcon };
    isActive: boolean;
}) {
    const ref = useRef<HTMLAnchorElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <Link href={item.path} ref={ref}>
            <motion.div
                style={{ width }}
                className="aspect-square rounded-full flex items-center justify-center relative group"
            >
                <div
                    className={`absolute inset-0 rounded-full transition-colors duration-200 ${isActive ? 'bg-primary/20 border border-primary/50' : 'bg-white/5 border border-white/5 hover:bg-white/10'
                        }`}
                />

                <item.icon
                    className={`relative z-10 transition-colors duration-200 w-1/2 h-1/2 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                />

                {isActive && (
                    <motion.div
                        layoutId="activeDot"
                        className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"
                    />
                )}

                {/* Tooltip */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] font-bold rounded uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                    {item.name}
                </span>
            </motion.div>
        </Link>
    );
}
