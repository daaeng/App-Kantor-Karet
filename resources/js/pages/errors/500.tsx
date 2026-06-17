import { Link } from '@inertiajs/react';
import { Home, RefreshCw, ServerCrash } from 'lucide-react';
import React from 'react';

export default function Error500() {
    return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-700/15 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl scale-150 animate-pulse" />
                        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                            <ServerCrash className="w-14 h-14 text-orange-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                <div className="mb-2">
                    <span className="text-8xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-rose-400 bg-clip-text text-transparent select-none">500</span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-3">Kesalahan Server</h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    Terjadi kesalahan internal pada server. Tim teknis sudah mendapat notifikasi. Silakan coba lagi beberapa saat.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                        <RefreshCw className="w-4 h-4" /> Coba Lagi
                    </button>
                    <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-slate-300 font-semibold rounded-xl border border-white/10 transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                        <Home className="w-4 h-4" /> Dashboard
                    </Link>
                </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <span className="text-xs text-slate-700 font-mono">GKA System &nbsp;·&nbsp; HTTP 500 Internal Server Error</span>
            </div>
        </div>
    );
}
