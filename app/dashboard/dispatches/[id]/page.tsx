import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { DispatchStatus } from "@/lib/generated/prisma/client"
import prisma from "@/lib/prisma"
import { updateDispatchStatus } from "../actions"
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

type DispatchDetailPageProps = {
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

function getStatusLabel(status: DispatchStatus) {
  if (status === "PENDING") return "Pendiente"
  if (status === "IN_TRANSIT") return "En tránsito"
  if (status === "DELIVERED") return "Entregado"

  return status
}

function getStatusVariant(status: DispatchStatus) {
  if (status === "DELIVERED") return "default"
  if (status === "IN_TRANSIT") return "outline"

  return "secondary"
}

export default async function DispatchDetailPage({
  params,
}: DispatchDetailPageProps) {
  const { id } = await params

  const dispatch = await prisma.dispatch.findUnique({
    where: {
      id,
    },
    include: {
      invoice: {
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
      },
    },
  })

  if (!dispatch) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-3">
            <Link href="/dashboard/dispatches">
              <ArrowLeftIcon className="mr-2 size-4" />
              Volver
            </Link>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight">
            Detalle de despacho
          </h1>

          <p className="text-muted-foreground">
            Consulta la factura asociada, el cliente y el estado de entrega.
          </p>
        </div>

        <Badge variant={getStatusVariant(dispatch.status)} className="w-fit">
          {getStatusLabel(dispatch.status)}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{dispatch.invoice.customer.name}</p>
            <p className="text-sm text-muted-foreground">
              {dispatch.invoice.customer.document || "Sin documento"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Fecha factura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {dateFormatter.format(dispatch.invoice.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Fecha despacho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {dateFormatter.format(dispatch.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total factura</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {moneyFormatter.format(Number(dispatch.invoice.total))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos a despachar</CardTitle>
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
                {dispatch.invoice.items.map((item) => {
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
        </CardContent>
      </Card>

      {dispatch.status !== "DELIVERED" && (
        <Card>
          <CardHeader>
            <CardTitle>Actualizar estado del despacho</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dispatch.status === "PENDING" && (
                <form
                  action={updateDispatchStatus.bind(
                    null,
                    dispatch.id,
                    "IN_TRANSIT"
                  )}
                >
                  <Button variant="secondary" type="submit">
                    Marcar en tránsito
                  </Button>
                </form>
              )}

              <form
                action={updateDispatchStatus.bind(
                  null,
                  dispatch.id,
                  "DELIVERED"
                )}
              >
                <Button type="submit">Marcar como entregado</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}