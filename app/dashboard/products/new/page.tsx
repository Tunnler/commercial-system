import { createProduct } from "../actions"
import { ProductForm } from "../product-form"

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo producto</h1>
        <p className="text-muted-foreground">
          Completa los datos para registrar un nuevo producto.
        </p>
      </div>

      <ProductForm mode="create" action={createProduct} />
    </div>
  )
}