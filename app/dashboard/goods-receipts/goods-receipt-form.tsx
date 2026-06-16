"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { PackageCheckIcon } from "lucide-react"
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

type PendingOrder = {
  id: string
  createdAt: string
  supplier: {
    name: string
    document: string | null
  }
  items: {
    id: string
    quantity: number
    cost: string
    product: {
      code: string
      name: string
      stock: number
    }
  }[]
}

type GoodsReceiptFormProps = {
  orders: PendingOrder[]
  action: (formData: FormData) => Promise<void>
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

export function GoodsReceiptForm({ orders, action }: GoodsReceiptFormProps) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "")

  const selectedOrder = useMemo(() => {
    return orders.find((order) => order.id === selectedOrderId)
  }, [orders, selectedOrderId])

  const total = selectedOrder
    ? selectedOrder.items.reduce((acc, item) => {
        return acc + item.quantity * Number(item.cost)
      }, 0)
    : 0

  const totalUnits = selectedOrder
    ? selectedOrder.items.reduce((acc, item) => acc + item.quantity, 0)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar ingreso de mercadería</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="purchaseOrderId"
              className="text-sm font-medium leading-none"
            >
              Orden de compra pendiente
            </label>

            <select
              id="purchaseOrderId"
              name="purchaseOrderId"
              required
              value={selectedOrderId}
              onChange={(event) => setSelectedOrderId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.supplier.name} -{" "}
                  {dateFormatter.format(new Date(order.createdAt))}
                </option>
              ))}
            </select>
          </div>

          {selectedOrder && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Proveedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">
                      {selectedOrder.supplier.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.supplier.document || "Sin documento"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Unidades a recibir
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{totalUnits}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de la orden
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {moneyFormatter.format(total)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Stock actual</TableHead>
                      <TableHead>Cantidad a recibir</TableHead>
                      <TableHead>Nuevo stock</TableHead>
                      <TableHead>Costo</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product.code}
                        </TableCell>

                        <TableCell>{item.product.name}</TableCell>

                        <TableCell>{item.product.stock}</TableCell>

                        <TableCell>{item.quantity}</TableCell>

                        <TableCell className="font-semibold">
                          {item.product.stock + item.quantity}
                        </TableCell>

                        <TableCell>
                          {moneyFormatter.format(Number(item.cost))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                Al confirmar la recepción, el sistema incrementará el stock de
                cada producto y marcará la orden de compra como recibida.
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/goods-receipts">Cancelar</Link>
            </Button>

            <Button type="submit">
              <PackageCheckIcon className="mr-2 size-4" />
              Confirmar recepción
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}