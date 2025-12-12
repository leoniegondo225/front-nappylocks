import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import type { Metadata } from "next"
import { Award, Heart, Users, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "À propos - NappyLocks",
  description: "Découvrez l'histoire de NappyLocks, notre mission et notre équipe passionnée par les cheveux naturels.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20 md:pb-8">
        {/* Hero Section */}
        <section className="relative h-52 md:h-80 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10" />
          <Image src="/about-hero.jpg" alt="À propos NappyLocks" fill className="object-cover" priority sizes="100vw" />
          <div className="relative z-20 container mx-auto px-4 text-center text-white">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-balance">Notre Histoire</h1>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-16">
          {/* Story */}
          <div className="max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">
              Passionnés par les cheveux naturels
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="text-sm sm:text-base leading-relaxed text-pretty">
                NappyLocks est né d'une passion pour les cheveux naturels et texturés. Fondée en 2020, notre mission est
                de célébrer la beauté naturelle des cheveux afro et de fournir des produits et services de qualité
                adaptés à tous les types de texture.
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-pretty">
                Notre équipe d'experts en coiffure naturelle travaille chaque jour pour vous offrir une expérience
                unique, alliant savoir-faire traditionnel et techniques modernes. Nous sélectionnons avec soin des
                produits naturels et biologiques pour préserver la santé et la beauté de vos cheveux.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-12 md:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">Nos Valeurs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="p-6 md:p-6 text-center border-border">
                <div className="w-14 h-14 md:w-12 md:h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 md:w-6 md:h-6" />
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2">Naturel</h3>
                <p className="text-sm text-muted-foreground text-pretty">Produits 100% naturels et biologiques</p>
              </Card>

              <Card className="p-6 md:p-6 text-center border-border">
                <div className="w-14 h-14 md:w-12 md:h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 md:w-6 md:h-6" />
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2">Excellence</h3>
                <p className="text-sm text-muted-foreground text-pretty">Expertise et qualité de service</p>
              </Card>

              <Card className="p-6 md:p-6 text-center border-border">
                <div className="w-14 h-14 md:w-12 md:h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 md:w-6 md:h-6" />
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2">Passion</h3>
                <p className="text-sm text-muted-foreground text-pretty">Amour des cheveux naturels</p>
              </Card>

              <Card className="p-6 md:p-6 text-center border-border">
                <div className="w-14 h-14 md:w-12 md:h-12 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 md:w-6 md:h-6" />
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-2">Communauté</h3>
                <p className="text-sm text-muted-foreground text-pretty">Soutien et partage d'expériences</p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
