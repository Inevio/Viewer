
// App = This
    var app = this;

// Load structure
    wz.structure( params[ 0 ], function( error, structure ){

        if( structure.mime === 'application/pdf' ){

            /*
            win
                .addClass('pdf')
                .width( 775 )
                .height( 500 );
            */

        }else{

            var scale      = 1;
            var niceLimit  = 100;
            var menuHeight = $( '.wz-win-menu', win ).innerHeight();
            var deskWidth  = wz.tool.desktopWidth();
            var deskHeight = wz.tool.desktopHeight();
            var imgWidth   = structure.metadata.exif.imageWidth;
            var imgHeight  = structure.metadata.exif.imageHeight;
            var horizontal = false;
            
            if( imgHeight > ( deskHeight - niceLimit - menuHeight ) ){
                console.log( 1 );
                scale = ( deskHeight - niceLimit - menuHeight ) / imgHeight;
            }

            console.log( imgWidth, deskWidth, niceLimit );

            if( imgWidth > deskWidth - niceLimit ){

                console.log( 2 );
                
                var tmpscale = ( deskWidth - niceLimit ) / imgWidth;
                
                if( tmpscale < scale ){

                    console.log( 3 );

                    scale      = tmpscale;
                    horizontal = true;

                }
                
            }

            wz.fit( win, ( imgWidth * scale ) - win.width(), ( imgHeight * scale ) - win.height() );

            app.horizontal = horizontal;
                
        }

        app.file = structure;

        start();

    });
