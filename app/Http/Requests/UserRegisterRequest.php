<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserRegisterRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone'    => ['required', 'string', 'regex:/^(98|97|96)\d{8}$/'],
            'password' => ['required', Password::min(5)->letters()],
        ];
    }
    public function messages(): array
    {
        return [
            'phone.regex' => 'Please enter a valid 10-digit Nepali mobile number (e.g., 98XXXXXXXX).',
        ];
    }
}
