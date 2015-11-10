
// Constant
var VIEW_MARGIN = 50;
var MODE_IMAGE = 0;
var MODE_PDF = 1;

// Local variables
var win      = $( this );
var header   = $('.wz-ui-header');
var uiImages = $('.weevisor-images');

// Load structure
if( params && params.command === 'openFile' ){

    // To Do -> Error

    wz.fs( params.data, function( error, structure ){

        $( '.weevisor-title', win ).text( structure.name );

        // Si es un PDF
        if(
            structure.mime === 'application/pdf' ||
            ( structure.formats && structure.formats['pdf'] )
        ){

            wz.app.storage( 'mode', MODE_PDF );

            win
                .addClass('pdf')
                .addClass('sidebar');

            $( '.weevisor-images', win )
                .addClass('wz-scroll')
                .width( '-=' + $( '.weevisor-sidebar', win ).outerWidth() );

            wz.fit( win, 775 - win.width(), 500 - win.height() );

        // Si es una imagen
        }else{

            // Modo imagen
            wz.app.storage( 'mode', MODE_IMAGE );
            $( '.weevisor-sidebar', win ).remove();

            var width       = parseInt( structure.metadata.exif.imageWidth, 10 );
            var height      = parseInt( structure.metadata.exif.imageHeight, 10 );
            var widthRatio  = width / ( wz.tool.desktopWidth() - ( VIEW_MARGIN * 2 ) );
            var heightRatio = height / ( wz.tool.desktopHeight() - ( VIEW_MARGIN * 2 ) );

            if( widthRatio > 1 || heightRatio > 1 ){

                if( widthRatio >= heightRatio ){

                    width  = wz.tool.desktopWidth() - ( VIEW_MARGIN * 2 );
                    height = height / widthRatio;

                }else{

                    width  = width / heightRatio;
                    height = wz.tool.desktopHeight() - ( VIEW_MARGIN * 2 );

                }

            }

            wz.app.storage( 'horizontal', width >= height );
            wz.fit( win, width - uiImages.width(), height - uiImages.height() );

        }

        wz.app.storage( 'file', structure );
        wz.app.storage( 'zoom', -1 );

        start();

    });

}
