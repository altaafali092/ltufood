import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeftIcon,
    CalendarDays,
    Eye,
    ImageIcon,
    Pencil,
    Tag,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import { edit, index, show } from '@/routes/admin/food-categories';
import { FoodCategory } from '@/types/admin/FoodCategory';

interface FoodCategoryShowProps {
    foodCategory: FoodCategory;
}

export default function FoodCategoryShow({
    foodCategory,
}: FoodCategoryShowProps) {
    return (
        <>
            <Head title={`Food Category • ${foodCategory.title}`} />

            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-pink-500/10" />

                        <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
                            <div className="space-y-4">
                                <Link
                                    href={index().url}
                                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Back to Categories
                                </Link>

                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                                            <Tag className="h-7 w-7 text-primary" />
                                        </div>

                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight">
                                                {foodCategory.title}
                                            </h1>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Detailed information and preview
                                                for this food category.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge
                                            variant={
                                                foodCategory.status
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="rounded-full px-4 py-1"
                                        >
                                            {foodCategory.status
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Eye className="h-4 w-4" />
                                            Public category page enabled
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button asChild size="lg" className="gap-2">
                                <Link href={edit(foodCategory.id).url}>
                                    <Pencil className="h-4 w-4" />
                                    Edit Category
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    {/* Left Side */}
                    <div className="space-y-6">
                        {/* Image Preview */}
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>

                                <CardDescription>
                                    Current category image and display preview.
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                {foodCategory.image ? (
                                    <div className="overflow-hidden rounded-2xl border bg-muted">
                                        <img
                                            src={foodCategory.image}
                                            alt={foodCategory.title}
                                            className="aspect-square w-full object-cover transition duration-300 hover:scale-105"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-muted/30 text-muted-foreground">
                                        <ImageIcon className="h-10 w-10 opacity-60" />
                                        <p className="text-sm">
                                            No image available
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Info</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Status
                                    </span>

                                    <Badge
                                        variant={
                                            foodCategory.status
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {foodCategory.status
                                            ? 'Active'
                                            : 'Inactive'}
                                    </Badge>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Slug
                                    </span>

                                    <code className="rounded-md bg-muted px-2 py-1 text-xs">
                                        {foodCategory.slug}
                                    </code>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Category ID
                                    </span>

                                    <span className="font-medium">
                                        #{foodCategory.id}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Category Details</CardTitle>

                            <CardDescription>
                                Information stored for this category inside the
                                admin system.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-8">
                            {/* Title */}
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Title
                                    </p>
                                </div>

                                <div className="rounded-2xl border bg-muted/20 p-5">
                                    <p className="text-lg font-semibold">
                                        {foodCategory.title}
                                    </p>
                                </div>
                            </div>

                            {/* Slug */}
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        URL Slug
                                    </p>
                                </div>

                                <div className="rounded-2xl border bg-muted/20 p-5">
                                    <code className="text-sm">
                                        /food-category/{foodCategory.slug}
                                    </code>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Description
                                    </p>
                                </div>

                                <div className="min-h-40 rounded-2xl border bg-muted/20 p-5">
                                    <p className="text-sm leading-7 text-foreground/90">
                                        {foodCategory.description?.trim() ||
                                            'No description has been added for this category yet.'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

FoodCategoryShow.layout = {
    breadcrumbs: [
        {
            title: 'Food Categories',
            href: index().url,
        },
        {
            title: 'View',
            href: '#',
        },
    ],
};