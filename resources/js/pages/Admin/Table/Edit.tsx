import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, Head } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { index, update } from '@/routes/admin/tables';
import { RestaurantTable } from '@/types/admin/Table';

const handleBack = () => {
    window.history.back();
};

interface Props {
    table: RestaurantTable;
}

TableEdit.layout = {
    breadcrumbs: [
        {
            title: 'Tables',
            href: index().url,
        },
    ],
};

export default function TableEdit({ table }: Props) {
    return (
        <>
            <Head title={`Edit ${table.table_number}`} />
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
                        <h1 className="text-2xl font-bold tracking-tight">Edit Table</h1>
                        <p className="text-muted-foreground">
                            Update table location, radius, and occupancy.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Table Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form action={update(table.id).url} method="post" className="space-y-6">
                            {({ errors, processing }) => (
                                <>
                                    <input type="hidden" name="_method" value="PUT" />

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="table_number">
                                                Table Number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="table_number"
                                                name="table_number"
                                                type="text"
                                                defaultValue={table.table_number}
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
                                                defaultValue={table.radius_meters}
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
                                                defaultValue={table.lat ?? ''}
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
                                                defaultValue={table.lng ?? ''}
                                            />
                                            <InputError message={errors.lng} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="is_occupied">Status</Label>
                                            <select
                                                id="is_occupied"
                                                name="is_occupied"
                                                defaultValue={table.is_occupied ? '1' : '0'}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="0">Available</option>
                                                <option value="1">Occupied</option>
                                            </select>
                                            <InputError message={errors.is_occupied} />
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            Update
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
