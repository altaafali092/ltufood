import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Money } from '@/Utils/Money';
import {
  Utensils,
  Clock,
  CheckCircle2,
  ChefHat,
  AlertCircle,
  ArrowLeft,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEcho } from '@laravel/echo-react';

interface OrderItem {
  id: number;
  quantity: number;
  price_at_time: number;
  total_price: number;
  food_item?: { title: string };
}

interface Order {
  id: number;
  order_number: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
  payment_status: 'paid' | 'unpaid';
  payment_method: string;
  total: number;
  created_at: string;
  table?: { name: string };
  items: OrderItem[];
}

export default function OrderTrack({ order: initialOrder }: { order: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  // Inside OrderTrack component:

  useEcho(`orders.${initialOrder.id}`, '.OrderStatusUpdated', (event: { order: { id: number; status: Order['status'] } }) => {
    if (event?.order?.status) {
      setOrder((prevOrder) => ({
        ...prevOrder,
        status: event.order.status,
      }));
    }
    
  });
  console.log(window.Echo);

  const steps = [
    { key: 'Pending', label: 'Order Received', icon: Clock },
    { key: 'Preparing', label: 'Preparing Food', icon: ChefHat },
    { key: 'Ready', label: 'Ready to Serve', icon: Utensils },
    { key: 'Served', label: 'Served & Completed', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    if (currentStatus === 'Cancelled') return 'cancelled';

    const statusOrder = ['Pending', 'Preparing', 'Ready', 'Served'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 font-sans text-slate-800 dark:text-slate-100">
      <Head title={`Track Order #${order.order_number}`} />

      <div className="max-w-md mx-auto space-y-4">

        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> My Orders
          </Link>
          <Link href={`/receipt/${order.id}`}>
            <Button variant="outline" size="sm" className="text-xs rounded-lg flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> View Receipt
            </Button>
          </Link>
        </div>

        {/* Main Tracking Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">

          {/* Header Status */}
          <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              Live Order Status
            </span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Order #{order.order_number}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          {/* Cancelled State */}
          {order.status === 'Cancelled' ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <p className="font-bold uppercase tracking-wider">Order Cancelled</p>
                <p className="text-[11px] opacity-80">Please contact counter staff for assistance.</p>
              </div>
            </div>
          ) : (
            /* Progress Timeline Tracker */
            <div className="py-2">
              <div className="relative flex justify-between items-center">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />

                {steps.map((step) => {
                  const status = getStepStatus(step.key, order.status);
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : status === 'current'
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60 scale-110'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-2 text-center max-w-[70px] leading-tight ${status === 'current'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : status === 'completed'
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400'
                          }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table & Payment Information */}
          <div className="py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <div>
              <span>Table: </span>
              <strong className="text-slate-800 dark:text-slate-200">{order.table?.name || 'N/A'}</strong>
            </div>
            <div>
              <span>Payment: </span>
              <strong className="text-slate-800 dark:text-slate-200 uppercase">{order.payment_method}</strong>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Items Overview
            </h3>
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.food_item?.title || 'Food Item'}
                    </span>
                    <span className="text-slate-400 ml-2">× {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {Money(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-black">
            <span className="text-slate-600 dark:text-slate-400">Grand Total</span>
            <span className="text-emerald-600 text-base">{Money(order.total)}</span>
          </div>

        </div>
      </div>
    </div>
  );
}