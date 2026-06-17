import { Activity } from 'lucide-react';
import React from 'react';

export const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => {
    const themes: any = {
        emerald: { bg: "hover:border-emerald-500/50", icon: "bg-emerald-500/10", text: "text-emerald-500" },
        blue: { bg: "hover:border-blue-500/50", icon: "bg-blue-500/10", text: "text-blue-500" },
        rose: { bg: "hover:border-rose-500/50", icon: "bg-rose-500/10", text: "text-rose-500" },
        amber: { bg: "hover:border-amber-500/50", icon: "bg-amber-500/10", text: "text-amber-500" },
        violet: { bg: "hover:border-violet-500/50", icon: "bg-violet-500/10", text: "text-violet-500" },
        pink: { bg: "hover:border-pink-500/50", icon: "bg-pink-500/10", text: "text-pink-500" },
        orange: { bg: "hover:border-orange-500/50", icon: "bg-orange-500/10", text: "text-orange-500" },
        indigo: { bg: "hover:border-indigo-500/50", icon: "bg-indigo-500/10", text: "text-indigo-500" },
    };

    const t = themes[color] || themes.blue;

    return (
        <div className={`relative group glass-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-l-4 ${t.bg.replace('hover:border-', 'border-').replace('/50', '')}`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${t.icon} shadow-inner drop-shadow-sm flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                        <Icon className={`w-6 h-6 ${t.text}`} strokeWidth={2} />
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full bg-white/50 dark:bg-black/20 uppercase tracking-widest ${t.text} border border-current/10`}>
                        Metric
                    </span>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight truncate">{value}</h3>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium truncate max-w-[150px]">{subtitle}</p>
                    <Activity className={`w-4 h-4 opacity-50 ${t.text}`} />
                </div>
            </div>
        </div>
    );
};
