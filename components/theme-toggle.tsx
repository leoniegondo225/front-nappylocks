"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/lib/theme-store"
import { useEffect } from "react"

export function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = useThemeStore()

  useEffect(() => {
    // Initialize theme on mount
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10">
      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
      <span className="sr-only">Changer le thème</span>
    </Button>
  )
}
