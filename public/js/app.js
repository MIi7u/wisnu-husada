$(document).on('click', '.menu-link', function(e){
    e.preventDefault()
    const startTime = performance.now();
    let page = $(this).data('page')
    console.log(page)
    $('#main-content').fadeOut(150,function(){
        const endTime = performance.now();
        $('#main-content').load(page,function(){
            $('#main-content').fadeIn(150)
        })
        $('#loadTime').text(
            ((endTime - startTime)/1000)
            .toFixed(4)
        );

    })
})

document.querySelectorAll('.dropdown-submenu > a').forEach(function(element){
    element.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        let submenu = this.nextElementSibling;
        if(submenu){
            submenu.classList.toggle('show');
        }
    });
});

