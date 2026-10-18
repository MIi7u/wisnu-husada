$(function(){

$.ajaxSetup({
headers:{
'X-CSRF-TOKEN':
$('meta[name="csrf-token"]').attr('content')
}
})

var table = $('#rekeningTable').DataTable({

responsive:true,
autoWidth:false,

ajax:'/admin/rekening/data',

columns:[

{
data:null,
render:function(data,type,row,meta){

return meta.row +
meta.settings._iDisplayStart + 1

}
},

{
data:'kode_rek'
},

{
data:'nama_rek'
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

$('#rekeningForm')[0].reset()

$('#saveMethod').val('add')

$('#rekeningModal').modal('show')

})

$('#rekeningForm').submit(function(e){

e.preventDefault()

let saveMethod =
$('#saveMethod').val()

$.ajax({

url:
saveMethod == 'edit'
? '/admin/rekening/update'
: '/admin/rekening/store',

method:'POST',

data:$(this).serialize(),

success:function(){

$('#rekeningModal').modal('hide')

table.ajax.reload()

alert('Data berhasil disimpan')

}

})

})

$('#rekeningTable').on(
'click',
'.btnEdit',
function(){

let row =
table.row(
$(this).closest('tr')
).data()

$('#kode_rek_lama')
.val(row.kode_rek)

$('#kode_rek')
.val(row.kode_rek)

$('#nama_rek')
.val(row.nama_rek)

$('#saveMethod')
.val('edit')

$('#rekeningModal')
.modal('show')

})

$('#rekeningTable').on(
'click',
'.btnDelete',
function(){

let row =
table.row(
$(this).closest('tr')
).data()

if(confirm('Hapus data ?')){

$.ajax({

url:'/admin/rekening/delete',

method:'POST',

data:{
kode_rek:row.kode_rek
},

success:function(){

table.ajax.reload()

}

})

}

})

})