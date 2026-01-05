import { Head } from '@inertiajs/react';
import React from 'react';

// === Komponen Ikon untuk kemudahan ===
const IconCheck = () => (
    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);

export default function Welcome() {
    // Inisialisasi AOS & Head Management
    React.useEffect(() => {
        document.title = 'PT. Garuda Karya Amanat - Bergerak dan Berkarya dengan Amanah';

        document.querySelectorAll('[data-gka-head]').forEach(e => e.remove());

        const headElements = [
            { type: 'meta', name: 'description', content: 'PT. Garuda Karya Amanat bergerak dalam bidang perdagangan, konstruksi, dan perkebunan di Kabupaten Natuna.' },
            { type: 'link', rel: 'icon', href: '/assets/GKA_no_Tag.png' },
            { type: 'link', rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { type: 'link', rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'true' },
            { type: 'link', rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap' },
            { type: 'link', rel: 'stylesheet', href: 'https://unpkg.com/aos@2.3.1/dist/aos.css' },
            { type: 'script', src: 'https://cdn.tailwindcss.com' },
            { type: 'script', src: 'https://unpkg.com/aos@2.3.1/dist/aos.js' },
            { type: 'style', content: `body { font-family: 'Poppins', sans-serif; } .hero-bg { background-image: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url('/assets/bghero.jpg'); }` }
        ];

        headElements.forEach(item => {
            const el = document.createElement(item.type);
            el.setAttribute('data-gka-head', 'true');
            if (item.type === 'style') {
                el.textContent = item.content;
            } else {
                Object.keys(item).forEach(key => {
                    if (key !== 'type' && key !== 'content') el.setAttribute(key, item[key]);
                });
            }
            document.head.appendChild(el);
        });

        setTimeout(() => {
            if (window.AOS) {
                window.AOS.init({ duration: 1000, once: true });
            }
        }, 100);

        const header = document.querySelector('#header');
        if (header) {
            const handleScroll = () => {
                if (window.scrollY > 50) {
                    header.classList.add('bg-white', 'shadow-md', 'text-gray-800');
                    header.classList.remove('text-white');
                } else {
                    header.classList.remove('bg-white', 'shadow-md', 'text-gray-800');
                    header.classList.add('text-white');
                }
            };
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const navLinks = [
        { name: 'Home', href: '#hero' },
        { name: 'About', href: '#about' },
        { name: 'Services', href: '#services' },
        { name: 'Products', href: '#products' },
        { name: 'Contact', href: '#contact' },
    ];

    const products = [
        { name: 'Rubber', image: '/assets/karet.jpeg' },
        { name: 'Coconut Fiber', image: '/assets/sabut.jpeg' },
        { name: 'White Copra', image: '/assets/kop_putih.jpeg' }
    ];

    return (
        <div className="bg-gray-50 text-gray-800">
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            {/* === Header === */}
            <header id="header" className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 text-white">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <img src="/assets/GKA_no_Tag.png" alt="GKA Logo" className="h-10 w-auto" />
                        <span className="ml-3 font-bold text-xl tracking-wider">GKA</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <a key={link.name} href={link.href} className="hover:text-yellow-400 transition-colors">{link.name}</a>
                        ))}
                        <div className="pl-4 border-l border-gray-500">
                            <div className="space-x-4">
                                <a href="/login" className="bg-yellow-400 text-white font-bold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors">Log In</a>
                                {/* <a href="/login" className="hover:text-yellow-400 transition-colors">Log In</a> */}
                                {/* <a href="/register" className="bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors">
                                    Register
                                </a> */}
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            <main>
                {/* === Hero Section === */}
                <section id="hero" className="hero-bg h-screen bg-cover bg-center flex items-center">
                    <div className="container mx-auto px-6 text-white">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4" data-aos="fade-up">
                                PT. Garuda Karya Amanat
                            </h1>
                            <p className="text-lg md:text-2xl mb-8 text-gray-200" data-aos="fade-up" data-aos-delay="200">
                                Bergerak dan Berkarya dengan Amanah.
                            </p>
                            <a href="#about" className="bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105" data-aos="fade-up" data-aos-delay="400">
                                Pelajari Lebih Lanjut
                            </a>
                        </div>
                    </div>
                </section>

                {/* === About Section === */}
                <section id="about" className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">Tentang Kami</h2>
                            <div className="w-24 h-1 bg-yellow-400 mx-auto mt-2"></div>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="md:w-1/2" data-aos="fade-right">
                                <img src="/assets/bghero.jpg" alt="Tentang GKA" className="rounded-lg shadow-2xl w-full" />
                            </div>
                            <div className="md:w-1/2" data-aos="fade-left">
                                <p className="mb-6">
                                    <strong>PT. Garuda Karya Amanat</strong> adalah perusahaan yang berdomisili di Kabupaten Natuna, berfokus pada sektor perdagangan, konstruksi, dan perkebunan. Kami membuka peluang kerja sama dengan berbagai instansi, baik nasional maupun internasional, berdasarkan keahlian yang kami miliki.
                                </p>
                                <h3 className="text-xl font-bold mb-2">Visi</h3>
                                <p className="mb-4">Menjadi prioritas utama yang terpercaya dalam perdagangan dan konstruksi, serta terus memperluas jaringan distribusi di tingkat nusantara dan internasional.</p>
                                <h3 className="text-xl font-bold mb-2">Misi</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start"><IconCheck /><span className="ml-2">Mewujudkan kepuasan, kepercayaan, dan profesionalitas bagi konsumen.</span></li>
                                    <li className="flex items-start"><IconCheck /><span className="ml-2">Menjaga kualitas dan kuantitas produk dengan harga yang kompetitif.</span></li>
                                    <li className="flex items-start"><IconCheck /><span className="ml-2">Berperan aktif dalam program pemerintah untuk meningkatkan kesejahteraan masyarakat.</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === Services Section === */}
                <section id="services" className="py-20 bg-gray-100">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">Fasilitas Pengantaran</h2>
                            <div className="w-24 h-1 bg-yellow-400 mx-auto mt-2"></div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="bg-white p-8 rounded-lg shadow-lg" data-aos="zoom-in">
                                <img src="/assets/pickup.jpg" alt="Small Truck" className="h-20 mx-auto mb-4"/>
                                <h3 className="text-xl font-bold mb-2">Small Truck</h3>
                                <p>Kapasitas angkut hingga 1 Ton, fleksibel untuk pengiriman skala kecil.</p>
                            </div>
                            <div className="bg-white p-8 rounded-lg shadow-lg" data-aos="zoom-in" data-aos-delay="200">
                                <img src="/assets/truck.jpg" alt="Truck" className="h-20 mx-auto mb-4"/>
                                <h3 className="text-xl font-bold mb-2">Truck</h3>
                                <p>Kapasitas angkut hingga 14 Ton, solusi untuk kebutuhan logistik menengah.</p>
                            </div>
                            <div className="bg-white p-8 rounded-lg shadow-lg" data-aos="zoom-in" data-aos-delay="400">
                                <img src="/assets/pelni.png" alt="Container" className="h-20 mx-auto mb-4"/>
                                <h3 className="text-xl font-bold mb-2">Container</h3>
                                <p>Kapasitas angkut hingga 24 Ton, ideal untuk pengiriman skala besar dan ekspor.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === Products Section === */}
                <section id="products" className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">Produk Unggulan Kami</h2>
                            <div className="w-24 h-1 bg-yellow-400 mx-auto mt-2"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {products.map((product, index) => (
                                <div key={product.name} className="relative group overflow-hidden rounded-lg shadow-xl" data-aos="fade-up" data-aos-delay={index * 100}>
                                    <img src={product.image} alt={product.name} className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
                                        <h3 className="text-white text-lg font-bold p-4">{product.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* === Contact Section === */}
                <section id="contact" className="py-20 bg-gray-800 text-white">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold">Hubungi Kami</h2>
                        <div className="w-24 h-1 bg-yellow-400 mx-auto mt-2"></div>
                        <p className="max-w-3xl mx-auto my-6 text-gray-300">
                            Siap untuk berkolaborasi? Kami menantikan kabar dari Anda. Hubungi kami melalui informasi di bawah ini.
                        </p>
                        <div className="flex flex-col md:flex-row justify-center items-center gap-12 mt-8">
                            <div data-aos="fade-up">
                                <h3 className="font-bold text-lg">Alamat Kantor</h3>
                                <p className="text-gray-400">Jl. Sudirman, No 59, Ranai Kota, Natuna, Kep. Riau</p>
                            </div>
                            <div data-aos="fade-up" data-aos-delay="200">
                                <h3 className="font-bold text-lg">Email</h3>
                                <a href="mailto:ptgarudakaryaamanat@gmail.com" className="text-yellow-400 hover:underline">ptgarudakaryaamanat@gmail.com</a>
                            </div>
                            <div data-aos="fade-up" data-aos-delay="400">
                                <h3 className="font-bold text-lg">Telepon / WhatsApp</h3>
                                <a href="https://wa.me/6285788940801" className="text-yellow-400 hover:underline">+62 857 8894 0801</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* === Footer === */}
            <footer className="bg-gray-900 text-gray-400 py-10">
                <div className="container mx-auto px-6 text-center">
                    <img src="/assets/GKA_no_TAG.png" alt="GKA Logo" className="h-12 mx-auto mb-4"/>
                    <p>&copy; {new Date().getFullYear()} PT. Garuda Karya Amanat. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}

