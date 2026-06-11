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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        {can('usermanagements.create') && (
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Inventory Items List</CardTitle>
                                    <Button onClick={() => openModal('newItem')}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
                                    </Button>
                                </div>
                            </CardHeader>
                        )}
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


