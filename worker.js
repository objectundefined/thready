
GLOBAL.worker = {
  
  emit : function ( _type ) {
    
    process.send( { _type : _type , args : Array.prototype.slice.call( arguments , 1 ) } ) ;
  
  },
    
  main : function(){ GLOBAL.worker.emit(new Error('No Worker Function Provided')) }
  
};

process.on( 'message' , function ( m , socket ) {
  
  if ( m.module ) {
    
    GLOBAL.worker.main = require( m.module ) ;
    
  }
  
  if ( m.fn ) {
    
    GLOBAL.worker.main = eval( "(" + m.fn + ")" ) ;
    
  }
  
  if ( m.process ) {
    
    GLOBAL.worker.main.apply(GLOBAL,m.process)
    
  }
  
  if ( socket ) {
    
    GLOBAL.worker.socket = socket ;
    
  }
  
});

process.on('uncaughtException',function(err){
  
  GLOBAL.worker.emit('complete',err.stack) ;
  
})
