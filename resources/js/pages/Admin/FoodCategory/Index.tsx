import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { PaginatedData, type BreadcrumbItem } from '@/types';
import { Plus } from 'lucide-react';
import { columns } from './columns';
import { FoodCategory } from '@/types/admin/FoodCategory';
import { create, index } from '@/routes/admin/food-categories';
import { Head, Link } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';

interface Props {
    foodCategories: PaginatedData<FoodCategory>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Food Categories',
        href: index().url,
    },
];

export default function FoodCategoryIndex({ foodCategories }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Food Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Food Categories</h1>
                        <p className="text-muted-foreground">
                            Manage application food categories.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Food Category
                        </Link>
                    </Button>
                </div>

                <div className="flex-1">
                    <div className="container mx-auto py-4">
                        <DataTable columns={columns} data={foodCategories.data || []} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
