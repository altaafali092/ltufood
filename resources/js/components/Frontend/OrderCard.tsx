import React, { useState } from 'react';

// ==========================================
// Types & Interfaces
// ==========================================

export interface FoodItem {
  id: number;
  title: string;
  image_path?: string;
}

export interface OrderItem {
  id: number;
  food_item_id: number;
  quantity: number;
  price_at_time: number;
  total_price: number;
  food_item?: FoodItem;
}

export interface Table {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  payment_status: 'paid' | 'unpaid';
  payment_method: string;
  order_type: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  created_at: string;
  table?: Table;
  items: OrderItem[];
}

export interface OrderCardProps {
  order: Order;
  currencySymbol?: string;
  onTrackClick?: (orderId: number) => void;
  defaultExpanded?: boolean;
}

// ==========================================
// Helpers
// ==========================================

const formatCurrency = (amount: number, symbol = 'NPR', digits = 2) =>
  `${symbol} ${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Status Badge Helper Sub-component
const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
  const styles: Record<Order['status'], string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    preparing: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    ready: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    served: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    paid: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize ${
        styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      }`}
    >
      {status}
    </span>
  );
};

// ==========================================
// OrderCard Component
// ==========================================

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  currencySymbol = 'NPR',
  onTrackClick,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const isTrackable = ['pending', 'preparing', 'ready'].includes(order.status);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Header Info */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-bold text-gray-900 dark:text-slate-100 text-base">
              {order.order_number}
            </span>
            <StatusBadge status={order.status} />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-slate-400">
            <span>{formatDate(order.created_at)}</span>
            <span>•</span>
            <span className="capitalize">{order.order_type.replace('_', ' ')}</span>
            {order.table && (
              <>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Table: {order.table.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Pricing Summary & Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-slate-800">
          <div className="text-right sm:mr-2">
            <span className="block text-xs text-gray-400 dark:text-slate-500 uppercase font-semibold">
              Total
            </span>
            <span className="text-lg font-extrabold text-gray-900 dark:text-slate-100">
              {formatCurrency(order.total, currencySymbol, 0)}
            </span>
          </div>

          <div className="flex gap-2">
            {isTrackable && (
              <button
                type="button"
                onClick={() => onTrackClick?.(order.id)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 dark:text-emerald-300 text-emerald-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Track Live
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
            >
              {isExpanded ? 'Hide Details' : 'View Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Order Details */}
      {isExpanded && (
        <div className="bg-gray-50/70 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 p-5 space-y-4">
          <h4 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            Order Items ({order.items.length})
          </h4>

          {/* Itemized List */}
          <div className="divide-y divide-gray-200/60 dark:divide-slate-700/60">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-slate-200">
                    {item.food_item?.title || `Item #${item.food_item_id}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {formatCurrency(item.price_at_time, currencySymbol)} × {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-gray-900 dark:text-slate-100">
                  {formatCurrency(item.total_price, currencySymbol)}
                </span>
              </div>
            ))}
          </div>

          {/* Subtotal & Totals Summary */}
          <div className="pt-3 border-t border-gray-200 dark:border-slate-700 text-xs space-y-1.5 max-w-xs ml-auto">
            <div className="flex justify-between text-gray-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal, currencySymbol)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Discount</span>
                <span>- {formatCurrency(order.discount_amount, currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-900 dark:text-slate-100 font-bold text-sm pt-2 border-t border-gray-200 dark:border-slate-700">
              <span>Grand Total</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(order.total, currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;