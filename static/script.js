
// Variables
var win                 = $( this );
var minus               = $( '.zoom-minus', win );
var plus                = $( '.zoom-plus', win );
var sidebar             = $( '.weevisor-sidebar', win );
var thumb               = $( '.weevisor-sidebar-page.wz-prototype', win );
var toggle              = $( '.weevisor-sidebar-button', win );
var zone                = $( '.weevisor-images', win );
var zoom                = $( '.weevisor-zoom', win );
var uiBarTop            = $( '.ui-header', win );
var adjustVerticalBtn   = $( '.adjust-vertical', win );
var adjustHorizontalBtn = $( '.adjust-horizontal', win );
var marginTop           = 12;
var isWebKit            = /webkit/i.test( navigator.userAgent );
var prevClientX         = 0;
var prevClientY         = 0;
var hideControlsTimer   = 0;
var normalWidth         = 0;
var normalHeight        = 0;
var pdfMode             = false;
var pdfSize             = [];
var fileLoaded          = null;
var appliedZoom         = null;
var appliedScale        = null;
var adjustVertical      = true;
var adjustHorizontal    = false;
var nImages             = 0;


var menuHeight = $( '.wz-view-menu', win ).outerHeight();

// Valid zoom
var validZoom = [ 0.01, 0.02, 0.03, 0.04, 0.06, 0.08, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5 ];

// Private Methods
var _startApp = function(){

  if( params && params.command === 'openFile' ){

      // To Do -> Error

      wz.fs( params.data, function( error, structure ){

        console.log( structure );
        $( '.ui-header-brand span', win ).text( structure.name );
        var dimensions  = structure.metadata.pdf.pageSize.split(' ');
        pdfSize.push( parseInt( dimensions[0] , 10 ) , parseInt( dimensions[2] , 10 ) );
        fileLoaded = structure;
        appliedZoom = -1;

        if( parseInt( dimensions[0], 10 ) < parseInt( dimensions[2], 10 ) ){

          $('.adjust-vertical').removeClass('active');
          $('.adjust-horizontal').addClass('active');
          adjustVertical = !adjustVertical;
          adjustHorizontal = !adjustHorizontal;
          zone.removeClass('page');

        }

        _loadPdf( fileLoaded );

      });

  }

}

var _scaleWindow = function(){

  var zWidth = zone.width();
  var zHeight = zone.height() - marginTop*2;
  var scale = null;
  var scaleWidth = zWidth / pdfSize[0];
  var scaleHeight = zHeight / pdfSize[1];

  var fullZoneHeight = $('.weevisor-images img').outerHeight(true) * nImages;
  var zonePercentage = zone.scrollTop() / fullZoneHeight;

  //console.log( zWidth, zHeight, scaleWidth, scaleHeight );

  if( scaleWidth >= scaleHeight && !adjustHorizontal ){
    scale = scaleHeight;
  }else{
    scale = scaleWidth;
  }

  if( scale != appliedScale ){
    _scalePdf(scale);
    var fullZoneHeight2 = $('.weevisor-images img').outerHeight(true) * nImages;
    zone.scrollTop( zonePercentage * fullZoneHeight2 );
  }

}

var _preciseDecimal = function( number ){
    return parseFloat( number.toFixed( 2 ) );
};

var _loadPdf = function( file ){

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

    var k = null;
    nImages = images.length;

    for( var i = 0; i < nImages; i++ ){

        zone.append( $( '<img />').attr( 'src', images[ i ] ) );

        k = thumb.clone().removeClass('wz-prototype');

        k.find('img').attr( 'src', images[ i ] );
        k.find('span').text( i + 1 );

        sidebar.append( k );

    }

    /*var zWidth = zone.width();
    var zHeight = zone.height() - marginTop;
    var scale = null;
    var scaleWidth = zWidth / pdfSize[0];
    var scaleHeight = zHeight / pdfSize[1];

    console.log( zWidth, zHeight, scaleWidth, scaleHeight );

    if( scaleWidth >= scaleHeight ){
      scale = scaleHeight;
    }else{
      scale = scaleWidth;
    }

    console.log(pdfSize, scale);
    _scalePdf(scale);*/

    $('.weevisor-images img:last').css('margin-bottom', '12px');
    _scaleWindow();

};

var _scalePdf = function( scale ){

    scale = _preciseDecimal( parseFloat( scale, 10 ) );

    if( isNaN( scale ) || scale <= 0 || scale > 5 ){
        return false;
    }

    var fullZoneHeight = $('.weevisor-images img').outerHeight(true) * nImages;
    var zonePercentage = $('.weevisor-images').scrollTop() / fullZoneHeight;

    $( 'img', zone )
        .width( parseInt( scale * pdfSize[0] , 10 ) );

    appliedScale = scale;

    var fullZoneHeight2 = $('.weevisor-images img').outerHeight(true) * nImages;
    zone.scrollTop( zonePercentage * fullZoneHeight2 );
    _detectPage();

};

