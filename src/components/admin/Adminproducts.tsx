import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, EyeOff, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'plaques',
    description: '',
    long_description: '',
    price: '',
    material: 'plexiglass',
    dimensions: '',
    stock: 0,
    features: [''],
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, categoryFilter, products]);

  const loadProducts = async () => {
    const allProducts = await api.entities.Product.list();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock as any),
      features: formData.features.filter((f: string) => f.trim() !== '')
    };

    if (editingProduct) {
      await api.entities.Product.update(editingProduct.id, productData);
      toast.success('Produit mis à jour');
    } else {
      await api.entities.Product.create(productData);
      toast.success('Produit créé');
    }

    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'plaques',
      description: '',
      long_description: '',
      price: '',
      material: 'plexiglass',
      dimensions: '',
      stock: 0,
      features: [''],
      image_url: '',
      is_active: true
    });
    loadProducts();
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'plaques',
      description: product.description || '',
      long_description: product.long_description || '',
      price: product.price?.toString() || '',
      material: product.material || 'plexiglass',
      dimensions: product.dimensions || '',
      stock: product.stock || 0,
      features: product.features?.length > 0 ? product.features : [''],
      image_url: product.image_url || '',
      is_active: product.is_active !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce produit ?')) {
      await api.entities.Product.delete(id);
      toast.success('Produit supprimé');
      loadProducts();
    }
  };

  const toggleActive = async (product: any) => {
    await api.entities.Product.update(product.id, { is_active: !product.is_active });
    loadProducts();
    toast.success(product.is_active ? 'Produit désactivé' : 'Produit activé');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement file upload to a storage service
    // For now, just show a placeholder message
    toast.info('Upload d\'image non configuré - utilisez une URL directe');
  };

  const categories = [
    { value: 'plaques', label: 'Plaques' },
    { value: 'accessoires', label: 'Accessoires' },
    { value: 'personnalisation', label: 'Personnalisation' },
    { value: 'services', label: 'Services' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#e0bd3e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-serif text-[#2f4858]">Gestion des produits</h2>
        <Button onClick={() => setShowForm(true)} className="bg-[#e0bd3e] text-[#2f4858] hover:bg-[#e0bd3e]/90 rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2f4858]/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="pl-10 border-[#2f4858]/20"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 border-[#2f4858]/20">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-[#2f4858]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#e6e6da]/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Produit</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Catégorie</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Prix</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Statut</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-[#2f4858]/5 hover:bg-[#e6e6da]/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#e6e6da]/50 overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-[#2f4858]/20" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#2f4858]">{product.name}</p>
                        <p className="text-xs text-[#2f4858]/50">{product.material}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize text-sm text-[#2f4858]">{product.category}</td>
                  <td className="p-4 font-medium text-[#2f4858]">{product.price}€</td>
                  <td className="p-4 text-sm text-[#2f4858]">{product.stock}</td>
                  <td className="p-4">
                    <Badge variant={product.is_active ? 'default' : 'secondary'} className={product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(product)} className="h-8 w-8 text-[#2f4858]/60 hover:text-[#2f4858]">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => toggleActive(product)} className="h-8 w-8 text-[#2f4858]/60 hover:text-[#2f4858]">
                        {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(product.id)} className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
