
// Constan

// Local variables
var win      = $( this );
var header   = $('.wz-ui-header');
var uiImages = $('.weevisor-images');
var view_margin = 50;

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

        win
            .addClass('pdf')
            .addClass('sidebar');

        var dimensions  = structure.metadata.pdf.pageSize.split(' ');
        console.log(dimensions);
        var width       = parseInt( dimensions[0], 10 );
        var height      = parseInt( dimensions[2], 10 );
        var widthRatio  = width / ( wz.tool.desktopWidth() - ( view_margin * 2 ) );
        var heightRatio = height / ( wz.tool.desktopHeight() - ( view_margin * 2 ) );

        if( widthRatio > 1 || heightRatio > 1 ){

          if( widthRatio >= heightRatio ){

              width  = wz.tool.desktopWidth() - ( view_margin * 2 );
              height = height / widthRatio;

          }else{

              width  = width / heightRatio;
              height = wz.tool.desktopHeight() - ( view_margin * 2 );

          }

        }

        if( location.host.indexOf('file') === -1 ){

          win.css({
            'width'   : width + 'px',
            'height'  : height + 'px'
          });

          //wz.fit( win, 775 - win.width(), 500 - win.height() );
        }

      // Si es una imagen
      }

      wz.app.storage( 'file', structure );
      wz.app.storage( 'zoom', -1 );

      start();

    });

}
