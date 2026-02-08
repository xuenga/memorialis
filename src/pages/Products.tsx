import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, QrCode, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        let data = await api.entities.Product.filter({ is_active: true });

        if (filter !== 'all') {
          data = data.filter((p: any) => p.material === filter);
        }

        if (sort === 'price-asc') {
          data.sort((a: any, b: any) => a.price - b.price);
        } else if (sort === 'price-desc') {
          data.sort((a: any, b: any) => b.price - a.price);
        }

        setProducts(data);
      } catch (error) {
        console.error(error);
      }
      setIsLoading(false);
    };
    loadProducts();
  }, [filter, sort]);

  const materials = [
    { value: 'all', label: 'Tous les supports' },
    { value: 'autocollant', label: 'Autocollant' },
    { value: 'plexiglass', label: 'Plexiglass' },
    { value: 'metal', label: 'Métal' },
  ];

  const sortOptions = [
    { value: 'default', label: 'Par défaut' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-serif text-4xl lg:text-6xl text-white mb-6">Nos Plaques Mémorielles</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Choisissez le support qui accueillera l'hommage éternel de votre proche.
              Tous nos produits incluent l'hébergement à vie du mémorial numérique.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-40 bg-background/95 backdrop-blur-md border-b border-primary/5 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              {materials.map((m) => {
                const isActive = filter === m.value;
                return (
                  <Button
                    key={m.value}
                    onClick={() => setFilter(m.value)}
                    variant={isActive ? 'secondary' : 'outline'}
                    className={`rounded-full px-8 py-6 text-sm font-bold uppercase tracking-widest transition-all ${isActive ? 'shadow-lg shadow-accent/20' : 'border-primary/20 text-primary hover:bg-primary hover:text-white'
                      }`}
                  >
                    {m.label}
                  </Button>
                );
              })}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full border-primary/10 gap-2 text-primary">
                  <Filter className="w-4 h-4" />
                  Trier par : {sortOptions.find(o => o.value === sort)?.label}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-2xl border-primary/5 p-2 bg-white">
                {sortOptions.map((o) => (
                  <DropdownMenuItem
                    key={o.value}
                    onClick={() => setSort(o.value)}
                    className="rounded-xl px-4 py-2 text-primary cursor-pointer hover:bg-primary/5"
                  >
                    {o.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-10 h-10 border-4 border-[#e0bd3e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {products.map((product: any, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={createPageUrl('ProductDetail', { slug: product.slug || product.id })}>
                    <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-primary shadow-sm mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/25 z-10" />
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                      <div className="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-30">
                        <Button variant="secondary" className="w-full py-7 rounded-full text-lg font-bold shadow-2xl">
                          Découvrir le produit
                        </Button>
                      </div>
                    </div>
                  </Link>

                  <div className="px-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#e0bd3e]">
                          Support {product.material}
                        </span>
                        <h3 className="font-serif text-3xl text-primary mt-1 group-hover:text-primary/70 transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      <p className="font-serif text-2xl text-primary">{product.price}€</p>
                    </div>
                    <p className="text-primary/60 text-sm leading-relaxed mb-6">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-6 pt-4 border-t border-primary/5">
                      <div className="flex items-center gap-2 text-primary/40 text-[10px] uppercase font-bold tracking-wider">
                        <QrCode className="w-4 h-4" />
                        Accès à vie
                      </div>
                      <div className="flex items-center gap-2 text-primary/40 text-[10px] uppercase font-bold tracking-wider">
                        <ShoppingBag className="w-4 h-4" />
                        Livraison offerte
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] shadow-sm">
              <p className="text-primary/40 text-lg">Aucun produit ne correspond à vos critères.</p>
              <Button
                onClick={() => { setFilter('all'); setSort('default'); }}
                variant="ghost"
                className="mt-4 text-accent hover:bg-accent/5"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
