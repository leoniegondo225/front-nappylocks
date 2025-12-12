"use client"

import { Header } from "@/components/navigation/header"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/lib/cart-store"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const totalPrice = getTotalPrice()
  const shipping = totalPrice > 50 ? 0 : 5.99
  const finalTotal = totalPrice + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-md mx-auto text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
              <p className="text-muted-foreground mb-8 text-pretty">
                Découvrez notre sélection de produits naturels pour cheveux
              </p>
              <Button size="lg" asChild>
                <Link href="/shop">
                  Explorer la boutique
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Panier ({items.length})</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4 md:p-6 border-border">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-3">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-lg font-semibold mb-4">{item.price}€</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-base font-medium w-10 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>

                        <span className="ml-auto text-lg font-semibold">
                          {(item.price * item.quantity).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <Button variant="outline" className="w-full md:w-auto bg-transparent" onClick={clearCart}>
                Vider le panier
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 border-border sticky top-24">
                <h2 className="text-xl font-semibold mb-6">Résumé</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-medium">{totalPrice.toFixed(2)}€</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span className="font-medium">{shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)}€`}</span>
                  </div>

                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Plus que {(50 - totalPrice).toFixed(2)}€ pour la livraison gratuite
                    </p>
                  )}

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{finalTotal.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <Input placeholder="Code promo" className="flex-1" />
                    <Button variant="outline">Appliquer</Button>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button className="w-full h-12 text-base mb-3">
                  Passer commande
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href="/shop">Continuer mes achats</Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
