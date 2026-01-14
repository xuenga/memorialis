import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Plus, QrCode, Edit, Eye, Heart, Calendar, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function MyMemorials() {
  const [memorials, setMemorials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await api.auth.me();
        if (currentUser) {
          // Load user's memorials
          const userMemorials = await api.entities.Memorial.filter({
            owner_email: currentUser.email
          });
          setMemorials(userMemorials);
        }
      } catch (error) {
        console.log('Not authenticated');
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAccessByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    try {
      const found = await api.entities.Memorial.filter({
        access_code: searchCode.toUpperCase()
      });

      if (found.length > 0) {
        navigate(createPageUrl('EditMemorial', { id: found[0].id }));
      } else {
        toast.error('Code d\'accès invalide');
      }
    } catch (e) {
      toast.error('Erreur lors de la recherche');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16"
        >
          <div>
            <h1 className="font-serif text-4xl lg:text-5xl text-primary mb-4">Mes Mémoriaux</h1>
            <p className="text-primary/60 text-lg">
              Gérez les espaces mémoriels de vos proches
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <form onSubmit={handleAccessByCode} className="relative flex-1 sm:min-w-[320px]">
              <Input
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Code d'accès (ex: MEM-123)"
                className="pl-12 h-14 rounded-full border-primary/20 focus:border-accent text-lg"
              />
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
              <Button type="submit" variant="default" className="absolute right-1 top-1 h-12 rounded-full px-8 shadow-md">
                Accéder
              </Button>
            </form>
            <Link to={createPageUrl('Products')}>
              <Button variant="secondary" className="h-14 px-10 rounded-full flex items-center gap-3 whitespace-nowrap shadow-lg shadow-accent/20">
                <Plus className="w-6 h-6" />
                <span className="font-bold">Nouveau mémorial</span>
              </Button>
            </Link>
          </div>
        </motion.div>

        {memorials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 lg:py-32 bg-white rounded-3xl shadow-sm"
          >
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-primary/20" />
            </div>
            <h2 className="font-serif text-2xl text-primary mb-4">Vous n'avez pas encore de mémorial</h2>
            <p className="text-primary/60 mb-8 max-w-md mx-auto">
              Commandez votre première plaque pour commencer à créer un hommage éternel.
            </p>
            <Link to={createPageUrl('Products')}>
              <Button className="btn-primary rounded-full px-8 py-6">
                Découvrir nos solutions
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memorials.map((memorial, index) => (
              <motion.div
                key={memorial.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden group"
              >
                <div className="aspect-[16/9] relative overflow-hidden bg-primary/5">
                  {memorial.cover_photo ? (
                    <img
                      src={memorial.cover_photo}
                      alt={memorial.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-primary/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${memorial.is_public ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                      {memorial.is_public ? 'Public' : 'Privé'}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-2xl text-primary group-hover:text-accent transition-colors mb-1">
                        {memorial.name}
                      </h3>
                      <div className="flex items-center gap-2 text-primary/40 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{memorial.created_date ? `Créé le ${format(new Date(memorial.created_date), 'dd MMMM yyyy', { locale: fr })}` : 'Date inconnue'}</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center p-2">
                      <QrCode className="w-full h-full text-primary/40" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-black/5">
                    <div className="flex items-center gap-1 text-primary/60 text-xs">
                      <span className="font-mono bg-background px-2 py-1 rounded text-primary">
                        {memorial.access_code}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={createPageUrl('ViewMemorial', { id: memorial.id })}>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                          <Eye className="w-5 h-5 text-primary/60" />
                        </Button>
                      </Link>
                      <Link to={createPageUrl('EditMemorial', { id: memorial.id })}>
                        <Button variant="secondary" className="rounded-full flex items-center gap-2 h-11 px-6 shadow-md">
                          <Edit className="w-4 h-4" />
                          Gérer
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
