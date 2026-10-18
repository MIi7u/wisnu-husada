document.addEventListener('DOMContentLoaded', function () {
  
  $.ajaxSetup({
  headers: {
    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
  });
  
  fetch('/admin/spesialis/dropdown')
    .then(res => res.json())
    .then(data => {
      let select = document.getElementById('kd_spesialis');

      // Option default
      let defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Pilih Spesialis --';
      select.appendChild(defaultOption);

      // Isi data dari DB
      data.forEach(sp => {
        let option = document.createElement('option');
        option.value = sp.kd_spesialis;
        option.textContent = sp.nm_spesialis;
        select.appendChild(option);
      });
    })
    .catch(err => console.error('Error ambil data spesialis:', err));
});

$(function(){
  function format(row){
    return '<table class="table table-sm table-bordered">'+
      '<tr><th>Alamat</th><td>'+(row.alamat||'')+'</td></tr>'+
      '<tr><th>No. Telepon</th><td>'+(row.no_telp||'')+'</td></tr>'+
      '<tr><th>Tgl Masuk</th><td>'+(row.tgl_masuk||'')+'</td></tr>'+
      '<tr><th>Foto</th><td>'+(row.foto?'<img src="/images/'+row.foto+'" width="100">':'')+'</td></tr>'+
      '<tr><th>Keterangan</th><td>'+(row.keterangan||'')+'</td></tr>'+
      '</table>';
  }

  var table = $('#dokterTable').DataTable({
    ajax: '/admin/dokter/data',
    columns: [
      { data: null, className:'dt-control', orderable:false, defaultContent:'' },
      { data: 'nip_dokter' },
      { data: 'nm_dokter' },
      { data: 'jenis_kelamin', render: function(data){
            return data === 'Laki-laki' ? 'Laki-laki' : data === 'Perempuan' ? 'Perempuan' : '';
            }
        },
      { data: 'nm_spesialis' },
      { data: null, render: function(row){
          return '<button class="btn btn-sm btn-warning btnEdit" data-id="'+row.nip_dokter+'">Edit</button> '+
                 '<button class="btn btn-sm btn-danger btnDelete" data-id="'+row.nip_dokter+'">Hapus</button>';
        }
      }
    ]
  });

  $('#dokterTable tbody').on('click', 'td.dt-control', function () {
    var tr = $(this).closest('tr');
    var row = table.row(tr);
    if (row.child.isShown()) {
        row.child.hide();
        tr.removeClass('shown');
    }
    else {
        row.child(format(row.data())).show();
        tr.addClass('shown');
    }
  });

  $('#btnAdd').click(function()
  {
    $('#dokterForm')[0].reset();
    $('#nip_dokter').prop('disabled', false);
    $('#dokterModal').modal('show');
  });

  // Simpan Data
$('#dokterForm').submit(function(e) {
  e.preventDefault();
  var saveMethod = $('#saveMethod').val();
  var id = $('#nip_dokter').val();
  var formData = new FormData(this);

  $.ajax({
    url: saveMethod === 'edit' ? '/admin/dokter/update/' + id : '/admin/dokter/store',
    method: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json'
    },
    success: function(res) {
      $('#dokterModal').modal('hide');
      $('#dokterTable').DataTable().ajax.reload();
      alert('Data berhasil disimpan!');
    },
    error: function(xhr, status, error) {
      console.error("Error:", xhr.responseText);
      alert('Terjadi kesalahan: ' + xhr.responseText);
    }
  });
});

  // Hapus Data
  $('#dokterTable').on('click', '.btnDelete', function() {
    var id = $(this).data('id');
    if(confirm('Yakin hapus data ini?')){
      $.post('/admin/dokter/delete/' + id, {_method: 'DELETE'}, function(){
        $('#dokterTable').DataTable().ajax.reload();
      });
    }
  });

  $('#dokterTable').on('click', '.btnEdit', function(){
    var row = table.row($(this).closest('tr')).data();
    $('#nip_dokter').val(row.nip_dokter).prop('disabled', true);
    $('#nm_dokter').val(row.nm_dokter);

   $('#jenis_kelamin').val(row.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : 
                        row.jenis_kelamin === 'Perempuan' ? 'Perempuan' : '');
    $('#kd_spesialis').val(row.kd_spesialis);
    $('#alamat').val(row.alamat);
    $('#no_telp').val(row.no_telp);
    $('#tgl_masuk').val(row.tgl_masuk ? row.tgl_masuk.split('T')[0] : '');
    $('#old_foto').val(row.foto);
    $('#keterangan').val(row.keterangan);
    // Tambahkan ini untuk mengubah saveMethod menjadi "edit"
    $('#saveMethod').val('edit');
    $('#dokterModal').modal('show');
  });

  
});
