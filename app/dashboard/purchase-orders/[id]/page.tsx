import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type PurchaseOrderDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

export default async function PurchaseOrderDetailPage({
  params,
}: PurchaseOrderDetailPageProps) {
  const { id } = await params

  const order = await prisma.purchaseOrder.findUnique({
    where: {
      id,
    },
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  const total = order.items.reduce((acc, item) => {
    return acc + item.quantity * Number(item.cost)
  }, 0)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-3">
            <Link href="/dashboard/purchase-orders">
              <ArrowLeftIcon className="mr-2 size-4" />
              Volver
            </Link>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight">
            Detalle de orden de compra
          </h1>

          <p className="text-muted-foreground">
            Consulta la cabecera y detalle de productos solicitados.
          </p>
        </div>

        <Badge
          variant={order.status === "RECEIVED" ? "default" : "secondary"}
          className="w-fit"
        >
          {order.status === "RECEIVED" ? "Recibida" : "Pendiente"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{order.supplier.name}</p>
            <p className="text-sm text-muted-foreground">
              {order.supplier.document || "Sin documento"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {dateFormatter.format(order.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{moneyFormatter.format(total)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos solicitados</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Costo unitario</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {order.items.map((item) => {
                  const subtotal = item.quantity * Number(item.cost)

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.code}
                      </TableCell>

                      <TableCell>{item.product.name}</TableCell>

                      <TableCell>{item.quantity}</TableCell>

                      <TableCell>
                        {moneyFormatter.format(Number(item.cost))}
                      </TableCell>

                      <TableCell>{moneyFormatter.format(subtotal)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}