import Link from "next/link"
import prisma from "@/lib/prisma"
import { createInvoice } from "../actions"
import { InvoiceForm } from "../invoice-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewInvoicePage() {
  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.product.findMany({
      where: {
        active: true,
        stock: {
          gt: 0,
        },
      },
      orderBy: {
        name: "asc",
      },
    }),
  ])

  const customerOptions = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    document: customer.document,
  }))

  const productOptions = products.map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    price: product.price.toString(),
    stock: product.stock,
  }))

  if (customers.length === 0 || products.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva factura</h1>
          <p className="text-muted-foreground">
            Para facturar necesitas clientes registrados y productos con stock.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No se puede registrar la factura</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {customers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tienes clientes registrados.
              </p>
            )}

            {products.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No tienes productos activos con stock disponible.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {customers.length === 0 && (
                <Button asChild>
                  <Link href="/dashboard/customers/new">Crear cliente</Link>
                </Button>
              )}

              {products.length === 0 && (
                <Button asChild variant="outline">
                  <Link href="/dashboard/goods-receipts/new">
                    Ingresar mercadería
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva factura</h1>
        <p className="text-muted-foreground">
          Selecciona un cliente y registra los productos vendidos.
        </p>
      </div>

      <InvoiceForm
        customers={customerOptions}
        products={productOptions}
        action={createInvoice}
      />
    </div>
  )
}