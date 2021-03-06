import sendInvoice from './send';

$(function () {
		let invoiceNew = new addInvoice(invoice_id);
		invoiceNew.fetchRecipientList();
		$('#add-recipient-modal').on('shown.bs.modal',function(){
			$('#add_recipient').submit(function(e){
				e.preventDefault();
				invoiceNew.saveRecipientDetails();
			});	
		})
		$('#add-recipient-modal').on('hidden.bs.modal',function(){
			$('#add_recipient')[0].reset();
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		});
		$('#add_product').submit(function(e){
			e.preventDefault();
			invoiceNew.saveProductDetails();
		});	
		$('#add-product-modal').on('hidden.bs.modal',function(){
			$('#add_product')[0].reset();
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		});
		$('input[name="company_name"] , input[name="gst_number"]').on('keyup',function(e){
			if(e.keyCode == 13){
				invoiceNew.fetchRecipientList();
			}
		});
		$('input[name="item_name[]"]').on('keyup',function(e){
			if(e.keyCode != 13){
				invoiceNew.resetProductHidden(false);
			}
		});
		$('#createItem').on('submit',function(e){
			e.preventDefault();
			invoiceNew.createItem($(this).serializeArray());
			$('#no-item').addClass('d-none');
			$(this)[0].reset();
		});
		$('#createTax').on('submit',function(e){
			e.preventDefault();
			invoiceNew.createTax($(this).serializeArray());
			$(this)[0].reset();
		});

		$('#rootwizard .finish').click(function() {
			invoiceNew.saveInvoice();
		});

		$('#due_date').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
  			invoiceNew.enableCustomDate($(this).selectpicker('val'));
		});
		$('#save_send').on('click',function(){
			invoiceNew.saveInvoice(true);
		})

		$(document).on('click','.remove_item',function(){
			invoiceNew.removeItem($(this).data('id'),'line');
		}).on('click','.remove_tax',function(){
			invoiceNew.removeItem($(this).data('id'),'tax');
		})


		
});


class addInvoice{

	constructor(id){
		this.SendInvoice =  new sendInvoice();
		var self = this;
		this.wizard = $('#rootwizard').bootstrapWizard({
			onInit:function(tab,navigation,index){
				var $total = navigation.find('li').length;	
				var width = ((100/$total))+'%';
				navigation.find('li').each(function(){
					$(this).css({'width':width});
				})
			},
			onTabShow: function (tab, navigation, index) {
				var $total = navigation.find('li').length;
				var $current = index + 1;
				var $percent = ($current / $total) * 100;
				$('#rootwizard .progressbar').css({
					width: $percent + '%'
				});
			},
			onTabClick(tab,navigation,index){
				return false;
			},
			onNext(tab,navigation,index){
				if(index == 1){
					return self.step1();
				}
				else if(index == 2){
					return self.step2();
				}
				else if(index == 3){
					return self.step3();
				}
			}
		});	
		this.invoice = new Invoice(id);
		this.itemCount = 0;
		this.taxCount = 0;
		this.selectedItem = {};
		this.initDatePicker();
	}

	initDatePicker(){
		$('#invoice_date').daterangepicker({
			singleDatePicker: true,
			minDate: moment(),
			locale: {
			      format: 'DD-MM-YYYY'
			}
		});
	}

	step1(){
		var validate = true;
		if($('input[name="recipient_id"]:checked').val() == undefined)
			validate = false;
		if(!validate){
			let notifyOfRecipient = new Noty({
				type: 'error',
				layout: 'topRight',
				text: 'Select atleast one recipient',
				progressBar: true,
				timeout: 2500,
				animation: {
					open: 'animated bounceInRight', // Animate.css class names
					close: 'animated bounceOutRight' // Animate.css class names
				}
			}).show();
			return false;
		}
		this.initProductSearch();
		this.setTotal();
	}
	step2(){
		if(this.invoice.total_amount == 0){
			new Noty({
				type: 'error',
				layout: 'topRight',
				text: 'Add atleast one item',
				progressBar: true,
				timeout: 2500,
				animation: {
					open: 'animated bounceInRight', // Animate.css class names
					close: 'animated bounceOutRight' // Animate.css class names
				}
			}).show();
			return false;
		}
		
		this.setTotal();
	}
	step3(){
		this.enableCustomDate(2);
	}

