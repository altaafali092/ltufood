<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Permission\StorePermissionReques;
use App\Http\Requests\Permission\UpdatPermissionRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permissions = Permission::latest()->get();
        return Inertia::render('Admin/Permission/Index', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Permission/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePermissionReques $request)
    {
        Permission::create($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('permission Created sucessfully.')]);
        return to_route('admin.permission.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Permission $permission)
    {
        return Inertia::render('Admin/Permission/Edit', [
            'permission' => $permission,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatPermissionRequest $request, Permission $permission)
    {
        $permission->update($request->validated());
        Inertia::flash('toast', ['type' => 'success', 'message' => __('permission updated sucessfully.')]);
        return to_route('admin.permission.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission)
    {
        $permission->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('permission deleted sucessfully.')]);
        return back();
    }
}
