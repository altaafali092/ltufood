import { router } from '@inertiajs/react';
import { Download, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import salesReport from '@/routes/admin/sales-report';

type Period = 'daily' | 'weekly' | 'monthly' | 'quarterly';

interface ReportRow {
    label: string;
    start_date: string;
    end_date: string;
    orders: number;
    sales: number;
}

interface SalesReportProps {
    period: Period;
    report: {
        rows: ReportRow[];
        total_orders: number;
        total_sales: number;
    };
}

const periodLabels: Record<Period, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
};

export default function SalesReport({ period, report }: SalesReportProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>(period);

    const changePeriod = (nextPeriod: Period) => {
        setSelectedPeriod(nextPeriod);
        router.get(salesReport.index({ query: { period: nextPeriod } }).url, {}, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="size-6 text-emerald-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Track paid sales across daily, weekly, monthly, and quarterly periods.</p>
                </div>
                <a
                    href={salesReport.export({ query: { period: selectedPeriod } }).url}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                    <Download className="size-4" />
                    Download Excel sheet
                </a>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total sales</p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-600">NPR {report.total_sales.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Paid orders</p>
                    <p className="mt-1 text-2xl font-extrabold text-gray-900">{report.total_orders.toLocaleString()}</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex flex-wrap gap-2 border-b border-gray-100 p-4">
                    {(Object.keys(periodLabels) as Period[]).map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => changePeriod(option)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                selectedPeriod === option
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {periodLabels[option]}
                        </button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Period</th>
                                <th className="px-6 py-4">Start date</th>
                                <th className="px-6 py-4">End date</th>
                                <th className="px-6 py-4">Orders</th>
                                <th className="px-6 py-4 text-right">Sales</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {report.rows.map((row) => (
                                <tr key={`${row.start_date}-${row.end_date}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{row.label}</td>
                                    <td className="px-6 py-4">{row.start_date}</td>
                                    <td className="px-6 py-4">{row.end_date}</td>
                                    <td className="px-6 py-4">{row.orders}</td>
                                    <td className="px-6 py-4 text-right font-semibold text-gray-900">NPR {Number(row.sales).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

SalesReport.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
