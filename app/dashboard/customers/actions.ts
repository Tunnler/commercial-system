"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

function getCustomerPayload(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const document = String(formData.get("document") ?? "").trim()

  const errors: string[] = []

  if (!name) {
    errors.push("El nombre del cliente es obligatorio.")
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

export async function createCustomer(formData: FormData) {
  const data = getCustomerPayload(formData)

  await prisma.customer.create({
    data,
  })

  revalidatePath("/dashboard/customers")
  redirect("/dashboard/customers")
}

export async function updateCustomer(id: string, formData: FormData) {
  const data = getCustomerPayload(formData)

  await prisma.customer.update({
    where: {
      id,
    },
    data,
  })

  revalidatePath("/dashboard/customers")
  redirect("/dashboard/customers")
}