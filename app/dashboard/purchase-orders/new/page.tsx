import prisma from "@/lib/prisma"
import { createPurchaseOrder } from "../actions"
import { PurchaseOrderForm } from "../purchase-order-form"

export default async function NewPurchaseOrderPage() {
  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.product.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ])

  const supplierOptions = suppliers.map((supplier) => ({
    id: supplier.id,
    name: supplier.name,
    document: supplier.document,
  }))

  const productOptions = products.map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    price: product.price.toString(),
    stock: product.stock,
  }))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Nueva orden de compra
        </h1>
        <p className="text-muted-foreground">
          Selecciona un proveedor y registra los productos solicitados.
        </p>
      </div>

      <PurchaseOrderForm
        suppliers={supplierOptions}
        products={productOptions}
        action={createPurchaseOrder}
      />
    </div>
  )
}