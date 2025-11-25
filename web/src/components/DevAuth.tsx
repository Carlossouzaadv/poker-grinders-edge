'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function DevAuth() {
    const { isAuthenticated, devLogin } = useAuthStore();
    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        // Check if we are in development mode
        if (process.env.NODE_ENV === 'development') {
            setIsDev(true);
        }
    }, []);

    if (!isDev) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isAuthenticated ? (
                <button
                    onClick={devLogin}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded shadow-lg border-2 border-yellow-400"
                >
                    ⚡ Dev Login
                </button>
            ) : (
                <div className="bg-green-900/80 text-green-200 text-xs px-2 py-1 rounded border border-green-500/50 backdrop-blur-sm">
                    ⚡ Dev Mode: Logged In
                </div>
            )}
        </div>
    );
}
