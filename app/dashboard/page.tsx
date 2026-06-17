import Link from "next/link"
import {
  AlertTriangleIcon,
  BoxesIcon,
  PackageIcon,
  ReceiptTextIcon,
  SendIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react"
import prisma from "@/lib/prisma"
import { DashboardCharts } from "./dashboard-charts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

const compactMoneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  notation: "compact",
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function getShortCode(prefix: string, id: string) {
  return `${prefix}-${id.slice(-6).toUpperCase()}`
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getDateLabel(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
  }).format(date)
}

function getDispatchLabel(status: string) {
  if (status === "PENDING") return "Pendiente"
  if (status === "IN_TRANSIT") return "En tránsito"
  if (status === "DELIVERED") return "Entregado"

  return status
}

function getDispatchVariant(
  status: string
): "default" | "secondary" | "outline" {
  if (status === "DELIVERED") return "default"
  if (status === "IN_TRANSIT") return "outline"

  return "secondary"
}

export default async function DashboardPage() {
  const today = new Date()

  const startTrendDate = new Date(today)
  startTrendDate.setDate(today.getDate() - 13)
  startTrendDate.setHours(0, 0, 0, 0)

  const [
    totalProducts,
    activeProducts,
    totalCustomers,
    totalSuppliers,
    totalInvoices,
    totalSales,
    pendingPurchaseOrders,
    pendingDispatches,
    criticalStockProducts,
    productsForStockValue,
    productsForStock,
    invoicesForTrend,
    invoiceItems,
    recentInvoices,
    recentPurchaseOrders,
  ] = await Promise.all([
    prisma.product.count(),

    prisma.product.count({
      where: {
        active: true,
      },
    }),

    prisma.customer.count(),

    prisma.supplier.count(),

    prisma.invoice.count(),

    prisma.invoice.aggregate({
      _sum: {
        total: true,
      },
    }),

    prisma.purchaseOrder.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.dispatch.count({
      where: {
        status: {
          in: ["PENDING", "IN_TRANSIT"],
        },
      },
    }),

    prisma.product.count({
      where: {
        active: true,
        stock: {
          lte: 5,
        },
      },
    }),

    prisma.product.findMany({
      where: {
        active: true,
      },
      select: {
        stock: true,
        price: true,
      },
    }),

    prisma.product.findMany({
      where: {
        active: true,
      },
      orderBy: {
        stock: "asc",
      },
      take: 5,
    }),

    prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startTrendDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
        total: true,
      },
    }),

    prisma.invoiceItem.findMany({
      include: {
        product: true,
      },
    }),

    prisma.invoice.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        customer: true,
        dispatches: {
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    }),

    prisma.purchaseOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        supplier: true,
        items: true,
      },
    }),
  ])

  const stockTotal = productsForStockValue.reduce((acc, product) => {
    return acc + product.stock
  }, 0)

  const stockValue = productsForStockValue.reduce((acc, product) => {
    return acc + product.stock * Number(product.price)
  }, 0)

  const salesMap = new Map<
    string,
    {
      date: string
      total: number
      invoices: number
    }
  >()

  for (let index = 13; index >= 0; index--) {
    const date = new Date(today)
    date.setDate(today.getDate() - index)

    salesMap.set(getDateKey(date), {
      date: getDateLabel(date),
      total: 0,
      invoices: 0,
    })
  }

  for (const invoice of invoicesForTrend) {
    const key = getDateKey(invoice.createdAt)
    const current = salesMap.get(key)

    if (!current) {
      continue
    }

    current.total += Number(invoice.total)
    current.invoices += 1
  }

  const salesTrend = Array.from(salesMap.values())

  const productSalesMap = new Map<
    string,
    {
      product: string
      quantity: number
      revenue: number
    }
  >()

  for (const item of invoiceItems) {
    const current = productSalesMap.get(item.productId) ?? {
      product: item.product.name,
      quantity: 0,
      revenue: 0,
    }

    current.quantity += item.quantity
    current.revenue += item.quantity * Number(item.price)

    productSalesMap.set(item.productId, current)
  }

  const topProducts = Array.from(productSalesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  const lowStockProducts = productsForStock.map((product) => ({
    product: product.name,
    stock: product.stock,
  }))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen general del sistema comercial, ventas, stock y operaciones.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/purchase-orders/new">Nueva orden</Link>
          </Button>

          <Button asChild size="sm">
            <Link href="/dashboard/invoices/new">Nueva factura</Link>
          </Button>
        </div>
      </div>

      <div
        className="w-full gap-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        }}
      >
        <Card className="@container/card min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>Ventas acumuladas</CardDescription>
            <CardTitle className="truncate text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {compactMoneyFormatter.format(Number(totalSales._sum.total ?? 0))}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <TrendingUpIcon className="size-3" />
                Ventas
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Total facturado en el sistema
              <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Monto acumulado de facturación
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>Facturas emitidas</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalInvoices}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <ReceiptTextIcon className="size-3" />
                Docs
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Ventas registradas
              <ReceiptTextIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Facturas generadas correctamente
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>Stock disponible</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stockTotal}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <BoxesIcon className="size-3" />
                Stock
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Inventario valorizado
              <BoxesIcon className="size-4" />
            </div>
            <div className="truncate text-muted-foreground">
              {moneyFormatter.format(stockValue)}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>Stock crítico</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {criticalStockProducts}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <AlertTriangleIcon className="size-3" />
                Alerta
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Reposición necesaria
              <AlertTriangleIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Productos activos con stock ≤ 5
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>Productos</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalProducts}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <PackageIcon className="size-3" />
                Activos
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Maestro de productos
              <PackageIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {activeProducts} productos activos
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>Clientes</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalCustomers}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <UsersIcon className="size-3" />
                CRM
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Clientes registrados
              <UsersIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Disponibles para facturación
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>Proveedores</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {totalSuppliers}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <ShoppingCartIcon className="size-3" />
                Compras
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Gestión de compras
              <ShoppingCartIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              OC pendientes: {pendingPurchaseOrders}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card min-w-0 bg-gradient-to-t from-primary/5 to-card shadow-xs">
          <CardHeader>
            <CardDescription>Despachos</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {pendingDispatches}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <SendIcon className="size-3" />
                Entrega
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Seguimiento de entrega
              <SendIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Pendientes o en tránsito
            </div>
          </CardFooter>
        </Card>
      </div>

      <DashboardCharts
        salesTrend={salesTrend}
        topProducts={topProducts}
        lowStockProducts={lowStockProducts}
      />

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Facturas recientes</CardTitle>
            <CardDescription className="text-xs">
              Últimas ventas registradas y su estado de despacho.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Despacho</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recentInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-20 text-center text-muted-foreground"
                      >
                        No hay facturas registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentInvoices.map((invoice) => {
                      const latestDispatch = invoice.dispatches[0]

                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            <Link href={`/dashboard/invoices/${invoice.id}`}>
                              {getShortCode("FAC", invoice.id)}
                            </Link>
                          </TableCell>

                          <TableCell>{invoice.customer.name}</TableCell>

                          <TableCell>
                            {moneyFormatter.format(Number(invoice.total))}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                latestDispatch
                                  ? getDispatchVariant(latestDispatch.status)
                                  : "secondary"
                              }
                            >
                              {latestDispatch
                                ? getDispatchLabel(latestDispatch.status)
                                : "Pendiente"}
                            </Badge>
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

        <Card className="min-w-0">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">
              Órdenes de compra recientes
            </CardTitle>
            <CardDescription className="text-xs">
              Seguimiento de compras pendientes y recibidas.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recentPurchaseOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-20 text-center text-muted-foreground"
                      >
                        No hay órdenes de compra registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentPurchaseOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/purchase-orders/${order.id}`}>
                            {getShortCode("OC", order.id)}
                          </Link>
                        </TableCell>

                        <TableCell>{order.supplier.name}</TableCell>

                        <TableCell>
                          {dateFormatter.format(order.createdAt)}
                        </TableCell>

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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}