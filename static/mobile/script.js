
// Variables
var win    = $( this )
var window = win.parents().slice( -1 )[ 0 ].parentNode.defaultView

// Start
if( params.command === 'openFile' ){

  api.fs( params.data, function( err, fsnode ){

    window.resolveLocalFileSystemURL( cordova.file.dataDirectory, function( dirEntry ){

      dirEntry.getFile( Date.now() + '-' + fsnode.name, { create: true, exclusive: false }, function (fileEntry) {

        console.log( fileEntry.nativeURL )

        var fileTransfer = new FileTransfer()

        fileTransfer.download(

          'https://download.inevio.com/' + fsnode.id,
          fileEntry.nativeURL,
          function( entry ){

            cordova.plugins.SitewaertsDocumentViewer.viewDocument(

              entry.toURL(),
              fsnode.mime,
              {},
              function(){
                console.log('showing')
              },
              function(){
                console.log('close')
                api.view.remove( win )
              },
              function(){
                console.log('missing app')
              },
              function(){
                console.log('error')
              }

            )

          },
          function (error) {
              console.log("download error source " + error.source)
              console.log("download error target " + error.target)
              console.log("upload error code" + error.code)
          },
          null,
          {}

        )

      })

    })

  })

}
