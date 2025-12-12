"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/auth-store"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const resetPassword = useAuthStore((state) => state.resetPassword)

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await resetPassword(email)

      if (success) {
        setIsSuccess(true)
        toast({
          title: "Email envoyé",
          description: "Vérifiez votre boîte de réception",
        })
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      })
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
            <Button variant="ghost" className="mb-6" asChild>
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la connexion
              </Link>
            </Button>

            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Mot de passe oublié ?</h1>
              <p className="text-muted-foreground text-balance">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>

            <Card className="p-6 md:p-8 border-border">
              {isSuccess ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-2">Email envoyé !</h2>
                    <p className="text-muted-foreground text-balance">
                      Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-4">Vous n'avez pas reçu l'email ?</p>
                    <Button variant="outline" onClick={() => setIsSuccess(false)} className="w-full h-12">
                      Renvoyer l'email
                    </Button>
                  </div>

                  <Button className="w-full h-12" asChild>
                    <Link href="/auth/login">Retour à la connexion</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Adresse email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                      autoComplete="email"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
