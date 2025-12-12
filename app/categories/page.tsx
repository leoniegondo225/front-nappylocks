import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Catégories - NappyLocks",
  description:
    "Explorez nos catégories de produits et services pour cheveux naturels : enfants, femmes, hommes, produits capillaires et accessoires.",
}

const categories = [
  {
    id: "enfants",
    name: "ENFANTS",
    href: "/shop?category=enfants",
    image: "/categories/enfants.jpg",
  },
  {
    id: "femmes",
    name: "FEMMES",
    href: "/shop?category=femmes",
    image: "/categories/femmes.jpg",
  },
  {
    id: "produits-cheveux",
    name: "PRODUITS DE CHEVEUX",
    href: "/shop?category=produits-cheveux",
    image: "/categories/produits-cheveux.jpg",
  },
  {
    id: "accessoires",
    name: "ACCESSOIRES DE CHEVEUX",
    href: "/shop?category=accessoires",
    image: "/categories/accessoires.jpg",
  },
  {
    id: "produits-peau",
    name: "PRODUITS DE PEAU",
    href: "/shop?category=produits-peau",
    image: "/categories/produits-peau.jpg",
  },
  {
    id: "hommes",
    name: "HOMMES",
    href: "/shop?category=hommes",
    image: "/categories/hommes.jpg",
  },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20 md:pb-8">
        {/* Page Title */}
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center tracking-tight">Catégories</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4" />
        </div>

        {/* Categories Grid - Full width cards with image overlays */}
        <div className="flex flex-col">
          {categories.map((category, index) => (
            <Link key={category.id} href={category.href} className="relative h-48 md:h-64 overflow-hidden group">
              {/* Image with overlay */}
              <div className="absolute inset-0">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority={index < 2}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-gradient-to-r group-hover:from-black/30 group-hover:via-gold/20 group-hover:to-black/30 transition-all duration-300" />
              </div>

              {/* Category Name Overlay */}
              <div className="relative h-full flex items-center justify-start px-6 md:px-12">
                <div>
                  <h2 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold tracking-wide drop-shadow-lg">
                    {category.name}
                  </h2>
                  <div className="h-1 bg-gold mt-2 w-0 group-hover:w-20 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
