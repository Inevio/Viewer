
wz.app.addScript( 6, 'common', function( win, app, lang, params ){

    var img     = $( '.weevisor-frame', win );
    var winBar  = $( '.wz-win-menu', win );
    var desktop = $( '#wz-desktop' );
    var resize  = 0;

    win.addClass( 'wz-dragger' );
    win.css( 'display', 'none' );

    win

    .on( 'app-param', function( error, params ){

        if( params ){
            
            wz.structure( params[ 0 ], function( error, structure ){

                if( error ){
                    alert( error );
                    return false;
                }

                var imgHeight  = structure.metadata.exif.height;
                var imgWidth   = structure.metadata.exif.width;
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

                win.css({

                    x : ( $( window ).width() / 2 ) - ( parseInt( imgWidth * scale, 10 ) / 2 ) - 96,
                    y : ( $( window ).height() / 2 ) - ( parseInt( imgHeight * scale, 10 ) / 2 )

                })

                win.fadeIn();

                win
                    .animate({

                        width  : parseInt( imgWidth * scale, 10 ),
                        height : parseInt( imgHeight * scale, 10 ) + winBar.outerHeight()

                    }, 250 );

                img
                    .hide()
                    .attr( 'src', structure.thumbnails.original )
                    .on( 'load', function(){

                        img
                            .css( 'scale', scale )
                            .fadeIn();

                    });

            });

        }
        
    })

    .on( 'wz-resize', function(){

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

});
