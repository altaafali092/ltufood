<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\XlsxWriter;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;

class SalesReportController extends Controller
{
    private const PERIODS = ['weekly', 'monthly', 'yearly'];

    public function index(Request $request): Response
    {
        $period = $this->period($request);
        $report = $this->buildReport($period);

        $perPage = 10;
        $page = max(1, $request->integer('page', 1));

        $rows = new LengthAwarePaginator(
            array_slice($report['rows'], ($page - 1) * $perPage, $perPage),
            count($report['rows']),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ],
        );

        return Inertia::render('Admin/SalesReport', [
            'period' => $period,
            'report' => [
                'rows' => $rows,
                'total_orders' => $report['total_orders'],
                'total_sales' => $report['total_sales'],
            ],
        ]);
    }

    public function export(Request $request): HttpResponse
    {
        $request->validate([
            'start' => ['nullable', 'date'],
            'end' => ['nullable', 'date'],
        ]);

        $period = $this->period($request);
        $start = $request->filled('start') ? Carbon::parse($request->string('start')->toString()) : null;
        $end = $request->filled('end') ? Carbon::parse($request->string('end')->toString()) : null;

        $rows = $start && $end
            ? [$this->rangeRow($period, $start, $end)]
            : $this->buildReport($period)['rows'];

        $data = collect($rows)->map(fn (array $row): array => [
            $row['label'],
            $row['start_date'],
            $row['end_date'],
            $row['orders'],
            $row['sales'],
        ])->all();

        if (count($data) > 1) {
            $data[] = [
                'Total',
                '',
                '',
                (int) collect($rows)->sum('orders'),
                round((float) collect($rows)->sum('sales'), 2),
            ];
        }

        $contents = (new XlsxWriter(
            headings: ['Period', 'Start Date', 'End Date', 'Orders', 'Sales (NPR)'],
            rows: $data,
            sheetName: ucfirst($period).' Sales',
        ))->build();

        $filename = $start && $end
            ? 'sales-report-'.$period.'-'.$start->toDateString().'-to-'.$end->toDateString().'.xlsx'
            : 'sales-report-'.$period.'-'.now()->format('Y-m-d').'.xlsx';

        return response($contents, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    /**
     * @return array{label: string, start_date: string, end_date: string, orders: int, sales: float}
     */
    private function rangeRow(string $period, Carbon $start, Carbon $end): array
    {
        $orders = Order::query()
            ->where('payment_status', 'paid')
            ->where('status', '!=', 'Cancelled')
            ->whereBetween('created_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->latest()
            ->get(['total']);

        return [
            'label' => match ($period) {
                'weekly' => $start->format('M j').' - '.$end->format('M j, Y'),
                'monthly' => $start->format('F Y'),
                'yearly' => $start->format('Y'),
            },
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'orders' => $orders->count(),
            'sales' => round((float) $orders->sum('total'), 2),
        ];
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
        })->reverse()->values()->all();

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
            'weekly' => 12,
            'monthly' => 12,
            'yearly' => 5,
        };
        $start = match ($period) {
            'weekly' => $now->copy()->startOfWeek()->subWeeks($count - 1),
            'monthly' => $now->copy()->startOfMonth()->subMonths($count - 1),
            'yearly' => $now->copy()->startOfYear()->subYears($count - 1),
        };

        return collect(range(0, $count - 1))->map(function (int $offset) use ($period, $start): array {
            $bucketStart = match ($period) {
                'weekly' => $start->copy()->addWeeks($offset)->startOfWeek(),
                'monthly' => $start->copy()->addMonths($offset)->startOfMonth(),
                'yearly' => $start->copy()->addYears($offset)->startOfYear(),
            };
            $bucketEnd = match ($period) {
                'weekly' => $bucketStart->copy()->endOfWeek(),
                'monthly' => $bucketStart->copy()->endOfMonth(),
                'yearly' => $bucketStart->copy()->endOfYear(),
            };

            return [
                'label' => match ($period) {
                    'weekly' => $bucketStart->format('M j').' - '.$bucketEnd->format('M j, Y'),
                    'monthly' => $bucketStart->format('F Y'),
                    'yearly' => $bucketStart->format('Y'),
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
            : 'weekly';
    }
}
