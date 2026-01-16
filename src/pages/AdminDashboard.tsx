import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Search, Eye, Edit, Heart, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminDashboard() {
  const [memorials, setMemorials] = useState<any[]>([]);
  const [filteredMemorials, setFilteredMemorials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadMemorials = async () => {
      try {
        const allMemorials = await api.entities.Memorial.list('-created_date');
        setMemorials(allMemorials);
        setFilteredMemorials(allMemorials);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    loadMemorials();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredMemorials(
        memorials.filter(memorial =>
          memorial.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memorial.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memorial.access_code?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredMemorials(memorials);
    }
  }, [searchQuery, memorials]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="font-serif text-4xl lg:text-5xl text-primary mb-2">Administration</h1>
            <p className="text-primary/60 text-lg">Gérer les contenus de la plateforme Memorialis</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-primary/5">
            <Button
              variant="secondary"
              className="rounded-full px-8 h-12 font-bold"
            >
              Mémoriaux
            </Button>
            <Link to={createPageUrl('AdminProducts')}>
              <Button
                variant="ghost"
                className="rounded-full px-8 h-12 font-bold text-primary/40 hover:text-primary"
              >
                Boutique
              </Button>
            </Link>
            <Link to={createPageUrl('AdminQRCodes')}>
              <Button
                variant="ghost"
                className="rounded-full px-8 h-12 font-bold text-primary/40 hover:text-primary"
              >
                QR Codes
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-12 text-center">
            <div className="relative inline-block w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, email ou code..."
                className="pl-14 h-16 rounded-full border-primary/5 bg-white shadow-xl shadow-primary/5 text-lg"
              />
            </div>
          </div>

          {/* Memorials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemorials.length === 0 ? (
              <div className="col-span-full text-center py-12 text-primary/40">
                Aucun mémorial trouvé
              </div>
            ) : (
              filteredMemorials.map((memorial, index) => (
                <motion.div
                  key={memorial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-primary/10 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Cover/Profile */}
                  <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5">
                    {memorial.cover_photo ? (
                      <img
                        src={memorial.cover_photo}
                        alt={memorial.name}
                        className="w-full h-full object-cover opacity-40"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Heart className="w-12 h-12 text-primary/10" />
                      </div>
                    )}

                    <div className="absolute -bottom-8 left-4">
                      <div className="w-16 h-16 rounded-xl bg-white border-4 border-white overflow-hidden shadow-lg">
                        {memorial.profile_photo ? (
                          <img
                            src={memorial.profile_photo}
                            alt={memorial.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-background flex items-center justify-center">
                            <Heart className="w-6 h-6 text-primary/20" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pt-10 p-6">
                    <h3 className="font-serif text-lg text-primary mb-2 truncate">
                      {memorial.name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-accent mb-3">
                      <QrCode className="w-3 h-3" />
                      <span className="font-mono">{memorial.access_code}</span>
                    </div>

                    <p className="text-xs text-primary/50 mb-1">
                      {memorial.created_date ? `Créé le ${format(new Date(memorial.created_date), 'dd MMM yyyy', { locale: fr })}` : 'Date inconnue'}
                    </p>
                    <p className="text-xs text-primary/50 mb-4 truncate">
                      {memorial.owner_email}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link to={createPageUrl('ViewMemorial', { id: memorial.id })} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir
                        </Button>
                      </Link>
                      <Link to={createPageUrl('EditMemorial', { id: memorial.id })} className="flex-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full rounded-full"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Éditer
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
