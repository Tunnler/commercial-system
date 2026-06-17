import Link from "next/link"
import { PlusIcon, ReceiptTextIcon, SearchIcon } from "lucide-react"
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

type InvoicesPageProps = {
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

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams
  const q = params?.q?.trim() ?? ""

  const where: Prisma.InvoiceWhereInput = q
    ? {
        customer: {
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

  const [invoices, totalInvoices, totalSales, pendingDispatches] =
    await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          customer: true,
          items: true,
          dispatches: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      prisma.invoice.count(),
      prisma.invoice.aggregate({
        _sum: {
          total: true,
        },
      }),
      prisma.invoice.count({
        where: {
          dispatches: {
            none: {},
          },
        },
      }),
    ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground">
            Registro de ventas, cálculo de totales y descuento de stock.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/invoices/new">
            <PlusIcon className="mr-2 size-4" />
            Nueva factura
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total facturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ReceiptTextIcon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalInvoices}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas acumuladas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {moneyFormatter.format(Number(totalSales._sum.total ?? 0))}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pendientes de despacho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{pendingDispatches}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Listado de facturas</CardTitle>

            <form className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Buscar por cliente..."
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Despacho</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron facturas.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => {
                    const hasDispatch = invoice.dispatches.length > 0

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          {dateFormatter.format(invoice.createdAt)}
                        </TableCell>

                        <TableCell className="font-medium">
                          {invoice.customer.name}
                        </TableCell>

                        <TableCell>{invoice._count.items}</TableCell>

                        <TableCell>
                          {moneyFormatter.format(Number(invoice.total))}
                        </TableCell>

                        <TableCell>
                          <Badge variant={hasDispatch ? "default" : "secondary"}>
                            {hasDispatch ? "Con despacho" : "Pendiente"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/dashboard/invoices/${invoice.id}`}>
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