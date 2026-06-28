<?php

namespace App\Http\Controllers;

use App\Models\FoodItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class FrontController extends Controller
{
    public function index()
    {
        $foodItems = FoodItem::with('subCategory')->latest()->get();
        return Inertia::render('welcome', [
            'foodItems' => $foodItems,
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }

}
