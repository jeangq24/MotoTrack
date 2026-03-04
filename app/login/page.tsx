'use client';

import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

            <div className="w-full max-w-sm z-10 text-center flex flex-col gap-6">
                <div>
                    <span className="text-6xl mb-4 block">🛵</span>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">MotoTrack</h1>
                    <p className="text-slate-400 font-medium tracking-wide">
                        Registra servicios diarios de una forma rápida y calcula tus ingresos reales.
                    </p>
                </div>

                <div className="bg-slate-800/60 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl mt-4">
                    <p className="text-slate-300 text-sm mb-6 font-semibold">
                        Inicia sesión para guardar tu historial en la nube y acceder desde cualquier dispositivo
                    </p>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full relative flex items-center justify-center gap-3 py-4 rounded-2xl font-bold bg-white text-slate-900 shadow-xl shadow-white/10 transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:active:scale-100 hover:bg-slate-100"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continuar con Google
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Signature */}
            <div className="absolute bottom-6 z-10 text-slate-500 text-xs font-semibold tracking-widest uppercase">
                Desarrollado por <a href="https://www.linkedin.com/in/jeangarzon/" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:underline">JGDev</a>
            </div>
        </div>
    );
}
