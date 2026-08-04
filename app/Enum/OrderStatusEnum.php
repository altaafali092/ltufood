<?php

namespace App\Enum;

enum OrderStatusEnum: string
{
    case Pending = 'Pending';
    case Preparing = 'Preparing';
    case Ready = 'Ready';
    case Served = 'Served';
    case Cancelled = 'Cancelled';

    public static function labels()
    {
        return [

            self::Pending->value => __('Pending'),
            self::Preparing->value => __('Preparing'),
            self::Ready->value => __('Ready'),
            self::Served->value => __('Served'),
            self::Cancelled->value => __('Cancelled'),

        ];
    }
}
