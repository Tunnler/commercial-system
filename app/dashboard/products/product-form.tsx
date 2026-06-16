import Link from "next/link"
import type { Product } from "@/lib/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProductFormProps = {
  mode: "create" | "edit"
  product?: Product
  action: (formData: FormData) => Promise<void>
}

export function ProductForm({ mode, product, action }: ProductFormProps) {
  const isEdit = mode === "edit"

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Editar producto" : "Registrar producto"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                name="code"
                placeholder="Ej: PROD-001"
                defaultValue={product?.code ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Mouse Logitech"
                defaultValue={product?.name ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={product?.price?.toString() ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                defaultValue={product?.stock ?? 0}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="active"
              name="active"
              type="checkbox"
              defaultChecked={product?.active ?? true}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="active">Producto activo</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/products">Cancelar</Link>
            </Button>

            <Button type="submit">
              {isEdit ? "Guardar cambios" : "Registrar producto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}