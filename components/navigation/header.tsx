"use client"

import Link from "next/link"
import { Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { ThemeToggle } from "@/components/theme-toggle"
// ← IMPORTE useAuthSafe ICI
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useAuthStore } from "@/lib/auth-store"

export function Header() {
  // ← REMPLACE useAuthStore par useAuthSafe
  const { user, isAuthenticated } = useAuthSafe()  // ← SEULEMENT ÇA À CHANGER
  const { logout } = useAuthStore()                // ← logout peut rester du store normal

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img className=" w-16 h-16" src="/logonappy.png" alt="logo" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-foreground/80 transition-colors">
            Accueil
          </Link>
          <Link href="/categories" className="text-sm font-medium hover:text-foreground/80 transition-colors">
            Catégories
          </Link>
          <Link href="/services" className="text-sm font-medium hover:text-foreground/80 transition-colors">
            Services
          </Link>
          <Link href="/shop" className="text-sm font-medium hover:text-foreground/80 transition-colors">
            Boutique
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-foreground/80 transition-colors">
            À propos
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-foreground/80 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="h-10 w-10 md:flex">
            <Search className="w-5 h-5" />
            <span className="sr-only">Rechercher</span>
          </Button>
          <CartDrawer />

          <div className="hidden md:block">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <User className="w-5 h-5" />
                    <span className="sr-only">Mon compte</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Connexion</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}