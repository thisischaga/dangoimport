import React from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CalendarDays } from 'lucide-react';

function ShopStats({ stats, joinedYear }) {
  const items = [];

  if (typeof stats?.productCount === 'number') {
    items.push({
      key: 'products',
      icon: Package,
      label: 'Produits publiés',
      value: stats.productCount,
    });
  }

  if (typeof stats?.deliveredOrders === 'number' && stats.deliveredOrders > 0) {
    items.push({
      key: 'delivered',
      icon: Truck,
      label: 'Commandes livrées',
      value: stats.deliveredOrders,
    });
  }

  const year = joinedYear || stats?.joinedYear;
  if (year) {
    items.push({
      key: 'year',
      icon: CalendarDays,
      label: "Année d'inscription",
      value: year,
    });
  }

  if (!items.length) return null;

  return (
    <motion.div
      className="shop-stats"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      {items.map(({ key, icon: Icon, label, value }) => (
        <div key={key} className="shop-stats__item">
          <Icon size={18} className="shop-stats__icon" aria-hidden />
          <div>
            <div className="shop-stats__value">{value}</div>
            <div className="shop-stats__label">{label}</div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

export default React.memo(ShopStats);
