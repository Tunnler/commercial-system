import Link from "next/link"
import type { Customer } from "@/lib/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CustomerFormProps = {
  mode: "create" | "edit"
  customer?: Customer
  action: (formData: FormData) => Promise<void>
}

export function CustomerForm({ mode, customer, action }: CustomerFormProps) {
  const isEdit = mode === "edit"

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEdit ? "Editar cliente" : "Registrar cliente"}
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
                placeholder="Ej: Juan Pérez / Empresa S.A.C."
                defaultValue={customer?.name ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Documento</Label>
              <Input
                id="document"
                name="document"
                placeholder="Ej: 75841236 / 20601234567"
                defaultValue={customer?.document ?? ""}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/customers">Cancelar</Link>
            </Button>

            <Button type="submit">
              {isEdit ? "Guardar cambios" : "Registrar cliente"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}