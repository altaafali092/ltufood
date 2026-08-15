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
  Receipt,
  Sparkles,
  UtensilsCrossed,
  CreditCard,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEcho } from '@laravel/echo-react';
import { receipt } from '@/routes/orders';

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

  // Real-time WebSocket listener via Reverb
  useEcho(
    `orders.${initialOrder.id}`, 
    '.OrderStatusUpdated', 
    (event: { order: { id: number; status: Order['status'] } }) => {
      if (event?.order?.status) {
        setOrder((prevOrder) => ({
          ...prevOrder,
          status: event.order.status,
        }));
      }
    }
  );

  const steps = [
    { key: 'Pending', label: 'Order Received', icon: Clock, desc: 'Sent to kitchen' },
    { key: 'Preparing', label: 'Preparing', icon: ChefHat, desc: 'Chef is cooking' },
    { key: 'Ready', label: 'Ready', icon: Utensils, desc: 'Hot & ready' },
    { key: 'Served', label: 'Completed', icon: CheckCircle2, desc: 'Served at table' },
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

  const currentStepIndex = ['Pending', 'Preparing', 'Ready', 'Served'].indexOf(order.status);
  const progressPercent = currentStepIndex >= 0 ? (currentStepIndex / 3) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 py-8 px-4 font-sans text-slate-800 dark:text-slate-100 flex items-center justify-center">
      <Head title={`Track Order #${order.order_number}`} />

      <div className="w-full max-w-lg mx-auto space-y-4">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-1">
          <Link
            href="/orders"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Orders
          </Link>
          <Link href={receipt(order.order_number)}>
            <Button variant="outline" size="sm" className="text-xs rounded-xl shadow-xs hover:bg-white dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-500" /> Receipt
            </Button>
          </Link>
        </div>

        {/* Primary Order Card */}
        <div className="bg-white dark:bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-7 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-7">
          
          {/* Header & Status Indicator */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Order Tracker
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                Order #{order.order_number}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Placed on {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <UtensilsCrossed className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Cancelled Alert Banner */}
          {order.status === 'Cancelled' ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50 flex items-center gap-3.5 text-rose-800 dark:text-rose-300">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="text-xs">
                <p className="font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">Order Cancelled</p>
                <p className="text-[11px] opacity-80 mt-0.5">This order has been cancelled. Please reach out to staff for further assistance.</p>
              </div>
            </div>
          ) : (
            /* Enhanced Timeline Step Tracker */
            <div className="space-y-6">
              <div className="relative">
                {/* Background Connecting Line */}
                <div className="absolute top-4.5 left-5 right-5 h-1 bg-slate-100 dark:bg-slate-800 z-0 rounded-full" />
                
                {/* Animated Dynamic Progress Line */}
                <div 
                  className="absolute top-4.5 left-5 h-1 bg-emerald-500 z-0 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `calc(${progressPercent}% - 40px * (${progressPercent / 100}))` }}
                />

                {/* Steps Grid */}
                <div className="relative z-10 flex justify-between items-start">
                  {steps.map((step) => {
                    const status = getStepStatus(step.key, order.status);
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center group">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            status === 'completed'
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                              : status === 'current'
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/70 scale-110 shadow-lg shadow-emerald-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200/60 dark:border-slate-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-xs font-bold mt-3 text-center transition-colors ${
                            status === 'current'
                              ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                              : status === 'completed'
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block mt-0.5 font-medium">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Details Metadata Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700 text-slate-500">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Table Location</span>
                <strong className="text-xs text-slate-800 dark:text-slate-200 font-bold">{order.table?.name || 'Takeaway'}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700 text-slate-500">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Payment Method</span>
                <strong className="text-xs text-slate-800 dark:text-slate-200 font-bold uppercase">{order.payment_method} ({order.payment_status})</strong>
              </div>
            </div>
          </div>

          {/* Ordered Items Breakdown */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Order Summary
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {order.items.reduce((acc, item) => acc + item.quantity, 0)} Items
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 border-t border-slate-100 dark:border-slate-800">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                      {item.quantity}×
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.food_item?.title || 'Menu Item'}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {Money(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount Summary */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Total Amount</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Taxes & fees included</span>
            </div>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {Money(order.total)}
            </span>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600">
          Status updates in real time. Need help? Show your order number to staff.
        </p>

      </div>
    </div>
  );
}