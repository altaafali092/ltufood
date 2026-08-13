<?php

namespace App\Http\Controllers;

use App\Models\FoodItem;
use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class FrontController extends Controller
{
    public function scanTable(string $qr_uuid)
    {
        $table = Table::where('qr_uuid', $qr_uuid)->firstOrFail();

        session([
            'table_id' => $table->id,
            'table_number' => $table->table_number,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Welcome to Table :number! Menu loaded.', ['number' => $table->table_number]),
        ]);

        return to_route('home');
    }

    public function index()
    {
        $foodItems = FoodItem::with('subCategory')->latest()->get();

        return Inertia::render('welcome', [
            'foodItems' => $foodItems,
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }

    public function foodItemDetail(FoodItem $foodItem)
    {
        $foodItem->load('subCategory');

        return Inertia::render('Frontend/FoodItemDetail', [
            'fooditem' => $foodItem,
        ]);
    }

    public function RegisterPage()
    {
        return Inertia::render('Frontend/UserAuth/UserRegister');
    }

    public function Register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
        ]);
    }
}
