
// App = This
    var app = this;

// Load structure
    wz.structure( params[ 0 ], function( error, structure ){

        if( structure.mime === 'application/pdf' ){

            win
                .addClass('pdf')
                .width( 775 )
                .height( 500 );

        }else{

            var scale      = 1;
            var niceLimit  = 100;
            var menuHeight = $( '.wz-win-menu', win ).innerHeight();
            var deskWidth  = wz.tool.desktopWidth();
            var deskHeight = wz.tool.desktopHeight();
            var imgWidth   = structure.metadata.exif.imageWidth;
            var imgHeight  = structure.metadata.exif.imageHeight;
            var horizontal = false;
            
            if( imgHeight > deskHeight - niceLimit - menuHeight ){                
                scale = ( deskHeight - niceLimit - menuHeight ) / imgHeight;
            }

            if( imgWidth > deskWidth - niceLimit ){
                
                var tmpscale = ( deskWidth - niceLimit ) / imgWidth;
                
                if( tmpscale < scale ){

                    scale      = tmpscale;
                    horizontal = true;

                }
                
            }

            if( horizontal ){
                win.width( parseInt( scale * imgWidth , 10 ) );
            }else{
                win.height( parseInt( scale * imgHeight, 10 ) + menuHeight );
            }

            app.scale      = scale;
            app.horizontal = horizontal;
                
        }

        app.file = structure;

        start();

    });
