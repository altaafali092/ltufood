import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Optional: import UI badge for better visual grouping
import { Link, router } from "@inertiajs/react";
import { EyeIcon, Pencil, Trash } from "lucide-react";
import { Role } from "@/types/admin/RolePermisson";
import { destroy, edit } from "@/routes/admin/role";

export const columns: ColumnDef<Role>[] = [
    {
        accessorKey: "id",
        header: "Id",
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: "name",
        header: "Role Name",
    },
    {
        id: "permissions",
        header: "Permissions",
        cell: ({ row }) => {
            const permissions = row.original.permissions;

            if (!permissions || permissions.length === 0) {
                return <span className="text-muted-foreground text-sm">No permissions</span>;
            }

            return (
                <div className="flex flex-wrap gap-1">
                    {permissions.map((perm) => (
                        <Badge key={perm.id} variant="secondary" className="text-xs bg-green-100">
                            {perm.name}
                        </Badge>
                    ))}
                </div>
            );

        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const role = row.original;

            return (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={edit(role.id).url}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (
                                confirm(
                                    "Are you sure you want to delete this role?"
                                )
                            ) {
                                router.delete(
                                    destroy(role.id).url,
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