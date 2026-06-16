import Link from "next/link"
import type { Supplier } from "@/lib/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SupplierFormProps = {
  mode: "create" | "edit"
  supplier?: Supplier
  action: (formData: FormData) => Promise<void>
}

export function SupplierForm({ mode, supplier, action }: SupplierFormProps) {
  const isEdit = mode === "edit"

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Editar proveedor" : "Registrar proveedor"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre o razón social</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ej: Distribuidora San Miguel S.A.C."
                defaultValue={supplier?.name ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Documento</Label>
              <Input
                id="document"
                name="document"
                placeholder="Ej: 20601234567"
                defaultValue={supplier?.document ?? ""}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/suppliers">Cancelar</Link>
            </Button>

            <Button type="submit">
              {isEdit ? "Guardar cambios" : "Registrar proveedor"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}