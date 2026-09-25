<?php

namespace App\Http\Requests\OfficeSetting;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateOfficeSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'office_name' => ['required', 'string'],
            'office_logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'office_address' => ['required', 'string', 'max:255'],
            'office_email' => ['required', 'email', 'string'],
            'office_phone' => ['required', 'alpha_num', 'integer'],
            'description' => ['nullable', 'string'],

        ];
    }
}
