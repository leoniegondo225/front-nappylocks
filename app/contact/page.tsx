import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Metadata } from "next"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact - NappyLocks",
  description: "Contactez-nous pour toute question sur nos services et produits de soins capillaires naturels.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Nous Contacter</h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground text-pretty px-4">
                Une question ? N'hésitez pas à nous écrire
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Contact Form */}
              <Card className="p-5 md:p-8 border-border order-2 md:order-1">
                <h2 className="text-lg md:text-xl font-semibold mb-5 md:mb-6">Envoyez-nous un message</h2>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm">
                      Nom complet
                    </Label>
                    <Input id="name" placeholder="Votre nom" required className="mt-2 h-12 text-base" />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      className="mt-2 h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm">
                      Téléphone (optionnel)
                    </Label>
                    <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" className="mt-2 h-12 text-base" />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Votre message..."
                      required
                      rows={5}
                      className="mt-2 resize-none text-base"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base">
                    Envoyer le message
                  </Button>
                </form>
              </Card>

              {/* Contact Info */}
              <div className="space-y-4 md:space-y-6 order-1 md:order-2">
                <Card className="p-5 md:p-6 border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-10 md:h-10 bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-base">Adresse</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        123 Rue de la Paix
                        <br />
                        75001 Paris, France
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 md:p-6 border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-10 md:h-10 bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 text-base">Téléphone</h3>
                      <p className="text-sm text-muted-foreground mb-2">+33 1 23 45 67 89</p>
                      <Button variant="outline" size="sm" className="h-10 w-full md:w-auto bg-transparent" asChild>
                        <a href="tel:+33123456789">Appeler maintenant</a>
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 md:p-6 border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-10 md:h-10 bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-base">Email</h3>
                      <p className="text-sm text-muted-foreground break-all">contact@nappylocks.fr</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 md:p-6 border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-10 md:h-10 bg-foreground text-background rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-base">Horaires</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Lun - Ven: 9h00 - 19h00</p>
                        <p>Samedi: 10h00 - 18h00</p>
                        <p>Dimanche: Fermé</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
