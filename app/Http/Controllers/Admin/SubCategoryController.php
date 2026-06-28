<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubCategory\StoreSubCategoryRequest;
use App\Http\Requests\SubCategory\UpdateSubCategoryRequest;
use App\Models\FoodCategory;
use App\Models\SubCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubCategoryController extends Controller
{
    public function index()
    {
        $subCategories = SubCategory::with(['foodCategory'])->latest()->get();
        return Inertia::render('Admin/SubCategory/Index', [
            'subCategories' => $subCategories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = FoodCategory::where('status', 1)->get();
        return Inertia::render('Admin/SubCategory/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubCategoryRequest $request)
    {
        SubCategory::create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Sub category created.')]);
        return to_route('admin.sub-categories.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(SubCategory $subCategory)
    {
        $subCategory->load(['foodCategory']);
        return Inertia::render('Admin/SubCategory/Show', [
            'subCategory' => $subCategory,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SubCategory $subCategory)
    {
        $categories = FoodCategory::where('status', 1)->get();
        return Inertia::render('Admin/SubCategory/Edit', [
            'subCategory' => $subCategory,
            'categories' => $categories,   
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubCategoryRequest $request, SubCategory $subCategory)
    {
        $subCategory->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Sub category updated.')]);
        return to_route('admin.sub-categories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SubCategory $subCategory)
    {
        deleteFiles($subCategory->image);
        $subCategory->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Sub category deleted.')]);
        return to_route('admin.sub-categories.index');
    }

    public function status(SubCategory $subCategory)
    {
        $subCategory->update([
            'status' => ! $subCategory->status,
        ]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Sub category status updated.')]);
        return back();
    }
}
