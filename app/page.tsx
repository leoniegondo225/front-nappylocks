"use client"

import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { Search, ShoppingCart, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { useRouter } from "next/navigation"

interface Product {
  _id: string
  nom: string
  prix: number
  images?: string[]
  categoryId: { _id: string; nom: string } | string
  stock: number
  tag?: string
}

interface Category {
  _id: string
  nom: string
}

const API_URL = "http://localhost:3500/api"

const sortOptions = [
  { value: "featured", label: "Recommandés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "name", label: "Nom A-Z" },
]

const heroSlides = [
  { id: 1, image: "/hero-salon.jpg", title: "Nouvelle Collection", subtitle: "Produits Bio & Naturels" },
  { id: 2, image: "/categories/femmes.jpg", title: "Soins Cheveux Naturels", subtitle: "Pour tous types de boucles" },
  { id: 3, image: "/services/box-braids.jpg", title: "Réservez Votre Service", subtitle: "Coiffure professionnelle" },
  { id: 4, image: "/products/shea-butter.jpg", title: "Bestsellers", subtitle: "Les produits les plus vendus" },
]

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuthSafe()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [likedProducts, setLikedProducts] = useState<string[]>([])

  // Fetch produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/getAllproduit`)
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchProducts()
  }, [])

  // Fetch catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/allcategory`)
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchCategories()
  }, [])

  // Slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  // Gestion des likes
  const toggleLike = (productId: string) => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }
    setLikedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  // Filtrage & tri sécurisé
  const filteredProducts = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products : []

    let filtered = selectedCategory === "all"
      ? safeProducts
      : safeProducts.filter(
          (p) => (typeof p.categoryId === "object" ? p.categoryId._id : p.categoryId) === selectedCategory
        )

    if (searchQuery) {
      filtered = filtered.filter((p) => p.nom.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    const sorted = [...filtered]
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.prix - b.prix)
        break
      case "price-desc":
        sorted.sort((a, b) => b.prix - a.prix)
        break
      case "name":
        sorted.sort((a, b) => a.nom.localeCompare(b.nom))
        break
    }

    return sorted
  }, [products, selectedCategory, searchQuery, sortBy])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20 md:pb-8">
        {/* Hero Carousel */}
        <section className="relative bg-background overflow-hidden">
          <div className="relative h-48 md:h-64 lg:h-72">
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
                <Image src={slide.image} alt={slide.title} fill className="object-cover brightness-75" priority={index === 0} sizes="100vw" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-4">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{slide.title}</h2>
                    <p className="text-sm md:text-lg text-white/90">{slide.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={prevSlide} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors z-10">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors z-10">
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {heroSlides.map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-gold w-6" : "bg-white/60 hover:bg-white/80"}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <div id="products" className="container mx-auto px-4 py-6 md:py-8">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">Notre Boutique</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-4" />
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Des produits naturels soigneusement sélectionnés pour sublimer vos cheveux
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input type="text" placeholder="Rechercher un produit..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-12 text-base" />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => setSelectedCategory("all")} className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === "all" ? "bg-gold text-gold-foreground shadow-lg shadow-gold/20" : "bg-muted text-foreground hover:bg-muted/80"}`}>Tous</button>
            {(categories || []).map((cat) => (
              <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat._id ? "bg-gold text-gold-foreground shadow-lg shadow-gold/20" : "bg-muted text-foreground hover:bg-muted/80"}`}>{cat.nom}</button>
            ))}
          </div>

          {/* Sort & Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">{filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-border rounded-md px-3 py-2 bg-background">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          {(filteredProducts || []).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <Card key={product._id} className="overflow-hidden border-border group cursor-pointer hover:shadow-lg hover:border-gold/50 transition-all">
                  <Link href={`/shop/${product._id}`}>
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.images?.[0] ? (
                        <Image
                          src={`${API_URL.replace("/api", "")}${product.images[0]}`}
                          alt={product.nom}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="bg-muted w-full h-full flex items-center justify-center text-sm">
                          Pas d'image
                        </div>
                      )}
                      {product.tag && (
                        <div className="absolute top-2 left-2 bg-gold text-gold-foreground text-xs px-2 py-1 rounded-md font-medium shadow-lg">
                          {product.tag}
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">Rupture de stock</span>
                        </div>
                      )}
                      <button
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-opacity ${
                          likedProducts.includes(product._id)
                            ? "bg-red-500 text-white"
                            : "bg-white/90 opacity-0 group-hover:opacity-100"
                        }`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleLike(product._id)
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-medium text-sm md:text-base mb-2 line-clamp-2 leading-tight">{product.nom}</h3>
                      <p className="text-gold font-bold text-base md:text-lg mb-3">{product.prix} Fcfa</p>
                      <Button
                        size="sm"
                        className="w-full h-9 text-sm bg-gold hover:bg-gold-dark text-gold-foreground"
                        disabled={product.stock <= 0}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" /> Ajouter
                      </Button>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-2">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
