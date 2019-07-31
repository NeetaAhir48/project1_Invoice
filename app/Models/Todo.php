<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Todo extends Model
{
	use SoftDeletes;

    protected $fillable = ['message'];

    function user(){
    	$this->belongsTo(User::class)
    }
}