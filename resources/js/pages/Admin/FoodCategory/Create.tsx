
import { Head, Form } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"



import InputError from "@/components/input-error"
import { ArrowLeftIcon } from "lucide-react"
import { index, store } from "@/routes/admin/food-categories"


const handleBack = () => {
    window.history.back()
}
export default function FoodCategoryCreate() {

    return (
        <>

            <Head title="Create Gallery" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 ">
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
                            <h1 className="text-2xl font-bold tracking-tight">Create Food Category</h1>
                            <p className="text-muted-foreground">
                                Add a new Food Category.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Food Category Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form
                                action={store().url}
                                method="post"
                                className="space-y-6"
                                encType="multipart/form-data"
                            >
                                {({ errors }) => (
                                    <>
                                        {/* Name and Image in one row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">



                                            <div className="space-y-2">
                                                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="title"
                                                    name="title"
                                                    type="text"
                                                    placeholder="e.g., Food Category"
                                                />
                                                <InputError message={errors.title} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="slug"
                                                    name="slug"
                                                    type="text"
                                                    placeholder="e.g, food_category"
                                                />
                                                <InputError message={errors.slug} />
                                                <p className="text-sm text-muted-foreground">
                                                    slug should be unique and in lowercase use _ instead of space.
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="image">Image <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="image"
                                                    name="image"
                                                    type="file"
                                                    placeholder="Upload image"
                                                />
                                                <InputError message={errors.image} />
                                                <p className="text-sm text-muted-foreground">
                                                    Upload an image.
                                                </p>
                                            </div>

                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Optional description"
                                                rows={4}
                                            />
                                            <InputError message={errors.description} />
                                        </div>


                                        {/* Buttons */}
                                        <div className="flex gap-2 pt-4">
                                            <Button type="submit">Save</Button>
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
            </div>
        </>
    )


}


FoodCategoryCreate.layout = {
    breadcrumbs: [
        {
            title: 'Food Categories',
            href: index().url,
        },
    ],
};