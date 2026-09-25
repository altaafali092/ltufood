import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { EyeIcon, Pencil, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RestaurantTable } from '@/types/admin/Table';
import { destroy, edit, show } from '@/routes/admin/tables';
import { tableUpdate } from '@/routes/admin';
import { Switch } from '@/components/ui/switch';

export const columns = (
    can: (permission: string) => boolean
): ColumnDef<RestaurantTable>[] => [
    {
        accessorKey: 'id',
        header: 'Id',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'table_number',
        header: 'Table Number',
    },
    {
        accessorKey: 'is_occupied',
        header: 'Status',
        cell: ({ row }) => {
            const table = row.original;

            const updateToggle = () => {
                // Changing server state should generally be a PATCH or PUT request
                router.patch(
                    tableUpdate(table.id),
                    { is_occupied: !table.is_occupied },
                    { preserveScroll: true }
                );
            };

            return (
                <div className="flex items-center gap-3">
                    <Switch
                        checked={table.is_occupied}
                        onCheckedChange={updateToggle}
                    />
                    <Badge variant={table.is_occupied ? 'destructive' : 'default'}>
                        {table.is_occupied ? 'Occupied' : 'Available'}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'radius_meters',
        header: 'Radius',
        cell: ({ row }) => `${row.original.radius_meters}m`,
    },
    {
        accessorKey: 'orders_count',
        header: 'Orders',
        cell: ({ row }) => row.original.orders_count ?? 0,
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const table = row.original;

            return (
                <div className="flex gap-2">
                    {can('edit table') && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={edit(table.id).url}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                    {can('view table') && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={show(table.id).url}>
                                <EyeIcon className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                    {can('delete table') && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                if (
                                    confirm(
                                        'Are you sure you want to delete this table?'
                                    )
                                ) {
                                    router.delete(destroy(table.id).url, {
                                        preserveScroll: true,
                                    });
                                }
                            }}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            );
        },
    },
];