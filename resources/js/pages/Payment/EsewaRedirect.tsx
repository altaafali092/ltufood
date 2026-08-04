import React, { useEffect, useRef } from 'react';

export default function EsewaRedirect({ params }) {
    const formRef = useRef(null);

    useEffect(() => {
        if (formRef.current) {
            formRef.current.submit();
        }
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Redirecting to eSewa... Please wait.</h2>
            <form ref={formRef} action={params.esewa_url} method="POST">
                <input type="hidden" name="amount" value={params.amount} />
                <input type="hidden" name="tax_amount" value={params.tax_amount} />
                <input type="hidden" name="total_amount" value={params.total_amount} />
                <input type="hidden" name="transaction_uuid" value={params.transaction_uuid} />
                <input type="hidden" name="product_code" value={params.product_code} />
                <input type="hidden" name="product_service_charge" value={params.product_service_charge} />
                <input type="hidden" name="product_delivery_charge" value={params.product_delivery_charge} />
                <input type="hidden" name="success_url" value={params.success_url} />
                <input type="hidden" name="failure_url" value={params.failure_url} />
                <input type="hidden" name="signed_field_names" value={params.signed_field_names} />
                <input type="hidden" name="signature" value={params.signature} />
            </form>
        </div>
    );
}