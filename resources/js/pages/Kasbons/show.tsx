import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Undo2, User, HardHat, FileText, Wallet, CalendarDays, Pencil, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- INTERFACES ---
interface Kasbon {
    id: number;
    owner_type: 'Pegawai' | 'Penoreh';
    owner: {
        name: string;
        identifier_label: string; // 'NIP' atau 'Kode Penoreh'
        identifier_value: string;
    };
    gaji: number;
    kasbon: number;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string | null;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    kasbon: Kasbon;
}

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => {
    if (isNaN(value) || value === null || value === undefined) {
        return "Rp 0";
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) + ' WIB';
}

// --- STYLED COMPONENTS ---
interface StatusPillProps {
    status: 'Pending' | 'Approved' | 'Rejected';
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
    const statusMap = {
        'Approved': { text: 'Disetujui', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
        'Pending': { text: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
        'Rejected': { text: 'Ditolak', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    };
    const currentStatus = statusMap[status] || { text: 'Unknown', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock };
    const Icon = currentStatus.icon;

    return (
        <div className={cn('px-4 py-3 rounded-lg inline-flex items-center gap-3 border', currentStatus.className)}>
            <Icon className="h-5 w-5" />
            <span className="text-base font-semibold">{currentStatus.text}</span>
        </div>
    );
};

interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: string | React.ReactNode;
    iconBgClass?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, iconBgClass = 'bg-gray-100' }) => (
    <div className="flex items-start gap-4">
        <div className={cn("flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center", iconBgClass)}>
            <Icon className="h-6 w-6 text-gray-600" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);


// --- MAIN COMPONENT ---
export default function ShowKasbon({ kasbon } : PageProps) {

    const dynamicBreadcrumbs: BreadcrumbItem[] = [
        { title: 'Kasbon', href: route('kasbons.index') },
        { title: `Detail: ${kasbon.owner.name}`, href: '#' },
    ];

    const ownerIcon = kasbon.owner_type === 'Pegawai' ? User : HardHat;
    const ownerIconBg = kasbon.owner_type === 'Pegawai' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-purple-100 dark:bg-purple-900/50';

    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Detail Kasbon - ${kasbon.owner.name}`} />

            <div className="space-y-6 p-4 md:p-6 bg-gray-50/50 min-h-screen sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Heading title={`Detail Kasbon ${kasbon.owner_type}`} description={`Informasi lengkap untuk kasbon #${kasbon.id}`} />
                    <Link href={route('kasbons.index')}>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Undo2 className="h-4 w-4" /> Kembali
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* --- Kolom Kiri: Detail Utama --- */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Rincian Pengajuan Kasbon</CardTitle>
                                <CardDescription>
                                    Diajukan oleh <span className="font-semibold">{kasbon.owner.name}</span> pada tanggal {formatDate(kasbon.created_at).split(' ')[0]}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                                <InfoItem icon={ownerIcon} label={`Nama ${kasbon.owner_type}`} value={kasbon.owner.name} iconBgClass={ownerIconBg} />
                                <InfoItem icon={FileText} label={kasbon.owner.identifier_label} value={kasbon.owner.identifier_value} iconBgClass="bg-sky-100 dark:bg-sky-900/50" />
                                <InfoItem
                                    icon={Wallet}
                                    label={kasbon.owner_type === 'Penoreh' ? 'Pendapatan Penoreh' : 'Gaji Pokok'}
                                    value={formatCurrency(kasbon.gaji)}
                                    iconBgClass="bg-rose-100 dark:bg-rose-900/50"
                                />
                                <InfoItem
                                    icon={Wallet}
                                    label="Jumlah Kasbon Diajukan"
                                    value={<span className="text-green-600 dark:text-green-400">{formatCurrency(kasbon.kasbon)}</span>}
                                    iconBgClass="bg-green-100 dark:bg-green-900/50"
                                />
                                <InfoItem icon={CalendarDays} label="Tanggal Pengajuan" value={formatDate(kasbon.created_at)} iconBgClass="bg-blue-100 dark:bg-blue-900/50" />
                                <InfoItem icon={Pencil} label="Terakhir Diperbarui" value={formatDate(kasbon.updated_at)} iconBgClass="bg-orange-100 dark:bg-orange-900/50" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- Kolom Kanan: Status & Alasan --- */}
                    <div className="lg:col-span-1 space-y-6">
                         <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle>Status Persetujuan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <StatusPill status={kasbon.status} />
                            </CardContent>
                        </Card>

                        {kasbon.reason && (
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Alasan / Catatan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-base text-gray-700 dark:text-gray-300 italic">"{kasbon.reason}"</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
