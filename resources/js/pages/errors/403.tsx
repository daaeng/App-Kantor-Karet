import { Link } from '@inertiajs/react';
import { Home, Lock, ShieldX } from 'lucide-react';
import React from 'react';

export default function Error403() {
    return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center overflow-hidden relative">
            {/* Animated background */}
            <div className="absolute inset-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-700/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px]" />
            </div>

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/30 rounded-full blur-2xl scale-150 animate-pulse" />
                        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                            <ShieldX className="w-14 h-14 text-red-400" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>

                {/* Error code */}
                <div className="mb-2">
                    <span className="text-8xl font-black bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent select-none">
                        403
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-3">
                    Akses Ditolak
                </h1>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    Anda tidak memiliki izin untuk mengakses halaman ini.
                    Silakan hubungi administrator sistem untuk mendapatkan akses yang diperlukan.
                </p>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-700" />
                    <Lock className="w-4 h-4 text-slate-600" />
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-700" />
                </div>

                {/* Info box */}
                <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-left">
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">Keterangan</p>
                    <p className="text-sm text-slate-300">
                        Permission yang dibutuhkan tidak ditemukan pada akun Anda.
                        Role Anda saat ini tidak mencakup halaman ini.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                    >
                        <Home className="w-4 h-4" />
                        Kembali ke Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-slate-300 font-semibold rounded-xl border border-white/10 transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                    >
                        ← Halaman Sebelumnya
                    </button>
                </div>
            </div>

            {/* Bottom badge */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <span className="text-xs text-slate-700 font-mono">
                    GKA System &nbsp;·&nbsp; HTTP 403 Forbidden
                </span>
            </div>
        </div>
    );
}
