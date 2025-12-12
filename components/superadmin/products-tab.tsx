"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, AlertCircle, Loader2, X } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"
import { useAuthSafe } from "@/hooks/useAuthSafe"
import { Product } from "@/types/product"

const API_URL = "http://localhost:3500/api"
const BASE_URL = "http://localhost:3500/api"

const getImageUrl = (img: any): string => {
  if (!img) return "/placeholder.png";
  
  // Si c'est déjà une URL string (rétro-compatibilité)
  if (typeof img === "string") {
    return img.startsWith("http") ? img : `${BASE_URL}${img}`;
  }
  
  // Si c'est un objet ProductImage
  if (img && typeof img === "object") {
    // Récupère l'URL de différentes propriétés possibles
    const url = img.url || img.path || img.src;
    if (url && typeof url === "string") {
      return url.startsWith("http") ? url : `${BASE_URL}${url}`;
    }
  }
  
  return "/placeholder.png";
};


interface Category { _id: string; nom: string }

interface ProductsTabProps {
  products: Product[]
  onDeleteProduct: (id: string) => void
}



export function ProductsTab({ products: initialProducts, onDeleteProduct }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const { token } = useAuthSafe()

  // Modals
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)

  // Formulaires
  const [addForm, setAddForm] = useState({
    nom: "", description: "", prix: "", stock: "", volume: "", benefaits: "", categoryId: ""
  })
  const [addImages, setAddImages] = useState<{ file: File; preview: string; color: string; size: string; stock: string }[]>([])

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({ ...addForm })
  const [editImages, setEditImages] = useState<{ file: File | null; preview: string; color: string; size: string; stock: string }[]>([])

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [newCatName, setNewCatName] = useState("")

  // Fonction pour uploader une image vers ImageKit
const uploadToImageKit = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);

  const res = await fetch(`${API_URL}/imagekit-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload ImageKit échoué");

  return data.url; // ← L’URL finale de l’image hébergée
};


  // Nettoyage des blob URLs
  const revokeBlobUrls = useCallback((images: typeof addImages | typeof editImages) => {
    images.forEach(img => {
      if (img.preview.startsWith("blob:")) {
        URL.revokeObjectURL(img.preview)
      }
    })
  }, [])

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      revokeBlobUrls(addImages)
      revokeBlobUrls(editImages)
    }
  }, [addImages, editImages, revokeBlobUrls])

  useEffect(() => setProducts(initialProducts), [initialProducts])

  useEffect(() => {
    fetch(`${API_URL}/allcategory`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
  }, [])

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => {
        const catId = typeof p.categoryId === "object" ? p.categoryId?._id : p.categoryId
        return catId === selectedCategory
      })

  // === Catégorie ===
  const createCategory = async () => {
    if (!newCatName.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/createcategory`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nom: newCatName }),
      })
      const result = await res.json()
      console.log(result)
      if (!res.ok) throw new Error(result.message || "Erreur")
      setCategories(prev => [...prev, result.category])
      toast.success("Catégorie créée !")
      setNewCatName("")
      setCatOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Erreur")
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour convertir File en base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extraire seulement la partie base64 (sans le préfixe data:image/...;base64,)
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
  // === Ajout produit ===
