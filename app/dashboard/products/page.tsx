import Link from "next/link"
import { PackageIcon, PlusIcon, SearchIcon } from "lucide-react"
import { Prisma } from "@/lib/generated/prisma/client"
import  prisma  from "@/lib/prisma"
import { changeProductStatus } from "./actions"
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

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string
  }>
}

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const q = params?.q?.trim() ?? ""

  const where: Prisma.ProductWhereInput = q
    ? {
        OR: [
          {
            code: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      }
    : {}

  const [products, totalProducts, activeProducts, totalStock] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count(),
      prisma.product.count({
        where: {
          active: true,
        },
      }),
      prisma.product.aggregate({
        _sum: {
          stock: true,
        },
      }),
    ])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Registro, edición y listado de productos del sistema comercial.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/products/new">
            <PlusIcon className="mr-2 size-4" />
            Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PackageIcon className="size-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalProducts}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Productos activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{activeProducts}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock total</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {totalStock._sum.stock ?? 0}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Listado de productos</CardTitle>

            <form className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Buscar por código o nombre..."
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No se encontraron productos.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.code}
                      </TableCell>

                      <TableCell>{product.name}</TableCell>

                      <TableCell>
                        {moneyFormatter.format(Number(product.price))}
                      </TableCell>

                      <TableCell>{product.stock}</TableCell>

                      <TableCell>
                        <Badge
                          variant={product.active ? "default" : "secondary"}
                        >
                          {product.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/dashboard/products/${product.id}/edit`}
                            >
                              Editar
                            </Link>
                          </Button>

                          <form
                            action={changeProductStatus.bind(
                              null,
                              product.id,
                              !product.active
                            )}
                          >
                            <Button size="sm" variant="secondary" type="submit">
                              {product.active ? "Desactivar" : "Activar"}
                            </Button>
                          </form>
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