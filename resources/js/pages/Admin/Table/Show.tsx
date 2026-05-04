import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, Pencil } from 'lucide-react';
import { edit, index } from '@/routes/admin/tables';
import { RestaurantTable } from '@/types/admin/Table';

const handleBack = () => {
    window.history.back();
};

interface Props {
    table: RestaurantTable;
}

TableShow.layout = {
    breadcrumbs: [
        {
            title: 'Tables',
            href: index().url,
        },
    ],
};

export default function TableShow({ table }: Props) {
    return (
        <>
            <Head title={`Table ${table.table_number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-4">
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
                                Table {table.table_number}
                            </h1>
                            <p className="text-muted-foreground">
                                QR code and table ordering details.
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={edit(table.id).url} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>QR Code</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {table.qr_image_url ? (
                                <img
                                    src={table.qr_image_url}
                                    alt={`QR code for table ${table.table_number}`}
                                    className="aspect-square w-full rounded-md border bg-white object-contain p-4"
                                />
                            ) : (
                                <div className="flex aspect-square w-full items-center justify-center rounded-md border text-sm text-muted-foreground">
                                    No QR code generated.
                                </div>
                            )}
                            <div className="break-all rounded-md border bg-muted p-3 text-sm">
                                {table.qr_url}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Table Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                <div>
                                    <dt className="font-medium text-muted-foreground">Table Number</dt>
                                    <dd className="mt-1">{table.table_number}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Status</dt>
                                    <dd className="mt-1">
                                        {table.is_occupied ? 'Occupied' : 'Available'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Payment Alert Radius</dt>
                                    <dd className="mt-1">{table.radius_meters}m</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Total Orders</dt>
                                    <dd className="mt-1">{table.orders_count ?? 0}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Latitude</dt>
                                    <dd className="mt-1">{table.lat ?? 'Not set'}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Longitude</dt>
                                    <dd className="mt-1">{table.lng ?? 'Not set'}</dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
