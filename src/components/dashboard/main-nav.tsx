'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  const links = [
    {
      href: "/dashboard",
      label: "Overview",
      active: pathname === "/dashboard"
    },
    {
      href: "/documents",
      label: "Documents",
      active: pathname === "/documents" || pathname.startsWith("/documents/")
    },
    {
      href: "/templates",
      label: "Templates",
      active: pathname === "/templates" || pathname.startsWith("/templates/")
    },
    {
      href: "/settings",
      label: "Settings",
      active: pathname === "/settings" || pathname.startsWith("/settings/")
    }
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm transition-colors hover:text-primary",
            link.active 
              ? "text-primary font-medium" 
              : "text-muted-foreground font-normal"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