var _scaleButton = function( dir ){

    adjustVertical = false;
    adjustHorizontal = false;
    zone.removeClass('page');
    adjustVerticalBtn.removeClass('active');
    adjustHorizontalBtn.removeClass('active');

    if( appliedZoom === -1 ){

        var i = 0;
        var j = validZoom.length;

        if( dir > 0 ){

            for( i = 0; i < j; i++ ){
                if( validZoom[ i ] > appliedScale ) break;
            }

        }else{

            for( i = 0; i < j; i++ ){
                if( validZoom[ i ] <= appliedScale && validZoom[ i + 1 ] > appliedScale ) break;
            }

            if( validZoom[ i ] === appliedScale && validZoom[ i - 1 ] ){
                i--;
            }

            if( i >= validZoom.length ){
                i = validZoom.length - 2;
            }

        }

        appliedZoom = i;
        _scalePdf( validZoom[ appliedZoom ] );
        zoom.val( _preciseDecimal( appliedScale * 100 ) );

    }else if( validZoom[ appliedZoom + dir ] ){

        var newZoom  = appliedZoom + dir;
        var winScale = _preciseDecimal( ( zone.width() / $( 'img:first', zone )[ 0 ].naturalWidth ) ) * 100;

        if( dir > 0 && validZoom[ appliedZoom ] < winScale && validZoom[ newZoom ] > winScale ){

            appliedZoom = -1;
            newZoom = winScale;

        }else if( dir < 0 && validZoom[ appliedZoom ] > winScale && validZoom[ newZoom ] < winScale ){

            appliedZoom = -1;
            newZoom = winScale;

        }else{

            appliedZoom = newZoom;
            newZoom = validZoom[ appliedZoom ];

        }

        _scalePdf( newZoom );
        zoom.val( _preciseDecimal( appliedScale * 100 ) );

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
        console.log(current.index() + 1);
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
        win.removeClass('sidebar');

    }else{

        sidebar.css( 'display', 'block' );
        win.addClass('sidebar');

    }

    if ( adjustVertical || adjustHorizontal ){
      _scaleWindow();
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

    var zoom    = appliedZoom;
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
    /*if( zoom !== appliedZoom ){

        if( resize ){

            scrollX = ( zone[ 0 ].scrollWidth * perX ) - ( zone[ 0 ].offsetWidth * perX );
            scrollY = ( zone[ 0 ].scrollHeight * perY ) - ( zone[ 0 ].offsetHeight * perY );

        }

        zone
            .scrollLeft( scrollX )
            .scrollTop( scrollY );

    }*/

});

plus
.on( 'click', function(){

    var zoom    = appliedZoom;
    var scrollX = 0;
    var scrollY = 0;
    var resize  = ( zone[ 0 ].scrollWidth - zone[ 0 ].offsetWidth ) || ( zone[ 0 ].scrollHeight - zone[ 0 ].offsetHeight );

    if( resize || appliedZoom === -1 ){

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
    /*if( zoom !== appliedZoom ){

        if( resize || zoom === -1 ){

            scrollX = ( zone[ 0 ].scrollWidth * perX ) - ( zone[ 0 ].offsetWidth * perX );
            scrollY = ( zone[ 0 ].scrollHeight * perY ) - ( zone[ 0 ].offsetHeight * perY );

        }

        zone
            .scrollLeft( scrollX )
            .scrollTop( scrollY );

    }*/

});

toggle
.on( 'click', function(){
    _toggleSidebar();
});

zoom
.on( 'change', function(){

    var value = _preciseDecimal( zoom.val() / 100 );

    appliedZoom = -1;
    _scalePdf( value );

    zoom
        .val( _preciseDecimal( appliedScale * 100 ) )
        .blur(); // To Do -> Provoca que se vuelva a invocar el evento al dar a intro

});

win
.key( 'numadd', function(){
    plus.click();
})

.key( 'numsubtract', function(){
    minus.click();
});

zone.on( 'mousewheel', function(){
  _detectPage();
});


// Start load
if( location.host.indexOf('file') === -1 ){

  win.deskitemX( parseInt( ( wz.tool.desktopWidth() - win.width() ) / 2, 10 ) );
  win.deskitemY( parseInt( ( wz.tool.desktopHeight() - win.height() ) / 2, 10 ) );

}else{
  wz.app.maximizeView( win );
}

_startApp();

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
    uiBarTop.css( 'display', 'block' );

};

