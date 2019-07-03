<?php

namespace App\DataTables;

use App\Models\User;
use Yajra\DataTables\Services\DataTable;

class UserDataTable extends DataTable
{
    /**
     * Build DataTable class.
     *
     * @param mixed $query Results from query() method.
     * @return \Yajra\DataTables\DataTableAbstract
     */
    public function dataTable($query)
    {
        return datatables($query)
             ->addColumn('phone',function($query){
                if(isset($query->details)){
                 return $query->details->phone;
                }
                return '-';
             })->addColumn('company',function($query){
                if(isset($query->details)){
                 return $query->details->business_name;
                }
                return '-';
             });
    }

    /**
     * Get query source of dataTable.
     *
     * @param \App\User $model
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function query(User $model)
    {
        return $model->newQuery()->select('*')->role('Admin')->with('details');
    }
}