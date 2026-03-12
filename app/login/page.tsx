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
                redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback`,
            },
        });

        if (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
            {/* Background ambient lighting */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-sm z-10 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-3xl shadow-2xl shadow-black/40 flex items-center justify-center mx-auto mb-6 transform rotate-3 overflow-hidden border border-white/5 bg-slate-900/50">
                        <img src="/logo_mototrack.png" alt="MotoTrack Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">MotoTrack</h1>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">
                        Tu copiloto financiero inteligente.
                    </p>
                </div>

                <div className="bg-slate-900/40 p-8 rounded-[32px] border border-white/5 backdrop-blur-2xl shadow-2xl shadow-black/40">
                    <p className="text-slate-300 text-sm mb-8 font-medium text-center leading-relaxed" id="login-description">
                        Inicia sesión para guardar tus registros de forma segura y sincronizarlos en la nube.
                    </p>

                    <button
                        onClick={handleGoogleLogin}
                        aria-disabled={loading}
                        aria-describedby="login-description"
                        className="w-full relative flex items-center justify-center gap-3 py-4 rounded-2xl font-bold bg-white text-slate-900 shadow-xl shadow-white/10 transition-all duration-300 active:scale-95 aria-disabled:opacity-70 aria-disabled:active:scale-100 hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500"
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
            <div className="absolute bottom-8 z-10 text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase">
                by <a href="https://www.linkedin.com/in/jeangarzon/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors duration-300 ml-1">JGDev</a>
            </div>
        </main>
    );
}
