var child_process = require('child_process') ;
var _ = require('underscore') ;
var path = require('path') ;
var fs = require('fs') ;
var format = require('util').format ;
var EventEmitter = require('events').EventEmitter ;

var Worker = function () { this.setOpts.apply(this,arguments) };

Worker.prototype.__proto__ = EventEmitter.prototype;

Worker.prototype.setOpts = function(fnOrPath){
  
  var _this = this ;
  
  _this.opts = {} ;
  
  if ( _.isString( fnOrPath ) ) {
  
    if ( fs.existsSync( fnOrPath ) ) {
    
      _this.opts.module = fnOrPath ;
    
    } else {
    
      throw new Error('Path to worker function does not exist.')
    
    }
  
  } else if ( _.isFunction( fnOrPath ) ) {
  
    _this.opts.fn = fnOrPath.toString() ;
  
  } else {
  
    throw new Error('Invalid worker function provided') ;
  
  }

  if ( _.isString(_this.fn) && _this.fn.indexOf('emit') == -1 ) {
  
    throw( new Error( 'The passed-in function must contain an emit() statement to track completion.' ) )
  
  }
  
};

Worker.prototype.spawn = function (){
  
  var _this = this ;
  
  var child = _this.child = child_process.fork( path.join( __dirname , './worker' ) ) ;
  
  var args = _.toArray(arguments) ;
  
  if ( _this.opts.module ) {
    
    child.send({ module : _this.opts.module }) ;
    
  } else if ( _this.opts.fn ) {
    
    child.send({ fn : _this.opts.fn }) ;
    
  }
  
  child.send({ process : args }) ;
  
  child.on('message',function(m){
    
    if ( m._type ) {
      
      _this.emit.apply( _this , [m._type].concat( m.args ) ) ;
      
    }
    
  });
  
  return child ;
  
};

exports.Worker = Worker ;
