"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Package, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  description: string
  image?: string
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Huile Nourrissante Cheveux Afro",
    category: "Soins",
    price: 25,
    stock: 45,
    description: "Huile naturelle pour cheveux afro",
  },
  {
    id: "2",
    name: "Peigne Afro Large",
    category: "Accessoires",
    price: 12,
    stock: 30,
    description: "Peigne à dents larges",
  },
  {
    id: "3",
    name: "Masque Capillaire Réparateur",
    category: "Soins",
    price: 35,
    stock: 5,
    description: "Masque profond pour cheveux abîmés",
  },
  {
    id: "4",
    name: "Gel Coiffant Tenue Forte",
    category: "Coiffage",
    price: 18,
    stock: 50,
    description: "Gel pour maintien longue durée",
  },
]

export function ProductsTab() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "", stock: "", description: "" })

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = () => {
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      price: Number.parseFloat(newProduct.price),
      stock: Number.parseInt(newProduct.stock),
      description: newProduct.description,
    }
    setProducts([...products, product])
    toast({ title: "Produit ajouté", description: `${product.name} a été ajouté au catalogue` })
    setNewProduct({ name: "", category: "", price: "", stock: "", description: "" })
    setIsAddDialogOpen(false)
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
    toast({ title: "Produit supprimé" })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Produits</h2>
          <p className="text-muted-foreground">{products.length} produits au catalogue</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau produit</DialogTitle>
              <DialogDescription>Remplissez les informations du produit</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nom du produit</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Huile de coco bio"
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Input
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  placeholder="Soins"
                />
              </div>
              <div>
                <Label>Prix (€)</Label>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="25.00"
                />
              </div>
              <div className="col-span-2">
                <Label>Stock disponible</Label>
                <Input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Description du produit..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddProduct} className="bg-cyan-500 hover:bg-cyan-600">
                Ajouter le produit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant="outline" className="mt-2">
                    {product.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold">€{product.price}</span>
                <div className={`flex items-center gap-1 ${product.stock < 10 ? "text-red-600" : "text-green-600"}`}>
                  {product.stock < 10 && <AlertCircle className="w-4 h-4" />}
                  <span className="font-medium">{product.stock} en stock</span>
                </div>
              </div>
              {product.stock < 10 && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-2 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Stock faible - Réapprovisionnement nécessaire
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
