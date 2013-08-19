
process.on( 'message' , function ( m ) {
  
  if ( typeof m.require == 'object' ) {
    
    Object.keys( m.require ).forEach(function(k){
      
      GLOBAL[ k ] = require( m.require[ k ] ) ;
      
    });
    
  }
  
  if ( m.fn && m.process ) {
    
    GLOBAL.MAIN = eval( "(" + m.fn + ")" )(m.process) ;
    
  }
  
});

function emit ( err , results ) {
  
  process.send( { err : err , results : results } ) ;
  
}

process.on('uncaughtException',function(err){
  
  process.send( { err : err , results : null } ) ;
  
})
