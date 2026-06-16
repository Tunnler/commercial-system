"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavMainItem = {
  title: string
  url: string
  icon?: React.ReactNode
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="gap-2">
        <SidebarMenu className="gap-2">
          {items.map((item) => {
            const isActive =
              pathname === item.url || pathname.startsWith(`${item.url}/`)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.url}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}