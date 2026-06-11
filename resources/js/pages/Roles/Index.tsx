// ./resources/js/Pages/Roles/Index.tsx

import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { can } from '@/lib/can';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, CirclePlus, Pencil, Shield, Trash2, Users } from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/roles',
    },
];

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface PageProps {
    flash: {
        message?: string;
    };
    roles: Role[];
}

export default function Index({ roles, flash }: PageProps) {
    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete the role: ${name}?`)) {
            destroy(route('roles.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles Management" />

            <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Page Header */}
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <Heading 
                            title="Roles & Permissions" 
                            description="Define roles and assign permissions to control access across the system."
                        />
                    </div>
                    {can('roles.create') && (
                        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                            <Link href={route('roles.create')}>
                                <Button className="bg-emerald-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-200">
                                    <CirclePlus className="mr-2 h-4 w-4" />
                                    Add New Role
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Flash Message - Clean Style */}
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
                    {roles.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        {/* <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:pl-6 w-20">
                                            ID
                                        </th> */}
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Role Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Permissions
                                        </th>
                                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                    {roles.map((role) => (
                                        <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                                            {/* <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-400 sm:pl-6">
                                                #{role.id}
                                            </td> */}
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-emerald-600 dark:text-indigo-400">
                                                        <Shield className="h-4 w-4" />
                                                    </div>
                                                    <span className="capitalize">{role.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-wrap items-center gap-2 max-w-2xl">
                                                    {role.permissions.length > 0 ? (
                                                        <>
                                                            {role.permissions.slice(0, 4).map((permission) => (
                                                                <span 
                                                                    key={permission.id} 
                                                                    className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10"
                                                                >
                                                                    {permission.name}
                                                                </span>
                                                            ))}
                                                            {role.permissions.length > 4 && (
                                                                <span className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-700/10">
                                                                    +{role.permissions.length - 4} more
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">No specific permissions assigned</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    {can('roles.edit') && (
                                                        <Link 
                                                            href={route('roles.edit', role.id)}
                                                            className="text-gray-400 hover:text-emerald-600 dark:hover:text-indigo-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                                            title="Edit Role"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    )}
                                                    {can('roles.delete') && (
                                                        <button
                                                            onClick={() => handleDelete(role.id, role.name)}
                                                            disabled={processing}
                                                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                                                            title="Delete Role"
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
                    ) : (
                        // Empty State - Clean
                        <div className="text-center py-24 bg-white dark:bg-gray-800">
                            <div className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600">
                                <Users className="h-12 w-12" />
                            </div>
                            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No roles found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new role.</p>
                            {can('roles.create') && (
                                <div className="mt-6">
                                    <Link href={route('roles.create')}>
                                        <Button variant="outline" className="border-gray-300 dark:border-gray-600">
                                            <CirclePlus className="mr-2 h-4 w-4" />
                                            Create Role
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
