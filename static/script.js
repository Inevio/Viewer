// App = This
    var app = this;

// Variables
    var minus = $( '.weevisor-zoom-minus', win );
    var plus  = $( '.weevisor-zoom-plus', win );
    var zone  = $( '.weevisor-images', win );
    var zoom  = $( '.weevisor-zoom', win );

// Valid zoom
    var validZoom = [ 1, 2, 3, 4, 6, 8, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200, 300, 400, 500 ];

// Private Methods
    var _loadImage = function( file ){

        $( '<img />').attr( 'src', file.thumbnails.original ).appendTo( zone );

        if( app.horizontal ){
            app.scale = zone.width() / file.metadata.exif.imageWidth;
        }else{
            app.scale = zone.height() / file.metadata.exif.imageHeight;
        }

        _scaleImage( app.scale * 100 );
        zoom.val( app.scale * 100 );

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

        for( var i in images ){
            zone.append( $( '<img />').attr( 'src', images[ i ] ) );
        }

        console.log( images );

    };

    var _scaleImage = function( scale ){

        scale = parseInt( scale, 10 );

        if( isNaN( scale ) || scale <= 0 || scale > 500 ){
            return false;
        }

        app.scale = scale / 100;

        if( app.horizontal ){
            $( 'img', zone ).width( parseInt( app.scale * app.file.metadata.exif.imageWidth, 10 ) );
        }else{
            $( 'img', zone ).height( parseInt( app.scale * app.file.metadata.exif.imageHeight, 10 ) );
        }

        _marginImage();

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

            _scaleImage( validZoom[ app.zoom ] );
            zoom.val( validZoom[ app.zoom ] );

        }else if( validZoom[ app.zoom + dir ] ){

            var newZoom  = app.zoom + dir;
            var winScale = 0;

            if( app.horizontal ){
                winScale = parseInt( ( zone.width() / app.file.metadata.exif.imageWidth ) * 100, 10 );
            }else{
                winScale = parseInt( ( zone.height() / app.file.metadata.exif.imageHeight ) * 100, 10 );
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
            zoom.val( newZoom );

        }

    };

// Events
    win
    .on( 'wz-resize', function(){
        _marginImage();
    });

    minus
    .on( 'click', function(){
        _scaleButton( -1 );
    });

    plus
    .on( 'click', function(){
        _scaleButton( 1 );
    });

    zoom
    .on( 'change', function(){

        _scaleImage( zoom.val() );

        zoom
            .val( app.scale * 100 )
            .blur(); // To Do -> Provoca que se vuelva a invocar el evento al dar a intro

    });

// Start load
    if( win.hasClass('pdf') ){
        _loadPdf( this.file );
    }else{
        _loadImage( this.file );
    }

/*
    var img     = $( '.weevisor-frame', win );
    var winBar  = $( '.wz-win-menu', win );
    var resize  = 0;

    var loadImage = function( imgWidth, imgHeight ){

        var scale      = 1;
        var niceLimit  = 100;
        
        if( imgHeight > wz.tool.desktopHeight() - niceLimit ){
            scale = ( wz.tool.desktopHeight() - niceLimit ) / imgHeight;
        }

        if( imgWidth > wz.tool.desktopWidth() - niceLimit ){
            
            var tmpscale = ( wz.tool.desktopWidth() - niceLimit ) / imgWidth;
            
            if( tmpscale < scale ){
                scale = tmpscale;
            }
            
        }

        win
            .deskitemX( ( wz.tool.environmentWidth() / 2 ) - ( parseInt( imgWidth * scale, 10 ) / 2 ) - 96 )
            .deskitemY( ( wz.tool.environmentHeight() / 2 ) - ( parseInt( imgHeight * scale, 10 ) / 2 ) )
            .transition({ opacity : 1 }, 400 )
            .animate({

                width  : parseInt( imgWidth * scale, 10 ),
                height : parseInt( imgHeight * scale, 10 ) + winBar.outerHeight()

            }, 250 );

        if( params[1] === 'url' ){

            img
                .css( 'scale', scale )
                .fadeIn();

        }else{

            img
                .on( 'load', function(){

                    img
                        .css( 'scale', scale )
                        .fadeIn();

                });

        }

    };

    win.addClass( 'wz-dragger' );
    win.css( 'opacity', 0 );

    win

    .on( 'app-param', function( error, params ){

        if( params[1] === 'url' ){

            img
                .hide()
                .attr( 'src', params[0] )
                .on( 'load', function(){

                    var imgWidth  = img[ 0 ].naturalWidth;
                    var imgHeight = img[ 0 ].naturalHeight;

                    loadImage( imgWidth, imgHeight );

                });

        }else if( params ){

            wz.structure( params[0], function( error, structure ){

                if( error ){
                    alert( error );
                    return false;
                }

                var imgWidth  = structure.metadata.exif.width;
                var imgHeight = structure.metadata.exif.height;

                img
                    .hide()
                    .attr( 'src', structure.thumbnails.original );

                loadImage( imgWidth, imgHeight );
                
            });

        }
        
    })

    .on( 'wz-resize wz-maximize wz-unmaximize', function(){

        var winWidth  = win.width();
        var winHeight = win.height() - winBar.outerHeight();
        var imgWidth  = img.width();
        var imgHeight = img.height();

        var scale = [ ( winWidth / imgWidth ), ( winHeight / imgHeight ) ].sort()[ 0 ];

        if( scale > 1 ){
            scale = 1;
        }

        imgWidth  = imgWidth * scale;
        imgHeight = imgHeight * scale;

        var marginHorizontal = Math.round( ( winWidth - imgWidth ) / 2, 10 );
        var marginVertical   = Math.round( ( winHeight - imgHeight ) / 2, 10 );

        img.css({

            'margin' : marginVertical + 'px ' + marginHorizontal + 'px',
            'scale'  : scale

        });

    });
*/