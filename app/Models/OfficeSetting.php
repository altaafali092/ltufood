<?php

namespace App\Models;

use App\Concerns\FileTrait;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'office_name',
    'office_address',
    'office_logo',
    'office_email',
    'office_phone',
    'description',
])]

class OfficeSetting extends Model
{
    use FileTrait, HasFactory;

    public function officeLogo(): Attribute
    {
        return $this->castingFile(defaultPath: 'FoodItems');
    }
}
