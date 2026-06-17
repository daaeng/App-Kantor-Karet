// ./resources/js/Pages/UserManagements/Index.tsx

import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CheckCircle2, CirclePlus, Eye, Mail, Pencil, Search, Trash2, User, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/usermanagements',
    },
];

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    flash: {
        message?: string;
    };
    usermanagements: {
        data: User[];
        links: PaginationLink[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    filter?: { search?: string };
}

export default function Index({ usermanagements, flash, filter }: PageProps) {
    const { processing, delete: destroy } = useForm();
    const [searchValue, setSearchValue] = useState(filter?.search || '');

    useEffect(() => {
        setSearchValue(filter?.search || '');
    }, [filter?.search]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const performSearch = () => {
        router.get(
            route('usermanagements.index'),
            { search: searchValue },
            {
                preserveState: true,
                replace: true,
                only: ['usermanagements', 'filter'],
            }
        );
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete user: ${name}?`)) {
            destroy(route('usermanagements.destroy', id), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    router.get(route('usermanagements.index'), { search: searchValue }, { preserveState: true });
                },
            });
        }
    };

    const renderPagination = (links: PaginationLink[]) => {
        return (
            <div className="flex justify-center items-center py-4 space-x-1 border-t border-gray-200 dark:border-gray-700">
                {links.map((link, index) => (
                    link.url === null ? (
                        <div
                            key={index}
                            className="px-3 py-1 text-xs text-gray-400 border border-transparent"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <Link
                            key={`link-${index}`}
                            href={link.url}
                            className={`px-3 py-1 text-xs rounded-md transition-colors border ${
                                link.active
                                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                            }`}
                            preserveState
                            preserveScroll
                        >
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Link>
                    )
                ))}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <Users className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                                <p className="text-indigo-100 mt-1">Manage user accounts, assign roles, and monitor access.</p>
                            </div>
                        </div>
                        {can('usermanagements.create') && (
                            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                                <Link href={route('usermanagements.create')}>
                                    <Button className="bg-white text-indigo-700 hover:bg-indigo-50 border-0 shadow-lg font-bold">
                                        <CirclePlus className="mr-2 h-4 w-4" />
                                        Add New User
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 w-full -mt-20 relative z-20 pb-12 space-y-6">

                {/* Flash Message */}
                {flash.message && (
                    <Alert className="bg-white dark:bg-gray-800 border-l-4 border-l-emerald-500 border-y border-r border-gray-200 dark:border-gray-700 shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div className="ml-2">
                            <AlertTitle className="text-gray-900 dark:text-gray-100 font-medium">Success</AlertTitle>
                            <AlertDescription className="text-gray-600 dark:text-gray-400">
                                {flash.message}
                            </AlertDescription>
                        </div>
                    </Alert>
                )}

                {/* Main Content Card */}
                <div className="bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
                    {/* Toolbar: Search */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                placeholder="Search by name, email, or role..."
                                value={searchValue}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <Button variant="secondary" onClick={performSearch} className="w-full sm:w-auto">
                            Search
                        </Button>
                    </div>

                    {/* Table */}
                    {usermanagements.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:pl-6 w-20">ID</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">User</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Roles</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                        {usermanagements.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-400 sm:pl-6">
                                                    #{user.id}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
                                                            <User className="h-4 w-4" />
                                                        </div>
                                                        <span className="capitalize">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex flex-wrap items-center gap-2 max-w-xs">
                                                        {user.roles.length > 0 ? (
                                                            user.roles.map((role) => (
                                                                <span
                                                                    key={role.id}
                                                                    className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10"
                                                                >
                                                                    {role.name}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 italic text-xs">No roles assigned</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {can('usermanagements.view') && (
                                                            <Link
                                                                href={route('usermanagements.show', user.id)}
                                                                className="text-gray-400 hover:text-emerald-600 dark:hover:text-indigo-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        )}
                                                        {can('usermanagements.edit') && (
                                                            <Link
                                                                href={route('usermanagements.edit', user.id)}
                                                                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        )}
                                                        {can('usermanagements.delete') && (
                                                            <button
                                                                onClick={() => handleDelete(user.id, user.name)}
                                                                disabled={processing}
                                                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(usermanagements.links)}
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <div className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600">
                                <Users className="h-12 w-12" />
                            </div>
                            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {searchValue ? 'Try adjusting your search terms.' : 'Get started by creating a new user.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
        </AppLayout>
    );
}

