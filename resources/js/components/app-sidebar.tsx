import React from 'react';
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
    useSidebar,
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
import { cn } from '@/lib/utils';

// 1. Definisikan tipe untuk Item dan Group
interface NavItem {
    title: string;
    href: string;
    icon: any;
    permission?: string;
}

interface NavGroup {
    label: string;
    icon?: any; // ikon ringkas yang tampil saat sidebar diciutkan
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
        icon: UserCog2,
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
        icon: Banknote,
        items: [
            {
                title: 'Invoice / Nota',
                href: '/notas',
                icon: ReceiptText,
                permission: 'notas.view',
            },
            {
                title: 'Kasbon & Piutang',
                href: '/kasbons',
                icon: HandCoins,
                permission: 'kasbons.view',
            },
            {
                title: 'Payroll / Penggajian',
                href: '/payroll',
                icon: Banknote,
                permission: 'payroll.view',
            },
            {
                title: 'Administrasi',
                href: '/administrasis',
                icon: ChartArea,
                permission: 'administrasis.view',
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
        icon: Notebook,
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
                icon: BookUp2,
                permission: 'requests.view',
            },
        ]
    },
    {
        label: "Supplier & Pembelian",
        icon: Store,
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
        icon: Leaf,
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
        icon: Building2,
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
    const { setOpen, state } = useSidebar();
    const activeProjectName = global_real_estate.projects.find(
        (p) => p.id === global_real_estate.active_project_id
    )?.name;

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

                {global_real_estate.projects.length > 0 && (
                    <div className="px-2 pb-1">
                        {/* Versi lengkap: hanya tampil saat sidebar terbuka */}
                        <div className="group-data-[collapsible=icon]:hidden">
                            <Select
                                value={global_real_estate.active_project_id?.toString() || ''}
                                onValueChange={(val) => {
                                    router.post('/real-estate/housing-project/set-active', {
                                        housing_project_id: val
                                    }, { preserveScroll: true, preserveState: false });
                                }}
                            >
                                <SelectTrigger
                                    className={cn(
                                        "h-9 w-full rounded-md text-xs font-medium",
                                        activeProjectName
                                            ? 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200'
                                            : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400'
                                    )}
                                >
                                    <Briefcase className="mr-1 h-3.5 w-3.5 shrink-0" />
                                    <SelectValue placeholder="Pilih proyek aktif" />
                                </SelectTrigger>
                                <SelectContent className="rounded-md border-gray-200 dark:border-gray-800">
                                    {global_real_estate.projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()} className="text-xs">
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Versi ikon: hanya tampil saat sidebar diciutkan */}
                        <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    tooltip={activeProjectName ? `Proyek aktif: ${activeProjectName}` : "Pilih proyek aktif"}
                                    onClick={() => setOpen(true)}
                                    isActive={!!activeProjectName}
                                >
                                    <Briefcase />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent className="custom-scrollbar">
                {groupedNavItems.map((group, groupIndex) => {
                    const visibleItems = (group.items || []).filter(item =>
                        !item.permission || userPermissions.includes(item.permission)
                    );

                    if (visibleItems.length === 0) return null;

                    const isGroupActive = visibleItems.some(item => currentUrl.startsWith(item.href));
                    const GroupIcon = group.icon;

                    const renderItem = (item: any) => {
                        const isActive = currentUrl.startsWith(item.href);
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={item.title}
                                >
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    };

                    // Grup "Platform" - karena dia harus selalu tampil, tidak collapsible
                    if (group.label === "Platform") {
                        return (
                            <React.Fragment key={groupIndex}>
                                {/* Tampilkan item lengkap saat sidebar terbuka */}
                                <div className="group-data-[collapsible=icon]:hidden">
                                    <SidebarGroup>
                                        <SidebarGroupLabel className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                            Platform
                                        </SidebarGroupLabel>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                {visibleItems.map(renderItem)}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                </div>

                                {/* Tampilkan ikon grup saat sidebar tertutup */}
                                <div className="hidden group-data-[collapsible=icon]:block">
                                    <SidebarMenu>
                                        {visibleItems.map((item) => {
                                            const isActive = currentUrl.startsWith(item.href);
                                            return (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={isActive}
                                                        tooltip={item.title}
                                                    >
                                                        <Link href={item.href}>
                                                            <item.icon />
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </div>
                            </React.Fragment>
                        );
                    }

                    const defaultOpen = isGroupActive;
                    const showRealEstateBadge = group.label === "Real Estate (Properti)" && !global_real_estate.active_project_id;

                    return (
                        <React.Fragment key={groupIndex}>
                        {/* Tampilkan accordion saat sidebar terbuka */}
                        <div className="group-data-[collapsible=icon]:hidden">
                            <Collapsible defaultOpen={defaultOpen} className="group/collapsible">
                                <SidebarGroup>
                                    <SidebarGroupLabel asChild className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md transition-colors">
                                        <CollapsibleTrigger className="flex w-full items-center gap-2">
                                            {GroupIcon && <GroupIcon className="h-4 w-4 shrink-0" />}
                                            <span className="truncate">{group.label}</span>
                                            {showRealEstateBadge && (
                                                <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                                    pilih proyek
                                                </span>
                                            )}
                                            <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                        </CollapsibleTrigger>
                                    </SidebarGroupLabel>
                                    <CollapsibleContent>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                {visibleItems.map(renderItem)}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                        </div>

                        {/* Tampilkan ikon grup saat sidebar tertutup */}
                        <div className="hidden group-data-[collapsible=icon]:block">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip={group.label}
                                        isActive={isGroupActive}
                                        onClick={() => setOpen(true)}
                                    >
                                        {GroupIcon && <GroupIcon />}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </div>
                    </React.Fragment>
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
