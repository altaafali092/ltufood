import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Link, router } from "@inertiajs/react";
import { EyeIcon, Pencil, Trash } from "lucide-react";
import { User } from "@/types";
import { destroy, edit, show } from "@/routes/admin/user";


export const columns: ColumnDef<User>[] = [
    {
        id: "serial",
        header: "S.N.",
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "Role",
        header: "Role",
        cell: ({ row }) => {
            const user = row.original;
            return (
                <div className="flex flex-wrap gap-1">
                    {user.roles?.map((role) => (
                        <span
                            key={role.id}
                            className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-gray-700"
                        >
                            {role.name}
                        </span>
                    ))}
                </div>
            );
        },
    },



    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const user = row.original;

            return (
                <div className="flex gap-2">
                    {/* Edit */}
                    <Button variant="outline" size="sm" asChild>
                        <Link href={edit(user.id)}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={show(user.id)}>
                            <EyeIcon className="h-4 w-4" />
                        </Link>
                    </Button>


                    {/* Delete */}
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this permission?")) {
                                router.delete(destroy(user.id), {
                                    preserveScroll: true,
                                });
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
