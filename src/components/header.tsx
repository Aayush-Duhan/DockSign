'use client';

import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  
  // Don't show header on auth pages
  if (pathname === '/login' || pathname === '/signup' || pathname === '/register') {
    return null
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="font-bold text-xl mr-6">DocSign</div>
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </div>
  );
}
