// Local variables
var win      = $( this );
var header   = $('.wz-ui-header');
var uiImages = $('.weevisor-images');
var sidebarWidth = $('.weevisor-sidebar').outerWidth();
var view_margin = 50;

// Callback
var precalc = function( name ){
  //$( '.weevisor-title', win ).text( name )
}

// Load structure
if( params && params.command === 'openFile' ){

  // To Do -> Error

  /*
  if( params.gdrive ){

    api.integration.gdrive( params.gdrive, function( err, account ){

      account.get( params.id, function( err, data ){
        console.log( params, err, data )
        precalc( data.name )
      })

    })

  }else{

    api.fs( params.data, function( error, fsnode ){
      precalc( fsnode.name )
    })

  }
  */

  win
  .addClass('pdf')
  .addClass('sidebar')
  .addClass('dark')

  if( location.host.indexOf('file') === -1 ){

    var dimensions  = /*structure.metadata ? structure.metadata.pdf.pageSize.split(' ') :*/ [ 630, 0, 891 ];
    var width       = parseInt( dimensions[0], 10 ) + sidebarWidth;
    var height      = parseInt( dimensions[2], 10 ) + header.outerHeight();
    var widthRatio  = width / ( api.tool.desktopWidth() - ( view_margin * 2 ) );
    var heightRatio = height / ( api.tool.desktopHeight() - ( view_margin * 2 ) );

    if( parseInt( dimensions[0], 10 ) >= parseInt( dimensions[2], 10 ) ){

      if( widthRatio > 1 || heightRatio > 1 ){

        if( widthRatio >= heightRatio ){

            width  = api.tool.desktopWidth() - ( view_margin * 2 );
            height = height / widthRatio;

        }else{

            width  = width / heightRatio;
            height = api.tool.desktopHeight() - ( view_margin * 2 );

        }

      }

    }else{

      if( widthRatio > 1 ){

        width = api.tool.desktopWidth() - ( view_margin * 4 );
        height = api.tool.desktopHeight() - ( view_margin * 4 );

      }else{
        height = api.tool.desktopHeight() - ( view_margin * 4 );
      }

    }

    win.css({
      'width'   : width + 'px',
      'height'  : height + 'px'
    });

  }

  start()

}
