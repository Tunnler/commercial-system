"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

const IGV_RATE = 0.18

export async function createInvoice(formData: FormData) {
  const customerId = String(formData.get("customerId") ?? "").trim()

  const productIds = formData.getAll("productId").map(String)
  const quantities = formData.getAll("quantity").map(String)

  const errors: string[] = []

  if (!customerId) {
    errors.push("Debe seleccionar un cliente.")
  }

  const items = productIds
    .map((productId, index) => {
      const quantity = Number(quantities[index])

      return {
        productId,
        quantity,
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
  }

  const duplicatedProducts = new Set<string>()

  for (const item of items) {
    if (duplicatedProducts.has(item.productId)) {
      errors.push("No se puede repetir el mismo producto en una factura.")
      break
    }

    duplicatedProducts.add(item.productId)
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" "))
  }

  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  })

  if (!customer) {
    throw new Error("El cliente seleccionado no existe.")
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: items.map((item) => item.productId),
      },
      active: true,
    },
  })

  const productMap = new Map(products.map((product) => [product.id, product]))

  for (const item of items) {
    const product = productMap.get(item.productId)

    if (!product) {
      throw new Error("Uno de los productos seleccionados no existe o está inactivo.")
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para ${product.name}. Stock actual: ${product.stock}.`
      )
    }
  }

  const invoiceItems = items.map((item) => {
    const product = productMap.get(item.productId)!

    return {
      productId: product.id,
      quantity: item.quantity,
      price: product.price.toString(),
      subtotal: item.quantity * Number(product.price),
    }
  })

  const subtotal = invoiceItems.reduce((acc, item) => acc + item.subtotal, 0)
  const tax = subtotal * IGV_RATE
  const total = subtotal + tax

  const invoice = await prisma.$transaction(async (tx) => {
    const createdInvoice = await tx.invoice.create({
      data: {
        customerId,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        items: {
          create: invoiceItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    })

    for (const item of invoiceItems) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return createdInvoice
  })

  revalidatePath("/dashboard/invoices")
  revalidatePath("/dashboard/products")

  redirect(`/dashboard/invoices/${invoice.id}`)
}