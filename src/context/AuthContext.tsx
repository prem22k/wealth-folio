'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    registerWithEmail: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth || !auth.app) {
            console.warn("Firebase Auth not initialized. Missing environment variables?");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth || !auth.app) {
            alert("Firebase Authentication is not initialized. Please verify your NEXT_PUBLIC_FIREBASE_API_KEY environment variable is configured in Vercel.");
            return;
        }
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Google', error);
            // Optional: Add toast notification here
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!auth || !auth.app) {
            alert("Firebase Authentication is not initialized. Please verify your NEXT_PUBLIC_FIREBASE_API_KEY environment variable is configured in Vercel.");
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error('Error signing in with email', error);
            throw error;
        }
    };

    const registerWithEmail = async (name: string, email: string, password: string) => {
        if (!auth || !auth.app) {
            alert("Firebase Authentication is not initialized. Please verify your NEXT_PUBLIC_FIREBASE_API_KEY environment variable is configured in Vercel.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });
                // Keep the real User instance (spreading it drops getIdToken(), which the vault upload needs);
                // updateProfile has already updated auth.currentUser in place.
                setUser(auth.currentUser);
            }
        } catch (error) {
            console.error('Error registering with email', error);
            throw error;
        }
    };

    const logout = async () => {
        if (!auth || !auth.app) {
            return;
        }
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out', error);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 min-h-screen flex items-center justify-center bg-slate-950 text-white z-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="text-lg font-medium text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, registerWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
