import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Inventory as InventoryType, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, History, ArrowDownToDot, ArrowUpFromDot } from 'lucide-react';
import {
    NewItemModal,
    StockInModal,
    StockOutModal,
    EditItemModal,
    DeleteItemModal
} from './Partials/InventoryModals';
import { can } from '@/lib/can';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inventory',
        href: route('inventories.index'),
    },
];

export default function Index({ inventories, users }: PageProps<{ inventories: InventoryType[], users: User[] }>) {
    const [selectedInventory, setSelectedInventory] = useState<InventoryType | null>(null);
    const [modalState, setModalState] = useState({
        newItem: false,
        stockIn: false,
        stockOut: false,
        editItem: false,
        deleteItem: false,
    });

    const openModal = (modal: keyof typeof modalState, inventory: InventoryType | null = null) => {
        setSelectedInventory(inventory);
        setModalState(prev => ({ ...prev, [modal]: true }));
    };

    const closeModal = (modal: keyof typeof modalState) => {
        setModalState(prev => ({ ...prev, [modal]: false }));
        setSelectedInventory(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Office Inventory" />

            <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-800 pb-32 pt-12">
                <div className="absolute inset-0 bg-[url('/img/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 px-6 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-white mb-2">
                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                <PlusCircle className="h-8 w-8" /> 
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Office Inventory</h1>
                                <p className="text-cyan-100 mt-1">Kelola stok gudang dan aset barang kantor.</p>
                            </div>
                        </div>
                        {can('usermanagements.create') && (
                            <Button onClick={() => openModal('newItem')} className="bg-white text-emerald-700 hover:bg-emerald-50 border-0 shadow-lg font-bold">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 w-full -mt-20 relative z-20 pb-12 space-y-6">
                <div className="max-w-7xl mx-auto">
                    <Card className="border-none shadow-sm rounded-xl overflow-hidden">
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead>Current Stock</TableHead>
                                        <TableHead className="text-center">Unit</TableHead>
                                        
                                        {can('usermanagements.view') && (
                                            <TableHead className="text-right">Actions</TableHead>
                                        )}

                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inventories.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                {item.stock <= item.low_stock_threshold ? (
                                                    <Badge variant="destructive">Low Stock: {item.stock}</Badge>
                                                ) : (
                                                    <Badge variant="secondary">{item.stock}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">{item.unit}</TableCell>
                                            {can('usermanagements.edit') && (
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => openModal('stockIn', item)}>
                                                        <ArrowDownToDot className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => openModal('stockOut', item)} disabled={item.stock === 0}>
                                                        <ArrowUpFromDot className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => openModal('editItem', item)}>
                                                        Edit
                                                    </Button>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={route('inventories.show', item.id)}>
                                                            <History className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => openModal('deleteItem', item)}>
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <NewItemModal isOpen={modalState.newItem} onClose={() => closeModal('newItem')} />
            
            {selectedInventory && (
                <>
                    <StockInModal isOpen={modalState.stockIn} onClose={() => closeModal('stockIn')} inventory={selectedInventory} />
                    <StockOutModal isOpen={modalState.stockOut} onClose={() => closeModal('stockOut')} inventory={selectedInventory} users={users} />
                    <EditItemModal isOpen={modalState.editItem} onClose={() => closeModal('editItem')} inventory={selectedInventory} />
                    <DeleteItemModal isOpen={modalState.deleteItem} onClose={() => closeModal('deleteItem')} inventory={selectedInventory} />
                </>
            )}

        </AppLayout>
    );
}


