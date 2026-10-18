$(function(){
    // ==========================
    // LOAD PROVINSI
    // ==========================
    if($('#provinsi').length){
        loadProvinsi()
    }
    // ==========================
    // PROVINSI -> KABUPATEN
    // ==========================
    $('#provinsi').on('change', function(){
        let code = $(this).val()
        $('#kabupaten').html(
            '<option value="">-- Pilih Kabupaten --</option>'
        )
        $('#kecamatan').html(
            '<option value="">-- Pilih Kecamatan --</option>'
        )
        $('#desa').html(
            '<option value="">-- Pilih Desa --</option>'
        )
        if(!code) return
        $.get('/admin/wilayah/kabupaten/' + code,
            function(data){
                data.forEach(function(item){
                    $('#kabupaten').append(
                        `<option value="${item.code}">
                            ${item.name}
                        </option>`
                    )
                })
            }
        )
    })

    // ==========================
    // KABUPATEN -> KECAMATAN
    // ==========================

    $('#kabupaten').on('change', function(){
        let code = $(this).val()
        $('#kecamatan').html(
            '<option value="">-- Pilih Kecamatan --</option>'
        )
        $('#desa').html(
            '<option value="">-- Pilih Desa --</option>'
        )
        if(!code) return
        $.get('/admin/wilayah/kecamatan/' + code,

            function(data){

                data.forEach(function(item){

                    $('#kecamatan').append(
                        `<option value="${item.code}">
                            ${item.name}
                        </option>`
                    )

                })

            }

        )

    })

    // ==========================
    // KECAMATAN -> DESA
    // ==========================

    $('#kecamatan').on('change', function(){

        let code = $(this).val()

        $('#desa').html(
            '<option value="">-- Pilih Desa --</option>'
        )

        if(!code) return

        $.get('/admin/wilayah/kelurahan/' + code,
            function(data){
                data.forEach(function(item){
                    $('#desa').append(
                        `<option value="${item.code}">
                            ${item.name}
                        </option>`
                    )
                })
            }
        )
    })
})


// ==========================
// FUNCTION GLOBAL
// ==========================

function loadProvinsi(){
    $('#provinsi').html(
        '<option value="">-- Pilih Provinsi --</option>'
    )
    $.get(
        '/admin/wilayah/provinsi',
        function(data){
            data.forEach(function(item){
                $('#provinsi').append(
                    `<option value="${item.code}">
                        ${item.name}
                    </option>`
                )
            })
        }
    )
}