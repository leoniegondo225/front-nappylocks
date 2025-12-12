"use client"

import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { useState, useMemo, useEffect } from "react"
import { Search, ShoppingCart, Heart } from "lucide-react"
import { useAuthSafe } from "@/hooks/useAuthSafe"

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

export default function ShopPage() {
  const { user, isAuthenticated, isLoading } = useAuthSafe()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())

  // Fetch produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/getAllproduit`)
        const data = await res.json()
        setProducts(data.produits || [])
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

  // Gestion likes
  const toggleLike = (id: string) => {
    setLikedProducts((prev) => {
      const copy = new Set(prev)
      if (copy.has(id)) copy.delete(id)
      else copy.add(id)
      return copy
    })
  }

  // Filtrage & tri
  const filteredProducts = useMemo(() => {
    let filtered = products
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) =>
        typeof p.categoryId === "object" ? p.categoryId._id === selectedCategory : p.categoryId === selectedCategory
      )
    }
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
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-gold text-gold-foreground shadow-lg shadow-gold/20"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === cat._id
                    ? "bg-gold text-gold-foreground shadow-lg shadow-gold/20"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {cat.nom}
              </button>
            ))}
          </div>

          {/* Sort & Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-border rounded-md px-3 py-2 bg-background"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product._id}
                  className="overflow-hidden border-border group cursor-pointer hover:shadow-lg transition-all"
                >
                  <Link href={`/shop/${product._id}`}>
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.images?.[0] ? (
                        <Image
                          src={`${API_URL.replace("/api", "")}${product.images[0]}`}
                          alt={product.nom}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="bg-muted w-full h-full flex items-center justify-center text-sm">Pas d'image</div>
                      )}

                      {/* Tag */}
                      {product.tag && (
                        <div className="absolute top-2 left-2 bg-gold text-gold-foreground text-xs px-2 py-1 rounded-md font-medium">
                          {product.tag}
                        </div>
                      )}

                      {/* Stock */}
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">Rupture de stock</span>
                        </div>
                      )}

                      {/* Like Button */}
                      <button
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleLike(product._id)
                        }}
                      >
                        <Heart
                          className="w-4 h-4"
                          fill={likedProducts.has(product._id) ? "red" : "none"}
                          stroke="currentColor"
                        />
                      </button>
                    </div>

                    <div className="p-3 md:p-4">
                      <h3 className="font-medium text-sm md:text-base mb-2 line-clamp-2 leading-tight">{product.nom}</h3>
                      <p className="text-gold font-bold text-base md:text-lg mb-3">{product.prix} Fcfa</p>
                      <Button
                        size="sm"
                        className="w-full h-9 text-sm bg-gold hover:bg-gold-dark text-gold-foreground"
                        disabled={product.stock <= 0}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Ajouter
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
