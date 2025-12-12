"use client"

import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCartStore } from "@/lib/cart-store"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronLeft, Minus, Plus, ShoppingCart, Heart, Share2, Check } from "lucide-react"
import { useParams } from "next/navigation"

interface Product {
  _id: string
  nom: string
  prix: number
  images: string[]
  description: string
  stock: boolean
  benefaits: string[]
  volume: string
}

// Backend URL
const API_URL = "http://localhost:3500"

export default function ProductPage() {
  const params = useParams()
  const { addItem } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false)
  const [liked, setLiked] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch product by ID
  useEffect(() => {
    if (!params.id) return

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/getproduit/${params.id}`)
        if (!res.ok) throw new Error("Erreur lors du fetch du produit")
        const data = await res.json()
        setProduct(data)

        // Fetch related products (exclure le produit actuel)
        const relatedRes = await fetch(`${API_URL}/api/getproduits`)
        if (relatedRes.ok) {
          const allProducts: Product[] = await relatedRes.json()
          const related = allProducts.filter(p => p._id !== data._id).slice(0, 4)
          setRelatedProducts(related)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  if (loading) return <p>Chargement...</p>
  if (!product) return <p>Produit non trouvé</p>

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product._id,
        name: product.nom,
        price: product.prix,
        image: product.images[0] ? `${API_URL}${product.images[0]}` : "/placeholder.svg",
      })
    }
    setIsAddedToCart(true)
    setTimeout(() => setIsAddedToCart(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Back Button */}
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/shop">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Retour à la boutique
            </Link>
          </Button>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={product.images[activeImage] ? `${API_URL}${product.images[activeImage]}` : "/placeholder.svg"}
                  alt={`${product.nom} ${activeImage + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`relative aspect-square rounded-md overflow-hidden bg-muted border-2 transition-colors ${activeImage === idx ? "border-foreground" : "border-transparent"
                    }`}>
                    <Image
                      src={`${API_URL}${img}`}
                      alt={`${product.nom} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.nom}</h1>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-bold">{product.prix}Fcfa</p>
                  {product.stock ? (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      En stock
                    </span>
                  ) : (
                    <span className="text-sm text-destructive">Rupture de stock</span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {/* Volume */}
              <div>
                <p className="text-sm font-medium mb-2">Volume</p>
                <p className="text-sm text-muted-foreground">{product.volume}</p>
              </div>

              {/* Quantity Selector */}
              <div>
                <p className="text-sm font-medium mb-3">Quantité</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button size="lg" className="flex-1 h-12" onClick={handleAddToCart} disabled={!product.stock}>
                  {isAddedToCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Ajouté au panier
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Ajouter au panier
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 bg-transparent"
                  onClick={() => setLiked(!liked)}
                >
                  <Heart className="w-5 h-5" fill={liked ? "red" : "none"} stroke="currentColor" />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Benefits */}
              <Card className="p-6 border-border">
                <h3 className="font-semibold text-lg mb-3">Bienfaits</h3>
                <ul className="space-y-2">
                  {product.benefaits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-foreground" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Produits recommandés</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => (
                  <Card
                    key={p._id}
                    className="overflow-hidden border-border group cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <Link href={`/shop/${p._id}`}>
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Image
                          src={p.images[0] ? `${API_URL}${p.images[0]}` : "/placeholder.svg"}
                          alt={p.nom}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{p.nom}</h3>
                        <p className="text-foreground font-semibold">{p.prix}€</p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
