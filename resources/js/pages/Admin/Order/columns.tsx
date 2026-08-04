import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link, router } from "@inertiajs/react";
import { EyeIcon, Pencil, Trash } from "lucide-react";
import { Permission } from "@/types/admin/RolePermisson";
import { destroy, edit, show } from "@/routes/admin/permission";

export const columns: ColumnDef<Permission>[] = [
    {
        accessorKey: "id",
        header: "Id",
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: "name",
        header: "Title",
        
    },
   
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const permission = row.original;

            return (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={edit(permission.id).url}>
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
                                    destroy(permission.id).url,
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
