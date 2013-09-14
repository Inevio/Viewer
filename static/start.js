
// App = This
    var app = this;

// Load structure
    wz.structure( params[ 0 ], function( error, structure ){

        // To Do -> Error
        
        $( '.weevisor-title', win ).text( structure.name );

        if( structure.mime === 'application/pdf' ){

            app.mode = 1;

            win.addClass('pdf');

            $( '.weevisor-images', win ).width( '-=' + $( '.weevisor-sidebar', win ).outerWidth() );

            wz.fit( win, 775 - win.width(), 500 - win.height() );

        }else{

            app.mode = 0;

            $( '.weevisor-sidebar', win ).remove();

            var menuHeight   = $( '.wz-win-menu', win ).innerHeight();
            var deskWidth    = wz.tool.desktopWidth();
            var deskHeight   = wz.tool.desktopHeight();
            var imgWidth     = structure.metadata.exif.imageWidth;
            var imgHeight    = structure.metadata.exif.imageHeight;
            var winMinWidth  = parseInt( win.css('min-width') );
            var winMinHeight = parseInt( win.css('min-height') );

            var scale      = 1;
            var niceLimit  = 100;
            var horizontal = false;
            
            if( imgHeight > ( deskHeight - niceLimit - menuHeight ) ){
                scale = ( deskHeight - niceLimit - menuHeight ) / imgHeight;
            }

            if( imgWidth > deskWidth - niceLimit ){
                
                var tmpscale = ( deskWidth - niceLimit ) / imgWidth;
                
                if( tmpscale < scale ){

                    scale      = tmpscale;
                    horizontal = true;

                }
                
            }

            var newWidth  = imgWidth * scale;
            var newHeight = imgHeight * scale;

            if( newWidth < winMinWidth ){
                newWidth = winMinWidth;
            }

            if( newHeight < winMinHeight ){
                newHeight = winMinHeight;
            }

            wz.fit( win, newWidth - win.width(), newHeight - win.height() + menuHeight );

            app.horizontal = horizontal;
                
        }

        app.file = structure;
        app.zoom = -1;

        start();

    });
