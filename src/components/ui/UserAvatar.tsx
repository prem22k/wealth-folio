'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function UserAvatar() {
    const { user, logout } = useAuth();

    // Handling Image Error or Fallback
    const photoURL = user?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuAAkAp2nqYI4d7FCTlnn0YsokugjS_ih7ko9RFbqR3LvxWJXhyFXsRYGqMMB1kq42j4ZEwnucdzMEusQGMa3ztEwl4Ps8G-QyokrIiGSQKhvmoO3zDzeA_YJIhupxnkOxIbhz9H4VipbGfy62C2TwORU-HjUq2f7_hQ7qj3Q-bAzeLu8reyeJtkY3Uu7dsJf-TZ_4t5V_36o9nvnyShnx9LDT1T5Ff1KEBL-Lv7fvOLukVHTGDF45qCVnuIOWhvNwtaKCWpNPj0rA";

    return (
        <div className="group relative">
            <div
                className="bg-center bg-no-repeat bg-cover rounded-full size-9 cursor-pointer ring-2 ring-white/10 transition-all hover:ring-primary/50"
                style={{ backgroundImage: `url("${photoURL}")` }}
            >
            </div>

            {/* Hover Menu / Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#0a0a12] border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right">
                <div className="p-3 border-b border-white/5">
                    <p className="text-sm font-semibold text-white truncate">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                        <UserIcon className="h-4 w-4" />
                        Profile Settings
                    </button>
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
