
// Variables
    var win     = $( this );
    var minus   = $( '.weevisor-zoom-minus', win );
    var plus    = $( '.weevisor-zoom-plus', win );
    var sidebar = $( '.weevisor-sidebar', win );
    var thumb   = $( '.weevisor-sidebar-page.wz-prototype', win );
    var toggle  = $( '.weevisor-sidebar-button', win );
    var zone    = $( '.weevisor-images', win );
    var zoom    = $( '.weevisor-zoom', win );
    var uiBarTop= $('.wz-ui-header');
    var isWebKit          = /webkit/i.test( navigator.userAgent );
    var prevClientX       = 0;
    var prevClientY       = 0;
    var hideControlsTimer = 0;
    var normalWidth       = 0;
    var normalHeight      = 0;
    var pdfMode           = false;
    var pdfSize           = null;
    var imageLoaded       = null;


    var menuHeight = $( '.wz-view-menu', win ).outerHeight();

// Valid zoom
    var validZoom = [ 0.01, 0.02, 0.03, 0.04, 0.06, 0.08, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5 ];

// Private Methods
    var _preciseDecimal = function( number ){
        return parseFloat( number.toFixed( 2 ) );
    };

    var _loadImage = function( file ){

        imageLoaded = file;

        $( '<img />')
            .attr( 'src', file.thumbnails.original )
            .appendTo( zone )
            .on( 'load', function(){
                _marginImage();
            });

            if( wz.app.storage('horizontal') ){
                wz.app.storage( 'scale', zone.width() / parseInt( file.metadata.exif.imageWidth, 10 ) );
            }else{
                wz.app.storage( 'scale', zone.height() / parseInt( file.metadata.exif.imageHeight, 10 ) );
            }

            if( wz.app.storage('scale') > 1 ){
                wz.app.storage('scale', 1 );
            }

            _scaleImage( wz.app.storage('scale') );
            zoom.val( _preciseDecimal( wz.app.storage('scale') * 100 ) );

    };

    var _loadPdf = function( file ){

        pdfMode = true;

        var images = [];

        if( $.isArray( file.formats.jpeg ) ){

            for( var i in file.formats.jpeg ){
                images.push( file.formats.jpeg[ i ].url );
            }

        }else if( file.formats.jpeg ){
            images.push( file.formats.jpeg.url );
        }else{

            return alert( lang.canNotOpenPDF, function(){
                wz.app.removeView( win );
            });

        }

        var i = 0;
        var j = images.length;
        var k = null;
        var s = zone.width();

        for( i = 0; i < j; i++ ){

            zone.append( $( '<img />').attr( 'src', images[ i ] ).width( s ) );

            k = thumb.clone().removeClass('wz-prototype');

            k.find('img').attr( 'src', images[ i ] );
            k.find('span').text( i + 1 );

            sidebar.append( k );

        }

        $( 'img:first', zone ).on( 'load', function(){

            wz.app.storage( 'scale', _preciseDecimal( s / this.naturalWidth ) );

            pdfSize = [this.naturalWidth, this.naturalHeight];
            _detectPage();
            zoom.val( _preciseDecimal( wz.app.storage('scale') * 100 ) );

        });

    };

    var _scaleImage = function( scale ){

        scale = _preciseDecimal( parseFloat( scale, 10 ) );

        if( isNaN( scale ) || scale <= 0 || scale > 5 ){
            return false;
        }

        $( 'img', zone )
            .width( parseInt( scale * wz.app.storage('file').metadata.exif.imageWidth, 10 ) )
            .height( parseInt( scale * wz.app.storage('file').metadata.exif.imageHeight, 10 ) );

        wz.app.storage( 'scale', scale );

        _marginImage();
        _detectCursor();

    };

    var _scalePdf = function( scale ){

        scale = _preciseDecimal( parseFloat( scale, 10 ) );

        if( isNaN( scale ) || scale <= 0 || scale > 5 ){
            return false;
        }

        $( 'img', zone )
            .width( function(){
                return parseInt( scale * this.naturalWidth, 10 );
            });

        wz.app.storage( 'scale', scale );

        _detectPage();

    };

    var _marginImage = function(){

        var img   = $( 'img', zone );
        var scale = ( zone.height() - img.height() ) / 2;

        img.css( 'margin-top', scale > 0 ? scale : 0 );

    };

    var _scaleButton = function( dir ){

        if( wz.app.storage('zoom') === -1 ){

            var i = 0;
            var j = validZoom.length;

            if( dir > 0 ){

                for( i = 0; i < j; i++ ){
                    if( validZoom[ i ] > wz.app.storage('scale') ) break;
                }

            }else{

                for( i = 0; i < j; i++ ){
                    if( validZoom[ i ] <= wz.app.storage('scale') && validZoom[ i + 1 ] > wz.app.storage('scale') ) break;
                }

                if( validZoom[ i ] === wz.app.storage('scale') && validZoom[ i - 1 ] ){
                    i--;
                }

                if( i >= validZoom.length ){
                    i = validZoom.length - 2;
                }

            }

            wz.app.storage( 'zoom', i );

            if( wz.app.storage('mode') ){
                _scalePdf( validZoom[ wz.app.storage('zoom') ] );
            }else{
                _scaleImage( validZoom[ wz.app.storage('zoom') ] );
            }

            zoom.val( _preciseDecimal( wz.app.storage('scale') * 100 ) );

        }else if( validZoom[ wz.app.storage('zoom') + dir ] && wz.app.storage('mode') ){

            var newZoom  = wz.app.storage('zoom') + dir;
            var winScale = _preciseDecimal( ( zone.width() / $( 'img:first', zone )[ 0 ].naturalWidth ) ) * 100;

            if( dir > 0 && validZoom[ wz.app.storage('zoom') ] < winScale && validZoom[ newZoom ] > winScale ){

                wz.app.storage( 'zoom', -1 );
                newZoom = winScale;

            }else if( dir < 0 && validZoom[ wz.app.storage('zoom') ] > winScale && validZoom[ newZoom ] < winScale ){

                wz.app.storage( 'zoom', -1 );
                newZoom = winScale;

            }else{

                wz.app.storage( 'zoom', newZoom );
                newZoom = validZoom[ wz.app.storage('zoom') ];

            }

            _scalePdf( newZoom );

            zoom.val( _preciseDecimal( wz.app.storage('scale') * 100 ) );

        }else if( validZoom[ wz.app.storage('zoom') + dir ] ){

            var newZoom  = wz.app.storage('zoom') + dir;
            var winScale = 0;

            if( wz.app.storage('horizontal') ){
                winScale = zone.width() / wz.app.storage('file').metadata.exif.imageWidth;
            }else{
                winScale = zone.height() / wz.app.storage('file').metadata.exif.imageHeight;
            }

            if( dir > 0 && validZoom[ wz.app.storage('zoom') ] < winScale && validZoom[ newZoom ] >= winScale ){

                wz.app.storage( 'zoom', -1 );
                newZoom = winScale;

            }else if( dir < 0 && validZoom[ wz.app.storage('zoom') ] > winScale && validZoom[ newZoom ] < winScale ){

                wz.app.storage( 'zoom', -1 );
                newZoom = winScale;

            }else{

                wz.app.storage( 'zoom', newZoom );
                newZoom = validZoom[ wz.app.storage('zoom') ];

            }

            _scaleImage( newZoom );

            zoom.val( _preciseDecimal( wz.app.storage('scale') * 100 ) );

        }

    };

    var _detectPage = function(){

        var counter = 0;
        var images  = $( 'img', zone );
        var current = images.first();

        $( 'img', zone ).each( function(){

            current = $(this);

            if( ( parseInt( current.position().top, 10 ) + (current.outerHeight( true ) / 2 ) ) > 0 ){
                return false;
            }

        });

        var sidebarPages = $( '.weevisor-sidebar-page', sidebar );
        var tmp          = sidebarPages.filter( '.selected' );

        if( current.index() !== ( tmp.index() - 1 ) ){ // +1/-1 por el prototipo

            tmp.removeClass('selected');
            tmp = sidebarPages.eq( current.index() + 1 ).addClass('selected');

            sidebar
                .stop()
                .clearQueue()
                .animate( { scrollTop : tmp[ 0 ].offsetTop - parseInt( tmp.css('margin-top'), 10 ) }, 250 );

        }

    };

    var _toggleSidebar = function(){

        if( win.hasClass('sidebar') ){

            sidebar.css( 'display', 'none' );
            zone.css('width', '+=' + sidebar.width() );
            win.removeClass('sidebar');

        }else{

            sidebar.css( 'display', 'block' );
            zone.css('width', '-=' + sidebar.width() );
            win.addClass('sidebar');

        }

    };

    var _detectCursor = function(){

        var img = $( 'img', zone );

        if( img.height() <= zone.height() && img.width() <= zone.width() ){
            zone.addClass('hide-hand');
        }else{
            zone.removeClass('hide-hand');
        }

    };

    var _inversePage = function(){
        $( '.weevisor-sidebar-page.selected', sidebar ).trigger( 'click', true );
    };

