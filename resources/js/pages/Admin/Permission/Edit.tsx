
import { Head, Form } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import InputError from "@/components/input-error"
import { ArrowLeftIcon } from "lucide-react"
import { index, store, update } from "@/routes/admin/permission"
import { Permission } from "@/types/admin/RolePermisson"



const handleBack = () => {
  window.history.back()
}

interface EditProps {
  permission: Permission
}

export default function Edit({ permission }: EditProps) {
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
              <h1 className="text-2xl font-bold tracking-tight">Create Permission</h1>
              <p className="text-muted-foreground">
                Add a new Permission.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Permission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form
                action={update(permission.id).url}
                method="post"
                className="space-y-6"
                encType="multipart/form-data"
              >
                {({ errors }) => (
                  <>
                    {/* Name and Image in one row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <input type="hidden" name="_method" value="put" />
                      <div className="space-y-2">
                        <Label htmlFor="name">Prmission Title <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          defaultValue={permission.name}
                        />
                        <InputError message={errors.name} />
                      </div>


                    </div>



                    {/* Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button type="submit">Update</Button>
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


Edit.layout = {
  breadcrumbs: [
    {
      title: 'Permissions',
      href: index().url,
    },
  ],
};