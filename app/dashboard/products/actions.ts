"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Prisma } from "@/lib/generated/prisma/client"
import prisma  from "@/lib/prisma"

function getProductPayload(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase()
  const name = String(formData.get("name") ?? "").trim()
  const priceValue = Number(formData.get("price"))
  const stockValue = Number(formData.get("stock"))
  const active = formData.get("active") === "on"

  const errors: string[] = []

  if (!code) errors.push("El código es obligatorio.")
  if (!name) errors.push("El nombre es obligatorio.")
  if (Number.isNaN(priceValue) || priceValue < 0) {
    errors.push("El precio debe ser mayor o igual a 0.")
  }
  if (!Number.isInteger(stockValue) || stockValue < 0) {
    errors.push("El stock debe ser un número entero mayor o igual a 0.")
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" "))
  }

  return {
    code,
    name,
    price: priceValue.toFixed(2),
    stock: stockValue,
    active,
  }
}

export async function createProduct(formData: FormData) {
  const data = getProductPayload(formData)

  try {
    await prisma.product.create({
      data,
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe un producto con ese código.")
    }

    throw error
  }

  revalidatePath("/dashboard/products")
  redirect("/dashboard/products")
}

export async function updateProduct(id: string, formData: FormData) {
  const data = getProductPayload(formData)

  try {
    await prisma.product.update({
      where: { id },
      data,
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("Ya existe un producto con ese código.")
    }

    throw error
  }

  revalidatePath("/dashboard/products")
  redirect("/dashboard/products")
}

export async function changeProductStatus(id: string, active: boolean) {
  await prisma.product.update({
    where: { id },
    data: { active },
  })

  revalidatePath("/dashboard/products")
}