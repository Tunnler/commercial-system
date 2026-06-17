import Link from "next/link"
import prisma from "@/lib/prisma"
import { createDispatch } from "../actions"
import { DispatchForm } from "../dispatch-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewDispatchPage() {
  const pendingInvoices = await prisma.invoice.findMany({
    where: {
      dispatches: {
        none: {},
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: true,
      items: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          product: true,
        },
      },
    },
  })

  const invoices = pendingInvoices.map((invoice) => ({
    id: invoice.id,
    createdAt: invoice.createdAt.toISOString(),
    customer: {
      name: invoice.customer.name,
      document: invoice.customer.document,
    },
    total: invoice.total.toString(),
    items: invoice.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price.toString(),
      product: {
        code: item.product.code,
        name: item.product.name,
      },
    })),
  }))

  if (invoices.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nuevo despacho
          </h1>
          <p className="text-muted-foreground">
            No existen facturas pendientes de despacho.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No hay facturas pendientes</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para registrar un despacho primero debes crear una factura que
              todavía no tenga despacho asociado.
            </p>

            <Button asChild>
              <Link href="/dashboard/invoices/new">Crear factura</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo despacho</h1>
        <p className="text-muted-foreground">
          Selecciona una factura pendiente y registra el despacho.
        </p>
      </div>

      <DispatchForm invoices={invoices} action={createDispatch} />
    </div>
  )
}