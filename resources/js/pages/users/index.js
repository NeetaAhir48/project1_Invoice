$(function(){

	let ListUser = new listUser();
})

class listUser{
	constructor(){
		this.dtable = dtable('#export-table',{
			fnDrawCallback:function(){
				initConfirmationOnDelete()
			},
            ajax: {
                url: $('table#export-table').data('url'),
                method: 'get',
            },
            columns: [
                {
                    data: 'name',
                    title: 'User Name',
                    name: 'name',
                },
                {
                    data: 'company',
                    title: "Company",
                    name: 'company',
                },
                {
                    data: 'phone',
                    title: "Phone",
                    name: 'phone',
                },
                {
                    data: 'email',
                    title: "Email",
                    name: 'email',
                },
                {
                    data: 'id',
                    title: 'Action',
                    searchable: false,
                    sortable: false,
                    className: 'text-center text-nowrap',
                    render: function(data,type,row) {


                        var tableaction = "";
                        
                        if(row.permissions.edit !== false)
                            tableaction += buildEditAction(route('user.edit',{user:data}));
                        
                        if(row.permissions.view !== false)
                            tableaction += buildViewAction(route('user.show',{user:data}));

                        if(row.permissions.delete !== false)
                            tableaction += buildDeleteAction(route('user.destroy',{user:data}))

                        return tableaction;
                    }
                }
            ],
        });
	}
}

