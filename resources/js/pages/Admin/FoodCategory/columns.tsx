import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link, router } from "@inertiajs/react";
import { Pencil, Trash } from "lucide-react";
import { FoodCategory } from "@/types/admin/FoodCategory";
import { destroy, edit } from "@/routes/admin/food-categories";

export const columns: ColumnDef<FoodCategory>[] = [
    {
        accessorKey: "id",
        header: "Id",
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
            const image = row.getValue("image") as string;
            return image ? (
                <img
                    src={image}
                    alt={row.getValue("title")}
                    className="h-20 w-20 object-fill rounded"
                />
            ) : (
                <div className="h-32 w-32 rounded bg-gray-200" />
            );
        },
    },

    {
        accessorKey: "title",
        header: "Title",
    },
    {
        accessorKey: "slug",
        header: "Slug",
    },

    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const foodCategory = row.original;

            return (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={edit(foodCategory.id).url}>
                            <Pencil className="h-4 w-4" />
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
                                    destroy(foodCategory.id).url,
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