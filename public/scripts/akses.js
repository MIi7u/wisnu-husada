$('#aksesForm').submit(function(e){
    e.preventDefault()
    $.ajax({
        url:'/admin/akses/store',
        method:'POST',
        data:$(this).serialize(),
        success:function(){
            $('#aksesModal').modal('hide')
            aksesTable.ajax.reload()
        }
    })
})

var aksesTable = $('#aksesTable').DataTable({
    ajax:'/admin/akses/data',
    columns:[
        {
            data:null,
            render:function(
                data,type,row,meta
            ){
                return meta.row + 1
            }
        },
        {data:'nik'},
        {data:'nama_lengkap'},
        {data:'nama_ruang'},
        {
            data:null,
            render:function(row){
                return `
                <button
                    class="btn btn-warning btn-sm btnEditAkses"
                    data-id="${row.id}">
                    Edit
                </button>
                <button
                    class="btn btn-danger btn-sm btnDeleteAkses"
                    data-id="${row.id}">
                    Hapus
                </button>
                `
            }
        }
    ]
})

$('#aksesForm').submit(function(e){
    e.preventDefault()
    let id = $('#akses_id').val()
    $.ajax({
        url:id? '/admin/akses/update/' + id
        : '/admin/akses/store',
        method:'POST',
        data:$(this).serialize(),
        success:function(){
            $('#aksesModal').modal('hide')
            aksesTable.ajax.reload()
        }
    })
})

$('#aksesTable').on('click','.btnDeleteAkses',
function(){
    let id =$(this).data('id')
    if(
        confirm('Hapus mapping?')
    ){
        $.ajax({
            url:'/admin/akses/delete/' + id,
            method:'DELETE',
            success:function(){
                aksesTable
                .ajax
                .reload()
            }
        })
    }
})