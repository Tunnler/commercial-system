import Link from "next/link"
import { PackageCheckIcon, PlusIcon, SearchIcon, SendIcon } from "lucide-react"
import { DispatchStatus, Prisma } from "@/lib/generated/prisma/client"
import prisma from "@/lib/prisma"
import { updateDispatchStatus } from "./actions"
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

type DispatchesPageProps = {
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

export default async function DispatchesPage({
  searchParams,
}: DispatchesPageProps) {
  const params = await searchParams
  const q = params?.q?.trim() ?? ""

  const where: Prisma.DispatchWhereInput = q
    ? {
        invoice: {
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
        },
      }
    : {}

  const [dispatches, totalDispatches, pendingDispatches, deliveredDispatches] =
    await Promise.all([
      prisma.dispatch.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          invoice: {
            include: {
              customer: true,
              items: true,
            },
          },
        },
      }),
      prisma.dispatch.count(),
      prisma.dispatch.count({
        where: {
          status: {
            in: ["PENDING", "IN_TRANSIT"],
          },
        },
      }),
      prisma.dispatch.count({
        where: {
          status: "DELIVERED",
        },
      }),
    ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Despachos</h1>
          <p className="text-muted-foreground">
            Registro y seguimiento del estado de entrega de facturas.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/dispatches/new">
            <PlusIcon className="mr-2 size-4" />
            Nuevo despacho
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total despachos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <SendIcon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalDispatches}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pendientes / tránsito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{pendingDispatches}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entregados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PackageCheckIcon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{deliveredDispatches}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Listado de despachos</CardTitle>

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
                  <TableHead>Fecha despacho</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total factura</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {dispatches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron despachos.
                    </TableCell>
                  </TableRow>
                ) : (
                  dispatches.map((dispatch) => (
                    <TableRow key={dispatch.id}>
                      <TableCell>
                        {dateFormatter.format(dispatch.createdAt)}
                      </TableCell>

                      <TableCell className="font-medium">
                        {dispatch.invoice.customer.name}
                      </TableCell>

                      <TableCell>{dispatch.invoice.items.length}</TableCell>

                      <TableCell>
                        {moneyFormatter.format(Number(dispatch.invoice.total))}
                      </TableCell>

                      <TableCell>
                        <Badge variant={getStatusVariant(dispatch.status)}>
                          {getStatusLabel(dispatch.status)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/dispatches/${dispatch.id}`}>
                              Ver detalle
                            </Link>
                          </Button>

                          {dispatch.status === "PENDING" && (
                            <form
                              action={updateDispatchStatus.bind(
                                null,
                                dispatch.id,
                                "IN_TRANSIT"
                              )}
                            >
                              <Button size="sm" variant="secondary" type="submit">
                                En tránsito
                              </Button>
                            </form>
                          )}

                          {dispatch.status !== "DELIVERED" && (
                            <form
                              action={updateDispatchStatus.bind(
                                null,
                                dispatch.id,
                                "DELIVERED"
                              )}
                            >
                              <Button size="sm" type="submit">
                                Entregado
                              </Button>
                            </form>
                          )}
                        </div>
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
  )
}