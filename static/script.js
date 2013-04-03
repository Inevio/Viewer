
wz.app.addScript( 6, 'common', function( win ){

    var img     = $( '.weevisor-frame', win );
    var winBar  = $('.wz-win-menu', win );
    var desktop = $('#wz-desktop');
    var resize  = 0;

    win.addClass('wz-dragger');

    win.on( 'app-param', function( error, params ){

        if( params ){
            
            wz.structure( params[ 0 ], function( error, structure ){

                if( error ){
                    alert( error );
                    return false;
                }

                img
                    .hide()
                    .attr( 'src', structure.thumbnails.original )
                    .on( 'load', function(){

                        var imgHeight  = img.height();
                        var imgWidth   = img.width();
                        var scale      = 1;
                        var niceLimit  = 100;
                        
                        if( imgHeight > desktop.height() - niceLimit ){
                            scale = ( desktop.height() - niceLimit ) / imgHeight;
                        }
                        
                        if( imgWidth > desktop.width() - niceLimit ){
                            
                            var tmpscale = ( desktop.width() - niceLimit ) / imgWidth;
                            
                            if( tmpscale < scale ){
                                scale = tmpscale;
                            }
                            
                        }

                        win
                            .delay(50)
                            .transition({

                                width  : parseInt( imgWidth * scale, 10 ),
                                height : parseInt( imgHeight * scale, 10 ) + winBar.outerHeight()

                            }, 250, function(){

                                img
                                    .css( 'scale', scale )
                                    .fadeIn();
                                    
                            });



                    });

            });

        }
        
    });

    win.on( 'click', '.wz-win-maximize', function(){

        clearTimeout( resize );
        resize = setTimeout( function(){

            var imgHeight = img.height();
            var winHeight = win.height();
            var barHeight = winBar.outerHeight( true );

            img.css( 'margin-top', ( winHeight - barHeight - imgHeight ) / 2 );

        }, 1 );

    });

});
