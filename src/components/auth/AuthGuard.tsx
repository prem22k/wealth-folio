'use client';

import { useAuth } from '@/context/AuthContext';
import Login from '@/components/auth/Login';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const PUBLIC_PATHS = ['/register', '/login'];

export default function AuthGuard({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();

    if (loading) return null;

    // Allow access to public paths without login
    if (PUBLIC_PATHS.includes(pathname)) {
        // If user is logged in and on register/login, maybe redirect? 
        // For now, let's just render children (which is the public page)
        return <>{children}</>;
    }

    if (!user) {
        return <Login />;
    }

    return <>{children}</>;
}
