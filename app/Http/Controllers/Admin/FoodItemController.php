<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FoodItem\FoodItemStoreRequest;
use App\Http\Requests\FoodItem\FoodItemUpdateRequest;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use Inertia\Inertia;

class FoodItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $foodItems = FoodItem::with(['foodCategory'])->get();
        return Inertia::render('Admin/FoodItem/Index', [
            'foodItems' => $foodItems,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $foodCategories = FoodCategory::where('status', 1)->get();
        return Inertia::render('Admin/FoodItem/Create', [
            'foodCategories' => $foodCategories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FoodItemStoreRequest $request)
    {
        FoodItem::create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Food item created.')]);

        return to_route('admin.food-items.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(FoodItem $foodItem)
    {
        return Inertia::render('Admin/FoodItem/Show', [
            'foodItem' => $foodItem,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FoodItem $foodItem)
    {
        $foodCategories = FoodCategory::where('status', 1)->get();

        return Inertia::render('Admin/FoodItem/Edit', [
            'foodItem' => $foodItem,
            'foodCategories' => $foodCategories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(FoodItemUpdateRequest $request, FoodItem $foodItem)
    {
        $foodItem->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Food item updated.')]);
        return to_route('admin.food-items.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FoodItem $foodItem)
    {
        deleteFiles($foodItem->images);
        $foodItem->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Food item deleted.')]);
        return back();
    }

    public function status(FoodItem $foodItem)
    {
        $foodItem->update([
            'status' => ! $foodItem->status,
        ]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Food item status updated.')]);

        return back();
    }
}
