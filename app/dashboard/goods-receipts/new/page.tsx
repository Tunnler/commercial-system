import Link from "next/link"
import prisma from "@/lib/prisma"
import { createGoodsReceipt } from "../actions"
import { GoodsReceiptForm } from "../goods-receipt-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewGoodsReceiptPage() {
  const pendingOrders = await prisma.purchaseOrder.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      supplier: true,
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

  const orders = pendingOrders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    supplier: {
      name: order.supplier.name,
      document: order.supplier.document,
    },
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      cost: item.cost.toString(),
      product: {
        code: item.product.code,
        name: item.product.name,
        stock: item.product.stock,
      },
    })),
  }))

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nuevo ingreso de mercadería
          </h1>
          <p className="text-muted-foreground">
            No existen órdenes de compra pendientes por recibir.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No hay órdenes pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para registrar un ingreso de mercadería primero debes crear una
              orden de compra pendiente.
            </p>

            <Button asChild>
              <Link href="/dashboard/purchase-orders/new">
                Crear orden de compra
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Nuevo ingreso de mercadería
        </h1>
        <p className="text-muted-foreground">
          Selecciona una orden de compra pendiente y confirma la recepción.
        </p>
      </div>

      <GoodsReceiptForm orders={orders} action={createGoodsReceipt} />
    </div>
  )
}