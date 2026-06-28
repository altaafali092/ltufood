import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeftIcon, Pencil } from 'lucide-react';
import { edit, index } from '@/routes/admin/sub-categories';
import { SubCategory } from '@/types/admin/SubCategory';

const handleBack = () => {
    window.history.back();
};

interface Props {
    subCategory: SubCategory;
}

SubCategoryShow.layout = {
    breadcrumbs: [
        {
            title: 'Sub Categories',
            href: index().url,
        },
    ],
};

export default function SubCategoryShow({ subCategory }: Props) {
    return (
        <>
            <Head title={`Sub Category ${subCategory.title}`} />
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
                                {subCategory.title}
                            </h1>
                            <p className="text-muted-foreground">
                                Sub category details and parent category.
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={edit(subCategory.id).url} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Image</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {subCategory.image ? (
                                <img
                                    src={subCategory.image}
                                    alt={subCategory.title}
                                    className="aspect-square w-full rounded-md border bg-white object-cover p-4"
                                />
                            ) : (
                                <div className="flex aspect-square w-full items-center justify-center rounded-md border text-sm text-muted-foreground">
                                    No image uploaded.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sub Category Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                <div>
                                    <dt className="font-medium text-muted-foreground">Title</dt>
                                    <dd className="mt-1">{subCategory.title}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Slug</dt>
                                    <dd className="mt-1 break-all">{subCategory.slug}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Parent Category</dt>
                                    <dd className="mt-1">
                                        {subCategory.foodCategory?.title ?? '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${subCategory.status ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                                            {subCategory.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </dd>
                                </div>
                                <div className="md:col-span-2">
                                    <dt className="font-medium text-muted-foreground">Description</dt>
                                    <dd className="mt-1 whitespace-pre-line">
                                        {subCategory.description || 'No description provided.'}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
