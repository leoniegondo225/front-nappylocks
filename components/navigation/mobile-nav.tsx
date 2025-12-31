"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid3x3, Scissors, ShoppingBag, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuthSafe } from "@/hooks/useAuthSafe"  // ← importe ton hook d'auth
import { useAuthStore } from "@/lib/auth-store"   // ← pour le logout

export function MobileNav() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthSafe()
  const { logout } = useAuthStore()

  const links = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/categories", icon: Grid3x3, label: "Catégories" },
    { href: "/services", icon: Scissors, label: "Services" },
    { href: "/shop", icon: ShoppingBag, label: "Boutique" },
  ]

  const isAccountActive = pathname.startsWith("/account")

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 pb-safe">
        {/* Liens normaux */}
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                if (isActive) {
                  e.preventDefault()
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
              }}
              className={`
                flex flex-col items-center justify-center flex-1 h-full gap-1
                transition-colors duration-200
                ${isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground/80"
                }
                active:scale-95
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium leading-none">
                {link.label}
              </span>
            </Link>
          )
        })}

        {/* Dropdown pour Compte */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`
                flex flex-col items-center justify-center flex-1 h-full gap-1
                transition-colors duration-200
                ${isAccountActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground/80"
                }
                active:scale-95 focus:outline-none
              `}
            >
              <User className="w-6 h-6" />
              <span className="text-[10px] font-medium leading-none">Compte</span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent 
            align="end" 
            className="w-56 mb-16"  // mb-16 pour éviter que le menu soit coupé par la barre en bas
          >
            {isAuthenticated && user ? (
              <>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{user.username}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/account" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Mon compte
                  </Link>
                </DropdownMenuItem>

                {user.role === "superadmin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard Admin
                    </Link>
                  </DropdownMenuItem>
                )}

                {user.role === "gerant" && (
                  <DropdownMenuItem asChild>
                    <Link href="/manager" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard manager
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link href="/auth/login" className="cursor-pointer">
                  Se connecter / S'inscrire
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}