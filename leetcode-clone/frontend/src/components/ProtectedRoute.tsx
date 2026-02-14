import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await insforge.auth.getCurrentUser();
                setUser(data?.user ?? null);
            } catch (error: any) {
                console.error('Auth check failed:', error);
                // If we get a 401, sign out to clear invalid session
                if (error?.status === 401 || error?.message?.includes('401')) {
                    await insforge.auth.signOut();
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
}
