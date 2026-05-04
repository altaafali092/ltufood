import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link, router } from "@inertiajs/react";
import { EyeIcon, Pencil, Trash } from "lucide-react";


import { FoodItem } from "@/types/admin/FoodItem";
import { destroy, edit, show } from "@/routes/admin/food-items";

export const columns: ColumnDef<FoodItem>[] = [
    {
        accessorKey: "id",
        header: "Id",
        cell: ({ row }) => row.index + 1,
    },
   

    {
        accessorKey: "images",
        header: "Images",
        cell: ({ row }) => {
            const images = row.getValue("images") as string[];
            if (!images || images.length === 0) {
                return <div className="h-32 w-32 rounded bg-gray-200" />;
            }
            const randomIndex = Math.floor(Math.random() * images.length);
            return (
                <img
                    src={images[randomIndex]}
                    alt={row.getValue("title")}
                    className="h-20 w-20 object-fill rounded"
                />
            );
        },
    },
     {
        accessorKey: "food_category.title",
        header: "Category",
    },

    {
        accessorKey: "title",
        header: "Title",
    },
    // {
    //     accessorKey: "slug",
    //     header: "Slug",
    // },

    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const foodItem = row.original;

            return (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={edit(foodItem.id).url}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={show(foodItem.id).url}>
                            <EyeIcon className="h-4 w-4" />
                        </Link>
                    </Button>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (
                                confirm(
                                    "Are you sure you want to delete this category?"
                                )
                            ) {
                                router.delete(
                                    destroy(foodItem.id).url,
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
