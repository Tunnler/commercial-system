"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  CommandIcon,
  PackageIcon,
  TruckIcon,
  ShoppingCartIcon,
  ReceiptTextIcon,
  SendIcon,
} from "lucide-react"

type AppSidebarUser = {
  name: string
  email: string
  avatar: string
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: AppSidebarUser
}

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Productos",
    url: "/dashboard/products",
    icon: <PackageIcon />,
  },
  {
    title: "Proveedores",
    url: "/dashboard/suppliers",
    icon: <TruckIcon />,
  },
  {
    title: "Clientes",
    url: "/dashboard/customers",
    icon: <UsersIcon />,
  },
  {
    title: "Órdenes de Compra",
    url: "/dashboard/purchase-orders",
    icon: <ShoppingCartIcon />,
  },
  {
    title: "Ingreso Mercadería",
    url: "/dashboard/goods-receipts",
    icon: <PackageIcon />,
  },
  {
    title: "Facturación",
    url: "/dashboard/invoices",
    icon: <ReceiptTextIcon />,
  },
  {
    title: "Despachos",
    url: "/dashboard/dispatches",
    icon: <SendIcon />,
  },
]

const navSecondary = [
  {
    title: "Configuracion",
    url: "#",
    icon: <Settings2Icon />,
  },
]

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">
                  Sistema Comercial
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}