// Events
    win
    .on( 'ui-view-resize ui-view-maximize ui-view-unmaximize', function(){

        if( wz.app.storage('mode') ){
            _inversePage();
        }else{
            _marginImage();
        }

    });

    sidebar
    .on( 'click', '.weevisor-sidebar-page', function( e, noAnimate ){

        $(this)
            .addClass('selected')
            .siblings('.selected')
                .removeClass('selected');

        var img = $( 'img', zone ).eq( $(this).index() - 1 );

        zone
            .stop()
            .clearQueue();

        if( noAnimate ){
            zone.scrollTop( img[ 0 ].offsetTop - parseInt( img.css('margin-top') ) );
        }else{
            zone.animate( { scrollTop : img[ 0 ].offsetTop - parseInt( img.css('margin-top') ) }, 250 );
        }

    });

    minus
    .on( 'click', function(){

        var zoom    = wz.app.storage('zoom');
        var scrollX = 0;
        var scrollY = 0;
        var resize  = ( zone[ 0 ].scrollWidth - zone[ 0 ].offsetWidth ) || ( zone[ 0 ].scrollHeight - zone[ 0 ].offsetHeight );

        if( resize ){

            /*
             *
             * Las siguientes variables se han puesto directamente en la fórmula para no declarar variables que solo se usan una vez
             *
             * var posX   = e.clientX - offset.left;
             * var posY   = e.clientY - offset.top - menuHeight;
             *
             * Es la posición del ratón dentro de la zona de la imagen
             *
             */

            var perX = ( zone[ 0 ].scrollLeft + ( zone[ 0 ].offsetWidth / 2 ) ) / zone[ 0 ].scrollWidth;
            var perY = ( zone[ 0 ].scrollTop + ( zone[ 0 ].offsetHeight / 2 ) ) / zone[ 0 ].scrollHeight;

        }

        _scaleButton( -1 );

        // Si no se comprueba el zoom se pueden emular desplazamientos, esto lo previene
        if( zoom !== wz.app.storage('zoom') ){

            if( resize ){

                scrollX = ( zone[ 0 ].scrollWidth * perX ) - ( zone[ 0 ].offsetWidth * perX );
                scrollY = ( zone[ 0 ].scrollHeight * perY ) - ( zone[ 0 ].offsetHeight * perY );

            }

            zone
                .scrollLeft( scrollX )
                .scrollTop( scrollY );

        }

    });

    plus
    .on( 'click', function(){

        var zoom    = wz.app.storage('zoom');
        var scrollX = 0;
        var scrollY = 0;
        var resize  = ( zone[ 0 ].scrollWidth - zone[ 0 ].offsetWidth ) || ( zone[ 0 ].scrollHeight - zone[ 0 ].offsetHeight );

        if( resize || wz.app.storage('zoom') === -1 ){

            /*
             *
             * Las siguientes variables se han puesto directamente en la fórmula para no declarar variables que solo se usan una vez
             *
             * var posX   = e.clientX - offset.left;
             * var posY   = e.clientY - offset.top - menuHeight;
             *
             * Es la posición del ratón dentro de la zona de la imagen
             *
             */

            var perX = ( zone[ 0 ].scrollLeft + ( zone[ 0 ].offsetWidth / 2 ) ) / zone[ 0 ].scrollWidth;
            var perY = ( zone[ 0 ].scrollTop + ( zone[ 0 ].offsetHeight / 2 ) ) / zone[ 0 ].scrollHeight;

        }

        _scaleButton( 1 );

        // Si no se comprueba el zoom se pueden emular desplazamientos, esto lo previene
        if( zoom !== wz.app.storage('zoom') ){

            if( resize || zoom === -1 ){

                scrollX = ( zone[ 0 ].scrollWidth * perX ) - ( zone[ 0 ].offsetWidth * perX );
                scrollY = ( zone[ 0 ].scrollHeight * perY ) - ( zone[ 0 ].offsetHeight * perY );

            }

            zone
                .scrollLeft( scrollX )
                .scrollTop( scrollY );

        }

    });

    toggle
    .on( 'click', function(){
        _toggleSidebar();
    });

    zoom
    .on( 'change', function(){

        var value = _preciseDecimal( zoom.val() / 100 );

        wz.app.storage( 'zoom', -1 );

        if( wz.app.storage('mode') ){
            _scalePdf( value );
        }else{
            _scaleImage( value );
        }

        zoom
            .val( _preciseDecimal( wz.app.storage('scale') * 100 ) )
            .blur(); // To Do -> Provoca que se vuelva a invocar el evento al dar a intro

    });

    win
    .key( 'numadd', function(){
        plus.click();
    })

    .key( 'numsubtract', function(){
        minus.click();
    });

    if( wz.app.storage('mode') ){

        zone
        .on( 'mousewheel', function(){
            _detectPage();
        });

    }else{

        zone
        .on( 'mousewheel', function( e, d, x, y ){

            var zoom    = wz.app.storage('zoom');
            var scrollX = 0;
            var scrollY = 0;
            var resize  = ( this.scrollWidth - this.offsetWidth ) || ( this.scrollHeight - this.offsetHeight );

            if( resize || wz.app.storage('zoom') === -1 ){

                /*
                 *
                 * Las siguientes variables se han puesto directamente en la fórmula para no declarar variables que solo se usan una vez
                 *
                 * var posX   = e.clientX - offset.left;
                 * var posY   = e.clientY - offset.top - menuHeight;
                 *
                 * Es la posición del ratón dentro de la zona de la imagen
                 *
                 */

                var offset = win.offset();
                var perX   = ( this.scrollLeft + ( e.clientX - offset.left ) ) / this.scrollWidth;
                var perY   = ( this.scrollTop + ( e.clientY - offset.top - menuHeight ) ) / this.scrollHeight;

            }

            if( y < 0 ){
                _scaleButton( -1 );
            }else if( y > 0 ){
                _scaleButton( 1 );
            }

            // Si no se comprueba el zoom se pueden emular desplazamientos, esto lo previene
            if( zoom !== wz.app.storage('zoom') ){

                if( resize || zoom === -1 ){

                    scrollX = ( this.scrollWidth * perX ) - ( this.offsetWidth * perX );
                    scrollY = ( this.scrollHeight * perY ) - ( this.offsetHeight * perY );

                }

                $(this)
                    .scrollLeft( scrollX )
                    .scrollTop( scrollY );

            }

        });

    }

