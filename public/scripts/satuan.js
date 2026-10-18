$(function(){

$.ajaxSetup({
headers:{
'X-CSRF-TOKEN':
$('meta[name="csrf-token"]').attr('content')
}
})

var table = $('#satuanTable').DataTable({

responsive:true,
autoWidth:false,

ajax:'/admin/satuan/data',

columns:[

{
data:null,
render:function(data,type,row,meta){

return meta.row +
meta.settings._iDisplayStart + 1

}
},

{
data:'nama_satuan'
},

{
data:null,
render:function(row){

return `

<button
class="btn btn-warning btn-sm btnEdit">

Edit

</button>

<button
class="btn btn-danger btn-sm btnDelete">

Hapus

</button>

`;

}
}

]

})

$('#btnAdd').click(function(){

$('#satuanForm')[0].reset()

$('#saveMethod').val('add')

$('#satuanModal').modal('show')

})

$('#satuanForm').submit(function(e){

e.preventDefault()

let saveMethod =
$('#saveMethod').val()

$.ajax({

url:
saveMethod == 'edit'
? '/admin/satuan/update'
: '/admin/satuan/store',

method:'POST',

data:$(this).serialize(),

success:function(){

$('#satuanModal').modal('hide')

table.ajax.reload()

alert('Data berhasil disimpan')

}

})

})

$('#satuanTable').on(
'click',
'.btnEdit',
function(){

let row =
table.row(
$(this).closest('tr')
).data()

$('#id').val(row.id)

$('#nama_satuan')
.val(row.nama_satuan)

$('#saveMethod')
.val('edit')

$('#satuanModal')
.modal('show')

})

$('#satuanTable').on(
'click',
'.btnDelete',
function(){

let row =
table.row(
$(this).closest('tr')
).data()

if(confirm('Hapus data ?')){

$.ajax({

url:'/admin/satuan/delete',

method:'POST',

data:{
id:row.id
},

success:function(){

table.ajax.reload()

}

})

}

})

})