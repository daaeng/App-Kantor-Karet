import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-slate-950 overflow-hidden selection:bg-emerald-500 selection:text-white font-sans">
            <Head title="Secure Login Area" />

            {/* === BACKGROUND AMBIENCE === */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/assets/bghero.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/50 to-slate-950/80"></div>
                
                {/* Glowing Orbs */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[100px] animate-pulse mix-blend-screen"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] animate-pulse delay-1000 mix-blend-screen"></div>
            </div>

            {/* === FLOATING GLASS CARD === */}
            <div className="relative z-10 w-full max-w-[420px] px-6">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    {/* Subtle internal top glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm"></div>

                    {/* Logo & Header */}
                    <div className="text-center mb-10">
                        <img src="/assets/GKA_no_Tag.png" alt="GKA Logo" className="h-14 w-auto mx-auto mb-6 opacity-90 drop-shadow-lg" />
                        <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">
                            Welcome Back
                        </h2>
                        <p className="text-slate-400 text-sm font-light">
                            Enter your credentials to access the workspace.
                        </p>
                    </div>

                    {status && (
                        <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-sm border border-emerald-500/20 mb-6 text-center font-medium backdrop-blur-md">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* Email Input */}
                        <div className="space-y-2.5">
                            <Label htmlFor="email" className="text-slate-300 text-xs font-semibold tracking-wide uppercase">E-mail Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-light"
                                    placeholder="name@garudakarya.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-slate-300 text-xs font-semibold tracking-wide uppercase">Password</Label>
                                {canResetPassword && (
                                    <a href={route('password.request')} className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                                        Forgot?
                                    </a>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder-slate-600 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-light"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-3 pt-1">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                className="border-slate-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 rounded-[4px]"
                            />
                            <Label htmlFor="remember" className="text-sm font-light text-slate-400 cursor-pointer">Keep me logged in</Label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                            disabled={processing}
                        >
                            {processing ? (
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-[11px] text-slate-500 font-light">
                            Secured Internal System<br/>
                            &copy; {new Date().getFullYear()} PT. Garuda Karya Amanat
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
