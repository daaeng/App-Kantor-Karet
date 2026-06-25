import React from 'react';
import { toast } from 'sonner';
import { NavUser } from '@/components/nav-user';
import { NavFooter } from '@/components/nav-footer';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarRail,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    ChartArea,
    UserCog2,
    PackageIcon,
    ReceiptText,
    Notebook,
    HandCoins,
    UsersRound,
    PackageOpen,
    BookUser,
    Banknote,
    Archive,
    Clock,
    BookUp2,
    Users,
    Calculator,
    Home,
    MapPin,
    Map,
    CalendarClock,
    Store,
    ReceiptText as ReceiptIcon,
    Briefcase,
    Users as UsersIcon,
    Handshake,
    Landmark,
    ChevronDown,
    Building2,
    Leaf,
} from 'lucide-react';
import AppLogo from './app-logo';

// 1. Definisikan tipe untuk Item dan Group
interface NavItem {
    title: string;
    href: string;
    icon: any;
    permission?: string;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

// 2. Interface Props
interface PageProps {
    auth: {
        user: any;
        permissions: string[];
    };
    global_real_estate?: {
        projects: { id: number; name: string }[];
        active_project_id: number | null;
    };
    [key: string]: any;
}

// 3. Konfigurasi Menu (DIKELOMPOKKAN & DIURUTKAN ULANG)
const groupedNavItems: NavGroup[] = [
    {
        label: "Platform",
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
            },
            {
                title: 'Customer / Client',
                href: '/customers',
                icon: Users,
                permission: 'products.view',
            },
        ]
    },
    {
        label: "SDM & Manajemen User",
        items: [
            {
                title: 'Data Pegawai',
                href: '/pegawai',
                icon: BookUser,
                permission: 'pegawai.view',
            },
            {
                title: 'Absensi',
                href: '/attendances',
                icon: Clock,
            },
            {
                title: 'User Management',
                href: '/usermanagements',
                icon: UserCog2,
                permission: 'usermanagements.view',
            },
            {
                title: 'Role & Permission',
                href: '/roles',
                icon: Notebook,
                permission: 'roles.view',
            },
        ]
    },

    {
        label: "Keuangan & Administrasi",
        items: [
            {
                title: 'Invoice / Nota',
                href: '/notas',
                icon: ReceiptText ,
                permission: 'notas.view',
            },
            {
                title: 'Kasbon & Piutang',
                href: '/kasbons',
                icon: HandCoins,
                permission: 'kasbons.view',
            },
            {
                title: 'Administrasi',
                href: '/administrasis',
                icon: ChartArea,
                permission: 'administrasis.view',
            },
            {
                title: 'Payroll / Penggajian',
                href: '/payroll',
                icon: Banknote,
                permission: 'payroll.view',
            },
            {
                title: 'Keuangan Properti',
                href: '/real-estate/transaksi-keuangan',
                icon: Landmark,
                permission: 'transaksi-keuangan.view',
            },
        ]
    },
    {
        label: "Pemberkasan & Surat",
        items: [
            {
                title: 'Surat Masuk',
                href: '/incoming-mails',
                icon: Archive,
            },
            {
                title: 'Surat Keluar',
                href: '/outgoing-mails',
                icon: Archive,
            },
            {
                title: 'Manajemen Berkas PT',
                href: '/company-documents',
                icon: Notebook,
            },
            {
                title: 'Permintaan Barang (PPB)',
                href: '/ppb',
                icon: BookUp2 ,
                permission: 'requests.view',
            },
        ]
    },
    {
        label: "Supplier & Pembelian",
        items: [
            {
                title: 'Supplier',
                href: '/real-estate/toko-material',
                icon: Store,
                permission: 'toko-material.view',
            },
            {
                title: 'Nota Penerimaan',
                href: '/real-estate/material-receipt',
                icon: ReceiptIcon,
                permission: 'material-receipts.view',
            },
        ]
    },
    {
        label: "Perkebunan Karet",
        items: [
            {
                title: 'Product / Barang',
                href: '/products',
                icon: PackageIcon,
                permission: 'products.view',
            },
            {
                title: 'Inventory / Gudang',
                href: '/inventories',
                icon: Archive,
            },
            {
                title: 'Penoreh (Incisor)',
                href: '/incisors',
                icon: UsersRound,
                permission: 'incisor.view',
            },
            {
                title: 'Hasil Toreh',
                href: '/inciseds',
                icon: PackageOpen,
                permission: 'incised.view',
            },
            {
                title: 'Estimasi Penimbangan',
                href: '/estimations',
                icon: Calculator,
                permission: 'requests.view',
            },
        ]
    },
    {
        label: "Real Estate (Properti)",
        items: [
            {
                title: 'Data Proyek Perumahan',
                href: '/real-estate/housing-project',
                icon: Briefcase,
            },
            {
                title: 'Site Plan (Denah)',
                href: '/real-estate/site-plan',
                icon: Map,
            },
            {
                title: 'Master Tipe Rumah',
                href: '/real-estate/tipe-rumah',
                icon: Home,
            },
            {
                title: 'Blok & Kavling',
                href: '/real-estate/blok-kavling',
                icon: MapPin,
            },
            {
                title: 'Fase Pembangunan',
                href: '/real-estate/project-phase',
                icon: CalendarClock,
            },
            {
                title: 'Data Konsumen',
                href: '/real-estate/konsumen',
                icon: UsersIcon,
            },
            {
                title: 'Penjualan & KPR',
                href: '/real-estate/penjualan-kavling',
                icon: Handshake,
            },
        ]
    }
];

