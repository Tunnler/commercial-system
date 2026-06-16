import { createSupplier } from "../actions"
import { SupplierForm } from "../supplier-form"

export default function NewSupplierPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo proveedor</h1>
        <p className="text-muted-foreground">
          Completa los datos para registrar un nuevo proveedor.
        </p>
      </div>

      <SupplierForm mode="create" action={createSupplier} />
    </div>
  )
}