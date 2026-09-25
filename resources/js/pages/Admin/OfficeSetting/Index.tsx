
import { Head, Form } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import InputError from "@/components/input-error"
import { ArrowLeftIcon } from "lucide-react"
import { officeSettingIndex, officeSettingStore } from "@/routes/admin"
import { OfficeSetting } from "@/types/admin/OfficeSetting"


const handleBack = () => {
    window.history.back()
}
interface OfficeProps{
    officeSetting:OfficeSetting
}

export default function OfficeSettingCreate({officeSetting}:OfficeProps) {
    return (
        <>

            <Head title="Create Food Item" />
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
                            <h1 className="text-2xl font-bold tracking-tight">Office Setting</h1>
                            <p className="text-muted-foreground">
                                Create/Update Office Setting.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Office Setting Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form
                                action={officeSettingStore().url}
                                method="post"
                                className="space-y-6"
                                encType="multipart/form-data"
                            >
                                {({ errors }) => (
                                    <>
                                       
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          

                                            <div className="space-y-2">
                                                <Label htmlFor="office_name">Office Name <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="office_name"
                                                    name="office_name"
                                                    type="text"
                                                    placeholder="e.g., xyz "
                                                    defaultValue={officeSetting?.office_name}
                                                />
                                                <InputError message={errors.office_name} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="office_logo">Office Logo</Label>
                                                <Input
                                                    id="office_logo"
                                                    name="office_logo"
                                                    type="file"
                                                    placeholder="e.g, food_category"
                                                />
                                                <InputError message={errors.office_logo} />
                                                <p className="text-sm text-muted-foreground">
                                                    Upload an image.
                                                </p>
                                                {
                                                <img src={officeSetting?.office_logo} alt=""className="w-10 h-10" />
                                                }
                                                
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="office_address">Office Address <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="office_address"
                                                    type="text"
                                                    name="office_address"
                                                    placeholder="nxxxxxgunj"
                                                    defaultValue={officeSetting.office_address

                                                    }
                                                   
                                                />
                                                <InputError message={errors.office_address} />
                                                
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor="office_phone">office Phone No. <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="office_phone"
                                                    name="office_phone"    
                                                    type="text"
                                                    placeholder="e.g., 9812345"
                                                    defaultValue={officeSetting.office_phone}
                                                />
                                                <InputError message={errors.office_phone} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="office_email">Office Email <span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="office_email"
                                                    type="email"
                                                    name="office_email"
                                                    placeholder="sxxxxxxxe@gmail.com"
                                                    defaultValue={officeSetting.office_email}
                                                />
                                                <InputError message={errors.office_email} />
                                                
                                            </div>
                                           

                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Optional description"
                                                rows={4}
                                                defaultValue={officeSetting.description}
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


OfficeSettingCreate.layout = {
    breadcrumbs: [
        {
            title: 'OfficeSetting',
            href: officeSettingIndex().url,
        },
    ],
};