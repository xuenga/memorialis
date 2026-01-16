import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingCart, Heart, Eye, Euro } from 'lucide-react';

export default function AdminStats() {
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalRevenue: number;
    totalMemorials: number;
    totalVisits: number;
    recentOrders: any[];
  }>({
    totalOrders: 0,
    totalRevenue: 0,
    totalMemorials: 0,
    totalVisits: 0,
    recentOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const [orders, memorials, visits] = await Promise.all([
        api.entities.Order.list(),
        api.entities.Memorial.list(),
        api.entities.MemorialVisit.list()
      ]);

      const totalRevenue = orders
        .filter((o: any) => o.status === 'paid' || o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalMemorials: memorials.length,
        totalVisits: visits.length,
        recentOrders: orders.slice(-5).reverse()
      });
      setIsLoading(false);
    };
    loadStats();
  }, []);

  const statCards = [
    {
      icon: ShoppingCart,
      label: 'Commandes totales',
      value: stats.totalOrders,
      color: 'text-blue-500'
    },
    {
      icon: Euro,
      label: 'Chiffre d\'affaires',
      value: `${stats.totalRevenue.toFixed(2)}€`,
      color: 'text-green-500'
    },
    {
      icon: Heart,
      label: 'Mémoriaux créés',
      value: stats.totalMemorials,
      color: 'text-[#e0bd3e]'
    },
    {
      icon: Eye,
      label: 'Visites totales',
      value: stats.totalVisits,
      color: 'text-purple-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#e0bd3e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl border border-[#2f4858]/10 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-[#e6e6da] flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-[#2f4858]/60 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-[#2f4858]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-[#2f4858]/10 p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#e0bd3e]" />
          <h3 className="font-serif text-xl text-[#2f4858]">Commandes récentes</h3>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="text-center text-[#2f4858]/40 py-8">Aucune commande</p>
        ) : (
          <div className="space-y-3">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#e6e6da]/30 hover:bg-[#e6e6da]/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-[#2f4858]">{order.order_number}</p>
                  <p className="text-sm text-[#2f4858]/60">{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#2f4858]">{order.total?.toFixed(2)}€</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'paid' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
