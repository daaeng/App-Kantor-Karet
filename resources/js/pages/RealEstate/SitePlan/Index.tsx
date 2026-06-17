import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useState, useRef } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Map, Info, Home, HardHat, CheckCircle2, Upload, Trash2, ZoomIn, ZoomOut, GripHorizontal } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Konfigurasi worker PDF.js menggunakan CDN untuk menghindari masalah build Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Real Estate', href: '#' },
    { title: 'Interactive Site Plan', href: '/real-estate/site-plan' },
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

export default function SitePlanIndex({ kavlings, activeProject }: { kavlings: any[], activeProject: any }) {
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    
    // Form for file upload
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { processing: uploadProcessing } = useForm(); // we'll use router.post directly for simpler file handling

    const [isProcessingPdf, setIsProcessingPdf] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const processPdfToImage = async (file: File): Promise<Blob> => {
        return new Promise(async (resolve, reject) => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const page = await pdf.getPage(1); // Ambil halaman pertama saja
                
                // Set resolusi render (scale lebih tinggi untuk kualitas gambar yang lebih baik)
                const scale = 2.0; 
                const viewport = page.getViewport({ scale });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) throw new Error('Canvas 2D context not available');
                
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                
                await page.render(renderContext).promise;
                
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob conversion failed'));
                }, 'image/jpeg', 0.9);
            } catch (error) {
                console.error("Error processing PDF:", error);
                reject(error);
            }
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            let fileToUpload: File | Blob = file;

            if (file.type === 'application/pdf') {
                setIsProcessingPdf(true);
                try {
                    fileToUpload = await processPdfToImage(file);
                    // Tambahkan ekstensi .jpg pada nama file
                    fileToUpload = new File([fileToUpload], file.name.replace('.pdf', '.jpg'), { type: 'image/jpeg' });
                } catch (error) {
                    setIsProcessingPdf(false);
                    toast.error("Gagal memproses file PDF. Pastikan file PDF valid atau coba unggah format JPG/PNG.");
                    return;
                }
            }

            router.post('/real-estate/site-plan/upload', {
                site_plan_image: fileToUpload
            }, {
                forceFormData: true,
                onFinish: () => setIsProcessingPdf(false)
            });
        }
    };

    const handleDeleteImage = () => {
        router.post('/real-estate/site-plan/delete', {}, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                toast.success("Gambar denah berhasil dihapus.");
            }
        });
    };

    const handleWheel = (e: React.WheelEvent) => {
        // Prevent default window scroll if hovering canvas
        e.preventDefault();
        // Prevent scaling if shift key is pressed (can be used for native horizontal scroll, but we pan with drag)
        const scaleAmount = -e.deltaY * 0.001;
        setScale((prev) => Math.min(Math.max(0.1, prev + scaleAmount), 5));
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        // Only trigger pan if Middle mouse clicked OR Shift + Left Click OR just left click on the empty canvas (not on a pin)
        // Let's make it easier: left click anywhere on canvas background to pan
        if (e.target instanceof HTMLImageElement || (e.target instanceof HTMLDivElement && (e.target as HTMLDivElement).id === 'canvas-wrapper')) {
            e.preventDefault();
            setIsDraggingCanvas(true);
            setDragStartPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingCanvas) return;
        setPan({
            x: e.clientX - dragStartPos.x,
            y: e.clientY - dragStartPos.y,
        });
    };

    const handleCanvasMouseUp = () => {
        setIsDraggingCanvas(false);
    };

    // --- Drag and Drop Logic for Kavlings ---
    
    const handleDragStart = (e: React.DragEvent, kavling: any) => {
        e.dataTransfer.setData('kavling_id', kavling.id.toString());
    };

    const handleCanvasDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const kavlingId = e.dataTransfer.getData('kavling_id');
        if (!kavlingId) return;

        // The target should be the image or the wrapper containing the image.
        // To accurately get relative percentage, we need the bounding rect of the original unscaled image wrapper.
        const wrapper = document.getElementById('map-image-wrapper');
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        
        // e.clientX is screen coordinate. rect.left/top is the actual rendered position including scale and pan.
        // The coordinate relative to the unscaled image:
        const x_pixel = (e.clientX - rect.left) / scale;
        const y_pixel = (e.clientY - rect.top) / scale;
        
        // The unscaled dimensions of the wrapper
        const originalWidth = rect.width / scale;
        const originalHeight = rect.height / scale;

        const x_pct = (x_pixel / originalWidth) * 100;
        const y_pct = (y_pixel / originalHeight) * 100;

        router.post(`/real-estate/blok-kavling/${kavlingId}/koordinat`, {
            x_coord: x_pct.toFixed(4),
            y_coord: y_pct.toFixed(4)
        }, { preserveScroll: true });
    };

    const handleCanvasDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // allow drop
    };

    const handleSidebarDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const kavlingId = e.dataTransfer.getData('kavling_id');
        if (!kavlingId) return;

        // Reset to null
        router.post(`/real-estate/blok-kavling/${kavlingId}/koordinat`, {
            x_coord: null,
            y_coord: null
        }, { preserveScroll: true });
    };

    const getSalesColor = (status: string) => {
        switch (status) {
            case 'Tersedia': return 'bg-emerald-500';
            case 'Booking': return 'bg-amber-500';
            case 'Sold Out': return 'bg-rose-500';
            default: return 'bg-slate-500';
        }
    };

    const unmappedKavlings = kavlings.filter(k => k.x_coord == null || k.y_coord == null);
    const mappedKavlings = kavlings.filter(k => k.x_coord != null && k.y_coord != null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Interactive Site Plan" />
            
            <div className="relative overflow-hidden bg-[#047857] pb-32 pt-12">
                <div className="relative z-10 px-6 w-full max-w-[95rem] mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-white">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md hidden sm:block">
                                <Map className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Interactive Site Plan</h1>
                                <p className="text-emerald-50 text-sm">Proyek: {activeProject?.nama_project || 'Pilih Proyek Aktif'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 w-full max-w-[95rem] mx-auto -mt-20 relative z-20 pb-24">
                
                {!activeProject || !activeProject.site_plan_image ? (
                    <Card className="w-full bg-white shadow-lg border-0 rounded-2xl flex flex-col items-center justify-center p-16 min-h-[600px]">
                        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-8">
                            <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-slate-800">
                            {!activeProject ? 'Pilih Proyek Terlebih Dahulu' : 'Belum Ada Gambar Denah'}
                        </h3>
                        <p className="text-slate-500 mb-10 text-base max-w-2xl text-center">
                            {!activeProject 
                                ? 'Sistem perlu mengetahui denah ini untuk proyek yang mana. Silakan pilih "Proyek Aktif" pada menu dropdown di sidebar kiri atas.' 
                                : 'Silakan unggah gambar site plan (denah asli) untuk proyek ini agar Anda bisa mulai memetakan kavling.'}
                        </p>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/jpg, application/pdf" onChange={handleFileUpload} />
                        <Button 
                            className={`${!activeProject ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#047857] hover:bg-[#065f46] text-white shadow-md'} px-10 py-6 rounded-xl text-base font-semibold transition-all`} 
                            onClick={() => {
                                if (activeProject) fileInputRef.current?.click();
                            }} 
                            disabled={!activeProject || uploadProcessing || isProcessingPdf}
                        >
                            {!activeProject ? <Info className="w-5 h-5 mr-3" /> : <Upload className="w-5 h-5 mr-3" />}
                            {!activeProject ? 'Pilih Proyek Aktif Dulu' : isProcessingPdf ? 'Memproses PDF...' : uploadProcessing ? 'Mengunggah...' : 'Pilih File Denah (JPG/PNG/PDF)'}
                        </Button>
                    </Card>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        
                        {/* Left: Interactive Canvas */}
                        <Card className="flex-1 shadow-lg border-0 rounded-2xl overflow-hidden bg-white h-[750px] flex flex-col">
                            <CardHeader className="border-b bg-white px-6 py-4 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Map className="w-6 h-6 text-emerald-600" />
                                    <CardTitle className="text-lg text-slate-800">Kanvas Denah Interaktif</CardTitle>
                                </div>
                                
                                {activeProject?.site_plan_image && (
                                    <div className="flex items-center gap-6">
                                        <div className="hidden sm:flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="font-medium text-slate-600">Tersedia</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500"></div><span className="font-medium text-slate-600">Booking</span></div>
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="font-medium text-slate-600">Sold</span></div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border shadow-sm">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200" onClick={() => setScale(s => Math.max(0.1, s - 0.2))}><ZoomOut className="w-4 h-4 text-slate-600" /></Button>
                                            <span className="text-xs font-semibold w-12 text-center text-slate-700">{Math.round(scale * 100)}%</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-200" onClick={() => setScale(s => Math.min(5, s + 0.2))}><ZoomIn className="w-4 h-4 text-slate-600" /></Button>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-9 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700" onClick={() => setIsDeleteDialogOpen(true)}>
                                            <Trash2 className="w-4 h-4 mr-2 hidden sm:block" /> <span className="hidden sm:block">Hapus Denah</span>
                                            <Trash2 className="w-4 h-4 sm:hidden" />
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            
                            <CardContent 
                                id="canvas-container"
                                className="p-0 flex-1 relative bg-slate-50/50 overflow-hidden" 
                                onWheel={activeProject?.site_plan_image ? handleWheel : undefined}
                                onMouseDown={activeProject?.site_plan_image ? handleCanvasMouseDown : undefined}
                                onMouseMove={activeProject?.site_plan_image ? handleCanvasMouseMove : undefined}
                                onMouseUp={activeProject?.site_plan_image ? handleCanvasMouseUp : undefined}
                                onMouseLeave={activeProject?.site_plan_image ? handleCanvasMouseUp : undefined}
                            >
                                <div 
                                    id="canvas-wrapper"
                                    className="absolute transform-gpu origin-top-left transition-transform duration-75"
                                    style={{ 
                                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                                        cursor: isDraggingCanvas ? 'grabbing' : 'grab'
                                    }}
                                >
                                    <div 
                                        id="map-image-wrapper"
                                        className="relative inline-block shadow-lg"
                                        onDrop={handleCanvasDrop}
                                        onDragOver={handleCanvasDragOver}
                                    >
                                        <img 
                                            src={`/storage/${activeProject.site_plan_image}`} 
                                            alt="Site Plan" 
                                            className="max-w-none block bg-white"
                                            draggable={false}
                                        />

                                        {mappedKavlings.map(kavling => (
                                            <div 
                                                key={kavling.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, kavling)}
                                                className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center text-[10px] font-bold text-white transition-transform hover:scale-125 z-10 group ${getSalesColor(kavling.status_jual)}`}
                                                style={{ 
                                                    left: `${kavling.x_coord}%`, 
                                                    top: `${kavling.y_coord}%` 
                                                }}
                                            >
                                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 whitespace-nowrap bg-black text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-50">
                                                    Blok {kavling.nomor_blok}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            {activeProject?.site_plan_image && (
                                <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
                                    <div className="bg-slate-800/80 backdrop-blur-md px-5 py-2.5 rounded-full text-white text-xs shadow-lg border border-slate-700/50 flex items-center gap-3">
                                        <span><kbd className="bg-slate-700/80 border border-slate-600 px-2 py-0.5 rounded mr-1.5 font-sans font-semibold">Tarik</kbd> untuk geser</span>
                                        <span><kbd className="bg-slate-700/80 border border-slate-600 px-2 py-0.5 rounded mr-1.5 font-sans font-semibold">Scroll</kbd> untuk zoom</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right: Sidebar Unmapped Kavlings */}
                    <div 
                        className="w-full lg:w-[320px] flex flex-col gap-4"
                        onDrop={handleSidebarDrop}
                        onDragOver={handleCanvasDragOver}
                    >
                        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden bg-white flex-1 flex flex-col max-h-[750px]">
                            <CardHeader className="border-b bg-white px-5 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Map className="w-5 h-5 text-emerald-600" />
                                        <CardTitle className="text-base font-bold text-slate-800">Belum Dipetakan</CardTitle>
                                    </div>
                                    <Badge variant="secondary" className="font-mono bg-emerald-100 text-emerald-800 border-emerald-200">{unmappedKavlings.length}</Badge>
                                </div>
                                <CardDescription className="text-xs mt-1 text-slate-600">Tarik (drag) blok di bawah ini ke atas kanvas denah</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/30">
                                <div className="flex flex-col gap-3">
                                    {!activeProject ? (
                                        <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center">
                                            <Info className="w-10 h-10 mb-2 text-slate-300" />
                                            Silakan pilih proyek terlebih dahulu.
                                        </div>
                                    ) : unmappedKavlings.length === 0 ? (
                                        <div className="text-center py-10 text-slate-400 text-sm flex flex-col items-center">
                                            <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-400" />
                                            Semua unit sudah dipetakan.
                                        </div>
                                    ) : (
                                        unmappedKavlings.map(kavling => (
                                            <div
                                                key={kavling.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, kavling)}
                                                className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-emerald-300 hover:shadow-md transition-all flex items-center gap-4 group"
                                            >
                                                <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm ${getSalesColor(kavling.status_jual)}`}></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 text-[15px]">Blok {kavling.nomor_blok}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{kavling.luas_tanah_aktual}</div>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded-xl opacity-50 group-hover:opacity-100 group-hover:bg-emerald-50 transition-all">
                                                    <GripHorizontal className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Gambar Denah?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus gambar latar denah interaktif. Semua penanda (pin) kavling yang sudah Anda petakan akan tetap tersimpan posisinya, namun tidak akan terlihat tanpa latar denah. Anda dapat mengunggah ulang denah baru kapan saja.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteImage} className="bg-rose-600 hover:bg-rose-700 text-white">
                            Ya, Hapus Denah
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
