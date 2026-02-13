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
import { Link, usePage } from '@inertiajs/react';
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
        ]
    },
    // [PINDAH KE ATAS] SDM & Manajemen User
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
                title: 'Customer / Client',
                href: '/customers',
                icon: Users,
                permission: 'products.view',
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
        label: "Operasional & Produksi",
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
                // permission: 'inventories.view',
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
                title: 'Permintaan Barang (PPB)',
                href: '/ppb',
                icon: BookUp2 ,
                permission: 'requests.view',
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
                title: 'Administrasi Umum',
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
        ]
    }
];

export function AppSidebar() {
    // 4. Ambil Permissions User
    const { props } = usePage<PageProps>();
    const userPermissions = props.auth.permissions || [];
    const currentUrl = window.location.pathname; // Untuk state aktif

    return (
        <Sidebar collapsible="icon" variant="inset">
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
                    const visibleItems = group.items.filter(item =>
                        !item.permission || userPermissions.includes(item.permission)
                    );

                    // Jika grup kosong setelah difilter, jangan tampilkan grup ini
                    if (visibleItems.length === 0) return null;

                    return (
                        <SidebarGroup key={groupIndex}>
                            {/* Label Kategori */}
                            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {visibleItems.map((item) => {
                                        const isActive = currentUrl.startsWith(item.href);
                                        return (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={isActive}
                                                    tooltip={item.title}
                                                    className={`transition-all duration-200 ${isActive ? 'font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-400'}`}
                                                >
                                                    <Link href={item.href}>
                                                        <item.icon className={isActive ? "text-indigo-600" : ""} />
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
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
