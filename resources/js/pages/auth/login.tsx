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
        <div className="min-h-screen w-full flex">
            <Head title="Login Area" />

            {/* === BAGIAN KIRI: GAMBAR LATAR (Hidden di HP) === */}
            <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/bghero.jpg"
                        alt="Background Office"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-12 text-white max-w-lg">
                    <div className="mb-8">
                        <img src="/assets/GKA_no_Tag.png" alt="Logo White" className="h-16 w-auto drop-shadow-lg" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                        Sistem Informasi Manajemen Terintegrasi
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Kelola administrasi, keuangan, dan operasional PT. Garuda Karya Amanat dengan lebih efisien, transparan, vepat, dan akurat.
                    </p>

                    <div className="mt-12 flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900"></div>
                            <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-900"></div>
                            <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-slate-900"></div>
                        </div>
                        <span>Bergabung dengan tim profesional.</span>
                    </div>
                </div>
            </div>

            {/* === BAGIAN KANAN: FORM LOGIN === */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-zinc-950">
                <div className="w-full max-w-md space-y-8">

                    {/* Header Mobile Only Logo */}
                    <div className="text-center lg:text-left">
                        <img src="/assets/gka_logo.png" alt="Logo Color" className="h-12 w-auto mx-auto lg:mx-0 mb-6 lg:hidden" />
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Selamat Datang Kembali</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            Silakan masuk ke akun Anda untuk melanjutkan.
                        </p>
                    </div>

                    {status && (
                        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-lg text-sm border border-emerald-200">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="pl-10 h-11 bg-slate-50 dark:bg-accent border-slate-200focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                    placeholder="nama@garudakarya.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password">Kata Sandi</Label>
                                {canResetPassword && (
                                    <a href={route('password.request')} className="text-xs font-medium text-yellow-600 hover:text-yellow-700 hover:underline">
                                        Lupa kata sandi?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10 h-11 bg-slate-50 dark:bg-accent border-slate-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                className="border-slate-300 text-yellow-500 focus:ring-yellow-500"
                            />
                            <Label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer">Ingat saya di perangkat ini</Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
                            disabled={processing}
                        >
                            {processing ? (
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Masuk Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        &copy; {new Date().getFullYear()} PT. Garuda Karya Amanat. <br/>All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
