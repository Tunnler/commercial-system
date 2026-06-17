"use client"

import Link from "next/link"
import { TruckIcon } from "lucide-react"
import { useMemo, useState } from "react"
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

type DispatchStatus = "PENDING" | "IN_TRANSIT" | "DELIVERED"

const DISPATCH_STATUSES: DispatchStatus[] = [
  "PENDING",
  "IN_TRANSIT",
  "DELIVERED",
]

type InvoiceOption = {
  id: string
  createdAt: string
  customer: {
    name: string
    document: string | null
  }
  total: string
  items: {
    id: string
    quantity: number
    price: string
    product: {
      code: string
      name: string
    }
  }[]
}

type DispatchFormProps = {
  invoices: InvoiceOption[]
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

function getStatusLabel(status: DispatchStatus) {
  if (status === "PENDING") return "Pendiente"
  if (status === "IN_TRANSIT") return "En tránsito"
  if (status === "DELIVERED") return "Entregado"

  return status
}

export function DispatchForm({ invoices, action }: DispatchFormProps) {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(
    invoices[0]?.id ?? ""
  )

  const selectedInvoice = useMemo(() => {
    return invoices.find((invoice) => invoice.id === selectedInvoiceId)
  }, [invoices, selectedInvoiceId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar despacho</CardTitle>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="invoiceId"
              className="text-sm font-medium leading-none"
            >
              Factura pendiente de despacho
            </label>

            <select
              id="invoiceId"
              name="invoiceId"
              required
              value={selectedInvoiceId}
              onChange={(event) => setSelectedInvoiceId(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.customer.name} -{" "}
                  {dateFormatter.format(new Date(invoice.createdAt))} -{" "}
                  {moneyFormatter.format(Number(invoice.total))}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium leading-none">
              Estado inicial
            </label>

            <select
              id="status"
              name="status"
              defaultValue="PENDING"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {DISPATCH_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {selectedInvoice && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">
                      {selectedInvoice.customer.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedInvoice.customer.document || "Sin documento"}
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
                      {dateFormatter.format(new Date(selectedInvoice.createdAt))}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total factura
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {moneyFormatter.format(Number(selectedInvoice.total))}
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
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {selectedInvoice.items.map((item) => {
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

                          <TableCell>
                            {moneyFormatter.format(subtotal)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
                Al registrar el despacho, la factura quedará asociada a un
                proceso de entrega. Luego podrás actualizar su estado.
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/dispatches">Cancelar</Link>
            </Button>

            <Button type="submit">
              <TruckIcon className="mr-2 size-4" />
              Registrar despacho
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}