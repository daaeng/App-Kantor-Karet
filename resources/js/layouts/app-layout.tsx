import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage<any>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success('Success', { description: flash.success });
        }
        if (flash?.error) {
            toast.error('Error', { description: flash.error });
        }
        if (flash?.message) {
            toast.info('Info', { description: flash.message });
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            <div className="relative z-0 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                {children}
            </div>
        </AppLayoutTemplate>
    );
};
