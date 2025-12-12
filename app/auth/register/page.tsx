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
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const register = useAuthStore((state) => state.register)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    telephone: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validateForm = () => {
    const newErrors: string[] = []

    if (formData.username.length < 2) {
      newErrors.push("Le nom doit contenir au moins 2 caractères")
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Email invalide")
    }

    if (formData.password.length < 8) {
      newErrors.push("Le mot de passe doit contenir au moins 8 caractères")
    }


    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const success = await register({
        username: formData.username,
        email: formData.email,
        telephone: formData.telephone,
        password: formData.password,
      })

      if (success) {
        toast({
          title: "Compte créé avec succès",
          description: "Bienvenue sur NappyLocks !",
        })
        router.push("/account")
      } else {
        setErrors(["Erreur lors de la création du compte"])
      }
    } catch (err) {
      setErrors(["Une erreur est survenue. Veuillez réessayer."])
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Créer un compte</h1>
              <p className="text-muted-foreground text-balance">Rejoignez NappyLocks et profitez de nos services</p>
            </div>

            <Card className="p-6 md:p-8 border-border">
              <form onSubmit={handleSubmit} className="space-y-5">
                {errors.length > 0 && (
                  <div className="space-y-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    {errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <Label htmlFor="username" className="mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nom complet
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nom et Prénom"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    required
                    className="h-12"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    className="h-12"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <Label htmlFor="telephone" className="mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone <span className="text-xs text-muted-foreground">(optionnel)</span>
                  </Label>
                  <Input
                    id="telephone"
                    type="tel"
                    placeholder="+225 00 00 00 00"
                    value={formData.telephone}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    className="h-12"
                    autoComplete="tel"
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
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                      className="h-12 pr-12"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">Minimum 8 caractères</p>
                </div>

                <Button type="submit" className="w-full h-12" disabled={isLoading}>
                  {isLoading ? "Création du compte..." : "Créer mon compte"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center space-y-4">
                <p className="text-sm text-muted-foreground">Vous avez déjà un compte ?</p>
                <Button variant="outline" className="w-full h-12 bg-transparent" asChild>
                  <Link href="/auth/login">Se connecter</Link>
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
