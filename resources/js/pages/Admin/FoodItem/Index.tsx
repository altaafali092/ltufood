import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

import { Plus } from 'lucide-react';
import { columns } from './columns';
import { Head, Link } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { PaginatedData } from '@/types';
import { FoodItem } from '@/types/admin/FoodItem';
import { create, index } from '@/routes/admin/food-items';

interface Props {
    foodItems: PaginatedData<FoodItem>;
}

FoodItemIndex.layout = {
    breadcrumbs: [
        {
            title: 'Food items',
            href: index().url,
        },
    ],
};

export default function FoodItemIndex({ foodItems }: Props) {
    return (
        <>
            <Head title="Food Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Food Items</h1>
                        <p className="text-muted-foreground">
                            Manage application food items.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={create().url} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create Food Items
                        </Link>
                    </Button>
                </div>


                <div className="flex-1">
                     <div className="flex-1">
                    <div className="container mx-auto py-6">
                        <DataTable
                            columns={columns}
                            data={foodItems || []}
                        />
                      
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}


