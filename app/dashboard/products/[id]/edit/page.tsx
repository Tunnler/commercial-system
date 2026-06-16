import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { updateProduct } from "../../actions"
import { ProductForm } from "../../product-form"

type EditProductPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  })

  if (!product) {
    notFound()
  }

  const updateProductWithId = updateProduct.bind(null, id)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar producto</h1>
        <p className="text-muted-foreground">
          Actualiza la información del producto seleccionado.
        </p>
      </div>

      <ProductForm
        mode="edit"
        product={product}
        action={updateProductWithId}
      />
    </div>
  )
}