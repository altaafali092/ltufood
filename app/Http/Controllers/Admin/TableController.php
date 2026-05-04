<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Table\TableUpdateRequest;
use App\Http\Requests\Table\TablStoreRequest;
use App\Models\Table;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $tables = Table::latest()->get();

        return Inertia::render('Admin/Table/Index', [
            'tables' => $tables,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Table/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TablStoreRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $table = Table::create([
            'table_number' => $validated['table_number'],
            'qr_uuid' => Str::uuid(),
            'lat' => $validated['lat'] ?? 28.0500,   // Default Nepalgunj approx
            'lng'=> $validated['lng'] ?? 81.6167,
            'radius_meters' => $validated['radius_meters'] ?? 50,
        ]);

        $qrPath = "qr-codes/{$table->qr_uuid}.svg";
        $writer = new Writer(new ImageRenderer(
            new RendererStyle(400, 2),
            new SvgImageBackEnd
        ));

        Storage::disk('public')->put($qrPath, $writer->writeString($table->qr_url));

        $table->update([
            'qr_code_image' => $qrPath,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Table created.')]);

        return to_route('admin.tables.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Table $table): Response
    {
        return Inertia::render('Admin/Table/Show', [
            'table' => $table->loadCount('orders'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Table $table): Response
    {
        return Inertia::render('Admin/Table/Edit', [
            'table' => $table,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TableUpdateRequest $request, Table $table): RedirectResponse
    {
        $table->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Table updated.')]);

        return to_route('admin.tables.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Table $table): RedirectResponse
    {
        if ($table->qr_code_image) {
            Storage::disk('public')->delete($table->qr_code_image);
        }

        $table->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Table deleted.')]);

        return to_route('admin.tables.index');
    }
}
