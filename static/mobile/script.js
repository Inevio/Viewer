
// Variables
var win    = $( this )
var window = win.parents().slice( -1 )[ 0 ].parentNode.defaultView
var IS_ANDROID = typeof device !== 'undefined' && device.platform.toLowerCase().indexOf('android') !== -1

// Start
if( params.command === 'openFile' ){

  api.fs( params.data, function( err, fsnode ){

    $('.file-name').text(fsnode.name);
    $('.loading').text(lang.loading);
    $('.opening-text').text(lang.opening);
    var image = new Image();
    image.src = fsnode.icons[512];
    $('.file-preview').css('background-image', 'url(' + fsnode.icons[512] + ')');

    $(image).load(function () {
        //console.log( (image.width + 'x' + image.height) );

        $('.file-preview').css({

          'width'  : (image.width/2),
          'height' : (image.height/2),
          'background-size' : (image.width/2) + 'px ' + (image.height/2) + 'px'

        })

        .transition({
          'opacity' : 1
        },200);

    });


    //$('.file-icon').css('background-image', 'url(' + fsnode.icons[16] + ')');

    window.resolveLocalFileSystemURL( IS_ANDROID ? cordova.file.externalCacheDirectory : cordova.file.dataDirectory, function( dirEntry ){

        dirEntry.getFile( Date.now() + '-' + fsnode.name, { create: true, exclusive: false }, function (fileEntry) {

          var fileTransfer = new FileTransfer()
          var fallbackExecuted = false
          var fallback = function( entry ){

            if( fallbackExecuted ){
              return
            }

            fallbackExecuted = true

            cordova.plugins.fileOpener2.open( IS_ANDROID ? decodeURI( entry.nativeURL ) : entry.nativeURL, fsnode.mime, {
              error : function(e) {
                console.log('Error status: ' + e.status + ' - Error message: ' + e.message)
              },
              success : function () {
                console.log('file opened successfully')
                api.view.remove( false )
              }
            })

          }
          fileTransfer.download( 'https://download.inevio.com/' + fsnode.id, fileEntry.nativeURL, function( entry ){

              cordova.plugins.SitewaertsDocumentViewer.viewDocument( entry.toURL(), 'application/pdf', {},
                function(){},
                function(){ api.view.remove( false ) },
                function(){ fallback( entry ) },
                function(){ fallback( entry ) }
              )

            },
            function (error) {
              console.log("download error source " + error.source)
              console.log("download error target " + error.target)
              console.log("upload error code" + error.code)
              navigator.notification.alert( lang.openFileError )
              return setTimeout( function(){ api.view.remove( false ) }, 10 )
            },
            null,
            {}

          )

        })

      })

  })

}