// Start load
    win.deskitemX( parseInt( ( wz.tool.desktopWidth() - win.width() ) / 2, 10 ) );
    win.deskitemY( parseInt( ( wz.tool.desktopHeight() - win.height() ) / 2, 10 ) );

    if( wz.app.storage('mode') ){
        _loadPdf( wz.app.storage('file') );
    }else{
        _loadImage( wz.app.storage('file') );
    }



/* fullscreen mode */

var toggleFullscreen = function(){

    if( win.hasClass( 'fullscreen' ) ){

        wz.tool.exitFullscreen();


    }else{

        if( win[ 0 ].requestFullScreen ){
            win[ 0 ].requestFullScreen();
        }else if( win[ 0 ].webkitRequestFullScreen ){
            win[ 0 ].webkitRequestFullScreen();
        }else if( win[ 0 ].mozRequestFullScreen ){
            win[ 0 ].mozRequestFullScreen();
        }else{
            alert( lang.fullscreenSupport );
        }

        normalWidth  = win.width();
        normalHeight = win.height();
    }

};

var showControls = function(){

    uiBarTop.stop().clearQueue();
    //win.removeClass( 'hidden-controls' );
    // uiBarTop.css( 'top', 0 );
    uiBarTop.css( 'display', 'block' );

};

var hideControls = function(){

    uiBarTop.stop().clearQueue();
    //win.addClass( 'hidden-controls' );
    //uiBarTop.css( 'top' , -1 * uiBarTop.height() );
    uiBarTop.css( 'display' , 'none' );

};

