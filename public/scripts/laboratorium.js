$(function () {

    $.ajaxSetup({
        headers: { 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') }
    })

    const rupiah = n => new Intl.NumberFormat('id-ID').format(n || 0)

    /* ==================== DROPDOWN RUANG (integrasi ruang_layanan) ==================== */
    function loadRuangDropdown(target) {
        $.getJSON('/admin/ruang_layanan/data', function (res) {
            let opts = '<option value="">-- Pilih Ruang --</option>'
            ;(res.data || []).forEach(function (r) {
                if ((r.instalasi_bidang || '').toLowerCase().includes('laboratorium') || true) {
                    opts += `<option value="${r.kode_ruang}">${r.nama_ruang}</option>`
                }
            })
            $(target).html(opts)
        })
    }
    loadRuangDropdown('#kode_ruang')
    loadRuangDropdown('#tarifKodeRuang')

    /* ==================== MASTER JENIS PEMERIKSAAN ==================== */
    var jenisTable = $('#jenisTable').DataTable({
        responsive: true, autoWidth: false,
        ajax: '/admin/laboratorium/jenis/data',
        columns: [
            { data: null, render: (d, t, r, m) => m.row + m.settings._iDisplayStart + 1 },
            { data: 'kode_jenis' },
            { data: 'nama_pemeriksaan' },
            { data: 'nama_ruang', defaultContent: '-' },
            { data: 'satuan_harga' },
            { data: 'aktif', render: v => v ? '<span class="badge bg-success">Aktif</span>' : '<span class="badge bg-secondary">Nonaktif</span>' },
            { data: null, orderable: false, render: row => `
                <button class="btn btn-warning btn-sm btnEditJenis" data-id="${row.id}">Edit</button>
                <button class="btn btn-danger btn-sm btnDeleteJenis" data-id="${row.id}">Hapus</button>` }
        ]
    })

    function refreshJenisDropdowns() {
        $.getJSON('/admin/laboratorium/jenis/dropdown', function (res) {
            let opts = '<option value="">-- Pilih Jenis --</option>'
            ;(res.data || []).forEach(function (j) {
                opts += `<option value="${j.kode_jenis}">${j.nama_pemeriksaan}</option>`
            })
            $('#itemKodeJenis').html(opts)
            $('#tarifKodeJenis').html(opts)
        })
    }
    refreshJenisDropdowns()

    $('#btnAddJenis').click(function () {
        $('#jenisForm')[0].reset()
        $('#jenisSaveMethod').val('add'); $('#jenisId').val('')
        $('#jenisModal').modal('show')
    })

    $('#jenisTable').on('click', '.btnEditJenis', function () {
        const row = jenisTable.row($(this).closest('tr')).data()
        $('#jenisId').val(row.id)
        $('#kode_jenis').val(row.kode_jenis)
        $('#nama_pemeriksaan').val(row.nama_pemeriksaan)
        $('#kode_ruang').val(row.kode_ruang)
        $('#satuan_harga').val(row.satuan_harga)
        $('#aktif').val(String(row.aktif === true || row.aktif === 1))
        $('#jenisSaveMethod').val('edit')
        $('#jenisModal').modal('show')
    })

    $('#jenisForm').submit(function (e) {
        e.preventDefault()
        const id = $('#jenisId').val()
        $.ajax({
            url: $('#jenisSaveMethod').val() === 'edit'
                ? `/admin/laboratorium/jenis/update/${id}`
                : '/admin/laboratorium/jenis/store',
            method: 'POST',
            data: $(this).serialize(),
            success: function () {
                $('#jenisModal').modal('hide')
                jenisTable.ajax.reload()
                refreshJenisDropdowns()
                alert('Data jenis pemeriksaan berhasil disimpan')
            },
            error: xhr => alert('Gagal menyimpan: ' + xhr.responseText)
        })
    })

    $('#jenisTable').on('click', '.btnDeleteJenis', function () {
        const id = $(this).data('id')
        if (confirm('Hapus data jenis pemeriksaan?')) {
            $.ajax({
                url: `/admin/laboratorium/jenis/delete/${id}`,
                method: 'DELETE',
                success: () => { jenisTable.ajax.reload(); refreshJenisDropdowns() }
            })
        }
    })

    /* ==================== MASTER ITEM PEMERIKSAAN ==================== */
    var itemTable = $('#itemTable').DataTable({
        responsive: true, autoWidth: false,
        ajax: '/admin/laboratorium/item/data',
        columns: [
            { data: null, render: (d, t, r, m) => m.row + m.settings._iDisplayStart + 1 },
            { data: 'kode_item' },
            { data: 'nama_item' },
            { data: 'nama_jenis', defaultContent: '-' },
            { data: 'satuan', defaultContent: '-' },
            { data: 'harga', render: v => rupiah(v) },
            { data: 'urutan', defaultContent: '-' },
            { data: null, orderable: false, render: row => `
                <button class="btn btn-warning btn-sm btnEditItem" data-id="${row.id}">Edit</button>
                <button class="btn btn-danger btn-sm btnDeleteItem" data-id="${row.id}">Hapus</button>` }
        ]
    })

    $('#btnAddItem').click(function () {
        $('#itemForm')[0].reset()
        $('#itemSaveMethod').val('add'); $('#itemId').val('')
        $('#itemModal').modal('show')
    })

    $('#itemTable').on('click', '.btnEditItem', function () {
        const row = itemTable.row($(this).closest('tr')).data()
        $('#itemId').val(row.id)
        $('#kode_item').val(row.kode_item)
        $('#nama_item').val(row.nama_item)
        $('#itemKodeJenis').val(row.kode_jenis)
        $('#satuan').val(row.satuan)
        $('#harga').val(row.harga)
        $('#urutan').val(row.urutan)
        $('#itemSaveMethod').val('edit')
        $('#itemModal').modal('show')
    })

    $('#itemForm').submit(function (e) {
        e.preventDefault()
        const id = $('#itemId').val()
        $.ajax({
            url: $('#itemSaveMethod').val() === 'edit'
                ? `/admin/laboratorium/item/update/${id}`
                : '/admin/laboratorium/item/store',
            method: 'POST',
            data: $(this).serialize(),
            success: function () {
                $('#itemModal').modal('hide')
                itemTable.ajax.reload()
                alert('Data item pemeriksaan berhasil disimpan')
            },
            error: xhr => alert('Gagal menyimpan: ' + xhr.responseText)
        })
    })

    $('#itemTable').on('click', '.btnDeleteItem', function () {
        const id = $(this).data('id')
        if (confirm('Hapus data item pemeriksaan?')) {
            $.ajax({
                url: `/admin/laboratorium/item/delete/${id}`,
                method: 'DELETE',
                success: () => itemTable.ajax.reload()
            })
        }
    })

    /* ==================== TARIF LAB ==================== */
    var tarifTable = $('#tarifTable').DataTable({
        responsive: true, autoWidth: false,
        ajax: '/admin/laboratorium/tarif/data',
        columns: [
            { data: null, render: (d, t, r, m) => m.row + m.settings._iDisplayStart + 1 },
            { data: 'nama_ruang', defaultContent: '-' },
            { data: 'nama_pemeriksaan', defaultContent: '-' },
            { data: 'tarif', render: v => 'Rp ' + rupiah(v) },
            { data: null, orderable: false, render: row => `
                <button class="btn btn-warning btn-sm btnEditTarif" data-id="${row.id}">Edit</button>
                <button class="btn btn-danger btn-sm btnDeleteTarif" data-id="${row.id}">Hapus</button>` }
        ]
    })

    $('#btnAddTarif').click(function () {
        $('#tarifForm')[0].reset()
        $('#tarifSaveMethod').val('add'); $('#tarifId').val('')
        $('#tarifModal').modal('show')
    })

    $('#tarifTable').on('click', '.btnEditTarif', function () {
        const row = tarifTable.row($(this).closest('tr')).data()
        $('#tarifId').val(row.id)
        $('#tarifKodeRuang').val(row.kode_ruang)
        $('#tarifKodeJenis').val(row.kode_jenis)
        $('#tarif').val(row.tarif)
        $('#tarifSaveMethod').val('edit')
        $('#tarifModal').modal('show')
    })

    $('#tarifForm').submit(function (e) {
        e.preventDefault()
        const id = $('#tarifId').val()
        $.ajax({
            url: $('#tarifSaveMethod').val() === 'edit'
                ? `/admin/laboratorium/tarif/update/${id}`
                : '/admin/laboratorium/tarif/store',
            method: 'POST',
            data: $(this).serialize(),
            success: function () {
                $('#tarifModal').modal('hide')
                tarifTable.ajax.reload()
                alert('Tarif lab berhasil disimpan')
            },
            error: xhr => alert('Gagal menyimpan: ' + xhr.responseText)
        })
    })

    $('#tarifTable').on('click', '.btnDeleteTarif', function () {
        const id = $(this).data('id')
        if (confirm('Hapus tarif lab?')) {
            $.ajax({
                url: `/admin/laboratorium/tarif/delete/${id}`,
                method: 'DELETE',
                success: () => tarifTable.ajax.reload()
            })
        }
    })

    $('.btnCardClose').click(function () {
        $(this).closest('.card').fadeOut(300)
    })
})
