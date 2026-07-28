<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{

    public function index()
    {
        $users = User::with('roles')->latest()->paginate(7);
        return Inertia::render('Admin/User/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::orderby('name', 'asc')->get();
        return Inertia::render('Admin/User/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $user = User::create(array_merge(
            $request->validated(),
            ['password' => bcrypt($request->password)]
        ));
        $roles = Role::whereIn('id', $request->role)->pluck('name')->toArray();
        $user->syncRoles($roles);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('User Created Successfully.')]);
        return to_route('admin.user.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load('roles');
        return Inertia::render('Admin/User/Show', [
            'user' => $user
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $roles = Role::orderBy('name', 'ASC')->get();
        $hasRoles = $user->roles->pluck('name')->toArray();
        return Inertia::render('Admin/User/Edit', [
            'user' => $user,
            'roles' => $roles,
            'hasRoles' => $hasRoles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (!empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);
        $roles = Role::whereIn('id', $request->role)->pluck('name')->toArray();
        $user->syncRoles($roles);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('User Updated Successfully.')]);
        return to_route('admin.users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        if ($user->id == Auth::user()->id) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('You Cannot Delete Yourself.')]);
            return back();
        }
        if ($user->hasRole('Super Admin')) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('You cannot delete Super Admin.')]);
            return back();
        }

        if ($user->status === 1) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('User deleted Successfully.')]);
            return back();
        }

        $user->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => __('User Deleted Successfully.')]);
        return back();
    }
}
