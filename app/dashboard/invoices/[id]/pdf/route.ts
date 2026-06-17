import QRCode from "qrcode"
import { headers } from "next/headers"
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

const moneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
})

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

function formatDate(date: Date) {
  return dateFormatter.format(date)
}

function getInvoiceCode(id: string) {
  return `F001-${id.slice(-8).toUpperCase()}`
}

function sanitizeText(value: string) {
  return value
    .replace(/[^\x00-\x7F]/g, (char) => {
      const replacements: Record<string, string> = {
        á: "a",
        é: "e",
        í: "i",
        ó: "o",
        ú: "u",
        Á: "A",
        É: "E",
        Í: "I",
        Ó: "O",
        Ú: "U",
        ñ: "n",
        Ñ: "N",
      }

      return replacements[char] ?? ""
    })
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("No autorizado", {
      status: 401,
    })
  }

  const { id } = await context.params

  const invoice = await prisma.invoice.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!invoice) {
    return new Response("Factura no encontrada", {
      status: 404,
    })
  }

  const invoiceCode = getInvoiceCode(invoice.id)

  const pdfDoc = await PDFDocument.create()

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page = pdfDoc.addPage([595.28, 841.89])

  const { width, height } = page.getSize()

  const margin = 45
  let y = height - 50

  function drawText(
    text: string,
    x: number,
    currentY: number,
    options?: {
      size?: number
      bold?: boolean
      color?: ReturnType<typeof rgb>
      maxWidth?: number
    }
  ) {
    page.drawText(sanitizeText(text), {
      x,
      y: currentY,
      size: options?.size ?? 10,
      font: options?.bold ? boldFont : regularFont,
      color: options?.color ?? rgb(0, 0, 0),
      maxWidth: options?.maxWidth,
    })
  }

  function drawLine(yPosition: number) {
    page.drawLine({
      start: {
        x: margin,
        y: yPosition,
      },
      end: {
        x: width - margin,
        y: yPosition,
      },
      thickness: 1,
      color: rgb(0.85, 0.85, 0.85),
    })
  }

  function drawLabelValue(label: string, value: string, x: number, rowY: number) {
    drawText(label, x, rowY, {
      size: 9,
      bold: true,
    })

    drawText(value, x + 95, rowY, {
      size: 9,
      maxWidth: 320,
    })
  }

  // Empresa
  drawText("SISTEMA COMERCIAL DEMO S.A.C.", margin, y, {
    size: 18,
    bold: true,
  })

  y -= 22

  drawText("RUC: 20123456789", margin, y, {
    size: 9,
  })

  y -= 14
  drawText("Av. Los Negocios 123 - Lima, Peru", margin, y, {
    size: 9,
  })

  y -= 14
  drawText("Correo: ventas@sistemacomercial.com", margin, y, {
    size: 9,
  })

  y -= 14
  drawText("Telefono: 999 999 999", margin, y, {
    size: 9,
  })

  // Caja comprobante
  page.drawRectangle({
    x: 385,
    y: height - 145,
    width: 165,
    height: 100,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  })

  drawText("FACTURA ELECTRONICA", 398, height - 75, {
    size: 12,
    bold: true,
  })

  drawText(invoiceCode, 410, height - 102, {
    size: 14,
    bold: true,
  })

  drawText("Representacion impresa", 417, height - 127, {
    size: 8,
  })

  drawLine(height - 165)

  // Datos cliente
  y = height - 195

  drawText("DATOS DEL CLIENTE", margin, y, {
    size: 12,
    bold: true,
  })

  y -= 25

  drawLabelValue("Cliente:", invoice.customer.name, margin, y)
  y -= 16

  drawLabelValue(
    "Documento:",
    invoice.customer.document || "Sin documento",
    margin,
    y
  )
  y -= 16

  drawLabelValue("Fecha emision:", formatDate(invoice.createdAt), margin, y)
  y -= 16

  drawLabelValue("Moneda:", "Soles - PEN", margin, y)

  // Tabla
  y -= 55

  const tableX = margin
  const tableWidth = width - margin * 2

  page.drawRectangle({
    x: tableX,
    y: y - 8,
    width: tableWidth,
    height: 24,
    color: rgb(0.94, 0.95, 0.97),
  })

  drawText("Codigo", tableX + 8, y, {
    size: 9,
    bold: true,
  })

  drawText("Producto", tableX + 70, y, {
    size: 9,
    bold: true,
  })

  drawText("Cant.", tableX + 285, y, {
    size: 9,
    bold: true,
  })

  drawText("Precio", tableX + 350, y, {
    size: 9,
    bold: true,
  })

  drawText("Subtotal", tableX + 430, y, {
    size: 9,
    bold: true,
  })

  y -= 28

  for (const item of invoice.items) {
    if (y < 130) {
      page = pdfDoc.addPage([595.28, 841.89])
      y = height - 60
    }

    drawLine(y + 12)

    const subtotal = item.quantity * Number(item.price)

    drawText(item.product.code, tableX + 8, y, {
      size: 9,
    })

    drawText(item.product.name, tableX + 70, y, {
      size: 9,
      maxWidth: 190,
    })

    drawText(String(item.quantity), tableX + 295, y, {
      size: 9,
    })

    drawText(formatMoney(Number(item.price)), tableX + 350, y, {
      size: 9,
    })

    drawText(formatMoney(subtotal), tableX + 430, y, {
      size: 9,
    })

    y -= 24
  }

  // Totales
  const totalsX = 360
  const totalsY = Math.max(y - 95, 105)

  page.drawRectangle({
    x: totalsX,
    y: totalsY,
    width: 190,
    height: 95,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  })

  drawText("Subtotal:", totalsX + 15, totalsY + 70, {
    size: 10,
  })

  drawText(formatMoney(Number(invoice.subtotal)), totalsX + 100, totalsY + 70, {
    size: 10,
  })

  drawText("IGV 18%:", totalsX + 15, totalsY + 47, {
    size: 10,
  })

  drawText(formatMoney(Number(invoice.tax)), totalsX + 100, totalsY + 47, {
    size: 10,
  })

  page.drawLine({
    start: {
      x: totalsX + 15,
      y: totalsY + 35,
    },
    end: {
      x: totalsX + 175,
      y: totalsY + 35,
    },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  })

  drawText("Total:", totalsX + 15, totalsY + 15, {
    size: 12,
    bold: true,
  })

  drawText(formatMoney(Number(invoice.total)), totalsX + 100, totalsY + 15, {
    size: 12,
    bold: true,
  })

  // QR
  const qrPayload = [
    "20123456789",
    "01",
    invoiceCode,
    Number(invoice.tax).toFixed(2),
    Number(invoice.total).toFixed(2),
    formatDate(invoice.createdAt),
    invoice.customer.document || "-",
  ].join("|")

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    margin: 1,
    width: 120,
  })

  const qrBase64 = qrDataUrl.split(",")[1]
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrBase64, "base64"))

  page.drawImage(qrImage, {
    x: margin,
    y: 95,
    width: 95,
    height: 95,
  })

  drawText("QR informativo", margin + 8, 80, {
    size: 8,
  })

  drawText(
    "Documento generado como representacion impresa para prototipo de sistema comercial. No reemplaza la validacion tributaria oficial ante SUNAT.",
    margin,
    45,
    {
      size: 8,
      color: rgb(0.35, 0.35, 0.35),
      maxWidth: width - margin * 2,
    }
  )

  const pdfBytes = await pdfDoc.save()

  return new Response(new Uint8Array(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceCode}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}