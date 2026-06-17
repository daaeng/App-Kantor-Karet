import React, { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: React.ElementType;
    children?: ReactNode;
}

export const PageHeader = ({ title, description, icon: Icon, children }: PageHeaderProps) => {
    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 pb-32 pt-12 rounded-xl shadow-sm mb-6">
            <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
            <div className="relative z-10 px-6 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-white mb-2">
                        {Icon && (
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-sm">
                                <Icon className="h-8 w-8" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight drop-shadow-sm">{title}</h1>
                            {description && <p className="text-blue-100/90 mt-1 font-medium">{description}</p>}
                        </div>
                    </div>
                    {children && (
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
