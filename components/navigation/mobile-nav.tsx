"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid3x3, Scissors, ShoppingBag, User } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()

  const links = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/categories", icon: Grid3x3, label: "Catégories" },
    { href: "/services", icon: Scissors, label: "Services" },
    { href: "/shop", icon: ShoppingBag, label: "Boutique" },
    { href: "/account", icon: User, label: "Compte" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
