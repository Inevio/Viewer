/*
    var img     = $( '.weevisor-frame', win );
    var winBar  = $( '.wz-win-menu', win );
    var resize  = 0;

    var loadImage = function( imgWidth, imgHeight ){

        var scale      = 1;
        var niceLimit  = 100;
        
        if( imgHeight > wz.tool.desktopHeight() - niceLimit ){
            scale = ( wz.tool.desktopHeight() - niceLimit ) / imgHeight;
        }

        if( imgWidth > wz.tool.desktopWidth() - niceLimit ){
            
            var tmpscale = ( wz.tool.desktopWidth() - niceLimit ) / imgWidth;
            
            if( tmpscale < scale ){
                scale = tmpscale;
            }
            
        }

        win
            .deskitemX( ( wz.tool.environmentWidth() / 2 ) - ( parseInt( imgWidth * scale, 10 ) / 2 ) - 96 )
            .deskitemY( ( wz.tool.environmentHeight() / 2 ) - ( parseInt( imgHeight * scale, 10 ) / 2 ) )
            .transition({ opacity : 1 }, 400 )
            .animate({

                width  : parseInt( imgWidth * scale, 10 ),
                height : parseInt( imgHeight * scale, 10 ) + winBar.outerHeight()

            }, 250 );

        if( params[1] === 'url' ){

            img
                .css( 'scale', scale )
                .fadeIn();

        }else{

            img
                .on( 'load', function(){

                    img
                        .css( 'scale', scale )
                        .fadeIn();

                });

        }

    };

    win.addClass( 'wz-dragger' );
    win.css( 'opacity', 0 );

    win

    .on( 'app-param', function( error, params ){

        if( params[1] === 'url' ){

            img
                .hide()
                .attr( 'src', params[0] )
                .on( 'load', function(){

                    var imgWidth  = img[ 0 ].naturalWidth;
                    var imgHeight = img[ 0 ].naturalHeight;

                    loadImage( imgWidth, imgHeight );

                });

        }else if( params ){

            wz.structure( params[0], function( error, structure ){

                if( error ){
                    alert( error );
                    return false;
                }

                var imgWidth  = structure.metadata.exif.width;
                var imgHeight = structure.metadata.exif.height;

                img
                    .hide()
                    .attr( 'src', structure.thumbnails.original );

                loadImage( imgWidth, imgHeight );
                
            });

        }
        
    })

    .on( 'wz-resize wz-maximize wz-unmaximize', function(){

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
*/