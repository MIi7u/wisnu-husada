$(function(){
    setTimeout(function(){
        $('#cariPegawai').select2({
            placeholder:'-Pilih..-',
            minimumInputLength:3,
            ajax:{
                url:'/admin/pegawai/search',
                dataType:'json',
                delay:300,
                data:function(params){
                    return {
                        term:params.term
                    }
                },
                processResults:function(data){
                    return {results:data}
                }
            }
        })
      $('#cariPegawai').on(
        'select2:select',
        function(e){
            let data = e.params.data
            console.log(data)
            $('#pegawaiTerpilih').html(data.text)
        })
  
    },500)
})