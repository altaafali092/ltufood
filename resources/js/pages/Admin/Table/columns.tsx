import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react';
import { EyeIcon, Pencil, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RestaurantTable } from '@/types/admin/Table';
import { destroy, edit, show } from '@/routes/admin/tables';

export const columns: ColumnDef<RestaurantTable>[] = [
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
        cell: ({ row }) => (
            <Badge variant={row.original.is_occupied ? 'destructive' : 'default'}>
                {row.original.is_occupied ? 'Occupied' : 'Available'}
            </Badge>
        ),
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
                    <Button variant="outline" size="sm" asChild>
                        <Link href={edit(table.id).url}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={show(table.id).url}>
                            <EyeIcon className="h-4 w-4" />
                        </Link>
                    </Button>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (
                                confirm(
                                    'Are you sure you want to delete this table?'
                                )
                            ) {
                                router.delete(
                                    destroy(table.id).url,
                                    {
                                        preserveScroll: true,
                                    }
                                );
                            }
                        }}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            );
        },
    },
];
