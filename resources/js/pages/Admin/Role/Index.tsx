import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

import { Plus } from 'lucide-react';
import { columns } from './columns';
import { Head, Link } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { PaginatedData } from '@/types';
import { Permission, Role } from '@/types/admin/RolePermisson';
import { create, index } from '@/routes/admin/role';


interface Props {
  roles: PaginatedData<Role>;
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'role',
            href: index().url,
        },
    ],
};

export default function Index({ roles }: Props) {
 
    return (
        <>
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
                        <p className="text-muted-foreground">
                            Manage application Roles.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Roles
                        </Link>
                    </Button>
                </div>


                <div className="flex-1">
                     <div className="flex-1">
                    <div className="container mx-auto py-6">
                        <DataTable
                            columns={columns}
                            data={roles || []}
                        />
                      
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}


