import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <div className="relative z-0">
            {children}
        </div>
        <Toaster 
            toastOptions={{ 
                className: 'glass-panel border border-emerald-500/20 text-slate-800 dark:text-white backdrop-blur-xl',
            }} 
        />
    </AppLayoutTemplate>
);
