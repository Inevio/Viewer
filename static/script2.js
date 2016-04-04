
// Variables
var win = $( this );

// Private Methods
var _startApp = function(){

  if( params && params.command === 'openFile' ){

      api.fs( params.data, function( error, structure ){

        $( '.ui-header-brand span', win ).text( structure.name );
        //$( 'iframe', win).attr('src')
        console.log(structure);
        structure.getLinks( function(error, links){
          console.log(arguments);
        });

      });

  }

}

_startApp();
