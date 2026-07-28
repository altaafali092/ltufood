import { Head, Form } from "@inertiajs/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";
import { ArrowLeftIcon } from "lucide-react";

import { Role } from "@/types/admin/RolePermisson";
import { index, store } from "@/routes/admin/user";
import { Checkbox } from "@/components/ui/checkbox";


const handleBack = () => {
    window.history.back();
};

interface RoleProps {
    roles: Role[];
}
export default function Create({ roles }: RoleProps) {
    return (
        <>
            <Head title="Create User" />

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
                                Create User
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
                        <CardTitle>User Details</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <Form action={store().url} method="post" className="space-y-6">

                            {({ errors }) => (

                                <>

                                    {/* Name */}
                                    {/* User Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Full Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                placeholder="Enter full name"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter email address"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Password <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                placeholder="Enter password"
                                            />
                                            <InputError message={errors.password} />
                                        </div>
                                    </div>

                                    {/* Roles */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium mt-1 mb-1">Assign Roles</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {roles.map((role) => (
                                                <div key={role.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        name="role[]"
                                                        value={role.id}
                                                    />
                                                    <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                                                </div>
                                            ))}
                                        </div>
                                        <InputError message={errors.roles} />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit">Create User</Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.history.back()}
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

Create.layout = {
    breadcrumbs: [
        {
            title: "Users",
            href: index().url,
        },
    ],
};