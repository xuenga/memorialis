import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: string;
}

export default function StatsCard({ icon: Icon, label, value, color = "text-accent" }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-background rounded-[2rem] p-8 border border-primary/5 shadow-sm"
    >
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-inner">
          <Icon className={`w-7 h-7 ${color}`} />
        </div>
        <div>
          <p className="text-3xl font-serif text-primary font-bold">{value}</p>
          <p className="text-sm text-primary/40 uppercase tracking-widest font-bold">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
