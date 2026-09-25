<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\OfficeSetting\UpdateOfficeSettingRequest;
use App\Models\OfficeSetting;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class OfficeSettingController extends Controller
{
    public function index()
    {
        $officeSetting = OfficeSetting::first();
        if (! $officeSetting) {
            $officeSetting = new OfficeSetting([
                'id' => 0,
                'office_name' => '',
                'office_address' => '',
                'office_logo' => '',
                'office_email',
                'office_phone',
                'description',

            ]);
        }

        return Inertia::render('Admin/OfficeSetting/Index', [
            'officeSetting' => $officeSetting,
        ]);
    }

    public function store(UpdateOfficeSettingRequest $request)
    {

        $officeSetting = OfficeSetting::first();

        if ($officeSetting) {
            $officeSetting->update($request->validated());
        } else {

            OfficeSetting::create($request->validated());
        }
        Cache::forget('office_setting');
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Office Settings created successfully')]);

        return back();
    }
}
