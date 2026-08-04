import React, { useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

interface EsewaParams {
  amount: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string | number;
  product_delivery_charge: string | number;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
  [key: string]: any;
}

interface Props {
  params: EsewaParams;
  // Fallback eSewa URL if not passed inside params
  esewaUrl?: string; 
}

export default function EsewaRedirect({ params, esewaUrl }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  // Default to eSewa v2 test form URL if not specified
  const targetUrl = esewaUrl || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

  useEffect(() => {
    // Automatically submit form to eSewa upon render
    if (formRef.current) {
      formRef.current.submit();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <Head title="Redirecting to eSewa..." />

      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Redirecting to eSewa Payment Portal...
        </h3>
        <p className="text-xs text-slate-500">
          Please do not refresh or close this window.
        </p>

        {/* Hidden HTML Form Auto-Submitting to eSewa */}
        <form ref={formRef} action={targetUrl} method="POST" className="hidden">
          {Object.keys(params).map((key) => (
            <input
              key={key}
              type="hidden"
              name={key}
              value={params[key]}
            />
          ))}
        </form>
      </div>
    </div>
  );
}