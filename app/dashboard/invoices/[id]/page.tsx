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

type InvoiceDetailPageProps = {
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

function getDispatchLabel(status: string) {
  if (status === "PENDING") return "Pendiente"
  if (status === "IN_TRANSIT") return "En tránsito"
  if (status === "DELIVERED") return "Entregado"

  return status
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      dispatches: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  if (!invoice) {
    notFound()
  }

  const latestDispatch = invoice.dispatches[0]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-3">
            <Link href="/dashboard/invoices">
              <ArrowLeftIcon className="mr-2 size-4" />
              Volver
            </Link>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight">
            Detalle de factura
          </h1>

          <p className="text-muted-foreground">
            Consulta el cliente, productos vendidos y totales de la factura.
          </p>
        </div>

        <Badge variant={latestDispatch ? "default" : "secondary"}>
          {latestDispatch
            ? getDispatchLabel(latestDispatch.status)
            : "Pendiente de despacho"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{invoice.customer.name}</p>
            <p className="text-sm text-muted-foreground">
              {invoice.customer.document || "Sin documento"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fecha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {dateFormatter.format(invoice.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {moneyFormatter.format(Number(invoice.total))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos facturados</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio unitario</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoice.items.map((item) => {
                  const subtotal = item.quantity * Number(item.price)

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.code}
                      </TableCell>

                      <TableCell>{item.product.name}</TableCell>

                      <TableCell>{item.quantity}</TableCell>

                      <TableCell>
                        {moneyFormatter.format(Number(item.price))}
                      </TableCell>

                      <TableCell>{moneyFormatter.format(subtotal)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="ml-auto mt-6 max-w-sm space-y-2 rounded-lg border p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{moneyFormatter.format(Number(invoice.subtotal))}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IGV</span>
              <span>{moneyFormatter.format(Number(invoice.tax))}</span>
            </div>

            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{moneyFormatter.format(Number(invoice.total))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <a href={`/dashboard/invoices/${invoice.id}/pdf`}>
            Descargar PDF
          </a>
        </Button>

        {!latestDispatch && (
          <Button asChild>
            <Link href="/dashboard/dispatches/new">
              Registrar despacho
            </Link>
          </Button>
        )}
      </div>


    </div>
  )
}