<?php

namespace App\Http\Requests\FoodItem;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FoodItemUpdateRequest extends FormRequest
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
            'food_category_id' => ['required', 'integer', 'exists:food_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'alpha_dash',
                Rule::unique('food_items', 'slug')
                    ->ignore($this->route('food_item')->id)
                    ->withoutTrashed(),
            ],
            'description' => ['nullable', 'string', 'max:65535'],
            'price' => ['required', 'integer', 'min:0'],
            'images' => ['nullable', 'array'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['nullable', 'string', 'max:255'],
            'popularity_score' => ['nullable', 'integer'],
        ];
    }
}
