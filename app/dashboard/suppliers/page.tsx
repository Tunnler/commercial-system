import Link from "next/link"
import { PlusIcon, SearchIcon, TruckIcon } from "lucide-react"
import { Prisma } from "@/lib/generated/prisma/client"
import prisma from "@/lib/prisma"
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

type SuppliersPageProps = {
  searchParams?: Promise<{
    q?: string
  }>
}

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export default async function SuppliersPage({
  searchParams,
}: SuppliersPageProps) {
  const params = await searchParams
  const q = params?.q?.trim() ?? ""

  const where: Prisma.SupplierWhereInput = q
    ? {
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
      }
    : {}

  const [suppliers, totalSuppliers, suppliersWithDocument] = await Promise.all([
    prisma.supplier.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    }),
    prisma.supplier.count(),
    prisma.supplier.count({
      where: {
        document: {
          not: null,
        },
      },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">
            Registro, edición y listado de proveedores para órdenes de compra.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/suppliers/new">
            <PlusIcon className="mr-2 size-4" />
            Nuevo proveedor
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total proveedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TruckIcon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalSuppliers}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Con documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {suppliersWithDocument}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Resultados filtrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{suppliers.length}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Listado de proveedores</CardTitle>

            <form className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Buscar por nombre o documento..."
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Órdenes de compra</TableHead>
                  <TableHead>Fecha registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron proveedores.
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.name}
                      </TableCell>

                      <TableCell>
                        {supplier.document || "Sin documento"}
                      </TableCell>

                      <TableCell>
                        {supplier._count.purchaseOrders}
                      </TableCell>

                      <TableCell>
                        {dateFormatter.format(supplier.createdAt)}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/dashboard/suppliers/${supplier.id}/edit`}
                            >
                              Editar
                            </Link>
                          </Button>
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