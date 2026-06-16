import Link from "next/link"
import { PackageCheckIcon, PlusIcon, SearchIcon } from "lucide-react"
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

type GoodsReceiptsPageProps = {
  searchParams?: Promise<{
    q?: string
  }>
}

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function getTotalUnits(
  items: {
    quantity: number
  }[]
) {
  return items.reduce((acc, item) => acc + item.quantity, 0)
}

export default async function GoodsReceiptsPage({
  searchParams,
}: GoodsReceiptsPageProps) {
  const params = await searchParams
  const q = params?.q?.trim() ?? ""

  const where: Prisma.GoodsReceiptWhereInput = q
    ? {
        purchaseOrder: {
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
        },
      }
    : {}

  const [receipts, totalReceipts, pendingOrders] = await Promise.all([
    prisma.goodsReceipt.findMany({
      where,
      orderBy: {
        receivedAt: "desc",
      },
      include: {
        purchaseOrder: {
          include: {
            supplier: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    }),
    prisma.goodsReceipt.count(),
    prisma.purchaseOrder.count({
      where: {
        status: "PENDING",
      },
    }),
  ])

  const receivedUnits = receipts.reduce((acc, receipt) => {
    return acc + getTotalUnits(receipt.purchaseOrder.items)
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Ingreso de Mercadería
          </h1>
          <p className="text-muted-foreground">
            Recepción de órdenes de compra y actualización de stock.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/goods-receipts/new">
            <PlusIcon className="mr-2 size-4" />
            Nuevo ingreso
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PackageCheckIcon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalReceipts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{pendingOrders}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Unidades recibidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{receivedUnits}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Historial de ingresos</CardTitle>

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
                  <TableHead>Fecha recepción</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Unidades recibidas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {receipts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron ingresos de mercadería.
                    </TableCell>
                  </TableRow>
                ) : (
                  receipts.map((receipt) => {
                    const totalUnits = getTotalUnits(
                      receipt.purchaseOrder.items
                    )

                    return (
                      <TableRow key={receipt.id}>
                        <TableCell>
                          {dateFormatter.format(receipt.receivedAt)}
                        </TableCell>

                        <TableCell className="font-medium">
                          {receipt.purchaseOrder.supplier.name}
                        </TableCell>

                        <TableCell>
                          {receipt.purchaseOrder.items.length}
                        </TableCell>

                        <TableCell>{totalUnits}</TableCell>

                        <TableCell>
                          <Badge>Recibido</Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" asChild>
                              <Link
                                href={`/dashboard/purchase-orders/${receipt.purchaseOrder.id}`}
                              >
                                Ver orden
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