export function AppSidebar() {
    // 4. Ambil Permissions User
    const { props } = usePage<PageProps>();
    const userPermissions = props.auth.permissions || [];
    const currentUrl = window.location.pathname; // Untuk state aktif
    const global_real_estate = props.global_real_estate || { projects: [], active_project_id: null };

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>


            </SidebarHeader>

            <SidebarContent className="custom-scrollbar">
                {groupedNavItems.map((group, groupIndex) => {
                    // Filter item dalam grup berdasarkan permission
                    const visibleItems = (group.items || []).filter(item =>
                        !item.permission || userPermissions.includes(item.permission)
                    );

                    // Filter subGroups
                    let visibleSubGroups: any[] = [];
                    if (group.subGroups) {
                        visibleSubGroups = group.subGroups.map(sub => ({
                            ...sub,
                            items: sub.items.filter((item: any) => !item.permission || userPermissions.includes(item.permission))
                        })).filter(sub => sub.items.length > 0);
                    }

                    // Jika grup kosong setelah difilter, jangan tampilkan grup ini
                    if (visibleItems.length === 0 && visibleSubGroups.length === 0) return null;

                    // Apakah salah satu item di grup ini sedang aktif?
                    const isGroupActive = visibleItems.some(item => currentUrl.startsWith(item.href)) ||
                                          visibleSubGroups.some(sub => sub.items.some((item: any) => currentUrl.startsWith(item.href)));

                    // Default terbuka jika grupnya aktif atau Dashboard
                    const defaultOpen = isGroupActive || group.label === "Platform";

                    const renderItem = (item: any) => {
                        const isActive = currentUrl.startsWith(item.href);
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={item.title}
                                    className={`transition-all duration-300 rounded-xl mb-1 ${isActive ? 'font-medium text-indigo-700 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/20 shadow-sm border border-indigo-500/10' : 'text-slate-800 font-medium hover:bg-slate-100 hover:text-indigo-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400'}`}
                                >
                                    <Link href={item.href} className="flex items-center gap-3">
                                        <item.icon className={isActive ? "text-indigo-600 dark:text-indigo-400 drop-shadow-sm" : "text-slate-600 dark:text-slate-400"} strokeWidth={isActive ? 2.5 : 1.5} />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    };

                    return (
                        <Collapsible
                            key={groupIndex}
                            defaultOpen={defaultOpen}
                            className="group/collapsible"
                        >
                            <SidebarGroup>
                                {group.label === "Real Estate (Properti)" && global_real_estate.projects.length > 0 && (
                                    <div className="px-2 mb-2 mt-0">
                                        <Select
                                            value={global_real_estate.active_project_id?.toString() || ''}
                                            onValueChange={(val) => {
                                                router.post('/real-estate/housing-project/set-active', {
                                                    housing_project_id: val
                                                }, { preserveScroll: true, preserveState: false });
                                            }}
                                        >
                                            <SelectTrigger className="w-full h-9 text-xs font-semibold bg-indigo-50 border-indigo-500/30 shadow-sm text-indigo-900 rounded-lg">
                                                <SelectValue placeholder="Pilih Proyek Aktif" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {global_real_estate.projects.map((p) => (
                                                    <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {/* Label Kategori */}
                                <SidebarGroupLabel asChild className="mb-1 text-[11px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer rounded-md transition-colors">
                                    <CollapsibleTrigger onClick={(e) => {
                                        if (group.label === "Real Estate (Properti)" && (!global_real_estate || !global_real_estate.active_project_id)) {
                                            e.preventDefault();
                                            toast.warning("Pemilihan Proyek Belum Aktif", {
                                                description: "Silakan pilih proyek terlebih dahulu di atas.",
                                                duration: 3000
                                            });
                                        }
                                    }}>
                                        {group.label}
                                        <ChevronDown className="ml-auto w-4 h-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>

                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        {visibleItems.length > 0 && (
                                            <SidebarMenu>
                                                {visibleItems.map(renderItem)}
                                            </SidebarMenu>
                                        )}
                                        {visibleSubGroups.length > 0 && (
                                            <div className="flex flex-col mt-1">
                                                {visibleSubGroups.map((subGroup, subIdx) => (
                                                    <div key={subIdx} className="mb-3">
                                                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 px-2 border-b border-slate-100 dark:border-slate-800 pb-1 mx-2">{subGroup.label}</div>
                                                        <SidebarMenu>
                                                            {subGroup.items.map(renderItem)}
                                                        </SidebarMenu>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    );
                })}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
