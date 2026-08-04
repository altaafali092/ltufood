import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Money } from '@/Utils/Money';
import { Banknote, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Order {
  id: number;
  order_number: string;
  total: number;
  table?: { name: string };
}

export default function PaymentOptions({ order }: { order: Order }) {
  // Use Inertia's data & setData directly so form payload stays strictly in sync
  const { data, setData, post, processing } = useForm({
    payment_method: 'cash' as 'cash' | 'esewa',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/orders/${order.id}/payment`);
  };

  const handleBack = () => window.history.back();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 font-sans">
      <Head title={`Payment for #${order.order_number}`} />

      <div className="max-w-md mx-auto space-y-6">
        <Button
          type="button"
          onClick={handleBack}
          variant="ghost"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Orders
        </Button>

        {/* Header Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Amount Due
          </p>
          <h2 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {Money(order.total)}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Order #{order.order_number} {order.table ? `• Table: ${order.table.name}` : ''}
          </p>
        </div>

        {/* Payment Methods Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 px-1">
            Select Payment Method
          </h3>

          <div className="space-y-3">
            {/* Option 1: Cash at Reception */}
            <div
              onClick={() => setData('payment_method', 'cash')}
              className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all bg-white dark:bg-slate-900 ${
                data.payment_method === 'cash'
                  ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Pay Cash at Reception
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Get digital bill receipt and pay directly at counter
                  </p>
                </div>
              </div>
              {data.payment_method === 'cash' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
            </div>

            {/* Option 2: eSewa */}
            <div
              onClick={() => setData('payment_method', 'esewa')}
              className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all bg-white dark:bg-slate-900 ${
                data.payment_method === 'esewa'
                  ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg text-white font-black text-xs px-2 py-2">
                  eSewa
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    eSewa Mobile Wallet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pay online directly using your eSewa app
                  </p>
                </div>
              </div>
              {data.payment_method === 'esewa' && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={processing}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-bold rounded-xl text-sm transition-all"
          >
            {data.payment_method === 'cash' ? 'Get Bill for Reception' : 'Proceed to eSewa'}
          </Button>
        </form>
      </div>
    </div>
  );
}