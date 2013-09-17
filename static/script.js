// App = This
    var app = this;

// Variables
    var minus   = $( '.weevisor-zoom-minus', win );
    var plus    = $( '.weevisor-zoom-plus', win );
    var sidebar = $( '.weevisor-sidebar', win );
    var thumb   = $( '.weevisor-sidebar-page.wz-prototype', win );
    var toggle  = $( '.weevisor-sidebar-button', win );
    var zone    = $( '.weevisor-images', win );
    var zoom    = $( '.weevisor-zoom', win );

    var menuHeight = $( '.wz-win-menu', win ).outerHeight();

// Valid zoom
    var validZoom = [ 1, 2, 3, 4, 6, 8, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300, 400, 500 ];

// Private Methods
    var _preciseDecimal = function( number ){
        return parseFloat( number.toFixed( 2 ) );
    };

    var _loadImage = function( file ){

        $( '<img />')
            .attr( 'src', file.thumbnails.original )
            .appendTo( zone )
            .on( 'load', function(){
                _marginImage();
            });

            if( app.horizontal ){
                app.scale = _preciseDecimal( zone.width() / file.metadata.exif.imageWidth );
            }else{
                app.scale = _preciseDecimal( zone.height() / file.metadata.exif.imageHeight );
            }

            _scaleImage( _preciseDecimal( app.scale * 100 ) );
            zoom.val( _preciseDecimal( app.scale * 100 ) );

    };

    var _loadPdf = function( file ){

        var images = [];

        if( $.isArray( file.formats.jpeg ) ){

            for( var i in file.formats.jpeg ){
                images.push( file.formats.jpeg[ i ].url );
            }

        }else{
            images.push( file.formats.jpeg.url );
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

            app.scale = _preciseDecimal( s / this.naturalWidth );

            _detectPage();
            zoom.val( _preciseDecimal( app.scale * 100 ) );

        });

    };

    var _scaleImage = function( scale ){

        scale = parseInt( scale, 10 );

        if( isNaN( scale ) || scale <= 0 || scale > 500 ){
            return false;
        }

        app.scale = _preciseDecimal( scale / 100 );

        if( app.horizontal ){
            $( 'img', zone ).width( parseInt( app.scale * app.file.metadata.exif.imageWidth, 10 ) );
        }else{
            $( 'img', zone ).height( parseInt( app.scale * app.file.metadata.exif.imageHeight, 10 ) );
        }

        _marginImage();

    };

    var _scalePdf = function( scale ){
        
        scale = parseInt( scale, 10 );

        if( isNaN( scale ) || scale <= 0 || scale > 500 ){
            return false;
        }

        app.scale = _preciseDecimal( scale / 100 );

        $( 'img', zone ).width( function(){
            return parseInt( app.scale * this.naturalWidth, 10 );
        });

        _detectPage()
        
    };

    var _marginImage = function(){

        var img   = $( 'img', zone );
        var scale = ( zone.height() - img.height() ) / 2;

        img.css( 'margin-top', scale > 0 ? scale : 0 );

    };

    var _scaleButton = function( dir ){

        if( app.zoom === -1 ){
            
            var i = 0;
            var j = validZoom.length;

            if( dir > 0 ){
                
                for( i = 0; i < j; i++ ){
                    if( validZoom[ i ] > ( app.scale * 100 ) ) break;
                }

            }else{

                for( i = 0; i < j; i++ ){
                    if( validZoom[ i ] < ( app.scale * 100 ) && validZoom[ i + 1 ] > ( app.scale * 100 ) ) break;
                }

            }

            app.zoom = i;

            if( app.mode ){
                _scalePdf( validZoom[ app.zoom ] );
            }else{
                _scaleImage( validZoom[ app.zoom ] );
            }

            zoom.val( _preciseDecimal( app.scale * 100 ) );

        }else if( validZoom[ app.zoom + dir ] && app.mode ){

            var newZoom  = app.zoom + dir;
            var winScale = _preciseDecimal( ( zone.width() / $( 'img:first', zone )[ 0 ].naturalWidth ) ) * 100;

            if( dir > 0 && validZoom[ app.zoom ] < winScale && validZoom[ newZoom ] > winScale ){

                app.zoom = -1;
                newZoom  = winScale;

            }else if( dir < 0 && validZoom[ app.zoom ] > winScale && validZoom[ newZoom ] < winScale ){

                app.zoom = -1;
                newZoom  = winScale;

            }else{

                app.zoom = newZoom;
                newZoom  = validZoom[ app.zoom ];

            }

            _scalePdf( newZoom );

            zoom.val( _preciseDecimal( app.scale * 100 ) );

        }else if( validZoom[ app.zoom + dir ] ){

            var newZoom  = app.zoom + dir;
            var winScale = 0;

            if( app.horizontal ){
                winScale = _preciseDecimal( ( zone.width() / app.file.metadata.exif.imageWidth ) * 100 );
            }else{
                winScale = _preciseDecimal( ( zone.height() / app.file.metadata.exif.imageHeight ) * 100 );
            }

            if( dir > 0 && validZoom[ app.zoom ] < winScale && validZoom[ newZoom ] > winScale ){

                app.zoom = -1;
                newZoom  = winScale;

            }else if( dir < 0 && validZoom[ app.zoom ] > winScale && validZoom[ newZoom ] < winScale ){

                app.zoom = -1;
                newZoom  = winScale;

            }else{

                app.zoom = newZoom;
                newZoom  = validZoom[ app.zoom ];

            }

            _scaleImage( newZoom );

            zoom.val( _preciseDecimal( app.scale * 100 ) );

        }

    };

    var _detectPage = function(){

        var counter = 0;
        var images  = $( 'img', zone );
        var current = images.first();

        $( 'img', zone ).each( function(){

            current = $(this);

            if( counter + ( current.outerHeight( true ) / 2 ) > zone[ 0 ].scrollTop ){
                return false;
            }

            counter += current.outerHeight( true );

        });

        current = $( current );

        var sidebarPages = $( '.weevisor-sidebar-page', sidebar );
        var tmp          = sidebarPages.filter( '.selected' );

        if( tmp.index() === -1 || current.index() !== ( tmp.index() + 1 ) ){ // +1 por el prototipo

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

// Events
    win
    .on( 'wz-resize wz-maximize wz-unmaximize', function(){

        if( !app.mode ){
            _marginImage();
        }

    });

    sidebar
    .on( 'click', '.weevisor-sidebar-page', function(){

        $(this)
            .addClass('selected')
            .siblings('.selected')
                .removeClass('selected');

        var img = $( 'img', zone ).eq( $(this).index() - 1 );

        zone
            .stop()
            .clearQueue()
            .animate( { scrollTop : img[ 0 ].offsetTop - parseInt( img.css('margin-top') ) }, 250 );

    });

    minus
    .on( 'click', function(){
        _scaleButton( -1 );
    });

    plus
    .on( 'click', function(){
        _scaleButton( 1 );
    });

    toggle
    .on( 'click', function(){
        _toggleSidebar();
    });

    zoom
    .on( 'change', function(){

        _scaleImage( zoom.val() );

        zoom
            .val( _preciseDecimal( app.scale * 100 ) )
            .blur(); // To Do -> Provoca que se vuelva a invocar el evento al dar a intro

    });

    if( app.mode ){

        zone
        .on( 'mousewheel', function(){
            _detectPage();
        });

    }else{

        zone
        .on( 'mousewheel', function( e, d, x, y ){

            var zoom    = app.zoom;
            var scrollX = 0;
            var scrollY = 0;
            var resize  = ( this.scrollWidth - this.offsetWidth ) || ( this.scrollHeight - this.offsetHeight );

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
            if( zoom !== app.zoom ){

                if( resize ){

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
    if( app.mode ){
        _loadPdf( this.file );
    }else{
        _loadImage( this.file );
    }

});

(function(){ console.log( window );})();

(function(){