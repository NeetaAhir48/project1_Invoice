@extends('layouts.app')

@push('page-vendor-js')
	<script src="/js/components/validation/validation.min.js" type="text/javascript"></script>
@endpush

@push('snippets')

    <script src="/js/pages/recipients-edit.js"></script>
@endpush


@section('content')
<div class="widget has-shadow">
    <div class="widget-header bordered no-actions d-flex align-items-center">
        <h2>Edit Recipient</h2>
        <div class="widget-options">
            <div class="btn-group" role="group">
                <a href="{{route('recipients')}}" class="btn btn-primary ripple">Back to Recipients</a>
            </div>
        </div>
    </div>
    <div class="widget-body">
        <form id="edit_recipient" action="{{route('recipient.update',['recipient'=>$recipient])}}" role="form" method="post" data-toggle="validator">
            @csrf
        	<div class="row">
        		<div class="col-sm-12">
        			<div class="form-group">
	            		<label>Company Name / Contact Name</label>
	            		<input type="text" class="form-control" name="company_name" placeholder="Company Name / Contact Name" value="{{$recipient->company_name}}">
	            		<div class="help-block with-errors"></div>
	            	</div>
	            </div>
	        </div>
	        <div class="row">
	        	<div class="col-sm-6">
	        		<div class="form-group">
	            		<label>Email</label>
	            		<input type="email" class="form-control" name="email" placeholder="Email" value="{{$recipient->email}}">
	            		<div class="help-block with-errors"></div>
	            	</div>
	        	</div>
	        	<div class="col-sm-6">
	        		<div class="form-group">
	            		<label>Phone Number<span class="text-secondary">(numbers only, min 10-15 digits)</span></label>
	            		<input type="tel" data-minlength="10" data-maxlength="15" pattern="[0-9]{10,15}" class="form-control" name="phone" placeholder="Phone Number" value="{{$recipient->phone}}" data-validation="number">
	            		<div class="help-block with-errors"></div>
	            	</div>
	        	</div>
        	</div>
        	<div class="row">
	        	<div class="col-sm-6">
	            	<div class="form-group">
	            		<label>Street Address</label>
	            		<input type="text" class="form-control" name="address_2" placeholder="Street Address" value="@if(!empty($recipient->address)) {{$recipient->address->address_2}} @endif">
	            		<div class="help-block with-errors"></div>
	            	</div>
	            </div>
	        	<div class="col-sm-6">
	            	<div class="form-group">
	            		<label>Apartments / Suite / Unit</label>
	            		<input type="text" class="form-control" name="address_1" placeholder="Apartments / Suite / Unit" value="@if(!empty($recipient->address)) {{$recipient->address->address_1}} @endif">
	            		<div class="help-block with-errors"></div>
	            	</div>
	            </div>
	        </div>
	        <div class="row">
	        	<div class="col-sm-6">
	            	<div class="form-group">
	            		<label>City</label>
	            		<input type="text" class="form-control" name="city" placeholder="City" value="@if(!empty($recipient->address)){{$recipient->address->city}} @endif">
	            		<div class="help-block with-errors"></div>
	            	</div>
            	</div>
	        	<div class="col-sm-6">
	            	<div class="form-group">
	            		<label>State</label>
	            		<input type="text" class="form-control" name="state" placeholder="State" value="@if(!empty($recipient->address)){{$recipient->address->state}} @endif">
	            		<div class="help-block with-errors"></div>
	            	</div>
            	</div>
        	</div>
        	<div class="row">
	        	<div class="col-sm-6">
	            	<div class="form-group">
	            		<label>Country</label>
	            		<input type="text" class="form-control" name="country" placeholder="Country" value="@if(!empty($recipient->address)){{$recipient->address->country}} @endif"> 
	            		<div class="help-block with-errors"></div>
	            	</div>
            	</div>
            	<div class="col-sm-6">
	            	<div class="form-group">
	            		<label>Postal / Zip Code <span class="text-secondary">(numbers only, 6 digits)</span></label>
	            		<input type="text" class="form-control"  name="postal_code" data-minlength="6" data-maxlength="6" pattern="[0-9]{6}" placeholder="Postal / Zip Code" value="@if(!empty($recipient->address)){{$recipient->address->postal_code}} @endif">
	            		<div class="help-block with-errors"></div>
	            	</div>
	            </div>
	        </div>
        	<div class="row">
	        	<div class="col-sm-12">
	            	<div class="form-group">
	            		<label>Message</label>
	            		<textarea class="form-control" name="message" placeholder="Message">{{$recipient->message}}</textarea>
	            		<div class="help-block with-errors"></div>
	            	</div>
        		</div>
        	</div>
        	<div class="row">
        		<div class="col-lg-12 text-right">
	        		<a href="{{url()->previous()}}" class="btn btn-shadow" data-dismiss="modal">cancel</a>
	            	<button  class="btn btn-primary">Save</button>
            	</div>	
        	</div>
        	
        </form>
    </div>
    
</div>


@stop