"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type SalesTrendItem = {
  date: string
  total: number
  invoices: number
}

type TopProductItem = {
  product: string
  quantity: number
  revenue: number
}

type StockItem = {
  product: string
  stock: number
}

type DashboardChartsProps = {
  salesTrend: SalesTrendItem[]
  topProducts: TopProductItem[]
  lowStockProducts: StockItem[]
}

const salesChartConfig = {
  total: {
    label: "Ventas",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const topProductsChartConfig = {
  quantity: {
    label: "Vendidos",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const stockChartConfig = {
  stock: {
    label: "Stock",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const compactMoneyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  notation: "compact",
  maximumFractionDigits: 1,
})

function shortName(value: string) {
  return value.length > 16 ? `${value.slice(0, 16)}...` : value
}

export function DashboardCharts({
  salesTrend,
  topProducts,
  lowStockProducts,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">Ventas recientes</CardTitle>
          <CardDescription className="text-xs">
            Últimos 14 días
          </CardDescription>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          <ChartContainer
            config={salesChartConfig}
            className="h-[160px] w-full !aspect-auto"
          >
            <LineChart
              data={salesTrend}
              margin={{
                top: 10,
                right: 8,
                left: -10,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                fontSize={10}
                interval="preserveStartEnd"
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                width={42}
                fontSize={10}
                tickFormatter={(value) =>
                  compactMoneyFormatter.format(Number(value))
                }
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) =>
                      compactMoneyFormatter.format(Number(value))
                    }
                  />
                }
              />

              <Line
                dataKey="total"
                type="monotone"
                stroke="var(--color-total)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">Más vendidos</CardTitle>
          <CardDescription className="text-xs">
            Por unidades vendidas
          </CardDescription>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          {topProducts.length === 0 ? (
            <div className="flex h-[160px] items-center justify-center text-xs text-muted-foreground">
              Sin ventas registradas.
            </div>
          ) : (
            <ChartContainer
              config={topProductsChartConfig}
              className="h-[160px] w-full !aspect-auto"
            >
              <BarChart
                data={topProducts.map((item) => ({
                  ...item,
                  product: shortName(item.product),
                }))}
                layout="vertical"
                margin={{
                  top: 4,
                  right: 8,
                  left: 0,
                  bottom: 4,
                }}
              >
                <CartesianGrid horizontal={false} />

                <XAxis type="number" hide />

                <YAxis
                  dataKey="product"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  width={95}
                  fontSize={10}
                />

                <ChartTooltip content={<ChartTooltipContent />} />

                <Bar
                  dataKey="quantity"
                  fill="var(--color-quantity)"
                  radius={4}
                  barSize={14}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm">Menor stock</CardTitle>
          <CardDescription className="text-xs">
            Productos por reponer
          </CardDescription>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          {lowStockProducts.length === 0 ? (
            <div className="flex h-[160px] items-center justify-center text-xs text-muted-foreground">
              Sin productos registrados.
            </div>
          ) : (
            <ChartContainer
              config={stockChartConfig}
              className="h-[160px] w-full !aspect-auto"
            >
              <BarChart
                data={lowStockProducts.map((item) => ({
                  ...item,
                  product: shortName(item.product),
                }))}
                layout="vertical"
                margin={{
                  top: 4,
                  right: 8,
                  left: 0,
                  bottom: 4,
                }}
              >
                <CartesianGrid horizontal={false} />

                <XAxis type="number" hide />

                <YAxis
                  dataKey="product"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  width={95}
                  fontSize={10}
                />

                <ChartTooltip content={<ChartTooltipContent />} />

                <Bar
                  dataKey="stock"
                  fill="var(--color-stock)"
                  radius={4}
                  barSize={14}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}