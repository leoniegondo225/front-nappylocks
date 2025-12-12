"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/auth-store"
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)
const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(identifier, password)

      if (success) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur NappyLocks !",
        })
        router.push("/account") //redirection vers le compte
      } else {
        setError("Email ou mot de passe incorrect")
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Connexion</h1>
              <p className="text-muted-foreground text-balance">Accédez à votre compte NappyLocks</p>
            </div>

            <Card className="p-6 md:p-8 border-border">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="identifier" className="mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                   Email ou Nom d'utilisateur
                  </Label>
                  <Input
                    id="identifier"
                    type="identifier"
                    placeholder="Email ou Nom d'utilisateur"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="h-12"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pr-12"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center space-y-4">
                <p className="text-sm text-muted-foreground">Vous n'avez pas de compte ?</p>
                <Button variant="outline" className="w-full h-12 bg-transparent" asChild>
                  <Link href="/auth/register">Créer un compte</Link>
                </Button>
              </div>

            </Card>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
