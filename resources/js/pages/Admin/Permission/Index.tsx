import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

import { Plus } from 'lucide-react';
import { columns } from './columns';
import { Head, Link } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { PaginatedData } from '@/types';
import { Permission } from '@/types/admin/RolePermisson';
import { create, index } from '@/routes/admin/permission';

interface Props {
  permissions: PaginatedData<Permission>;
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Permission',
            href: index().url,
        },
    ],
};

export default function Index({ permissions }: Props) {
 
    return (
        <>
            <Head title="Permissions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Permissions</h1>
                        <p className="text-muted-foreground">
                            Manage application permissions.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Permission
                        </Link>
                    </Button>
                </div>


                <div className="flex-1">
                     <div className="flex-1">
                    <div className="container mx-auto py-6">
                        <DataTable
                            columns={columns}
                            data={permissions || []}
                        />
                      
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}