var hideControls = function(){

    uiBarTop.stop().clearQueue();
    uiBarTop.css( 'display' , 'none' );

};

win
.on( 'click', '.ui-fullscreen', function(e){
    toggleFullscreen();
    e.stopPropagation();
})

.on( 'click', '.wz-view-minimize', function(){

    if( win.hasClass('fullscreen') ){
        toggleFullscreen();
    }

})

.on( 'click' , '.adjust-vertical', function(){

  adjustVertical = !adjustVertical;

  if( adjustVertical && adjustHorizontal ){

    adjustHorizontal = !adjustHorizontal;
    adjustHorizontalBtn.removeClass('active');
    zone.addClass('page');
    $(this).addClass('active');

  }else if( !adjustVertical ){

    zone.removeClass('page');
    $(this).removeClass('active');

  }else{
    $(this).addClass('active');
  }

  if( adjustVertical || adjustHorizontal ){
    _scaleWindow();
  }

})

.on( 'click' , '.adjust-horizontal', function(){

  adjustHorizontal = !adjustHorizontal;

  if( adjustHorizontal && adjustVertical ){

    adjustVertical = !adjustVertical;
    adjustVerticalBtn.removeClass('active');
    $(this).addClass('active');
    zone.removeClass('page');

  }else if( !adjustHorizontal ){

    zone.addClass('page');
    $(this).removeClass('active');

  }else{
    $(this).addClass('active');
  }

  if( adjustVertical || adjustHorizontal ){
    _scaleWindow();
  }

})

.on( 'ui-view-resize ui-view-resize-end ui-view-maximize ui-view-unmaximize', function(){

  if ( adjustVertical || adjustHorizontal){
    _scaleWindow();
  }

})

.on( 'enterfullscreen', function(){

    win.addClass('fullscreen');

    win.css( 'width', screen.width );
    win.css( 'height', screen.height );

    $('.weevisor-sidebar').hide();
    hideControls();

    var zoomWidth = screen.width / pdfSize[0] ;
    var zoomHeight = screen.height / pdfSize[1] ;
    //console.log(pdfSize);

    if( zoomWidth < zoomHeight ){

      //console.log('width ' + zoomWidth );
      _scalePdf( zoomWidth );
      var margins = parseInt( ( screen.height - $('.weevisor-images').find('img')[0].height ) / 2 );
      //console.log(margins);
      $('.weevisor-images').find('img').css( { "margin-top": margins + 'px' , "margin-bottom": margins + 'px' } );

    }else{

      //console.log('height ' +  zoomHeight );
      _scalePdf( zoomHeight );

    }

    var itemSelected = $('.weevisor-sidebar-page.selected');
    var img = $( 'img', zone ).eq( itemSelected.index() - 1 );
    zone.scrollTop( img[ 0 ].offsetTop - parseInt( img.css('margin-top') ) );

})

.on( 'exitfullscreen', function(){

    win.removeClass('fullscreen');

    win.css( 'width', normalWidth );
    win.css( 'height', normalHeight );

    $('.weevisor-sidebar').show();
    showControls();

    var itemSelected = $('.weevisor-sidebar-page.selected');
    itemSelected.click();

    if( adjustVertical || adjustHorizontal ){
      _scaleWindow();
    }else{
      _scalePdf(0.29);
    }

    /*$('.weevisor-images').find('img').css( { "margin-top": 12 + 'px' , "margin-bottom": 0 + 'px' } );
    var tmp = $( '.weevisor-sidebar-page.selected');
    sidebar
        .stop()
        .clearQueue()
        .animate( { scrollTop : tmp[ 0 ].offsetTop - parseInt( tmp.css('margin-top'), 10 ) }, 250 );*/

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

/*.on( 'ui-drag-move wz-drag-move wz-drag ui-drag wz-scroll-drag ui-scroll-drag', function(){
  console.log('drag');
  _detectPage();
})*/

.key( 'left, pageup', function(){

  var sidebarArray = $('.weevisor-sidebar-page');
  var itemSelected = $('.weevisor-sidebar-page.selected');
  var positionSelected = parseInt( itemSelected.children('span').text() );

  if ( positionSelected > 1 ){

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

  if( !win.hasClass( 'fullscreen' ) ){
    toggleFullscreen();
  }

  e.preventDefault();

})

.key( 'esc, b' , function(e){

  if( win.hasClass( 'fullscreen' ) ){
    toggleFullscreen();
    e.preventDefault();
  }

});