win
.on( 'click', '.wz-view-fullscreen', function(){
    toggleFullscreen();
})

.on( 'click', '.wz-view-minimize', function(){

    if( win.hasClass('fullscreen') ){
        toggleFullscreen();
    }

})

.on( 'enterfullscreen', function(){

    win.addClass('fullscreen');

    win.css( 'width', screen.width );
    win.css( 'height', screen.height );

    $('.weevisor-sidebar').hide();
    hideControls();

    if( pdfMode ){

      var zoomWidth = screen.width / pdfSize[0] ;
      var zoomHeight = screen.height / pdfSize[1] ;

      console.log(pdfSize);
      if( zoomWidth < zoomHeight ){

        console.log('width ' + zoomWidth );
        _scalePdf( zoomWidth );
        var margins = parseInt( ( screen.height - $('.weevisor-images').find('img')[0].height ) / 2 );
        console.log(margins);
        $('.weevisor-images').find('img').css( { "margin-top": margins + 'px' , "margin-bottom": margins + 'px' } );

      }else{

        console.log('height ' +  zoomHeight );
        _scalePdf(zoomHeight );

      }

      zone.scrollTop( 0 );

    }else{

      _scaleImage( screen.width / parseInt( imageLoaded.metadata.exif.imageWidth, 10 ) );
      zoom.val( _preciseDecimal( screen.width / parseInt( imageLoaded.metadata.exif.imageWidth, 10 ) * 100 ) );
      console.log(zoom.val());

    }

})

