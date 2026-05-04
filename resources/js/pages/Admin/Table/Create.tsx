import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { index, store } from '@/routes/admin/tables';

const handleBack = () => {
    window.history.back();
};

TableCreate.layout = {
    breadcrumbs: [
        {
            title: 'Tables',
            href: index().url,
        },
    ],
};

export default function TableCreate() {
    return (
        <>
            <Head title="Create Table" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
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
                        <h1 className="text-2xl font-bold tracking-tight">Create Table</h1>
                        <p className="text-muted-foreground">
                            Add a restaurant table and generate its QR code.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Table Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form action={store().url} method="post" className="space-y-6">
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="table_number">
                                                Table Number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="table_number"
                                                name="table_number"
                                                type="text"
                                                placeholder="e.g., T-01"
                                            />
                                            <InputError message={errors.table_number} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="radius_meters">
                                                Payment Alert Radius <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="radius_meters"
                                                name="radius_meters"
                                                type="number"
                                                defaultValue={50}
                                                min={10}
                                                max={500}
                                            />
                                            <InputError message={errors.radius_meters} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lat">Latitude</Label>
                                            <Input
                                                id="lat"
                                                name="lat"
                                                type="number"
                                                step="any"
                                                placeholder="e.g., 28.05000000"
                                            />
                                            <InputError message={errors.lat} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lng">Longitude</Label>
                                            <Input
                                                id="lng"
                                                name="lng"
                                                type="number"
                                                step="any"
                                                placeholder="e.g., 81.61670000"
                                            />
                                            <InputError message={errors.lng} />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            Save
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleBack}>
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
