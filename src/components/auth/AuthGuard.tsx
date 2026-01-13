'use client';

import { useAuth } from '@/context/AuthContext';
import Login from '@/components/auth/Login';
import { ReactNode } from 'react';

export default function AuthGuard({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    // If loading, the AuthProvider already shows a spinner, or we can return null here to avoid flicker.
    // Since AuthProvider implementation specifically returns a spinner when loading, 
    // we might not reach here if loading is true in AuthContext, depending on how it's used.
    // However, AuthProvider passed `loading` state down but does it block rendering of children?
    // Let's check AuthContext implementation. 
    // In AuthContext.tsx: 
    //   if (loading) { return <Spinner /> }
    //   return <AuthContext.Provider>{children}</AuthContext.Provider>
    // So children (AuthGuard) are NOT rendered while loading. 
    // Thus, when we reach here, loading is false. 
    // But strictly typing it doesn't hurt.

    if (loading) return null; // Should not happen given AuthContext implementation

    if (!user) {
        return <Login />;
    }

    return <>{children}</>;
}
