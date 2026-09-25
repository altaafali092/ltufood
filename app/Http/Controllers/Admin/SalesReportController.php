<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesReportController extends Controller
{
    private const PERIODS = ['daily', 'weekly', 'monthly', 'quarterly'];

    public function index(Request $request): Response
    {
        $period = $this->period($request);
        $report = $this->buildReport($period);

        return Inertia::render('Admin/SalesReport', [
            'period' => $period,
            'report' => $report,
        ]);
    }

    public function export(Request $request)
    {
        $period = $this->period($request);
        $report = $this->buildReport($period);
        $filename = 'sales-report-'.$period.'-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($report): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['Sales Report']);
            fputcsv($handle, ['Period', 'Start Date', 'End Date', 'Orders', 'Sales (NPR)']);

            foreach ($report['rows'] as $row) {
                fputcsv($handle, [
                    $row['label'],
                    $row['start_date'],
                    $row['end_date'],
                    $row['orders'],
                    $row['sales'],
                ]);
            }

            fputcsv($handle, []);
            fputcsv($handle, ['Total', '', '', $report['total_orders'], $report['total_sales']]);
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array{period: string, rows: array<int, array<string, mixed>>, total_orders: int, total_sales: float}
     */
    private function buildReport(string $period): array
    {
        $buckets = $this->buckets($period);
        $orders = Order::query()
            ->where('payment_status', 'paid')
            ->where('status', '!=', 'Cancelled')
            ->whereBetween('created_at', [
                $buckets[0]['start']->copy()->startOfDay(),
                end($buckets)['end']->copy()->endOfDay(),
            ])
            ->get(['created_at', 'total']);

        $rows = collect($buckets)->map(function (array $bucket) use ($orders): array {
            $bucketOrders = $orders->filter(function (Order $order) use ($bucket): bool {
                $createdAt = Carbon::parse($order->created_at);

                return $createdAt->betweenIncluded($bucket['start'], $bucket['end']->copy()->endOfDay());
            });

            return [
                'label' => $bucket['label'],
                'start_date' => $bucket['start']->toDateString(),
                'end_date' => $bucket['end']->toDateString(),
                'orders' => $bucketOrders->count(),
                'sales' => round((float) $bucketOrders->sum('total'), 2),
            ];
        })->values()->all();

        return [
            'period' => $period,
            'rows' => $rows,
            'total_orders' => (int) collect($rows)->sum('orders'),
            'total_sales' => round((float) collect($rows)->sum('sales'), 2),
        ];
    }

    /**
     * @return array<int, array{label: string, start: Carbon, end: Carbon}>
     */
    private function buckets(string $period): array
    {
        $now = now();
        $count = match ($period) {
            'daily' => 30,
            'weekly' => 12,
            'monthly' => 12,
            'quarterly' => 8,
        };
        $start = match ($period) {
            'daily' => $now->copy()->startOfDay()->subDays($count - 1),
            'weekly' => $now->copy()->startOfWeek()->subWeeks($count - 1),
            'monthly' => $now->copy()->startOfMonth()->subMonths($count - 1),
            'quarterly' => $now->copy()->startOfQuarter()->subQuarters($count - 1),
        };

        return collect(range(0, $count - 1))->map(function (int $offset) use ($period, $start): array {
            $bucketStart = match ($period) {
                'daily' => $start->copy()->addDays($offset)->startOfDay(),
                'weekly' => $start->copy()->addWeeks($offset)->startOfWeek(),
                'monthly' => $start->copy()->addMonths($offset)->startOfMonth(),
                'quarterly' => $start->copy()->addQuarters($offset)->startOfQuarter(),
            };
            $bucketEnd = match ($period) {
                'daily' => $bucketStart->copy()->endOfDay(),
                'weekly' => $bucketStart->copy()->endOfWeek(),
                'monthly' => $bucketStart->copy()->endOfMonth(),
                'quarterly' => $bucketStart->copy()->endOfQuarter(),
            };

            return [
                'label' => match ($period) {
                    'daily' => $bucketStart->format('M j, Y'),
                    'weekly' => $bucketStart->format('M j').' - '.$bucketEnd->format('M j, Y'),
                    'monthly' => $bucketStart->format('F Y'),
                    'quarterly' => 'Q'.$bucketStart->quarter.' '.$bucketStart->year,
                },
                'start' => $bucketStart,
                'end' => $bucketEnd,
            ];
        })->all();
    }

    private function period(Request $request): string
    {
        return in_array($request->string('period')->toString(), self::PERIODS, true)
            ? $request->string('period')->toString()
            : 'daily';
    }
}
