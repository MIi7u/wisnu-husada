$(function(){

$.ajaxSetup({
headers:{
    'X-CSRF-TOKEN':
    $('meta[name="csrf-token"]').attr('content')
}
})

var table = $('#pabrikTable').DataTable({
    responsive:true,
    autoWidth:false,
    ajax:'/admin/pabrik/data',
    columns:[
    {
        data:null,
        render:function(data,type,row,meta){
            return meta.row +
                   meta.settings._iDisplayStart + 1
        }
    },
    {data:'kode_pabrik'},
    {data:'nama_pabrik'},
    {data:'kota'},
    {data:'no_telp'},
    {data:'keterangan'},
    {
        data:null,
        render:function(row){
            return `
            <button
                class="btn btn-warning btn-sm btnEdit"
                data-kode="${row.kode_pabrik}">
                Edit
            </button>
            <button
                class="btn btn-danger btn-sm btnDelete"
                data-kode="${row.kode_pabrik}">
                Hapus
            </button>
            `;
        }
    }
    ]
})

// =========================
// TOMBOL TAMBAH
// =========================
$('#btnAdd').click(function(){
    $('#pabrikForm')[0].reset()
    $('#saveMethod').val('add')
    $('#kode_lama').val('')
    $('#kode_pabrik').prop('readonly',false)
    $('#pabrikModal').modal('show')
})

// =========================
// SIMPAN / UPDATE
// =========================

$('#pabrikForm').submit(function(e){
    e.preventDefault()
    let saveMethod = $('#saveMethod').val()
    $.ajax({
        url:
        saveMethod == 'edit'
        ? '/admin/pabrik/update'
        : '/admin/pabrik/store',
        method:'POST',
        data:$(this).serialize(),
        success:function(response){
            $('#pabrikModal').modal('hide')
            table.ajax.reload()
            alert('Data berhasil disimpan')
        },
        error:function(xhr){
            alert('Terjadi kesalahan')
            console.log(xhr.responseText)
        }
    })
})


// =========================
// HAPUS
// =========================

$('#pabrikTable').on(
'click',
'.btnDelete',
function(){
    let kode = $(this).data('kode')
    if(confirm('Hapus data ini ?')){
        $.ajax({
            url:'/admin/pabrik/delete',
            method:'POST',
            data:{
                kode_pabrik:kode
            },
            success:function(){
                table.ajax.reload()
                alert('Data berhasil dihapus')
            }
        })
    }
})


// =========================
// EDIT
// =========================

$('#pabrikTable').on(
'click',
'.btnEdit',
function(){
    let row = table
        .row($(this).closest('tr'))
        .data()
    $('#kode_lama')
        .val(row.kode_pabrik)
    $('#kode_pabrik')
        .val(row.kode_pabrik)
    $('#nama_pabrik')
        .val(row.nama_pabrik)
    $('#alamat')
        .val(row.alamat)
    $('#no_telp')
        .val(row.no_telp)
    $('#kota')
        .val(row.kota)
    $('#keterangan')
        .val(row.keterangan)
    $('#saveMethod')
        .val('edit')
    $('#pabrikModal')
        .modal('show')
})


// =========================
// TUTUP CARD
// =========================

$('.btnCardClose').click(function(){

    $(this)
        .closest('.card')
        .fadeOut(300)

})

})