import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { updateSupplier } from "../../actions"
import { SupplierForm } from "../../supplier-form"

type EditSupplierPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditSupplierPage({
  params,
}: EditSupplierPageProps) {
  const { id } = await params

  const supplier = await prisma.supplier.findUnique({
    where: {
      id,
    },
  })

  if (!supplier) {
    notFound()
  }

  const updateSupplierWithId = updateSupplier.bind(null, id)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar proveedor</h1>
        <p className="text-muted-foreground">
          Actualiza la información del proveedor seleccionado.
        </p>
      </div>

      <SupplierForm
        mode="edit"
        supplier={supplier}
        action={updateSupplierWithId}
      />
    </div>
  )
}