	saveInvoice(modal){
		let isModal = modal;
		let data = this.invoice;
		let Self = this;
		axios.post(route('invoice.save'),data).then(function (response) {
			if(typeof isModal != 'undefined' && isModal){
				$('#save_send').data('id',response.data.invoice.id);
				$('#save_send').data('recipient',response.data.recipient.company_name);
				Self.SendInvoice.initSendInvoiceEvent($('#save_send'));
			}
			else
				window.location.href=route('invoices');
		})
		.catch(function (error) {
		    // handle error
		    console.log(error);
		})
		.finally(function () {
		    // always executed
		});
	}

	saveRecipientDetails(){
		let self = this;
		axios.post(route('user.recipient.add'),
			new FormData($('#add_recipient')[0]),
		).then(function (response) {
		    // handle success
		    self.fetchRecipientList();
		    $('#add-recipient-modal').modal('hide');
		  })
		  .catch(function (error) {
		    // handle error
		    console.log(error);
		  })
		  .finally(function () {
		    // always executed
		  });

		  return false;
	}

	saveProductDetails(){
		let self = this;
		axios.post(route('product.save'),
			new FormData($('#add_product')[0]),
		).then(function (response) {
				// handle success
				self.selectItem(response.data.product,true);
				$('#createItem').submit();
				$('#display_tax').html('0');
		    $('#add-product-modal').modal('hide');
		  })
		  .catch(function (error) {
		    // handle error
		    console.log(error);
		  })
		  .finally(function () {
		    // always executed
		  });

		  return false;
	}

	fetchRecipientList(){
		let self = this;
		axios.get(route('user.recipient.list'),{
			params:{
				company_name:$('input[name="company_name"]').val(),
				gst_number:$('input[name="gst_number"]').val(),
				page:0,
				limit:10
			}
		}).then(function (response) {
		    // handle success
		    $('#recipient_list').html(response.data.html);
		    $('.checkbox').click(function(){
		    	var current_id = $(this).attr('id');
		    	$('.checkbox').each(function(){
		    		if($(this).attr('id') == current_id){
		    			$(this).addClass('is-checked');	
		    			$('#check_'+current_id).prop('checked',true);
		    			self.invoice.recipient =current_id; 
		    		}
		    		else{
		    			$(this).removeClass('is-checked');
		    		}
		    	})
        		
    		});
		    
		  })
		  .catch(function (error) {
		    // handle error
		    console.log(error);
		  })
		  .finally(function () {
		    // always executed
		  });

	}

	initProductSearch(){
		let Self = this;
		let searchObjs = {};
		$('#item').autocomplete({
			source:function( request, response ) {
        $.ajax( {
          url: route('product.dropdown'),
          data: {
            search: request.term
          },
          success: function( data ) {
						console.log(data);
            response( data );
          }
        } );
			},
			select:function(event,ui){
				Self.selectItem(ui.item);
			}
		});
	}

	selectItem(obj,considerQuantity){
		this.selectedItem = obj;
		$('input[name="item_name[]"]').val(obj.name);
		$('input[name="item_price[]"]').val(obj.price);
		if(typeof considerQuantity != 'undefined' && considerQuantity){
			$('input[name="item_quantity[]"]').val(obj.quantity);
		}
		$('input[name="item_id[]"]').val(obj.id);
		if(typeof obj.tax[0] != 'undefined'){
			$('input[name="item_tax_id[]"]').val(obj.tax[0].id);
			$('input[name="item_tax_name[]"]').val(obj.tax[0].name);
			$('input[name="item_tax_percent_value[]"]').val(obj.tax[0].rate);
			$('#display_tax').html(obj.tax[0].rate);
		}
		else{
			this.resetProductHidden(true);
			$('#display_tax').html('0');
		}
	}

