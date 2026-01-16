import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import {
    QrCode, Plus, Search, Trash2, Eye, Download,
    CheckCircle2, Clock, AlertCircle, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface QRCodeData {
    id: string;
    code: string;
    status: 'available' | 'reserved' | 'activated';
    memorial_id?: string;
    order_id?: string;
    owner_email?: string;
    qr_image_url?: string;
    reserved_at?: string;
    activated_at?: string;
    created_at?: string;
}

export default function AdminQRCodes() {
    const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
    const [filteredCodes, setFilteredCodes] = useState<QRCodeData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Génération en lot
    const [prefix, setPrefix] = useState('');
    const [quantity, setQuantity] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);

    // Statistiques
    const stats = {
        total: qrCodes.length,
        available: qrCodes.filter(q => q.status === 'available').length,
        reserved: qrCodes.filter(q => q.status === 'reserved').length,
        activated: qrCodes.filter(q => q.status === 'activated').length,
    };

    useEffect(() => {
        loadQRCodes();
    }, []);

    useEffect(() => {
        let filtered = qrCodes;

        if (searchQuery) {
            filtered = filtered.filter(qr =>
                qr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                qr.owner_email?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(qr => qr.status === statusFilter);
        }

        setFilteredCodes(filtered);
    }, [searchQuery, statusFilter, qrCodes]);

    const loadQRCodes = async () => {
        try {
            const codes = await api.entities.QRCode.list('-created_at');
            setQRCodes(codes);
            setFilteredCodes(codes);
        } catch (e) {
            console.error('Erreur chargement QR codes:', e);
            toast.error('Erreur lors du chargement des codes');
        }
        setIsLoading(false);
    };

    const generateCodes = async () => {
        if (!prefix || prefix.length !== 4) {
            toast.error('Le préfixe doit contenir 4 chiffres (AAMM)');
            return;
        }
        if (quantity < 1 || quantity > 500) {
            toast.error('La quantité doit être entre 1 et 500');
            return;
        }

        setIsGenerating(true);
        try {
            // Appeler la fonction SQL generate_qrcodes via RPC
            // Cette fonction a SECURITY DEFINER et contourne les restrictions RLS
            const { data: generatedCount, error } = await supabase.rpc('generate_qrcodes', {
                prefix: prefix,
                quantity: quantity
            });

            if (error) {
                console.error('Erreur RPC:', error);
                toast.error(`Erreur: ${error.message}`);
            } else {
                toast.success(`${generatedCount} codes générés avec succès`);
                await loadQRCodes();
                setPrefix('');
            }
        } catch (e) {
            console.error('Erreur lors de la génération:', e);
            toast.error('Erreur lors de la génération');
        }
        setIsGenerating(false);
    };

    const deleteCode = async (qr: QRCodeData) => {
        if (qr.status !== 'available') {
            toast.error('Impossible de supprimer un code réservé ou activé');
            return;
        }
        if (!confirm(`Supprimer le code ${qr.code} ?`)) return;

        try {
            await api.entities.QRCode.delete(qr.id);
            toast.success('Code supprimé');
            await loadQRCodes();
        } catch (e) {
            toast.error('Erreur lors de la suppression');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'available':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Disponible
                    </span>
                );
            case 'reserved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Réservé
                    </span>
                );
            case 'activated':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <Package className="w-3 h-3" />
                        Activé
                    </span>
                );
            default:
                return null;
        }
    };

    // Générer le préfixe par défaut (AAMM actuel)
    const getDefaultPrefix = () => {
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        return `${year}${month}`;
    };

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
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div>
                        <h1 className="font-serif text-4xl lg:text-5xl text-primary mb-2">QR Codes</h1>
                        <p className="text-primary/60 text-lg">Gérer les codes QR pré-générés</p>
                    </div>

                    <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-primary/5">
                        <Link to={createPageUrl('AdminDashboard')}>
                            <Button variant="ghost" className="rounded-full px-8 h-12 font-bold text-primary/40 hover:text-primary">
                                Mémoriaux
                            </Button>
                        </Link>
                        <Link to={createPageUrl('AdminProducts')}>
                            <Button variant="ghost" className="rounded-full px-8 h-12 font-bold text-primary/40 hover:text-primary">
                                Boutique
                            </Button>
                        </Link>
                        <Button variant="secondary" className="rounded-full px-8 h-12 font-bold">
                            QR Codes
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: 'Total', value: stats.total, icon: QrCode, color: 'text-primary' },
                        { label: 'Disponibles', value: stats.available, icon: CheckCircle2, color: 'text-green-600' },
                        { label: 'Réservés', value: stats.reserved, icon: Clock, color: 'text-yellow-600' },
                        { label: 'Activés', value: stats.activated, icon: Package, color: 'text-blue-600' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl p-6 border border-primary/5"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                <span className="text-sm text-primary/60">{stat.label}</span>
                            </div>
                            <p className={`text-3xl font-serif ${stat.color}`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Génération en lot */}
                <div className="bg-white rounded-2xl p-8 border border-primary/5 mb-8">
                    <h2 className="font-serif text-xl text-primary mb-6 flex items-center gap-3">
                        <Plus className="w-5 h-5 text-accent" />
                        Générer des codes
                    </h2>

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <Label className="text-xs text-primary/60 uppercase tracking-widest mb-2 block">
                                Préfixe (AAMM)
                            </Label>
                            <Input
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder={getDefaultPrefix()}
                                className="h-12 rounded-xl font-mono text-lg"
                                maxLength={4}
                            />
                        </div>
                        <div className="w-32">
                            <Label className="text-xs text-primary/60 uppercase tracking-widest mb-2 block">
                                Quantité
                            </Label>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="h-12 rounded-xl"
                                min={1}
                                max={500}
                            />
                        </div>
                        <Button
                            onClick={generateCodes}
                            disabled={isGenerating || !prefix || prefix.length !== 4}
                            className="btn-accent h-12 px-8 rounded-xl"
                        >
                            {isGenerating ? 'Génération...' : 'Générer'}
                        </Button>
                    </div>

                    {prefix.length === 4 && (
                        <p className="text-sm text-primary/40 mt-4">
                            Codes générés : <span className="font-mono">{prefix}-0001</span> → <span className="font-mono">{prefix}-{quantity.toString().padStart(4, '0')}</span>
                        </p>
                    )}
                </div>

                {/* Filtres et recherche */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par code ou email..."
                            className="pl-12 h-12 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'available', 'reserved', 'activated'].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? 'secondary' : 'outline'}
                                onClick={() => setStatusFilter(status)}
                                className="rounded-xl h-12 px-4"
                            >
                                {status === 'all' ? 'Tous' :
                                    status === 'available' ? 'Disponibles' :
                                        status === 'reserved' ? 'Réservés' : 'Activés'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Liste des codes */}
                <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-background/50 text-xs text-primary/60 uppercase tracking-widest font-bold">
                        <div className="col-span-3">Code</div>
                        <div className="col-span-2">Statut</div>
                        <div className="col-span-3">Client</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {filteredCodes.length === 0 ? (
                        <div className="p-12 text-center text-primary/40">
                            <QrCode className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Aucun code trouvé</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-primary/5">
                            {filteredCodes.slice(0, 50).map((qr) => (
                                <motion.div
                                    key={qr.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-background/30 transition-colors"
                                >
                                    <div className="col-span-3">
                                        <span className="font-mono text-primary font-medium">{qr.code}</span>
                                    </div>
                                    <div className="col-span-2">
                                        {getStatusBadge(qr.status)}
                                    </div>
                                    <div className="col-span-3">
                                        <span className="text-sm text-primary/60 truncate block">
                                            {qr.owner_email || '-'}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs text-primary/40">
                                            {qr.created_at ? new Date(qr.created_at).toLocaleDateString('fr-FR') : '-'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-2">
                                        {qr.qr_image_url && (
                                            <a
                                                href={qr.qr_image_url}
                                                download={`QR-${qr.code}.png`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Button variant="ghost" size="icon" className="rounded-lg text-accent hover:text-accent hover:bg-accent/10">
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </a>
                                        )}
                                        {qr.memorial_id && (
                                            <Link to={createPageUrl('ViewMemorial', { id: qr.memorial_id })}>
                                                <Button variant="ghost" size="icon" className="rounded-lg">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        )}
                                        {qr.status === 'available' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => deleteCode(qr)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {filteredCodes.length > 50 && (
                        <div className="p-4 text-center text-sm text-primary/40 bg-background/30">
                            Affichage limité à 50 résultats. Utilisez la recherche pour affiner.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
