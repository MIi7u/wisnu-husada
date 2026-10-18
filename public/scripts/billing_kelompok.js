$(function(){

var table = $('#billingTable').DataTable({

ajax:'/admin/billing_kelompok/data',

columns:[

{
    data:null,
    render:function(data,type,row,meta){

        return meta.row +
               meta.settings._iDisplayStart + 1

    }
},

{data:'nama_tarif_kelompok'},

{data:'kategori'},

{
data:null,
render:function(row){

return `
<button class="btn btn-warning btn-sm btnEdit"
        data-id="${row.id}">
Edit
</button>

<button class="btn btn-danger btn-sm btnDelete"
        data-id="${row.id}">
Hapus
</button>
`;

}
}

]

})

$('#btnAdd').click(function(){

    $('#billingForm')[0].reset()

    $('#saveMethod').val('add')

    $('#billingModal').modal('show')

})

})