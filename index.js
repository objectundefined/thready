var child_process = require('child_process') ;
var _ = require('underscore') ;
var path = require('path') ;
var fs = require('fs') ;
var format = require('util').format ;

var Worker = function ( fnOrPath ) {
  
  var _this = this ;
  
  _this.requirements = {} ;
  
  if ( _.isString( fnOrPath ) ) {
    
    if ( fs.existsSync( fnOrPath ) ) {
      
      _this.fn = fs.readFileSync( fnOrPath , "utf8" ) ;
      
    } else {
      
      throw new Error('Path to worker function does not exist.')
      
    }
    
  } else if ( _.isFunction( fnOrPath ) ) {
    
    _this.fn = fnOrPath.toString() ;
    
  } else {
    
    throw new Error('Invalid worker function provided') ;
    
  }
  
  if ( _.isString(_this.fn) && _this.fn.indexOf('emit') == -1 ) {
    
    throw( new Error( 'The passed-in function must contain an emit() statement to track completion.' ) )
    
  }
  
};

Worker.prototype.require = function ( requirementsObj ) {
  
  var _this = this ;
  
  _.extend( _this.requirements , requirementsObj ) ;
  
};

Worker.prototype.process = function (){
  
  var _this = this ;
  
  var child = child_process.fork( path.join( __dirname , './worker' ) ) ;
  
  var args = _.toArray(arguments);
  
  var cb = typeof _.last(args) == 'function' ? args.pop() : function(){} ;
  
  child.send({
    
    require : _this.requirements ,
    fn : _this.fn ,
    process : args
    
  });
  
  child.once('message',function(mdata){
    
    child.kill() ;
    cb( mdata.err , mdata.results ) ;
    
  })
  
};

exports.Worker = Worker ;