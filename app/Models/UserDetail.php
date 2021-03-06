<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDetail extends Model
{
    protected $fillable = [
    	'user_id','business_name','business_address_id','business_phone','business_tax_number'
    ];

    function address(){
    	return $this->belongsTo(Address::class,'business_address_id');
    }
}
