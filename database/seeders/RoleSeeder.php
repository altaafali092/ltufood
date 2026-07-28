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

                'view food category',
                'edit food category',
                'delete food category',
                'create food category',

                'view food sub category',
                'edit food sub category',
                'delete food sub category',
                'create food sub category',

                'view food item',
                'edit food item',
                'delete food item',
                'create food item',

                'view table',
                'edit table',
                'delete table',
                'create table',
            ],

            'Staff' => [
                'view table',
                'edit table',
               
                'create table',
            ],

            'User' => [],
        ];

        foreach ($roles as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($permissions);
        }
    }
}