const handleAdd = async () => {
  if (!addForm.nom || !addForm.prix || !addForm.categoryId || addImages.length === 0) {
    toast.error("Champs obligatoires manquants");
    return;
  }

  try {
    setLoading(true);

    // 1. UPLOAD CHAQUE IMAGE VERS IMAGEKIT
    const uploadedImages = [];
    for (const img of addImages) {
      const url = await uploadToImageKit(img.file); // upload 1 image
      uploadedImages.push({
        url,
        color: img.color,
        size: img.size,
        stock: img.stock
      });
    }

    // 2. Construire les variations (groupe par couleur + taille)
    const variations = uploadedImages.map(img => ({
      color: img.color,
      size: img.size,
      stock: Number(img.stock),
      images: [img.url],
      prix: Number(addForm.prix)
    }));

    // 3. Envoi au backend
    const body = {
      nom: addForm.nom,
      prix: Number(addForm.prix),
      description: addForm.description,
      volume: addForm.volume,
      benefaits: addForm.benefaits.split(",").map(b => b.trim()),
      categoryId: addForm.categoryId,
      mainImage: uploadedImages[0].url, // première image = image principale
      variations
    };

    const res = await fetch(`${API_URL}/produits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Erreur lors de la création");

    toast.success("Produit créé !");
    setAddOpen(false);
    setAddImages([]);
    setAddForm({ nom: "", prix: "", stock: "", volume: "", benefaits: "", categoryId: "", description: "" })
  } catch (e: any) {
    toast.error(e.message);
  } finally {
    setLoading(false);
  }
};


  // === Édition ===
  const openEdit = (product: Product) => {
    setCurrentProduct(product)
    setEditForm({
      nom: product.nom,
      description: product.description || "",
      prix: product.prix.toString(),
      stock: product.stock.toString(),
      volume: product.volume || "",
      benefaits: product.benefaits?.join(", ") || "",
      categoryId: typeof product.categoryId === "object" ? product.categoryId._id : product.categoryId || "",
    })

    const imgs = (product.images || []).map((img: any) => ({
      file: null,
      preview: getImageUrl(img),
      color: img.color || "",
      size: img.size || "",
      stock: img.stock?.toString() || "0",
    }))
    setEditImages(imgs)
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!currentProduct) return

     // Récupérer seulement les NOUVELLES images (celles avec file)
  const newImages = editImages.filter(img => img.file);
  const existingImages = editImages.filter(img => !img.file);

  
  // Convertir les nouvelles images en base64
  const newImagesBase64 = await Promise.all(
    newImages.map(async (img) => {
      if (img.file) {
        const base64 = await fileToBase64(img.file);
        return {
          base64,
          color: img.color || "",
          size: img.size || "",
          stock: img.stock || "0"
        };
      }
      return null;
    })
  ).then(results => results.filter(Boolean));
    // Préparer toutes les images pour le backend
  // Les images existantes restent telles quelles
  const allImagesForBackend = [
    ...existingImages.map(img => ({
      // Pour les images existantes, envoyer l'URL ou le fileId
      // Le backend devra gérer cela différemment
      existing: true,
      url: img.preview,
      color: img.color || "",
      size: img.size || "",
      stock: img.stock || "0"
    })),
     ...newImagesBase64
  ];
   const requestBody = {
    ...editForm,
    prix: parseFloat(editForm.prix),
    stock: parseInt(editForm.stock) || 0,
    benefaits: editForm.benefaits ? editForm.benefaits.split(',').map(b => b.trim()) : [],
    images: allImagesForBackend,
  };

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/produits/${currentProduct._id}`, {
        method: "PUT",
        headers: {  "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(requestBody),
      })

        const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Erreur mise à jour");
      setProducts(prev => prev.map(p => p._id === currentProduct._id ? result.produit : p));
    toast.success("Produit modifié !");

      setEditOpen(false)
    } catch (err: any) {
      console.error(err);
    toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    toast(t => (
      <div className="flex items-center gap-4">
        <span>Supprimer ce produit ?</span>
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={() => { onDeleteProduct(id); toast.dismiss(t.id); toast.success("Supprimé") }}>Oui</Button>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Non</Button>
        </div>
      </div>
    ), { duration: 10000 })
  }

  // Suppression propre d'une image avec revoke
  const removeImage = (index: number, isEdit: boolean) => {
    const images = isEdit ? editImages : addImages
    const img = images[index]
    if (img?.preview.startsWith("blob:")) {
      URL.revokeObjectURL(img.preview)
    }
    if (isEdit) {
      setEditImages(prev => prev.filter((_, i) => i !== index))
    } else {
      setAddImages(prev => prev.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <h2 className="text-3xl font-bold">Gestion des produits</h2>
        <div className="flex flex-wrap gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64"><SelectValue placeholder="Toutes les catégories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.nom}</SelectItem>)}
            </SelectContent>
          </Select>

          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" /> Catégorie</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nouvelle catégorie</DialogTitle></DialogHeader>
              <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ex: Soins capillaires" />
              <DialogFooter><Button onClick={createCategory} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button></DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" /> Ajouter produit</Button></DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Stock faible */}
      {products.some(p => p.stock < 10) && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p>{products.filter(p => p.stock < 10).length} produit(s) en stock faible</p>
          </CardContent>
        </Card>
      )}

      {/* Grille produits */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-5">
        {filteredProducts.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-10">Aucun produit dans cette catégorie.</p>
        ) : (
          filteredProducts.map(p => {
            const imageUrl = p.images?.[0] ? getImageUrl(p.images[0]) : "/placeholder.png"
            return (
              <Card key={p._id} className="overflow-hidden hover:shadow-xl transition-all group rounded-2xl">
                <div className="relative aspect-square bg-muted">
                  <Image src={imageUrl} alt={p.nom} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Rupture</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-sm line-clamp-2">{p.nom}</h3>
                    <Badge variant={p.stock < 10 ? "destructive" : "secondary"}>{p.stock}</Badge>
                  </div>
                  <p className="text-xl font-bold text-primary">{Number(p.prix).toLocaleString()} Fcfa</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}><Edit className="w-4 h-4 mr-1" /> Éditer</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(p._id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* MODAL AJOUT */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ajouter un produit</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div><Label>Nom *</Label><Input value={addForm.nom} onChange={e => setAddForm({ ...addForm, nom: e.target.value })} /></div>
            <div><Label>Prix (Fcfa) *</Label><Input type="number" value={addForm.prix} onChange={e => setAddForm({ ...addForm, prix: e.target.value })} /></div>
            <div><Label>Stock *</Label><Input type="number" value={addForm.stock} onChange={e => setAddForm({ ...addForm, stock: e.target.value })} /></div>
            <div><Label>Volume</Label><Input value={addForm.volume} onChange={e => setAddForm({ ...addForm, volume: e.target.value })} /></div>
            <div>
              <Label>Catégorie *</Label>
              <Select value={addForm.categoryId} onValueChange={v => setAddForm({ ...addForm, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c._id} value={c._id}>{c.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Images ajout */}
            <div className="space-y-4 md:col-span-2">
              <Label>Images *</Label>
              <div className="flex flex-wrap gap-4">
                {addImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden">
                      <Image src={img.preview} alt="" fill className="object-cover" />
                      <button onClick={() => removeImage(i, false)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      <Input placeholder="Couleur" value={img.color} onChange={e => setAddImages(prev => { const n = [...prev]; n[i].color = e.target.value; return n })} />
                      <Input placeholder="Taille" value={img.size} onChange={e => setAddImages(prev => { const n = [...prev]; n[i].size = e.target.value; return n })} />
                      <Input type="number" placeholder="Stock" value={img.stock} onChange={e => setAddImages(prev => { const n = [...prev]; n[i].stock = e.target.value; return n })} />
                    </div>
                  </div>
                ))}
              </div>
              <label className="block">
                <input
                  type="file" multiple accept="image/*" className="hidden"
                  onChange={e => {
                    if (!e.target.files) return
                    const newImgs = Array.from(e.target.files).map(file => ({
                      file,
                      preview: URL.createObjectURL(file),
                      color: "", size: "", stock: "0"
                    }))
                    setAddImages(prev => [...prev, ...newImgs])
                  }}
                />
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary">
                  <Plus className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Ajouter des images</p>
                </div>
              </label>
            </div>

            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={4} value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Bienfaits (séparés par virgule)</Label><Input value={addForm.benefaits} onChange={e => setAddForm({ ...addForm, benefaits: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdd} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer le produit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL ÉDITION */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Modifier : {currentProduct?.nom}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div><Label>Nom *</Label><Input value={editForm.nom} onChange={e => setEditForm({ ...editForm, nom: e.target.value })} /></div>
            <div><Label>Prix (Fcfa) *</Label><Input type="number" value={editForm.prix} onChange={e => setEditForm({ ...editForm, prix: e.target.value })} /></div>
            <div><Label>Stock total</Label><Input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} /></div>
            <div><Label>Volume</Label><Input value={editForm.volume} onChange={e => setEditForm({ ...editForm, volume: e.target.value })} /></div>
            <div>
              <Label>Catégorie *</Label>
              <Select value={editForm.categoryId} onValueChange={v => setEditForm({ ...editForm, categoryId: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c._id} value={c._id}>{c.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Images édition */}
            <div className="space-y-4 md:col-span-2">
              <Label>Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {editImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden">
                      <Image src={img.preview} alt="" fill className="object-cover" />
                      {img.file && (
                        <button onClick={() => removeImage(i, true)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 space-y-2">
                      <Input placeholder="Couleur" value={img.color} onChange={e => setEditImages(prev => { const n = [...prev]; n[i].color = e.target.value; return n })} />
                      <Input placeholder="Taille" value={img.size} onChange={e => setEditImages(prev => { const n = [...prev]; n[i].size = e.target.value; return n })} />
                      <Input type="number" placeholder="Stock variante" value={img.stock} onChange={e => setEditImages(prev => { const n = [...prev]; n[i].stock = e.target.value; return n })} />
                    </div>
                  </div>
                ))}
              </div>

              <label className="block">
                <input
                  type="file" multiple accept="image/*" className="hidden"
                  onChange={e => {
                    if (!e.target.files) return
                    const newImgs = Array.from(e.target.files).map(file => ({
                      file,
                      preview: URL.createObjectURL(file),
                      color: "", size: "", stock: "0"
                    }))
                    setEditImages(prev => [...prev, ...newImgs])
                  }}
                />
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary">
                  <Plus className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Ajouter d'autres images</p>
                </div>
              </label>
            </div>

            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={4} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Bienfaits (séparés par virgule)</Label><Input value={editForm.benefaits} onChange={e => setEditForm({ ...editForm, benefaits: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}