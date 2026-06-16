"use client"

import Link from "next/link"
import { PlusIcon, TrashIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SupplierOption = {
  id: string
  name: string
  document: string | null
}

type ProductOption = {
  id: string
  code: string
  name: string
  price: string
  stock: number
}

type DetailRow = {
  key: string
  productId: string
  quantity: string
  cost: string
}

type PurchaseOrderFormProps = {
  suppliers: SupplierOption[]
  products: ProductOption[]
  action: (formData: FormData) => Promise<void>
}

function createEmptyRow(): DetailRow {
  return {
    key: Math.random().toString(36).slice(2),
    productId: "",
    quantity: "1",
    cost: "",
  }
}

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

export function PurchaseOrderForm({
  suppliers,
  products,
  action,
}: PurchaseOrderFormProps) {
  const [rows, setRows] = useState<DetailRow[]>([createEmptyRow()])

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]))
  }, [products])

  const total = rows.reduce((acc, row) => {
    const quantity = Number(row.quantity)
    const cost = Number(row.cost)

    if (Number.isNaN(quantity) || Number.isNaN(cost)) {
      return acc
    }

    return acc + quantity * cost
  }, 0)

  function addRow() {
    setRows((currentRows) => [...currentRows, createEmptyRow()])
  }

  function removeRow(key: string) {
    setRows((currentRows) => {
      if (currentRows.length === 1) {
        return currentRows
      }

      return currentRows.filter((row) => row.key !== key)
    })
  }

  function updateRow(
    key: string,
    field: keyof Omit<DetailRow, "key">,
    value: string
  ) {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.key !== key) {
          return row
        }

        if (field === "productId") {
          const selectedProduct = productMap.get(value)

          return {
            ...row,
            productId: value,
            cost: selectedProduct?.price ?? row.cost,
          }
        }

        return {
          ...row,
          [field]: value,
        }
      })
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar orden de compra</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="supplierId">Proveedor</Label>

            <select
              id="supplierId"
              name="supplierId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Seleccione un proveedor
              </option>

              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                  {supplier.document ? ` - ${supplier.document}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Detalle de productos</h3>
                <p className="text-sm text-muted-foreground">
                  Agrega productos, cantidades y costo unitario.
                </p>
              </div>

              <Button type="button" variant="outline" onClick={addRow}>
                <PlusIcon className="mr-2 size-4" />
                Agregar producto
              </Button>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => {
                const selectedProduct = productMap.get(row.productId)
                const rowTotal =
                  Number(row.quantity || 0) * Number(row.cost || 0)

                return (
                  <div
                    key={row.key}
                    className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1.5fr_0.6fr_0.8fr_0.8fr_auto]"
                  >
                    <div className="space-y-2">
                      <Label>Producto</Label>

                      <select
                        name="productId"
                        required
                        value={row.productId}
                        onChange={(event) =>
                          updateRow(row.key, "productId", event.target.value)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="" disabled>
                          Seleccione producto
                        </option>

                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.code} - {product.name}
                          </option>
                        ))}
                      </select>

                      {selectedProduct && (
                        <p className="text-xs text-muted-foreground">
                          Stock actual: {selectedProduct.stock}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        name="quantity"
                        type="number"
                        min="1"
                        step="1"
                        value={row.quantity}
                        onChange={(event) =>
                          updateRow(row.key, "quantity", event.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Costo unitario</Label>
                      <Input
                        name="cost"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={row.cost}
                        onChange={(event) =>
                          updateRow(row.key, "cost", event.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Subtotal</Label>
                      <div className="flex h-10 items-center rounded-md border px-3 text-sm font-medium">
                        {moneyFormatter.format(rowTotal || 0)}
                      </div>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeRow(row.key)}
                        disabled={rows.length === 1}
                        aria-label={`Eliminar fila ${index + 1}`}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <span className="text-sm text-muted-foreground">
              Total estimado de la orden
            </span>
            <span className="text-xl font-bold">
              {moneyFormatter.format(total)}
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/purchase-orders">Cancelar</Link>
            </Button>

            <Button type="submit">Registrar orden</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}