	resetProductHidden(onlyTax){
		if(typeof onlyTax != 'undefined' && onlyTax == true){
			$('input[name="item_id[]"]').val('');
			$('input[name="item_tax_id[]"]').val('');
		}
		$('input[name="item_tax_id[]"]').val("");
		$('input[name="item_tax_name[]"]').val("");
		$('input[name="item_tax_percent_value[]"]').val("");
	}

	createItem(formData){
		let title = formData[4].value;
		let product_total = this.invoice.product_total_amount(formData[5].value,formData[6].value);
		let tax_value = this.invoice.product_tax_amount(
			product_total,
			formData[3].value
		)
		if(tax_value > 0){
			title += "( +"+ formData[3].value + "% of " + formData[2].value + ")";
		}

		this.invoice.lineItems = {
			'id':formData[0].value,
			'tax_id':formData[1].value,
			'tax_name':formData[2].value,
			'tax_percent_value':formData[3].value,
			'name':formData[4].value,
			"title":title,
			'quantity':formData[5].value,
			'price':formData[6].value,
			'tax_value':tax_value,
		};


		this.prepareItem(this.invoice.lineItems[this.invoice.lineItems.length -1],'item');
		this.setTotal();
	}

	refreshItemList(){
		let lineItems = this.invoice.lineItems;

		let selfObj = this;
		$('#item_list').html('');
		this.itemCount = 0;
		
		$.each(lineItems,function(i,obj){
			selfObj.prepareItem(obj,'item');	
		});
	}


	prepareItem(data,type){
			let fill_data = {
				item:{
					container : $('#item_list'),
					clone_item : $('.clone'),
					itemCount : this.itemCount,
					parent_id : 'item_'+this.itemCount,
					replace_elem : [
						{
							elem:'#sr',
							value:this.itemCount+1
						},
						{
							elem:'#item',
							value:data.title
						},
						{
							elem:'#quantity',
							value:data.quantity
						},
						{
							elem:'#per_item_cost',
							value:data.price
						}
					],
					remove:{
						elem:'#remove_item',
						attr_val : this.itemCount
					}

				},

				tax : {
					container : $('#tax_list'),
					clone_item : $('.tax-clone'),
					itemCount : this.taxCount,
					parent_id : 'tax_'+this.taxCount,
					replace_elem : [
						{
							elem:'#sr',
							value:this.taxCount+1
						},
						{
							elem:'#name',
							value:data.name
						},
						{
							elem:'#percent',
							value:data.amount
						},
						{
							elem:'#amount',
							value:data.tax_in_amount
						}
					],
					remove:{
						elem:'#remove_tax',
						attr_val : this.taxCount
					}
				}
			};

		let set = fill_data[type];
		let cloneItem = set['clone_item'].clone();
		let itemCount = set.itemCount;
		cloneItem.find('li').attr('id',set.parent_id);
		$.each(set.replace_elem,function(i,d){
			cloneItem.find(d.elem).html(d.value);	
		});
		cloneItem.find(set.remove.elem).attr('data-id',set.remove.attr_val);
		set['container'].append(cloneItem.html());
		this[type+'Count'] = this[type+'Count'] + 1;
	}

	createTax(formData){
		let tax_in_amount = this.invoice.tax_amount(parseFloat(formData[2].value));
		this.invoice.tax = {
			'id':formData[0].value,
			'name':formData[1].value,
			'amount':parseFloat(formData[2].value),
			'tax_in_amount':tax_in_amount
		};

		this.prepareItem(this.invoice.taxItems[this.invoice.taxItems.length -1],'tax');
		this.setTotal();
	}