.on( 'exitfullscreen', function(){

    win.removeClass('fullscreen');

    win.css( 'width', normalWidth );
    win.css( 'height', normalHeight );

    $('.weevisor-sidebar').show();
    showControls();

    if( pdfMode ){

      _scalePdf(0.29);
      $('.weevisor-images').find('img').css( { "margin-top": 12 + 'px' , "margin-bottom": 0 + 'px' } );

    }else{

      _scaleImage( normalWidth / parseInt( imageLoaded.metadata.exif.imageWidth, 10 ) );
      zoom.val( _preciseDecimal( normalWidth / parseInt( imageLoaded.metadata.exif.imageWidth, 10 ) * 100 ) );
      console.log(zoom.val());

    }

})

.on( 'ui-view-maximize', function(){
    win.addClass( 'maximized' );
})

.on( 'ui-view-unmaximize', function(){
    win.removeClass( 'maximized' );
})

.on( 'mousemove', function( e ){

    if( e.clientX !== prevClientX || e.clientY !== prevClientY ){

        prevClientX = e.clientX;
        prevClientY = e.clientY;

        clearTimeout( 0 );

    }

})

.key( 'left, pageup', function(){

  var sidebarArray = $('.weevisor-sidebar-page');
  var itemSelected = $('.weevisor-sidebar-page.selected');
  var positionSelected = parseInt( itemSelected.children('span').text() );

  if (positionSelected > 1 ){

    var prevItem = sidebarArray.eq( positionSelected - 1 );
    itemSelected.removeClass('selected');
    prevItem.addClass('selected');

    var img = $( 'img', zone ).eq( prevItem.index() - 1 );
    //zone.animate( { scrollTop : img[ 0 ].offsetTop - parseInt( img.css('margin-top') ) }, 250 );
    zone.scrollTop( img[ 0 ].offsetTop - parseInt( img.css('margin-top') ) );

    var tmp = $( '.weevisor-sidebar-page.selected');
    sidebar
        .stop()
        .clearQueue()
        .animate( { scrollTop : tmp[ 0 ].offsetTop - parseInt( tmp.css('margin-top'), 10 ) }, 250 );

  }

})

.key( 'right, pagedown', function(){

  var sidebarArray = $('.weevisor-sidebar-page');
  var itemSelected = $('.weevisor-sidebar-page.selected');
  var positionSelected = parseInt( itemSelected.children('span').text() );

  if (positionSelected < sidebarArray.length - 1 ){

    var nextItem = sidebarArray.eq( positionSelected + 1 );
    itemSelected.removeClass('selected');
    nextItem.addClass('selected');

    var img = $( 'img', zone ).eq( nextItem.index() - 1 );
    //zone.animate( { scrollTop : img[ 0 ].offsetTop - parseInt( img.css('margin-top') ) }, 250 );
    zone.scrollTop( img[ 0 ].offsetTop - parseInt( img.css('margin-top') ) );

    var tmp = $( '.weevisor-sidebar-page.selected');
    sidebar
        .stop()
        .clearQueue()
        .animate( { scrollTop : tmp[ 0 ].offsetTop - parseInt( tmp.css('margin-top'), 10 ) }, 250 );
  }

})

.key( 'f5' , function(e){

  if( !win.hasClass( 'fullscreen' ) && pdfMode ){
    toggleFullscreen();
    e.preventDefault();
  }

})

.key( 'esc' , function(e){

  if( win.hasClass( 'fullscreen' ) && pdfMode ){
    toggleFullscreen();
    e.preventDefault();
  }

})

.key( 'b' , function(e){

  if( win.hasClass( 'fullscreen' ) && pdfMode ){
    toggleFullscreen();
    e.preventDefault();
  }

});
