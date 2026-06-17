import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

import { Toaster } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Handle Inertia error pages (e.g. "Error" component with status prop)
        const pages = import.meta.glob('./pages/**/*.tsx');
        return resolvePageComponent(`./pages/${name}.tsx`, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster
                    toastOptions={{
                        className: 'glass-panel border border-emerald-500/20 text-slate-800 dark:text-white backdrop-blur-xl',
                    }}
                />
            </>
        );
    },
    progress: {
        color: '#6366f1',
    },
});

// This will set light / dark mode on load...
initializeTheme();
