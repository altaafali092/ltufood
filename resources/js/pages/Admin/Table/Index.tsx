import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { create, index } from '@/routes/admin/tables';
import { RestaurantTable } from '@/types/admin/Table';
import { columns } from './columns';

interface Props {
    tables: RestaurantTable[];
}

TableIndex.layout = {
    breadcrumbs: [
        {
            title: 'Tables',
            href: index().url,
        },
    ],
};

export default function TableIndex({ tables }: Props) {
    return (
        <>
            <Head title="Tables" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tables</h1>
                        <p className="text-muted-foreground">
                            Manage QR tables for customer ordering.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Table
                        </Link>
                    </Button>
                </div>

                <div className="container mx-auto py-6">
                    <DataTable columns={columns} data={tables || []} />
                </div>
            </div>
        </>
    );
}
