"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export async function createPurchaseOrder(formData: FormData) {
  const supplierId = String(formData.get("supplierId") ?? "").trim()

  const productIds = formData.getAll("productId").map(String)
  const quantities = formData.getAll("quantity").map(String)
  const costs = formData.getAll("cost").map(String)

  const errors: string[] = []

  if (!supplierId) {
    errors.push("Debe seleccionar un proveedor.")
  }

  const items = productIds
    .map((productId, index) => {
      const quantity = Number(quantities[index])
      const cost = Number(costs[index])

      return {
        productId,
        quantity,
        cost,
      }
    })
    .filter((item) => item.productId)

  if (items.length === 0) {
    errors.push("Debe agregar al menos un producto.")
  }

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      errors.push("La cantidad debe ser un número entero mayor a 0.")
      break
    }

    if (Number.isNaN(item.cost) || item.cost <= 0) {
      errors.push("El costo debe ser mayor a 0.")
      break
    }
  }

  const duplicatedProducts = new Set<string>()

  for (const item of items) {
    if (duplicatedProducts.has(item.productId)) {
      errors.push("No se puede repetir el mismo producto en una orden.")
      break
    }

    duplicatedProducts.add(item.productId)
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" "))
  }

  const purchaseOrder = await prisma.purchaseOrder.create({
    data: {
      supplierId,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          cost: item.cost.toFixed(2),
        })),
      },
    },
  })

  revalidatePath("/dashboard/purchase-orders")
  redirect(`/dashboard/purchase-orders/${purchaseOrder.id}`)
}