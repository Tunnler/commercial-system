"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { DispatchStatus } from "@/lib/generated/prisma/client"
import prisma from "@/lib/prisma"

export async function createDispatch(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") ?? "").trim()
  const status = String(formData.get("status") ?? "PENDING") as DispatchStatus

  if (!invoiceId) {
    throw new Error("Debe seleccionar una factura.")
  }

  if (!Object.values(DispatchStatus).includes(status)) {
    throw new Error("El estado seleccionado no es válido.")
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    include: {
      dispatches: true,
    },
  })

  if (!invoice) {
    throw new Error("La factura seleccionada no existe.")
  }

  if (invoice.dispatches.length > 0) {
    throw new Error("Esta factura ya tiene un despacho registrado.")
  }

  const dispatch = await prisma.dispatch.create({
    data: {
      invoiceId,
      status,
    },
  })

  revalidatePath("/dashboard/dispatches")
  revalidatePath("/dashboard/invoices")

  redirect(`/dashboard/dispatches/${dispatch.id}`)
}

export async function updateDispatchStatus(
  dispatchId: string,
  status: DispatchStatus
) {
  if (!Object.values(DispatchStatus).includes(status)) {
    throw new Error("El estado seleccionado no es válido.")
  }

  await prisma.dispatch.update({
    where: {
      id: dispatchId,
    },
    data: {
      status,
    },
  })

  revalidatePath("/dashboard/dispatches")
  revalidatePath(`/dashboard/dispatches/${dispatchId}`)
  revalidatePath("/dashboard/invoices")
}