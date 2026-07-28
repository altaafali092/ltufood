import { Head, Form } from "@inertiajs/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";
import { ArrowLeftIcon } from "lucide-react";

import { Permission, Role } from "@/types/admin/RolePermisson";
import { index, store, update } from "@/routes/admin/role";

const handleBack = () => {
    window.history.back();
};

interface EditProps {
    role: Role
    permissions: Permission[];
}

export default function Edit({ permissions, role }: EditProps) {
    return (
        <>
            <Head title="Create Role" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back
                        </Button>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Create Role
                            </h1>
                            <p className="text-muted-foreground">
                                Add a new role.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role Details</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Form
                            action={update(role.id).url}
                            method="post"
                            className="space-y-6"
                        >
                            {({ errors }) => (
                                <>

                                    <input type="hidden" name="_method" value="put" />

                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Role Name
                                            <span className="text-red-500">*</span>
                                        </Label>

                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            defaultValue={role.name}
                                        />

                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Permissions */}
                                    <div className="space-y-2">
                                        <Label>
                                            Permissions
                                        </Label>

                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 rounded-md border p-4">
                                            {permissions.map((permission) => (
                                                <label
                                                    key={permission.id}
                                                    className="flex items-center gap-2 text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="permission[]"
                                                        value={permission.name}
                                                        defaultChecked={role.permissions.some(
                                                            (item) => item.name === permission.name
                                                        )}
                                                        className="h-4 w-4 accent-blue-600"
                                                    />

                                                    {permission.name}
                                                </label>
                                            ))}
                                        </div>

                                        <InputError
                                            message={errors.permission}
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-2">
                                        <Button type="submit">
                                            Save Role
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleBack}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: "Roles",
            href: index().url,
        },
    ],
};