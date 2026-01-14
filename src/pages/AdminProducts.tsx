import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    slug: '',
    description: '',
    long_description: '',
    price: '',
    material: 'autocollant',
    category: 'plaques',
    dimensions: '',
    features: [],
    is_active: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.entities.Product.list();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      long_description: product.long_description || '',
      price: product.price || '',
      material: product.material || 'autocollant',
      category: product.category || 'plaques',
      dimensions: product.dimensions || '',
      features: product.features || [],
      is_active: product.is_active ?? true
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      long_description: '',
      price: '',
      material: 'autocollant',
      category: 'plaques',
      dimensions: '',
      features: [],
      is_active: true
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-')
    };

    try {
      if (editingProduct) {
        await api.entities.Product.update(editingProduct.id, productData);
        toast.success('Produit mis à jour !');
      } else {
        await api.entities.Product.create(productData);
        toast.success('Produit créé !');
      }
      setShowForm(false);
      loadProducts();
    } catch (e: any) {
      console.error('Erreur lors de la sauvegarde:', e);
      const errorMessage = e?.message || 'Une erreur est survenue';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (product: any) => {
    if (!confirm(`Supprimer "${product.name}" ?`)) return;
    try {
      await api.entities.Product.delete(product.id);
      toast.success('Produit supprimé');
      loadProducts();
    } catch (e: any) {
      console.error('Erreur lors de la suppression:', e);
      const errorMessage = e?.message || 'Erreur lors de la suppression';
      toast.error(errorMessage);
    }
  };

  const toggleActive = async (product: any) => {
    try {
      await api.entities.Product.update(product.id, { is_active: !product.is_active });
      toast.success(product.is_active ? 'Produit désactivé' : 'Produit activé');
      loadProducts();
    } catch (e: any) {
      console.error('Erreur lors du toggle:', e);
      const errorMessage = e?.message || 'Erreur lors de la mise à jour';
      toast.error(errorMessage);
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="font-serif text-4xl lg:text-5xl text-primary mb-2">Administration</h1>
            <p className="text-primary/60 text-lg">Gérer le catalogue de la boutique</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-primary/5">
            <Link to={createPageUrl('AdminDashboard')}>
              <Button
                variant="ghost"
                className="rounded-full px-8 h-12 font-bold text-primary/40 hover:text-primary"
              >
                Mémoriaux
              </Button>
            </Link>
            <Button
              variant="secondary"
              className="rounded-full px-8 h-12 font-bold"
            >
              Boutique
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl text-primary mb-1">Nos Articles</h2>
            <p className="text-primary/40 uppercase tracking-widest font-bold text-[10px]">{products.length} produit(s) référencé(s)</p>
          </div>
          <Button onClick={handleNew} variant="secondary" className="rounded-full gap-3 h-12 px-8 font-bold shadow-lg shadow-accent/20 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            Nouveau produit
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-6 shadow-sm ${!product.is_active ? 'opacity-60' : ''
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-primary mb-1">{product.name}</h3>
                    <p className="text-sm text-primary/60 capitalize">{product.material}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`p-2.5 rounded-full transition-all duration-300 ${product.is_active
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-primary/5 text-primary/40 hover:bg-primary/10'
                        }`}
                      title={product.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {product.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2.5 bg-primary/5 text-primary rounded-full hover:bg-primary/10 transition-all duration-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-primary/70 mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                  <span className="text-xs text-primary/50">{product.dimensions}</span>
                  <span className="font-serif text-xl text-accent">{product.price}€</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-primary/10 p-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl text-primary">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-background rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-primary" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du produit *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="auto-généré si vide"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Catégorie *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plaques">Plaques</SelectItem>
                        <SelectItem value="accessoires">Accessoires</SelectItem>
                        <SelectItem value="personnalisation">Personnalisation</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Matériau *</Label>
                    <Select
                      value={formData.material}
                      onValueChange={(value) => setFormData({ ...formData, material: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="autocollant">Autocollant</SelectItem>
                        <SelectItem value="plexiglass">Plexiglass</SelectItem>
                        <SelectItem value="metal">Métal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prix (€) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dimensions</Label>
                    <Input
                      value={formData.dimensions}
                      onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                      placeholder="Ex: 10 x 10 cm"
                    />
                  </div>
                </div>


                <div className="space-y-2">
                  <Label>Description courte *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description détaillée</Label>
                  <Textarea
                    value={formData.long_description}
                    onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                    rows={6}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Caractéristiques</Label>
                    <Button type="button" onClick={addFeature} size="sm" variant="outline" className="rounded-full px-4 border-primary/20">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.features.map((feature: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Ex: Garantie 2 ans"
                        />
                        <Button
                          type="button"
                          onClick={() => removeFeature(index)}
                          size="icon"
                          variant="ghost"
                          className="h-14 w-14 rounded-2xl text-red-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
                  <div>
                    <Label>Produit actif</Label>
                    <p className="text-sm text-primary/60">Visible sur la boutique</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1 rounded-full h-14 font-bold border-primary/20"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="secondary" className="flex-1 gap-3 rounded-full h-14 font-bold shadow-xl shadow-accent/20">
                    <Save className="w-5 h-5" />
                    {editingProduct ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
