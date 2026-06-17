import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

// === Ikon SVG ===
const Icons = {
    Check: () => (
        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
    ),
    ArrowRight: () => (
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
    ),
    Truck: () => (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
    ),
    Globe: () => (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    ),
    Shield: () => (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
    )
};

export default function Welcome() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        document.title = 'PT. Garuda Karya Amanat - Profesional & Terpercaya';

        const loadResource = (tag: string, attrs: Record<string, string>) => {
            if (!document.querySelector(`[src="${attrs.src}"]`) && !document.querySelector(`[href="${attrs.href}"]`)) {
                const el = document.createElement(tag);
                Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
                document.head.appendChild(el);
            }
        };

        loadResource('link', { rel: 'stylesheet', href: 'https://unpkg.com/aos@2.3.1/dist/aos.css' });
        loadResource('script', { src: 'https://unpkg.com/aos@2.3.1/dist/aos.js' });
        loadResource('script', { src: 'https://cdn.tailwindcss.com' });

        const initAOS = setInterval(() => {
            if ((window as any).AOS) {
                (window as any).AOS.init({
                    duration: 1000,
                    easing: 'ease-out-cubic',
                    once: true,
                    offset: 50
                });
                clearInterval(initAOS);
            }
        }, 100);

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Beranda', href: '#hero' },
        { name: 'Tentang Kami', href: '#about' },
        { name: 'Layanan', href: '#services' },
        { name: 'Produk', href: '#products' },
        { name: 'Kontak', href: '#contact' },
    ];

    const facilities = [
        { name: 'Small Truck', capacity: '1 Ton', desc: 'Solusi cepat untuk pengiriman skala kecil & akses jalan sempit.', img: '/assets/pickup.jpg' },
        { name: 'Heavy Truck', capacity: '14 Ton', desc: 'Armada tangguh untuk logistik material konstruksi & perkebunan.', img: '/assets/truck.jpeg' },
        { name: 'Container', capacity: '24 Ton', desc: 'Standar ekspor untuk pengiriman skala besar antar pulau.', img: '/assets/pelni.png' }
    ];

    const products = [
        { name: 'Karet Alam Premium', img: '/assets/karet1.jpeg', tag: 'Best Seller' },
        { name: 'Karet Kering Super', img: '/assets/karet2.jpeg', tag: 'High DRC' },
        { name: 'Hasil Perkebunan', img: '/assets/getah.jpeg', tag: 'Organic' }
    ];

    return (
        <div 
            className="font-sans text-slate-300 overflow-x-hidden selection:bg-emerald-500 selection:text-white relative min-h-screen"
            style={{
                backgroundColor: '#020617',
                backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.6), rgba(2, 6, 23, 0.6)), url('/assets/bghero.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            <Head title="Welcome" />

            {/* MAIN CONTENT WRAPPER */}
            <div className="relative z-10">

            {/* === NAVBAR GLASSMORPHISM === */}
            <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-slate-950/60 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center">
                    <div 
                        className="flex items-center gap-3 group cursor-pointer"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <img src="/assets/GKA_no_Tag.png" alt="GKA Logo" className="h-9 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
                        <span className={`font-semibold text-lg tracking-wide text-white`}>
                            GKA<span className="text-emerald-400">.</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-6 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-[13px] font-medium text-slate-300 hover:text-white transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    <div className="hidden md:flex">
                        <a href="/login" className="px-6 py-2.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors shadow-lg shadow-emerald-500/30">
                            Login Portal
                        </a>
                    </div>
                </div>
            </nav>

            {/* === HERO SECTION === */}
            <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
                <div className="container mx-auto px-6 relative z-10 pt-24 flex flex-col items-start">
                    <div className="max-w-4xl text-left" data-aos="fade-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-white/10 rounded-full bg-white/5 backdrop-blur-md">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 absolute"></span>
                            <span className="text-slate-300 text-[11px] font-semibold tracking-widest uppercase">Perdagangan & Konstruksi</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white leading-[1.1] mb-8 tracking-tight">
                            Membangun <span className="text-emerald-400">Natuna</span><br />
                            Menjangkau Dunia.
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl font-light">
                            PT. Garuda Karya Amanat hadir sebagai mitra strategis dalam sektor perkebunan dan konstruksi. Menggabungkan efisiensi, teknologi, dan integritas.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-start">
                            <a href="#services" className="px-8 py-4 bg-white text-slate-950 font-medium rounded-full hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center">
                                Jelajahi Layanan
                            </a>
                            <a href="#contact" className="px-8 py-4 bg-white/5 backdrop-blur-lg border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all flex items-center justify-center">
                                Hubungi Kami <Icons.ArrowRight />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* === METRICS BAR === */}
            <div className="relative z-20 -mt-16 container mx-auto px-6">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex justify-around text-white shadow-2xl" data-aos="fade-up" data-aos-delay="200">
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl mb-2"><Icons.Shield /></div>
                        <p className="font-semibold text-3xl tracking-tight text-white">100%</p>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">Kepercayaan</p>
                    </div>
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-cyan-500/10 rounded-2xl mb-2"><Icons.Truck /></div>
                        <p className="font-semibold text-3xl tracking-tight text-white">Cepat</p>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">Distribusi</p>
                    </div>
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-blue-500/10 rounded-2xl mb-2"><Icons.Globe /></div>
                        <p className="font-semibold text-3xl tracking-tight text-white">Global</p>
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">Jaringan</p>
                    </div>
                </div>
            </div>

            {/* === ABOUT SECTION === */}
            <section id="about" className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2 relative" data-aos="fade-right">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl blur-2xl"></div>
                            <img src="/assets/karet.jpeg" alt="Tentang Kami" className="relative rounded-3xl w-full object-cover h-[500px] border border-white/10 shadow-2xl grayscale-[30%] hover:grayscale-0 transition-all duration-700" />
                            
                            <div className="absolute -bottom-6 -right-6 bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl hidden md:block">
                                <p className="font-semibold text-5xl text-white mb-1">5<span className="text-emerald-400">+</span></p>
                                <p className="text-xs uppercase tracking-widest text-slate-400">Tahun Pengalaman</p>
                            </div>
                        </div>
                        <div className="lg:w-1/2" data-aos="fade-left">
                            <h4 className="text-emerald-400 font-semibold uppercase tracking-widest text-xs mb-4">Mengenal GKA</h4>
                            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-8 tracking-tight">Mitra Terpercaya di<br/>Tanah Natuna.</h2>
                            <p className="text-slate-400 mb-10 leading-relaxed text-lg font-light">
                                PT. Garuda Karya Amanat bukan sekadar perusahaan, melainkan jembatan yang menghubungkan potensi alam Natuna dengan pasar global. Kami fokus pada kualitas, efisiensi, dan dampak positif bagi masyarakat.
                            </p>

                            <div className="space-y-4">
                                <div className="flex gap-5 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                                    <div className="mt-1"><Icons.Check /></div>
                                    <div>
                                        <h5 className="font-medium text-white text-lg mb-1 group-hover:text-emerald-400 transition-colors">Kualitas Kompetitif</h5>
                                        <p className="text-sm text-slate-400 font-light">Menjaga standar mutu produk perkebunan dan material dengan pengawasan ketat.</p>
                                    </div>
                                </div>
                                <div className="flex gap-5 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
                                    <div className="mt-1"><Icons.Check /></div>
                                    <div>
                                        <h5 className="font-medium text-white text-lg mb-1 group-hover:text-emerald-400 transition-colors">Integritas Logistik</h5>
                                        <p className="text-sm text-slate-400 font-light">Pengiriman tepat waktu dengan armada tangguh yang selalu siap beroperasi.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === SERVICES SECTION === */}
            <section id="services" className="py-32 bg-slate-900/30 border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20" data-aos="fade-up">
                        <h2 className="text-4xl font-semibold text-white mb-6 tracking-tight">Armada Logistik</h2>
                        <p className="text-slate-400 font-light text-lg">Kami menyediakan berbagai pilihan armada untuk memastikan barang Anda sampai tepat waktu dan dalam kondisi prima.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {facilities.map((item, idx) => (
                            <div key={idx} className="group bg-slate-900/50 backdrop-blur-xl rounded-3xl p-3 border border-white/5 hover:border-white/20 transition-all duration-500" data-aos="fade-up" data-aos-delay={idx * 100}>
                                <div className="relative overflow-hidden rounded-2xl h-56 mb-6">
                                    <img src={item.img} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                        {item.capacity}
                                    </div>
                                </div>
                                <div className="px-5 pb-5">
                                    <h3 className="text-xl font-medium text-white mb-3">{item.name}</h3>
                                    <p className="text-slate-400 text-sm font-light leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === CTA / CONTACT SECTION === */}
            <section id="contact" className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/80 backdrop-blur-2xl border border-emerald-500/20 rounded-[3rem] p-10 md:p-16 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden" data-aos="zoom-in">
                        {/* Glow effect inside card */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] -z-10"></div>

                        <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight text-white">Siap Bekerja Sama?</h2>
                        <p className="text-emerald-100/70 mb-12 text-lg font-light max-w-2xl mx-auto">
                            Hubungi kami untuk penawaran harga terbaik, konsultasi logistik, atau kemitraan jangka panjang. Kami selalu siap melayani.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 text-left">
                            <div className="p-6 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-semibold">Kantor Pusat</p>
                                <p className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors text-sm">Jl. Sudirman No 59, Ranai Kota, Natuna</p>
                            </div>

                            <a href="mailto:ptgarudakaryaamanat@gmail.com" className="p-6 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-semibold">Email Resmi</p>
                                <p className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors text-sm break-all">ptgarudakaryaamanat@gmail.com</p>
                            </a>

                            <a href="https://wa.me/6285788940801" className="p-6 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-semibold">WhatsApp</p>
                                <p className="font-medium text-slate-200 group-hover:text-emerald-400 transition-colors text-sm">+62 857 8894 0801</p>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* === FOOTER === */}
            <footer className="bg-slate-950 py-10 border-t border-white/5 relative z-10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/assets/GKA_no_Tag.png" alt="Logo" className="h-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
                        <span className="text-xs font-semibold tracking-wider text-slate-500">PT. GARUDA KARYA AMANAT</span>
                    </div>
                    <p className="text-xs text-slate-600 font-light">&copy; {new Date().getFullYear()} Hak Cipta Dilindungi.</p>
                </div>
            </footer>
            </div> {/* END MAIN CONTENT WRAPPER */}
        </div>
    );
}