	refreshTaxList(){
		let taxItems = this.invoice.taxItems;
		let selfObj = this;
		$('#tax_list').html('');
		this.taxCount = 0;
		
		$.each(taxItems,function(i,obj){
			selfObj.prepareItem(obj,'tax');	
		});
	}


	removeItem(id,type){
		this.invoice.removeItem(parseInt(id),type);
		let contain = '#item_list'; 
		let contain_elem = '#item_'+id;
		if(type == 'tax'){
			contain = '#tax_list';
			contain_elem = '#tax_'+id;
		}

		this.refreshItemList();
		this.refreshTaxList();

		this.setTotal();
	}

	enableCustomDate(dur){
		if(dur == 3){
			$('#invoice_date').attr('disabled',false);
		}
		else{
			$('#invoice_date').attr('disabled',true);
		}
		
		
		this.invoice.due_date = {
			val:dur,
			date:moment().format('DD-MM-YYYY')
		};

		$('#invoice_date').data('daterangepicker').setStartDate(this.invoice.due_date);
	}

	setTotal(){
		$('#amount_total').html(this.invoice.total_amount);
		$('#before_total').html(this.invoice.total_amount);
		//$('#tax_total').html(this.invoice.total_tax);
		$('#final_total').html(this.invoice.total_after_tax);
	}

}


class Invoice{

	constructor(id){
		this.invoice_id = id;
		this.lineItemSet = [];
		this.taxItemSet = [];
		this.due_date_set = {};
		this.recipient_id = 0;
	}

	set recipient(recipient){
		this.recipient_id = recipient;
	}

	set tax(tax){
		this.taxItemSet.push(tax);
	}

	set lineItems(lineItem){
		this.lineItemSet.push(lineItem);
	}

	set due_date(dur){
		if(dur.val == -1){
			this.due_date_set = {};
		}
		else if(dur.val == 1){
			this.due_date_set['date'] = moment().add(30,'days');
		}
		else if(dur.val == 2){
			this.due_date_set['date'] = moment();
		}
		else if(dur.val == 3 && typeof dur.date != 'undefined'){
			this.due_date_set['date'] = moment(dur.date,'DD-MM-YYYY');
		}
	}

	get due_date(){
		return this.due_date_set['date'];
	}


	get lineItems(){
		return this.lineItemSet;
	}

	get taxItems(){
		return this.taxItemSet;
	}

	get total_tax(){
		let taxes = extractColumn(this.taxItemSet,'amount');
		let numOr0 = n => isNaN(n) ? 0 : n;
		return taxes.reduce((a, b) => numOr0(a) + numOr0(b),0);
	}

	get total_amount(){
		let Self = this;
		let numOr0 = n => isNaN(n) ? 0 : n;
		let total = this.lineItemSet.reduce(function(a, b){
				let current_total = numOr0(parseInt(b.quantity)) * numOr0(parseFloat(b.price));
				if(b.tax_value != ""){
					current_total = parseFloat(b.tax_value) + parseFloat(current_total);
				}
				return (numOr0(a) + current_total);	 
			
		},0);	
		return total;
	}

	tax_amount(t){
		return parseFloat((this.total_amount * t)/ 100).toFixed(2);
	}

	product_total_amount(price,quantity){
		return (parseFloat(quantity).toFixed(2) * parseFloat(price).toFixed(2));
	}

	product_tax_amount(total,t){
		return parseFloat((total * t)/ 100).toFixed(2);
	}

	get total_after_tax(){
		let total_before_tax = this.total_amount;
		let total_tax = this.total_tax;
		let total_tax_amount = parseFloat((total_before_tax * total_tax)/ 100).toFixed(2);
		let total_after_tax = parseFloat(total_before_tax + parseFloat(total_tax_amount)).toFixed(2);
		return total_after_tax;
	}

	removeItem(index,type){
		if(type == 'line')
	       this.lineItemSet.splice(index, 1);
	   	else
	   		this.taxItemSet.splice(index, 1);
	}
}