"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export async function createGoodsReceipt(formData: FormData) {
  const purchaseOrderId = String(formData.get("purchaseOrderId") ?? "").trim()

  if (!purchaseOrderId) {
    throw new Error("Debe seleccionar una orden de compra.")
  }

  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: {
      id: purchaseOrderId,
    },
    include: {
      items: true,
    },
  })

  if (!purchaseOrder) {
    throw new Error("La orden de compra no existe.")
  }

  if (purchaseOrder.status === "RECEIVED") {
    throw new Error("Esta orden de compra ya fue recibida.")
  }

  if (purchaseOrder.items.length === 0) {
    throw new Error("La orden de compra no tiene productos.")
  }

  await prisma.$transaction(async (tx) => {
    await tx.goodsReceipt.create({
      data: {
        purchaseOrderId,
      },
    })

    for (const item of purchaseOrder.items) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      })
    }

    await tx.purchaseOrder.update({
      where: {
        id: purchaseOrderId,
      },
      data: {
        status: "RECEIVED",
      },
    })
  })

  revalidatePath("/dashboard/goods-receipts")
  revalidatePath("/dashboard/purchase-orders")
  revalidatePath("/dashboard/products")

  redirect("/dashboard/goods-receipts")
}