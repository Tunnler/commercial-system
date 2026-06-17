import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import {
  DispatchStatus,
  PrismaClient,
} from "../lib/generated/prisma/client"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })
  
  const IGV_RATE = 0.18
  
  type InvoiceSeedItem = {
    productId: string
    quantity: number
    price: string
  }
  
  function calculateInvoiceTotals(items: InvoiceSeedItem[]) {
    const subtotal = items.reduce((acc, item) => {
      return acc + item.quantity * Number(item.price)
    }, 0)
  
    const tax = subtotal * IGV_RATE
    const total = subtotal + tax
  
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    }
  }
  
  async function main() {
    console.log("Limpiando datos comerciales...")
  
    await prisma.dispatch.deleteMany()
    await prisma.invoiceItem.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.goodsReceipt.deleteMany()
    await prisma.purchaseOrderItem.deleteMany()
    await prisma.purchaseOrder.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.product.deleteMany()
  
    console.log("Creando productos...")
  
    const laptop = await prisma.product.create({
      data: {
        code: "PROD-001",
        name: "Laptop Lenovo ThinkPad E14",
        price: "2800.00",
        stock: 0,
        active: true,
      },
    })
  
    const mouse = await prisma.product.create({
      data: {
        code: "PROD-002",
        name: "Mouse Logitech M170",
        price: "55.00",
        stock: 0,
        active: true,
      },
    })
  
    const keyboard = await prisma.product.create({
      data: {
        code: "PROD-003",
        name: "Teclado Redragon Kumara",
        price: "180.00",
        stock: 0,
        active: true,
      },
    })
  
    const monitor = await prisma.product.create({
      data: {
        code: "PROD-004",
        name: 'Monitor LG 24"',
        price: "650.00",
        stock: 0,
        active: true,
      },
    })
  
    const printer = await prisma.product.create({
      data: {
        code: "PROD-005",
        name: "Impresora Epson L3250",
        price: "780.00",
        stock: 0,
        active: true,
      },
    })
  
    const headset = await prisma.product.create({
      data: {
        code: "PROD-006",
        name: "Audífonos HyperX Cloud Stinger",
        price: "220.00",
        stock: 0,
        active: true,
      },
    })
  
    const chair = await prisma.product.create({
      data: {
        code: "PROD-007",
        name: "Silla ergonómica de oficina",
        price: "520.00",
        stock: 0,
        active: true,
      },
    })
  
    const usb = await prisma.product.create({
      data: {
        code: "PROD-008",
        name: "Memoria USB Kingston 64GB",
        price: "35.00",
        stock: 0,
        active: true,
      },
    })
  
    console.log("Creando proveedores...")
  
    const supplierTech = await prisma.supplier.create({
      data: {
        name: "TecnoImport S.A.C.",
        document: "20601234567",
      },
    })
  
    const supplierAndina = await prisma.supplier.create({
      data: {
        name: "Distribuidora Andina S.A.C.",
        document: "20555666777",
      },
    })
  
    const supplierOffice = await prisma.supplier.create({
      data: {
        name: "Office Perú S.A.C.",
        document: "20444111222",
      },
    })
  
    console.log("Creando clientes...")
  
    const customerCompany = await prisma.customer.create({
      data: {
        name: "Constructora Lima S.A.C.",
        document: "20123456789",
      },
    })
  
    const customerMaria = await prisma.customer.create({
      data: {
        name: "María Gonzales",
        document: "75841236",
      },
    })
  
    const customerRivera = await prisma.customer.create({
      data: {
        name: "Servicios Rivera E.I.R.L.",
        document: "20600111222",
      },
    })
  
    const customerJuan = await prisma.customer.create({
      data: {
        name: "Juan Pérez",
        document: "71234567",
      },
    })
  
    console.log("Creando órdenes de compra...")
  
    const purchaseOrder1 = await prisma.purchaseOrder.create({
      data: {
        supplierId: supplierTech.id,
        status: "RECEIVED",
        items: {
          create: [
            {
              productId: laptop.id,
              quantity: 10,
              cost: "2100.00",
            },
            {
              productId: mouse.id,
              quantity: 50,
              cost: "30.00",
            },
            {
              productId: monitor.id,
              quantity: 15,
              cost: "480.00",
            },
          ],
        },
      },
      include: {
        items: true,
      },
    })
  
    const purchaseOrder2 = await prisma.purchaseOrder.create({
      data: {
        supplierId: supplierAndina.id,
        status: "RECEIVED",
        items: {
          create: [
            {
              productId: keyboard.id,
              quantity: 30,
              cost: "120.00",
            },
            {
              productId: headset.id,
              quantity: 25,
              cost: "150.00",
            },
            {
              productId: usb.id,
              quantity: 100,
              cost: "18.00",
            },
          ],
        },
      },
      include: {
        items: true,
      },
    })
  
    await prisma.purchaseOrder.create({
      data: {
        supplierId: supplierOffice.id,
        status: "PENDING",
        items: {
          create: [
            {
              productId: chair.id,
              quantity: 12,
              cost: "390.00",
            },
            {
              productId: printer.id,
              quantity: 8,
              cost: "560.00",
            },
          ],
        },
      },
    })
  
    console.log("Registrando ingresos de mercadería...")
  
    await prisma.$transaction(async (tx) => {
      await tx.goodsReceipt.create({
        data: {
          purchaseOrderId: purchaseOrder1.id,
        },
      })
  
      for (const item of purchaseOrder1.items) {
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
  
      await tx.goodsReceipt.create({
        data: {
          purchaseOrderId: purchaseOrder2.id,
        },
      })
  
      for (const item of purchaseOrder2.items) {
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
    })
  
    console.log("Creando facturas...")
  
    const invoice1Items: InvoiceSeedItem[] = [
      {
        productId: laptop.id,
        quantity: 2,
        price: laptop.price.toString(),
      },
      {
        productId: monitor.id,
        quantity: 2,
        price: monitor.price.toString(),
      },
      {
        productId: mouse.id,
        quantity: 5,
        price: mouse.price.toString(),
      },
    ]
  
    const invoice1Totals = calculateInvoiceTotals(invoice1Items)
  
    const invoice1 = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          customerId: customerCompany.id,
          subtotal: invoice1Totals.subtotal,
          tax: invoice1Totals.tax,
          total: invoice1Totals.total,
          items: {
            create: invoice1Items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })
  
      for (const item of invoice1Items) {
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
  
      return invoice
    })
  
    const invoice2Items: InvoiceSeedItem[] = [
      {
        productId: keyboard.id,
        quantity: 1,
        price: keyboard.price.toString(),
      },
      {
        productId: headset.id,
        quantity: 1,
        price: headset.price.toString(),
      },
      {
        productId: usb.id,
        quantity: 2,
        price: usb.price.toString(),
      },
    ]
  
    const invoice2Totals = calculateInvoiceTotals(invoice2Items)
  
    const invoice2 = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          customerId: customerMaria.id,
          subtotal: invoice2Totals.subtotal,
          tax: invoice2Totals.tax,
          total: invoice2Totals.total,
          items: {
            create: invoice2Items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })
  
      for (const item of invoice2Items) {
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
  
      return invoice
    })
  
    const invoice3Items: InvoiceSeedItem[] = [
      {
        productId: mouse.id,
        quantity: 10,
        price: mouse.price.toString(),
      },
      {
        productId: keyboard.id,
        quantity: 3,
        price: keyboard.price.toString(),
      },
    ]
  
    const invoice3Totals = calculateInvoiceTotals(invoice3Items)
  
    await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          customerId: customerRivera.id,
          subtotal: invoice3Totals.subtotal,
          tax: invoice3Totals.tax,
          total: invoice3Totals.total,
          items: {
            create: invoice3Items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      })
  
      for (const item of invoice3Items) {
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
  
      return invoice
    })
  
    console.log("Creando despachos...")
  
    await prisma.dispatch.create({
      data: {
        invoiceId: invoice1.id,
        status: DispatchStatus.DELIVERED,
      },
    })
  
    await prisma.dispatch.create({
      data: {
        invoiceId: invoice2.id,
        status: DispatchStatus.IN_TRANSIT,
      },
    })
  
    console.log("Seed finalizado correctamente.")
  
    console.table([
      {
        modulo: "Productos",
        cantidad: await prisma.product.count(),
      },
      {
        modulo: "Proveedores",
        cantidad: await prisma.supplier.count(),
      },
      {
        modulo: "Clientes",
        cantidad: await prisma.customer.count(),
      },
      {
        modulo: "Órdenes de compra",
        cantidad: await prisma.purchaseOrder.count(),
      },
      {
        modulo: "Ingresos de mercadería",
        cantidad: await prisma.goodsReceipt.count(),
      },
      {
        modulo: "Facturas",
        cantidad: await prisma.invoice.count(),
      },
      {
        modulo: "Despachos",
        cantidad: await prisma.dispatch.count(),
      },
    ])
  }
  
  main()
    .catch((error) => {
      console.error("Error ejecutando seed:", error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })