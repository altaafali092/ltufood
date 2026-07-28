<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions
        $permissions = [
            'view users',
            'edit users',
            'delete users',
            'create users',

            'view role',
            'edit role',
            'delete role',
            'create role',

            'view permission',
            'edit permission',
            'delete permission',
            'create permission',


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

        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
