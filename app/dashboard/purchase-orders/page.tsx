import Link from "next/link"
import { PlusIcon, SearchIcon, ShoppingCartIcon } from "lucide-react"
import { Prisma } from "@/lib/generated/prisma/client"
import prisma from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type PurchaseOrdersPageProps = {
  searchParams?: Promise<{
    q?: string
  }>
}

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

function getPurchaseOrderTotal(
  items: {
    quantity: number
    cost: Prisma.Decimal
  }[]
) {
  return items.reduce((acc, item) => {
    return acc + item.quantity * Number(item.cost)
  }, 0)
}

export default async function PurchaseOrdersPage({
  searchParams,
}: PurchaseOrdersPageProps) {
  const params = await searchParams
  const q = params?.q?.trim() ?? ""

  const where: Prisma.PurchaseOrderWhereInput = q
    ? {
        supplier: {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              document: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        },
      }
    : {}

  const [purchaseOrders, totalOrders, pendingOrders, receivedOrders] =
    await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          supplier: true,
          items: {
            select: {
              quantity: true,
              cost: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.count({
        where: {
          status: "PENDING",
        },
      }),
      prisma.purchaseOrder.count({
        where: {
          status: "RECEIVED",
        },
      }),
    ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Órdenes de Compra
          </h1>
          <p className="text-muted-foreground">
            Registro de compras solicitadas a proveedores.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/purchase-orders/new">
            <PlusIcon className="mr-2 size-4" />
            Nueva orden
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total órdenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{pendingOrders}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recibidas</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{receivedOrders}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Listado de órdenes</CardTitle>

            <form className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Buscar por proveedor..."
                defaultValue={q}
                className="pl-9"
              />
            </form>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {purchaseOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron órdenes de compra.
                    </TableCell>
                  </TableRow>
                ) : (
                  purchaseOrders.map((order) => {
                    const total = getPurchaseOrderTotal(order.items)

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          {dateFormatter.format(order.createdAt)}
                        </TableCell>

                        <TableCell className="font-medium">
                          {order.supplier.name}
                        </TableCell>

                        <TableCell>{order._count.items}</TableCell>

                        <TableCell>{moneyFormatter.format(total)}</TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              order.status === "RECEIVED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.status === "RECEIVED"
                              ? "Recibida"
                              : "Pendiente"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/dashboard/purchase-orders/${order.id}`}>
                                Ver detalle
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}