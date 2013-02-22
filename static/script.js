
wz.app.addScript( 6, 'common', function( win ){

    var img     = $( '.weevisor-frame', win );
    var winArea = $('.weevisor-main', win );
    var winBar  = $('.wz-win-menu', win );
    var desktop = $('#wz-desktop');
                        

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
                        var areaHeight = winArea.height();
                        var areaWidth  = winArea.width();
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

                        img.css( 'scale', scale );

                        winArea.transition({

                            width  : parseInt( img.width() * scale, 10 ) ,
                            height : parseInt( img.height() * scale, 10 )

                        }, 250 );

                        win.transition({

                            width  : parseInt( img.width() * scale, 10 ) ,
                            height : parseInt( img.height() * scale, 10 ) + winBar.outerHeight()

                        }, 250, function(){
                            img.fadeIn();
                        });

                    });

            });

        }
        
    });

});
