"use client"

import Link from "next/link"
import { PlusIcon, TrashIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CustomerOption = {
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
}

type InvoiceFormProps = {
  customers: CustomerOption[]
  products: ProductOption[]
  action: (formData: FormData) => Promise<void>
}

const IGV_RATE = 0.18

function createEmptyRow(): DetailRow {
  return {
    key: Math.random().toString(36).slice(2),
    productId: "",
    quantity: "1",
  }
}

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

export function InvoiceForm({ customers, products, action }: InvoiceFormProps) {
  const [rows, setRows] = useState<DetailRow[]>([createEmptyRow()])

  const productMap = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]))
  }, [products])

  const subtotal = rows.reduce((acc, row) => {
    const product = productMap.get(row.productId)
    const quantity = Number(row.quantity)

    if (!product || Number.isNaN(quantity)) {
      return acc
    }

    return acc + quantity * Number(product.price)
  }, 0)

  const tax = subtotal * IGV_RATE
  const total = subtotal + tax

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
        <CardTitle>Registrar factura</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="customerId">Cliente</Label>

            <select
              id="customerId"
              name="customerId"
              required
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Seleccione un cliente
              </option>

              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.document ? ` - ${customer.document}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Detalle de productos</h3>
                <p className="text-sm text-muted-foreground">
                  Agrega productos y cantidades para generar la factura.
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
                const quantity = Number(row.quantity || 0)
                const rowTotal = selectedProduct
                  ? quantity * Number(selectedProduct.price)
                  : 0

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
                          Stock disponible: {selectedProduct.stock}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        name="quantity"
                        type="number"
                        min="1"
                        max={selectedProduct?.stock ?? undefined}
                        step="1"
                        value={row.quantity}
                        onChange={(event) =>
                          updateRow(row.key, "quantity", event.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Precio</Label>
                      <div className="flex h-10 items-center rounded-md border px-3 text-sm">
                        {selectedProduct
                          ? moneyFormatter.format(Number(selectedProduct.price))
                          : moneyFormatter.format(0)}
                      </div>
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

          <div className="ml-auto max-w-sm space-y-2 rounded-lg border p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{moneyFormatter.format(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IGV 18%</span>
              <span>{moneyFormatter.format(tax)}</span>
            </div>

            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{moneyFormatter.format(total)}</span>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            Al registrar la factura, el sistema validará el stock en servidor y
            descontará las unidades vendidas de cada producto.
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/invoices">Cancelar</Link>
            </Button>

            <Button type="submit">Registrar factura</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}