// Variables
var win          = $( this );
var minus        = $( '.zoom-minus', win );
var plus         = $( '.zoom-plus', win );
var toggle       = $( '.weevisor-sidebar-button', win );
var uiBarTop     = $( '.ui-header', win );
var iframe       = $();
var normalWidth  = 0;
var normalHeight = 0;
var pdfSize      = [];
var fileLoaded   = null;

// Private Methods
var _startApp = function(){

  if( params && params.command === 'openFile' ){

      // To Do -> Error

      api.fs( params.data, function( error, structure ){

        $( '.ui-header-brand span', win ).text( structure.name );
        var dimensions = structure.metadata ? structure.metadata.pdf.pageSize.split(' ') : [ 630, 0, 891 ];
        pdfSize.push( parseInt( dimensions[0] , 10 ) , parseInt( dimensions[2] , 10 ) );
        fileLoaded = structure;

        _loadPdf( fileLoaded );

      });

  }

}

var _loadPdf = function( file ){

  if( file.mime === 'application/pdf' ){
    $('iframe').attr( 'src', 'https://' + location.hostname + '/app/6/pdfjs/web/viewer.html?file=https://download.horbito.com/' + file.id );
  }else if( file.formats && file.formats.pdf ){
    $('iframe').attr( 'src', 'https://' + location.hostname + '/app/6/pdfjs/web/viewer.html?file=https://download.horbito.com/' + file.id + '/format/pdf' );
  }else{

    return alert( lang.canNotOpenPDF, function(){
      api.app.removeView( win );
    });

  }

};

// Events
minus.on( 'click', function(){
  iframe.find('#zoomOut').click();
});

plus.on( 'click', function(){
  iframe.find('#zoomIn').click();
});

toggle.on( 'click', function(){
  iframe.find('#sidebarToggle').click();
});

$('.print').on( 'click', function(){
  iframe.find('#print').click();
});

// Start load
if( location.host.indexOf('file') === -1 ){

  win.deskitemX( parseInt( ( api.tool.desktopWidth() - win.width() ) / 2, 10 ) );
  win.deskitemY( parseInt( ( api.tool.desktopHeight() - win.height() ) / 2, 10 ) );

}else{
  api.app.maximizeView( win );
}

_startApp();

/* fullscreen mode */
var toggleFullscreen = function(){

    if( win.hasClass( 'fullscreen' ) ){

        api.tool.exitFullscreen();


    }else{

        if( win[ 0 ].requestFullScreen ){
            win[ 0 ].requestFullScreen();
        }else if( win[ 0 ].webkitRequestFullScreen ){
            win[ 0 ].webkitRequestFullScreen();
        }else if( win[ 0 ].mozRequestFullScreen ){
            win[ 0 ].mozRequestFullScreen();
        }else{
            alert( lang.fullscreenSupport );
        }

        normalWidth  = win.width();
        normalHeight = win.height();
    }

};

var showControls = function(){

    uiBarTop.stop().clearQueue();
    uiBarTop.css( 'display', 'block' );

};

var hideControls = function(){

    uiBarTop.stop().clearQueue();
    uiBarTop.css( 'display' , 'none' );

};

$('iframe').on( 'load', function(){
  iframe = $(this).contents();
});

win
.on( 'click', '.ui-fullscreen', function(e){
    toggleFullscreen();
    e.stopPropagation();
})

.on( 'click', '.wz-view-minimize', function(){

    if( win.hasClass('fullscreen') ){
        toggleFullscreen();
    }

})

.on( 'click' , '.adjust-vertical', function(){

  var select = iframe.find('#scaleSelect').val('page-fit');
  var event  = $('iframe')[ 0 ].contentWindow.document.createEvent('UIEvents');

  event.initUIEvent( 'change', true, true, window, 1 );
  select[ 0 ].dispatchEvent( event );

})

.on( 'click' , '.adjust-horizontal', function(){

  var select = iframe.find('#scaleSelect').val('page-width');
  var event  = $('iframe')[ 0 ].contentWindow.document.createEvent('UIEvents');

  event.initUIEvent( 'change', true, true, window, 1 );
  select[ 0 ].dispatchEvent( event );

})

.on( 'enterfullscreen', function(){

    win.addClass('fullscreen');

    win.css( 'width', screen.width );
    win.css( 'height', screen.height );

    hideControls();

})

.on( 'exitfullscreen', function(){

    win.removeClass('fullscreen');

    win.css( 'width', normalWidth );
    win.css( 'height', normalHeight );

    showControls();

})

.on( 'ui-view-maximize', function(){
    win.addClass( 'maximized' );
})

.on( 'ui-view-unmaximize', function(){
    win.removeClass( 'maximized' );
})

.on( 'click', '.open-local', function(){

  api.fs( params.data, function( error, object ){
    object.openLocal();
  });

})

.on( 'ui-view-resize-start ui-view-blur' , function(e){
  $('.cover').show();
})

.on( 'ui-view-resize-end ui-view-focus' , function(e){
  $('.cover').hide();
})

.key( 'left, pageup', function(){
  // To Do
})

.key( 'right, pagedown', function(){
  // To Do
})

.key( 'f5' , function(e){

  if( !win.hasClass( 'fullscreen' ) ){
    toggleFullscreen();
  }

  e.preventDefault();

})

.key( 'esc, b' , function(e){

  if( win.hasClass( 'fullscreen' ) ){
    toggleFullscreen();
    e.preventDefault();
  }

});

win.parent()
.on( 'wz-dragstart' , function(e){
  $('.cover').show();
})

.on( 'wz-dragend' , function(e){
  $('.cover').hide();
});
