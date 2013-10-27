
// App = This
// To Do -> Real var app    var app = this;
var app = {};

var win = $( this );

// Load structure
    wz.structure( params[ 0 ], function( error, structure ){

        // To Do -> Error
        
        $( '.weevisor-title', win ).text( structure.name );

        if( structure.mime === 'application/pdf' ){

            app.mode = 1;

            win
                .addClass('pdf')
                .addClass('sidebar');

            $( '.weevisor-images', win )
                .addClass('wz-scroll')
                .width( '-=' + $( '.weevisor-sidebar', win ).outerWidth() );

            wz.fit( win, 775 - win.width(), 500 - win.height() );

        }else{

            // Modo imagen
            app.mode = 0;
            $( '.weevisor-sidebar', win ).remove();
            var niceLimit = 100;

            // Calculamos a cuanto debe re-escalarse la ventana
            var menuHeight   = $( '.wz-win-menu', win ).outerHeight();
            var deskWidth    = wz.tool.desktopWidth();
            var deskHeight   = wz.tool.desktopHeight();
            var imgWidth     = parseInt( structure.metadata.exif.imageWidth, 10 );
            var imgHeight    = parseInt( structure.metadata.exif.imageHeight, 10 );
            var winMinWidth  = parseInt( win.css( 'min-width' ), 10 );
            var winMinHeight = parseInt( win.css( 'min-height' ), 10 );

            var hasScaleX = imgWidth  > deskWidth  - niceLimit;
            var hasScaleY = imgHeight > deskHeight - niceLimit - menuHeight;

            var newWinWidth  = 0;
            var newWinHeight = 0;

            if( hasScaleX || hasScaleY ){

                var scaleX = ( ( deskWidth  - niceLimit ) / imgWidth ).toFixed( 2 );
                var scaleY = ( ( deskHeight - niceLimit - menuHeight ) / imgHeight ).toFixed( 2 );
                var scale  = 1;

                if( scaleX < scaleY ){

                    scale          = scaleX;
                    app.horizontal = true;

                }else{

                    scale          = scaleY;
                    app.horizontal = false;

                }

                newWinWidth  = Math.ceil( imgWidth * scale );
                newWinHeight = Math.ceil( ( imgHeight * scale ) + menuHeight );

            }else{

                app.horizontal = imgWidth > imgHeight;
                newWinWidth    = imgWidth;
                newWinHeight   = imgHeight + menuHeight;

            }

            if( newWinWidth < winMinWidth ){
                newWinWidth = winMinWidth;
            }

            if( newWinHeight < winMinHeight ){
                newWinHeight = winMinHeight;
            }

            wz.fit( win, newWinWidth - win.width(), newWinHeight - win.height() );
                
        }

        app.file = structure;
        app.zoom = -1;

        start();

    });
