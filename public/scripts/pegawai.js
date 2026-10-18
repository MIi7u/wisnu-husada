$(function(){

function format(row){
return `
<div class="p-3">
    <div class="row">
        <div class="col-md-4 text-center">
            ${
                row.pas_foto
                ? `<img src="/uploads/${row.pas_foto}"
                        class="img-fluid rounded shadow"
                        width="180">`
                : `<img src="/images/default.png"
                        class="img-fluid rounded"
                        width="180">`
            }
        </div>
    <div class="col-md-8">
    <table class="table table-bordered table-sm">
        <tr>
            <th>Gelar</th>
            <td>
                ${row.gelar_depan ?? ''}
                ${row.nama_lengkap ?? ''}
                ${row.gelar_belakang ?? ''}
            </td>
        </tr>
        <tr>
            <th>Kategori Pegawai</th>
            <td>${row.kategori_pegawai ?? ''}</td>
        </tr>
        <tr>
            <th>SIP</th>
            <td>${row.sip ?? ''}</td>
        </tr>
        <tr>
            <th>Tempat / Tanggal Lahir</th>
            <td>
                ${row.tempat_lahir ?? ''},
                ${row.tanggal_lahir ?? ''}
            </td>
        </tr>
        <tr>
            <th>Agama</th>
            <td>${row.agama ?? ''}</td>
        </tr>
        <tr>
            <th>Pendidikan</th>
            <td>${row.pendidikan_terakhir ?? ''}</td>
        </tr>
        <tr>
            <th>Status Nikah</th>
            <td>${row.status_nikah ?? ''}</td>
        </tr>
        <tr>
            <th>Golongan Darah</th>
            <td>${row.golongan_darah ?? ''}</td>
        </tr>
        <tr>
            <th>Alamat</th>
            <td>${row.alamat ?? ''}</td>
        </tr>
        <tr>
            <th>Wilayah</th>
            <td>
                ${row.desa ?? ''},
                ${row.kecamatan ?? ''},
                ${row.kabupaten ?? ''},
                ${row.provinsi ?? ''}
            </td>
        </tr>
        <tr>
            <th>Email</th>
            <td>${row.email ?? ''}</td>
        </tr>
        <tr>
            <th>NPWP</th>
            <td>${row.npwp ?? ''}</td>
        </tr>
        </table>
    </div>
</div>
</div>
`;
}

var table = $('#pegawaiTable').DataTable({

    processing:true,
    responsive:true,

    ajax:'/admin/pegawai/data',
    columns:[
        {
            data:null,
            className:'dt-control',
            orderable:false,
            defaultContent:''
        },
        {data:'nik'},
        {data:'nip'},
        {
            data:null,
            render:function(row){
                return `
                    ${row.gelar_depan ?? ''}
                    ${row.nama_lengkap}
                    ${row.gelar_belakang ?? ''}
                `;
            }
        },
        {data:'jenis_kelamin'},
        {data:'ruang_kerja'},
        {data:'nomor_hp'},
        {
            data:'status_keaktifan',
            render:function(data){

                if(data == 'Aktif'){
                    return `
                        <span class="badge bg-success">
                            Aktif
                        </span>
                    `;
                }
                return `
                    <span class="badge bg-danger">
                        Nonaktif
                    </span>
                `;
            }
        },

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
});

$('#pegawaiTable tbody').on(
'click','td.dt-control',
function(){
    var tr = $(this).closest('tr');
    var row = table.row(tr);

    if(row.child.isShown()){
        row.child.hide();
        tr.removeClass('shown');
    }else{
        row.child(format(row.data())).show();
        tr.addClass('shown')
    }
});

});

$('#pegawaiTable').on('click','.btnEdit',
    function(){
        let row = table
            .row($(this).closest('tr'))
            .data()
        $('#saveMethod').val('edit')
        $('#id').val(row.id)
        $('#nik').val(row.nik)
        $('#nip').val(row.nip)
        $('#nama_lengkap').val(row.nama_lengkap)
        $('#gelar_depan').val(row.gelar_depan)
        $('#gelar_belakang').val(row.gelar_belakang)
        $('#ruang_kerja').val(row.ruang_kerja)
        $('#kategori_pegawai').val(row.kategori_pegawai)
        $('#sip').val(row.sip)
        $('#tempat_lahir').val(row.tempat_lahir)
        $('input[name="tanggal_lahir"]').val(row.tanggal_lahir)
        $('select[name="jenis_kelamin"]').val(row.jenis_kelamin)
        $('input[name="agama"]').val(row.agama)
        $('input[name="pendidikan_terakhir"]').val(row.pendidikan_terakhir)
        $('select[name="status_nikah"]').val(row.status_nikah)
        $('select[name="golongan_darah"]').val(row.golongan_darah)
        $('input[name="nomor_hp"]').val(row.nomor_hp)
        $('input[name="email"]').val(row.email)
        $('input[name="npwp"]').val(row.npwp)
        $('select[name="status_keaktifan"]').val(row.status_keaktifan)
        $('textarea[name="alamat"]').val(row.alamat)
        $('input[name="provinsi"]').val(row.provinsi)
        $('input[name="kabupaten"]').val(row.kabupaten)
        $('input[name="kecamatan"]').val(row.kecamatan)
        $('input[name="desa"]').val(row.desa)
        $('#pegawaiModal').modal('show')
    }
)

$('#nip').change(function(){
    let nama = $(this)
        .find(':selected')
        .data('nama')
    $('#nama').val(nama)
})

$('#btnAdd').click(function(){
    $('#pegawaiForm')[0].reset()
    $('#pegawaiModal').modal('show')
})

$('#btnAddAkses').click(function(){
    $('#aksesForm')[0].reset()
    $('#aksesModal').modal('show')
})


