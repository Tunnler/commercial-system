"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

function getSupplierPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const document = String(formData.get("document") ?? "").trim()

  const errors: string[] = []

  if (!name) {
    errors.push("El nombre del proveedor es obligatorio.")
  }

  if (document && document.length < 8) {
    errors.push("El documento debe tener al menos 8 caracteres.")
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" "))
  }

  return {
    name,
    document: document || null,
  }
}

export async function createSupplier(formData: FormData) {
  const data = getSupplierPayload(formData)

  await prisma.supplier.create({
    data,
  })

  revalidatePath("/dashboard/suppliers")
  redirect("/dashboard/suppliers")
}

export async function updateSupplier(id: string, formData: FormData) {
  const data = getSupplierPayload(formData)

  await prisma.supplier.update({
    where: {
      id,
    },
    data,
  })

  revalidatePath("/dashboard/suppliers")
  redirect("/dashboard/suppliers")
}