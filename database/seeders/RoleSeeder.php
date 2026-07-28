<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        app()[PermissionRegistrar::class]->forgetCachedPermissions();


        $roles = [
            'Super Admin' => Permission::pluck('name')->toArray(),
        
            'Admin' => [
                'view users',
                'create users',
                'edit users',
                'view staff',
                'create staff',
                'edit staff',
                'view important call',
                'create important call',
                'edit important call',
                'delete important call',
            ],
        
            'Staff' => [
                'view important call',
                'create important call',
            ],
        
            'User' => [],
        ];
        
        foreach ($roles as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($permissions);
        }
    }
    
}