export default function Heading({ title, description }: { title: string; description?: string }) {
    return (
        <div className="mb-6 w-full">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
            {description && <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">{description}</p>}
        </div>
    );
}
