$(function(){

$.ajaxSetup({
headers:{
    'X-CSRF-TOKEN':
    $('meta[name="csrf-token"]').attr('content')
}
})



var table = $('#ruangTable').DataTable({
responsive:true,    
autoWidth:false,
ajax:'/admin/ruang_layanan/data',
columns:[
{
    data:null,
    render:function(data,type,row,meta){
        return meta.row + meta.settings._iDisplayStart + 1
    }
},
{data:'kode_ruang'},
{data:'kode_bpjs'},
{data:'nama_ruang'},
{data:'instalasi_bidang'},
{data:'kode_jenis_pelayanan'},

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
    $('#ruangForm')[0].reset()
    $('#saveMethod').val('add')
    $('#ruangModal').modal('show')
})

$('#ruangForm').submit(function(e){
    e.preventDefault()
    var saveMethod = $('#saveMethod').val()
    var id = $('#id').val()
    $.ajax({
    url:
    saveMethod == 'edit'
    ? '/admin/ruang_layanan/update/' + id
    : '/admin/ruang_layanan/store',
    method:'POST',
    data:$(this).serialize(),
    success:function(){
        $('#ruangModal').modal('hide')
        table.ajax.reload()
         alert('Data berhasil disimpan')
    }
    })
})

$('#ruangTable').on(
    'click',
    '.btnDelete',
    function(){
    let id = $(this).data('id')
    if(confirm('Hapus data?')){
    $.ajax({
    url:'/admin/ruang_layanan/delete/' + id,
    method:'DELETE',
    success:function(){
    table.ajax.reload()
    }
    })
    }
})

$('#ruangTable').on(
    'click',
    '.btnEdit',
    function(){
    let row = table
    .row($(this).closest('tr'))
    .data()
    $('#id').val(row.id)
    $('#kode_ruang').val(row.kode_ruang)
    $('#kode_bpjs').val(row.kode_bpjs)
    $('#nama_ruang').val(row.nama_ruang)
    $('#instalasi_bidang')
    .val(row.instalasi_bidang)
    $('#kode_jenis_pelayanan')
    .val(row.kode_jenis_pelayanan)
    $('#saveMethod').val('edit')
    $('#ruangModal').modal('show')
    })
})
$('.btnCardClose').click(function(){

    $(this)
    .closest('.card')
    .fadeOut(300)

})