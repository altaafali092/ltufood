<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FoodCategory\FoodCategroyStoreRequest;
use App\Models\FoodCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FoodCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $foodCategories = FoodCategory::latest()->get();
        return Inertia::render('Admin/FoodCategory/Index',[
            'foodCategories' => $foodCategories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
     return "create";
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FoodCategroyStoreRequest $request)
    {
        FoodCategory::create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created.')]);
           return redirect()->route('admin.food-category.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $foodCategory = FoodCategory::find($id);
        return Inertia::render('Admin/FoodCategory/Show',[
            'foodCategory' => $foodCategory,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $foodCategory = FoodCategory::find($id);
        return Inertia::render('Admin/FoodCategory/Edit',[
            'foodCategory' => $foodCategory,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $foodCategory = FoodCategory::find($id);
        $foodCategory->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);
           return redirect()->route('admin.food-category.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $foodCategory = FoodCategory::find($id);
        $foodCategory->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);
           return redirect()->route('admin.food-category.index');
    }
}
