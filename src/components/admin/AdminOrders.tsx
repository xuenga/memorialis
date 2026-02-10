import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Package, Truck, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
  total: number;
  status: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      const allOrders = await api.entities.Order.list('-created_at');
      setOrders(allOrders);
      setFilteredOrders(allOrders);
      setIsLoading(false);
    };
    loadOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await api.entities.Order.update(orderId, { status: newStatus });
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success('Statut mis à jour');
  };

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Package },
    paid: { label: 'Payé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    processing: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: Package },
    shipped: { label: 'Expédié', color: 'bg-purple-100 text-purple-700', icon: Truck },
    delivered: { label: 'Livré', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700', icon: Package }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#e0bd3e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2f4858]/40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une commande..."
            className="pl-10 border-[#2f4858]/20"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 border-[#2f4858]/20">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="paid">Payé</SelectItem>
            <SelectItem value="processing">En cours</SelectItem>
            <SelectItem value="shipped">Expédié</SelectItem>
            <SelectItem value="delivered">Livré</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#2f4858]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#e6e6da]/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Commande</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Client</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Date</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Montant</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Statut</th>
                <th className="text-left p-4 text-sm font-medium text-[#2f4858]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#2f4858]/40">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-[#2f4858]/5 hover:bg-[#e6e6da]/20 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-medium text-[#2f4858]">{order.order_number}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-[#2f4858]">{order.customer_name}</p>
                      <p className="text-xs text-[#2f4858]/50">{order.customer_email}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-[#2f4858]">
                        {format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-[#2f4858]">{order.total?.toFixed(2)}€</p>
                    </td>
                    <td className="p-4">
                      <Badge className={statusConfig[order.status]?.color || 'bg-gray-100 text-gray-700'}>
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-full border-[#2f4858]/10 text-[#2f4858]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
