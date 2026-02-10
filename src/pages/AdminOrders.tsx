import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Search, Eye, Package, Truck, CheckCircle, Clock, XCircle, ArrowUpDown, ShoppingBag, LogOut, QrCode, Image as ImageIcon, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

interface Personalization {
    deceased_name?: string;
    dates?: string;
    birth_date?: string;
    death_date?: string;
    plaque_photo_url?: string;
    engraving_message?: string;
    configured?: boolean;
}

interface Order {
    id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address?: {
        street?: string;
        city?: string;
        postal_code?: string;
        country?: string;
    };
    created_at: string;
    total: number;
    status: string;
    items?: any[];
    memorial_id?: string;
    memorial?: {
        id: string;
        access_code: string;
        is_activated: boolean;
        name: string;
    };
    personalization?: Personalization;
}

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    useEffect(() => {
        const loadOrders = async () => {
            try {
                // Charger les commandes
                const allOrders = await api.entities.Order.list('-created_at');

                // Charger tous les mémoriaux pour faire la jointure
                const allMemorials = await api.entities.Memorial.list();
                const memorialsMap = new Map(allMemorials.map((m: any) => [m.id, m]));

                // Enrichir les commandes avec les infos des mémoriaux
                const enrichedOrders = allOrders.map((order: any) => ({
                    ...order,
                    memorial: order.memorial_id ? memorialsMap.get(order.memorial_id) : null,
                    personalization: order.items?.[0]?.personalization || null
                }));

                setOrders(enrichedOrders);
                setFilteredOrders(enrichedOrders);
            } catch (e) {
                console.error('Erreur chargement commandes:', e);
                toast.error('Erreur lors du chargement des commandes');
            }
            setIsLoading(false);
        };
        loadOrders();
    }, []);

    useEffect(() => {
        let filtered = [...orders];

        if (searchQuery) {
            filtered = filtered.filter(order =>
                order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.memorial?.access_code?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Tri par date
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        setFilteredOrders(filtered);
    }, [searchQuery, statusFilter, orders, sortOrder]);

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await api.entities.Order.update(orderId, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            toast.success('Statut mis à jour');
        } catch (e) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
        pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
        paid: { label: 'Payé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
        processing: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: Package },
        shipped: { label: 'Expédié', color: 'bg-purple-100 text-purple-700', icon: Truck },
        delivered: { label: 'Livré', color: 'bg-green-100 text-green-700', icon: CheckCircle },
        cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700', icon: XCircle }
    };

    // Statistiques
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length,
        activated: orders.filter(o => o.memorial?.is_activated).length,
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
                    <div className="flex items-start gap-4">
                        <div>
                            <h1 className="font-serif text-4xl lg:text-5xl text-primary mb-2">Commandes</h1>
                            <p className="text-primary/60 text-lg">Gérer les commandes et leurs mémoriaux</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="rounded-full text-primary/60 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Déconnexion
                        </Button>
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
                            Commandes
                        </Button>
                        <Link to={createPageUrl('AdminQRCodes')}>
                            <Button variant="ghost" className="rounded-full px-8 h-12 font-bold text-primary/40 hover:text-primary">
                                QR Codes
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: 'Total', value: stats.total, icon: ShoppingBag, color: 'text-primary' },
                        { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-yellow-600' },
                        { label: 'Payées', value: stats.paid, icon: CheckCircle, color: 'text-green-600' },
                        { label: 'Mémoriaux activés', value: stats.activated, icon: QrCode, color: 'text-blue-600' },
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

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/30" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par n° commande, email, nom ou code mémorial..."
                            className="pl-12 h-12 rounded-xl"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48 h-12 rounded-xl border-primary/20">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="paid">Payé</SelectItem>
                            <SelectItem value="processing">En cours</SelectItem>
                            <SelectItem value="shipped">Expédié</SelectItem>
                            <SelectItem value="delivered">Livré</SelectItem>
                            <SelectItem value="cancelled">Annulé</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                        className="h-12 px-4 rounded-xl"
                    >
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        {sortOrder === 'desc' ? 'Plus récentes' : 'Plus anciennes'}
                    </Button>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl border border-primary/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-background/50">
                                <tr>
                                    <th className="text-left p-4 text-xs font-bold text-primary/60 uppercase tracking-widest">Commande</th>
                                    <th className="text-left p-4 text-xs font-bold text-primary/60 uppercase tracking-widest">Client</th>
                                    <th className="text-left p-4 text-xs font-bold text-primary/60 uppercase tracking-widest">Gravure (Défunt)</th>
                                    <th className="text-left p-4 text-xs font-bold text-primary/60 uppercase tracking-widest">Photo Plaque</th>
                                    <th className="text-left p-4 text-xs font-bold text-primary/60 uppercase tracking-widest">Date Commande</th>
                                    <th className="text-left p-4 text-xs font-bold text-primary/60 uppercase tracking-widest">Montant</th>
                                    <th className="text-left p-4 text-xs font-bold text-primary/60 uppercase tracking-widest">Mémorial</th>
                                    <th className="text-left p-4 text-xs font-bold text-primary/60 uppercase tracking-widest">Statut</th>
                                    <th className="text-left p-4 text-xs font-bold text-primary/60 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center py-12 text-primary/40">
                                            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>Aucune commande trouvée</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order, index) => (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="border-t border-primary/5 hover:bg-background/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <p className="font-mono font-medium text-primary">{order.order_number || '-'}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-primary font-medium">{order.customer_name || '-'}</p>
                                                <p className="text-xs text-primary/50">{order.customer_email}</p>
                                                {order.customer_phone && <p className="text-xs text-primary/50 mt-1">{order.customer_phone}</p>}
                                                {order.shipping_address && (
                                                    <div className="text-xs text-primary/50 mt-1">
                                                        <p>{order.shipping_address.street}</p>
                                                        <p>{order.shipping_address.postal_code} {order.shipping_address.city}</p>
                                                        <p>{order.shipping_address.country}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-primary">{order.personalization?.deceased_name || '-'}</p>
                                                <p className="text-xs text-primary/60">{order.personalization?.dates || '-'}</p>
                                                {order.personalization?.engraving_message && (
                                                    <p className="text-xs text-primary/70 italic mt-1 max-w-[150px]" title={order.personalization.engraving_message}>
                                                        "{order.personalization.engraving_message}"
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {order.personalization?.plaque_photo_url ? (
                                                    <a
                                                        href={order.personalization.plaque_photo_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <img
                                                            src={order.personalization.plaque_photo_url}
                                                            alt="Photo plaque"
                                                            className="w-12 h-12 object-cover rounded-lg border border-primary/10 hover:scale-105 transition-transform cursor-pointer"
                                                        />
                                                    </a>
                                                ) : (
                                                    <span className="text-primary/30 text-sm flex items-center gap-1">
                                                        <ImageIcon className="w-4 h-4" />
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-primary">
                                                    {order.created_at
                                                        ? format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })
                                                        : '-'}
                                                </p>
                                                <p className="text-xs text-primary/40">
                                                    {order.created_at
                                                        ? format(new Date(order.created_at), 'HH:mm', { locale: fr })
                                                        : ''}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-serif text-lg text-accent">{order.total?.toFixed(2)}€</p>
                                            </td>
                                            <td className="p-4">
                                                {order.memorial ? (
                                                    <div className="space-y-1">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-mono font-medium">
                                                            {order.memorial.access_code}
                                                        </span>
                                                        <p className="text-xs text-primary/60 truncate max-w-[100px]">{order.memorial.name}</p>
                                                        <Badge className={order.memorial.is_activated
                                                            ? 'bg-green-100 text-green-700 text-[10px] py-0 h-4'
                                                            : 'bg-gray-100 text-gray-500 text-[10px] py-0 h-4'
                                                        }>
                                                            {order.memorial.is_activated ? 'Activé' : 'Non activé'}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <span className="text-primary/30 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge className={statusConfig[order.status]?.color || 'bg-gray-100 text-gray-700'}>
                                                    {statusConfig[order.status]?.label || order.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    {order.memorial && (
                                                        <Link to={createPageUrl('ViewMemorial', { id: order.memorial.id })}>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-full border-primary/10 text-primary"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    <Link to={`/admin/email-preview/${order.id}`} target="_blank">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-full border-primary/10 text-primary"
                                                            title="Aperçu de l'email"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Select
                                                        value={order.status}
                                                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                                                    >
                                                        <SelectTrigger className="w-32 h-8 text-xs rounded-full border-primary/10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white">
                                                            <SelectItem value="pending">En attente</SelectItem>
                                                            <SelectItem value="paid">Payé</SelectItem>
                                                            <SelectItem value="processing">En cours</SelectItem>
                                                            <SelectItem value="shipped">Expédié</SelectItem>
                                                            <SelectItem value="delivered">Livré</SelectItem>
                                                            <SelectItem value="cancelled">Annulé</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Count */}
                <div className="mt-4 text-center text-sm text-primary/40">
                    {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} affichée{filteredOrders.length > 1 ? 's' : ''}
                </div>
            </div>
        </div>
    );
}
