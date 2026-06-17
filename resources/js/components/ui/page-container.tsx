import React, { ReactNode } from 'react';

export const PageContainer = ({ children }: { children: ReactNode }) => {
    return (
        <div className="w-full -mt-20 relative z-20 pb-12 space-y-6 font-sans">
            {children}
        </div>
    );
};
